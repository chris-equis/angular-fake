require('./fake-config-provider');

angular
.module('fake')
.factory('FakeUriParser', [
  'FakeConfig',
  (FakeConfig) => {
    let {PATHS: rootPaths} = FakeConfig,
        patterns = {
          param: /\{[a-z0-9\-\_]+\}/ig,
          root: /^(\$[a-z0-9\-\_]+)/i
        };

    return class FakeUriParser {

      constructor(path) {
        let paramMatches = (path.toString().match(patterns.param) || []),
            rootNameMatch = (path.toString().match(patterns.root)),
            rootName = rootNameMatch ? rootNameMatch[0] : '',
            rootPath = rootPaths[rootName] || '',

            escape = (string) => (string || '').replace(/([\/\:\.])/g, '\\$1');

        this.params = paramMatches
          .map((param) => param.replace(/[\{\}]/g, ''));

        this.pattern = new RegExp(
          '^' +
          escape(rootPath) +
          escape(path)
            .replace(patterns.root, '')
            .replace(patterns.param, '([a-z0-9\\-\\_]+)') +
          '(\\?.*)?$');
      }

      getPathParams(uri) {
        var paramValues = (uri.toString().match(this.pattern) || [])
              .filter((match, index) => index > 0 && index <= this.params.length);

        return this
          .params
          .reduce((paramsObject, paramName, index) => {
            paramsObject[paramName] = decodeURI(paramValues[index]);
            return paramsObject;
          }, {});
      }

      getQueryParams(uri) 
        return ((uri.toString().match(/\?.*/) || [])[0] || '')
          .replace(/\?/g, '')
          .split('&')
          .reduce((paramsObject, keyValueString) => {
            var keyValuePair = keyValueString.split('='),
                key = keyValuePair[0], // ''
                value = keyValuePair[1] ? decodeURI(keyValuePair[1]) : '';

            key && (paramsObject[key] = value);

            return paramsObject;
          }, {});
      }

      parse(uri) {
        return {
          path: this.getPathParams(uri),
          query: this.getQueryParams(uri)
        };
      }
    };
  }
]);