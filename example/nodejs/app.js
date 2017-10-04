var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var fs = require('fs');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());


//callbackHell();

//TODO comments
//TODO logging



var _contractName = 'Counter';
var _compiledCode;
var _contract; // compiled contract
var _contractIntstance; // specific contract instance to interact with
var _account;
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
