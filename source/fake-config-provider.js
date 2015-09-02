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
    if(Object.keys(config).indexOf(key) >= 0) {
      config[key] = value;
    }

    return this;
  };

  this.get = function(key) {
    return config[key];
  };

  this.path = function(name, path) {
    if(name && path) {
      config.PATHS['$' + name] = path;
    }

    return this;
  };

  this.$get = function() {
    return config;
  };

});
