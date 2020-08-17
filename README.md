# WORK IN PROGRESS

**Do not use this library yet. It's functional, but alot remains until it's production ready.**

- [ ] Update test suite to comply with RRule instead of cron
- [x] Update the documentation
- [ ] Schedule jobs via object literal
- [ ] Support for RRuleSet
- [ ] Performance testing/optimizing

# Node Schedule RRule

This is an RRule version of Matt Patenaude's node-schedule.

The very nice core of Matt's library is kept in order to handle many scheduled jobs with only one timer.

This version has no cron functionality whatsoever. Dependencies on **cron-parser** and **cron-date** is exchanged for dependency on **rrule**.

## Why an RRule version?

RRule is a neat way to store recurrence definitions for use in iCal compatible applications. If you have iCal recurrances at the client side and need to trigger actions at the server for the very same recurrences (sending reminders etc) you will probably be better of using an RRule parser at the server instead of trying to convert your iCal stuff to cron stuff. Many times this isn't even possible because rrule can describe more complicated recurrences than cron.

## Caveats

RRule is well suited for calendar occurrences which often has an occurence-count of 10:s or 100:s, whereas cron is more suited for scheduling tasks server-side where occurrence count can be hudreds of thousands. In the calendar use case we might need to look at both past and future occurrences (when the user browses the calendar). In the server use case we only need to look forward.

The most called funtion in the rrule parser is `after()` which returns the next occurence after a given date. Rrule.js iterates all the way from the start date (dtstart) every time in order to calculate the next occurrence. This can be a real bottleneck for rules with a massive amount of occurences, for example where frequence is "every second".

In order to handle this bottleneck **node-schedule-rrule** pushes the start date (dtstart) of each RRule forward regularly in order to shorten the tail with occurrences we are not interested in. Altering dtstart needs to be done in a safe maner without compromising the rules, i.e. we cannot simply reset dtstart to `new Date()` without considering the rules.

## Usage

### Installation

```
npm install node-schedule-rrule
```

### Overview

Just like its' parent library, Node Schedule RRule is for time-based scheduling, not interval-based scheduling. While you can easily bend it to your will, if you only want to do something like "run this function every 5 minutes", you'll find `setInterval` much easier to use, and far more appropriate. But if you want to, say, "run this function at the :20
and :50 of every hour on the third Tuesday of every month," you'll find that Node Schedule RRule suits your needs better.

### Jobs and Scheduling

Every scheduled job in Node Schedule RRule is represented by a `Job` object. You can
create jobs manually, then execute the `schedule()` method to apply a schedule,
or use the convenience function `scheduleJob()` as demonstrated below.

`Job` objects are `EventEmitter`'s, and emit a `run` event after each execution.
They also emit a `scheduled` event each time they're scheduled to run, and a
`canceled` event when an invocation is canceled before it's executed (both events
receive a JavaScript date object as a parameter). Note that jobs are scheduled the
first time immediately, so if you create a job using the `scheduleJob()`
convenience method, you'll miss the first `scheduled` event, but you can query the
invocation manually (see below). Also note that `canceled` is the single-L American
spelling.

Jobs can be scheduled in any way RRule can be created, i.e.:

- with an iCal RFC compliant rrule string
- with an RRule object literal
- with a precreated RRule or RRuleSet

RRule library: https://github.com/jakubroztocil/rrule

### iCal RFC string

Easily create iCal strings with the rrule demo app: http://jakubroztocil.github.io/rrule/

N.B: if the demo app gives you a multiline iCal string you need to insert a newline char in the string, i.e. `\n`

Example:

```js
const schedule = require('node-schedule-rrule');

const j = schedule.scheduleJob(
  'DTSTART:20200815T092630\nRRULE:FREQ=SECONDLY;INTERVAL=1;WKST=MO;BYSECOND=30',
  function() {
    console.log('This will be logged every half minute, when the second hand is at 30');
  }
);
```

RRule also supports the BYSETPOS attribute, which makes it possible to schedule tasks for the last workday every month.

```js
const schedule = require('node-schedule-rrule');

const j = schedule.scheduleJob(
  'DTSTART:20200901T090000Z\nRRULE:FREQ=MONTHLY;INTERVAL=1;WKST=MO;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1',
  function() {
    console.log('This will be logged the last workday every month');
  }
);
```

### Object Literal Syntax

You'll need to install the rrule library if you want to use the RRule constants.

```js
const schedule = require('node-schedule-rrule');
const {RRule} = require('rrule');

const options = {
  freq: RRule.MONTHLY,
  dtstart: new Date(Date.UTC(2020, 8, 1, 9, 0, 0)),
  interval: 1,
  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
  bysetpos: [-1],
};

const j = schedule.scheduleJob(options, function() {
  console.log('This will be logged the last workday every month');
});
```

### Handle Jobs and Job Invocations

There are some function to get information for a Job and to handle the Job and
Invocations.

#### job.cancel(reschedule)

You can invalidate any job with the `cancel()` method:

```js
j.cancel();
```

All planned invocations will be canceled. When you set the parameter **_reschedule_**
to true then the Job is newly scheduled afterwards.

#### job.cancelNext(reschedule)

This method invalidates the next planned invocation or the job.
When you set the parameter **_reschedule_** to true then the Job is newly scheduled
afterwards.

#### job.reschedule(spec)

This method cancels all pending invocation and registers the Job completely new again using the given specification.
Return true/false on success/failure.

#### job.nextInvocation()

This method returns a Date object for the planned next Invocation for this Job. If no invocation is planned the method returns null.

## Copyright and license

Core functionality: Copyright 2015 Matt Patenaude.

RRule implementation: Copyright 2020 Michael Sageryd

Licensed under the **[MIT License][license]**.

## Repo

Instead of just copying the original code and start over I've left this repo as a fork in order to keep the credits where credits are due. That said, I have cleaned up the repo somewhat by removing old branches and tags.

## Links

[Brian Moeskau on recurrences](https://github.com/bmoeskau/Extensible/blob/master/recurrence-overview.md)

[RRule](https://github.com/jakubroztocil/rrule)

[RRule demo](http://jakubroztocil.github.io/rrule/)
