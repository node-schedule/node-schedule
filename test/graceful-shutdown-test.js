'use strict';

const test = require('tape');
const sinon = require('sinon');
const schedule = require('..');

test('Graceful Shutdown', function (t) {
  let clock, sandbox, exitStub;
  t.test('Setup', function (test) {
    clock = sinon.useFakeTimers();
    sandbox = sinon.createSandbox({ useFakeTimers: true });
    exitStub = sandbox.stub(process, 'exit');
    schedule.gracefulShutdown();
    test.end();
  });

  t.test('close immediately when no job', function (test) {
    process.once('SIGINT', function () { 
      sinon.assert.calledOnce(exitStub);
      test.end();
    });
    process.emit('SIGINT', null);
  });

  t.test('pending when job running', function (test) {
    const job = schedule.scheduleJob('* * * * * *', function () {
    });
    
    job.running = 1;
    process.once('SIGINT', function () {
      sinon.assert.calledOnce(exitStub);
    });
    process.emit('SIGINT', null);
    
    job.running = 0;
    process.once('SIGINT', function () {
      sinon.assert.calledTwice(exitStub);
      test.end();
    });
    process.emit('SIGINT', null);
  });

  t.test('Restore', function (test) {
    clock.restore();
    test.end()
  });
});