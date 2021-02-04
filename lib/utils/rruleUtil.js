'use strict'
const CronDate = require('cron-parser/lib/date')

let RRule_lib = undefined;
try {
  RRule_lib = require('rrule')
}
catch (e) {
  console.error('To parse RRules the RRule library must be included via npm');
  throw e;
}

function parseRRuleString(str) {
  return RRule_lib.rrulestr(str);
}

function isRRuleObject(obj) {
  return obj instanceof RRule_lib.RRuleSet || obj instanceof RRule_lib.RRule;
}

function isRRuleString() {
  try {
    RRule_lib.rrulestr(str);
    return true;
  } catch (e) {
    // we want to swallow the rror here as we are checking if it is valid
    return false;
  }
}

function nextInvocationDate(rrule, afterDate) {
  if(isRRuleObject(rrule)) {
    return new CronDate(rrule.after(afterDate.toDate()), this.tz);
  }
  return null;
}

function doesRuleRecurr(rrule) {
  if(isRRuleObject(rrule)) {
    return rrule.after(new Date()) !== null
  }
  return false;
}

function hasDependency() {
  return RRule_lib !== undefined;
}

module.exports = {
  doesRuleRecurr,
  hasDependency,
  isRRuleObject,
  isRRuleString,
  nextInvocationDate,
  parseRRuleString,
};
