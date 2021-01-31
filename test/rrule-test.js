const test = require('tape');
const sinon = require('sinon');
const { RRule } = require('rrule');
const main = require('../package.json').main;
const schedule = require('../' + main);

let clock;
test(".scheduleJob(RRule String, fn)", function(t) {
  test('setup', function(t){
    let now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    t.end();
  });

  test("teardown", function(t) {
      clock.restore();
      t.end();
  });
    
  t.test("Runs job every second", function(test) {
    test.expect(3);

    let timeout = 3 * 1000;
    let rrule = new RRule({
        freq: RRule.SECONDLY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
    test.end()
  });

  t.test("Runs job every minute", function(test) {
    test.expect(3);

    let timeout = 3 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.MINUTELY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every hour", function(test) {
    test.expect(3);

    let timeout = 3 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.HOURLY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every day", function(test) {
    test.expect(3);

    let timeout = 3 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.DAILY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every week", function(test) {
    test.expect(3);

    let timeout = 3 * 7 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.WEEKLY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every month", function(test) {
    test.expect(48);

    let timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: 1
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);

  });

  t.test("Runs job every year", function(test) {
    test.expect(4);

    let timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.YEARLY
    }).toString();

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });
});

test(".scheduleJob(RRule, fn)", function(t){
  test("setup", function(t) {
    let now = Date.now();
    clock = sinon.useFakeTimers();
    clock.tick(now);
    t.end();
  });

  test('teardown', function(t) {
    clock.restore();
    t.end();
  });

  t.test("Runs job every second", function(test) {
    test.expect(3);

    let timeout = 3 * 1000;
    let rrule = new RRule({
        freq: RRule.SECONDLY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every minute", function(test) {
    test.expect(3);

    let timeout = 3 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.MINUTELY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every hour", function(test) {
    test.expect(3);

    let timeout = 3 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.HOURLY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every day", function(test) {
    test.expect(3);

    let timeout = 3 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.DAILY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every week", function(test) {
    test.expect(3);

    let timeout = 3 * 7 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.WEEKLY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });

  t.test("Runs job every month", function(test) {
    test.expect(48);

    let timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.MONTHLY,
      bymonthday: 1
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);

  });

  t.test("Runs job every year", function(test) {
    test.expect(4);

    let timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

    let rrule = new RRule({
      freq: RRule.YEARLY
    });

    let job = schedule.scheduleJob(rrule, function() {
      test.ok(true);
    });

    setTimeout(function() {
      job.cancel();
      test.end();
    }, timeout);

    clock.tick(timeout);
  });
});
