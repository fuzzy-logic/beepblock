pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract EnergyTransferContract {

  /*
   Records that an agreement has been reached to trade a unit
   from the specified seller. The grid may allocate a received unit
   from this seller to fulfilling this agreement (whether and how it does so
   is up to it).
   */
  event PriceAgreed(uint agreementId, uint priceId, address grid, address buyer, address seller);

  /*
  Records that a unit received by the grid has been allocated to an agreement,
  closing it.
  */
  event UnitReceived(uint agreementId);

  // Records that a refund has been issued for a discounted unit.
  event RefundIssued(uint agreementId, uint refundAmount);

  // Records that an attempted refund has failed.
  event RefundFailed(uint agreementId);

  // Records that a payment has been issued for a seller-priced unit.
  event PaymentIssued(uint agreementId, uint paymentAmount);

  // Records that an attempted payment has failed.
  event PaymentFailed(uint agreementId);

  // Records that the grid price for the specified grid has changed.
  event GridPriceChanged(address grid, uint buyPrice, uint sellPrice, uint minimumMargin);

  // Records that a seller price has been offered.
  event PriceOffered(uint priceId, uint sellPrice);

  struct GridPrice {
    // The address of the wallet/contract which represents the grid.
    address grid;

    // The price at which the grid will buy a unit from a producer.
    uint buyPrice;

    // The price at which the grid will sell a unit to a consumer.
    uint sellPrice;

    // The smallest margin at which the grid will transfer a unit.
    uint minimumMargin;
  }

  struct AgreedPrice {
    // The address of the seller.
    address seller;

    // The address of the buyer.
    address buyer;

    // The price the buyer will pay for each unit.
    uint buyPrice;

    // The price the seller will receive for each unit. (Grid receives the difference)
    uint sellPrice;
  }

  struct PriceOffer {
    address seller;
    uint price;
    bool isActive;
  }

  struct EnergyTransferAgreement {
    /* The price offered by the grid at the time of the agreement.

     On making an agreement, the buyer pays the grid price upfront for a
     single unit, and can then withdraw a refund of the difference
     between the grid price and the agreed price when the unit has been
     transferred.

     The seller can withdraw a payment of the difference between the grid's
     buy-price and the agreed buy-price when the unit has been transferred.

     The grid retains the difference between the agreed buy-price and the
     agreed sell-price, which must be enough to cover a base margin.

     The grid withdraws its "cut" when it notifies that a unit has been
     transferred.
    */
    GridPrice gridPrice;

    // The price agreed by the participants at the time of the agreement.
    AgreedPrice agreedPrice;

    // Whether the seller has been paid.
    bool isPaid;

    // Whether the buyer has been refunded.
    bool isRefunded;

    // Whether a unit received by the grid has been allocated to fulfil this agreement.
    bool isFulfilled;
  }

  mapping(address => GridPrice) currentGridPrices;
  PriceOffer[] priceOffers;
  EnergyTransferAgreement[] agreements;

  function publishGridPrice(uint buyPrice, uint sellPrice, uint minimumMargin) {
    address grid = msg.sender;

    // Record the current grid price for this grid.
    currentGridPrices[grid] = GridPrice(
      grid = grid,
      buyPrice = buyPrice,
      sellPrice = sellPrice,
      minimumMargin = minimumMargin
    );

    GridPriceChanged(grid, buyPrice, sellPrice, minimumMargin);
  }

  // Retrieve the current grid price for a given grid.
  function getCurrentGridPrice(address grid) constant returns (uint buyPrice, uint sellPrice, uint minimumMargin) {
    GridPrice storage gridPrice = currentGridPrices[grid];
    assert(gridPrice.grid != 0);

    return (gridPrice.buyPrice, gridPrice.sellPrice, gridPrice.minimumMargin);
  }
}
