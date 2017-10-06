function Account({web3, metaCoin}, accountAddress) {
  
    var self = this;
    this.balance = null;
    this.transactionCount = null;
  
    function refreshBalance() {
      return new Promise((res, rej) => {
        web3.eth.getBalance(accountAddress, (err, val) => {
          if (err) rej(err);
          this.balance = val.valueOf();
          res();
        })
      })
    }
  
    function refreshTransactionCount() {
      return new Promise((res, rej) => {
        web3.eth.getTransactionCount(accountAddress, (err, val) => {
          this.transactionCount = val.valueOf();
          res();
        })
      })
    }
  
    function sendCoin(receiverAddress, amount) {
      receiverAddress = receiverAddress.toUpperCase();
      return new Promise((res, rej) => {
        web3.eth.sendTransaction({
          from: accountAddress,
          to: receiverAddress,
          value: amount
        }, (err, val) => {
          this.refreshBalance().then(() => res);
        })
      })
  
    }
  
    function getTransactions() {
      var contract = web3.eth.Contract;
      var transactions = [];
      var earliestBlock;
      var latestBlock;
      return new Promise((res, rej) => {
        web3.eth.getBlock("latest", true, (err, block) => {
          addBlockTransactions(block, transactions, accountAddress)
            .then((transactions) => {
              res(transactions);
            });
        });
      });
    }
  
    function addBlockTransactions(block, transactions, accountAddress) {
      return new Promise((res, rej) => {
        transactions = addTransactionsToList(transactions, accountAddress, block);
        if (block.number > 0) {
          web3.eth.getBlock(block.number - 1, true, (err, block) => {
            addBlockTransactions(block, transactions, accountAddress)
              .then((transactions) => {
                res(transactions)
              });
          });
        } else {
          res(transactions);
        }
      });
    }
  
    function addTransactionsToList(listToAddTo, accountAddress, block) {
      var blockTransactions = [];
      accountAddress = accountAddress.toUpperCase();
      blockTransactions = block.transactions.filter((t) => {
        return t.from.toUpperCase() == accountAddress
          || t.to.toUpperCase() == accountAddress;
      });
      listToAddTo = listToAddTo.concat(blockTransactions);
      console.log(listToAddTo.length);
      return listToAddTo;
    }
  
    return {
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