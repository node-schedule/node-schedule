
'use strict';

const test = require('tape');
const sinon = require('sinon');
const main = require('../package.json').main;
const schedule = require('../' + main);

test(".scheduleJob(cron_expr, fn)", function (t) {
  let clock
  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test("Runs job every second", function (t) {
    t.plan(3);

    var timeout = 3 * 1000 + 150;

    var job = schedule.scheduleJob('* * * * * *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Runs job every minute", function (t) {
    t.plan(3);

    var timeout = 3 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 * * * * *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Runs job every hour", function (t) {
    t.plan(3);

    var timeout = 3 * 60 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 0 * * * *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Runs job every day", function (t) {
    t.plan(3);

    var timeout = 3 * 24 * 60 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 0 0 * * *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Runs job every week", function (t) {
    t.plan(3);

    var timeout = 3 * 7 * 24 * 60 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 0 0 * * 1', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Runs job every month", function (t) {
    t.plan(48);

    var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 0 0 1 * *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);

  })

  t.test("Runs job every year", function (t) {
    t.plan(4);

    var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000 + 150;

    var job = schedule.scheduleJob('0 0 0 1 1 *', function () {
      t.ok(true);
    });

    setTimeout(function () {
      job.cancel();
      t.end();
    }, timeout);

    clock.tick(timeout);
  })

  t.test("Restore", function (t) {
    clock.restore();
    t.end()
  })
})

