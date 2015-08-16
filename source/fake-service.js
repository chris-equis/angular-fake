angular
.module('fake')

.service('fake', ['FakePath', function(FakePath) {

  return function(path) {
    return new FakePath(path);
  };

}]);