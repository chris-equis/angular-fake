angular
.module('fake', ['ngMockE2E'])
.run([
  '$httpBackend',
  'FakeConfig',
  ($httpBackend, FakeConfig) => {
    var extensions = (FakeConfig.PASS_THROUGH_EXTENSIONS || []).join('|');

    $httpBackend
      .when('GET', new RegExp(`.(${extensions})`, 'ig'))
      .passThrough();

  }
]);

require('./fake-http-backend-config');
require('./fake-config-provider');
require('./fake-log-service');
require('./fake-service');
