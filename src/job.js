'use strict';

let EventEmitter = require('events').EventEmitter,
  Invocation = require('./invocation.js'),
  cronParser = require('cron-parser'),
  RecurrenceRule = require('./recurrenceRule.js'),
  lt = require('long-timeout');

let invocations = [];

/* Job object */
let anonJobCounter = 0;

// setup a private pendingInvocations variable
let pendingInvocations = [];

var currentInvocation = null;

function scheduleInvocation(invocation) {
  invocations.push(invocation);
  invocations.sort(sorter);
  prepareNextInvocation();
  invocation.job.emit('scheduled', invocation.fireDate);
}

function prepareNextInvocation() {
  if (invocations.length > 0 && currentInvocation !== invocations[0]) {
    if (currentInvocation !== null) {
      lt.clearTimeout(currentInvocation.timerID);
      currentInvocation.timerID = null;
      currentInvocation = null;
    }

    currentInvocation = invocations[0];

    var job = currentInvocation.job;
    var cinv = currentInvocation;
    currentInvocation.timerID = runOnDate(currentInvocation.fireDate, function() {
      currentInvocationFinished();

      if (cinv.recurrenceRule.recurs || cinv.recurrenceRule._endDate === null) {
        var inv = scheduleNextRecurrence(cinv.recurrenceRule, cinv.job, cinv.fireDate);
        if (inv !== null) {
          inv.job.trackInvocation(inv);
        }
      }

      job.stopTrackingInvocation(cinv);

      job.invoke();
      job.emit('run');
    });
  }
}

function currentInvocationFinished() {
  invocations.shift();
  currentInvocation = null;
  prepareNextInvocation();
}

function sorter(a, b) {
  return (a.fireDate.getTime() - b.fireDate.getTime());
}

/* Date-based scheduler */
function runOnDate(date, job) {
  var now = (new Date()).getTime();
  var then = date.getTime();

  if (then < now) {
    process.nextTick(job);
    return null;
  }

  return lt.setTimeout(job, (then - now));
}

/* Recurrence scheduler */
function scheduleNextRecurrence(rule, job, prevDate) {
  prevDate = (prevDate instanceof Date) ? prevDate : (new Date());

  var date = (rule instanceof RecurrenceRule) ? rule.nextInvocationDate(prevDate) : rule.next();
  if (date === null) {
    return null;
  }

  var inv = new Invocation(job, date, rule);
  scheduleInvocation(inv);

  return inv;
}

function cancelInvocation(invocation) {
  var idx = invocations.indexOf(invocation);
  if (idx > -1) {
    invocations.splice(idx, 1);
    if (invocation.timerID !== null) {
      lt.clearTimeout(invocation.timerID);
    }

    if (currentInvocation === invocation) {
      currentInvocation = null;
    }

    invocation.job.emit('canceled', invocation.fireDate);
    prepareNextInvocation();
  }
}

/* API
  invoke()
  runOnDate(date)
  schedule(date || recurrenceRule || cronstring)
  cancel(reschedule = false)
  cancelNext(reschedule = true)

   Property constraints
  name: readonly
  job: readwrite
*/
class Job extends EventEmitter{

  constructor() {
    let name;

    // process arguments to the constructor
    let arg;
    for (var i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      if (typeof arg == 'string' || arg instanceof String) {
        name = arg;
      } else {
        this.job = arg;
      }
    }

    // give us a random name if one wasn't provided
    if (name == null) {
      name = '<Anonymous Job ' + (++anonJobCounter) + '>';
    }

    // define properties
    Object.defineProperty(this, 'name', {
      value: name,
      writable: false,
      enumerable: true
    });

  }

  // method that require private access
  trackInvocation(invocation) {
    // add to our invocation list
    pendingInvocations.push(invocation);

    // and sort
    pendingInvocations.sort(sorter);

    return true;
  }

  stopTrackingInvocation(invocation) {
    var invIdx = pendingInvocations.indexOf(invocation);
    if (invIdx > -1) {
      pendingInvocations.splice(invIdx, 1);
      return true;
    }

    return false;
  }

  cancel(reschedule) {
    reschedule = (typeof reschedule == 'boolean') ? reschedule : false;

    var inv, newInv;
    var newInvs = [];
    for (var j = 0; j < pendingInvocations.length; j++) {
      inv = pendingInvocations[j];

      cancelInvocation(inv);

      if (reschedule && inv.recurrenceRule.recurs) {
        newInv = scheduleNextRecurrence(inv.recurrenceRule, this, inv.fireDate);
        if (newInv !== null) {
          newInvs.push(newInv);
        }
      }
    }

    pendingInvocations = [];

    for (var k = 0; k < newInvs.length; k++) {
      this.trackInvocation(newInvs[k]);
    }

    return true;
  };

  cancelNext(reschedule) {
    reschedule = (typeof reschedule == 'boolean') ? reschedule : true;

    if (!pendingInvocations.length) {
      return false;
    }

    var newInv;
    var nextInv = pendingInvocations.shift();

    cancelInvocation(nextInv);

    if (reschedule && nextInv.recurrenceRule.recurs) {
      newInv = scheduleNextRecurrence(nextInv.recurrenceRule, this, nextInv.fireDate);
      if (newInv !== null) {
        this.trackInvocation(newInv);
      }
    }

    return true;
  };


  nextInvocation() {
    if (!pendingInvocations.length) {
      return null;
    }
    return pendingInvocations[0].fireDate;
  }

  pendingInvocations() {
    return pendingInvocations;
  }

  invoke() {
    if (typeof this.job == 'function') {
      this.job();
    } else {
      this.job.execute();
    }
  }

  runOnDate(date) {
    return this.schedule(date);
  }

  schedule(spec) {
    var self = this;
    var success = false;
    var inv;
    try {
      var res = cronParser.parseExpression(spec);
      inv = scheduleNextRecurrence(res, self);
      if (inv !== null) {
        success = self.trackInvocation(inv);
      }

    } catch (err) {
      var type = typeof spec;
      if (type === 'string') {
        spec = new Date(spec);
      }

      if (spec instanceof Date) {
        inv = new Invocation(self, spec);
        scheduleInvocation(inv);
        success = self.trackInvocation(inv);
      } else if (type === 'object') {
        if (!(spec instanceof RecurrenceRule)) {
          var r = new RecurrenceRule();
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

        inv = scheduleNextRecurrence(spec, self);
        if (inv !== null) {
          success = self.trackInvocation(inv);
        }
      }
    }

    return success;
  }
}

// util.inherits(Job, events.EventEmitter);

module.exports = Job;

