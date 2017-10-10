


var SimpleList = artifacts.require("./SimpleList.sol");

  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", function() {
      var contractInstance;
      return SimpleList.deployed().then(function(instance) {
        contractInstance = instance;
        //console.dir(instance);
        return contractInstance.getEntityCount();
      }).then(function(count) {
        console.log('initial entity count: ' + count);
        assert.equal(count, 0, "initial entity count should be zero");
        return contractInstance.newEntity('a1', 101);
      }).then(function(tx) {
        console.log('tx promise: ' + JSON.stringify(tx));
        //assert.equal(rowNumber, 0, "should be one entity in array");
        return contractInstance.contract._eth.getTransaction(tx.tx);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        var rowNumber = tx.value;
        console.log('first entity row num: ' + rowNumber);
        //assert.equal(rowNumber, 1, "returned row number for first created entity expected to be 1");
        return contractInstance.getEntityCount();
      }).then(function(count) {
        console.log('array count: ' + count);
        assert.equal(count, 1, "should be 1 entities in array");
        return contractInstance.newEntity('a1', 101);
      }).then(function(tx) {
        console.log('tx promise:: ' + JSON.stringify(tx));
        return contractInstance.contract._eth.getTransaction(tx.tx);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        var rowNumber = tx.value;
        console.log('second entity row num: ' + rowNumber);
        //assert.equal(rowNumber, 2, "returned row number for second created entity expected to be 2");
        return contractInstance.getEntityCount();
      }).then(function(count) {
        console.log('final array count: ' + JSON.stringify(count));
        assert.equal(count, 2, "should be 2 entities in array");
      });
    });
  });
