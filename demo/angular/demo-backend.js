angular
.module('demoBackend', ['fake'])
.config(['FakeProvider', function(FakeProvider) {
  FakeProvider
    .set('DELAY', 0)
    .set('DEBUG', true)
    .set('DEBUG_RESPONSES', true);
}])
.service('myFakeLibraryService', function() {

  var libraries = [
    {id: '1', name: 'National Library'},
    {id: '2', name: 'Alexandria Library'}
  ];

  this.retrieveLibraries = function(query) { return libraries; };
  this.retrieveLibrary = function(id) { return libraries.filter(function(lib) {
    return lib.id === id;
  })[0]; };
  this.createLibrary = function(name) { return { id: 3, name: name }; };
  this.updateLibrary = function(name) { return { id: 4, name: name }; };
  this.deleteLibrary = function() { return true; }
})
.service('myFakeBooksService', function() {
  var books = [
    {id: 101, name: 'Lorem Ipsum', year: 2010, author: 'John Doe'},
    {id: 102, name: 'Lorem Ipsum 2', year: 2011, author: 'Jane Doe'}
  ];

  this.retrieveBooks = function() {
    return books;
  };
})
.run(['fake', 'myFakeLibraryService', 'myFakeBooksService', function(fake, myFakeLibraryService, myFakeBooksService) {

  fake('/libraries').when({
    get: function(request, response) {
      return response
        .send(200)
        .with(myFakeLibraryService
          .retrieveLibraries(request.params.query));
    },
    post: function(request, response) {
      return response
        .send(200)
        .with(myFakeLibraryService
          .createLibrary(request.data.name));
    }
  });

  fake('/libraries/{libraryId}').when({
    get: function(request, response) {
      var
        libraryId = request.params.path.libraryId,
        library = myFakeLibraryService
          .retrieveLibrary(libraryId);

      response.status  = library ? 200 : 404;
      response.data = library;

      return response;
    },
    put: function(request, response) {
      return response.send(200);
    },
    delete: function(request, response) {
      return response.send(202);
    }
  });

  fake('/libraries/{libraryId}/books').when({
    get: function(request, response) {
      console.log(request);
      return response.send(200).with(myFakeBooksService.retrieveBooks());
    }
  })

}]);