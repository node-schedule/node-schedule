'use strict';

/*
  node-schedule
  A cron-like and not-cron-like job scheduler for Node.
*/

const { Job, scheduledJobs } = require('./Job')

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

/* Convenience methods */
function scheduleJob() {
  if (arguments.length < 2) {
    throw new RangeError('Invalid number of arguments');
  }

  const name = (arguments.length >= 3 && typeof arguments[0] === 'string') ? arguments[0] : null;
  const spec = name ? arguments[1] : arguments[0];
  const method = name ? arguments[2] : arguments[1];
  const callback = name ? arguments[3] : arguments[2];

  if (typeof method !== 'function') {
    throw new RangeError('The job method must be a function.');
  }

  const job = new Job(name, method, callback);

  if (job.schedule(spec)) {
    return job;
  }

  return null;
}

function rescheduleJob(job, spec) {
  if (job instanceof Job) {
    if (job.reschedule(spec)) {
      return job;
    }
  } else if (typeof job === 'string') {
    if (Object.prototype.hasOwnProperty.call(scheduledJobs, job)) {
      if (scheduledJobs[job].reschedule(spec)) {
        return scheduledJobs[job];
      }
    } else {
      throw new Error('Cannot reschedule one-off job by name, pass job reference instead')
    }
  }
  return null;
}

function cancelJob(job) {
  let success = false;
  if (job instanceof Job) {
    success = job.cancel();
  } else if (typeof job == 'string' || job instanceof String) {
    if (job in scheduledJobs && Object.prototype.hasOwnProperty.call(scheduledJobs, job)) {
      success = scheduledJobs[job].cancel();
    }
  }

  return success;
}

function gracefulShutdown() {
  const jobs = Object.keys(scheduledJobs).map(key => scheduledJobs[key]);
  jobs.forEach(function (job) {
    job.cancel();
  });

  let running = false;
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].running > 0) {
      running = true;
      break;
    }
  }

  return new Promise(function (resolve) {
    if (running) {
      setInterval(function () {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].running > 0) {
            return;
          }
        }

        resolve();
      }, 500);
    } else {
      resolve();
    }
  });
}

/* Public API */
module.exports = {
  scheduleJob,
  rescheduleJob,
  scheduledJobs,
  cancelJob,
  gracefulShutdown,
}
