
'use strict';

module.exports = function(schedule) {
  return {
    jobInGenerator: function(test) {
      test.plan(1);

      const job = new schedule.Job(function* () {
        test.ok(true);
      });

      job.runOnDate(new Date(Date.now() + 3000));

      setTimeout(function() {
        test.end();
      }, 3250);
    },
    jobContextInGenerator: function(test) {
      test.plan(1);

      const job = new schedule.Job('name of job', function* () {
        test.ok(this.name === 'name of job');
      });

      job.runOnDate(new Date(Date.now() + 3000));

      setTimeout(function() {
        test.end();
      }, 3250);
    }
  }
}
