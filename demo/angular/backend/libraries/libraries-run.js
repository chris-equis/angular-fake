angular
.module('backend.libraries')

.run(['fake', 'fakeLibrariesService', function(fake, fakeLibrariesService) {

  fake('$api/libraries').when({
    get: function(request, response) {
      var libraries = fakeLibrariesService
            .retrieveLibraries(request.params.query);

      return response.send(200, libraries);
    },
    post: function(request, response) {
      var library = fakeLibrariesService
            .createLibrary(request.data.name);

      return response.send(200, library);
    }
  });

  fake('$api/libraries/{libraryId}').when({
    get: function(request, response) {
      var libraryId = parseInt(request.params.path.libraryId),
          library = fakeLibrariesService.retrieveLibrary(libraryId);

      return response.send(library ? 200 : 404, library);
    },
    put: 200,
    delete: 202
  });

}]);