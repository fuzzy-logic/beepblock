


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
        return marketplaceInstance.createAuction(120);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.createAuction(110);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.createAuction(100);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.createAuction(90);
      }).then(function(tx) {
        console.log('tx: ' + JSON.stringify(tx));
        return marketplaceInstance.index();
      }).then(function(index) {
        console.log('index: ' + JSON.stringify(index));
        //console.dir(index);
        assert.equal(index.length, 4, "index size expcted to be 4");
        console.log('finding cheapest auction....');
        return marketplaceInstance.findCheapestAuction(105);
      }).then(function(cheapestAuctionId) {
        console.log('cheapestAuctionId: ' + JSON.stringify(cheapestAuctionId));
        assert.ok(cheapestAuctionId, "cheapest auction expected to be not null");
        return  marketplaceInstance.getAuctionById(cheapestAuctionId);
      }).then(function(auction) {
        console.log('auction: ' + JSON.stringify(auction));
        var id = auction[0];
        var sellerAddress = auction[1];
        var price = auction[2];
        assert.ok(id, "retrieved auction id expected to be not null");
        assert.ok(sellerAddress, "retrieved auction id expected to be not null");
        assert.equal(price, 90, "retrieved cheapest auction price expected to be 90");
      });
    });
  });
