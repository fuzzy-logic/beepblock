// Libraries
const mongoose = require('mongoose');

// Services 
const profileService = require('./profileService');

// Models
const User = mongoose.model('user');

async function createUser({ email, password, firstName, lastName}) {

  if (!email || !password) { throw new Error('You must provide an email and password.'); }

  let user = new User({ email, password });
  const existingUser = await User.findOne({ email });

  if (existingUser) { 
    throw new Error('Email in use');
  }
  
  user = await user.save();

  const profile = await profileService.create(user.id, firstName, lastName);
  console.log(`created profile...${profile}`);

  return user;

}

module.exports = {
  createUser
}