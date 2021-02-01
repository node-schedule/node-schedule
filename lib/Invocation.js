'use strict';

const lt = require('long-timeout')
const CronDate = require('cron-parser/lib/date')
const sorted = require('sorted-array-functions')

const invocations = [];
let currentInvocation = null;

/* DoesntRecur rule */
const DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

/* Invocation object */
function Invocation(job, fireDate, recurrenceRule, endDate) {
  this.job = job;
  this.fireDate = fireDate;
  this.endDate = endDate;
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
    for (let i = this.start; i < this.end; i += this.step) {
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

RecurrenceRule.prototype.isValid = function() {
  function isValidType(num) {
    if (Array.isArray(num) || (num instanceof Array)) {
      return num.every(function(e) {
        return isValidType(e);
      });
    }
    return !(Number.isNaN(Number(num)) && !(num instanceof Range));
  }
  if (this.month !== null && (this.month < 0 || this.month > 11 || !isValidType(this.month))) {
    return false;
  }
  if (this.dayOfWeek !== null && (this.dayOfWeek < 0 || this.dayOfWeek > 6 || !isValidType(this.dayOfWeek))) {
    return false;
  }
  if (this.hour !== null && (this.hour < 0 || this.hour > 23 || !isValidType(this.hour))) {
    return false;
  }
  if (this.minute !== null && (this.minute < 0 || this.minute > 59 || !isValidType(this.minute))) {
    return false;
  }
  if (this.second !== null && (this.second < 0 || this.second > 59 || !isValidType(this.second))) {
    return false;
  }
  if (this.date !== null) {
    if(!isValidType(this.date)) {
      return false;
    }
    switch (this.month) {
      case 3:
      case 5:
      case 8:
      case 10:
        if (this.date < 1 || this. date > 30) {
          return false;
        }
        break;
      case 1:
        if (this.date < 1 || this. date > 29) {
          return false;
        }
        break;
      default:
        if (this.date < 1 || this. date > 31) {
          return false;
        }
    }
  }
  return true;
};

RecurrenceRule.prototype.nextInvocationDate = function(base) {
  const next = this._nextInvocationDate(base);
  return next ? next.toDate() : null;
};

RecurrenceRule.prototype._nextInvocationDate = function(base) {
  base = ((base instanceof CronDate) || (base instanceof Date)) ? base : (new Date());
  if (!this.recurs) {
    return null;
  }

  if(!this.isValid()) {
    return null;
  }

  const now = new CronDate(Date.now(), this.tz);
  let fullYear = now.getFullYear();
  if ((this.year !== null) &&
    (typeof this.year == 'number') &&
    (this.year < fullYear)) {
    return null;
  }

  let next = new CronDate(base.getTime(), this.tz);
  next.addSecond();

  while (true) {
    if (this.year !== null) {
      fullYear = next.getFullYear();
      if ((typeof this.year == 'number') && (this.year < fullYear)) {
        next = null;
        break;
      }

      if (!recurMatch(fullYear, this.year)) {
        next.addYear();
        next.setMonth(0);
        next.setDate(1);
        next.setHours(0);
        next.setMinutes(0);
        next.setSeconds(0);
        continue;
      }
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

  if (typeof matcher === 'number') {
    return (val === matcher);
  } else if(typeof matcher === 'string') {
    return (val === Number(matcher));
  } else if (matcher instanceof Range) {
    return matcher.contains(val);
  } else if (Array.isArray(matcher) || (matcher instanceof Array)) {
    for (let i = 0; i < matcher.length; i++) {
      if (recurMatch(val, matcher[i])) {
        return true;
      }
    }
  }

  return false;
}

/* Date-based scheduler */
function runOnDate(date, job) {
  const now = Date.now();
  const then = date.getTime();

  return lt.setTimeout(function() {
    if (then > Date.now())
      runOnDate(date, job);
    else
      job();
  }, (then < now ? 0 : then - now));
}

function scheduleInvocation(invocation) {
  sorted.add(invocations, invocation, sorter);
  prepareNextInvocation();
  const date = invocation.fireDate instanceof CronDate ? invocation.fireDate.toDate() : invocation.fireDate;
  invocation.job.emit('scheduled', date);
}

function prepareNextInvocation() {
  if (invocations.length > 0 && currentInvocation !== invocations[0]) {
    if (currentInvocation !== null) {
      lt.clearTimeout(currentInvocation.timerID);
      currentInvocation.timerID = null;
      currentInvocation = null;
    }

    currentInvocation = invocations[0];

    const job = currentInvocation.job;
    const cinv = currentInvocation;
    currentInvocation.timerID = runOnDate(currentInvocation.fireDate, function() {
      currentInvocationFinished();

      if (job.callback) {
        job.callback();
      }

      if (cinv.recurrenceRule.recurs || cinv.recurrenceRule._endDate === null) {
        const inv = scheduleNextRecurrence(cinv.recurrenceRule, cinv.job, cinv.fireDate, cinv.endDate);
        if (inv !== null) {
          inv.job.trackInvocation(inv);
        }
      }

      job.stopTrackingInvocation(cinv);

      try {
        const result = job.invoke(cinv.fireDate instanceof CronDate ? cinv.fireDate.toDate() : cinv.fireDate);
        job.emit('run');

        if (result instanceof Promise) {
          result.catch(function (err) {
            job.emit('error', err);
          });
        }
      } catch (err) {
        job.emit('error', err);
      }

      if (job.isOneTimeJob) {
        job.deleteFromSchedule();
      }
    });
  }
}

function currentInvocationFinished() {
  invocations.shift();
  currentInvocation = null;
  prepareNextInvocation();
}

function cancelInvocation(invocation) {
  const idx = invocations.indexOf(invocation);
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
function scheduleNextRecurrence(rule, job, prevDate, endDate) {

  prevDate = (prevDate instanceof CronDate) ? prevDate : new CronDate();

  const date = (rule instanceof RecurrenceRule) ? rule._nextInvocationDate(prevDate) : rule.next();
  if (date === null) {
    return null;
  }

  if ((endDate instanceof CronDate) && date.getTime() > endDate.getTime()) {
    return null;
  }

  const inv = new Invocation(job, date, rule, endDate);
  scheduleInvocation(inv);

  return inv;
}

module.exports = {
  Range,
  RecurrenceRule,
  Invocation,
  cancelInvocation,
  scheduleInvocation,
  scheduleNextRecurrence,
  sorter,
  _invocations: invocations
}
