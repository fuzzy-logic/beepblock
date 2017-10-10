


var Marketplace = artifacts.require("./Marketplace.sol");



  contract('Marketplace', function(accounts) {
    it("should create a new market place with no producer auctions", async function() {
      const instance = await Marketplace.deployed();
      const auctionCount = await instance.numAuctions();
      console.log('initial num auctions: ' + auctionCount);
      assert.equal(auctionCount, 0, "a newly created marketplace should have zero auctions");

      const auctionsIndex = await instance.createAuction.call('a');
      console.log('auctionsIndex: ' + JSON.stringify(auctionsIndex));
      console.dir(auctionsIndex);
      assert.equal(auctionsIndex.length, 1, "should be one auction in index");

      const newIndex = await instance.createAuction.call('b');
      console.log('auctionsIndex: ' + JSON.stringify(newIndex));
      console.dir(newIndex);
      //assert.equal(newIndex.length, 2, "should be two auctions in index");

      const auctions = await instance.getAuctions();
      console.log('num auctions: ' + JSON.stringify(auctions));
      console.dir(auctions);
      assert.equal(auctions.length, 2, "after creating the first two auctions there should be 2 auctions in total");
    });
  });
