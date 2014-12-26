node-schedule
=============

node-schedule is a flexible both cron-like and not-cron-like job scheduler for Node.js. It allows you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute), and is MIT-licensed (see below).

node-schedule is for time-based scheduling, not interval-based scheduling. While you can easily bend it to your will, if you only want to do something like "run this function every 5 minutes", you'll find `setInterval` much easier to use, and far more appropriate. But if you want to, say, "run this function at the :20 and :50 of every hour on the third Tuesday of every month," you'll find that node-schedule suits your needs better. Additionally, node-schedule has Windows support unlike true cron since the node runtime is now fully supported.

Note that node-schedule is designed for in-process scheduling, i.e. scheduled jobs will only fire as long as your script is running, and the schedule will disappear when execution completes. If you need to schedule jobs that will persist even when your script *isn't* running, consider using the actual [cron](http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5).


Jobs and Scheduling
-------------------

Every scheduled job in node-schedule is represented by a `Job` object. You can create jobs manually, then execute the `schedule()` method to apply a schedule, or use the convenience function `scheduleJob()` as demonstrated below.

`Job` objects are `EventEmitter`'s, and emit a `run` event after each execution. They also emit a `scheduled` event each time they're scheduled to run, and a `canceled` event when an invocation is canceled before it's executed (both events receive a JavaScript date object as a parameter). Note that jobs are scheduled the first time immediately, so if you create a job using the `scheduleJob()` convenience method, you'll miss the first `scheduled` event. Also note that `canceled` is the single-L American spelling.


Date-based Scheduling
---------------------

Say you very specifically want a function to execute at 5:30am on December 21, 2012.

```js
var schedule = require('node-schedule');
var date = new Date(2012, 12, 21, 5, 30, 0);

var j = schedule.scheduleJob(date, function(){
	console.log('The world is going to end today.');
});
```

You can invalidate the job with the `cancel()` method:

```js
j.cancel();
```


Recurrence Rule Scheduling
--------------------------

You can build recurrence rules to specify when a job should recur. For instance, consider this rule, which executes the function every hour at 42 minutes after the hour:

```js
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.minute = 42;

var j = schedule.scheduleJob(rule, function(){
	console.log('The answer to life, the universe, and everything!');
});
```

You can also use arrays to specify a list of acceptable values, and the `Range` object to specify a range of start and end values, with an optional step parameter. For instance, this will print a message on Thursday, Friday, Saturday, and Sunday at 5pm:

```js
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
	console.log('Today is recognized by Rebecca Black!');
});
```

It's worth noting that the default value of a component of a recurrence rule is `null` (except for seconds, which is 0 for familiarity with cron). If we did not explicitly set `minute` to 0 above, the message would have instead been logged at 5:00pm, 5:01pm, 5:02pm, ..., 5:59pm. Probably not what you want.

### Object Literal Syntax

To make things a little easier, an object literal syntax is also supported, like in this example which will log a message every Sunday at 2:30pm:

```js
var j = schedule.scheduleJob({hour: 14, minute: 30, dayOfWeek: 0}, function(){
	console.log('Time for tea!');
});
```


Cron-style Scheduling
---------------------

>The cron format consists of:
> `[MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]` 

If you're a fan of cron, you can instead define your recurrence rules using a syntax similar to what you might write in your crontab. For example, the above examples rewritten using this style:

```js
var schedule = require('node-schedule');

var j = schedule.scheduleJob('42 * * * *', function(){
	console.log('The answer to life, the universe, and everything!');
});
```

And:

```js
var j = schedule.scheduleJob('0 17 ? * 0,4-6', function(){
	console.log('Today is recognized by Rebecca Black!');
});
```

### Unsupported Cron Features

Currently, `W` (nearest weekday), `L` (last day of month/week), and `#` (nth weekday of the month) are not supported. Also, in the day-of-week field, 7 is currently not recognized as a legal value for Sunday (use 0). Most other features supported by popular cron implementations should work just fine.

It is also entirely possible at this point that constructing a cron string that can *only* exist in the past will cause an infinite loop. This is only possible if a year is specified. If the specified year is a number (i.e., not a range), node-schedule will perform a sanity check before attempting to schedule something in the past. [cron-parser](https://github.com/harrisiirak/cron-parser) is used to parse crontab instructions.


Installing
----------

You can install using [npm](https://www.npmjs.com/package/node-schedule) in the usual way.

```
npm install node-schedule
```


Acknowledgements
-----------------

This module was originally developed by [@mattpatt](https://github.com/mattpat) and is now maintained by [@tejasmanohar](https://github.com/tejasmanohar).

That said, we have a lot of contributors that help this project stay alive! Find a bug? File an issue! Know how to fix? Submit a PR!


License
-------

	Copyright (C) 2011 Matt Patenaude.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
