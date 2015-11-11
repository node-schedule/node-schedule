
'use strict';

/*
  node-schedule
  A cron-like and not-cron-like job scheduler for Node.
*/

var events = require('events'),
  util = require('util'),
  increment = require('./increment.js'),
  cronParser = require('cron-parser'),
  lt = require('long-timeout');

/* Job object */
var anonJobCounter = 0;

function isValidDate(date) {
  // Taken from http://stackoverflow.com/a/12372720/1562178
  // If getTime() returns NaN it'll return false anyway
  return date.getTime() === date.getTime();
}

function Job(name, job, callback) {
  // setup a private pendingInvocations variable
  var pendingInvocations = [];

  // Set scope vars
  var jobName = name && typeof name === 'string' ? name : '<Anonymous Job ' + (++anonJobCounter) + '>';
  this.job = name && typeof name === 'function' ? name : job;

  // Make sure callback is actually a callback
  if (this.job === name) {
    // Name wasn't provided and maybe a callback is there
    this.callback = typeof job === 'function' ? job : false;
  } else {
    // Name was provided, and maybe a callback is there
    this.callback = typeof callback === 'function' ? callback : false;
  }

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
    pendingInvocations.push(invocation);

    // and sort
    pendingInvocations.sort(sorter);

    return true;
  };
  this.stopTrackingInvocation = function(invocation) {
    var invIdx = pendingInvocations.indexOf(invocation);
    if (invIdx > -1) {
      pendingInvocations.splice(invIdx, 1);
      return true;
    }

    return false;
  };
  this.cancel = function(reschedule) {
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

    // remove from scheduledJobs if reschedule === false
    if (!reschedule) {
      if (this.name) {
        scheduledJobs[this.name] = null;
      }
    }

    return true;
  };
  this.cancelNext = function(reschedule) {
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
  this.nextInvocation = function() {
    if (!pendingInvocations.length) {
      return null;
    }
    return pendingInvocations[0].fireDate;
  };
  this.pendingInvocations = function() {
    return pendingInvocations;
  };
}

util.inherits(Job, events.EventEmitter);

Job.prototype.invoke = function() {
  if (typeof this.job == 'function') {
    this.job();
  } else {
    this.job.execute();
  }
};

Job.prototype.runOnDate = function(date) {
  return this.schedule(date);
};

Job.prototype.schedule = function(spec) {
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
    if ((type === 'string') || (type === 'number')) {
      spec = new Date(spec);
    }

    if ((spec instanceof Date) && (isValidDate(spec))) {
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

  scheduledJobs[this.name] = this;
  return success;
};

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

/* DoesntRecur rule */
var DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

/* Invocation object */
function Invocation(job, fireDate, recurrenceRule) {
  this.job = job;
  this.fireDate = fireDate;
  this.recurrenceRule = recurrenceRule || DoesntRecur;

  this.timerID = null;
}

function sorter(a, b) {
  return (a.fireDate.getTime() - b.fireDate.getTime());
}

/* Range object */
function Range(start, end, step) {
  this.start = start || 0;
  this.end = end || 60;
  this.step = step || 1;
}

Range.prototype.contains = function(val) {
  if (this.step === null || this.step === 1) {
    return (val >= this.start && val <= this.end);
  } else {
    for (var i = this.start; i < this.end; i += this.step) {
      if (i === val) {
        return true;
      }
    }

    return false;
  }
};

/* RecurrenceRule object */
/*
  Interpreting each property:
  null - any value is valid
  number - fixed value
  Range - value must fall in range
  array - value must validate against any item in list

  NOTE: Cron months are 1-based, but RecurrenceRule months are 0-based.
*/
function RecurrenceRule(year, month, date, dayOfWeek, hour, minute, second) {
  this.recurs = true;

  this.year = (year == null) ? null : year;
  this.month = (month == null) ? null : month;
  this.date = (date == null) ? null : date;
  this.dayOfWeek = (dayOfWeek == null) ? null : dayOfWeek;
  this.hour = (hour == null) ? null : hour;
  this.minute = (minute == null) ? null : minute;
  this.second = (second == null) ? 0 : second;
}

RecurrenceRule.prototype.nextInvocationDate = function(base) {
  base = (base instanceof Date) ? base : (new Date());
  increment.addDateConvenienceMethods(base);
  if (!this.recurs) {
    return null;
  }

  var now = new Date();
  increment.addDateConvenienceMethods(now);
  if (this.year !== null && (typeof this.year == 'number') && this.year < now.getFullYear()) {
    return null;
  }

  var next = new Date(base.getTime());
  increment.addDateConvenienceMethods(next);
  next.addSecond();

  while (true) {
    if (this.year != null && !recurMatch(next.getFullYear(), this.year)) {
      next.addYear();
      next.setMonth(0);
      next.setDate(1);
      next.setHours(0);
      next.setMinutes(0);
      next.setSeconds(0);
      continue;
    }
    if (this.month != null && !recurMatch(next.getMonth(), this.month)) {
      next.addMonth();
      continue;
    }
    if (this.date != null && !recurMatch(next.getDate(), this.date)) {
      next.addDay();
      continue;
    }
    if (this.dayOfWeek != null && !recurMatch(next.getDay(), this.dayOfWeek)) {
      next.addDay();
      continue;
    }
    if (this.hour != null && !recurMatch(next.getHours(), this.hour)) {
      next.addHour();
      continue;
    }
    if (this.minute != null && !recurMatch(next.getMinutes(), this.minute)) {
      next.addMinute();
      continue;
    }
    if (this.second != null && !recurMatch(next.getSeconds(), this.second)) {
      next.addSecond();
      continue;
    }

    break;
  }

  return next;
};

function recurMatch(val, matcher) {
  if (matcher == null) {
    return true;
  }

  if (typeof matcher === 'number' || typeof matcher === 'string') {
    return (val === matcher);
  } else if (matcher instanceof Range) {
    return matcher.contains(val);
  } else if (Array.isArray(matcher) || (matcher instanceof Array)) {
    for (var i = 0; i < matcher.length; i++) {
      if (recurMatch(val, matcher[i])) {
        return true;
      }
    }
  }

  return false;
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

var invocations = [];
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

      if (job.callback) {
        job.callback();
      }

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

/* Convenience methods */
var scheduledJobs = {};

function scheduleJob() {
  if (arguments.length < 2) {
    return null;
  }

  var name = (arguments.length >= 3 && typeof arguments[0] === 'string') ? arguments[0] : null;
  var spec = name ? arguments[1] : arguments[0];
  var method = name ? arguments[2] : arguments[1];
  var callback = name ? arguments[3] : arguments[2];

  var job = new Job(name, method, callback);

  if (job.schedule(spec)) {
    return job;
  }

  return null;
}

function cancelJob(job) {
  var success = false;
  if (job instanceof Job) {
    success = job.cancel();
  } else if (typeof job == 'string' || job instanceof String) {
    if (job in scheduledJobs && scheduledJobs.hasOwnProperty(job)) {
      success = scheduledJobs[job].cancel();
    }
  }

  return success;
}

/* Public API */
module.exports.Job = Job;
module.exports.Range = Range;
module.exports.RecurrenceRule = RecurrenceRule;
module.exports.Invocation = Invocation;
module.exports.scheduleJob = scheduleJob;
module.exports.scheduledJobs = scheduledJobs;
module.exports.cancelJob = cancelJob;
module.exports.addDateConvenienceMethods = increment.addDateConvenienceMethods;
