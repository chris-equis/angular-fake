require('./fake-config-provider');
require('./fake-uri-parser-factory');

angular
.module('fake')

.factory('FakePath', [

  '$httpBackend',
  'FakeConfig',
  'FakeUriParser',

  function($httpBackend, FakeConfig, FakeUriParser) {

    return function(path) {
      var parser = new FakeUriParser(path),
          createRequestObject = function(method, url, data, headers) {
            var request = {
                  method: method,
                  url: url,
                  data: data,
                  headers: headers,
                  params: parser.parse(url)
                };

            try { request.data = JSON.parse(data); }
            catch(e) { /* Nothing to really catch here */ }

            return request;
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
              var response = callback.apply(null, [
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

      this.ignore = function() {}
    };
  }
]);