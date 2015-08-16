angular
.module('fake')

.config(['$provide', '$injector', function($provide, $injector) {

  $provide.decorator('$httpBackend', ['$delegate', function($delegate) {

    var config = $injector.get('FakeConfigProvider').get();

    var proxy = function(method, url, data, callback, headers) {
      var isHtmlRequest = url.match(/\.html/ig);
      if(config.DEBUG && config.DEBUG_REQUESTS) {
        if(!isHtmlRequest || config.DEBUG_HTML) {
          if(data) { console.info(method, url, data); }
          else { console.info(method, url); }
        }
      }
      var interceptor = function() {
        var _this = this, _arguments = arguments;
        setTimeout(function() {
          if(config.DEBUG && config.DEBUG_RESPONSES) {
            console.info(method, url, _arguments);
          }
          callback.apply(_this, _arguments);
        }, isHtmlRequest ? 0 : config.DELAY);
      };

      return $delegate.call(this, method, url, data, interceptor, headers);
    };

    for(var key in $delegate) {
      proxy[key] = $delegate[key];
    }

    return proxy;
  }]);
}]);