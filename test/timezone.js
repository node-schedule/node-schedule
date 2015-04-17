var sinon = require('sinon');
var time = require('time');
var schedule = require('../');

var clock;

module.exports = {
  setUp: function(cb) {
    /*
     * Setting the current date to Sun, 29 Mar 2015 01:59:59 in Europe/Madrid timezone
     * just 1 second before the time switch to summertime: it ticks to 03:00:00 instead of
     * 02:00:00
     */
    time.tzset('Europe/Madrid');
    var date = new Date('Sun, 29 Mar 2015 01:59:59 +0100');
    clock = sinon.useFakeTimers(date.getTime());
    cb();
  },
  "Schedule job at 3AM with no timezone set": {
    "Should fire just 1 after 2.5 secs": function(test) {
      test.expect(1);

      schedule.scheduleJob({ hour : 3, minute : 0 }, function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.done();
      }, 2500);

      clock.tick(2500);
    }
  },
  "Schedule job at 2AM with no timezone set": {
    "Should not fire after 2.5 secs": function(test) {
      test.expect(0);

      schedule.scheduleJob({ hour : 2, minute : 0 }, function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.done();
      }, 2500);

      clock.tick(2500);
    }
  },
  "Schedule job at 1AM with tz = UTC": {
    "Should fire just 1 after 2.5 secs": function(test) {
      test.expect(1);

      schedule.scheduleJob({ tz : 'UTC' }, { hour : 1, minute : 0 }, function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.done();
      }, 2500);

      clock.tick(2500);
    }
  },
  "Schedule multiple jobs in different timezones": {
    "Should work correctly independently": function(test) {
      var local; // at Madrid should fire at 3 AM
      var utc; // should fire at 1AM
      var dublin; // should fire at 2 AM
      var athens; // should fire at 4 AM

      test.expect(4);

      schedule.scheduleJob({ hour : 3, minute : 0 }, function() {
        local = true;
      });

      schedule.scheduleJob({ tz : 'UTC' }, { hour : 1, minute : 0 }, function() {
        utc = true;
      });

      schedule.scheduleJob({ tz : 'Europe/Dublin' }, { hour : 2, minute : 0 }, function() {
        dublin = true;
      });

      schedule.scheduleJob({ tz : 'Europe/Athens' }, { hour : 4, minute : 0 }, function() {
        athens = true;
      });

      setTimeout(function() {
        test.ok(local);
        test.ok(utc);
        test.ok(dublin);
        test.ok(athens);
        test.done();
      }, 2500);

      clock.tick(2500);
    }
  },
  tearDown: function(cb) {
    clock.restore();
    cb();
  }
};
