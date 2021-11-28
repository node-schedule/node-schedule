'use strict';

const test = require('tape');
const schedule = require('..');

test('Graceful Shutdown', function (t) {
  t.test('close immediately when no job', function (test) {
    schedule.gracefulShutdown().then(function() {
      test.end();
    });
  });

  t.test('pending when job running', function (test) {
    test.plan(1);
    const job = schedule.scheduleJob('* * * * * *', function () {
    });
    
    job.running = 1;
    schedule.gracefulShutdown().then(function() {
      test.ok(true);
    });

    job.running = 0;
    schedule.gracefulShutdown().then(function() {
      test.ok(true);
      test.end();
    });
  });
});