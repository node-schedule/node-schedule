import { EventEmitter } from 'events';

import type { CronExpression } from 'cron-parser';
import * as cronParser from 'cron-parser';
import CronDate from 'cron-parser/lib/date';
import * as sorted from 'sorted-array-functions';

import {
  cancelInvocation,
  Invocation,
  scheduleInvocation,
  scheduleNextRecurrence,
  sorter
} from './Invocation';
import { RecurrenceSpecDateRange, RecurrenceSpecObjLit } from './schedule';
import { RecurrenceRule } from './recurrence-rule';
import { isValidDate } from './utils/dateUtils';

export const scheduledJobs: Record<string, Job> = {};

let anonJobCounter = 0;

function resolveAnonJobName(): string {
  const now = new Date();
  if (anonJobCounter === Number.MAX_SAFE_INTEGER) {
    anonJobCounter = 0;
  }
  anonJobCounter++;

  return `<Anonymous Job ${anonJobCounter} ${now.toISOString()}>`;
}

export type JobCallback<T = void> = (fireDate?: Date) => T

/* Job object */
export class Job<T = void> extends EventEmitter {
  // setup a private pendingInvocations variable
  public pendingInvocations: Invocation[] = [];

  // setup a private number of invocations variable
  private _triggeredJobs: number = 0;

  private readonly jobName: string;
  public job: JobCallback<T>;
  public callback: VoidFunction | false;
  public isOneTimeJob?: boolean;

  constructor(name: string | null, job: JobCallback<T>, callback?: VoidFunction);
  constructor(job: JobCallback<T>, callback?: VoidFunction);
  constructor(nameOrJob: string | null | JobCallback<T>, jobOrCallback: JobCallback<T> | VoidFunction, callback?: VoidFunction) {
    super();

    // Set scope vars
    this.jobName = nameOrJob && typeof nameOrJob === 'string'
      ? nameOrJob
      : resolveAnonJobName();
    const job: JobCallback<T> | GeneratorFunction = typeof nameOrJob === 'function'
      ? nameOrJob as JobCallback<T> | GeneratorFunction
      : jobOrCallback as JobCallback<T> | GeneratorFunction;

    // Make sure callback is actually a callback
    if (job === nameOrJob) {
      // Name wasn't provided and maybe a callback is there
      this.callback = typeof jobOrCallback === 'function' ? jobOrCallback : false;
    } else {
      // Name was provided, and maybe a callback is there
      this.callback = typeof callback === 'function' ? callback : false;
    }

    // Check for generator
    if (typeof job === 'function' && job.prototype?.next) {
      const generator = (job as GeneratorFunction).call(this);
      this.job = () => generator.next().value;
    } else {
      this.job = job as JobCallback<T>;
    }
  }

  // define properties
  get name(): string {
    return this.jobName;
  };

  // method that require private access
  trackInvocation(invocation: Invocation): void {
    // add to our invocation list
    sorted.add(this.pendingInvocations, invocation, sorter);
  }

  stopTrackingInvocation(invocation: Invocation): boolean {
    const invIdx = this.pendingInvocations.indexOf(invocation);
    if (invIdx > -1) {
      this.pendingInvocations.splice(invIdx, 1);
      return true;
    }

    return false;
  }

  triggeredJobs(): number {
    return this._triggeredJobs;
  }

  setTriggeredJobs(triggeredJob: number): void {
    this._triggeredJobs = triggeredJob;
  }

  deleteFromSchedule(): void {
    deleteScheduledJob(this.name);
  }

  cancel(reschedule: boolean = false): true {
    let inv, newInv;
    const newInvs: Invocation[] = [];
    this.pendingInvocations.forEach(inv => {
      cancelInvocation(inv);

      if (reschedule && ((inv.recurrenceRule as RecurrenceRule).recurs || (inv.recurrenceRule as CronExpression).next)) {
        newInv = scheduleNextRecurrence(inv.recurrenceRule, this, inv.fireDate, inv.endDate);
        if (newInv) {
          newInvs.push(newInv);
        }
      }
    });

    this.pendingInvocations = [];

    newInvs.forEach(newInv => this.trackInvocation(newInv));

    // remove from scheduledJobs if reschedule === false
    if (!reschedule) {
      this.deleteFromSchedule();
    }

    return true;
  }

  cancelNext(reschedule?: boolean): boolean {
    reschedule = (typeof reschedule === 'boolean') ? reschedule : true;

    if (!this.pendingInvocations.length) {
      return false;
    }

    let newInv;
    const nextInv = this.pendingInvocations.shift()!;

    cancelInvocation(nextInv);

    if (reschedule && ((nextInv.recurrenceRule as RecurrenceRule).recurs || (nextInv.recurrenceRule as CronExpression).next)) {
      newInv = scheduleNextRecurrence(nextInv.recurrenceRule, this, nextInv.fireDate, nextInv.endDate);
      if (newInv !== null) {
        this.trackInvocation(newInv);
      }
    }

    return true;
  }

  reschedule(spec: Date | string | number | RecurrenceSpecObjLit | RecurrenceRule): boolean {
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
  }

  nextInvocation(): CronDate | null {
    return this.pendingInvocations[0]?.fireDate || null;
  }

  invoke(fireDate?: Date): T {
    this.setTriggeredJobs(this.triggeredJobs() + 1);
    return this.job(fireDate);
  }

  runOnDate(date: Date | string | RecurrenceSpecObjLit): boolean {
    return this.schedule(date);
  }

  schedule(spec: Date | string | number | RecurrenceSpecObjLit | RecurrenceRule | RecurrenceSpecDateRange): boolean {
    const self = this;
    let success = false;
    let inv: Invocation | null;
    let start;
    let end;
    let tz;

    // save passed-in value before 'spec' is replaced
    if (typeof spec === 'object' && 'tz' in spec) {
      tz = spec.tz;
    }

    if (typeof spec === 'object' && (spec as RecurrenceSpecDateRange).rule) {
      start = (spec as RecurrenceSpecDateRange).start || undefined;
      end = (spec as RecurrenceSpecDateRange).end || undefined;
      spec = (spec as RecurrenceSpecDateRange).rule;

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
      const res: CronExpression = cronParser.parseExpression(spec as string, { currentDate: (start as CronDate | undefined), tz: tz });
      inv = scheduleNextRecurrence(res, self, (start as CronDate | undefined), (end as CronDate | undefined));
      if (inv !== null) {
        self.trackInvocation(inv);
        success = true;
      }
    } catch (err) {
      const type = typeof spec;
      if ((type === 'string') || (type === 'number')) {
        spec = new Date(spec as string | number);
      }

      if ((spec instanceof Date) && (isValidDate(spec))) {
        const cronDate = new CronDate(spec);

        this.isOneTimeJob = true;

        if (cronDate.getTime() >= Date.now()) {
          inv = new Invocation(self, cronDate);
          scheduleInvocation(inv);
          self.trackInvocation(inv);
          success = true;
        }
      } else if (type === 'object') {
        self.isOneTimeJob = false;
        if (!(spec instanceof RecurrenceRule)) {
          const r = new RecurrenceRule();
          if ('year' in (spec as RecurrenceSpecObjLit)) {
            r.year = (spec as RecurrenceSpecObjLit).year || null;
          }
          if ('month' in (spec as RecurrenceSpecObjLit)) {
            r.month = (spec as RecurrenceSpecObjLit).month || null;
          }
          if ('date' in (spec as RecurrenceSpecObjLit)) {
            r.date = (spec as RecurrenceSpecObjLit).date || null;
          }
          if ('dayOfWeek' in (spec as RecurrenceSpecObjLit)) {
            r.dayOfWeek = (spec as RecurrenceSpecObjLit).dayOfWeek || null;
          }
          if ('hour' in (spec as RecurrenceSpecObjLit)) {
            r.hour = (spec as RecurrenceSpecObjLit).hour || null;
          }
          if ('minute' in (spec as RecurrenceSpecObjLit)) {
            r.minute = (spec as RecurrenceSpecObjLit).minute || null;
          }
          if ('second' in (spec as RecurrenceSpecObjLit)) {
            r.second = (spec as RecurrenceSpecObjLit).second || null;
          }

          spec = r;
        }

        spec.tz = tz;
        inv = scheduleNextRecurrence(spec, self, (start as CronDate | undefined), (end as CronDate | undefined));
        if (inv !== null) {
          self.trackInvocation(inv);
          success = true;
        }
      }
    }

    scheduledJobs[this.name] = this;
    return success;
  }
}

export function deleteScheduledJob(name: string): void {
  if (name) {
    delete scheduledJobs[name];
  }
}
