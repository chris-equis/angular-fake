
Angular Fake
===
An AngularJS module that helps you define **mocked** responses for REST API requests from your client application.

It dependes on `ngMockE2E` module and uses its `$httpBackend` service  in order to define mock responses as `$httpBackend.when(<method>, <pattern>).respond(<callback>);`.

Usage
---
**Create your own backend module**

I strongly recommend to create a new Angular (reffered below as `backend`) module dependent on `fake` module in order to configure it and use it independent from your application module, but just to include it when needed (e.g. in development mode).

```javascript
// Backend module declaration
// that may depend on other sub-modules
angular.module('your.application.backend', ['fake']);

// Your application bootstrap module
angular.module('your.application', ['your.application.backend']);
```

To exclude `backend` module in production so you'll probably want to use either [gulp-reprocess](https://www.npmjs.com/package/gulp-preprocess) or [grunt-preprocess](https://www.npmjs.com/package/grunt-preprocess).

```html
<!-- @if NODE_ENV='development' -->
<script src="your/application/backend/backend.js"></script> 
<!-- @endif -->
```

```javascript
var dependencies = ['your.application.module'];

// @ifdef DEBUG 
dependencies.push('your.application.backend');
// @endif

angular.module('your.application', dependencies);
```
---
**Configure fake module**

To configure the `fake` module use `FakeConfigProvider`

```javascript
angular
.module('your.application.backend', ['fake'])
.config(['FakeConfigProvider', function(FakeConfigProvider) {
  FakeConfigProvider
    .set('DELAY', 0)
    .set('DEBUG', true)
    .set('DEBUG_REQUESTS', true)
    .set('DEBUG_RESPONSES', true)
    .path('login', 'http://login.server.com:9090')
    .path('api', 'http://api.server.com:8080/v1');
}]);
```

*`FakeConfigProvider` properties*

 - **`DELAY`** delay responses by the value specified, default is `0`
 - **`DEBUG`** either to show debug details in console, default is `false`
 - **`DEBUG_REQUESTS`** displays request details, default is `false`, works only when `DEBUG=true`
 - **`DEBUG_RESPONSES`** displays response details, default is `true`, works only when `DEBUG=true`
 - **`PASS_THROUGH_EXTENSIONS`** requesting the files with specified extensions will pass through (they will not be intercepted), default is `['html', 'svg', 'json']`
 - **`PATHS`** root paths defined for your application (multiple paths allowed), default is `{}`

> **Note** that you cannot set this properties directly. Instead you can use `set()` or `path()` methods:

 - **`set`**`(property, value)`, e.g. `set('DEBUG', true);`
 - **`path`**`(name, url)`, e.g. `path('api', 'http://my.api.com:80/v1');`

> **Note** that you can also set paths using `set()` method:

```javascript
FakeConfigProvider.set('PATHS', {
  $api: 'http://my.api.com:80/v1',
  $login: 'http://login.api.com:80/v1'
});
```
---
**Define requests to mock**

In order to define mocked responses for requests, inject `fake` service in `backend`'s module `run()` definition:

`fake` service is a function that when called with a *path pattern* returns an Object with a single method so you can pass a *configuration* Object.

```javascript
angular
.module('your.application.backend')
.run(function(fake) {
  fake('$api/libraries').when({
    get: function(request, response) {
      return response.send(200, { name: 'John Doe' })
    }
  });
});
```

**Path pattern**

The path pattern is a string that can map a REST API endpoint.
> `'$api/libraries/{libraryId}/books/{bookId}'`. 

If there are paths defined in the `config` of `FakeConfigProvider` (e.g. `$path`), will be used as root paths within path pattern.

> If we configured `$api` to be `'http://my.api.com:80/v1'`, the example above will match REST API endpoint like:
> `http://my.api.com:80/v1/libraries/1/books/2` or
> `http://my.api.com:80/v1/libraries/1/books/2?chapters=4` or
> `http://my.api.com:80/v1/libraries/1/books/2?foreword`

**Configuration Object**

Configuration Object is used to mock HTTP methods, each key being a method name and the value may vary from a status code, an array with the first element the status code and the second the data to send or a *respond callback*:
```javascript
fake('$api/libraries/{libraryId}/books/{bookId}')
  .when({
    
    // pass only the status code to return
    head: 200, 
    
    // pass an array with status code and data
    get: [200, { id: 1, title: 'Lorem ipsum', author: 'John Doe' }],
    
    // pass a function
    post: function(request, response) {
      var data = {
        id: request.params.bookId,
        title: 'Lorem Ipsum'
      };
      return response.send(200, data);
  }
  });
```

**Respond callback**

The respond callback recieves two parameters `request` Object and `response` Object.

*Request Object*

Request Object has request related properties such as `method`, `url`, `data` - request body, `headers` (the same properties that the respond callback of  `$httpBackend.when` declaration) but also an important Object `params` that has all the mapped parameters and query string Object of the intercepted URL.

```javascript
// Request Object example for
// path pattern `$api/libraries/{libraryId}/books/{bookId}`
// when matching `http://my.api.com:80/v1/libraries/1/books/2?chapters=4&title`
{
  // Request method
  method: 'GET',
  
  // Request URL
  url: 'http://my.api.com:80/v1/libraries/1/books/2',
  
  // Request Body
  data: undefined,
  
  // Request Headers
  headers: { Accept: 'application/json, text/plain, */*' },
  
  // Request Params
  params: {
    
    // Params from path, defined between {}, e.g. {libraryId}
    path: {
      libraryId: '1',
      bookId: '2'
    },
  
    // Query params
    query: {
      chapters: '4',
      title: ''
    }
  }
}
```

*Response Object*

The response Object provides only a function in order to set a response to be sent:

```javascript
function(request, response) {
  return response.send(200, { id: 1 });
}
```
---
**Using services to generate data**

You can use complex services to generate mocked data based on the `params` object provided.


```javascript
angular
.module('backend', ['fake'])
.service('fakeBooks', function() {
  // using some lodash functionality
  // Generate a book
  this.generateBook = function(id) {
    return {
      id: id || _.uniqueId(),
      title: 'Randomly generated title'
    };
  };
  // Generate a list of books
  this.generateBooks = function(count) {
    var _this = this;
    return _.range(0, count).map(function() {
      return _this.generateBook(_.uniqueId());
    });
  };
})
.run(function(fakeBooks) {
  // Configure methods to mock /books endpoint results
  fake('/books').when({
    // Retrieve list of books
    get: [200, fakeBooks.generateBooks(5)],
    // Create a new book
    post: [200, fakeBooks.generateBook()]
  });

  // Configure methods to mock /books/ID endpoint result
  fake('/books/{bookId}').when({
    // Retrieve book
    get: function(request, response) {
      var bookId = request.params.path.bookId,
          book = fakeBooks.generateBook(bookId)
      return response.send(200, book);
    },
    // Update book
    put: function(request, response) {
      var bookId = request.params.path.bookId,
          book = fakeBooks.generateBook(bookId);
      // Update book Object properties
      // using request.data (request body) sent
      return response.send(200, book);
    },
    // Delete a book
    delete: 204
  });
});
```
You can also generate an amount of data, when running the service (a list of books) and on querying them you can provide status codes like 404 when a book object was not found within the list.

*Using libraries to generate data*
You can easily use [Chance JS](http://chancejs.com/) to generate numbers, names, paragraphs and many more and also [lodash](https://lodash.com/) that will help in working with ranges, arrays and so on.
