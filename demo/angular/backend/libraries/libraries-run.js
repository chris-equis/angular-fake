angular
.module('backend.libraries')

.run(['fake', 'fakeLibrariesService', function(fake, fakeLibrariesService) {

  fake('/libraries').when({
    get: function(request, response) {
      return response
        .send(200)
        .with(fakeLibrariesService
          .retrieveLibraries(request.params.query));
    },
    post: function(request, response) {
      return response
        .send(200)
        .with(fakeLibrariesService
          .createLibrary(request.data.name));
    }
  });

  fake('/libraries/{libraryId}').when({
    get: function(request, response) {
      var
        libraryId = parseInt(request.params.path.libraryId),
        library = fakeLibrariesService
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

}]);