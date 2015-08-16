angular
.module('backend.books')

.service('fakeBooksService', ['fakeLibrariesService', function(fakeLibrariesService) {

  var id = 1,
      libraryIds = fakeLibrariesService.retrieveLibraries().map(function(library) {
        return library.id;
      }),
      makeBook = function() {
        return {
          id: id++,
          name: chance.sentence({words: chance.natural({min: 1, max: 3})}),
          author: chance.name(),
          volumes: chance.natural({min: 1, max: 3}),
          libraryId: chance.pick(libraryIds),
          year: chance.natural({min: 1800, max: 2015})
        };
      },
      books = _.range(1, chance.natural({min: 1, max: 99})).map(makeBook);


  this.retrieveBooks = function(query) {
    return _.isObject(query)
      ? books.filter(function(book) { return _.matches(query)(book); })
      : books;
  };

  this.retrieveBook = function(id) {
    return books.filter(function(book) {
      return book.id === id;
    });
  };

  console.log();

}]);