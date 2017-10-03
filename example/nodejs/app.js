var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());

//var number = web3.eth.blockNumber;
//console.log('block num:' + number);


web3.eth.getBlock(0, function(error, result){
    if(!error) {
        console.log('\n block 0: ');
        console.dir(result);
    } else {
        console.error('error: ' + error);
    }
  });

//web3.eth.accounts(function(err, res) {
//  console.log('err: ' + err + ', res: ' + res);
//});


web3.eth.getAccounts(function(err, res) {
  console.log('\n accounts: ');
  console.dir(res);
});

//var account = web3.eth.accounts[0];
//var balanceWei = web3.eth.getBalance(account).toNumber();
//var balance = web3.fromWei(balanceWei, 'ether');


//console.log('account '  + account + ' balance:' + balance);
