describe('Fake Backend', function() {

  var $http,
      $httpBackend,
      response;

  beforeEach(function() {

    angular
      // Replacing 'ngMockE2E' with 'ngMock' module depdendency
      // makes it work ( along with $httpBackend.flush() )
      .module('backend', ['ngMock'])
      .run(['$httpBackend', function($httpBackend) {
        $httpBackend
          .when('POST', '/login')
          .respond(200, {
            token: '1q2w3e'
          });
      }]);

    module('backend');
  });
      , function($state, $scope, $filter, $q, pageHelper, demographicsProcessor, campaignReport) {
  beforeEach(inject(function($injector) {

    $http = $injector.get('$http');
    $httpBackend = $injector.get('$httpBackend');

    // $httpBackend.when('POST', '/login').passThrough();
    console.log($httpBackend.when('POST', '/login'));

    $http
      .post('/login')
      .then(function(res) {
        // no LOG displayed in the Console
        // unless 'ngMock' is a dependency
        console.log('success?');
        response = res;
      })
      .finally(function() {
        // no LOG displayed in the Console
        // unless 'ngMock' is a dependency
        console.log('finally?');
      });

    // Running $httpBackend.flush()
    // results in 'No pending requests to flush!'
    // when used with 'ngMockE2E'
    // $httpBackend.flush();
  }));

  it('Should do something', function() {
    //console.log(response);
    // fails with ngMockE2E
    // passes with ngMock
    //expect(response.data).toEqual({ token: '1q2w3e' });
  });

});