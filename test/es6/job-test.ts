'use strict';

import type { Test } from 'tape';

import { Job } from '../../lib/Job';

export function jobInGenerator(test: Test) {
  test.plan(1);

  const job = new Job(function* () {
    test.ok(true);
  });

  job.runOnDate(new Date(Date.now() + 3000));

  setTimeout(function () {
    test.end();
  }, 3250);
}

export function jobContextInGenerator(test: Test) {
  test.plan(1);

  const job = new Job('name of job', function* (this: Job) {
    test.ok(this.name === 'name of job');
  });

  job.runOnDate(new Date(Date.now() + 3000));

  setTimeout(function () {
    test.end();
  }, 3250);
}
