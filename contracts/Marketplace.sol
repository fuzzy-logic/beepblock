pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids



contract Marketplace {

  struct Bid {
        address bidder;
        uint256 amount;
        uint timestamp;
    }

    struct Auction {
           // Location and ownership information of the item for sale
           uint auctionId;
           address seller;
           //address contractAddress; // Contract where the item exists

           // Auction metadata
           uint units;
           uint unitPrice;
           bool isLive;
           uint winningBid;

           Bid bid;
       }


    Auction[] private auctions;

    //TODO reminder to research and implements events for auditing...
    //event AuctionCreated(uint id, string title, uint256 startingPrice, uint256 reservePrice);

    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(uint _units, uint256 _price) returns (uint auctionId) {

        auctionId = auctions.length++;
        Auction a = auctions[auctionId];
        a.seller = msg.sender;
        a.unitPrice = _price;
        a.units = _units;

        // create event, see above
        // AuctionCreated(auctionId, a.title, a.startingPrice, a.reservePrice);

        return auctionId;
    }


    function placeBid(uint auctionId, uint _unitPrice, uint _units) returns (bool success) {

    // for now units must match units advertised
       //uint256 amount = msg.value; // example of current transfer?
        Auction a = auctions[auctionId];

       // do checks, throw toys out of pram / shit pants (delete as appropriate)
       if (a.unitPrice > _unitPrice) return false; // or throw?
       if (! a.isLive) return false; // or return false? the perpetual question...

       // end auction
       a.isLive= false;
       a.bid = Bid(msg.sender, _unitPrice, now);

       return true;
   }


   function getAuctions() constant returns (bytes32[]) {
      bytes32[] _auctions;
       return _auctions;
   }

}
