
'use strict';

module.exports = function(schedule) {
  return {
    jobInGenerator: function(test) {
      test.expect(1);

      var job = new schedule.Job(function*() {
        test.ok(true);
      });

      job.runOnDate(new Date(Date.now() + 3000));

      setTimeout(function() {
        test.done();
      }, 3250);
    }
  }
}
