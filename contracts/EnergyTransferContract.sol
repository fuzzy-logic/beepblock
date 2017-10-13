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
  event PriceAgreed(address grid, address buyer, address seller, uint agreedBuyPrice, uint agreedSellPrice);

  /*
  Records that a grid has received a unit from a seller.
  */
  event UnitReceived(address grid, address seller);

  /*
  Records that a unit was authorised at the grid price.
  */
  event UnitProvidedAtGridPrice(address grid, address buyer, uint price);

  /*
  Records that a balance has been allocated to a beneficiary.
  */
  event BalanceAdded(address beneficiary, uint amount);

  /*
  Records that a balance has been withdrawn by a beneficiary.
  */
  event BalanceWithdrawn(address beneficiary, uint amount);

  // Records that the grid price for the specified grid has changed.
  event GridPriceChanged(address grid, uint buyPrice, uint sellPrice, uint minimumMargin);

  // Records that a seller price has been offered.
  event PriceOffered(address grid, uint price);

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

  /*
  STORAGE ALLOCATION
  */
  mapping(address => GridPrice) currentGridPrices;

  mapping(bytes32 => PriceOffer) priceOffers;
  bytes32[] priceOfferIds;

  mapping(bytes32 => EnergyTransferAgreement) agreements;
  bytes32[] agreementIds;

  mapping(address => uint) balances;

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

    recordPriceOffer(msg.sender, grid, price);
    PriceOffered(grid, price);
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
  The buyer calls requestUnit with a bid to try to agree a price with a seller
  for a unit of energy.

  The buyer must transfer the full grid price of the unit to the contract in advance,
  as this is used to pay the seller and the grid. The buyer can claim back a refund
  of the difference in price once the unit has been received by the grid and allocated
  to the agreement created here.
  */
  function requestUnit(address grid, uint bid) payable {
    address buyer = msg.sender;

    GridPrice storage gridPrice = currentGridPrices[grid];

    // There must be a grid price for the specified grid.
    require(gridPrice.grid != 0);

    // The bidder must send the grid sell price for the unit
    require(msg.value == gridPrice.sellPrice);

    // The bid must be equal to or below the grid sell price
    require(bid <= gridPrice.sellPrice);

    // The bid must be within the minimum margin of the grid buy price
    require(bid - gridPrice.minimumMargin >= gridPrice.buyPrice);

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

    // If we found no matching offer, allocate all payment to the grid and return.
    if (lowestPrice == 0xFFFFFFFFFFFFFFFF) {
      UnitProvidedAtGridPrice(grid, buyer, msg.value);
      addBalance(grid, msg.value);
      return;
    }

    // Delete the offer, as we're taking it.
    removePriceOffer(lowestPriceIndex);

    takeOffer(gridPrice, buyer, lowestSeller, lowestPrice, gridPrice.minimumMargin);
  }

  function takeOffer(GridPrice gridPrice, address buyer, address seller, uint price, uint minimumMargin) private {
    uint agreedSellPrice = price;
    uint agreedBuyPrice = price + minimumMargin;

    // Record an agreement
    recordAgreement(gridPrice, seller, buyer, agreedBuyPrice, agreedSellPrice);

    // Broadcast the happy event
    PriceAgreed(gridPrice.grid, buyer, seller, agreedBuyPrice, agreedSellPrice);
  }

  /*
  A grid calls unitReceived to record that a unit has been received from a seller,
  sending the current grid buy price for that unit.
  This function searches for an agreement to allocate the unit to, then allocates
  refund and payment for buyer and seller, takes the grid's cut, and deletes
  the agreement.
  */
  function unitReceived(address seller) payable {
    address grid = msg.sender;

    GridPrice storage gridPrice = currentGridPrices[grid];

    // There must be a grid price for the specified grid, and the grid must have
    // sent the current buy price
    require(gridPrice.grid != 0);
    require(msg.value == gridPrice.buyPrice);

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

    // Broadcast that a unit was received from the seller
    UnitReceived(grid, seller);

    // No agreement found
    if (agreement.agreedPrice.buyPrice == 0) {
      // Seller gets the buy price, return immediately.
      addBalance(seller, gridPrice.buyPrice);
      return;
    }

    address buyer = agreement.agreedPrice.buyer;

    // Allocate refund, payment and grid cut.

    // The buyer gets the agreed grid sell price (which they already paid) back,
    // and pays the agreed buy price.
    addBalance(buyer, agreement.gridPrice.sellPrice - agreement.agreedPrice.buyPrice);
    // The seller gets the agreed sell price
    addBalance(seller, agreement.agreedPrice.sellPrice);
    // The unit's already been paid for, so the grid gets back the money it sent,
    // plus a cut on the transaction
    addBalance(grid, gridPrice.buyPrice + agreement.agreedPrice.buyPrice - agreement.agreedPrice.sellPrice);

    // Delete the agreement
    removeAgreement(agreementIndex);
  }

  function addBalance(address beneficiary, uint amount) private {
    balances[beneficiary] += amount;
    BalanceAdded(beneficiary, amount);
  }

  /*
  A participant calls withdrawBalance to withdraw any funds that may be owing to them.
  */
  function withdrawBalance() {
    address beneficiary = msg.sender;
    uint amount = balances[beneficiary];
    delete balances[beneficiary];
    beneficiary.transfer(amount);
    BalanceWithdrawn(beneficiary, amount);
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
