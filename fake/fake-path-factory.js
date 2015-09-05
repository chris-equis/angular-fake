require('./fake-uri-parser-factory');

angular
.module('fake')
.factory('FakePath', [
  '$httpBackend',
  'FakeUriParser',
  ($httpBackend, FakeUriParser) => {

    return function(path) {
      var parser = new FakeUriParser(path),
          createRequestObject = (method, url, data, headers) => {
            return {
              method: method,
              url: url,
              data: data,
              headers: headers,
              params: parser.parse(url)
            };
          },
          createResponseObject = () => {
            return {
              send: (status = 200, data = null) => [status, data]
            };
          },
          createRespondCallback = (config) => {
            return (method, url, data, headers) => {
              let response = [200];

              if(angular.isArray(config) && angular.isNumber(config[0])) {
                response = config;
              } else if(angular.isNumber(config)) {
                response = [config];
              } else if(angular.isFunction(config)) {
                let requestObject = createRequestObject(method, url, data, headers),
                    responseObject = createResponseObject();

                response = config(requestObject, responseObject);
              }

              return response;
            };
          },
          setupHttpBackend = (method, config) => {
            return $httpBackend
              .when(method.toUpperCase(), parser.pattern)
              .respond(createRespondCallback(config));
          };

      this.parser = new FakeUriParser(path);

      this.when = function(configs) {
        Object.keys(configs).forEach((method) => {
          setupHttpBackend(method, configs[method]);
        });
      };

    };
  }
]);