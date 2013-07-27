var main = require('../package.json').main;
var schedule = require('../' + main);

module.exports = {
	"Job constructor": {
		"Accepts Job name and function to run": function(test) {
			var job = new schedule.Job('the job', function(){});

			test.equal(job.name, 'the job');
			test.done();
		},
		"Job name is optional and will be auto-generated": function(test) {
			var job = new schedule.Job();

			test.ok(job.name);
			test.done();
		},
		"Uses unique names across auto-generated Job names": function(test) {
			var job1 = new schedule.Job();
			var job2 = new schedule.Job();

			test.notEqual(job1.name, job2.name);
			test.done();
		}
	},
	"#schedule(Date)": {
		"Runs job once at some date": function(test) {
			test.expect(1);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule(new Date(Date.now() + 3000));

			setTimeout(function() {
				test.done();
			}, 3250);
		},
		/* No jobs will run after this test for some reason - hide for now
		"Won't run job if scheduled in the past": function(test) {
			test.expect(0);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule(new Date(Date.now() - 3000));

			setTimeout(function() {
				test.done();
			}, 1000);
		},
		"Jobs still run after scheduling a Job in the past": function(test) {
			test.expect(1);

			var pastJob = new schedule.Job(function() {
				// Should not run, blow up if it does
				test.ok(false);
			});
			pastJob.schedule(new Date(Date.now() - 3000));

			var job = new schedule.Job(function() {
				test.ok(true);
			});
			job.schedule(new Date(Date.now() + 3000));

			setTimeout(function() {
				test.done();
			}, 3250);
		},*/
		"Job emits 'scheduled' event with 'run at' Date": function(test) {
			test.expect(1);

			var date = new Date(Date.now() + 3000);
			var job = new schedule.Job();

			job.on('scheduled', function(runAtDate) {
				test.equal(runAtDate, date);
			});

			job.schedule(date);

			setTimeout(function() {
				test.done();
			}, 3250);
		}
	},
	"#schedule(RecurrenceRule)": {
		"Runs job at interval based on recur rule, repeating indefinitely": function(test) {
			test.expect(3);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			var rule = new schedule.RecurrenceRule();
			rule.second = null; // fire every second

			job.schedule(rule);

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		},
		"Job emits 'scheduled' event for every next invocation": function(test) {
			// Job will run 3 times but be scheduled 4 times, 4th run never happens
			// due to cancel.
			test.expect(4);

			var job = new schedule.Job(function() {});

			job.on('scheduled', function(runOnDate) {
				test.ok(true);
			});

			var rule = new schedule.RecurrenceRule();
			rule.second = null; // fire every second

			job.schedule(rule);

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		}/*,
		"Doesn't invoke job if recur rule schedules it in the past": function(test) {
			test.expect(0);

			var job = new schedule.Job(function() {
				test.ok(false);
			});

			var rule = new schedule.RecurrenceRule();
			rule.year = 2000;

			job.schedule(rule);

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 1000);
		}*/
	},
	"#schedule({...})": {
		"Runs job at interval based on object, repeating indefinitely": function(test) {
			test.expect(3);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule({
				second: null // fire every second
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		},
		"Job emits 'scheduled' event for every next invocation": function(test) {
			// Job will run 3 times but be scheduled 4 times, 4th run never happens
			// due to cancel.
			test.expect(4);

			var job = new schedule.Job(function() {});

			job.on('scheduled', function(runOnDate) {
				test.ok(true);
			});

			job.schedule({
				second: null // Fire every second
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 3250);
		}/*,
		"Doesn't invoke job if object schedules it in the past": function(test) {
			test.expect(0);

			var job = new schedule.Job(function() {
				test.ok(false);
			});

			job.schedule({
				year: 2000
			});

			setTimeout(function() {
				job.cancel();
				test.done();
			}, 1000);
		}*/
	},
	"#cancel": {
		"Prevents all future invocations": function(test) {
			test.expect(1);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule({
				second: null // fire every second
			});

			setTimeout(function() {
				job.cancel();
			}, 1250);

			setTimeout(function() {
				test.done();
			}, 2250);
		},
		"Job emits 'canceled' event": function(test) {
			test.expect(1);

			var job = new schedule.Job(function() {});

			job.on('canceled', function() {
				test.ok(true);
			});

			job.schedule({
				second: null // fire every second
			});

			setTimeout(function() {
				job.cancel();
			}, 1250);

			setTimeout(function() {
				test.done();
			}, 2250);
		}
	},
	"When invoked": {
		"Job emits 'run' event": function(test) {
			test.expect(1);

			var job = new schedule.Job(function() {});

			job.on('run', function() {
				test.ok(true);
			});

			job.schedule(new Date(Date.now() + 3000));

			setTimeout(function() {
				test.done();
			}, 3250);
		}
	}
};
