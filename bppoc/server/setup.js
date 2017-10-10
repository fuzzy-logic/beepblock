// libs
const mongoose = require('mongoose');

// Services
const authService = require('./services/authService');
const userService = require('./services/userService');
const ethereumService = require('./services/ethereumService');

// Models
const User = mongoose.model('user');
const Profile = mongoose.model('profile');

// Set up the following accounts

const accounts = [
  {
    email: "grid@bppoc.com",
    password: "Pa$$w0rd",
    firstName: "National",
    lastName: "Grid",
    accountAddress: ''
  },
  {
    email: "user1@bppoc.com",
    password: "Pa$$w0rd",
    firstName: "Bob",
    lastName: "Rock",
    accountAddress: ''
  },
  {
    email: "user2@bppoc.com",
    password: "Pa$$w0rd",
    firstName: "Jim",
    lastName: "Boulder",
    accountAddress: ''
  }
];

function setUpHarness() {

  async function setUpTestAccounts() {

    let addresses = await ethereumService.getAccounts();

    const promises = accounts.map(async (acct, index) => {

      const {
        email,
        password,
        firstName,
        lastName
      } = acct;

      console.log(`Creating User ${email}`);

      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await userService.createUser({ email, password, firstName, lastName });
      }

      console.log(`Created User ${email}`);

      console.log(`Creating Account for User ${email}`);

      const address = addresses[index];

      console.log(`Created Account for User ${email}:${address}`);

      acct.accountAddress = address;

      console.log(`Creating Profile for User ${email}`);

      let profile = await Profile.findOne({ userId: user.id });

      if (profile) {
        profile.accountAddress = address;
      } else {
        profile = new Profile({
          userId: user.id,
          firstName,
          lastName,
          accountAddress: address,
        });
      }

      await profile.save();

      console.log(`Created Profile for User ${email}`);

    });

    return Promise.all(promises);

  }

  async function createTransactions() {

    console.log('Creating transactions...');

    // Create some transactions
    const gridAccountAddress = accounts[0].accountAddress;
    const user1AccountAddress = accounts[1].accountAddress;
    const user2AccountAddress = accounts[2].accountAddress;

    let userAccount = await ethereumService.getAccount(user1AccountAddress);

    if (userAccount.transactionCount == 0) {
      await userAccount.sendCoin(gridAccountAddress, 400);
      await userAccount.sendCoin(gridAccountAddress, 600);
      await userAccount.sendCoin(gridAccountAddress, 40);
      await userAccount.sendCoin(gridAccountAddress, 1000);
      await userAccount.sendCoin(gridAccountAddress, 900);
      await userAccount.sendCoin(user2AccountAddress, 1400);
      await userAccount.sendCoin(user2AccountAddress, 2600);
      await userAccount.sendCoin(user2AccountAddress, 430);
      await userAccount.sendCoin(user2AccountAddress, 4000);
      await userAccount.sendCoin(user2AccountAddress, 1900);
    }

    userAccount = await ethereumService.getAccount(user2AccountAddress);

    if (userAccount.transactionCount == 0) {
      await userAccount.sendCoin(gridAccountAddress, 500);
      await userAccount.sendCoin(gridAccountAddress, 100);
      await userAccount.sendCoin(gridAccountAddress, 5440);
      await userAccount.sendCoin(gridAccountAddress, 3000);
      await userAccount.sendCoin(gridAccountAddress, 430);
      await userAccount.sendCoin(user1AccountAddress, 1450);
      await userAccount.sendCoin(user1AccountAddress, 3200);
      await userAccount.sendCoin(user1AccountAddress, 4230);
      await userAccount.sendCoin(user1AccountAddress, 4000);
      await userAccount.sendCoin(user1AccountAddress, 1430);
    }

    console.log('Transactions created!');

  }

  return {
    setUpTestAccounts,
    createTransactions
  }

}

module.exports = setUpHarness();