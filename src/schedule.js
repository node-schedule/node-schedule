'use strict';

/*
  node-schedule
  A cron-like and not-cron-like job scheduler for Node.
*/

let Invocation = require('./invocation.js'),
  Increment = require('./increment.js'),
  Job = require('./job.js'),
  Range = require('./range.js'),
  RecurrenceRule = require('./recurrenceRule.js');



/* Convenience methods */
var scheduledJobs = {};

function scheduleJob() {
  if (arguments.length < 2) {
    return null;
  }

  var name = (arguments.length >= 3) ? arguments[0] : null;
  var spec = (arguments.length >= 3) ? arguments[1] : arguments[0];
  var method = (arguments.length >= 3) ? arguments[2] : arguments[1];

  var job = new Job(name, method);

  if (job.schedule(spec)) {
    scheduledJobs[job.name] = job;
    return job;
  }

  return null;
}

function cancelJob(job) {
  var success = false;
  if (job instanceof Job) {
    success = job.cancel();
    if (success) {
      for (var name in scheduledJobs) {
        if (scheduledJobs.hasOwnProperty(name)) {
          if (scheduledJobs[name] === job) {
            scheduledJobs[name] = null;
            break;
          }
        }
      }
    }
  } else if (typeof job == 'string' || job instanceof String) {
    if (job in scheduledJobs && scheduledJobs.hasOwnProperty(job)) {
      success = scheduledJobs[job].cancel();
      if (success) {
        scheduledJobs[job] = null;
      }
    }
  }

  return success;
}



/* Public API */
exports.Job = Job;
exports.Range = Range;
exports.RecurrenceRule = RecurrenceRule;
exports.Invocation = Invocation;
exports.scheduleJob = scheduleJob;
exports.scheduledJobs = scheduledJobs;
exports.cancelJob = cancelJob;
exports.addDateConvenienceMethods = Increment.addDateConvenienceMethods;
