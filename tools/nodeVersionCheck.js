/* eslint-disable */
var exec = require('child_process').exec;

exec('node -v', function (err, stdout) {
  if (err) throw err;

  var nodeVersion = parseFloat(stdout.slice(1));

  if (nodeVersion < 6) {
    throw new Error('You are using a version of Node.js older than v6.x. Please upgrade to Node v6.x or higher in order for PageMill to function properly.');
  }
});
