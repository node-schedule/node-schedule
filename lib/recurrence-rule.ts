/* RecurrenceRule object */

import CronDate from 'cron-parser/lib/date';

import { Range } from './range';

export type Recurrence = number | Range | string;
export type RecurrenceSegment = Recurrence | Recurrence[];
export type Timezone = string;
export type RangeProperty = number | string | Range | (number | string | Range)[] | null;

/*
  Interpreting each property:
  null - any value is valid
  number - fixed value
  Range - value must fall in range
  array - value must validate against any item in list

  NOTE: Cron months are 1-based, but RecurrenceRule months are 0-based.
*/
export class RecurrenceRule {
  public recurs = true;

  public year: RangeProperty = null;
  public month: RangeProperty = null;
  public date: RangeProperty = null;
  public dayOfWeek: RangeProperty = null;
  public hour: RangeProperty = null;
  public minute: RangeProperty = null;
  public second: RangeProperty = 0;
  public tz?: Timezone;

  constructor(year?: number, month?: number, date?: number, dayOfWeek?: number, hour?: number, minute?: number, second?: number) {
    if (year !== null && year !== undefined) this.year = year;
    if (month !== null && month !== undefined) this.month = month;
    if (date !== null && date !== undefined) this.date = date;
    if (dayOfWeek !== null && dayOfWeek !== undefined) this.dayOfWeek = dayOfWeek;
    if (hour !== null && hour !== undefined) this.hour = hour;
    if (minute !== null && minute !== undefined) this.minute = minute;
    if (second !== null && second !== undefined) this.second = second;
  }

  isValid(): boolean {
    function isValidType(num: number | string | Range | (number | string | Range)[]): boolean {
      if (Array.isArray(num)) {
        return num.every(function (e) {
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
      if (!isValidType(this.date)) {
        return false;
      }
      switch (this.month) {
        case 3:
        case 5:
        case 8:
        case 10:
          if (this.date < 1 || this.date > 30) {
            return false;
          }
          break;
        case 1:
          if (this.date < 1 || this.date > 29) {
            return false;
          }
          break;
        default:
          if (this.date < 1 || this.date > 31) {
            return false;
          }
      }
    }
    return true;
  }

  nextInvocationDate(base?: Date | CronDate | null): Date | null {
    const next = this._nextInvocationDate(base);
    return next ? next.toDate() : null;
  }

  _nextInvocationDate(base?: Date | CronDate | null): CronDate | null {
    base = ((base instanceof CronDate) || (base instanceof Date)) ? base : (new Date());
    if (!this.recurs) {
      return null;
    }

    if (!this.isValid()) {
      return null;
    }

    const now = new CronDate(Date.now(), this.tz);
    let fullYear: number = now.getFullYear();
    if ((this.year !== null) &&
      (typeof this.year === 'number') &&
      (this.year < fullYear)) {
      return null;
    }

    let next: CronDate | null = new CronDate(base.getTime(), this.tz);
    next.addSecond();

    while (true) {
      if (this.year !== null) {
        fullYear = next.getFullYear();
        if ((typeof this.year === 'number') && (this.year < fullYear)) {
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
  }
}

function recurMatch(val: number, matcher: RecurrenceSegment): boolean {
  if (matcher === null) {
    return true;
  }

  if (typeof matcher === 'number') {
    return (val === matcher);
  } else if (typeof matcher === 'string') {
    return (val === Number(matcher));
  } else if (matcher instanceof Range) {
    return matcher.contains(val);
  } else if (Array.isArray(matcher)) {
    for (let i = 0; i < matcher.length; i++) {
      if (recurMatch(val, matcher[i])) {
        return true;
      }
    }
  }

  return false;
}
