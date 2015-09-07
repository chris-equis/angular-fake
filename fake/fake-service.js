require('./fake-path-factory');

angular
.module('fake')
.service('fake', [
  'FakePath',
  function(FakePath) {

    return (path) => {
      return new FakePath(path);
    };
  }
]);