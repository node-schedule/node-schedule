var main = require('../package.json').main;
var schedule = require('../' + main);

// 12:30:15 pm Thursday 29 April 2010 in the timezone this code is being run in
var base = new Date(2010, 3, 29, 12, 30, 15, 0);

module.exports = {
	"#nextInvocationDate(Date)": {
		"next second": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.second = null;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 12, 30, 16, 0), next);
			test.done();
		},
		"next 25th second": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.second = 25;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 12, 30, 25, 0), next);
			test.done();
		},
		"next 5th second (minutes incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.second = 5;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 12, 31, 5, 0), next);
			test.done();
		},
		"next 40th minute": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.minute = 40;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 12, 40, 0, 0), next);
			test.done();
		},
		"next 1st minute (hours incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.minute = 1;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 13, 1, 0, 0), next);
			test.done();
		},
		"next 23rd hour": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.hour = 23;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 29, 23, 0, 0, 0), next);
			test.done();
		},
		"next 3rd hour (days incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.hour = 3;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 30, 3, 0, 0, 0), next);
			test.done();
		},
		"next Friday": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.dayOfWeek = 5;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 30, 0, 0, 0, 0), next);
			test.done();
		},
		"next Monday (months incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.dayOfWeek = 1;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 4, 3, 0, 0, 0, 0), next);
			test.done();
		},
		"next 30th date": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.date = 30;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 30, 0, 0, 0, 0), next);
			test.done();
		},
		"next 5th date (months incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.date = 5;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 4, 5, 0, 0, 0, 0), next);
			test.done();
		},
		"next October": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.month = 9;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 9, 1, 0, 0, 0, 0), next);
			test.done();
		},
		"next February (years incremented)": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.month = 1;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2011, 1, 1, 0, 0, 0, 0), next);
			test.done();
		},
		/*
		"in the year 2040": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.year = 2040;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2040, 0, 1, 0, 0, 0, 0), next);
			test.done();
		},
		*/
		"using mixed time components": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.second = 50;
			rule.minute = 5;
			rule.hour = 10;

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 30, 10, 5, 50, 0), next);
			test.done();
		},
		/*
		"using date and dayOfWeek together": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.dayOfWeek = 4; // This is Thursday April 1st
			rule.date = 10;     // This is Saturday April 10th

			var next = rule.nextInvocationDate(base);

			test.deepEqual(new Date(2010, 3, 1, 0, 0, 0, 0), next);
			test.done();
		}*/
		"returns null when no invocations left": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.year = 2000;

			var next = rule.nextInvocationDate(base);

			test.strictEqual(null, next);
			test.done();
		},
		"specify span of components using Range": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.minute = new schedule.Range(4, 6);

			var next;

			next = rule.nextInvocationDate(base);
			test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 5, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 14, 4, 0, 0), next);

			test.done();
		},
		"specify intervals within span of components using Range with step": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.minute = new schedule.Range(4, 8, 2);

			var next;

			next = rule.nextInvocationDate(base);
			test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

			/* Should Range stay inclusive on both ends when step > 1
			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 8, 0, 0), next);
			*/

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 14, 4, 0, 0), next);

			test.done();
		},
		"specify span and explicit components using Array of Ranges and Numbers": function(test) {
			var rule = new schedule.RecurrenceRule();
			rule.minute = [2, new schedule.Range(4, 6)];

			var next;

			next = rule.nextInvocationDate(base);
			test.deepEqual(new Date(2010, 3, 29, 13, 2, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 4, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 5, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 13, 6, 0, 0), next);

			next = rule.nextInvocationDate(next);
			test.deepEqual(new Date(2010, 3, 29, 14, 2, 0, 0), next);

			test.done();
		}
	}
};

// Build up object of tests for .fromCronString

var rr = function(year, month, dayOfMonth, dayOfWeek, hour, minute, second) {
	return new schedule.RecurrenceRule(year, month, dayOfMonth, dayOfWeek, hour, minute, second)
};
var fromCronStringTests = {};

[
	// Basics
	['5 * * * *', 			rr(null, null, null, null, null, 5, null)],
	['0 5 * * *', 			rr(null, null, null, null, 5, 0, null)],
	['0 0 5 * *', 			rr(null, null, 5, null, 0, 0, null)],
	['0 0 1 5 *', 			rr(null, 4, 1, null, 0, 0, null)],
	['0 0 1 5 ?', 			rr(null, 4, 1, null, 0, 0, null)],
	['0 0 * 5 3', 			rr(null, 4, null, 3, 0, 0, null)],
	['0 0 ? 5 3', 			rr(null, 4, null, 3, 0, 0, null)],
	['1 2 3 4 5', 			rr(null, 3, 3, 5, 2, 1, null)],
	['1 2 3 4 5 2014', 	rr(2014, 3, 3, 5, 2, 1, null)],

	// Multiple times, ranges and intervals
	['5,10,15 * * * *', 	rr(null, null, null, null, null, [5, 10, 15], null)],
	['5-10 * * * *', 			rr(null, null, null, null, null, new schedule.Range(5, 10), null)],
	['5-10/2 * * * *', 		rr(null, null, null, null, null, new schedule.Range(5, 10, 2), null)],
	['*/15 * * * *', 			rr(null, null, null, null, null, new schedule.Range(0, 59, 15), null)],
	['*/5 0 1 1 * 2014', 	rr(2014, 0, 1, null, 0, new schedule.Range(0, 59, 5), null)],

	// Special commands
	['@yearly', 		rr(null, 0, 1, null, 0, 0, 0)],
	['@annually', 	rr(null, 0, 1, null, 0, 0, 0)],
	['@monthly', 		rr(null, null, 1, null, 0, 0, 0)],
	['@weekly', 		rr(null, null, null, 0, 0, 0, 0)],
	['@daily', 			rr(null, null, null, null, 0, 0, 0)],
	['@hourly', 		rr(null, null, null, null, null, 0, 0)],

	// Invalid
	['1 2 3 4', 			null, '(invalid)'], // Not enough fields
	['1 2 3 4 5 6 7', null, '(invalid)'] // Too many fields
].forEach(function(tuple) {
	var cronExpression = tuple[0];
	var expected = tuple[1];
	var note = tuple[2] || '';
	if (note) note = ' ' + note;

	fromCronStringTests[cronExpression + note] = function(test) {
		var actual = schedule.RecurrenceRule.fromCronString(cronExpression);

		test.deepEqual(expected, actual);
		test.done();
	};
});

// Attach tests to exports
module.exports['.fromCronString'] = fromCronStringTests;
