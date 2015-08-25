angular
.module('backend', [
  'fake',
  'backend.authors',
  'backend.books',
  'backend.libraries'
])

.config(['FakeConfigProvider', function(FakeConfigProvider) {
  FakeConfigProvider
    .set('DELAY', 1000)
    .set('DEBUG', true)
    .set('DEBUG_RESPONSES', true)
    .path('login', 'http://login.server.com:9090')
    .path('api', 'http://api.server.com:8080/v1');
}])

.run(['fake', function(fake) {

  var userLoginWhenGetCallback = function(request, response) {
        return response
          .send(200)
          .with({
            name: 'John Doe'
          });
      };

  fake('$login/user').when({
    get: userLoginWhenGetCallback
  });

}]);