var sinon = require('sinon');
var main = require('../package.json').main;
var schedule = require('../' + main);

var clock;

module.exports = {
  setUp: function(cb) {
    clock = sinon.useFakeTimers();
    cb();
  },
  "Date string": {
    "Should accept a valid date string": function(test) {
      test.expect(1);

      schedule.scheduleJob(new Date(Date.now() + 1000).toString(), function() {
        test.ok(true);
      });

      setTimeout(function() {
        test.done();
      }, 1250);

      clock.tick(1250);
    }
  },
  tearDown: function(cb) {
    clock.restore();
    cb();
  }
};
