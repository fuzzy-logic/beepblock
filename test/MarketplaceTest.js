


var Marketplace = artifacts.require("./Marketplace.sol");



  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", function() {
      var marketplaceInstance;
      return Marketplace.deployed().then(function(instance) {
        marketplaceInstance = instance;
        return instance.numAuctions();
      }).then(function(auctions) {
        console.log('initial num auctions: ' + auctions);
        assert.equal(auctions, 0, "a newly created marketplace should have zero auctions");
        return marketplaceInstance.createAuction.call(1, 120);
      }).then(function(auctionsIndex) {
        console.log('auctionsIndex: ' + JSON.stringify(auctionsIndex));
        assert.equal(auctionsIndex.length, 1, "should be one auction in index");
        return marketplaceInstance.createAuction.call(2, 110);
      }).then(function(auctionsIndex) {
        console.log('auctionsIndex: ' + JSON.stringify(auctionsIndex));
        assert.equal(auctionsIndex.length, 2, "should be two auctions in index");
        return marketplaceInstance.numAuctions();
      }).then(function(auctions) {
        console.log('num auctions: ' + JSON.stringify(auctions));
        console.dir(auctions);
        assert.equal(auctions, 2, "after creating the first two auctions there should be 2 auctions in total");
      });
    });
  });
