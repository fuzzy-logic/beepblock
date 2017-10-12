// Import libraries we need
const Web3 = require('web3');
const contract = require('truffle-contract');
// Import our contract artifacts and turn them into usable abstractions.
const metacoin_artifacts = require('../contracts/MetaCoin.json');
const Account = require('../models/account');

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

var config = {
  web3,
  metaCoin
}

// Bootstrap the MetaCoin abstraction for Use.
metaCoin.setProvider(web3.currentProvider);

getAccounts = async () => {
  return await config.web3.eth.getAccounts();
}

getAccount = async (accountAddress) => {

  accountAddress = accountAddress.toUpperCase();

  try {

    var account = Account(config, accountAddress);
    await account.refreshBalance();
    await account.refreshTransactionCount();
    console.log(account);
    
    return account;

  } catch (err) {
    console.log(err);
    throw err;
  }

}

createAccount = async () => {

  try {

    var account = config.web3.eth.accounts.create();

    if (!account) {
      throw new Error('Account not created');
    }

    const acc = await getAccount(account.address);

    return acc;

  }
  catch (err) {
    console.log(`Error creating account: ${err}`);
    rej(err);
  }

}

module.exports = {
  config,
  createAccount,
  getAccounts,
  getAccount
};
