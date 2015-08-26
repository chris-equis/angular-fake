var KarmaServer = require('karma').Server;

module.exports = function() {
  new KarmaServer({
    configFile: __dirname + '/../karma.conf.js',
    singleRun: true
  }).start();
};