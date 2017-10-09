pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract Marketplace {

    struct Auction {
          address seller;
           uint units;
           uint unitPrice;
       }

    bytes32[] auctionsIndex;


    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(bytes32 key) returns (bytes32[]) {
        //auctionsIndex.length++;
        //auctionsIndex[auctionsIndex.length - 1] = key;
        auctionsIndex.push(key);
        return auctionsIndex;
    }

    function numAuctions() constant returns (uint) {
       return auctionsIndex.length;
     }

}
