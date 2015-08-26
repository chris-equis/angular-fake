describe('Testing FakeUriParser factory', function() {
  var parsers = {},
      paramRegExpString = '([a-z0-9\\-\\_]+)',
      queryRegExpString = '(\\?.*)?';

  beforeEach(module('fake'));

  beforeEach(inject(function(_FakeUriParser_) {
    parsers.library = new _FakeUriParser_('/libraries/{libraryId}');
    parsers.books = new _FakeUriParser_('/libraries/{libraryId}/books');
    parsers.book = new _FakeUriParser_('/libraries/{libraryId}/books/{bookId}');
  }));


  it('Should have extract params', function() {
    expect(parsers.library.params).toEqual(['libraryId']);
    expect(parsers.books.params).toEqual(['libraryId']);
    expect(parsers.book.params).toEqual(['libraryId', 'bookId']);
  });

  it('Should have created a pattern', function() {
    var libraryRegExp = new RegExp(
          '^\\/libraries\\/' + paramRegExpString + queryRegExpString + '$'),

        booksRegExp = new RegExp(
          '^\\/libraries\\/' + paramRegExpString +
          '\\/books' + queryRegExpString + '$'),

        bookRegExp = new RegExp(
          '^\\/libraries\\/' + paramRegExpString +
          '\\/books\\/' + paramRegExpString + queryRegExpString + '$');

    expect(parsers.library.pattern).toEqual(libraryRegExp);
    expect(parsers.books.pattern).toEqual(booksRegExp);
    expect(parsers.book.pattern).toEqual(bookRegExp);
  });

  it('Should parse path params from URI', function() {
    expect(parsers.library.getPathParams('/libraries/1')).toEqual({libraryId: '1'});
    expect(parsers.books.getPathParams('/libraries/1/books')).toEqual({libraryId: '1'});
    expect(parsers.book.getPathParams('/libraries/1/books/2')).toEqual({libraryId: '1', bookId: '2'});
  });

  it('Should parse query params from URI', function() {
    expect(parsers.library.getQueryParams('/libraries/1?test'))
      .toEqual({ test: '' });

    expect(parsers.library.getQueryParams('/libraries/1?field=name'))
      .toEqual({ field: 'name' });

    expect(parsers.books.getQueryParams('/libraries/1/books?author=John%20Doe'))
      .toEqual({ author: 'John Doe' });

    expect(parsers.book.getQueryParams('/libraries/1/books/2?author=John%20Doe&year=2010'))
      .toEqual({ author: 'John Doe', year: '2010' });

    expect(parsers.book.getQueryParams('/libraries/1/books/2'))
      .toEqual({});

    expect(parsers.library.getQueryParams('/libraries/1?'))
      .toEqual({});

    expect(parsers.library.getQueryParams('/libraries/1?&'))
      .toEqual({});

    expect(parsers.library.getQueryParams('/libraries/1?test&'))
      .toEqual({ test: '' });
  });

  it('Should parse both, path and query params', function() {
    expect(parsers.book.parse('/libraries/1/books/2?author=John%20Doe&year=2010')).toEqual({
      path: { libraryId: '1', bookId: '2' },
      query: { author: 'John Doe', year: '2010' }
    });
  });
});