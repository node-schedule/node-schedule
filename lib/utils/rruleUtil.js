'use strict'

let packageFound = false;
try {
  require('rrule');
  packageFound = true;
}
catch (e) {
  console.log('no package found');
}

let tryParseRRuleString = function(str) { return str;}
let isRRuleObject = function(obj) {return false;}
let nextInvocationDate = function(rrule, afterDate) {return null;}
let doesRuleRecurr = function(rrule) {return false};


if(packageFound) {
  const {rrulestr, RRule, RRuleSet} = require('rrule');
  /**
   * Attempt to parse a string to a RRule object
   * 
   * @param {String} str the string to the parsed
   * @returns A RRuleSet or RRule object if able to parse, otherwise will return the supplied string
   */
  tryParseRRuleString = function(str) {
    try {
      rrulestr(str);
    } catch (err) {
      return str;
    }
  }

  isRRuleObject = function(obj) {
    return obj instanceof RRuleSet || obj instanceof RRule;
  }

  nextInvocationDate = function(rrule, afterDate) {
    if(isRRuleObject) {
      try {
        return rrule.after(afterDate.toDate());
      } catch (e) {
        console.error(e, e.stack);
        return null;
      }
    }
    return null;
  }

  doesRuleRecurr = function(rrule) {
    if(isRRuleObject(rrule)) {
      return rrule.after(afterDate.toDate()) !== null
    }
    return false;
  }
}

module.exports = {
  doesRuleRecurr,
  isRRuleObject,
  nextInvocationDate,
  tryParseRRuleString,
}
