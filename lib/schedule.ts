import { JobCallback, scheduledJobs } from './Job';
import { Job } from './Job';
import type { Timezone } from './recurrence-rule';
import { RecurrenceRule } from './recurrence-rule';

export interface RecurrenceSpecDateRange {
  /**
   * Starting date in date range.
   */
  start?: Date | string | number;
  /**
   * Ending date in date range.
   */
  end?: Date | string | number;
  /**
   * Cron expression string.
   */
  rule: Date | string | number | RecurrenceSpecObjLit | RecurrenceRule;
  /**
   * Timezone
   */
  tz?: Timezone;
}

export interface RecurrenceSpecObjLit {
  /**
   * Day of the month.
   */
  date?: number;
  dayOfWeek?: number;
  hour?: number;
  minute?: number;
  month?: number;
  second?: number;
  year?: number;
  /**
   * Timezone
   */
  tz?: Timezone;
}

/* Convenience methods */
export function scheduleJob<T>(name: string, rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number, method: JobCallback<T>, callback?: VoidFunction): Job<T>;
export function scheduleJob<T>(rule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number, method: JobCallback<T>, callback?: VoidFunction): Job<T>;
export function scheduleJob<T>(nameOrRule: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number, ruleOrMethod: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number | JobCallback<T>, methodOrCallback?: JobCallback<T> | VoidFunction, callback?: VoidFunction): Job<T> | null {
  if (arguments.length < 2) {
    throw new RangeError('Invalid number of arguments');
  }

  const name: string | null = (arguments.length >= 3 && typeof nameOrRule === 'string') ? nameOrRule : null;
  const spec: Date | string | number | RecurrenceSpecObjLit | RecurrenceRule = name
    ? ruleOrMethod as RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string
    : nameOrRule as RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string;
  const method: JobCallback<T> = name ? methodOrCallback as JobCallback<T> : ruleOrMethod as JobCallback<T>;
  const _callback: VoidFunction | undefined = name ? callback : methodOrCallback as VoidFunction | undefined;

  if (typeof method !== 'function') {
    throw new RangeError('The job method must be a function.');
  }

  const job = new Job<T>(name, method, _callback);

  if (job.schedule(spec)) {
    return job;
  }

  return null;
}

export function rescheduleJob(job: Job | string, spec: Date | string | number | RecurrenceSpecObjLit | RecurrenceRule): Job | null {
  if (job instanceof Job) {
    if (job.reschedule(spec)) {
      return job;
    }
  } else if (typeof job === 'string') {
    if (scheduledJobs.hasOwnProperty(job)) {
      if (scheduledJobs[job].reschedule(spec)) {
        return scheduledJobs[job];
      }
    } else {
      throw new Error('Cannot reschedule one-off job by name, pass job reference instead');
    }
  }
  return null;
}

export function cancelJob(job: Job | string): boolean {
  let success = false;
  if (job instanceof Job) {
    success = job.cancel();
  } else if (typeof job === 'string') {
    if (job in scheduledJobs && scheduledJobs.hasOwnProperty(job)) {
      success = scheduledJobs[job].cancel();
    }
  }

  return success;
}
