'use strict';

import test from 'tape';
import * as sinon from 'sinon';

import { rescheduleJob, scheduleJob } from '../lib/schedule';
import { Job, scheduledJobs } from '../lib/Job';
import { RecurrenceRule } from '../lib/recurrence-rule';

import { jobContextInGenerator, jobInGenerator } from './es6/job-test';

// ToDo this is failing on airtap, investigate if we are not closing something properly

test("Job", function (t) {
  let clock: sinon.SinonFakeTimers;

  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end();
  });

  t.test("Job constructor", function (t) {
    t.test("Accepts Job name and function to run", function (test) {
      const job = new Job('the job', function () {
      });

      test.equal(job.name, 'the job');
      test.end();
    });
    t.test("Job name is optional and will be auto-generated", function (test) {
      const job = new Job(() => {
      });

      test.ok(job.name);
      test.end();
    });
    t.test("Uses unique names across auto-generated Job names", function (test) {
      const job1 = new Job(() => {
      });
      const job2 = new Job(() => {
      });

      test.notEqual(job1.name, job2.name);
      test.end();
    });
  });

  t.test("#schedule(Date)", function (t) {
    t.test("Runs job once at some date", function (test) {
      test.plan(1);

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule(new Date(Date.now() + 3000));

      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });
    t.test("Cancel next job before it runs", function (test) {
      test.plan(1);

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule(new Date(Date.now() + 1500));
      job.schedule(new Date(Date.now() + 3000));
      job.cancelNext();
      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });
    t.test("Run job on specified date", function (test) {
      test.plan(1);

      const job = new Job(function () {
        test.ok(true);
      });

      job.runOnDate(new Date(Date.now() + 3000));

      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Run job in generator", function (test) {
      jobInGenerator(test);

      clock.tick(3250);
    });

    t.test("Context is passed into generator correctly", function (test) {
      jobContextInGenerator(test);

      clock.tick(3250);
    });

    t.test("Won't run job if scheduled in the past", function (test) {
      test.plan(0);

      const job = new Job(function () {
        test.ok(false);
      });

      job.schedule(new Date(Date.now() - 3000));

      setTimeout(function () {
        test.end();
      }, 1000);

      clock.tick(1000);
    });

    t.test("Jobs still run after scheduling a Job in the past", function (test) {
      test.plan(1);

      const pastJob = new Job(function () {
        // Should not run, blow up if it does
        test.ok(false);
      });

      pastJob.schedule(new Date(Date.now() - 3000));

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule(new Date(Date.now() + 3000));

      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Job emits 'scheduled' event with 'run at' Date", function (test) {
      test.plan(1);

      const date = new Date(Date.now() + 3000);
      const job = new Job(function () {
        test.end();
      });

      job.on('scheduled', function (runAtDate: Date) {
        test.equal(runAtDate.getTime(), date.getTime());
      });

      job.schedule(date);
      clock.tick(3250);
    });
  });

  t.test("#schedule(Date, fn)", function (t) {
    t.test("Runs job once at some date, calls callback when done", function (test) {
      test.plan(1);

      const job = new Job(function () {
      }, function () {
        test.ok(true);
      });

      job.schedule(new Date(Date.now() + 3000));

      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });
  });

  t.test("#schedule(RecurrenceRule)", function (t) {
    t.test("Runs job at interval based on recur rule, repeating indefinitely", function (test) {
      test.plan(3);

      const job = new Job(function () {
        test.ok(true);
      });

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      job.schedule(rule);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Job emits 'scheduled' event for every next invocation", function (test) {
      // Job will run 3 times but be scheduled 4 times, 4th run never happens
      // due to cancel.
      test.plan(4);

      const job = new Job(function () {
      });

      job.on('scheduled', function (runOnDate: Date) {
        test.ok(true);
      });

      const rule = new RecurrenceRule();
      rule.second = null; // fire every second

      job.schedule(rule);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Doesn't invoke job if recur rule schedules it in the past", function (test) {
      test.plan(0);

      const job = new Job(function () {
        test.ok(false);
      });

      const rule = new RecurrenceRule();
      rule.year = 2000;

      job.schedule(rule);

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 1000);

      clock.tick(1000);
    });
  });

  t.test("#schedule({...})", function (t) {
    t.test("Runs job at interval based on object, repeating indefinitely", function (test) {
      test.plan(3);

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Job emits 'scheduled' event for every next invocation", function (test) {
      // Job will run 3 times but be scheduled 4 times, 4th run never happens
      // due to cancel.
      test.plan(4);

      const job = new Job(function () {
      });

      job.on('scheduled', function (runOnDate: Date) {
        test.ok(true);
      });

      job.schedule({
        second: undefined // Fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });

    t.test("Doesn't invoke job if object schedules it in the past", function (test) {
      test.plan(0);

      const job = new Job(function () {
        test.ok(false);
      });

      job.schedule({
        year: 2000
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 1000);

      clock.tick(1000);
    });
  });
  t.test("#schedule('jobName', {...})", function (t) {
    t.test("Runs job with a custom name input", function (test) {
      test.plan(3);

      const job = new Job('jobName', function () {
        test.equal(job.name, 'jobName');
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });
  });
  t.test("#schedule({...}, {...})", function (t) {
    t.test("Runs job and run callback when job is done if callback is provided", function (test) {
      test.plan(3);

      const job = new Job(function () {
      }, function () {
        test.ok(true);
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });
    t.test("Runs job with a custom name input and run callback when job is done", function (test) {
      test.plan(3);

      const job = new Job('MyJob', function () {
      }, function () {
        test.equal(job.name, 'MyJob');
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    });
  });
  t.test("#cancel", function (t) {
    t.test("Prevents all future invocations", function (test) {
      test.plan(1);

      const job = new Job(function () {
        test.ok(true);
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
      }, 1250);

      setTimeout(function () {
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("Cancelled job reschedules", function (test) {
      test.plan(1);
      let ok = false;

      const job = scheduleJob('*/1 * * * * *', function () {
      });

      setTimeout(function () {
        job.cancel(true);
        if (job.nextInvocation() !== null) ok = true;
      }, 1250);

      setTimeout(function () {
        job.cancel();
        test.ok(ok);
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("CancelNext job reschedules", function (test) {
      test.plan(1);
      let ok = false;

      const job = scheduleJob('*/1 * * * * *', function () {
      });

      setTimeout(function () {
        job.cancelNext();
        if (job.nextInvocation() !== null) ok = true;
      }, 1250);

      setTimeout(function () {
        job.cancel();
        test.ok(ok);
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("Job emits 'canceled' event", function (test) {
      test.plan(1);

      const job = new Job(function () {
      });

      job.on('canceled', function () {
        test.ok(true);
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
      }, 1250);

      setTimeout(function () {
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("Job is added to scheduledJobs when created and removed when cancelled", function (test) {
      test.plan(4);

      const job1 = new Job('cancelJob', function () {
      });
      job1.schedule({
        second: undefined // fire every second
      });

      const job2 = scheduleJob('second',
        { second: undefined },
        function () {
        },
        function () {
        });

      test.strictEqual(scheduledJobs.cancelJob, job1);
      test.strictEqual(scheduledJobs.second, job2);
      setTimeout(function () {
        job1.cancel();
        job2.cancel();
        test.strictEqual(scheduledJobs.cancelJob, undefined);
        test.strictEqual(scheduledJobs.second, undefined);
        test.end();
      }, 1250);

      clock.tick(1250);
    });
  });
  t.test("#reschedule", function (t) {
    t.test("When rescheduled counter will be reset to zero", function (test) {

      const job = scheduleJob({
        second: undefined
      }, function () {
      });

      setTimeout(function () {
        test.equal(job.triggeredJobs(), 3);
        rescheduleJob(job, {
          minute: undefined
        });
      }, 3250);

      setTimeout(function () {
        job.cancel();
        test.equal(job.triggeredJobs(), 0);
        test.end();
      }, 5000);

      clock.tick(5000);
    });
  });
  t.test("When invoked", function (t) {
    t.test("Job emits 'run' event", function (test) {
      test.plan(1);

      const job = new Job(function () {
      });

      job.on('run', function () {
        test.ok(true);
      });

      job.schedule(new Date(Date.now() + 3000));

      setTimeout(function () {
        test.end();
      }, 3250);

      clock.tick(3250);
    });
    t.test("Job counter increase properly", function (test) {
      const job = new Job(function () {
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.equal(job.triggeredJobs(), 2);
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("Job gets invoked with the fire date", function (test) {
      test.plan(2);
      let prevFireDate: Date | undefined;
      const job = new Job(function (fireDate: Date | undefined) {
        if (!prevFireDate) {
          test.ok(fireDate instanceof Date);
        } else {
          test.equal(fireDate!.getTime() - prevFireDate.getTime(), 1000);
        }
        prevFireDate = fireDate;
      });

      job.schedule({
        second: undefined // fire every second
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 2250);

      clock.tick(2250);
    });

    t.test("Job emits 'error' event when the job synchronously throws an error", function (test) {
      test.plan(1);

      const error = new Error('test');

      const job = new Job(function () {
        throw error;
      });

      job.on('error', function (err: any) {
        test.strictEqual(err, error);
        test.end();
      });

      job.schedule(new Date(Date.now() + 3000));

      clock.tick(3250);
    });

    t.test("Job emits 'error' event when the job returns a rejected Promise", function (test) {
      test.plan(1);

      const error = new Error('test');

      const job = new Job(function () {
        return Promise.reject(error);
      });

      job.on('error', function (err: any) {
        test.strictEqual(err, error);
        test.end();
      });

      job.schedule(new Date(Date.now() + 3000));

      clock.tick(3250);
    });
  });
  t.test("When invoked manually, it returns the result of the job", { skip: false }, function (test) {
    test.plan(1);

    const job = new Job(function () {
      return 1;
    });

    const result = job.invoke();

    test.strictEqual(result, 1);
    test.end();
  });

  t.test("Restore", function (t) {
    clock.restore();
    t.end();
  });
});
