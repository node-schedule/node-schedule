import type { Timeout } from 'long-timeout';
import * as lt from 'long-timeout';
import CronDate from 'cron-parser/lib/date';
import type { CronExpression } from 'cron-parser';
import * as sorted from 'sorted-array-functions';

import type { Job } from './Job';
import { RecurrenceRule } from './recurrence-rule';

export const invocations: Invocation<any>[] = [];
let currentInvocation: Invocation<any> | null = null;

/* DoesntRecur rule */
const DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

/* Invocation object */
export class Invocation<T = void> {
  public job: Job<T>;
  public fireDate: CronDate;
  public endDate?: CronDate;
  public recurrenceRule: RecurrenceRule | CronExpression;

  public timerID: Timeout | null = null;

  constructor(job: Job<T>, fireDate: CronDate, recurrenceRule?: RecurrenceRule | CronExpression, endDate?: CronDate) {
    this.job = job;
    this.fireDate = fireDate;
    this.endDate = endDate;
    this.recurrenceRule = recurrenceRule || DoesntRecur;
    this.timerID = null;
  }
}

export function sorter(a: Invocation, b: Invocation): -1 | 0 | 1 {
  const difference = a.fireDate.getTime() - b.fireDate.getTime();
  if (difference < 0) return -1;
  return difference > 0 ? 1 : 0;
}

/* Date-based scheduler */
export function runOnDate(date: CronDate, job: VoidFunction): lt.Timeout {
  const now = Date.now();
  const then = date.getTime();

  return lt.setTimeout(function () {
    if (then > Date.now())
      runOnDate(date, job);
    else
      job();
  }, (then < now ? 0 : then - now));
}

export function scheduleInvocation(invocation: Invocation): void {
  sorted.add(invocations, invocation, sorter);
  prepareNextInvocation();
  const date = invocation.fireDate.toDate();
  invocation.job.emit('scheduled', date);
}

export function prepareNextInvocation(): void {
  if (invocations.length > 0 && currentInvocation !== invocations[0]) {
    if (currentInvocation?.timerID) {
      lt.clearTimeout(currentInvocation.timerID);
      currentInvocation.timerID = null;
      currentInvocation = null;
    }

    currentInvocation = invocations[0];

    const job = currentInvocation.job;
    const cinv = currentInvocation;
    currentInvocation.timerID = runOnDate(currentInvocation.fireDate, function () {
      currentInvocationFinished();

      if (job.callback) {
        job.callback();
      }

      if ((cinv.recurrenceRule as RecurrenceRule).recurs || (cinv.recurrenceRule as CronExpression)._endDate === null) {
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
          result.catch((err: any) => {
            job.emit('error', err)
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

export function currentInvocationFinished(): void {
  invocations.shift();
  currentInvocation = null;
  prepareNextInvocation();
}

export function cancelInvocation(invocation: Invocation): void {
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
export function scheduleNextRecurrence<T>(rule: RecurrenceRule | CronExpression, job: Job<T>,
                                          prevDate?: CronDate, endDate?: CronDate): Invocation | null {
  prevDate = (prevDate instanceof CronDate) ? prevDate : new CronDate();

  const date: CronDate | null = rule instanceof RecurrenceRule
      ? rule._nextInvocationDate(prevDate)
      : rule.next();
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
