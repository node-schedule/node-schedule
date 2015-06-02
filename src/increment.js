'use strict';

/*
  node-schedule
  A cron-like and not-cron-like job scheduler for Node.

  This file adds convenience functions for performing incremental date math
  in the Gregorian calendar.
*/

exports = module.exports.addDateConvenienceMethods = addDateConvenienceMethods;

function addDateConvenienceMethods(Date) {
  if (typeof Date.addYear !== 'function') {
    Date.addYear = function() {
      this.setFullYear(this.getFullYear() + 1);
    };

    Date.addMonth = function() {
      this.setMonth(this.getMonth() + 1);
    };

    Date.addDay = function() {
      this.setDate(this.getDate() + 1);
    };

    Date.addHour = function() {
      this.setTime(this.getTime() + (60 * 60 * 1000));
    };

    Date.addMinute = function() {
      this.setTime(this.getTime() + (60 * 1000));
    };

    Date.addSecond = function() {
      this.setTime(this.getTime() + 1000);
    };
  }
}
