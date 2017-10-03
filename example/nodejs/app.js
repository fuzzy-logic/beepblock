var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var fs = require('fs');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());


//callbackHell();



var contractIntstance;
var account;

getTestAccounts().then((accounts) => {
  console.log('test accounts: ' + accounts.length);
  account = accounts[0];
  return createContractIntstance();
}).then((ci) => {
    contractIntstance = ci;
    return getCount(ci);
}).then((count) => {
    console.log('initial count: ' + count);
    console.log('incrementing...');
    return increment(contractIntstance);
}).then((transactionHash) => {
    console.log('increment transaction id: ' + transactionHash);
    return getCount(contractIntstance);
}).then((count) => {
    console.log('new count: ' + count);
}).catch(function(err) {
  console.log('ERROR!');
  console.dir(err);
});



function getTestAccounts() {
  return new Promise((resolve, reject) => {
      web3.eth.getAccounts(function(err, accounts) {
          if (err) reject(err);
          resolve(accounts);
      });
  });
}

function createContractIntstance() {
  return new Promise((resolve, reject) => {
      var code = fs.readFileSync('./contract/Counter.sol').toString();
      var compiledCode = solc.compile(code);
      if (compiledCode.contracts) console.log('contract compiled.');
      var abi = JSON.parse(compiledCode.contracts[':Counter'].interface);
      if (abi) console.log('abi interface created.');
      var contract = web3.eth.contract(abi);
      var bytecode = compiledCode.contracts[':Counter'].bytecode;
      if (bytecode) console.log('bytecode created.');
      try {
        var contractInstance = contract.new({
            data: '0x' + bytecode,
            from: account,
            gas: 90000*2
        }, (err, deployedContract) => {
            if (err) reject(err);
            console.log('deployed new instance: ' + deployedContract.transactionHash);
            console.log('deployedContract.address: ' + deployedContract.address);
            //console.dir(deployedContract);
            if (! deployedContract.address) return; //reject(new Error('deployed contract has no address'));
            var contractInstance = contract.at(deployedContract.address);
            resolve(contractInstance);
        });
      } catch (err) {
        console.dir(err);
        reject(err);
      }

  });
}

function getCount(ci) {
      return new Promise((resolve, reject) => {
            ci.getCount.call(function(err, count) {
                if (err) reject(err);
                resolve(count);
            });
      });
}

function increment(ci) {
      return new Promise((resolve, reject) => {
              ci.increment(1, {from: account, gas: 90000*2}, function(err, response) {
                if (err) reject(err);
                resolve(response);
            });
      });
}




function callbackHell() {

var code = fs.readFileSync('./contract/Counter.sol').toString();
var compiledCode = solc.compile(code);
if (compiledCode.contracts) console.log('contract compiled.');

web3.eth.getAccounts(function(err, accounts) {

  console.log('\n accounts: ');
  console.dir(accounts);

  var account = accounts[0];
  console.log('account[0]: ' + account);



  var abi = JSON.parse(compiledCode.contracts[':Counter'].interface);
  var contract = web3.eth.contract(abi);
  var bytecode = compiledCode.contracts[':Counter'].bytecode;

  //console.log('CounterContract: ');
  //console.dir(CounterContract);

  //var deployedContract = CounterContract.new(['stuff', 'other', 'misc'], {data: byteCode, from: '', gas: 4700000});
  try {

    var contractInstance = contract.new({
        data: '0x' + bytecode,
        from: account,
        gas: 90000*2
    }, (err, deployedContract) => {
        if (err) {
            console.log(err);
            return;
        }

        // Log the tx, you can explore status with eth.getTransaction()
        console.log('deployed new instance: ' + deployedContract.transactionHash);

        // If we have an address property, the contract was deployed
        if (deployedContract.address) {
            console.log('Contract address: ' + deployedContract.address);
            // Let's test the deployed contract
            //testContract(res.address);

            var contractInstance = contract.at(deployedContract.address);
            console.log('contractInstance: ' + contractInstance.address);
            //console.dir(contractInstance);

            contractInstance.getCount.call(function(err, count1) {
                console.log('initial count: ' + count1);

                console.log('incrementing...');
                contractInstance.increment(1, {from: account, gas: 90000*2}, function(err, res) {

                    if (err) console.dir(err);
                    if (res) console.log('increment response: ' + res);

                    contractInstance.getCount.call(function(err, count2) {
                        console.log('new count: ' + count2);
                    });
                });



            });

            /*
            console.log('initial count: ' + count);
            console.log('incrementing...');
            contractInstance.increment({from: account});
            var nextCount = contractInstance.getCount.call();
            console.log('current count: ' + nextCount);
            */

        }
    });

  } catch (err) {
      console.log('ERROR!');
      console.dir(err);
      process.exit(1);
  }


  //var contractData = CounterContract.new.getData(['stuff', 'other', 'misc'], {data: byteCode});

  //console.log('contractData: ');
  //console.dir(contractData);

  /*


  contractInstance.increment({from: accounts[0]});
  var count = contractInstance.getCount.call();
  console.log('current count: ' + count);

  contractInstance.increment({from: accounts[0]});
  var count = contractInstance.getCount.call();
  console.log('current count: ' + count);

  contractInstance.increment({from: accounts[0]});
  var count = contractInstance.getCount.call();
  console.log('current count: ' + count);
*/

});

}



//var account = web3.eth.accounts[0];
//var balanceWei = web3.eth.getBalance(account).toNumber();
//var balance = web3.fromWei(balanceWei, 'ether');
//console.log('account '  + account + ' balance:' + balance);
