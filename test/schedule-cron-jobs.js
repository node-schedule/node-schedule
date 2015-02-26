var sinon = require('sinon');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;

module.exports = {
    ".scheduleJob(cron_expr, fn)": {
        setUp: function(cb) {
            clock = sinon.useFakeTimers();
            cb();
        },
        "Runs job every second": function(test) {
            test.expect(3);

            var timeout = 3 * 1000;

            var job = schedule.scheduleJob('* * * * * *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every minute": function(test) {
            test.expect(3);

            var timeout = 3 * 60 * 1000;

            var job = schedule.scheduleJob('0 * * * * *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every hour": function(test) {
            test.expect(3);

            var timeout = 3 * 60 * 60 * 1000;

            var job = schedule.scheduleJob('0 0 * * * *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every day": function(test) {
            test.expect(3);

            var timeout = 3 * 24 * 60 * 60 * 1000;

            var job = schedule.scheduleJob('0 0 0 * * *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every week": function(test) {
            test.expect(3);

            var timeout = 3 * 7 * 24 * 60 * 60 * 1000;

            var job = schedule.scheduleJob('0 0 0 * * 1', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every month": function(test) {
            test.expect(3);

            var timeout = 3 * 31 * 24 * 60 * 60 * 1000;

            var job = schedule.scheduleJob('0 0 0 1 * *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        "Runs job every year": function(test) {
            test.expect(3);

            var timeout = 3 * 366 * 24 * 60 * 60 * 1000;

            var job = schedule.scheduleJob('0 0 0 1 1 *', function() {
                test.ok(true);
            });

            setTimeout(function() {
                job.cancel();
                test.done();
            }, timeout);

            clock.tick(timeout);
        },
        tearDown: function(cb) {
            console.log('restore');
            clock.restore();
            cb();
        }
    }
};
