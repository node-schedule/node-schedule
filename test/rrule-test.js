var sinon = require('sinon');
const { RRule } = require('rrule');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;
module.exports = {
  ".scheduleJob(RRule String, fn)": {
    setUp: function(cb) {
      var now = Date.now();
      clock = sinon.useFakeTimers();
      clock.tick(now);
      cb();
    },
    "Runs job every second": function(test) {
      test.expect(3);

      var timeout = 3 * 1000;
      var rrule = new RRule({
          freq: RRule.SECONDLY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every minute": function(test) {
      test.expect(3);

      var timeout = 3 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.MINUTELY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every hour": function(test) {
      test.expect(3);

      var timeout = 3 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.HOURLY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every day": function(test) {
      test.expect(3);

      var timeout = 3 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.DAILY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every week": function(test) {
      test.expect(3);

      var timeout = 3 * 7 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.WEEKLY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every month": function(test) {
      test.expect(48);

      var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);

    },
    "Runs job every year": function(test) {
      test.expect(4);

      var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.YEARLY
      }).toString();

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    tearDown: function(cb) {
      clock.restore();
      cb();
    }
  },
  ".scheduleJob(RRule, fn)": {
    setUp: function(cb) {
      var now = Date.now();
      clock = sinon.useFakeTimers();
      clock.tick(now);
      cb();
    },
    "Runs job every second": function(test) {
      test.expect(3);

      var timeout = 3 * 1000;
      var rrule = new RRule({
          freq: RRule.SECONDLY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every minute": function(test) {
      test.expect(3);

      var timeout = 3 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.MINUTELY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every hour": function(test) {
      test.expect(3);

      var timeout = 3 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.HOURLY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every day": function(test) {
      test.expect(3);

      var timeout = 3 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.DAILY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every week": function(test) {
      test.expect(3);

      var timeout = 3 * 7 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.WEEKLY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    "Runs job every month": function(test) {
      test.expect(48);

      var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.MONTHLY,
        bymonthday: 1
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);

    },
    "Runs job every year": function(test) {
      test.expect(4);

      var timeout = 4 * 365.25 * 24 * 60 * 60 * 1000;

      var rrule = new RRule({
        freq: RRule.YEARLY
      });

      var job = schedule.scheduleJob(rrule, function() {
        test.ok(true);
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, timeout);

      clock.tick(timeout);
    },
    tearDown: function(cb) {
      clock.restore();
      cb();
    }
  }
};
