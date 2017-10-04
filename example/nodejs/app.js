var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var fs = require('fs');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());

//TODO logging (ie: improve on console.log())

var _contractName = 'Counter'; // really, you need a comment for this?
var _compiledCode; // the .sol compiled to js and binary form
var _contract; // compiled contract
var _contractIntstance; // specific contract instance to interact with
var _account; // an ethereum account (testrpc test account in this case) from which to perform transactions
var _deployedContract; //deployed contract handle with address to connect to specific instance

getTestAccounts().then((accounts) => {
  console.log('test accounts: ' + accounts.length);
  account = accounts[0];
  console.log('_contractName=' + _contractName);
  return compileContract(_contractName);
}).then((compiledCode) => {
    _compiledCode = compiledCode;
    if (_compiledCode.contracts) console.log(_contractName + ' contract compiled.');
    if (_compiledCode.contracts[':' + _contractName]) console.log('_compiledCode.contracts[' + _contractName + '] is present');
    return createEthereumContract(compiledCode, _contractName);
}).then((contract) => {
    _contract = contract;
    if (_contract) console.log('ethereum contract "' + _contractName + '" created.');
    return deployContract(_compiledCode, _contract, _contractName);
}).then((dc) => {
    _deployedContract = dc;
    if (_deployedContract.address) console.log(_contractName + ' ethereum contract address: ' + _deployedContract.address);
    return connectToDeployedContract(_contract, _deployedContract.address);
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


function compileContract(contractName) {
  return new Promise((resolve, reject) => {
    try {
      console.log('compiling ' + contractName + ' contract...');
      var code = fs.readFileSync('./contract/' + contractName + '.sol').toString();
      var compiledCode = solc.compile(code);
      resolve(compiledCode);
    } catch (err) {
        console.dir(err);
        reject(err);
    }
  });
}

function createEthereumContract(compiledCode, contractName) {
  return new Promise((resolve, reject) => {
    try {
      if (abi) console.log('creating abi interface for ' + contractName + ' contract.');
      var abi = JSON.parse(compiledCode.contracts[':' + contractName].interface);
      var contract = web3.eth.contract(abi);
      resolve(contract);
    } catch (err) {
      console.dir(err);
        reject(err);
    }
  });
}

function deployContract(compiledCode, contract, contractName) {
  return new Promise((resolve, reject) => {
      console.log();
      var bytecode = compiledCode.contracts[':' + contractName].bytecode;
      //if (bytecode) console.log('bytecode created.');
      try {
        var contractInstance = contract.new({
            data: '0x' + bytecode,
            from: account,
            gas: 90000*2
        }, (err, deployedContract) => {
            if (err) reject(err);
             if (! deployedContract.address) return;
            console.log('deployed ' + contractName + ' instance, transaction_id=' + deployedContract.transactionHash);
            //console.log('deployedContract.address: ' + deployedContract.address);
            //console.dir(deployedContract);
            if (! deployedContract) reject(new Error('deployed contract is undefined'));
            resolve(deployedContract);
        });
      } catch (err) {
        console.dir(err);
        reject(err);
      }

  });
}


function connectToDeployedContract(contract, address) {
      return new Promise((resolve, reject) => {
        var contractInstance = contract.at(address);
        if (! contractInstance) reject(new Error('no contract instance for address ' + address));
        resolve(contractInstance);
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






//var account = web3.eth.accounts[0];
//var balanceWei = web3.eth.getBalance(account).toNumber();
//var balance = web3.fromWei(balanceWei, 'ether');
//console.log('account '  + account + ' balance:' + balance);
