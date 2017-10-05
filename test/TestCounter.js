var Counter = artifacts.require("./Counter.sol");

contract('Counter', function(accounts) {
  it("should start counter at zero", function() {
    return Counter.deployed().then(function(instance) {
      return instance.getCount();
    }).then(function(count) {
      assert.equal(count.valueOf(), 0, "counter should start at zero");
    });
  });
  it("should increment counter by 1", function() {

    var counter;
    return Counter.deployed().then(function(instance) {
      counter = instance;
      return counter.increment(1);
    }).then(function() {
      return counter.getCount();
    }).then(function(count) {
        assert.equal(count.valueOf(), 1, "counter should increment to 1");
    });
  });
});
