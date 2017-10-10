const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Every user has an email and password.  The password is not stored as
// plain text - see the authentication helpers below.
const ProfileSchema = new Schema({
  userId: String,
  firstName: String,
  lastName: String,
  accountAddress: String,
  address: {}
});

ProfileSchema.virtual('accountName').get(function() {  
  return this.firstName + ' ' + this.lastName;
});

mongoose.model('profile', ProfileSchema);