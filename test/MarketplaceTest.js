


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
      }).then(function(auctionId) {
        console.log('auctionId: ' + JSON.stringify(auctionId));
        assert.equal(auctionId, 1, "first auction should have id of 1");
        return marketplaceInstance.numAuctions();
      }).then(function(auctions) {
        console.log('auctions: ' + JSON.stringify(auctions));
        console.dir(auctions);
        assert.equal(auctions, 1, "after creating the first auction there should be 1 marketplace auction in total");
      });
    });
  });
