
var Counter = artifacts.require("./Counter.sol");
var Marketplace = artifacts.require("./Marketplace.sol");
var Electrade = artifacts.require("./Electrade.sol");

module.exports = function(deployer) {
  deployer.deploy(Counter);
  deployer.deploy(Electrade);
  deployer.deploy(Marketplace);
};
