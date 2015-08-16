require('./fake-config-provider');

angular
.module('fake')

.config(['$provide', '$injector', function($provide, $injector) {

  $provide.decorator('$httpBackend', ['$delegate', function($delegate) {

    var {
      DELAY,
      DEBUG,
      DEBUG_REQUESTS,
      DEBUG_RESPONSES,
      DEBUG_HTML
    } = $injector.get('FakeConfigProvider').get();

    var proxy = function(method, url, data, callback, headers) {
      var isHtmlRequest = url.match(/\.html/ig);
      if(DEBUG && DEBUG_REQUESTS) {
        if(!isHtmlRequest || DEBUG_HTML) {
          if(data) { console.info(method, url, data); }
          else { console.info(method, url); }
        }
      }
      var interceptor = function(...args) {
        setTimeout(() => {
          DEBUG && DEBUG_RESPONSES && console.info(method, url, args);
          callback.apply(this, args);
        }.bind(this), isHtmlRequest ? 0 : DELAY);
      };

      return $delegate.call(this, method, url, data, interceptor, headers);
    };

    Object.keys($delegate).forEach(function(key) {
      proxy[key] = $delegate[key];
    });

    return proxy;
  }]);
}]);