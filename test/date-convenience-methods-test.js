
'use strict';

const test = require('tape');
const sinon = require('sinon');
const schedule = require('../lib/schedule');

test("Date methods", function (t) {
  let clock
  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test("Date string", function (t) {

    t.test("Should accept a valid date string", function(test) {
      test.plan(1);

      schedule.scheduleJob(new Date(Date.now() + 1000).toString(), function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.end();
      }, 1250);

      clock.tick(1250);
    })

    t.test("Should not accept invalid string as valid date", function(test) {
      test.plan(1);

      const job = schedule.scheduleJob('hello!!', function () {
      });

      test.equal(job, null);
      test.end();

    })
  })

  t.test("UTC", function (t) {
    t.test("Should accept a valid UTC date in milliseconds", function(test) {
      test.plan(1);

      schedule.scheduleJob(new Date(Date.now() + 1000).getTime(), function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.end();
      }, 1250);

      clock.tick(1250);
    })
  })

  t.test("Restore", function (t) {
    clock.restore();
    t.end()
  })
})
