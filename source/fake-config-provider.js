angular
.module('fake')

.provider('FakeConfig', function() {

  var config = {
    DELAY: 500,
    DEBUG: false,
    DEBUG_REQUESTS: true,
    DEBUG_RESPONSES: true,
    DEBUG_HTML: false,
    PASS_THROUGH_EXTENSIONS: ['html'],
    PATHS: {/* '$name': 'path' */}
  };

  this.set = function(key, value) {
    config[key] = value;
    return this;
  };

  this.get = function(key) {
    return key ? config[key] : config;
  };

  this.path = function(name, path) {
    var paths = config.PATHS,
        ret = this;
    path ? (paths['$' + name] = path) : (ret = paths['$' + name]);
    return ret;
  };

  this.$get = [function() {
    return config;
  }];

});
