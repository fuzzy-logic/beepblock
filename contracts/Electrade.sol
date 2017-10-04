pragma solidity ^0.4.13;

// basic energy trading contract

contract Electrade {
    byte32 producer;
    byte32 consumer;
    uint unitPrice;
    uint units;

function Electrade(pro, con, price, units) {
  producer = pro;
	consumer = con;
	unitPrice = price;
	units = units;
    }

  function getProducer() constant returns (byte32) {
    return producer;
  }

  function getConsumer() constant returns (byte32) {
    return consumer;
  }

  function getUnits() constant returns (uint) {
    return units;
  }

  function getUnitPrice() constant returns (uint) {
    return unitPrice;
  }

}
