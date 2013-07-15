var main = require('../package.json').main;
var schedule = require('../' + main);

module.exports = {
	"just run": function(test) {
		test.ok(true);

		test.done();
	}
}