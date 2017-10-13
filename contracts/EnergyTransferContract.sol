pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract EnergyTransferContract {

  /*
  EVENTS
  */

  /*
   Records that an agreement has been reached to trade a unit
   from the specified seller. The grid may allocate a received unit
   from this seller to fulfilling this agreement (whether and how it does so
   is up to it).
   */
  event PriceAgreed(bytes32 agreementId, address grid, address buyer, address seller, uint agreedBuyPrice, uint agreedSellPrice);

  /*
  Records that a unit received by the grid has been allocated to an agreement,
  closing it.
  */
  event UnitReceived(bytes32 agreementId, uint gridAmount);

  // Records that a refund has been issued for a discounted unit.
  event RefundIssued(bytes32 agreementId, uint refundAmount);

  // Records that a payment has been issued for a seller-priced unit.
  event PaymentIssued(bytes32 agreementId, uint paymentAmount);

  // Records that the grid price for the specified grid has changed.
  event GridPriceChanged(address grid, uint buyPrice, uint sellPrice, uint minimumMargin);

  // Records that a seller price has been offered.
  event PriceOffered(address grid, bytes32 priceId, uint price);

  /*
  STRUCTS
  */

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
    address grid;
    uint price;
    uint index;
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

    uint index;
  }

  struct AllocatedFunds {
    address beneficiary;
    uint amount;
  }

  /*
  STORAGE ALLOCATION
  */
  mapping(address => GridPrice) currentGridPrices;

  mapping(bytes32 => PriceOffer) priceOffers;
  bytes32[] priceOfferIds;

  mapping(bytes32 => EnergyTransferAgreement) agreements;
  bytes32[] agreementIds;

  mapping(bytes32 => AllocatedFunds) pendingRefunds;
  mapping(bytes32 => AllocatedFunds) pendingPayments;

  /*
  A grid calls publishGridPrice to publish the prices at which it will buy and sell
  units, and the minimum margin it will accept on a trade between a buyer and a
  seller (which corresponds to the grid's "cut" of the transaction).
  */
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
    require(gridPrice.grid != 0);

    return (gridPrice.buyPrice, gridPrice.sellPrice, gridPrice.minimumMargin);
  }

  /*
  A seller calls offerPrice to offer a price for a single unit.
  */
  function offerPrice(address grid, uint price) {
    GridPrice storage gridPrice = currentGridPrices[grid];

    // There must be a grid price for the specified grid.
    require(gridPrice.grid != 0);

    // The offer must be greater than the grid buy price.
    require(price > gridPrice.buyPrice);

    // The offer must be within the minimum margin of the grid sell price.
    require(price <= gridPrice.sellPrice - gridPrice.minimumMargin);

    bytes32 offerId = recordPriceOffer(msg.sender, grid, price);

    PriceOffered(grid, offerId, price);
  }

  /*
  Utility method to retrieve a price.
  */
  function getPriceDetails(bytes32 priceId) constant returns (address seller, address grid, uint price) {
    PriceOffer storage priceOffer = priceOffers[priceId];
    require(priceOffer.seller != 0);

    return (priceOffer.seller, priceOffer.grid, priceOffer.price);
  }

  /*
  The buyer calls agreePrice with a bid to try to agree a price with a seller
  for a unit of energy.

  The buyer must transfer the full grid price of the unit to the contract in advance,
  as this is used to pay the seller and the grid. The buyer can claim back a refund
  of the difference in price once the unit has been received by the grid and allocated
  to the agreement created here.
  */
  function agreePrice(address grid, uint bid) payable {
    address buyer = msg.sender;

    GridPrice storage gridPrice = currentGridPrices[grid];

    // There must be a grid price for the specified grid.
    require(gridPrice.grid != 0);

    // The bidder must send the grid sell price for the unit
    require(msg.value == gridPrice.sellPrice);

    // The bid must be below the grid sell price
    require(bid < gridPrice.sellPrice);

    // The bid must be within the minimum margin of the grid buy price
    require(bid - gridPrice.minimumMargin > gridPrice.buyPrice);

    // Very inefficient search for a matching price.
    uint lowestPriceIndex = 0;
    uint lowestPrice = 0xFFFFFFFFFFFFFFFF;
    address lowestSeller = 0;
    for (uint priceIndex = 0; priceIndex < priceOfferIds.length; priceIndex++) {
      bytes32 priceId = priceOfferIds[priceIndex];
      // Ignore inactive offers
      if (priceId == 0) {
        continue;
      }

      PriceOffer storage priceOffer = priceOffers[priceId];
      // Ignore offers on other grids
      if (priceOffer.grid != grid) {
        continue;
      }
      // Ignore offers that wouldn't meet the minimum margin
      if (priceOffer.price > bid - gridPrice.minimumMargin) {
        continue;
      }
      // Ignore offers below the grid buy price
      if (priceOffer.price <= gridPrice.buyPrice) {
        continue;
      }
      if (priceOffer.price < lowestPrice) {
        lowestPriceIndex = priceIndex;
        lowestPrice = priceOffer.price;
        lowestSeller = priceOffer.seller;
      }
    }

    // Payment will be refunded if this fails (i.e. we found no matching price offer)
    require(lowestPrice < 0xFFFFFFFFFFFFFFFF);

    // Delete the offer, as we're taking it.
    removePriceOffer(lowestPriceIndex);

    takeOffer(gridPrice, buyer, lowestSeller, lowestPrice, gridPrice.minimumMargin);
  }

  function takeOffer(GridPrice gridPrice, address buyer, address seller, uint price, uint minimumMargin) private {
    uint agreedSellPrice = price;
    uint agreedBuyPrice = price + minimumMargin;

    // Record an agreement
    bytes32 agreementId = recordAgreement(gridPrice, seller, buyer, agreedBuyPrice, agreedSellPrice);

    // Broadcast the happy event
    PriceAgreed(agreementId, gridPrice.grid, buyer, seller, agreedBuyPrice, agreedSellPrice);
  }

  /*
  A grid calls unitReceived to record that a unit has been received from a seller.
  This function searches for an agreement to allocate the unit to, then allocates
  refund and payment for buyer and seller, takes the grid's cut, and deletes
  the agreement.
  */
  function unitReceived(address seller) {
    address grid = msg.sender;

    for (uint agreementIndex = 0; agreementIndex < agreementIds.length; agreementIndex++) {
      bytes32 agreementId = agreementIds[agreementIndex];
      // Ignore already-fulfilled agreements
      if (agreementId == bytes32(0)) {
        continue;
      }
      EnergyTransferAgreement storage agreement = agreements[agreementId];
      // Ignore agreements that aren't between us and the seller, or are already fulfilled
      if (agreement.gridPrice.grid != grid) continue;
      if (agreement.agreedPrice.seller != seller) continue;
      break; // On the first matching agreement
    }

    // No agreement found
    if (agreement.agreedPrice.buyPrice == 0) {
      return;
    }

    // Write refund and payment
    pendingRefunds[agreementId] = AllocatedFunds({
      beneficiary: agreement.agreedPrice.buyer,
      amount: agreement.gridPrice.sellPrice - agreement.agreedPrice.buyPrice
    });

    pendingPayments[agreementId] = AllocatedFunds({
      beneficiary: seller,
      amount: agreement.agreedPrice.sellPrice
    });

    // Calculate our cut
    uint gridCut = agreement.agreedPrice.buyPrice - agreement.agreedPrice.sellPrice;

    // Delete the agreement
    removeAgreement(agreementIndex);

    // Take our cut
    grid.transfer(gridCut);

    // Broadcast that a unit was received and assigned to this agreement
    UnitReceived(agreementId, gridCut);
  }

  /*
  A buyer calls getRefund to retrieve the refund due for a traded energy unit
  */
  function getRefund(bytes32 agreementId) {
    address buyer = msg.sender;
    AllocatedFunds storage refund = pendingRefunds[agreementId];

    require(refund.beneficiary == buyer);
    uint refundAmount = refund.amount;

    delete pendingRefunds[agreementId];
    buyer.transfer(refundAmount);
    RefundIssued(agreementId, refundAmount);
  }

  /*
  A seller calls getPayment to retrieve the payment due for a traded energy unit
  */
  function getPayment(bytes32 agreementId) {
    address seller = msg.sender;
    AllocatedFunds storage payment = pendingPayments[agreementId];

    require(payment.beneficiary == seller);
    uint paymentAmount = payment.amount;

    delete pendingPayments[agreementId];
    seller.transfer(paymentAmount);
    PaymentIssued(agreementId, paymentAmount);
  }

  /*
  STORAGE MANAGEMENT
  */
  function recordPriceOffer(address seller, address grid, uint price) private returns (bytes32 priceOfferId) {
    priceOfferId = keccak256(seller, grid, price);
    uint index = priceOfferIds.length++;
    priceOfferIds[index] = priceOfferId;
    priceOffers[priceOfferId] = PriceOffer(
      seller = seller,
      grid = grid,
      price = price,
      index = index
    );
    return priceOfferId;
  }

  function removePriceOffer(uint offerIndex) private {
    uint lastIndex = priceOfferIds.length - 1;
    require(offerIndex <= lastIndex);

    bytes32 priceOfferId = priceOfferIds[offerIndex];
    if (offerIndex <= lastIndex) {
      bytes32 lastId = priceOfferIds[lastIndex];
      priceOffers[lastId].index = offerIndex;
      priceOfferIds[offerIndex] = lastId;
    }

    priceOfferIds.length--;
    delete priceOffers[priceOfferId];
  }

  function recordAgreement(GridPrice gridPrice, address seller, address buyer, uint agreedBuyPrice, uint agreedSellPrice) private returns (bytes32 agreementId) {
    agreementId = keccak256(
      gridPrice.grid, gridPrice.buyPrice, gridPrice.sellPrice, gridPrice.minimumMargin,
      seller, buyer, agreedBuyPrice, agreedSellPrice);

    uint index = agreementIds.length++;
    agreementIds[index] = agreementId;

    agreements[agreementId] = EnergyTransferAgreement({
      gridPrice: gridPrice,
      agreedPrice: AgreedPrice({
        seller: seller,
        buyer: buyer,
        buyPrice: agreedBuyPrice,
        sellPrice: agreedSellPrice}),
      index: index
    });

    return agreementId;
  }

  function removeAgreement(uint agreementIndex) private {
    uint lastIndex = agreementIds.length - 1;
    require(agreementIndex <= lastIndex);

    bytes32 agreementId = agreementIds[agreementIndex];
    if (agreementIndex <= lastIndex) {
      bytes32 lastId = agreementIds[lastIndex];
      agreements[lastId].index = agreementIndex;
      agreementIds[agreementIndex] = lastId;
    }

    agreementIds.length--;
    delete agreements[agreementId];
  }
}
