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
	}
};
