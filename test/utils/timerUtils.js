'use strict';

// When delay is larger than 2147483647 or less than 1, the delay will be set to 1.
// So we need additional logic to handle large delays

function runAtDate(date, func) {
  const now = (new Date()).getTime();
  const then = date.getTime();
  const diff = Math.max((then - now), 0);

  //setTimeout limit is MAX_INT32=(2^31-1)
  if (diff > 0x7FFFFFFF) {
    setTimeout(function() { runAtDate(date, func);},
      0x7FFFFFFF);
  }
  else {
    setTimeout(func, diff);
  }
}

module.exports = {
  runAtDate
}
