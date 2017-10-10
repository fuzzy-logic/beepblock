
var Counter = artifacts.require("./Counter.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var Electrade = artifacts.require("./Electrade.sol");
var SimpleList = artifacts.require("./SimpleList.sol");
var EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Counter);
  deployer.deploy(Electrade);
  deployer.deploy(Marketplace);
  deployer.deploy(SimpleList);
  deployer.deploy(EnergyTransferContract);
};
