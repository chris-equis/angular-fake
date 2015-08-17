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

    var apiRoot = 'http://api.test.com:9876/v1.0';

    // HTTP Requests (Libraries)
    $http.get(apiRoot + '/libraries');
    $http.get(apiRoot + '/libraries?city=London');
    $http.post(apiRoot + '/libraries', {name: 'The New Library'});
    $http.get(apiRoot + '/libraries/1');
    $http.get(apiRoot + '/libraries/500');
    $http.put(apiRoot + '/libraries/1', {name: 'New Library'});
    $http.delete(apiRoot + '/libraries/1');

    // HTTP Requests (Books)
    $http.get(apiRoot + '/books');
    $http.get(apiRoot + '/libraries/1/books');
  }]);

})();
