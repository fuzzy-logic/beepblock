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
      const priceId = utils.ref();
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });

      await utils.checkLogs(() => instance.offerPrice(gridAccount, 12, { from: sellerAccount }))
        .contains("PriceOffered", {
          grid: gridAccount,
          priceId: priceId,
          price: 12
        });

      const priceDetails = toPriceDetails(await instance.getPriceDetails(priceId.get()));

      assert.deepEqual(priceDetails, {
        seller: sellerAccount,
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

      // The seller offers three units at different prices.
      await instance.offerPrice(gridAccount, 13, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await instance.offerPrice(gridAccount, 11, { from: sellerAccount });

      await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          agreementId: utils.any,
          grid: gridAccount,
          buyer: buyerAccount,
          seller: sellerAccount,
          agreedBuyPrice: 16, // buyPrice + grid margin
          agreedSellPrice: 11
        });

        // When we want a second unit, we get the second (higher) price.
        await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
          .contains("PriceAgreed", {
            agreementId: utils.any,
            grid: gridAccount,
            buyer: buyerAccount,
            seller: sellerAccount,
            agreedBuyPrice: 17, // buyPrice + grid margin
            agreedSellPrice: 12
          });

        // We cannot get the highest price, as the margin isn't enough, so a third bid fails
        await utils.mustFail(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }));
    });

    theInstance("Should allocate a received unit to an unsettled agreement", async (instance) => {
      const agreementId = utils.ref();

      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          agreementId: agreementId
        });

      await utils.checkLogs(() => instance.unitReceived(sellerAccount))
        .contains("UnitReceived", {
          agreementId: agreementId.get()
        });
    });

    theInstance("Should issue a refund to the buyer when the agreement is settled", async (instance) => {
      const agreementId = utils.ref();

      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          agreementId: agreementId
        });

      await instance.unitReceived(sellerAccount);

      await utils.checkLogs(() => instance.getRefund(agreementId.get(), { from: buyerAccount }))
        .contains("RefundIssued", {
          agreementId: agreementId.get(),
          refundAmount: 3
        });

        // Cannot withdraw twice
        utils.mustFail(() => instance.getRefund(agreementId.get(), { from: buyerAccount }));
    })

    theInstance("Should issue a payment to the seller when the agreement is settled", async (instance) => {
      const agreementId = utils.ref();
      await instance.publishGridPrice(10, 20, 5, { from: gridAccount });
      await instance.offerPrice(gridAccount, 12, { from: sellerAccount });
      await utils.checkLogs(() => instance.agreePrice(gridAccount, 17, { from: buyerAccount, value: 20 }))
        .contains("PriceAgreed", {
          agreementId: agreementId
        });
      await instance.unitReceived(sellerAccount);

      await utils.checkLogs(() => instance.getPayment(agreementId.get(), { from: sellerAccount }))
        .contains("PaymentIssued", {
          agreementId: agreementId.get(),
          paymentAmount: 12
        });

      // Cannot withdraw twice
      utils.mustFail(() => instance.getPayment(agreementId.get(), { from: sellerAccount }));
    })
});
