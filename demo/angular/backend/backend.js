angular
.module('backend', [
  'fake',
  'backend.authors',
  'backend.books',
  'backend.libraries'
])

.config(['FakeConfigProvider', function(FakeConfigProvider) {
  FakeConfigProvider
    .set('API_ROOT', 'http://api.test.com:9876/v1.0')
    .set('DELAY', 1000)
    .set('DEBUG', true)
    .set('DEBUG_RESPONSES', true);
}]);