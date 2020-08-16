'use strict';

const schedule = require('./schedule');
const {RRule, RRuleSet, rrulestr} = require('rrule');

const test = new RRule({
  freq: 5,
  count: 5,
  dtstart: new Date(),
});

const job = schedule.scheduleJob(
  'DTSTART:20200815T092630\nRRULE:FREQ=SECONDLY;INTERVAL=1;WKST=MO;BYSECOND=30',
  function(d) {
    console.log('...' + d);
  }
);
