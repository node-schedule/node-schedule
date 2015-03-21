'use strict';

let RecurrenceRule = require('./recurrenceRule.js');

/* DoesntRecur rule */
let DoesntRecur = new RecurrenceRule();
DoesntRecur.recurs = false;

module.exports = DoesntRecur;
