pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract EnergyTransferContract {

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

  mapping(bytes32 => PriceOffer) priceOffers;
  bytes32[] priceOfferIds;

  mapping(bytes32 => EnergyTransferAgreement) agreements;
  bytes32[] agreementIds;

  function recordPriceOffer(address seller, address grid, uint price) returns (bytes32 priceOfferId) {
    priceOfferId = keccak256(seller, grid, price);
    uint index = priceOfferIds.length++;
    priceOfferIds[index] = priceOfferId;
    priceOffers[priceOfferId] = PriceOffer(
      seller = seller,
      grid = grid,
      price = price
    );
    return priceOfferId;
  }

  function removePriceOffer(uint offerIndex) {
    bytes32 priceOfferId = priceOfferIds[offerIndex];
    priceOfferIds[offerIndex] = bytes32(0); // zero out the offer from the iterable list
    delete priceOffers[priceOfferId];
  }

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

  function getPriceDetails(bytes32 priceId) constant returns (address seller, address grid, uint price) {
    PriceOffer storage priceOffer = priceOffers[priceId];
    require(priceOffer.seller != 0);

    return (priceOffer.seller, priceOffer.grid, priceOffer.price);
  }

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
    bytes32 lowestPriceId = bytes32(0);
    uint lowestPrice = 0xFFFFFFFFFFFFFFFF;
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
        lowestPriceId = priceId;
        lowestPrice = priceOffer.price;
      }
    }

    // Payment will be refunded if this fails (i.e. we found no matching price offer)
    require(lowestPrice < 0xFFFFFFFFFFFFFFFF);

    // Deactivate the offer, as we're taking it.
    priceOfferIds[lowestPriceIndex] = bytes32(0);

    takeOffer(gridPrice, buyer, gridPrice.minimumMargin, priceOffers[lowestPriceId]);
  }

  function takeOffer(GridPrice gridPrice, address buyer, uint minimumMargin, PriceOffer lowestOffer) internal {
    uint agreedSellPrice = lowestOffer.price;
    uint agreedBuyPrice = lowestOffer.price + minimumMargin;
    address seller = lowestOffer.seller;

    // Record an agreement
    bytes32 agreementId = recordAgreement(gridPrice, seller, buyer, agreedBuyPrice, agreedSellPrice);

    // Broadcast the happy event
    PriceAgreed(agreementId, gridPrice.grid, buyer, seller, agreedBuyPrice, agreedSellPrice);
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
      isPaid: false,
      isRefunded: false,
      isFulfilled: false
    });

    return agreementId;
  }

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
      if (agreement.isFulfilled) continue;
      break; // On the first matching agreement
    }

    // No agreement found
    if (agreement.agreedPrice.buyPrice == 0) {
      return;
    }

    // Fulfil the agreement
    // Remove it from the list of unfufilled agreements, but don't delete it from the agreements mapping
    agreementIds[agreementIndex] = bytes32(0);
    agreement.isFulfilled = true;

    // Take our cut
    uint gridCut = agreement.agreedPrice.buyPrice - agreement.agreedPrice.sellPrice;
    grid.transfer(gridCut);

    // Broadcast that a unit was received and assigned to this agreement
    UnitReceived(agreementId, gridCut);
  }

  function getRefund(bytes32 agreementId) {
    EnergyTransferAgreement storage agreement = agreements[agreementId];
    address buyer = agreement.agreedPrice.buyer;
    require(msg.sender == buyer);

    require(agreement.isFulfilled);
    require(!agreement.isRefunded);
    agreement.isRefunded = true;
    uint refundAmount = agreement.gridPrice.sellPrice - agreement.agreedPrice.buyPrice;
    buyer.transfer(refundAmount);

    RefundIssued(agreementId, refundAmount);
  }

  function getPayment(bytes32 agreementId) {
    EnergyTransferAgreement storage agreement = agreements[agreementId];
    address seller = agreement.agreedPrice.seller;
    require(msg.sender == seller);

    require(agreement.isFulfilled);
    require(!agreement.isPaid);
    agreement.isPaid = true;
    uint paymentAmount = agreement.agreedPrice.sellPrice;
    seller.transfer(paymentAmount);

    PaymentIssued(agreementId, paymentAmount);
  }
}
