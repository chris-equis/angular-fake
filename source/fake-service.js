(function() {

  angular
  .module('fake')

  .factory('FakeUriParser', [function() {
    var
      paramRegExp = (/\{[a-z0-9\-\_]+\}/ig);

    return function(template) {
      var
        paramMatches = (template
          .toString()
          .match(paramRegExp) || []);

      this.params = paramMatches.map(function(param) {
        return param.replace(/[\{\}]/g, '');
      });

      this.pattern = new RegExp(template
        .toString()
        .replace(paramRegExp, '([a-z0-9\\-\\_]+)') + '(\\?.*)?$');

      this.getPathParams = function(uri) {
        var
          paramValues = uri
            .toString()
            .match(this.pattern)
            .filter(function(match, index) {
              return index > 0 && index <= this.params.length;
            }.bind(this));

        return this
          .params
          .reduce(function(paramsObject, paramName, index) {
            paramsObject[paramName] = decodeURI(paramValues[index]);
            return paramsObject;
          }, {});
      };

      this.getQueryParams = function(uri) {
        return ((uri.toString().match(/\?.*/) || [])[0] || '')
          .replace(/\?/g, '')
          .split('&')
          .reduce(function(paramsObject, keyValueString) {
            var
              keyValuePair = keyValueString.split('='),
              key = keyValuePair[0],
              value = decodeURI(keyValuePair[1]);

            key && (paramsObject[key] = value);

            return paramsObject;
          }, {});
      };

      this.parse = function(uri) {
        return {
          path: this.getPathParams(uri),
          query: this.getQueryParams(uri)
        };
      };

      this.match = function(uri) {
        return this.pattern.test(uri.toString());
      };
    };
  }])

  .factory('FakeConfiguration', [
    '$httpBackend',
    'FakeUriParser',
    function($httpBackend, FakeUriParser) {

      return function(template) {
        var
          parser = new FakeUriParser(template),
          createRequestObject = function(method, url, data, headers) {
            return {
              method: method,
              url: url,
              data: data,
              headers: headers,
              params: parser.parse(url)
            };
          },
          createResponseObject = function() {
            return {
              status: 200,
              data: null,
              send: function(code) {
                this.status = code;
                return this;
              },
              with: function(data) {
                this.data = data;
                return this;
              }
            }
          },
          createRespondCallback = function(callback) {
            return function(method, url, data, headers) {
              var
                response = callback.apply(null, [
                  createRequestObject(method, url, data, headers),
                  createResponseObject()
                ]);

              return [response.status, response.data];
            };
          },
          setupHttpBackend = function(method, callback) {
            if(typeof callback === 'function') {
              $httpBackend
                .when(method.toUpperCase(), parser.pattern)
                .respond(createRespondCallback(callback));
            }
          };

        this.when = function(callbacks) {
          Object.keys(callbacks).forEach(function(method) {
            setupHttpBackend(method, callbacks[method]);
          });
        };
      };
    }
  ])

  .service('fake', ['FakeConfiguration', function(FakeConfiguration) {
    return function(template) {
      return new FakeConfiguration(template);
    };
  }]);

})();