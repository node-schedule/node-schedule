'use strict';

const schedule = require('./schedule');
const {RRule, RRuleSet, rrulestr} = require('rrule');

const test = new RRule({
  freq: 5,
  count: 5,
  dtstart: new Date(),
});

const job = schedule.scheduleJob(
  'job XYZ',
  'DTSTART:20200817T080840\nRRULE:FREQ=SECONDLY;INTERVAL=1;WKST=MO;COUNT=3',
  function(d) {
    console.log(d);
  }
);

const job2 = schedule.scheduleJob(
  'job ABC',
  'DTSTART:20200815T092630\nRRULE:FREQ=SECONDLY;INTERVAL=2;WKST=MO',
  function(d) {
    console.log(d);
  }
);
