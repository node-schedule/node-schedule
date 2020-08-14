'use strict';

var sinon = require('sinon');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;

const RR_EVERY_SECOND = 'DTSTART;TZID=America/Adak:20200803T190600\nRRULE:FREQ=SECONDLY;WKST=MO';
const RR_EVERY_MINUTE = 'DTSTART;TZID=America/Adak:20200803T190600\nRRULE:FREQ=MINUTELY;WKST=MO';
const RR_UNTIL_1960 =
  'DTSTART;TZID=America/Adak:19600803T190600\nRRULE:FREQ=SECONDLY;UNTIL=19600803T190700;WKST=MO';

module.exports = {
  setUp: function(cb) {
    clock = sinon.useFakeTimers();
    cb();
  },
  RecurrenceRule: {
    'no endTime , startTime less than now': function(test) {
      test.expect(3);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      var rule = new schedule.RecurrenceRule(RR_EVERY_SECOND);
      // rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: rule,
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no endTime , startTime greater than now': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      var rule = new schedule.RecurrenceRule(RR_EVERY_SECOND);
      // rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: rule,
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime less than now': function(test) {
      test.expect(0);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      var rule = new schedule.RecurrenceRule(RR_EVERY_SECOND);
      // rule.second = null; // every second

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: rule,
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime greater than now': function(test) {
      test.expect(2);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      var rule = new schedule.RecurrenceRule(RR_EVERY_SECOND);
      // rule.second = null; // every second

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: rule,
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'has startTime and endTime': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      var rule = new schedule.RecurrenceRule(RR_EVERY_SECOND);
      // rule.second = null; // every second

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: rule,
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
  },
  'Object Literal': {
    'no endTime , startTime less than now': function(test) {
      test.expect(3);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: {second: null},
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no endTime , startTime greater than now': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: {second: null},
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime less than now': function(test) {
      test.expect(0);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: {second: null},
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime greater than now': function(test) {
      test.expect(2);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: {second: null},
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'has startTime and endTime': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: {second: null},
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
  },
  'cron-style': {
    'no endTime , startTime less than now': function(test) {
      test.expect(3);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() - 2000),
        rule: '*/1 * * * * *',
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no endTime , startTime greater than now': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *',
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime less than now': function(test) {
      test.expect(0);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() - 2000),
        rule: '*/1 * * * * *',
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'no startTime , endTime greater than now': function(test) {
      test.expect(2);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        end: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *',
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
    'has startTime and endTime': function(test) {
      test.expect(1);

      var job = new schedule.Job(function() {
        test.ok(true);
      });

      job.schedule({
        start: new Date(Date.now() + 1000),
        end: new Date(Date.now() + 2000),
        rule: '*/1 * * * * *',
      });

      setTimeout(function() {
        job.cancel();
        test.done();
      }, 3250);

      clock.tick(3250);
    },
  },
  tearDown: function(cb) {
    clock.restore();
    cb();
  },
};
