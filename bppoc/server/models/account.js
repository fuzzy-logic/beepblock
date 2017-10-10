const mongoose = require('mongoose');

const Profile = mongoose.model('profile');

function Account({ web3, metaCoin }, accountAddress) {

  var self = this;
  this.balance = null;
  this.transactionCount = null;
  this.transactions = [];

  async function refreshBalance() {
    const val = await web3.eth.getBalance(accountAddress);
    this.balance = val.valueOf();
  }

  async function refreshTransactionCount() {
    const val = await web3.eth.getTransactionCount(accountAddress);
    this.transactionCount = val.valueOf();
  }

  async function sendCoin(receiverAddress, amount) {
    receiverAddress = receiverAddress.toUpperCase();
    console.log(`Sending ${amount} from ${accountAddress} to ${receiverAddress}`);
    await web3.eth.sendTransaction({
      from: accountAddress,
      to: receiverAddress,
      value: amount
    });
  }

  async function getTransactions() {

    self.transactions = [];
    var earliestBlock;
    var latestBlock;

    const block = await web3.eth.getBlock("latest", true);

    if(block){
      await addBlockTransactions(block, accountAddress);
    }

    console.log(`transactions: ${self.transactions.length}`);  

    const accountAddresses = [...new Set(
      self.transactions.map(t => t.to).concat(self.transactions.map(t => t.from))
    )];

    console.log(`account addresses: ${accountAddresses.length}`);        
    
    var optRegexp = [];
    accountAddresses.forEach(function(opt){
      optRegexp.push(new RegExp(opt, "i") );
    });
  
    const profileAddresses = await Profile.find({
      "accountAddress": { $in: optRegexp }
    });

    console.log(`addresses: ${profileAddresses.length}`);        
    
    self.transactions = self.transactions.map(t => {
      t.from = profileAddresses.filter(p => p.accountAddress.toLowerCase() == t.from.toLowerCase())[0].accountName;
      t.to = profileAddresses.filter(p => p.accountAddress.toLowerCase() == t.to.toLowerCase())[0].accountName;
      console.log(t);
      return t;
    });
  
    console.log(`transactions: ${self.transactions.length}`);    
    
    return self.transactions

  }

  async function addBlockTransactions(block, accountAddress) {
    addTransactionsToList(block, accountAddress);
    if (block && block.number > 0) {
      await addBlockTransactions(
        await getPreviousBlock(block.number-1),
        accountAddress
      );
    }
  }

  async function getPreviousBlock(blockNumber) {
    try {
      return await web3.eth.getBlock(blockNumber, true);
    }
    catch (err) {
      return await getPreviousBlock(blockNumber-1)
    }
  }

  function addTransactionsToList(block, accountAddress) {
    var blockTransactions = [];
    accountAddress = accountAddress.toUpperCase();
    blockTransactions = block.transactions.filter((t) => {
      return t.from.toUpperCase() == accountAddress
        || t.to.toUpperCase() == accountAddress;
    });
    self.transactions = self.transactions.concat(
      blockTransactions.map(t => {
        return {
          id: t.hash,
          from: t.from,
          to: t.to,
          amount: t.value,
          timestamp: block.timestamp,
          transactionType: t.from.toUpperCase() == accountAddress ? 'D' : 'C'
        }
      })
    );
  }

  return {
    transactions: this.transactions,
    accountAddress: accountAddress.toUpperCase(),
    balance: this.balance,
    transactionCount: this.transactionCount,
    refreshBalance,
    sendCoin,
    getTransactions,
    refreshTransactionCount
  }

}

module.exports = Account;