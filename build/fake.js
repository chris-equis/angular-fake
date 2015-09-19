(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

angular.module('fake').provider('FakeConfig', function () {

  var config = {
    DELAY: 0,

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

    PASS_THROUGH_EXTENSIONS: ['html', 'svg', 'json'],
    DEBUG_PASSED_THROUGH_EXTENSIONS: false,

    PATHS: {/* '$name': 'path' */}
  };

  this.set = function (key, value) {
    if (_Object$keys(config).indexOf(key) >= 0) {
      config[key] = value;
    }

    return this;
  };

  this.get = function (key) {
    return config[key];
  };

  this.path = function (name, path) {
    if (name && path) {
      config.PATHS['$' + name] = path;
    }

    return this;
  };

  this.$get = function () {
    return config;
  };
});

},{"babel-runtime/core-js/object/keys":9}],2:[function(require,module,exports){
'use strict';

require('./fake-config-provider');

var httpInterceptor = function httpInterceptor($q, $timeout, $httpBackend, config, log) {

  var isHtml = function isHtml() {
    var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    return url.match(/\.(html)/ig);
  },
      delay = function delay(qCallback, response) {
    return $timeout(function () {
      return qCallback(response);
    }, isHtml(response.config && response.config.url) ? 0 : config.DELAY);
  };

  return {
    request: function request(config) {
      log.request(config);
      return config;
    },
    requestError: function requestError(err) {
      log.error(err);
      return $q.reject(err);
    },
    response: function response(_response) {
      log.response(_response);
      return delay($q.when, _response);
    },
    responseError: function responseError(err) {
      log.error(err);
      return delay($q.reject, err);
    }
  };
};

var httpProviderConfig = function httpProviderConfig($httpProvider) {
  $httpProvider.interceptors.push(['$q', '$timeout', '$httpBackend', 'FakeConfig', 'fakeLog', httpInterceptor]);
};

angular.module('fake').config(['$httpProvider', httpProviderConfig]);

},{"./fake-config-provider":1}],3:[function(require,module,exports){
'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

require('./fake-config-provider');

angular.module('fake').service('fakeLog', ['FakeConfig', function (FakeConfig) {
  var DEBUG = FakeConfig.DEBUG;
  var DEBUG_REQUESTS = FakeConfig.DEBUG_REQUESTS;
  var DEBUG_RESPONSES = FakeConfig.DEBUG_RESPONSES;
  var DEBUG_PASSED_THROUGH_EXTENSIONS = FakeConfig.DEBUG_PASSED_THROUGH_EXTENSIONS;

  var styles = {
    request: 'color: blue',
    response: 'color: green',
    error: 'color: red'
  };

  var debugMethods = _Object$keys(FakeConfig).filter(function (key) {
    return (/DEBUG_METHOD_/g.test(key) && FakeConfig[key]
    );
  }).map(function (key) {
    return key.replace('DEBUG_METHOD_', '');
  });

  var debugCondition = function debugCondition() {
    for (var _len = arguments.length, conditions = Array(_len), _key = 0; _key < _len; _key++) {
      conditions[_key] = arguments[_key];
    }

    conditions.push(DEBUG);
    return !conditions.some(function (condition) {
      return condition === false;
    });
  };

  this.request = function (request) {
    var method = request.method;
    var data = request.data;
    var url = request.url;
    var headers = request.headers;

    if (debugCondition(DEBUG_REQUESTS, !! ~debugMethods.indexOf(method))) {
      console.groupCollapsed('%c' + method, styles.request, url);
      console.log('Method:', method);
      console.log('URL:', url);
      console.log('Data:', JSON.stringify(data));
      console.log('Headers:', JSON.stringify(headers));
      console.log('Request:', request);
      console.groupEnd();
    }
  };

  this.response = function (response) {
    var _response$config = response.config;
    var method = _response$config.method;
    var url = _response$config.url;
    var data = _response$config.data;
    var headers = _response$config.headers;

    if (debugCondition(DEBUG_RESPONSES, !! ~debugMethods.indexOf(method))) {
      console.groupCollapsed('%c' + method, styles.response, url, response.status);
      console.log('Method:', method);
      console.log('URL:', url);
      console.log('Data:', JSON.stringify(data));
      console.log('Headers:', JSON.stringify(headers));
      console.log('Response:', response);
      console.groupEnd();
    }
  };

  this.error = function (err) {
    var _ref = err.config || err;

    var method = _ref.method;
    var url = _ref.url;
    var data = _ref.data;
    var headers = _ref.headers;

    if (debugCondition(!! ~debugMethods.indexOf(method))) {
      console.groupCollapsed('%c' + method, styles.error, url, err.status);
      console.log(err);
      console.log('Method:', method);
      console.log('URL:', url);
      console.log('Data:', JSON.stringify(data));
      console.log('Headers:', JSON.stringify(headers));
      console.log('Response:', err);
      console.groupEnd();
    }
  };
}]);

},{"./fake-config-provider":1,"babel-runtime/core-js/object/keys":9}],4:[function(require,module,exports){
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

require('./fake-uri-parser-factory');

angular.module('fake').factory('FakePath', ['$httpBackend', 'FakeUriParser', function ($httpBackend, FakeUriParser) {

  return (function () {
    function FakePath(path) {
      _classCallCheck(this, FakePath);

      this.$$parser = new FakeUriParser(path);
    }

    _createClass(FakePath, [{
      key: '$$makeRequest',
      value: function $$makeRequest(method, url, data, headers) {
        return {
          method: method,
          url: url,
          data: data,
          headers: headers,
          params: this.$$parser.parse(url)
        };
      }
    }, {
      key: '$$makeResponse',
      value: function $$makeResponse() {
        return {
          send: function send() {
            for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              data[_key - 1] = arguments[_key];
            }

            var status = arguments.length <= 0 || arguments[0] === undefined ? 200 : arguments[0];
            return [status].concat(data);
          }
        };
      }
    }, {
      key: '$$makeResponder',
      value: function $$makeResponder(config) {
        var _this = this;

        return function (method, url, data, headers) {
          var response = [0];

          if (angular.isArray(config) && angular.isNumber(config[0])) {
            response = config;
          } else if (angular.isNumber(config)) {
            response = [config];
          } else if (angular.isFunction(config)) {
            var requestObject = _this.$$makeRequest(method, url, data, headers),
                responseObject = _this.$$makeResponse();

            response = config(requestObject, responseObject) || [0];
          }

          return response;
        };
      }
    }, {
      key: '$$setupHttpBackend',
      value: function $$setupHttpBackend(method, config) {
        return $httpBackend.when(method.toUpperCase(), this.$$parser.pattern).respond(this.$$makeResponder(config));
      }
    }, {
      key: 'when',
      value: function when(configs) {
        var _this2 = this;

        _Object$keys(configs).forEach(function (method) {
          _this2.$$setupHttpBackend(method, configs[method]);
        });
      }
    }]);

    return FakePath;
  })();
}]);

},{"./fake-uri-parser-factory":6,"babel-runtime/core-js/object/keys":9,"babel-runtime/helpers/class-call-check":10,"babel-runtime/helpers/create-class":11}],5:[function(require,module,exports){
'use strict';

require('./fake-path-factory');

angular.module('fake').service('fake', ['FakePath', function (FakePath) {

  return function (path) {
    return new FakePath(path);
  };
}]);

},{"./fake-path-factory":4}],6:[function(require,module,exports){
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

require('./fake-config-provider');

angular.module('fake').factory('FakeUriParser', ['FakeConfig', function (FakeConfig) {
  var rootPaths = FakeConfig.PATHS;
  var patterns = {
    param: /\{[a-z0-9\-\_]+\}/ig,
    root: /^(\$[a-z0-9\-\_]+)/i
  };

  return (function () {
    function FakeUriParser(path) {
      _classCallCheck(this, FakeUriParser);

      var paramMatches = path.toString().match(patterns.param) || [],
          rootNameMatch = path.toString().match(patterns.root),
          rootName = rootNameMatch ? rootNameMatch[0] : '',
          rootPath = rootPaths[rootName] || '',
          escape = function escape(string) {
        return (string || '').replace(/([\/\:\.])/g, '\\$1');
      };

      this.params = paramMatches.map(function (param) {
        return param.replace(/[\{\}]/g, '');
      });

      this.pattern = new RegExp('^' + escape(rootPath) + escape(path).replace(patterns.root, '').replace(patterns.param, '([a-z0-9\\-\\_]+)') + '(\\?.*)?$');
    }

    _createClass(FakeUriParser, [{
      key: 'getPathParams',
      value: function getPathParams(uri) {
        var _this = this;

        var paramValues = (uri.toString().match(this.pattern) || []).filter(function (match, index) {
          return index > 0 && index <= _this.params.length;
        });

        return this.params.reduce(function (paramsObject, paramName, index) {
          paramsObject[paramName] = decodeURI(paramValues[index]);
          return paramsObject;
        }, {});
      }
    }, {
      key: 'getQueryParams',
      value: function getQueryParams(uri) {
        return ((uri.toString().match(/\?.*/) || [])[0] || '').replace(/\?/g, '').split('&').reduce(function (paramsObject, keyValueString) {
          var keyValuePair = keyValueString.split('='),
              key = keyValuePair[0],
              // ''
          value = keyValuePair[1] ? decodeURI(keyValuePair[1]) : '';

          key && (paramsObject[key] = value);

          return paramsObject;
        }, {});
      }
    }, {
      key: 'parse',
      value: function parse(uri) {
        return {
          path: this.getPathParams(uri),
          query: this.getQueryParams(uri)
        };
      }
    }]);

    return FakeUriParser;
  })();
}]);

},{"./fake-config-provider":1,"babel-runtime/helpers/class-call-check":10,"babel-runtime/helpers/create-class":11}],7:[function(require,module,exports){
'use strict';

angular.module('fake', ['ngMockE2E']).run(['$httpBackend', 'FakeConfig', function ($httpBackend, FakeConfig) {
  var extensions = (FakeConfig.PASS_THROUGH_EXTENSIONS || []).join('|');

  $httpBackend.when('GET', new RegExp('.(' + extensions + ')', 'ig')).passThrough();
}]);

require('./fake-http-provider-config');
require('./fake-config-provider');
require('./fake-log-service');
require('./fake-service');

},{"./fake-config-provider":1,"./fake-http-provider-config":2,"./fake-log-service":3,"./fake-service":5}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":12}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":13}],10:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],11:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":8}],12:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":19}],13:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/$.core').Object.keys;
},{"../../modules/$.core":14,"../../modules/es6.object.keys":22}],14:[function(require,module,exports){
var core = module.exports = {};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],15:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , PROTOTYPE = 'prototype';
var ctx = function(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
};
var $def = function(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {})[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && typeof target[key] != 'function')exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp[PROTOTYPE] = C[PROTOTYPE];
    }(out);
    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
module.exports = $def;
},{"./$.core":14,"./$.global":18}],16:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],17:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],18:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var UNDEFINED = 'undefined';
var global = module.exports = typeof window != UNDEFINED && window.Math == Math
  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],19:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],20:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
module.exports = function(KEY, exec){
  var $def = require('./$.def')
    , fn   = (require('./$.core').Object || {})[KEY] || Object[KEY]
    , exp  = {};
  exp[KEY] = exec(fn);
  $def($def.S + $def.F * require('./$.fails')(function(){ fn(1); }), 'Object', exp);
};
},{"./$.core":14,"./$.def":15,"./$.fails":17}],21:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":16}],22:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./$.to-object');

require('./$.object-sap')('keys', function($keys){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./$.object-sap":20,"./$.to-object":21}]},{},[7])


//# sourceMappingURL=fake.js.map