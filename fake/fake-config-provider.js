angular
.module('fake')

.provider('FakeConfig', function() {

  var config = {
    DELAY: 500,

    DEBUG: false,
    DEBUG_REQUESTS: true,
    DEBUG_RESPONSES: false,

    DEBUG_METHOD_GET: true,
    DEBUG_METHOD_PUT: true,
    DEBUG_METHOD_POST: true,
    DEBUG_METHOD_PATCH: true,
    DEBUG_METHOD_DELETE: true,

    DEBUG_METHOD_HEAD: false,
    DEBUG_METHOD_TRACE: false,
    DEBUG_METHOD_OPTIONS: false,

    PASS_THROUGH_EXTENSIONS: ['html'],
    DEBUG_PASSED_THROUGH_EXTENSIONS: false,

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
