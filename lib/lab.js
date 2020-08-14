const schedule = require('./schedule');
const {RRule, RRuleSet, rrulestr} = require('rrule');

const test = new RRule({
  freq: 5,
  count: 5,
  dtstart: new Date(),
});

const job = schedule.scheduleJob('DTSTART:20200810T104340\nRRULE:FREQ=SECONDLY;WKST=MO', function(
  d
) {
  console.log('.' + d);
});

// const test2 = new RRule.fromString(
//   'DTSTART;TZID=America/Adak:20200814T111100\nRRULE:FREQ=SECONDLY;WKST=MO'
// );

// console.time(test2.after(new Date()));

// 'DTSTART;TZID=America/Adak:20200803T190600;RRULE:FREQ=SECONDLY;WKST=MO',
