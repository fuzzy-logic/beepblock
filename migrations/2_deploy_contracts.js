//var ConvertLib = artifacts.require("./ConvertLib.sol");
//var MetaCoin = artifacts.require("./MetaCoin.sol");
//var ProofOfExistence1 = artifacts.require("./ProofOfExistence1.sol");
//var Voting = artifacts.require("./Voting.sol");
var Counter = artifacts.require("./Counter.sol");

var Electrade = artifacts.require("./Electrade.sol");

module.exports = function(deployer) {
  //deployer.deploy(ConvertLib);
  //deployer.link(ConvertLib, MetaCoin);
  //deployer.deploy(MetaCoin);
  //deployer.deploy(ProofOfExistence1);
  deployer.deploy(Counter);
  deployer.deploy(Electrade);
};
