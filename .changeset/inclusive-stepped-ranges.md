---
"node-schedule": major
---

Include the end of a stepped `Range` when it falls on a step from the start.
For example, `new Range(1, 5, 2)` now includes Friday when used for `dayOfWeek`.
Existing stepped schedules may gain an invocation at the end of the range;
review their upper bounds before upgrading.
