angular
.module('fake')

.provider('FakeConfig', function() {

  var config = {
    API_ROOT: '',
    DELAY: 500,
    DEBUG: false,
    DEBUG_REQUESTS: true,
    DEBUG_RESPONSES: true,
    // DEBUG_GET: true,
    // DEBUG_POST: true,
    // DEBUG_PUT: true,
    // DEBUG_DELETE: true,
    DEBUG_HTML: false,
    PASS_THROUGH_EXTENSIONS: ['html'],
  };

  this.set = function(key, value) {
    config[key] = value;
    return this;
  };

  this.get = function(key) {
    return key ? config[key] : config;
  };

  this.$get = [function() {
    return config;
  }];
});
