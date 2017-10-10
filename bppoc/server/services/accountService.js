const mongoose = require('mongoose');
const ethereumService = require('./ethereumService');

const Profile = mongoose.model('profile');

getTransactions = async (user) => {

  const profile = await Profile.findOne({ userId: user.id });

  if (!profile || !profile.accountAddress) {
    throw new Error('Could not locate user profile');
  }

  const account = await ethereumService.getAccount(profile.accountAddress);

  return await account.getTransactions();

}

module.exports = { getTransactions };