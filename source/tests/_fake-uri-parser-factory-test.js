describe('Testing FakeUriParser factory', function() {
  var parsers = {},
      FakeUriParser,
      paramRegExpString = '([a-z0-9\\-\\_]+)',
      queryRegExpString = '(\\?.*)?';

  beforeEach(module('fake'));

  beforeEach(inject(function(_FakeUriParser_) {
    FakeUriParser = _FakeUriParser_;
    parsers['libraries'] = new FakeUriParser('/libraries');
    parsers['library'] = new FakeUriParser('/libraries/{libraryId}');
    parsers['books'] = new FakeUriParser('/libraries/{libraryId}/books');
    parsers['book'] = new FakeUriParser('/libraries/{libraryId}/books/{bookId}');
  }));


  it('Should extract path param names/keys', function() {
    expect(parsers.library.params).toEqual(['libraryId']);
    expect(parsers.books.params).toEqual(['libraryId']);
    expect(parsers.book.params).toEqual(['libraryId', 'bookId']);
  });

  it('Should created a pattern', function() {
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

  it('Should get path params after parsing URI', function() {
    var tests = [
      { parser: 'libraries', url: '/', expected: {} },
      { parser: 'libraries', url: '/libraries', expected: {} },
      { parser: 'library', url: '/libraries/1', expected: { libraryId: '1' } },
      { parser: 'books', url: '/libraries/1/books', expected: { libraryId: '1' } },
      { parser: 'book', url: '/libraries/1/books/2?test=query', expected: { libraryId: '1', bookId: '2' } }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].getPathParams(test.url)).toEqual(test.expected);
    });
  });

  it('Should get query params after parsing URI', function() {
    var tests = [
      { parser: 'library', url: '/libraries/1?', expected: {} },
      { parser: 'library', url: '/libraries/1?&', expected: {} },
      { parser: 'library', url: '/libraries/1?test', expected: { test: '' } },
      { parser: 'library', url: '/libraries/1?test&', expected: { test: '' } },
      { parser: 'library', url: '/libraries/1?field=name', expected: { field: 'name' } },

      { parser: 'book', url: '/libraries/1/books/2', expected: {} },
      { parser: 'books', url: '/libraries/1/books?author=John%20Doe', expected: { author: 'John Doe' } },
      { parser: 'book', url: '/libraries/1/books/2?author=John%20Doe&year=2010', expected: {
        author: 'John Doe',
        year: '2010' } }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].getQueryParams(test.url)).toEqual(test.expected);
    });

  });

  it('Should get both, path and query params after parsing URI', function() {
    var tests = [
      { parser: 'book', url: '/libraries/1/books/2?author=John%20Doe&year=2010',
        expected: {
          path: { libraryId: '1', bookId: '2' },
          query: { author: 'John Doe', year: '2010' }
        }
      },
      { parser: 'libraries', url: '/libraries?x&y&z',
        expected: {
          path: {},
          query: { x: '', y: '', z: '' }
        }
      }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].parse(test.url)).toEqual(test.expected);
    })
  });
});