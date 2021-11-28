# Node Schedule

[![NPM version](http://img.shields.io/npm/v/node-schedule.svg)](https://www.npmjs.com/package/node-schedule)
[![Downloads](https://img.shields.io/npm/dm/node-schedule.svg)](https://www.npmjs.com/package/node-schedule)
[![Build Status](https://github.com/node-schedule/node-schedule/workflows/ci/badge.svg)](https://github.com/node-schedule/node-schedule/actions)
[![Coverage Status](https://coveralls.io/repos/node-schedule/node-schedule/badge.svg?branch=master)](https://coveralls.io/r/node-schedule/node-schedule?branch=master)
[![Join the chat at https://gitter.im/node-schedule/node-schedule](https://img.shields.io/badge/gitter-chat-green.svg)](https://gitter.im/node-schedule/node-schedule?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![NPM](https://nodei.co/npm/node-schedule.png?downloads=true)](https://nodei.co/npm/node-schedule/)

Node Schedule is a flexible cron-like and not-cron-like job scheduler for Node.js.
It allows you to schedule jobs (arbitrary functions) for execution at
specific dates, with optional recurrence rules. It only uses a single timer
at any given time (rather than reevaluating upcoming jobs every second/minute).

Node 6+ is supported.

## Overview

Node Schedule is for time-based scheduling, not interval-based scheduling.

While you can easily bend it to your will, if you only want to do something like
"run this function every 5 minutes", [toad-scheduler](https://github.com/kibertoad/toad-scheduler) would be a better choice. But if you want to, say, "run this function at the :20
and :50 of every hour on the third Tuesday of every month," you'll find that
Node Schedule suits your needs better. Additionally, Node Schedule has Windows
support, unlike true `cron`, since the node runtime is now fully supported.

Note that Node Schedule is designed for in-process scheduling, i.e. scheduled jobs
will only fire as long as your script is running, and the schedule will disappear
when execution completes. If you need to schedule jobs that will persist even when
your script *isn't* running, consider using actual [cron].

In case you need durable jobs that persist across restarts and lock system compatible with multi-node deployments,
try [agenda](https://github.com/agenda/agenda) or [bree](https://github.com/breejs/bree).

## Usage

### Installation

You can install using [npm](https://www.npmjs.com/package/node-schedule).

```
npm install node-schedule
```


### Jobs and Scheduling

Every scheduled job in Node Schedule is represented by a `Job` object. You can
create jobs manually, then execute the `schedule()` method to apply a schedule,
or use the convenience function `scheduleJob()` as demonstrated below.

`Job` objects are `EventEmitter`s, and emit the following events:
* A `run` event after each execution.
* A `scheduled` event each time they're scheduled to run.
* A `canceled` event when an invocation is canceled before it's executed.  
  Note that `canceled` is the single-L American spelling.
* An `error` event when a job invocation triggered by a schedule throws or returns
  a rejected `Promise`.
* A `success` event when a job invocation triggered by a schedule returns successfully or
  returns a resolved `Promise`. In any case, the `success` event receives the value returned
  by the callback or in case of a promise, the resolved value.

(Both the `scheduled` and `canceled` events receive a JavaScript date object as
a parameter).  
Note that jobs are scheduled the first time immediately, so if you create a job
using the `scheduleJob()` convenience method, you'll miss the first `scheduled`
event, but you can query the invocation manually (see below).

### Cron-style Scheduling

The cron format consists of:
```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

Examples with the cron format:

```js
const schedule = require('node-schedule');

const job = schedule.scheduleJob('42 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});
```

Execute a cron job when the minute is 42 (e.g. 19:42, 20:42, etc.).

And:

```js
const job = schedule.scheduleJob('0 17 ? * 0,4-6', function(){
  console.log('Today is recognized by Rebecca Black!');
});
```

Execute a cron job every 5 Minutes = */5 * * * *

You can also get when it is scheduled to run for every invocation of the job:
```js
const job = schedule.scheduleJob('0 1 * * *', function(fireDate){
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
});
```
This is useful when you need to check if there is a delay of the job invocation when the system is busy, or save a record of all invocations of a job for audit purpose.
#### Unsupported Cron Features

Currently, `W` (nearest weekday) and `L` (last day of month/week) are not supported. 
Most other features supported by popular cron implementations should work just fine, 
including `#` (nth weekday of the month).

[cron-parser] is used to parse crontab instructions.

### Date-based Scheduling

Say you very specifically want a function to execute at 5:30am on December 21, 2012.
Remember - in JavaScript - 0 - January, 11 - December.

```js
const schedule = require('node-schedule');
const date = new Date(2012, 11, 21, 5, 30, 0);

const job = schedule.scheduleJob(date, function(){
  console.log('The world is going to end today.');
});
```

To use current data in the future you can use binding:

```js
const schedule = require('node-schedule');
const date = new Date(2012, 11, 21, 5, 30, 0);
const x = 'Tada!';
const job = schedule.scheduleJob(date, function(y){
  console.log(y);
}.bind(null,x));
x = 'Changing Data';
```
This will log 'Tada!' when the scheduled Job runs, rather than 'Changing Data',
which x changes to immediately after scheduling.

### Recurrence Rule Scheduling

You can build recurrence rules to specify when a job should recur. For instance,
consider this rule, which executes the function every hour at 42 minutes after the hour:

```js
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.minute = 42;

const job = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
});
```

You can also use arrays to specify a list of acceptable values, and the `Range`
object to specify a range of start and end values, with an optional step parameter.
For instance, this will print a message on Thursday, Friday, Saturday, and Sunday at 5pm:

```js
const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;

const job = schedule.scheduleJob(rule, function(){
  console.log('Today is recognized by Rebecca Black!');
});
```

Timezones are also supported. Here is an example of executing at the start of every day in the UTC timezone.

```js
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';

const job = schedule.scheduleJob(rule, function(){
  console.log('A new day has begun in the UTC timezone!');
});
```

A list of acceptable tz (timezone) values can be found at <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>

#### RecurrenceRule properties

- `second (0-59)`
- `minute (0-59)`
- `hour  (0-23)`
- `date  (1-31)`
- `month (0-11)`
- `year`
- `dayOfWeek (0-6) Starting with Sunday`
- `tz`


> **Note**: It's worth noting that the default value of a component of a recurrence rule is
> `null` (except for second, which is 0 for familiarity with cron). *If we did not
> explicitly set `minute` to 0 above, the message would have instead been logged at
> 5:00pm, 5:01pm, 5:02pm, ..., 5:59pm.* Probably not what you want.

#### Object Literal Syntax

To make things a little easier, an object literal syntax is also supported, like
in this example which will log a message every Sunday at 2:30pm:

```js
const job = schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 0}, function(){
  console.log('Time for tea!');
});
```

#### Set StartTime and EndTime

It will run after 5 seconds and stop after 10 seconds in this example.
The ruledat supports the above.

```js
const startTime = new Date(Date.now() + 5000);
const endTime = new Date(startTime.getTime() + 5000);
const job = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
  console.log('Time for tea!');
});
```

### Graceful Shutdown.
You can shutdown jobs gracefully.  
`gracefulShutdown()` will cancel all jobs and return Promise.  
It will wait until all jobs are terminated.  
```js
schedule.gracefulShutdown();
```

You can also gracefully shutdown jobs when a system interrupt occurs.
```
process.on('SIGINT', function () { 
  schedule.gracefulShutdown()
  .then(() => process.exit(0))
}
```

### Handle Jobs and Job Invocations

There are some function to get information for a Job and to handle the Job and
Invocations.


#### job.cancel(reschedule)
You can invalidate any job with the `cancel()` method:

```js
j.cancel();
```
All planned invocations will be canceled. When you set the parameter ***reschedule***
to true then the Job is newly scheduled afterwards.

#### job.cancelNext(reschedule)
This method invalidates the next planned invocation or the job.
When you set the parameter ***reschedule*** to true then the Job is newly scheduled
afterwards.

#### job.reschedule(spec)
This method cancels all pending invocation and registers the Job completely new again using the given specification.
Return true/false on success/failure.

#### job.nextInvocation()
This method returns a Date object for the planned next Invocation for this Job. If no invocation is planned the method returns null.

## Contributing

This module was originally developed by [Matt Patenaude] who eventually passed over maintainer's mantle over to [Tejas Manohar].   

Currently it is being maintained by [Igor Savin] and [our amazing community].

We'd love to get your contributions. Individuals making significant and valuable
contributions are given commit-access to the project to contribute as they see fit.

Before jumping in, check out our [Contributing] page guide!

## Copyright and license

Copyright 2015 Matt Patenaude.

Licensed under the **[MIT License](https://github.com/node-schedule/node-schedule/blob/master/LICENSE)**.


[cron]: http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5
[Contributing]: https://github.com/node-schedule/node-schedule/blob/master/CONTRIBUTING.md
[Matt Patenaude]: https://github.com/mattpat
[Tejas Manohar]: http://tejas.io
[Igor Savin]: https://twitter.com/kibertoad
[our amazing community]: https://github.com/node-schedule/node-schedule/graphs/contributors
[cron-parser]: https://github.com/harrisiirak/cron-parser
