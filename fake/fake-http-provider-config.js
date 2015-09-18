require('./fake-config-provider');

var httpInterceptor = ($q, $timeout, $httpBackend, config, log) => {

  var isHtml = (url = '') => url.match(/\.(html)/ig),
      delay = function(qCallback, response) {
        return $timeout(
          () => qCallback(response),
          isHtml(response.config && response.config.url) ? 0 : config.DELAY
        );
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
      return delay($q.when, response);
    },
    responseError: (err) => {
      log.error(err);
      return delay($q.reject, err);
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