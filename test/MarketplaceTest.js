


var Marketplace = artifacts.require("./Marketplace.sol");



  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", function() {
      var marketplaceInstance;
      return Marketplace.deployed().then(function(instance) {
        marketplaceInstance = instance;
        return instance.getAuctions();
      }).then(function(auctions) {
        assert.equal(auctions.length, 0, "new marketplace auctions should");
        return marketplaceInstance.createAuction.call(1, 120);
      }).then(function(auctionId) {
          console.log('auctionId: ' + JSON.stringify(auctionId));
        assert.equal(auctionId, "1", "first auction should have id of 1");
        return marketplaceInstance.numAuctions();
      }).then(function(auctions) {
        console.log('auctions: ' + JSON.stringify(auctions));
        assert.equal(auctions, 1, "new marketplace auction should be added");
        return marketplaceInstance.createAuction.call(1, 100);
      }).then(function(auctionId) {
          console.log('auctionId: ' + JSON.stringify(auctionId));
        assert.equal(auctionId, "3", "second auction should have id of 1");
        return marketplaceInstance.numAuctions();
      }).then(function(auctions) {
        console.log('auctions: ' + JSON.stringify(auctions));
        assert.equal(auctions, 2, "new marketplace auction should be added");
      });
    });
  });
