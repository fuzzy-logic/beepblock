pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract Marketplace {

    struct Auction {
          address seller;
           uint units;
           uint unitPrice;
       }

    bytes32[] public auctionsIndex;


    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(bytes32 key) returns (bytes32[]) {
        auctionsIndex.push(key);
        return auctionsIndex;
    }

    function numAuctions() constant returns (uint) {
       return auctionsIndex.length;
     }

     function getAuctions() constant returns (bytes32[]) {
        return auctionsIndex;
      }

}
