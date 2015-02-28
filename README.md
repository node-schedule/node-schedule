# node-schedule

node-schedule is a flexible both cron-like and not-cron-like job scheduler for Node.js. It allows you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute), and is MIT-licensed (see below).

node-schedule is for time-based scheduling, not interval-based scheduling. While you can easily bend it to your will, if you only want to do something like "run this function every 5 minutes", you'll find `setInterval` much easier to use, and far more appropriate. But if you want to, say, "run this function at the :20 and :50 of every hour on the third Tuesday of every month," you'll find that node-schedule suits your needs better. Additionally, node-schedule has Windows support unlike true cron since the node runtime is now fully supported.

Note that node-schedule is designed for in-process scheduling, i.e. scheduled jobs will only fire as long as your script is running, and the schedule will disappear when execution completes. If you need to schedule jobs that will persist even when your script *isn't* running, consider using the actual [cron].


## Usage

Check out our wonderful [wiki] for usage instructions.


## Contributing

We're committed to a loosely-coupled architecture for node-schedule and would love to get your contributions.

Before jumping in, check out our **[Contributing] [contributing]** page on the wiki!


## Copyright and license

node-schedule is copyright 2011 Matt Patenaude.

Licensed under the **[MIT License] [license]** (the "License");
you may not use this software except in compliance with the License.

[cron]: http://unixhelp.ed.ac.uk/CGI/man-cgi?crontab+5
[wiki]: https://github.com/mattpat/node-schedule/wiki
[contributing]: https://github.com/mattpat/node-schedule/blob/master/CONTRIBUTING.md
[license]: https://github.com/mattpat/node-schedule/blob/master/LICENSE
