var main = require('../package.json').main;
var schedule = require('../' + main);

module.exports = {
	".scheduleJob": {
		"Returns Job instance": function(test) {
			var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

			test.ok(job instanceof schedule.Job);

			job.cancel();
			test.done();
		}
	},
	".scheduleJob(Date, fn)": {
		"Runs job once at some date": function(test) {
			test.expect(1);

			schedule.scheduleJob(new Date(Date.now() + 3000), function() {
				test.ok(true);
			});

			setTimeout(function() {
				test.done();
			}, 3250);
		},
		"Job doesn't emit initial 'scheduled' event": function(test) {
			var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

			job.on('scheduled', function() {
				test.ok(false);
			});

			setTimeout(function() {
				test.done();
			}, 1250);
		}/*,
		"Won't run job if scheduled in the past": function(test) {
			schedule.scheduleJob(new Date(Date.now() - 3000), function() {
				test.ok(false);
			});

			setTimeout(function() {
				test.done();
			}, 1000);
		}*/
	},
	".scheduleJob(RecurrenceRule, fn)": {
		"Runs job at interval based on recur rule, repeating indefinitely": function(test) {
			test.expect(3);

			var rule = new schedule.RecurrenceRule();
			rule.second = null; // fire every second

			var job = schedule.scheduleJob(rule, function() {
				test.ok(true);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		},
		"Job doesn't emit initial 'scheduled' event": function(test) {
			/*
			 * If this was Job#schedule it'd fire 4 times.
			 */
			test.expect(3);

			var rule = new schedule.RecurrenceRule();
			rule.second = null; // fire every second

			var job = new schedule.scheduleJob(rule, function() {});

			job.on('scheduled', function(runOnDate) {
				test.ok(true);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		}/*,
		"Doesn't invoke job if recur rule schedules it in the past": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.year = 2000;

			var job = schedule.scheduleJob(rule, function() {
				test.ok(false);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 1000);
		}*/
	},
	".scheduleJob({...}, fn)": {
		"Runs job at interval based on object, repeating indefinitely": function(test) {
			test.expect(3);

			var job = new schedule.scheduleJob({
				second: null // Fire every second
			}, function() {
				test.ok(true);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		},
		"Job doesn't emit initial 'scheduled' event": function(test) {
			/*
			 * With Job#schedule this would be 3:
			 * 	scheduled at time 0
			 *  scheduled at time 1000
			 *  scheduled at time 2000
			 */
			test.expect(2);

			var job = schedule.scheduleJob({
				second: null // fire every second
			}, function() {});

			job.on('scheduled', function() {
				test.ok(true);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 2250);
		}/*,
		"Doesn't invoke job if object schedules it in the past": function(test) {
			var job = new schedule.scheduleJob({
				year: 2000
			}, function() {
				test.ok(false);
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 1000);
		}*/
	},
	".cancelJob(Job)": {
		"Prevents all future invocations of Job passed in": function(test) {
			test.expect(2);

			var job = schedule.scheduleJob({
				second: null
			}, function() {
				test.ok(true);
			});

			setTimeout(function() {
				schedule.cancelJob(job);
			}, 2250);

			setTimeout(function() {
				test.done();
			}, 3250);
		},
		"Can cancel Jobs scheduled with Job#schedule": function(test) {
			test.expect(2);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule({
				second: null
			});

			setTimeout(function() {
				schedule.cancelJob(job);
			}, 2250);

			setTimeout(function() {
				test.done();
			}, 3250);
		},
		"Job emits 'canceled' event": function(test) {
			test.expect(1);

			var job = schedule.scheduleJob({
				second: null
			}, function() {});

			job.on('canceled', function() {
				test.ok(true);
			});

			setTimeout(function() {
				schedule.cancelJob(job);
				test.done();
			}, 1250);
		}
	},
	'.cancelJob("job name")': {
		"Prevents all future invocations of Job identified by name": function(test) {
			test.expect(2);

			var job = schedule.scheduleJob({
				second: null
			}, function() {
				test.ok(true);
			});

			setTimeout(function() {
				schedule.cancelJob(job.name);
			}, 2250);

			setTimeout(function() {
				test.done();
			}, 3250);
		},
		/*
		"Can cancel Jobs scheduled with Job#schedule": function(test) {
			test.expect(2);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule({
				second: null
			});

			setTimeout(function() {
				schedule.cancelJob(job.name);
			}, 2250);

			setTimeout(function() {
				test.done();
			}, 3250);
		},*/
		"Job emits 'canceled' event": function(test) {
			test.expect(1);

			var job = schedule.scheduleJob({
				second: null
			}, function() {});

			job.on('canceled', function() {
				test.ok(true);
			});

			setTimeout(function() {
				schedule.cancelJob(job.name);
				test.done();
			}, 1250);
		},
		"Does nothing if no job found by that name": function(test) {
			test.expect(3);

			var job = schedule.scheduleJob({
				second: null
			}, function() {
				test.ok(true);
			});

			setTimeout(function() {
				// This cancel should not affect anything
				schedule.cancelJob('blah');
			}, 2250);

			setTimeout(function() {
				job.cancel(); // prevent tests from hanging
				test.done();
			}, 3250);
		}
	}
};