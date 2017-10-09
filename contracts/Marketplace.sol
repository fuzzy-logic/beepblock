pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract Marketplace {

    struct Auction {
          address seller;
           uint units;
           uint unitPrice;
       }

    //mapping(address => Auction) public auctionsMap;
    address[] auctionsIndex;
    //LibCLLu.CLL public auctionsRingBuffer;

    //TODO reminder to research and implements events for auditing...
    //event AuctionCreated(uint id, string title, uint256 startingPrice, uint256 reservePrice);

    event AuctionCreated(address seller,  uint auctionId, uint totals);

    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(uint _units, uint256 _price) returns (uint) {
        auctionsIndex.length++;
        auctionsIndex[auctionsIndex.length-1] = msg.sender;
        return auctionsIndex.length;
    }

    function numAuctions() constant returns (uint) {
       return auctionsIndex.length;
     }

}
