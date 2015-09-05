require('./fake-config-provider');

angular
.module('fake')
.service('fakeLog', [
  'FakeConfig',
  function(FakeConfig) {

    let {
          DEBUG,
          DEBUG_REQUESTS,
          DEBUG_RESPONSES,
          DEBUG_PASSED_THROUGH_EXTENSIONS
        } = FakeConfig,

        styles = {
          request: 'color: blue',
          response: 'color: green',
          error: 'color: red'
        },

        debugMethods = Object
          .keys(FakeConfig)
          .filter((key) => /DEBUG_METHOD_/g.test(key) && FakeConfig[key])
          .map((key) => key.replace('DEBUG_METHOD_', '')),

        debugCondition = (...conditions) => {
          conditions.push(DEBUG);
          return !conditions.some(condition => condition === false);
        };

    this.request = (request) => {
      let {method, data, url, headers} = request;
      if(debugCondition(DEBUG_REQUESTS, !!~debugMethods.indexOf(method))) {
        console.groupCollapsed('%c' + method, styles.request, url);
        console.log('Method:', method);
        console.log('URL:', url);
        console.log('Data:', JSON.stringify(data));
        console.log('Headers:', JSON.stringify(headers));
        console.log('Request:', request);
        console.groupEnd();
      }
    };

    this.response = (response) => {
      let {method, url, data, headers} = response.config;
      if(debugCondition(DEBUG_RESPONSES, !!~debugMethods.indexOf(method))) {
        console.groupCollapsed('%c' + method, styles.response, url, response.status);
        console.log('Method:', method);
        console.log('URL:', url);
        console.log('Data:', JSON.stringify(data));
        console.log('Headers:', JSON.stringify(headers));
        console.log('Response:', response);
        console.groupEnd();
      }
    };

    this.error = (err) => {
      let {method, url, data, headers} = err.config || err;
      if(debugCondition(!!~debugMethods.indexOf(method))) {
        console.groupCollapsed('%c' + method, styles.error, url, err.status);
        console.log(err);
        console.log('Method:', method);
        console.log('URL:', url);
        console.log('Data:', JSON.stringify(data));
        console.log('Headers:', JSON.stringify(headers));
        console.log('Response:', err);
        console.groupEnd();
      }
    };
  }
]);