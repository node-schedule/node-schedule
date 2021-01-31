'use strict';

const test = require('tape');
const sinon = require('sinon');
const schedule = require('..');

test("start-end", function (t) {
  let clock
  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test('RecurrenceRule', function(t) {
    t.test('no endTime , startTime less than now', function (test) {
      test.plan(3);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      const rule = new schedule.RecurrenceRule();
      rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: rule
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no endTime , startTime greater than now', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      const rule = new schedule.RecurrenceRule();
      rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: rule
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
    t.test('no startTime , endTime less than now', function (test) {
      test.plan(0);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      const rule = new schedule.RecurrenceRule();
      rule.second = null; // every second

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: rule
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
    t.test('no startTime , endTime greater than now', function (test) {
      test.plan(2);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      const rule = new schedule.RecurrenceRule();
      rule.second = null; // every second

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: rule
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
    t.test('has startTime and endTime', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      const rule = new schedule.RecurrenceRule();
      rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: rule
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
  })

  t.test('Object Literal', function(t) {
    t.test('no endTime , startTime less than now', function (test) {
      test.plan(3);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: { second: null }
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no endTime , startTime greater than now', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: { second: null }
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no startTime , endTime less than now', function (test) {
      test.plan(0);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: { second: null }
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no startTime , endTime greater than now', function (test) {
      test.plan(2);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: { second: null }
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('has startTime and endTime', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: { second: null }
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
  })
  t.test('cron-style', function(t) {
    t.test('no endTime , startTime less than now', function (test) {
      test.plan(3);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: '*/1 * * * * *'
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no endTime , startTime greater than now', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *'
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no startTime , endTime less than now', function (test) {
      test.plan(0);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: '*/1 * * * * *'
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('no startTime , endTime greater than now', function (test) {
      test.plan(2);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *'
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })

    t.test('has startTime and endTime', function (test) {
      test.plan(1);

      const job = new schedule.Job(function () {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *'
      });

      setTimeout(function () {
        job.cancel();
        test.end();
      }, 3250);

      clock.tick(3250);
    })
  })

  t.test("Restore", function (t) {
    clock.restore();
    t.end()
  })
})
