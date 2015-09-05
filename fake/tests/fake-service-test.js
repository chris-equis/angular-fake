describe('Fake Service functionality', function() {

  var instance, fake, FakePath;

  beforeEach(module('fake'));
  beforeEach(inject(function(_fake_, _FakePath_) {
    fake = _fake_;
    FakePath = _FakePath_;
    instance = fake('/libraries');
  }));

  it('Should be a function', function() {
    expect(typeof fake).toBe('function');
  });

  it('Should be a FakePath instance, after called', function() {
    expect(instance instanceof FakePath).toBe(true);
  });

  it('Should have when() method', function() {
    expect(typeof instance.when).toBe('function');
  })

});