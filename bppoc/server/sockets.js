const ethereumService = require('./services/ethereumService');
const socketIo = require("socket.io");
const EventEmitter = require('events');
const http = require("http");

// Sockets
function openSockets(server) {

  console.log('Opening sockets...');

  // Shortest interval a transaction is created - in seconds
  const minCreateInterval = 2;
  // Largest interval a transaction is created - in seconds
  const maxCreateInterval = 8;

  // Lowest amount of transaction
  const minTransactionAmount = 20;
  // Highest amount of a transaction
  const maxTransactionAmount = 400;

  const port = process.env.PORT || 4000;

  const io = socketIo(server);

  let createTransationsFlag = true;

  const transactionEventEmitter = new EventEmitter();
  let addresses = [];
  let transactionCount = 0;

  io.on("connection", async socket => {

    addresses = await ethereumService.getAccounts();
    transactionEventEmitter.on('newTransaction', (transaction) => {
      console.log(`Emitting: ${transaction}`);
      socket.emit("FromAPI", transaction);
    });

    createTransationsFlag = true;

    // Generate some transactions
    createTransaction();

    socket.on("disconnect", async () => {
      console.log("Client disconnected");
      createTransationsFlag = false;
    });
  });

  let transactionInterval;

  async function createTransaction() {
    clearInterval(transactionInterval);
    console.log(`Transaction count: ${transactionCount}`);
    if (transactionCount > 1000) {
      createTransationsFlag = false;
      console.log('Max transaction count reached, stopping transaction creation.');
      clearInterval(transactionInterval);
    }
    if (createTransationsFlag) {

      try {

        const fromAccountAddress = randomAccountNumber();
        const toAccountAddress = randomAccountNumber(addresses.indexOf(fromAccountAddress));
        const amount = randomIntFromInterval(minTransactionAmount, maxTransactionAmount);

        await sendCoin(
          fromAccountAddress,
          toAccountAddress,
          amount
        );

        transactionCount++;

        if (createTransationsFlag) {
          const interval = randomIntFromInterval(minCreateInterval, maxCreateInterval) * 1000;
          transactionInterval = setInterval(() => {
            createTransaction();
          },
            interval
          );
        }
      } catch (err) {
        console.log(err);
        createTransationsFlag = false;
        clearInterval(transactionInterval);
      }
    }
  }

  function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function randomAccountNumber(currentNumber) {
    const acctNum = Math.floor(Math.random() * addresses.length);
    if (currentNumber && currentNumber == acctNum) {
      return randomAccountNumber(currentNumber);
    }
    return addresses[acctNum];
  }

  async function sendCoin(senderAddress, receiverAddress, amount) {
    receiverAddress = receiverAddress.toUpperCase();
    senderAddress = senderAddress.toUpperCase();
    console.log(`transaction: ${senderAddress} ${receiverAddress} ${amount}`)
    let transaction = {
      from: senderAddress,
      to: receiverAddress,
      value: amount
    };
    const result = await ethereumService.config.web3.eth.sendTransaction(transaction);
    transaction.blockNumber = result.blockNumber;
    const fromAccountIndex = addresses.findIndex(a => {
      return a.toUpperCase() == senderAddress.toUpperCase();
    });
    const toAccountIndex = addresses.findIndex(a => {
      return a.toUpperCase() == receiverAddress.toUpperCase();
    });
    transaction.from = `Account ${fromAccountIndex}`;
    transaction.to = `Account ${toAccountIndex}`;
    transaction.amount = amount;
    transactionEventEmitter.emit('newTransaction', transaction);
  }

}

module.exports = { openSockets };
