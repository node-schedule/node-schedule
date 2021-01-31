'use strict';

function isValidDate(date) {
  // Taken from http://stackoverflow.com/a/12372720/1562178
  // If getTime() returns NaN it'll return false anyway
  return date.getTime() === date.getTime();
}

module.exports = {
  isValidDate
}
