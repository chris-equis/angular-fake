describe('Testing FakePath factory', function() {

  var instance,
      FakeUriParser,
      $http,
      $httpBackend,
      $rootScope;

  beforeEach(module('fake'));

  beforeEach(inject(function(_FakePath_, _FakeUriParser_, _$http_, _$httpBackend_, _$rootScope_) {
    FakeUriParser = _FakeUriParser_;
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    instance = new _FakePath_('/libraries/{libraryId}/books/{bookId}');
  }));

  it('Should have a parser instance', function() {
    expect(instance.$$parser instanceof FakeUriParser).toBe(true);
  });

  it('Should create a request Object', function() {
    var request = instance.$$createRequestObject(
      'get',
      '/libraries/1/books/2?author=John%20Doe',
      '[{id: 2, name: \'Lorem Ipsum Book\', year: 2010, author: \'John Doe\'}]'
    );

    expect(Object.keys(request.params)).toEqual([ 'path', 'query' ]);
    expect(Object.keys(request.params.path)).toEqual([ 'libraryId', 'bookId' ]);
    expect(Object.keys(request.params.query)).toEqual([ 'author' ]);
  });

  it('Should create a response Object', function() {
    var response = instance.$$createResponseObject();

    expect(response.status).toBe(200);
    expect(response.data).toBe(null);

    expect(response.send(400).status).toBe(400);
    expect(response.send(200).with('data').data).toBe('data');
  });

  it('Should create a respond callback', function() {
    var callback = function(req, res) {
          return res.send(200).with({ id: 1 });
        },
        respond = instance.$$createRespondCallback(callback);

    expect(typeof respond).toBe('function');
    expect(respond('GET', '/libraries/1/books/2')).toEqual([200, { id: 1 }]);
  });

  it('Should setup $httpBackend', function() {
    var setup = instance.$$setupHttpBackend('get', function() {});

    expect(typeof setup.respond).toBe('function');
  });

});
