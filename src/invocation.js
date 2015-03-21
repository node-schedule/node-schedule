'use strict';

let DoesntRecur = require('./doesntRecur.js');

/* Invocation object */
class Invocation {
  constructor(job, fireDate, recurrenceRule) {
    this.job = job;
    this.fireDate = fireDate;
    this.recurrenceRule = recurrenceRule || DoesntRecur;

    this.timerID = null;
  }
}

module.exports = Invocation;
