var Marketplace = artifacts.require("./Marketplace.sol");
var EnergyTransferContract = artifacts.require("./EnergyTransferContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
  deployer.deploy(EnergyTransferContract);
};
