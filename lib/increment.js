/*
	node-schedule
	A cron-like and not-cron-like job scheduler for Node.
	
	This file adds convenience functions for performing incremental date math
	in the Gregorian calendar.
*/

var monthCount = 12;

var normalDaySpec = [
	31,	// January
	28,	// February
	31,	// March
	30,	// April
	31,	// May
	30, // June
	31,	// July
	31,	// August
	30,	// September
	31,	// October
	30,	// November
	31	// December
];
var leapDaySpec = [
	31,	// January
	29,	// February
	31,	// March
	30,	// April
	31,	// May
	30, // June
	31,	// July
	31,	// August
	30,	// September
	31,	// October
	30,	// November
	31	// December
];

// provide a year-specific day spec
function daySpec(year){
	return ((year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) ? leapDaySpec : normalDaySpec);
}

Date.prototype.addYear = function(){
	this.setFullYear(this.getFullYear() + 1);
};

Date.prototype.addMonth = function(){
	var m = this.getMonth() + 1;
	if (m == monthCount)
	{
        this.setMonth(0);
		this.addYear();
	}
	else
    {
        var spec = daySpec(this.getFullYear());
        if (this.getDate() > spec[m])
            this.setDate(spec[m]);
    	this.setMonth(m);
    }
};

Date.prototype.addDay = function(){
	var spec = daySpec(this.getFullYear());
	var d = this.getDate() + 1;
	if (d > spec[this.getMonth()])
	{
		this.setDate(1)
		this.addMonth();
	}
	else
        this.setTime(this.getTime() + (24 * 60 * 60 * 1000));
};

Date.prototype.addHour = function(){
	var h = this.getHours() + 1;
	if (h == 24)
	{
        this.setHours(0);
		this.addDay();
	}
	else
    	this.setTime(this.getTime() + (60 * 60 * 1000));
};

Date.prototype.addMinute = function(){
	var m = this.getMinutes() + 1;
	if (m == 60)
	{
		this.setMinutes(0);
		this.addHour();
	}
	else
        this.setTime(this.getTime() + (60 * 1000));
};

Date.prototype.addSecond = function(){
	var s = this.getSeconds() + 1;
	if (s == 60)
	{
		this.setSeconds(0);
		this.addMinute();
	}
	else
        this.setTime(this.getTime() + 1000);
};
