


var SimpleList = artifacts.require("./SimpleList.sol");



  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", function() {
      var contractInstance;
      return SimpleList.deployed().then(function(instance) {
        contractInstance = instance;
        return contractInstance.getEntityCount();
      }).then(function(count) {
        console.log('initial count: ' + count);
        assert.equal(count, 0, "new simple list count should be zero");
        return contractInstance.newEntity.call(101);
      }).then(function(rowNumber) {
        console.log('new enrtity row num: ' + JSON.stringify(rowNumber));
        console.dir(rowNumber);
        assert.equal(rowNumber, 1, "should be row num 1");
        return contractInstance.newEntity.call(201);
      }).then(function(rowNumber) {
        console.log('new enrtity row num: ' + JSON.stringify(rowNumber));
        console.dir(rowNumber);
        //console.dir(auctionsIndex);
        assert.equal(rowNumber, 2, "should be row num 2");
        return contractInstance.getEntityCount();
      }).then(function(count) {
          console.log('final count: ' + count);
          console.dir(count);
        assert.equal(count, 2, "after creating the first two auctions there should be 2 auctions in total");
      });
    });
  });
