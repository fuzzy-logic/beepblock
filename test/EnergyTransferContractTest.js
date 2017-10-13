const utils = require("./TestUtils");

const EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");
const toGridPrice = utils.tupleReader("buyPrice", "sellPrice", "minimumMargin");
const toPriceDetails = utils.tupleReader("seller", "grid", "price");
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

      await utils.checkLogs(() => instance.offerPrice(gridAccount, 12, { from: sellerAccount }))
        .contains("PriceOffered", {
          grid: gridAccount,
          price: 12
        });
    });

    theInstance("Should not accept a seller offer which conflicts with the current grid price", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      await utils.mustFail("Offer below the current grid buy price should have been refused",
        () => instance.offerPrice(gridAccount, 9, { from: sellerAccount }));

      /* tfw there is no possible offer from a buyer that is lower than the grid sell price
         but within the grid's demanded margin.
      */
      await utils.mustFail("Offer outside of the grid's minimum margin should have been refused",
        () => instance.offerPrice(gridAccount, 17, { from: sellerAccount }));

    });

    theInstance("Should match a buyer bid with the lowest valid seller offer", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      // The seller offers two units at different prices.
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 11, { from: sellerAccount });

      await utils.checkLogs(() => instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          grid: gridAccount,
          buyer: buyerAccount,
          seller: sellerAccount,
          agreedBuyPrice: 16, // buyPrice + grid margin
          agreedSellPrice: 11
        });

        // When we want a second unit, we get the second (higher) price.
        await utils.checkLogs(() => instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 }))
          .contains("PriceAgreed", {
            grid: gridAccount,
            buyer: buyerAccount,
            seller: sellerAccount,
            agreedBuyPrice: 17, // buyPrice + grid margin
            agreedSellPrice: 12
          });
    });

    theInstance("Unmatched bid pays the grid buy price straight to the grid", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      // The seller offers three units at different prices.
      await instance.offerPrice(gridAccount, 13, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 11, { from: sellerAccount });

      // The buyer obtains two units at a lower price by agreement
      await instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 });
      await instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 });

      // There is no price on offer matching a further request, so the unit is
      // obtained directly from the grid, at the grid price.
      await utils.checkLogs(() => instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("UnitProvidedAtGridPrice", {
          grid: gridAccount,
          buyer: buyerAccount,
          price: 20
        })
        .contains("BalanceAdded", {
          beneficiary: gridAccount,
          amount: 20
        });
    })

    theInstance("Should allocate a received unit to an unsettled agreement", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await utils.checkLogs(() => instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          grid: gridAccount,
          buyer: buyerAccount,
          seller: sellerAccount,
          agreedBuyPrice: 17,
          agreedSellPrice: 12
        });

      await utils.checkLogs(() => instance.unitReceived(sellerAccount, { from: gridAccount, value: 10 }))
        .contains("UnitReceived", {
          grid: gridAccount,
          seller: sellerAccount
        })
        .contains("BalanceAdded", {
          beneficiary: buyerAccount,
          amount: 3 // The buyer's refund
        })
        .contains("BalanceAdded", {
          beneficiary: sellerAccount,
          amount: 12 // The seller's asking price
        })
        .contains("BalanceAdded", {
          beneficiary: gridAccount,
          amount: 15 // The grid buy price, returned, plus the grid's cut on the transaction
        });
    });

    theInstance("Balances accrue across unit transfers", async (instance) => {
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      // The seller offers three units at different prices.
      await instance.offerPrice(gridAccount, 13, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 11, { from: sellerAccount });

      // The buyer obtains two units at a lower price by agreement, and a third at the grid price.
      await instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 });
      await instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 });
      await instance.requestUnit(gridAccount, 17, { from: buyerAccount, value: 20 });

      await instance.unitReceived(sellerAccount, { from: gridAccount, value: 10 });
      await instance.unitReceived(sellerAccount, { from: gridAccount, value: 10 });
      await instance.unitReceived(sellerAccount, { from: gridAccount, value: 10 });

      await utils.checkLogs(() => instance.withdrawBalance({ from: gridAccount }))
        .contains("BalanceWithdrawn", {
          amount: 50 // 2 * 15 for the agreed transfers, plus 1 * 20 - a profit of 20 over the 30 paid
        });

      await utils.checkLogs(() => instance.withdrawBalance({ from: sellerAccount }))
        .contains("BalanceWithdrawn", {
          amount: 33 // One unit at the grid price of 10, one at 11 and one at 12
        });

      await utils.checkLogs(() => instance.withdrawBalance({ from: buyerAccount }))
        .contains("BalanceWithdrawn", {
          amount: 7 // Two refunds, of 3 and 4, for the agreed transfers.
        });

      // Total withdrawn balance = 50 + 33 + 7 = 90
      // Total funds sent to contract = 60 + 30 = 90
    });

});
