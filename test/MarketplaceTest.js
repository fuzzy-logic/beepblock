
const utils = require("./TestUtils");

var Marketplace = artifacts.require("./Marketplace.sol");
const theInstance = utils.instanceFactory(Marketplace);
const toAuctionDetails = utils.tupleReader("id", "sellerAddress", "price");


  contract('Marketplace',  function(accounts) {
    theInstance("should create a producer consumer marketplace", async (marketplaceInstance) => {
      var initialCount  = await marketplaceInstance.auctionCount();
      console.log('initial num auctions: ' + initialCount);
      assert.equal(initialCount, 0, "a newly created marketplace should have zero auctions");

      // create 4 test producer auctions for a range of prices
      var tx1 = await marketplaceInstance.createAuction(120);
      console.log('tx1: ' + JSON.stringify(tx1));
      var tx2 = await marketplaceInstance.createAuction(110);
      var tx3 = await marketplaceInstance.createAuction(100);
      var tx4 = await marketplaceInstance.createAuction(90);

      // test index is correct looking
      var index = await marketplaceInstance.index();
      console.log('index: ' + JSON.stringify(index));
      assert.equal(index.length, 4, "index size expcted to be 4");

      // test retrieval of cheapest auction
      console.log('finding cheapest auction....');
      var cheapestAuctionId = await marketplaceInstance.findCheapestAuction(105);
      console.log('cheapestAuctionId: ' + JSON.stringify(cheapestAuctionId));
      assert.ok(cheapestAuctionId, "cheapest auction expected to be not null");
      var auction = toAuctionDetails(await marketplaceInstance.getAuctionById(cheapestAuctionId));
      console.log('auction: ' + JSON.stringify(auction));

      assert.deepEqual(auction, {
        id: auction.id,
        sellerAddress: accounts[0],
        price: 90
      });
    });
  });
