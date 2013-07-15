var main = require('../package.json').main;
var schedule = require('../' + main);

module.exports = {
	"Job constructor": {
		"Accepts Job name argument": function(test) {
			var job = new schedule.Job('the job');

			test.equal(job.name, 'the job');
			test.done();
		},
		"Auto-generates Job name if no name provided": function(test) {
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
		"Won't run job if scheduled in the past": function(test) {
			test.expect(0);

			var job = new schedule.Job(function() {
				test.ok(true);
			});

			job.schedule(new Date(Date.now() - 3000));

			setTimeout(function() {
				test.done();
			}, 3250);
		}
	}
}