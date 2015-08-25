(function() {

  var dependencies = [],
    devMode = true;

  // In production you don't want to mock the requests
  // Note that this may be used with a config file
  // or some compile "directives" when building
  // the production code
  if(devMode) {
    dependencies.push('backend');
  }

  angular
  .module('demo', dependencies)
  .run(['$http', function($http) {

    var roots = {
          login: 'http://login.server.com:9090',
          api: 'http://api.server.com:8080/v1'
        };

    $http.get(roots.login + '/user');

    // HTTP Requests (Libraries)
    $http.get(roots.api + '/libraries');
    $http.get(roots.api + '/libraries?city=London');
    $http.post(roots.api + '/libraries', {name: 'The New Library'});
    $http.get(roots.api + '/libraries/1');
    $http.get(roots.api + '/libraries/500');
    $http.put(roots.api + '/libraries/1', {name: 'New Library'});
    $http.delete(roots.api + '/libraries/1');

    // HTTP Requests (Books)
    $http.get(roots.api + '/books');
    $http.get(roots.api + '/libraries/1/books');
  }]);

})();
