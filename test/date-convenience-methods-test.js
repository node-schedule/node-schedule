var sinon = require('sinon');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;

module.exports = {
  setUp: function(cb) {
    clock = sinon.useFakeTimers();
    cb();
  },
  "Date Enhancements": {
    "Should Not add date convenience methods unless explicitly specified": function(test) {
      test.ok(typeof Date.addYear !== 'function');
      test.ok(typeof Date.addMonth !== 'function');
      test.ok(typeof Date.addDay !== 'function');
      test.ok(typeof Date.addHour !== 'function');
      test.ok(typeof Date.addMinute !== 'function');
      test.ok(typeof Date.addSecond !== 'function');
      test.done();
    },
    "Should add date convenience methods when explicitly specified": function(test) {
      schedule.addDateConvenienceMethods(Date);
      test.ok(typeof Date.addYear === 'function');
      test.ok(typeof Date.addMonth === 'function');
      test.ok(typeof Date.addDay === 'function');
      test.ok(typeof Date.addHour === 'function');
      test.ok(typeof Date.addMinute === 'function');
      test.ok(typeof Date.addSecond === 'function');
      test.done();
    }
  },
  "Date string": {
    "Should accept a valid date string": function(test) {
      test.expect(1);

      schedule.scheduleJob(new Date(Date.now() + 1000).toString(), function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.done();
      }, 1250);

      clock.tick(1250);
    }
  },
  tearDown: function(cb) {
    clock.restore();
    cb();
  }
};
