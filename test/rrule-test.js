'use strict';

const test = require('tape');
const sinon = require('sinon');
const { RRule } = require('rrule');
const main = require('../package.json').main;
const schedule = require('../' + main);

let clock;

test(".scheduleJob(RRule String, fn)", function(t) {
  t.test("Runs job every second", function(test) {
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 1000;
    const rrule = new RRule({
      freq: RRule.SECONDLY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every minute", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.MINUTELY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every hour", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.HOURLY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every day", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.DAILY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every week", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 7 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.WEEKLY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every month", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(48);

    const timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: 1
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every year", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(4);

    const timeout = 4 * (365.25 * (24 * (60 * (60 * 1000))));
    const rrule = new RRule({
      freq: RRule.YEARLY
    }).toString();
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

});

test(".scheduleJob(RRule, fn)", function(t) {
  t.test("Runs job every second", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3)

    const timeout = 3 * 1000;
    const rrule = new RRule({
      freq: RRule.SECONDLY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every minute", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.MINUTELY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every hour", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.HOURLY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every day", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.DAILY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every week", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(3);

    const timeout = 3 * 7 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.WEEKLY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every month", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(48);

    const timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: 1
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

  t.test("Runs job every year", function(test) {
    clock.restore();
    const now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    test.plan(4);

    const timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;
    const rrule = new RRule({
      freq: RRule.YEARLY
    });
    const job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    clock.tick(timeout);
    job.cancel();
    test.end();
  });

});
