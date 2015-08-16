(function() {

  var demoModuleDependencies = [],
    devMode = true;

  // In production you don't want to mock the requests
  // Note that this may be used with a config file
  // or some compile "directives" when building
  // the production code
  if(devMode) {
    demoModuleDependencies.push('demoBackend');
  }

  angular
  .module('demo', demoModuleDependencies)
  .run(['$http', function($http) {

    // HTTP Requests (Libraries)
    $http.get('/libraries');
    $http.get('/libraries?city=London');
    $http.post('/libraries', {name: 'New Library'});
    $http.get('/libraries/1');
    $http.get('/libraries/5');
    $http.put('/libraries/1', {name: 'New Library'});
    $http.delete('/libraries/1');

    // HTTP Requests (Books)
    $http.get('/libraries/1/books?year=2010&author=John%20Doe');
  }]);

})();
