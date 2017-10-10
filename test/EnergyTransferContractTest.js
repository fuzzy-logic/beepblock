const utils = require("./TestUtils");

const EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");
const toGridPrice = utils.tupleReader("buyPrice", "sellPrice", "minimumMargin");
const toPriceDetails = utils.tupleReader("seller", "price", "isActive");
const theInstance = utils.instanceFactory(EnergyTransferContract);

contract('Energy Transfer Contract', (accounts) => {
  const gridAccount = accounts[0];
  const buyerAccount = accounts[1];
  const sellerAccount = accounts[2];

  theInstance("Should record grid prices", async (instance) => {
    await utils.checkLogs(() => instance.publishGridPrice(10, 20, 5, { from: gridAccount }))
      .contains("GridPriceChanged", {
      grid: gridAccount,
      buyPrice: 10,
      sellPrice: 20,
      minimumMargin: 5
    });

    const gridPrice = toGridPrice(await instance.getCurrentGridPrice(gridAccount));

    assert.deepEqual(gridPrice, {
      buyPrice: 10,
      sellPrice: 20,
      minimumMargin: 5
    });
  });

    theInstance("Should replace an existing grid price with a new grid price", async (instance) => {
      await utils.checkLogs(() => instance.publishGridPrice(10, 20, 5, { from: gridAccount }))
        .contains("GridPriceChanged", {
          grid: gridAccount,
          buyPrice: 10,
          sellPrice: 20,
          minimumMargin: 5
        });

      await utils.checkLogs(() => instance.publishGridPrice(15, 25, 5, { from: gridAccount }))
        .contains("GridPriceChanged", {
          grid: gridAccount,
          buyPrice: 15,
          sellPrice: 25,
          minimumMargin: 5
        });

      const gridPrice = toGridPrice(await instance.getCurrentGridPrice(gridAccount));

      assert.deepEqual(gridPrice, {
        buyPrice: 15,
        sellPrice: 25,
        minimumMargin: 5
      });
    });

    theInstance("Should record seller offers", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      await utils.checkLogs(() => instance.offerPrice(12, { from: sellerAccount }))
        .contains("PriceOffered", {
          priceId: 0,
          price: 12
        });

      const priceDetails = toPriceDetails(await instance.getPriceDetails(0));

      assert.deepEqual(priceDetails, {
        seller: sellerAccount,
        price: 12,
        isActive: true
      });
    });
});
