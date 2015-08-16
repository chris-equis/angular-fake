angular
.module('fake')

.provider('Fake', function() {

  var config = {
    DELAY: 500,
    DEBUG: false,
    DEBUG_REQUESTS: false,
    DEBUG_RESPONSES: false,
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
