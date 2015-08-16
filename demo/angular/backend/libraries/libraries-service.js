angular
.module('backend.libraries')

.service('fakeLibrariesService', [function() {

  var id = 1,
      makeLibrary = function(id, name) {
        return {
          id: id++,
          name: chance.name() + ' Library',
          city: chance.pick(['London', 'Paris', 'Amsterdam']),
          address: chance.address()
        };
      },
      libraries = _.range(1, chance.natural({ min: 1, max: 99 })).map(makeLibrary);

  this.retrieveLibraries = function(query) {
    return _.isObject(query)
      ? libraries.filter(function(library) { return _.matches(query)(library); })
      : libraries;
  };

  this.retrieveLibrary = function(id) {
    return libraries.filter(function(library) {
      return library.id === id;
    })[0];
  };

  this.createLibrary = function(data) {
    var library = makeLibrary();
    _.assign(library, data);
    libraries.push(library);
    return library;
  };

  this.updateLibrary = function(id, data) {
    var library = this.retrieveLibrary(id);
    library && _.assign(library, data);
    return library;
  };

  this.deleteLibrary = function(id) {
    var library = this.retrieveLibrary(id);
    return !!(library && libraries.splice(libraries.indexOf(library), 1));
  };

}]);