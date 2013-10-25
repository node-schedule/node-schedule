/*
	node-schedule
	A cron-like and not-cron-like job scheduler for Node.
	
	This file adds convenience functions for performing incremental date math
	in the Gregorian calendar.
*/

Date.prototype.addYear = function(){
	this.setFullYear(this.getFullYear() + 1);
};

Date.prototype.addMonth = function(){
	this.setMonth(this.getMonth() + 1);
};

Date.prototype.addDay = function(){
	this.setDate(this.getDate() + 1);
};

Date.prototype.addHour = function(){
	this.setTime(this.getTime() + (60 * 60 * 1000));
};

Date.prototype.addMinute = function(){
	this.setTime(this.getTime() + (60 * 1000));
};

Date.prototype.addSecond = function(){
	this.setTime(this.getTime() + 1000);
};
