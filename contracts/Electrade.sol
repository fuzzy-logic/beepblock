pragma solidity ^0.4.13;

// basic energy trading contract

contract Electrade {
    bytes32 producer;
    bytes32 consumer;
    uint unitPrice;
    uint units;
    uint unitsDelivered;
    boolean fulfilled;

function Electrade(bytes32 pro, bytes32 con, uint price, uint u) {
  producer = pro;
	consumer = con;
	unitPrice = price;
	units = u;
}

  function getProducer() constant returns (bytes32) {
    return producer;
  }

  function getConsumer() constant returns (bytes32) {
    return consumer;
  }

  function getUnits() constant returns (uint) {
    return units;
  }

  function getUnitPrice() constant returns (uint) {
    return unitPrice;
  }

  function deliverUnit() {
    unitsDelivered++;
    if (unitsDelivered == units) {
      fulfillContract();
    }
  }

  function fulfillContract() {

  }

}
