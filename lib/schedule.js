/*
	node-schedule
	A cron-like and not-cron-like job scheduler for Node.
*/

var events = require('events'),
    util = require('util'),
    increment = require('./increment.js');

/* Job object */
var anonJobCounter = 0;
function Job(){
	var name;
	
	// process arguments to the constructor
	var arg;
	for (var i = 0; i < arguments.length; i++)
	{
		arg = arguments[i];
		if (typeof(arg) == 'string' || arg instanceof String)
			name = arg;
		else if (typeof(arg) == 'function')
			this.job = arg;
	}
	
	// give us a random name if one wasn't provided
	if (name == null)
		name = '<Anonymous Job ' + (++anonJobCounter) + '>';
	
	// setup a private pendingInvocations variable
	var pendingInvocations = [];
	
	// define properties
	Object.defineProperty(this, 'name', {
		value: name,
		writable: false,
		enumerable: true
	});
	
	// method that require private access
	this.trackInvocation = function(invocation){
		// add to our invocation list
		pendingInvocations.push(invocation);
		
		// and sort
		pendingInvocations.sort(sorter);
		
		return true;
	};
	this.stopTrackingInvocation = function(invocation){
		var invIdx = pendingInvocations.indexOf(invocation);
		if (invIdx > -1)
		{
			pendingInvocations.splice(invIdx, 1);
			return true;
		}
		
		return false;
	};
	this.cancel = function(reschedule){
		reschedule = (typeof(reschedule) == 'boolean') ? reschedule : false;
		
		var inv, newInv;
		var newInvs = [];
		for (var i = 0; i < pendingInvocations.length; i++)
		{
			inv = pendingInvocations[i];
			
			cancelInvocation(inv);
			
			if (reschedule && inv.recurrenceRule.recurs)
			{
				newInv = scheduleNextRecurrence(inv.recurrenceRule, this, inv.fireDate);
				if (newInv !== null)
					newInvs.push(newInv);
			}
		}
		
		pendingInvocations = [];
		
		for (var i = 0; i < newInvs.length; i++)
			this.trackInvocation(newInvs[i]);
		
		return true;
	};
	this.cancelNext = function(reschedule){
		reschedule = (typeof(reschedule) == 'boolean') ? reschedule : true;
		
		if (pendingInvocations.length == 0)
			return false;
		
		var newInv;
		var nextInv = pendingInvocations.shift();
		
		cancelInvocation(nextInv);
		
		if (reschedule && nextInv.recurrenceRule.recurs)
		{
			newInv = scheduleNextRecurrence(nextInv.recurrenceRule, this, nextInv.fireDate);
			if (newInv !== null)
				this.trackInvocation(newInv);
		}
		
		return true;
	};
	this.nextInvocation = function(){
		if (pendingInvocations.length == 0)
			return null;
		return pendingInvocations[0].fireDate;
	};
}

util.inherits(Job, events.EventEmitter);

Job.prototype.invoke = function(){
	if (typeof(this.job) == 'function')
		this.job();
};

Job.prototype.runOnDate = function(date){
	return this.schedule(date);
};

Job.prototype.schedule = function(spec){
	var success = false;

  spec = dateSpec(spec);	
	if (typeof(spec) == 'object' && spec instanceof Date)
	{
		var inv = new Invocation(this, spec);
		scheduleInvocation(inv);
		success = this.trackInvocation(inv);
	}
	else if (typeof(spec) == 'string' || (typeof(spec) == 'object' && spec instanceof String))
	{
		spec = RecurrenceRule.fromCronString(spec);
	}
	else if (typeof(spec == 'object') && !(spec instanceof RecurrenceRule))
	{
		var r = new RecurrenceRule();
		if ('year' in spec)
			r.year = spec.year;
		if ('month' in spec)
			r.month = spec.month;
		if ('date' in spec)
			r.date = spec.date;
		if ('dayOfWeek' in spec)
			r.dayOfWeek = spec.dayOfWeek;
		if ('hour' in spec)
			r.hour = spec.hour;
		if ('minute' in spec)
			r.minute = spec.minute;
		if ('second' in spec)
			r.second = spec.second;
		
		spec = r;
	}
	
	// schedule a recurring invocation
	if (typeof(spec) == 'object' && spec instanceof RecurrenceRule)
	{
		if (spec.recurs)
		{
			var inv = scheduleNextRecurrence(spec, this);
			if (inv !== null)
				success = this.trackInvocation(inv);
		}
	}
	
	return success;
};

function dateSpec(spec) {
    if (spec instanceof Date === false) {
        var validDate = new Date(spec);
        if (validDate.toString() !== 'Invalid Date') {
            spec = validDate;
        }
    }
    return spec;
}

/* API
	invoke()
	runOnDate(date)
	schedule(date || recurrenceRule || cronstring)
	cancel(reschedule = false)
	cancelNext(reschedule = true)

   Property constraints
	name: readonly
	job: readwrite
*/

/* Invocation object */
function Invocation(job, fireDate, recurrenceRule){
	this.job = job;
	this.fireDate = fireDate;
	this.recurrenceRule = recurrenceRule || DoesntRecur;
	
	this.timerID = null;
}

function sorter(a, b){
	return (a.fireDate.getTime() - b.fireDate.getTime());
}

/* Range object */
function Range(start, end, step){
	this.start = start || 0;
	this.end = end || 60;
	this.step = step || 1;
}

Range.prototype.contains = function(val){
	if (this.step === null || this.step === 1)
		return (val >= this.start && val <= this.end);
	else
	{
		for (var i = this.start; i < this.end; i += this.step)
		{
			if (i == val)
				return true;
		}
		
		return false;
	}
};

/* RecurrenceRule object */
/*
	Interpreting each property:
		null - any value is valid
		number - fixed value
		Range - value must fall in range
		array - value must validate against any item in list
	
	NOTE: Cron months are 1-based, but RecurrenceRule months are 0-based.
*/
function RecurrenceRule(year, month, date, dayOfWeek, hour, minute, second){
	this.recurs = true;
	
	this.year = (year == null) ? null : year;
	this.month = (month == null) ? null : month;
	this.date = (date == null) ? null : date;
	this.dayOfWeek = (dayOfWeek == null) ? null : dayOfWeek;
	this.hour = (hour == null) ? null : hour;
	this.minute = (minute == null) ? null : minute;
	this.second = (second == null) ? 0 : second;
}

var monthTranslation = {'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11};
var dayTranslation = {'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6};

RecurrenceRule.valueForCronComponent = function(component, min, max, shiftIdxs){
	component = component.toLowerCase();
	
	min = (min == null) ? -1 : min;
	max = (max == null) ? -1 : max;
	shiftIdxs = (typeof(shiftIdxs) == 'boolean') ? shiftIdxs : false;
	
	if (component == '*' || component == '?')
		return null;
	
	if (component.match(/^([1-9]|[1-3][0-9])w$/))
	{
		// TODO: nearest weekday
		return null;
	}
	
	var result = [];
	var item, stepParts, rangeParts, itemRange;
	var items = component.split(',');
	for (var i = 0; i < items.length; i++)
	{
		item = items[i];
		if (item == '*' || item == '?')
			return null; // if any component is *, the rule is *
		else if (item.match(/^[0-9]+$/))
			result.push(parseInt(item, 10) - ((shiftIdxs) ? 1 : 0));
		else if (item == 'l')
		{
			// TODO: last
		}
		else
		{
			// TODO
			// 0#2 = second Sunday
			
			itemRange = new Range();
			stepParts = item.split('/', 2);
			
			if (stepParts[0] == '*')
			{
				if (min <= -1 || max <= -1)
					continue;
				
				itemRange.start = min;
				itemRange.end = max;
			}
			else
			{
				rangeParts = stepParts[0].split('-', 2);
			
				if (rangeParts[0] in monthTranslation)
					itemRange.start = monthTranslation[rangeParts[0]];
				else if (rangeParts[0] in dayTranslation)
					itemRange.start = dayTranslation[rangeParts[0]];
				else
					itemRange.start = parseInt(rangeParts[0], 10) - ((shiftIdxs) ? 1 : 0);
			
				if (rangeParts.length == 2)
				{
					if (rangeParts[1] in monthTranslation)
						itemRange.end = monthTranslation[rangeParts[1]];
					else if (rangeParts[1] in dayTranslation)
						itemRange.end = dayTranslation[rangeParts[1]];
					else
						itemRange.end = parseInt(rangeParts[1], 10) - ((shiftIdxs) ? 1 : 0);
				}
			}
			
			itemRange.step = (stepParts.length == 2) ? parseInt(stepParts[1], 10) : 1;
			result.push(itemRange);
		}
	}
	
	if (result.length == 0)
		return null;
	else if (result.length == 1)
		return result[0];
	
	return result;
};

RecurrenceRule.fromCronString = function(cronStr){
	cronStr = cronStr.toLowerCase().replace(/^\s*|\s*$/g, '');
	
	/* special commands */
	if (cronStr == '@yearly' || cronStr == '@annually')
		return new RecurrenceRule(null, 0, 1, null, 0, 0, 0);
	else if (cronStr == '@monthly')
		return new RecurrenceRule(null, null, 1, null, 0, 0, 0);
	else if (cronStr == '@weekly')
		return new RecurrenceRule(null, null, null, 0, 0, 0, 0);
	else if (cronStr == '@daily')
		return new RecurrenceRule(null, null, null, null, 0, 0, 0);
	else if (cronStr == '@hourly')
		return new RecurrenceRule(null, null, null, null, null, 0, 0);
	else
	{
		// parse it out
		var parts = cronStr.split(/\s+/);
		if (parts.length < 5 || parts.length > 6)
			return null;
		
		var rule = new RecurrenceRule();
		// minute
		rule.minute = RecurrenceRule.valueForCronComponent(parts[0], 0, 59);
		
		// hour
		rule.hour = RecurrenceRule.valueForCronComponent(parts[1], 0, 23);
		
		// date
		rule.date = RecurrenceRule.valueForCronComponent(parts[2], 1, 31);
		
		// month
		rule.month = RecurrenceRule.valueForCronComponent(parts[3], 0, 11, true);
		
		// day of week
		rule.dayOfWeek = RecurrenceRule.valueForCronComponent(parts[4], 0, 6);
		
		// year
		if (parts.length == 6)
			rule.year = RecurrenceRule.valueForCronComponent(parts[5]);
		
		rule.second = 0;
		
		if (rule.validate())
			return rule;
	}
	
	return null;
};

RecurrenceRule.prototype.validate = function(){
	// TODO: validation
	return true;
};

RecurrenceRule.prototype.nextInvocationDate = function(base){
	base = (base instanceof Date) ? base : (new Date());
  increment.addDateConvenienceMethods(base);
	if (!this.recurs)
		return null;
	
	var now = new Date();
  increment.addDateConvenienceMethods(now);
	if (this.year !== null && (typeof(this.year) == 'number') && this.year < now.getFullYear())
		return null;
	
	var next = new Date(base.getTime());
  increment.addDateConvenienceMethods(next);
	next.addSecond();
	
	while (true)
	{
		if (this.year != null && !recurMatch(next.getYear(), this.year))
		{
			next.addYear();
			next.setMonth(0);
			next.setDate(1);
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.month != null && !recurMatch(next.getMonth(), this.month))
		{
			next.addMonth();
			next.setDate(1);
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.date != null && !recurMatch(next.getDate(), this.date))
		{
			next.addDay();
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.dayOfWeek != null && !recurMatch(next.getDay(), this.dayOfWeek))
		{
			next.addDay();
			next.setHours(0);
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.hour != null && !recurMatch(next.getHours(), this.hour))
		{
			next.addHour();
			next.setMinutes(0);
			next.setSeconds(0);
			continue;
		}
		if (this.minute != null && !recurMatch(next.getMinutes(), this.minute))
		{
			next.addMinute();
			next.setSeconds(0);
			continue;
		}
		if (this.second != null && !recurMatch(next.getSeconds(), this.second))
		{
			next.addSecond();
			continue;
		}
		
		break;
	}
	
	return next;
};

function recurMatch(val, matcher){
	if (matcher == null)
		return true;
	
	if (typeof(matcher) == 'number')
		return (val == matcher);
	else if (typeof(matcher) == 'object' && matcher instanceof Range)
		return matcher.contains(val);
	else if (typeof(matcher) == 'array' || (typeof(matcher) == 'object' && matcher instanceof Array))
	{
		for (var i = 0; i < matcher.length; i++)
		{
			if (recurMatch(val, matcher[i]))
				return true;
		}
		return false;
	}
	
	return false;
}

/* DoesntRecur rule */
var DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

/* Date-based scheduler */
function runOnDate(date, job){
	var now = (new Date()).getTime();
	var then = date.getTime();
	
	if (then < now)
    {
//        if (now - then < 1000)
            process.nextTick(job);
        return null;
    }
	
	return setTimeout(job, (then - now));
}

var invocations = [];
var currentInvocation = null;
function scheduleInvocation(invocation){
	invocations.push(invocation);
	invocations.sort(sorter);
	prepareNextInvocation();
	invocation.job.emit('scheduled', invocation.fireDate);
}

function prepareNextInvocation(){
	if (invocations.length > 0 && currentInvocation != invocations[0])
	{
		if (currentInvocation !== null)
		{
			clearTimeout(currentInvocation.timerID);
			currentInvocation.timerID = null;
			currentInvocation = null;
		}
		
		currentInvocation = invocations[0];
		
		var job = currentInvocation.job;
		var cinv = currentInvocation;
		currentInvocation.timerID = runOnDate(currentInvocation.fireDate, function(){
			currentInvocationFinished();
			
			if (cinv.recurrenceRule.recurs)
			{
				var inv = scheduleNextRecurrence(cinv.recurrenceRule, cinv.job, cinv.fireDate);
				if (inv !== null)
					inv.job.trackInvocation(inv);
			}
			
			job.stopTrackingInvocation(cinv);
			
			job.invoke();
			job.emit('run');
		});
	}
}

function currentInvocationFinished(){
	invocations.shift();
	currentInvocation = null;
	prepareNextInvocation();
}

function cancelInvocation(invocation){
	var idx = invocations.indexOf(invocation);
	if (idx > -1)
	{
		invocations.splice(idx, 1);
		if (invocation.timerID !== null)
			clearTimeout(invocation.timerID);
		
		if (currentInvocation == invocation)
			currentInvocation = null;
		
		invocation.job.emit('canceled', invocation.fireDate);
		prepareNextInvocation();
	}
}

/* Recurrence scheduler */
function scheduleNextRecurrence(rule, job, prevDate){
	prevDate = (prevDate instanceof Date) ? prevDate : (new Date());
	
	var date = rule.nextInvocationDate(prevDate);
	if (date === null)
		return null;
	
	var inv = new Invocation(job, date, rule);
	scheduleInvocation(inv);
	
	return inv;
}

/* Convenience methods */
var scheduledJobs = {};
function scheduleJob(){
	if (arguments.length < 2)
		return null;
	
	var name = (arguments.length >= 3) ? arguments[0] : null;
	var spec = (arguments.length >= 3) ? arguments[1] : arguments[0];
	var method = (arguments.length >= 3) ? arguments[2] : arguments[1];
	if (typeof(method) != 'function')
		return null;
	
	var job = new Job(name, method);
	if (job.schedule(spec))
	{
		scheduledJobs[job.name] = job;
		return job;
	}
	return null;
}

function cancelJob(job){
	var success = false;
	if (job instanceof Job)
	{
		success = job.cancel();
		if (success)
		{
			for (var name in scheduledJobs)
			{
				if (scheduledJobs.hasOwnProperty(name))
				{
					if (scheduledJobs[name] == job)
					{
						delete scheduledJobs[name];
						break;
					}
				}
			}
		}
	}
	else if (typeof(job) == 'string' || job instanceof String)
	{
		if (job in scheduledJobs && scheduledJobs.hasOwnProperty(job))
		{
			success = scheduledJobs[job].cancel();
			if (success)
				delete scheduledJobs[job];
		}
	}
	
	return success;
}

/* Public API */
exports.Job = Job;
exports.Range = Range;
exports.RecurrenceRule = RecurrenceRule;
exports.Invocation = Invocation;
exports.scheduleJob = scheduleJob;
exports.scheduledJobs = scheduledJobs;
exports.cancelJob = cancelJob;
exports.addDateConvenienceMethods = increment.addDateConvenienceMethods;

