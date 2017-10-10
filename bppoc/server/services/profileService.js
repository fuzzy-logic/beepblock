const mongoose = require('mongoose');
const ethereumService = require('./ethereumService');

const Profile = mongoose.model('profile');

create = async (userId, firstName, lastName, accountName, hasBattery) => {
  
  const profile = new Profile({ 
    userId, 
    firstName,
    lastName,
    accountName,
    hasBattery
  });
    
  if (await Profile.findOne({ userId })) {
    throw new Error('User already has a profile!');
  }

  const account = await ethereumService.createAccount();

  profile.accountAddress = account.accountAddress;
  await profile.save();

  return profile;

}

function save({ userId, hasBattery }) {
  let profile = new Profile({ userId, hasBattery });
  if (!userId) { throw new Error('Cannot create a profile without a user Id.'); }

  return Profile.findOne({ userId })
    .then(existingProfile => {
      if (existingProfile) {
        existingProfile.hasBattery = profile.hasBattery;
        profile = existingProfile;
      }
      return profile.save();
    });
}

function findOne({ userId }) {
  let profile = new Profile({ userId });
  if (!userId) { throw new Error('Cannot create a profile without a user Id.'); }

  return Profile.findOne({ userId })
    .then(existingProfile => {
      if (!existingProfile) {
        console.log('No profile...')
        profile.hasBattery = false;
        profile.save();
        console.log('Saved profile');
      } else {
        profile = existingProfile;
      }
      return profile;
    });
}

module.exports = { save, findOne, create };

