describe('Setup with FakeConfigProvider', function() {
  var provider,
      config;

  beforeEach(module('fake'));

  beforeEach(function() {
    module(function(FakeConfigProvider) {
      provider = FakeConfigProvider;
    });
  });

  beforeEach(inject(function(_FakeConfig_) {
    config = _FakeConfig_;
  }));

  it('Should set configuration properties', function() {
    provider.set('DELAY', 1000);
    expect(config.DELAY).toBe(1000);
  });

  it('Should NOT set unknown configuration properties', function() {
    provider.set('UNKNOWN_PROPERTY', 'Some value');
    expect(config.UNKNOWN_PROPERTY).toBeUndefined();
  });

  it('Should set root paths', function() {
    provider
      .path('api', '/api')
      .path('', '/users')
      .path('login', '/login');

    expect(config.PATHS.$api).toBeDefined();
    expect(config.PATHS.$login).toBeDefined();
    expect(Object.keys(config.PATHS).length).toBe(2);
  });

});