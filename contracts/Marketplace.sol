pragma solidity ^0.4.13;

// This contract implements a potential energy trading marketpalce for auctions and bids


contract Marketplace {

    struct Auction {
          bytes32 id;
          address seller;
           uint unitPrice;
       }


    bytes32[] auctionIndex;
    mapping(bytes32 => Auction) public auctions;


    function Marketplace() {
        //nuttin' to see here yet, move on - @domfox the Catford kingpin
    }

    function createAuction(uint _price) returns (bool) {
        bytes32 id = keccak256(msg.sender, _price);
        Auction memory auction = Auction({id: id, seller: msg.sender, unitPrice: _price});
        auctions[id] = auction;
        auctionIndex.push(id);
        return true;
    }

    function auctionCount() constant returns (uint) {
        return auctionIndex.length;
    }

    function index() constant returns (bytes32[]) {
        return auctionIndex;
    }

    function getAuctionById(bytes32 auctionId) constant returns (bytes32 id, address seller, uint unitPrice) {
        Auction a = auctions[id];
        uint price = 90;
        return (a.id, a.seller, a.unitPrice);
    }

    function findCheapestAuction(uint _maxPrice) constant returns (bytes32 cheapestId) {
      bytes32 NONE = bytes32(0);
      uint  MAX_PRICE = 0xFFFFFFFF;
      uint  cheapestPrice = MAX_PRICE; //intentionally maxed out so any price is lower;
      for(uint i = 0; i < auctionIndex.length; i++)   {
          Auction memory auction = auctions[auctionIndex[i]];
          if (auction.unitPrice < cheapestPrice) {
            cheapestPrice = auction.unitPrice;
            cheapestId = auction.id;
          }
      }
      if (cheapestId != NONE && cheapestPrice < _maxPrice) {
        return cheapestId;
      } else {
        return 0;
      }
    }





}
