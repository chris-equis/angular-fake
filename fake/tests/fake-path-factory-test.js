describe('Testing FakePath factory', function() {

  var instance,
      FakeUriParser;

  beforeEach(module('fake'));

  beforeEach(inject(function(_FakePath_, _FakeUriParser_) {
    FakeUriParser = _FakeUriParser_;
    instance = new _FakePath_('/libraries/{libraryId}/books/{bookId}');
  }));

  it('Should have a parser instance', function() {
    expect(instance.$$parser instanceof FakeUriParser).toBe(true);
  });

  it('Should create a request Object', function() {
    var request = instance.$$makeRequest(
      'get',
      '/libraries/1/books/2?author=John%20Doe',
      '[{id: 2, name: \'Lorem Ipsum Book\', year: 2010, author: \'John Doe\'}]'
    );

    expect(Object.keys(request.params)).toEqual([ 'path', 'query' ]);
    expect(Object.keys(request.params.path)).toEqual([ 'libraryId', 'bookId' ]);
    expect(Object.keys(request.params.query)).toEqual([ 'author' ]);
  });

  it('Should setup $httpBackend', function() {
    var setup = instance.$$setupHttpBackend('get', function() {});

    expect(typeof setup.respond).toBe('function');
  });

  describe('Creating a Response Object', function() {
    it('That sends nothing', function() {
      var response = instance.$$makeResponse();
      expect(response.send()).toEqual([200]);
    });

    it('That sends only the status', function() {
      var response = instance.$$makeResponse();
      expect(response.send(404)).toEqual([404]);
    });

    it('That sends status and data', function() {
      var response = instance.$$makeResponse();
      expect(response.send(404, { err: true })).toEqual([404, { err: true }]);
    });

  });

  describe('Creating a responder callback', function() {
    var params = ['GET', '/libraries/1/books/2'];

    it('Based on status code', function() {
      var responder = instance.$$makeResponder(200);
      expect(responder.apply(null, params)).toEqual([200]);
    });

    it('Based on a [status, data] Array', function() {
      var responder = instance.$$makeResponder([200, { id: 1 }]);
      expect(responder.apply(null, params)).toEqual([200, { id: 1 }]);
    });

    it('Based on a callback', function() {
      var callback = function(req, res) {
            return res.send(400, { err: 'BAD REQUEST' });
          },
          responder = instance.$$makeResponder(callback);
      expect(responder.apply(null, params)).toEqual([400, { err: 'BAD REQUEST' }]);
    });

  });

});
