import test from 'tape';
import * as sinon from 'sinon';

import { scheduleJob } from "../lib/schedule";

test("Date methods", function (t) {
  let clock: sinon.SinonFakeTimers;

  t.test("Setup", function (t) {
    clock = sinon.useFakeTimers();
    t.end()
  })

  t.test("Date string", function (t) {

    t.test("Should accept a valid date string", function(test) {
      test.plan(1);

      scheduleJob(new Date(Date.now() + 1000).toString(), function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.end();
      }, 1250);

      clock.tick(1250);
    })

    t.test("Should not accept invalid string as valid date", function(test) {
      test.plan(1);

      const job = scheduleJob('hello!!', function () {
      });

      test.equal(job, null);
      test.end();

    })
  })

  t.test("UTC", function (t) {
    t.test("Should accept a valid UTC date in milliseconds", function(test) {
      test.plan(1);

      scheduleJob(new Date(Date.now() + 1000).getTime(), function() {
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
