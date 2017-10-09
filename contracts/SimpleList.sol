pragma solidity ^0.4.6;

contract SimpleList {

  struct EntityStruct {
    address entityAddress;
    uint entityData;
    // more fields
  }

  EntityStruct[] public entityStructs;

  function newEntity(uint entityData) public returns(uint rowNumber) {
    EntityStruct memory newEntity;
    newEntity.entityAddress = msg.sender;
    newEntity.entityData    = entityData;
    return entityStructs.push(newEntity) -1;
  }

  function getEntityCount() public constant returns(uint entityCount) {
    return entityStructs.length;
  }
}
