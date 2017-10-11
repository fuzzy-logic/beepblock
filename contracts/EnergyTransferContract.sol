pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract EnergyTransferContract {

  /*
   Records that an agreement has been reached to trade a unit
   from the specified seller. The grid may allocate a received unit
   from this seller to fulfilling this agreement (whether and how it does so
   is up to it).
   */
  event PriceAgreed(uint agreementId, address grid, address buyer, address seller, uint agreedBuyPrice, uint agreedSellPrice);

  /*
  Records that a unit received by the grid has been allocated to an agreement,
  closing it.
  */
  event UnitReceived(uint agreementId, uint gridAmount);

  // Records that a refund has been issued for a discounted unit.
  event RefundIssued(uint agreementId, uint refundAmount);

  // Records that a payment has been issued for a seller-priced unit.
  event PaymentIssued(uint agreementId, uint paymentAmount);

  // Records that the grid price for the specified grid has changed.
  event GridPriceChanged(address grid, uint buyPrice, uint sellPrice, uint minimumMargin);

  // Records that a seller price has been offered.
  event PriceOffered(address grid, uint priceId, uint price);

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

    uint offerId = priceOffers.length++;
    PriceOffer storage priceOffer = priceOffers[offerId];
    priceOffer.seller = msg.sender;
    priceOffer.grid = grid;
    priceOffer.price = price;
    priceOffer.isActive = true;

    PriceOffered(grid, offerId, price);
  }

  function getPriceDetails(uint priceId) constant returns (address seller, address grid, uint price, bool isActive) {
    PriceOffer storage priceOffer = priceOffers[priceId];
    require(priceOffer.seller != 0);

    return (priceOffer.seller, priceOffer.grid, priceOffer.price, priceOffer.isActive);
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

    // Very inefficient (linear time) search for a matching price.
    uint lowestPriceId = 0;
    uint lowestPrice = 0;
    for (uint priceId = 0; priceId < priceOffers.length; priceId++) {
      PriceOffer storage priceOffer = priceOffers[priceId];
      // Ignore inactive offers
      if (!priceOffer.isActive) {
        continue;
      }
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
      if (lowestPrice == 0 || priceOffer.price < lowestPrice) {
        lowestPriceId = priceId;
        lowestPrice = priceOffer.price;
      }
    }

    // Payment will be refunded if this fails (i.e. we found no matching price offer)
    require(lowestPrice > 0);

    // Deactivate the offer, as we're taking it.
    PriceOffer storage lowestOffer = priceOffers[lowestPriceId];
    lowestOffer.isActive = false;

    uint agreedSellPrice = lowestOffer.price;
    uint agreedBuyPrice = lowestOffer.price + gridPrice.minimumMargin;
    address seller = lowestOffer.seller;

    // Construct an agreement
    uint agreementId = agreements.length++;
    EnergyTransferAgreement storage agreement = agreements[agreementId];
    agreement.gridPrice = gridPrice;
    agreement.agreedPrice = AgreedPrice({
      seller: seller,
      buyer: buyer,
      buyPrice: agreedBuyPrice,
      sellPrice: agreedSellPrice});

    // Not necessary, but may as well be explicit
    agreement.isPaid = false;
    agreement.isRefunded = false;
    agreement.isFulfilled = false;

    // Broadcast the happy event
    PriceAgreed(agreementId, grid, buyer, seller, agreedBuyPrice, agreedSellPrice);
  }

  function unitReceived(address seller) {
    address grid = msg.sender;

    for (uint agreementId = 0; agreementId < agreements.length; agreementId++) {
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
    agreement.isFulfilled = true;

    // Take our cut
    uint gridCut = agreement.agreedPrice.buyPrice - agreement.agreedPrice.sellPrice;
    grid.transfer(gridCut);

    // Broadcast that a unit was received and assigned to this agreement
    UnitReceived(agreementId, gridCut);
  }

  function getRefund(uint agreementId) {
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

  function getPayment(uint agreementId) {
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
