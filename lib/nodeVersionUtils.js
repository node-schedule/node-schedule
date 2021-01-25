'use strict'

var nodeVersionString = process.versions.node

function getNodeVersion(nodeVersionString) {
  var versionSplit = nodeVersionString.split('.')
  return {
    majorVersion: Number(versionSplit[0]),
    minorVersion: Number(versionSplit[1])
  }
}

function arePromisesSupported(nodeVersion) {
  var majorVersion = nodeVersion.majorVersion
  var minorVersion = nodeVersion.minorVersion

  if (majorVersion > 0) {
    return true
  }

  if (minorVersion < 12) {
    return false
  }

  return true
}

module.exports.nodeVersionString = nodeVersionString;
module.exports.arePromisesSupported = arePromisesSupported;
module.exports.getNodeVersion = getNodeVersion;
