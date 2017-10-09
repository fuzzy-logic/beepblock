pragma solidity ^0.4.13;

contract SimpleList {

  struct EntityStruct {
    string entityName;
    uint entityData;
    // more fields
  }

  EntityStruct[] public entityStructs;

  function newEntity(string entityName, uint entityData) public returns (uint rowNumber) {
    EntityStruct memory newEntity;
    newEntity.entityName = entityName;
    newEntity.entityData    = entityData;
    return entityStructs.push(newEntity)-1;
  }

  function getEntityCount() public constant returns(uint entityCount) {
    return entityStructs.length;
  }

  function getEntityName(uint rowNumber) public constant returns (string entityName) {
    return entityStructs[rowNumber].entityName;
  }
}
