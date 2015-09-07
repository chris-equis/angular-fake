describe('Testing FakeUriParser factory', function() {
  var parsers = {},
      FakeUriParser,
      paramRegExpString = '([a-z0-9\\-\\_]+)',
      queryRegExpString = '(\\?.*)?';

  beforeEach(function() {
    angular
    .module('test', ['fake'])
    .config(['FakeConfigProvider', function(FakeConfig) {
      FakeConfig.path('root', 'http://api.example.com:8080/v1');
    }]);
    module('test');
  });

  beforeEach(inject(function(_FakeUriParser_) {
    FakeUriParser = _FakeUriParser_;

    parsers['libraries'] = new FakeUriParser('/libraries');
    parsers['library'] = new FakeUriParser('/libraries/{libraryId}');
    parsers['books'] = new FakeUriParser('/libraries/{libraryId}/books');
    parsers['book'] = new FakeUriParser('/libraries/{libraryId}/books/{bookId}');
    parsers['user'] = new FakeUriParser('$root/users/{uid}');

    // @TODO: Test some invalid parsers like '/users/{}/profiles'
  }));

  it('Should extract path param names/keys', function() {
    var tests = [
      { parser: 'library', params: ['libraryId'] },
      { parser: 'books', params: ['libraryId'] },
      { parser: 'book', params: ['libraryId', 'bookId'] }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].params).toEqual(test.params);
    });
  });

  it('Should match URLs', function() {
    var tests = [
      { parser: 'libraries', url: '/libraries' },
      { parser: 'libraries', url: '/libraries?city=London' },
      { parser: 'library', url: '/libraries/1' },
      { parser: 'library', url: '/libraries/1?fields=name&' },
      { parser: 'books', url: '/libraries/1/books?author=John%20Doe' },
      { parser: 'user', url: 'http://api.example.com:8080/v1/users/1' }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].pattern.test(test.url)).toBe(true);
    });
  });

  it('Should NOT match URLs', function() {
    var tests = [
      { parser: 'libraries', url: '/libraries/1' },
      { parser: 'books', url: '/libraries/1/books/2?author=John%20Doe' },
      { parser: 'user', url: 'http://api.example.com:8080/v1/users' },
      { parser: 'user', url: 'http://api.example.com:9000/v1/users/1' }
    ];

    tests.forEach(function(test) {
      expect(parsers[test.parser].pattern.test(test.url)).toBe(false);
    });
  });

  it('Should get path params after parsing URI', function() {
    var tests = [
      { parser: 'libraries', url: '/', expected: {} },
      { parser: 'libraries', url: '/libraries', expected: {} },
      { parser: 'library', url: '/libraries/1', expected: { libraryId: '1' } },
      { parser: 'books', url: '/libraries/1/books', expected: { libraryId: '1' } },
      { parser: 'book', url: '/libraries/1/books/2?test=query', expected: { libraryId: '1', bookId: '2' } },
      { parser: 'user', url: 'http://api.example.com:8080/v1/users/1', expected: { uid: '1' } },
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