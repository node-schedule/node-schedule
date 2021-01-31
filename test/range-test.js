
'use strict';

const test = require('tape');
const schedule = require('../lib/schedule');

test("step defaults to 1", function (t) {
  const range = new schedule.Range(2, 6);

  t.equals(1, range.step);

  t.end();
})

test("when step is 1", function (t) {
  const range = new schedule.Range(2, 6, 1);

  t.test("includes start value", function (t) {
    t.ok(range.contains(2));

    t.end();
  })

  t.test("includes end value", function (t) {
    t.ok(range.contains(6));

    t.end();
  })

  t.test("includes value between start and end", function (t) {
    t.ok(range.contains(3));

    t.end();
  })

  t.test("excludes values outside of start and end", function (t) {
    t.ok(!range.contains(1));
    t.ok(!range.contains(7));

    t.end();
  })
})

test("when step > 1", function(t) {
  const range = new schedule.Range(2, 6, 2);

  t.test("includes start value", function(t) {
    t.ok(range.contains(2));

    t.end();
  })

  t.test("excludes end value", function(t) {
    t.ok(!range.contains(6));

    t.end();
  })

  t.test("includes value between start and end that is evenly divisible by step", function(t) {
    t.ok(range.contains(4));

    t.end();
  })

  t.test("excludes value between start and end that is not evenly divisible by step", function(t) {
    t.ok(!range.contains(5));

    t.end();
  })

  t.test("excludes values outside of start and end", function(t) {
    t.ok(!range.contains(1));
    t.ok(!range.contains(7));

    t.end();
  })
})

