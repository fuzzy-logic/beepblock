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
          address seller;
           uint auctionId;

           // Auction metadata
           uint units;
           uint unitPrice;
           bool isLive;
           uint winningBid;

           //Bid bid;
       }


     Auction[] private auctions;

    //TODO reminder to research and implements events for auditing...
    //event AuctionCreated(uint id, string title, uint256 startingPrice, uint256 reservePrice);

    event AuctionCreated(address seller,  uint auctionId, uint totals);

    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(uint _units, uint256 _price) returns (uint auctionId) {

        auctionId = auctions.length + 1;
        auctions.push(Auction({auctionId: auctionId,
                                seller: msg.sender,
                                unitPrice: _price,
                                units: _units,
                                isLive: true,
                                winningBid: 0}));

        AuctionCreated(msg.sender, auctionId, auctions.length);

        // create event, see above
        // AuctionCreated(auctionId, a.title, a.startingPrice, a.reservePrice);

        return auctionId;
    }


    function placeBid(uint auctionId, uint _unitPrice, uint _units) returns (bool success) {

    // for now units must match units advertised
       //uint256 amount = msg.value; // example of current transfer?
        Auction storage a = auctions[auctionId];

       // do checks, throw toys out of pram / shit pants (delete as appropriate)
       if (a.unitPrice > _unitPrice) return false; // or throw?
       if (! a.isLive) return false; // or return false? the perpetual question...

       // end auction
       a.isLive= false;
       //a.bid = Bid(msg.sender, _unitPrice, now);

       return true;
   }


   function getAuctions() constant returns (uint[]) {
      uint[] memory _auctions;
       for(uint i = 0; i < auctions.length; i++) {
            Auction storage a = auctions[i];
            _auctions[i] = a.auctionId;
        }
      return _auctions;
    }


    function numAuctions() constant returns (uint) {
       return auctions.length;
     }


    function uintToBytes(uint v) constant returns (bytes32 ret) {
        if (v == 0) {
            ret = '0';
        }
        else {
            while (v > 0) {
                ret = bytes32(uint(ret) / (2 ** 8));
                ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                v /= 10;
            }
        }
        return ret;
    }

}
