'use strict';

const test = require('tape');
const schedule = require('../lib/schedule');

test('Cancel Long Running Job', function (t) {

  t.test('should work even when recurring jobs are to be run on the past', function (t) {
    let ok = true;
    const job = schedule.scheduleJob('*/1 * * * * *', function () {
      t.ok(ok);
      const time = Date.now();
      while (ok && (Date.now() - time < 2000)) {
      }
    });

    t.ok(job);
    setTimeout(function () {
      job.cancel();
      t.end();
      ok = false;
    }, 2100);
  })
})
