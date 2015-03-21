'use strict';

let increment = require('./increment.js');
let Range = require('./range.js');

let recurMatch = function(val, matcher) {
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
    return false;
  }

  return false;
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
class RecurrenceRule {
  constructor(year, month, date, dayOfWeek, hour, minute, second) {
    this.recurs = true;

    this.year = (year == null) ? null : year;
    this.month = (month == null) ? null : month;
    this.date = (date == null) ? null : date;
    this.dayOfWeek = (dayOfWeek == null) ? null : dayOfWeek;
    this.hour = (hour == null) ? null : hour;
    this.minute = (minute == null) ? null : minute;
    this.second = (second == null) ? 0 : second;
  }

  validate() {
    // TODO: validation
    return true;
  };

  nextInvocationDate(base) {
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
        next.setDate(1);
        next.setHours(0);
        next.setMinutes(0);
        next.setSeconds(0);
        continue;
      }
      if (this.date != null && !recurMatch(next.getDate(), this.date)) {
        next.addDay();
        next.setHours(0);
        next.setMinutes(0);
        next.setSeconds(0);
        continue;
      }
      if (this.dayOfWeek != null && !recurMatch(next.getDay(), this.dayOfWeek)) {
        next.addDay();
        next.setHours(0);
        next.setMinutes(0);
        next.setSeconds(0);
        continue;
      }
      if (this.hour != null && !recurMatch(next.getHours(), this.hour)) {
        next.addHour();
        next.setMinutes(0);
        next.setSeconds(0);
        continue;
      }
      if (this.minute != null && !recurMatch(next.getMinutes(), this.minute)) {
        next.addMinute();
        next.setSeconds(0);
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

}

RecurrenceRule.prototype.validate = function() {
  // TODO: validation
  return true;
};

module.exports = RecurrenceRule;
