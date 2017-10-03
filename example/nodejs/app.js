var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var fs = require('fs');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());

code = fs.readFileSync('./contract/Counter.sol').toString();
compiledCode = solc.compile(code);
if (compiledCode.contracts) console.log('contract compiled.');

var callbackCalled = false;

web3.eth.getAccounts(function(err, accounts) {
  if (callbackCalled) {
    console.log('callback called twice! exiting!');
    process.exit(0);
  }
  callbackCalled = true;
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

        } else {
          console.log('contract not deployed, no address returned');
          //throw new Error('contract not deployed, no address returned');
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



//var account = web3.eth.accounts[0];
//var balanceWei = web3.eth.getBalance(account).toNumber();
//var balance = web3.fromWei(balanceWei, 'ether');
//console.log('account '  + account + ' balance:' + balance);
