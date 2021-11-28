'use strict';

const events = require('events')
const cronParser = require('cron-parser')
const CronDate = require('cron-parser/lib/date')
const sorted = require('sorted-array-functions')

const { scheduleNextRecurrence, scheduleInvocation, cancelInvocation, RecurrenceRule, sorter, Invocation } = require('./Invocation')
const { isValidDate } = require('./utils/dateUtils')

const scheduledJobs = {};

let anonJobCounter = 0;
function resolveAnonJobName() {
  const now = new Date()
  if (anonJobCounter === Number.MAX_SAFE_INTEGER) {
    anonJobCounter = 0
  }
  anonJobCounter++

  return `<Anonymous Job ${anonJobCounter} ${now.toISOString()}>`
}

function Job(name, job, callback) {
  // setup a private pendingInvocations variable
  this.pendingInvocations = [];

  //setup a private number of invocations variable
  let triggeredJobs = 0;

  // Set scope vars
  const jobName = name && typeof name === 'string' ? name : resolveAnonJobName();
  this.job = name && typeof name === 'function' ? name : job;

  // Make sure callback is actually a callback
  if (this.job === name) {
    // Name wasn't provided and maybe a callback is there
    this.callback = typeof job === 'function' ? job : false;
  } else {
    // Name was provided, and maybe a callback is there
    this.callback = typeof callback === 'function' ? callback : false;
  }

  // task count
  this.running = 0;

  // Check for generator
  if (typeof this.job === 'function' &&
    this.job.prototype &&
    this.job.prototype.next) {
    this.job = function() {
      return this.next().value;
    }.bind(this.job.call(this));
  }

  // define properties
  Object.defineProperty(this, 'name', {
    value: jobName,
    writable: false,
    enumerable: true
  });

  // method that require private access
  this.trackInvocation = function(invocation) {
    // add to our invocation list
    sorted.add(this.pendingInvocations, invocation, sorter);
    return true;
  };
  this.stopTrackingInvocation = function(invocation) {
    const invIdx = this.pendingInvocations.indexOf(invocation);
    if (invIdx > -1) {
      this.pendingInvocations.splice(invIdx, 1);
      return true;
    }

    return false;
  };
  this.triggeredJobs = function() {
    return triggeredJobs;
  };
  this.setTriggeredJobs = function(triggeredJob) {
    triggeredJobs = triggeredJob;
  };
  this.deleteFromSchedule = function() {
    deleteScheduledJob(this.name)
  };
  this.cancel = function(reschedule) {
    reschedule = (typeof reschedule == 'boolean') ? reschedule : false;

    let inv, newInv;
    const newInvs = [];
    for (let j = 0; j < this.pendingInvocations.length; j++) {
      inv = this.pendingInvocations[j];

      cancelInvocation(inv);

      if (reschedule && (inv.recurrenceRule.recurs || inv.recurrenceRule.next)) {
        newInv = scheduleNextRecurrence(inv.recurrenceRule, this, inv.fireDate, inv.endDate);
        if (newInv !== null) {
          newInvs.push(newInv);
        }
      }
    }

    this.pendingInvocations = [];

    for (let k = 0; k < newInvs.length; k++) {
      this.trackInvocation(newInvs[k]);
    }

    // remove from scheduledJobs if reschedule === false
    if (!reschedule) {
      this.deleteFromSchedule()
    }

    return true;
  };
  this.cancelNext = function(reschedule) {
    reschedule = (typeof reschedule == 'boolean') ? reschedule : true;

    if (!this.pendingInvocations.length) {
      return false;
    }

    let newInv;
    const nextInv = this.pendingInvocations.shift();

    cancelInvocation(nextInv);

    if (reschedule && (nextInv.recurrenceRule.recurs || nextInv.recurrenceRule.next)) {
      newInv = scheduleNextRecurrence(nextInv.recurrenceRule, this, nextInv.fireDate, nextInv.endDate);
      if (newInv !== null) {
        this.trackInvocation(newInv);
      }
    }

    return true;
  };
  this.reschedule = function(spec) {
    let inv;
    const invocationsToCancel = this.pendingInvocations.slice();

    for (let j = 0; j < invocationsToCancel.length; j++) {
      inv = invocationsToCancel[j];

      cancelInvocation(inv);
    }

    this.pendingInvocations = [];

    if (this.schedule(spec)) {
      this.setTriggeredJobs(0);
      return true;
    } else {
      this.pendingInvocations = invocationsToCancel;
      return false;
    }
  };
  this.nextInvocation = function() {
    if (!this.pendingInvocations.length) {
      return null;
    }
    return this.pendingInvocations[0].fireDate;
  };
}

Object.setPrototypeOf(Job.prototype, events.EventEmitter.prototype);

Job.prototype.invoke = function(fireDate) {
  this.setTriggeredJobs(this.triggeredJobs() + 1);
  return this.job(fireDate);
};

Job.prototype.runOnDate = function(date) {
  return this.schedule(date);
};

Job.prototype.schedule = function(spec) {
  const self = this;
  let success = false;
  let inv;
  let start;
  let end;
  let tz;

  // save passed-in value before 'spec' is replaced
  if (typeof spec === 'object' && 'tz' in spec) {
    tz = spec.tz;
  }

  if (typeof spec === 'object' && spec.rule) {
    start = spec.start || undefined;
    end = spec.end || undefined;
    spec = spec.rule;

    if (start) {
      if (!(start instanceof Date)) {
        start = new Date(start);
      }

      start = new CronDate(start, tz);
      if (!isValidDate(start) || start.getTime() < Date.now()) {
        start = undefined;
      }
    }

    if (end && !(end instanceof Date) && !isValidDate(end = new Date(end))) {
      end = undefined;
    }

    if (end) {
      end = new CronDate(end, tz);
    }
  }

  try {
    const res = cronParser.parseExpression(spec, {currentDate: start, tz: tz});
    inv = scheduleNextRecurrence(res, self, start, end);
    if (inv !== null) {
      success = self.trackInvocation(inv);
    }
  } catch (err) {
    const type = typeof spec;
    if ((type === 'string') || (type === 'number')) {
      spec = new Date(spec);
    }

    if ((spec instanceof Date) && (isValidDate(spec))) {
      spec = new CronDate(spec);
      self.isOneTimeJob = true;
      if (spec.getTime() >= Date.now()) {
        inv = new Invocation(self, spec);
        scheduleInvocation(inv);
        success = self.trackInvocation(inv);
      }
    } else if (type === 'object') {
      self.isOneTimeJob = false;
      if (!(spec instanceof RecurrenceRule)) {
        const r = new RecurrenceRule();
        if ('year' in spec) {
          r.year = spec.year;
        }
        if ('month' in spec) {
          r.month = spec.month;
        }
        if ('date' in spec) {
          r.date = spec.date;
        }
        if ('dayOfWeek' in spec) {
          r.dayOfWeek = spec.dayOfWeek;
        }
        if ('hour' in spec) {
          r.hour = spec.hour;
        }
        if ('minute' in spec) {
          r.minute = spec.minute;
        }
        if ('second' in spec) {
          r.second = spec.second;
        }

        spec = r;
      }

      spec.tz = tz;
      inv = scheduleNextRecurrence(spec, self, start, end);
      if (inv !== null) {
        success = self.trackInvocation(inv);
      }
    }
  }

  scheduledJobs[this.name] = this;
  return success;
};

function deleteScheduledJob(name) {
  if (name) {
    delete scheduledJobs[name];
  }
}

module.exports = {
  Job,
  deleteScheduledJob,
  scheduledJobs
}
