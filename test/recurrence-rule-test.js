
'use strict';

const test = require('tape');
const sinon = require('sinon');
const main = require('../package.json').main;
const schedule = require('../' + main);

// 12:30:15 pm Thursday 29 April 2010 in the timezone this code is being run in
const base = new Date(2010, 3, 29, 12, 30, 15, 0);
const baseMs = base.getTime();

test("Recurrence rule", function (t) {
  let clock
  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test("#nextInvocationDate(Date)", function (t) {
    t.test("next second", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = null;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 12, 30, 16, 0), next);
      test.end();
    })

    t.test("next 25th second", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 25;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 12, 30, 25, 0), next);
      test.end();
    })

    t.test("next 5th second (minutes incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 5;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 12, 31, 5, 0), next);
      test.end();
    })

    t.test("next 40th minute", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.minute = 40;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 12, 40, 0, 0), next);
      test.end();
    })

    t.test("next 1st minute (hours incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.minute = 1;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 13, 1, 0, 0), next);
      test.end();
    })

    t.test("next 23rd hour", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.hour = 23;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 29, 23, 0, 0, 0), next);
      test.end();
    })

    t.test("next 3rd hour (days incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.hour = 3;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 30, 3, 0, 0, 0), next);
      test.end();
    })

    t.test("next Friday", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = 5;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 30, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("next Monday (months incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = 1;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 4, 3, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("next 30th date", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.date = 30;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 30, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("next 5th date (months incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.date = 5;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 4, 5, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("next October", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.month = 9;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 9, 1, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("next February (years incremented)", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.month = 1;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2011, 1, 1, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("in the year 2040", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.year = 2040;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2040, 0, 1, 0, 0, 0, 0), next);
      test.end();
    })

    t.test("using past year", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.year = 2000;

      var next = rule.nextInvocationDate(base);

      test.equal(null, next);
      test.end();
    })

    t.test("using mixed time components", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 50;
      rule.minute = 5;
      rule.hour = 10;

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 30, 10, 5, 50, 0), next);
      test.end();
    })
    /*
    "using date and dayOfWeek together", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = 4; // This is Thursday April 1st
      rule.date = 10;   // This is Saturday April 10th

      var next = rule.nextInvocationDate(base);

      test.deepEqual(new Date(2010, 3, 1, 0, 0, 0, 0), next);
      test.end();
    }*/

    t.test("returns null when no invocations left", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.year = 2000;

      var next = rule.nextInvocationDate(base);

      test.strictEqual(null, next);
      test.end();
    })

    t.test("specify span of components using Range", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.minute = new schedule.Range(4, 6);

      var next;

      next = rule.nextInvocationDate(base);
      test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 5, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 14, 4, 0, 0), next);

      test.end();
    })

    t.test("specify intervals within span of components using Range with step", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.minute = new schedule.Range(4, 8, 2);

      var next;

      next = rule.nextInvocationDate(base);
      test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

      /* Should Range stay inclusive on both ends when step > 1
      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 8, 0, 0), next);
      */

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 14, 4, 0, 0), next);

      test.end();
    })

    t.test("specify span and explicit components using Array of Ranges and Numbers", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.minute = [2, new schedule.Range(4, 6)];

      var next;

      next = rule.nextInvocationDate(base);
      test.deepEqual(new Date(2010, 3, 29, 13, 2, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 5, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2010, 3, 29, 14, 2, 0, 0), next);

      test.end();
    })

    t.test("From 31th May schedule the 1st of every June", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 0;
      rule.minute = 0;
      rule.hour = 0;
      rule.date = 1;
      rule.month = 5;

      var next;
      var base1 = new Date(2010, 4, 31, 12, 30, 15, 0);

      next = rule.nextInvocationDate(base1);
      test.deepEqual(new Date(2010, 5, 1, 0, 0, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.deepEqual(new Date(2011, 5, 1, 0, 0, 0, 0), next);

      test.end();
    })

    t.test("With the year set should not loop indefinetely", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 0;
      rule.minute = 0;
      rule.hour = 0;
      rule.date = 1;
      rule.month = 5;
      rule.year = 2010;

      var next;
      var base1 = new Date(2010, 4, 31, 12, 30, 15, 0);

      next = rule.nextInvocationDate(base1);
      test.deepEqual(new Date(2010, 5, 1, 0, 0, 0, 0), next);

      next = rule.nextInvocationDate(next);
      test.equal(next, null);

      test.end();
    })

    t.test("using rule with string properties", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = '50';
      rule.minute = '5';
      rule.hour = '10';
      var next = rule.nextInvocationDate(base);
      test.deepEqual(new Date(2010, 3, 30, 10, 5, 50, 0), next);
      test.end();
    })

    t.test("nextInvocationDate on an invalid month should return null", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.month = 12;
      var next = rule.nextInvocationDate();
      test.equal(next, null);

      var rule2 = new schedule.RecurrenceRule();
      rule2.month = 'asdfasdf';
      var next2 = rule2.nextInvocationDate(next);
      test.equal(next2, null);

      test.end();
    })

    t.test("nextInvocationDate on an invalid second should return null", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.second = 60;
      var next = rule.nextInvocationDate();
      test.equal(next, null);

      var rule2 = new schedule.RecurrenceRule();
      rule2.second = 'asdfasdf';
      var next2 = rule2.nextInvocationDate();
      test.equal(next2, null);

      test.end();
    })

    t.test("nextInvocationDate on an invalid hour should return null", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.hour = 24;
      var next = rule.nextInvocationDate();
      test.equal(next, null);

      var rule2 = new schedule.RecurrenceRule();
      rule2.hour = 'asdfasdf';
      var next2 = rule2.nextInvocationDate();
      test.equal(next2, null);

      test.end();
    })

    t.test("nextInvocationDate on an invalid date should return null", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.date = 90;
      var next = rule.nextInvocationDate();
      test.equal(next, null);

      // Test February
      var rule2 = new schedule.RecurrenceRule();
      rule2.month = 1;
      rule2.date = 30;
      var next2 = rule2.nextInvocationDate();
      test.equal(next2, null);

      var rule3 = new schedule.RecurrenceRule();
      rule3.date = 'asdfasdf';
      var next3 = rule3.nextInvocationDate();
      test.equal(next3, null);

      test.end();
    })

    t.test("nextInvocationDate on an invalid dayOfWeek should return null", function(test) {
      var rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = 90;
      var next = rule.nextInvocationDate();
      test.equal(next, null);

      var rule2 = new schedule.RecurrenceRule();
      rule2.dayOfWeek = 'asdfasdf';
      var next2 = rule.nextInvocationDate();
      test.equal(next2, null);

      test.end();
    })
  })

  t.test("Restore", function (t) {
    clock.restore();
    t.end()
  })
})
