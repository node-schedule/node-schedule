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
    },
    "Convenience methods should add correct amount of time when called" : {
      "Should add year to date when addYear is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 1, 0, 0);

        schedule.addDateConvenienceMethods(date);
        
        date.addYear();
        test.deepEqual(date, new Date(2011, 3, 29, 13, 1, 0, 0));

        test.done();
      },
      "Should add month to date when addMonth is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 1, 0, 0);

        schedule.addDateConvenienceMethods(date);
        
        date.addMonth();
        test.deepEqual(date, new Date(2010, 4, 1, 0, 0, 0, 0));

        test.done();
      },
      "Should add day to date when addDay is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 1, 0, 0);

        schedule.addDateConvenienceMethods(date);
        
        date.addDay();
        test.deepEqual(date, new Date(2010, 3, 30, 0, 0, 0, 0));

        test.done();
      },
      "Should add minute to date when addHour is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 0, 0, 1);

        schedule.addDateConvenienceMethods(date);
        
        date.addHour();
        test.deepEqual(date, new Date(2010, 3, 29, 14, 0, 0, 1));

        test.done();
      },
      "Should add minute to date when addMinute is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 3, 3, 1);

        schedule.addDateConvenienceMethods(date);
        
        date.addMinute();
        test.deepEqual(date, new Date(2010, 3, 29, 13, 4, 0, 1));

        test.done();
      },
      "Should add second to date when addSecond is called": function(test) {
        var date = new Date(2010, 3, 29, 13, 3, 3, 1);

        schedule.addDateConvenienceMethods(date);
        
        date.addSecond();
        test.deepEqual(date, new Date(2010, 3, 29, 13, 3, 4, 1));

        test.done();
      },
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
