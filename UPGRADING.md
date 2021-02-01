## Upgrading to new node-schedule versions

### Upgrading to version 2.0.0+

* Node.js versions older than 6 are no longer supported, please update your environment before upgrading.
* In order to prevent memory leaks, one-off jobs (targeted to be executed at an exact date) cannot be rescheduled by name, as reference to them is no longer stored indefinitely. If you want to keep rescheduling them, make sure to store reference to the initial job.
* The `scheduleJob()` method no longer supports passing an object with the job method. If you were using an object, pass the job method directly.  

  E.g. code that previously looked like this:
  ```javascript
  const obj = {
   execute() {}
  };
  Scheduler.scheduleJob(obj);
  ```
  should be changed to something like this:
  ```javascript
  function execute() {}
  Scheduler.scheduleJob(execute);
  ```
