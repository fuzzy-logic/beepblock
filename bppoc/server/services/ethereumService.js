// Import libraries we need
const Web3 = require('web3');
const contract = require('truffle-contract');
// Import our contract artifacts and turn them into usable abstractions.
const metacoin_artifacts = require('../contracts/MetaCoin.json');
const Account = require('../models/account');

function getConfig() {

    // MetaCoin is our usable abstraction, which we'll use through the code below.
    var metaCoin = contract(metacoin_artifacts);
  
    var web3;
  
    if (!web3 && typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      web3 = new Web3(web3.currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
  
    // Bootstrap the MetaCoin abstraction for Use.
    metaCoin.setProvider(web3.currentProvider);

    return {
      web3,
      metaCoin,
    }
  
}

function getAccount(accountAddress) {

  accountAddress = accountAddress.toUpperCase();

  var config = getConfig();

  return new Promise((resolve, reject) => {
    config.web3.eth.getAccounts(function (err, accounts) {
      if (err) {
        console.log(err);
        reject(err);
      }
      var acct = Account(config, accountAddress);
      acct.refreshBalance()
        .then(() => {
          return acct.refreshTransactionCount();
        })
        .then(() => {
          resolve(acct);
        });
    });
  });

}

function createAccount() {

  var config = getConfig();

  return new Promise((res, rej) => {
    try{
      var account = config.web3.eth.accounts.create();
  
      if(!account){
        console.log('Account not created');
        rej('Account not created');
      }

      getAccount(account.address).then((acc) => res(acc));
  
    }
    catch (err) {
      console.log(`Error creating account: ${err}`);
      rej(err);
    }
  
  })

}

module.exports = { 
  createAccount,
  getAccount
};
