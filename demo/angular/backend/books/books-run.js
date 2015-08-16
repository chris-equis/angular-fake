angular
.module('backend.books')

.run(['fake', 'fakeBooksService', function(fake, fakeBooksService) {

  fake('/books').when({
    get: function(request, response) {
      return response
        .send(200)
        .with(fakeBooksService.retrieveBooks());
    }
  });

  fake('/libraries/{lid}/books').when({
    get: function(request, response) {
      return response
        .send(200)
        .with(fakeBooksService.retrieveBooks({
          libraryId: parseInt(request.params.path.lid)
        }));
    }
  });

}]);