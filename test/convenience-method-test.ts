import test from 'tape';
import * as sinon from 'sinon';

import { cancelJob, rescheduleJob, scheduleJob } from '../lib/schedule';
import { Job, scheduledJobs } from '../lib/Job';
import { RecurrenceRule } from '../lib/recurrence-rule';
import { invocations } from '../lib/Invocation';

test("Convenience method", function (t) {
  let clock: sinon.SinonFakeTimers;

  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test(".scheduleJob", function(t) {
    t.test("Returns Job instance", function (test) {
      const job = scheduleJob(new Date(Date.now() + 1000), function () {
      });

      test.ok(job instanceof Job);

      job.cancel();
      test.end();
    });

    t.test("Returns null if fewer than 2 arguments are passed", function (test) {
      test.plan(1);

      const fn = function() {
        // @ts-ignore - Wrong number of arguments
        return scheduleJob(function() {});
      };

      test.throws(fn, RangeError);

      test.end();
    });

    t.test("Throws a RangeError if the method argument is not a function", function (test) {
      test.plan(1);

      const fn = function() {
        // @ts-ignore - Wrong argument type
        return scheduleJob(new Date(Date.now() + 1000), {});
      };

      test.throws(fn, RangeError);

      test.end();
    });
  });

  t.test(".scheduleJob(Date, fn)", function(t) {
    t.test("Runs job once at some date and does not cause a leak", function(test) {
      test.plan(3);

      scheduleJob(new Date(Date.now() + 3000), function() {
        test.ok(true);
      });

      setTimeout(function() {
        // TODO: This should be private
        test.equal(invocations.length, 0)
        test.equal(Object.keys(scheduledJobs).length, 0)
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Job doesn't emit initial 'scheduled' event", function(test) {
      const job = scheduleJob(new Date(Date.now() + 1000), function () {
      });

      job.on('scheduled', function() {
        test.ok(false);
      });

      setTimeout(function() {
        test.end();
      }, 1250);

      clock.tick(1250);
    })

    t.test("Won't run job if scheduled in the past", function(test) {
      test.plan(1);
      const job = scheduleJob(new Date(Date.now() - 3000), function () {
        test.ok(false);
      });

      test.equal(job, null);

      setTimeout(function() {
        test.end();
      }, 1000);

      clock.tick(1000);
    })
  })

  t.test(".scheduleJob(RecurrenceRule, fn)", function(t) {
    t.test("Runs job at interval based on recur rule, repeating indefinitely", function(test) {
      test.plan(3);

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Job doesn't emit initial 'scheduled' event", function(test) {
      /*
        * If this was Job#schedule it'd fire 4 times.
        */
      test.plan(3);

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
      });

      job.on('scheduled', function(runOnDate) {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Doesn't invoke job if recur rule schedules it in the past", function(test) {
      test.plan(1);
      const rule = new RecurrenceRule();
      rule.year = 1960;

      const job = scheduleJob(rule, function () {
        test.ok(false);
      });

      test.equal(job, null);

      setTimeout(function() {
        test.end();
      }, 1000);

      clock.tick(1000);
    })
  })

  t.test(".scheduleJob({...}, fn)", function(t) {
    t.test("Runs job at interval based on object, repeating indefinitely", function(test) {
      test.plan(3);

      const job = scheduleJob({
        second: undefined // Fire every second
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Job doesn't emit initial 'scheduled' event", function(test) {
      /*
        * With Job#schedule this would be 3:
        *  scheduled at time 0
        *  scheduled at time 1000
        *  scheduled at time 2000
        */
      test.plan(2);

      const job = scheduleJob({
        second: undefined // fire every second
      }, function () {
      });

      job.on('scheduled', function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 2250);

      clock.tick(2250);
    })

    t.test("Doesn't invoke job if object schedules it in the past", function(test) {
      test.plan(1);

      const job = scheduleJob({
        year: 1960
      }, function () {
        test.ok(false);
      });

      test.equal(job, null);

      setTimeout(function() {
        test.end();
      }, 1000);

      clock.tick(1000);
    })
  })

  t.test(".scheduleJob({...}, {...}, fn)", function(t) {
    t.test("Callback called for each job if callback is provided", function(test) {
      test.plan(3);

      const job = scheduleJob({
        second: undefined // Fire every second
      }, function () {
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
  })

  t.test(".rescheduleJob(job, {...})", function(t) {
    t.test("Reschedule jobs from object based to object based", function(test) {
      test.plan(3);

      const job = scheduleJob({
        second: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job, {
          minute: undefined
        });
      }, 3250);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 5000);

      clock.tick(5000);
    })

    t.test("Reschedule jobs from every minutes to every second", function(test) {
      test.plan(3);

      const timeout = 60 * 1000;

      const job = scheduleJob({
        minute: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job, {
          second: undefined
        });
      }, timeout);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, timeout + 2250);

      clock.tick(timeout + 2250);
    })
  })

  t.test(".rescheduleJob(job, Date)", function(t) {
    t.test("Reschedule jobs from Date to Date", function(test) {
      test.plan(1);

      const job = scheduleJob(new Date(Date.now() + 3000), function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job, new Date(Date.now() + 5000));
      }, 1000);

      setTimeout(function() {
        test.end();
      }, 6150);

      clock.tick(6150);
    })

    t.test("Reschedule jobs that has been executed", function(test) {
      test.plan(2);

      const job = scheduleJob(new Date(Date.now() + 1000), function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job, new Date(Date.now() + 2000));
      }, 2000);

      setTimeout(function() {
        test.end();
      }, 5150);

      clock.tick(5150);
    })
  })

  t.test(".rescheduleJob(job, RecurrenceRule)", function(t) {
    t.test("Reschedule jobs from RecurrenceRule to RecurrenceRule", function (test) {
      test.plan(3);

      const timeout = 60 * 1000;

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      const newRule = new RecurrenceRule();
      newRule.minute = null;

      setTimeout(function () {
        rescheduleJob(job, newRule);
      }, 2250);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, timeout + 2250);

      clock.tick(timeout + 2250);
    })

    t.test("Reschedule jobs from RecurrenceRule to Date", function (test) {
      test.plan(3);

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function () {
        rescheduleJob(job, new Date(Date.now() + 2000));
      }, 2150);

      setTimeout(function () {
        test.end();
      }, 4250);

      clock.tick(4250);
    })

    t.test("Reschedule jobs from RecurrenceRule to {...}", function (test) {
      test.plan(3);

      const timeout = 60 * 1000;

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function () {
        rescheduleJob(job, {
          minute: undefined
        });
      }, 2150);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, timeout + 2150);

      clock.tick(timeout + 2150);
    })

    t.test("Reschedule jobs that is not available", function (test) {
      test.plan(4);
      clock = sinon.useFakeTimers();

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function () {
        // @ts-ignore - Wrong argument type
        rescheduleJob(null, new Date(Date.now() + 2000));
      }, 2150);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 4250);

      clock.tick(4250);
    })
  })

  t.test('.rescheduleJob("job name", {...})', function(t) {
    t.test("Reschedule jobs from object based to object based", function(test) {
      test.plan(3);

      const job = scheduleJob({
        second: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job.name, {
          minute: undefined
        });
      }, 3250);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 5000);

      clock.tick(5000);
    })

    t.test("Reschedule jobs from every minutes to every second", function(test) {
      test.plan(3);

      const timeout = 60 * 1000;

      const job = scheduleJob({
        minute: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job.name, {
          second: undefined
        });
      }, timeout);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, timeout + 2250);

      clock.tick(timeout + 2250);
    })
  })
  t.test('.rescheduleJob("job name", Date)', function(t) {
    t.test("Reschedule jobs from Date to Date", function(test) {
      test.plan(1);

      const job = scheduleJob(new Date(Date.now() + 3000), function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job.name, new Date(Date.now() + 5000));
      }, 1000);

      setTimeout(function() {
        test.end();
      }, 6150);

      clock.tick(6150);
    })
    t.test("Rescheduling one-off job that has been executed by name throws an error", function(test) {
      test.plan(2);

      const job = scheduleJob(new Date(Date.now() + 1000), function () {
        test.ok(true);
      });

      setTimeout(function() {
        test.throws(function() {
          rescheduleJob(job.name, new Date(Date.now() + 2000));
        }, /Error: Cannot reschedule one-off job by name, pass job reference instead/)
      }, 2000);

      setTimeout(function() {
        test.end();
      }, 5150);

      clock.tick(5150);
    })
  })
  t.test('.rescheduleJob("job name", RecurrenceRule)', function(t) {
    t.test("Reschedule jobs from RecurrenceRule to RecurrenceRule", function(test) {
      test.plan(3);
      clock = sinon.useFakeTimers();

      const timeout = 60 * 1000;

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      const newRule = new RecurrenceRule();
      newRule.minute = null;

      setTimeout(function() {
        rescheduleJob(job.name, newRule);
      }, 2250);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, timeout + 2250);

      clock.tick(timeout + 2250);
    })

    t.test("Reschedule jobs from RecurrenceRule to Date", function(test) {
      test.plan(3);

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job.name, new Date(Date.now() + 2000));
      }, 2150);

      setTimeout(function() {
        test.end();
      }, 4250);

      clock.tick(4250);
    })

    t.test("Reschedule jobs from RecurrenceRule to {...}", function(test) {
      test.plan(3);

      const timeout = 60 * 1000;

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function() {
        rescheduleJob(job.name, {
          minute: undefined
        });
      }, 2150);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, timeout + 2150);

      clock.tick(timeout + 2150);
    })

    t.test("Reschedule jobs that does not exist", function(test) {
      test.plan(5);

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      const job = scheduleJob(rule, function () {
        test.ok(true);
      });

      setTimeout(function() {
        test.throws(function() {
          rescheduleJob("Blah", new Date(Date.now() + 2000));
        }, /Error: Cannot reschedule one-off job by name, pass job reference instead/)
      }, 2150);

      setTimeout(function() {
        job.cancel();
        test.end();
      }, 4250);

      clock.tick(4250);
    })
  })

  t.test(".cancelJob(Job)", function(t) {
    t.test("Prevents all future invocations of Job passed in", function(test) {
      test.plan(2);
      clock = sinon.useFakeTimers();

      const job = scheduleJob({
        second: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        cancelJob(job);
      }, 2250);

      setTimeout(function() {
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Can cancel Jobs scheduled with Job#schedule", function(test) {
      test.plan(2);
      clock = sinon.useFakeTimers();

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule({
        second: undefined
      });

      setTimeout(function() {
        cancelJob(job);
      }, 2250);

      setTimeout(function() {
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test("Job emits 'canceled' event", function(test) {
      test.plan(1);

      const job = scheduleJob({
        second: undefined
      }, function () {
      });

      job.on('canceled', function() {
        test.ok(true);
      });

      setTimeout(function() {
        cancelJob(job);
        test.end();
      }, 1250);

      clock.tick(1250);
    })
  })

  t.test('.cancelJob("job name")', function(t) {
    t.test("Prevents all future invocations of Job identified by name", function(test) {
      test.plan(2);

      const job = scheduleJob({
        second: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        cancelJob(job.name);
      }, 2250);

      setTimeout(function() {
        test.end();
      }, 3250);

      clock.tick(3250);
    })
    /*
    "Can cancel Jobs scheduled with Job#schedule", function(test) {
      test.plan(2);

      const job = new Job(function() {
      test.ok(true);
      });

      job.schedule({
      second: undefined
      });

      setTimeout(function() {
      schedule.cancelJob(job.name);
      }, 2250);

      setTimeout(function() {
      test.end();
      }, 3250);
    },*/

    t.test("Job emits 'canceled' event", function(test) {
      test.plan(1);

      const job = scheduleJob({
        second: undefined
      }, function () {
      });

      job.on('canceled', function() {
        test.ok(true);
      });

      setTimeout(function() {
        cancelJob(job.name);
        test.end();
      }, 1250);

      clock.tick(1250);
    })

    t.test("Does nothing if no job found by that name", function(test) {
      test.plan(3);
      clock = sinon.useFakeTimers();

      const job = scheduleJob({
        second: undefined
      }, function () {
        test.ok(true);
      });

      setTimeout(function() {
        // This cancel should not affect anything
        cancelJob('blah');
      }, 2250);

      setTimeout(function() {
        job.cancel(); // prevent tests from hanging
        test.end();
      }, 3250);

      clock.tick(3250);
    })
  })

  t.test('.pendingInvocations()', function(t) {
    t.test("Retrieves pendingInvocations of the job", function(test) {
      const job = scheduleJob(new Date(Date.now() + 1000), function () {
      });

      test.ok(job instanceof Job);
      // TODO: This should be private
      test.ok(job.pendingInvocations[0].job);

      job.cancel();
      test.end();
    })
  })

  t.test("Restore", function (t) {
    clock.restore();
    t.end()
  })
})
