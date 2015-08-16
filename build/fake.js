(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('fake').provider('FakeConfig', function () {

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
    PASS_THROUGH_EXTENSIONS: ['html']
  };

  this.set = function (key, value) {
    config[key] = value;
    return this;
  };

  this.get = function (key) {
    return key ? config[key] : config;
  };

  this.$get = [function () {
    return config;
  }];
});

},{}],2:[function(require,module,exports){
'use strict';

require('./fake-config-provider');

angular.module('fake').config(['$provide', '$injector', function ($provide, $injector) {

  $provide.decorator('$httpBackend', ['$delegate', function ($delegate) {
    var _$injector$get$get = $injector.get('FakeConfigProvider').get();

    var DELAY = _$injector$get$get.DELAY;
    var DEBUG = _$injector$get$get.DEBUG;
    var DEBUG_REQUESTS = _$injector$get$get.DEBUG_REQUESTS;
    var DEBUG_RESPONSES = _$injector$get$get.DEBUG_RESPONSES;
    var DEBUG_HTML = _$injector$get$get.DEBUG_HTML;

    var proxy = function proxy(method, url, data, callback, headers) {
      var isHtmlRequest = url.match(/\.html/ig);
      if (DEBUG && DEBUG_REQUESTS) {
        if (!isHtmlRequest || DEBUG_HTML) {
          if (data) {
            console.info(method, url, data);
          } else {
            console.info(method, url);
          }
        }
      }
      var interceptor = function interceptor() {
        var _this = this;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        setTimeout((function () {
          DEBUG && DEBUG_RESPONSES && console.info(method, url, args);
          callback.apply(_this, args);
        }).bind(this), isHtmlRequest ? 0 : DELAY);
      };

      return $delegate.call(this, method, url, data, interceptor, headers);
    };

    Object.keys($delegate).forEach(function (key) {
      proxy[key] = $delegate[key];
    });

    return proxy;
  }]);
}]);

},{"./fake-config-provider":1}],3:[function(require,module,exports){
'use strict';

require('./fake-config-provider');
require('./fake-uri-parser-factory');

angular.module('fake').factory('FakePath', ['$httpBackend', 'FakeConfig', 'FakeUriParser', function ($httpBackend, FakeConfig, FakeUriParser) {

  var root = FakeConfig.API_ROOT;

  return function (path) {
    var parser = new FakeUriParser(path, root),
        createRequestObject = function createRequestObject(method, url, data, headers) {
      return {
        method: method,
        url: url,
        data: data,
        headers: headers,
        params: parser.parse(url)
      };
    },
        createResponseObject = function createResponseObject() {
      return {
        status: 200,
        data: null,
        send: function send(code) {
          this.status = code;
          return this;
        },
        'with': function _with(data) {
          this.data = data;
          return this;
        }
      };
    },
        createRespondCallback = function createRespondCallback(callback) {
      return function (method, url, data, headers) {
        var response = callback.apply(null, [createRequestObject(method, url, data, headers), createResponseObject()]);

        return [response.status, response.data];
      };
    },
        setupHttpBackend = function setupHttpBackend(method, callback) {
      if (typeof callback === 'function') {
        $httpBackend.when(method.toUpperCase(), parser.pattern).respond(createRespondCallback(callback));
      }
    };

    this.when = function (callbacks) {
      Object.keys(callbacks).forEach(function (method) {
        setupHttpBackend(method, callbacks[method]);
      });
    };
  };
}]);

},{"./fake-config-provider":1,"./fake-uri-parser-factory":5}],4:[function(require,module,exports){
'use strict';

require('./fake-path-factory');

angular.module('fake').service('fake', ['FakePath', function (FakePath) {
  return function (path) {
    return new FakePath(path);
  };
}]);

},{"./fake-path-factory":3}],5:[function(require,module,exports){
'use strict';

angular.module('fake').factory('FakeUriParser', [function () {
  var paramRegExp = /\{[a-z0-9\-\_]+\}/ig;

  return function (path, root) {
    var paramMatches = path.toString().match(paramRegExp) || [],
        escape = function escape(string) {
      return (string || '').replace(/([\/\:\.])/g, '\\$1');
    };

    this.params = paramMatches.map(function (param) {
      return param.replace(/[\{\}]/g, '');
    });

    this.pattern = new RegExp('^' + escape(root) + escape(path).toString().replace(paramRegExp, '([a-z0-9\\-\\_]+)') + '(\\?.*)?$');

    this.getPathParams = function (uri) {
      var paramValues = uri.toString().match(this.pattern).filter((function (match, index) {
        return index > 0 && index <= this.params.length;
      }).bind(this));

      return this.params.reduce(function (paramsObject, paramName, index) {
        paramsObject[paramName] = decodeURI(paramValues[index]);
        return paramsObject;
      }, {});
    };

    this.getQueryParams = function (uri) {
      return ((uri.toString().match(/\?.*/) || [])[0] || '').replace(/\?/g, '').split('&').reduce(function (paramsObject, keyValueString) {
        var keyValuePair = keyValueString.split('='),
            key = keyValuePair[0],
            value = decodeURI(keyValuePair[1]);

        key && (paramsObject[key] = value);

        return paramsObject;
      }, {});
    };

    this.parse = function (uri) {
      return {
        path: this.getPathParams(uri),
        query: this.getQueryParams(uri)
      };
    };

    this.match = function (uri) {
      return this.pattern.test(uri.toString());
    };
  };
}]);

},{}],6:[function(require,module,exports){
'use strict';

angular.module('fake', ['ngMockE2E']);

require('./fake-http-backend-config');
require('./fake-config-provider');
require('./fake-service');

},{"./fake-config-provider":1,"./fake-http-backend-config":2,"./fake-service":4}]},{},[6])


//# sourceMappingURL=fake.js.map