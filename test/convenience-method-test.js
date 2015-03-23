var sinon = require('sinon');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;

module.exports = {
  setUp: function(cb) {
    clock = sinon.useFakeTimers();
    cb();
  },
  ".scheduleJob": {
    "Returns Job instance": function(test) {
      var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

      test.ok(job instanceof schedule.Job);

      job.cancel();
      test.done();
    },
    "Job ids are incremental": function(test) {
      // Create 4 new jobs
      var job1 = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});
      var job2 = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});
      var job3 = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});
      var job4 = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

      var jobsKeys = Object.keys(schedule.scheduledJobs);

      // Sort numbers function
      function sortNumber(a, b) {
        return a - b;
      }

      test.expect(5);

      // Sort it just to be sure
      jobsKeys = jobsKeys.sort(sortNumber);

      // Get the first job id
      // we want to check that it
      // increments from this id
      var id = job1.id;

      // Get index of the keys arrays of job1 id
      var index = jobsKeys.indexOf(id.toString());

      test.ok(index >= 0);

      // Check if ids are incremental
      for (var i = 0; i < 4; i++) {
        test.ok(parseInt(jobsKeys[index], 10) === id);
        index++;
        id++;
      }

      // Cancel the jobs we created in
      // this test
      job1.cancel();
      job2.cancel();
      job3.cancel();
      job4.cancel();

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

      clock.tick(3250);
    },
    "Job doesn't emit initial 'scheduled' event": function(test) {
        var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

        job.on('scheduled', function() {
          test.ok(false);
        });

        setTimeout(function() {
          test.done();
        }, 1250);

        clock.tick(1250);
      }
      /*,
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

      clock.tick(3250);
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

        clock.tick(3250);
      }
      /*,
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

      clock.tick(3250);
    },
    "Job doesn't emit initial 'scheduled' event": function(test) {
        /*
         * With Job#schedule this would be 3:
         *  scheduled at time 0
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

        clock.tick(2250);
      },
      /*,
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

      clock.tick(3250);
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

      clock.tick(3250);
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

      clock.tick(1250);
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

      clock.tick(3250);
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

      clock.tick(1250);
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

      clock.tick(3250);
    }
  },
  '.pendingInvocations()': {
    "Retrieves pendingInvocations of the job": function(test) {
      var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

      test.ok(job instanceof schedule.Job);
      test.ok(job.pendingInvocations()[0].job);

      job.cancel();
      test.done();
    }
  },
  '.getJob(id)': {
    "Retrieve a specific job from an id": function(test) {
      var job = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});

      var jobCopy = schedule.getJob(job.id);

      test.deepEqual(job, jobCopy);

      // Get job with a string "number"
      var jobCopy2 = schedule.getJob(job.id.toString());

      test.deepEqual(job, jobCopy2);

      job.cancel();
      test.done();
    },
    "Retrieve a specific job from a name": function(test) {
      var job = schedule.scheduleJob('specific-job-name', new Date(Date.now() + 1000), function() {});

      var jobCopy = schedule.getJob(job.name);

      test.deepEqual(job, jobCopy);

      job.cancel();
      test.done();
    },
    "Priority on getJob": function(test) {
      var job0 = schedule.scheduleJob(new Date(Date.now() + 1000), function() {});
      var job1 = schedule.scheduleJob('0', '5 * * * *', function() {});

      // this will get the job with the name '0'
      // not the job with the id 0
      // This is the priority of the getJob
      var jobCopy = schedule.getJob('0');

      test.deepEqual(job1, jobCopy);

      job0.cancel();
      job1.cancel();

      test.done();
    }
  },
  tearDown: function(cb) {
    clock.restore();
    cb();
  }
};
