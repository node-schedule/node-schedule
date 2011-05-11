/*
	node-schedule
	A cron-like and not-cron-like job scheduler for Node.
*/

var events = require('events'),
    util = require('util');

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
	if (typeof(name) == 'undefined' || name === null)
		name = '<Anonymous Job ' + (++anonJobCounter) + '>';
	
	// setup a private pendingInvocations variable
	var pendingInvocations = [];
	function sorter(a, b){
		return (a.fireDate.getTime() - b.fireDate.getTime());
	}
	
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
			clearTimeout(inv.timerID);
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
		clearTimeout(nextInv.timerID);
		if (reschedule && nextInv.recurrenceRule.recurs)
		{
			newInv = scheduleNextRecurrence(nextInv.recurrenceRule, this, nextInv.fireDate);
			if (newInv !== null)
				this.trackInvocation(newInv);
		}
		
		return true;
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
	var job = this;
	
	if (typeof(spec) == 'object' && spec instanceof Date)
	{
		var inv = new Invocation(null, spec);
		inv.timerID = runOnDate(spec, function(){
			job.invoke();
			job.stopTrackingInvocation(inv);
		});
		
		if (inv.timerID !== false)
			success = this.trackInvocation(inv);
	}
	else if (typeof(spec) == 'string' || (typeof(spect) == 'object' && spec instanceof String))
	{
		spec = RecurrenceRule.fromCronString(spec);
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
function Invocation(timerID, fireDate, recurrenceRule){
	this.timerID = timerID;
	this.fireDate = fireDate;
	this.recurrenceRule = recurrenceRule || DoesntRecur;
}

/* RecurrenceRule object */
function RecurrenceRule(){
	this.recurs = true;
}

RecurrenceRule.fromCronString = function(cronStr){
	
};

RecurrenceRule.prototype.nextInvocationDate = function(baseDate){
	baseDate = (baseDate instanceof Date) ? baseDate : (new Date());
	
	if (!this.recurs)
		return null;
};

/* DoesntRecur rule */
var DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

/* Date-based scheduler */
function runOnDate(date, job){
	var now = (new Date()).getTime();
	var then = date.getTime();
	
	if (then < now)
		return false;
	
	return setTimeout(job, (then - now));
}

/* Recurrence scheduler */
function scheduleNextRecurrence(rule, job, prevDate){
	prevDate = (prevDate instanceof Date) ? prevDate : (new Date());
	
	var date = rule.nextInvocationDate(prevDate);
	if (date === null)
		return null;
	
	var inv = new Invocation(null, date, rule);
	inv.timerID = runOnDate(date, function(){
		job.invoke();
		job.stopTrackingInvocation(inv);
		
		var inv = scheduleNextRecurrence(rule, job, date);
		if (inv !== null)
			job.trackInvocation(inv);
	});
	
	if (inv.timerID === false);
		return null;
	
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
exports.RecurrenceRule = RecurrenceRule;
exports.Invocation = Invocation;
exports.scheduleJob = scheduleJob;
exports.cancelJob = cancelJob;
