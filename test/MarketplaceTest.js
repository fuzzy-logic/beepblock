


var Marketplace = artifacts.require("./Marketplace.sol");



  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", function() {
      var marketplaceInstance;
      return Marketplace.deployed().then(function(instance) {
        marketplaceInstance = instance;
        return instance.auctionCount();
      }).then(function(auctions) {
        console.log('initial num auctions: ' + auctions);
        assert.equal(auctions, 0, "a newly created marketplace should have zero auctions");
        return marketplaceInstance.createAuction(10, 120);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.createAuction(20, 110);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.auctionCount();
      }).then(function(auctions) {
        console.log('num auctions: ' + JSON.stringify(auctions));
        console.dir(auctions);
        assert.equal(auctions, 2, "there should be 2 auctions in total");
      });
    });
  });
