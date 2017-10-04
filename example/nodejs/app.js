var TestRPC = require("ethereumjs-testrpc"); // in process local testrpc block chain
var solc = require('solc');
var fs = require('fs');
var contract = require("truffle-contract");
Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(TestRPC.provider());


async function main(contractName) {
  const account = await getTestAccounts().then(accounts => accounts[0]);

  const contractInstance = await getContractInstance(contractName, account);
  const count = await getCount(contractInstance);

  console.log('initial count: ' + count);
  console.log('incrementing...');

  const transactionHash = await increment(contractInstance, account);
  console.log('increment transaction id: ' + transactionHash);

  const newCount = await getCount(contractInstance);
  console.log('new count: ' + newCount);
}

async function getContractInstance(contractName, account) {
  const compiledCode = compileContract(contractName, account);
  const compiledContract = compiledCode.contracts[":" + contractName];

  const contract = createEthereumContract(compiledContract.interface);
  const deployedContract = await deployContract(compiledContract.bytecode, account, contract);

  return contract.at(deployedContract.address);
}

function compileContract(contractName) {
  console.log('compiling ' + contractName + ' contract...');
  const code = fs.readFileSync('./contract/' + contractName + '.sol').toString();
  return solc.compile(code);
}

function createEthereumContract(iface) {
  return web3.eth.contract(JSON.parse(iface));
}

async function deployContract(bytecode, account, contract) {
  return new Promise((resolve, reject) => {
      var contractInstance = contract.new({
          data: '0x' + bytecode,
          from: account,
          gas: 90000*2
      }, (err, deployedContract) => {
          if (err) {
            reject(err);
            return;
          }

          if (!deployedContract) {
            reject(new Error("Deployed contract is undefined"));
            return;
          }

          if (!deployedContract.address) {
            return;
          }

          resolve(deployedContract);
      });
  });
}

function toPromise(f) {
  return new Promise((resolve, reject) => {
    f((err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

function getTestAccounts() {
  return toPromise(web3.eth.getAccounts);
}

function getCount(ci) {
  return toPromise(ci.getCount.call);
}

function increment(ci, account) {
  return toPromise(cb => ci.increment(1, {from: account, gas: 900000*2}, cb));
}

// RUN IT

main('Counter').catch(function(err) {
  console.log('ERROR!');
  console.dir(err);
});
