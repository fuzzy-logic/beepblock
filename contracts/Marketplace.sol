pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract Marketplace {

    struct Auction {
          address seller;
           uint units;
           uint unitPrice;
       }


    Auction[] auctions;


    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(uint _units, uint _price) returns (bool) {
        Auction memory auction = Auction({seller: msg.sender, units: _units, unitPrice: _price});
        auctions.push(auction);
        return true;
    }

    function auctionCount() constant returns (uint) {
        return auctions.length;
    }

}
