require('./fake-uri-parser-factory');

angular
.module('fake')
.factory('FakePath', [
  '$httpBackend',
  'FakeUriParser',
  ($httpBackend, FakeUriParser) => {

    return function(path) {

      this.$$parser = new FakeUriParser(path);

      this.$$makeRequest = function(method, url, data, headers) {
        return {
          method: method,
          url: url,
          data: data,
          headers: headers,
          params: this.$$parser.parse(url)
        };
      };

      this.$$makeResponse = function() {
        return {
          send: (status = 200, ...data) => [status, ...data]
        };
      };

      this.$$makeResponder = function(config) {
        return (method, url, data, headers) => {
          let response = [0];

          if(angular.isArray(config) && angular.isNumber(config[0])) {
            response = config;
          } else if(angular.isNumber(config)) {
            response = [config];
          } else if(angular.isFunction(config)) {
            let requestObject = this.$$makeRequest(method, url, data, headers),
                responseObject = this.$$makeResponse();

            response = config(requestObject, responseObject) || [0];
          }

          return response;
        };
      };

      this.$$setupHttpBackend = function(method, config) {
        return $httpBackend
          .when(method.toUpperCase(), this.$$parser.pattern)
          .respond(this.$$makeResponder(config));
      };

      this.when = function(configs) {
        Object.keys(configs).forEach((method) => {
          this.$$setupHttpBackend(method, configs[method]);
        });
      };

    };
  }
]);