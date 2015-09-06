require('./fake-config-provider');

var httpInterceptor = ($q, $timeout, $httpBackend, config, log) => {
  var { DELAY: delay } = config,
      responder = {
        delay: (response, resolution = 'resolve') => {
          var timeoutParams = [
            () => $q[resolution](response),
            response.config.url.match(/\.(html)/ig) ? 0 : delay
          ];

          return $timeout(...timeoutParams);
        }
      };

  return {
    request: (config) => {
      log.request(config);
      return config;
    },
    requestError: (err) => {
      log.error(err);
      return $q.reject(err);
    },

    response: (response) => {
      log.response(response);
      return responder.delay(response, 'resolve');
    },
    responseError: (err) => {
      log.error(err);
      responder.delay(err, 'reject');
    }
  };
};

var httpProviderConfig = ($httpProvider) => {
  $httpProvider
  .interceptors
  .push(['$q', '$timeout', '$httpBackend', 'FakeConfig', 'fakeLog', httpInterceptor]);
};

angular
.module('fake')
.config(['$httpProvider', httpProviderConfig]);