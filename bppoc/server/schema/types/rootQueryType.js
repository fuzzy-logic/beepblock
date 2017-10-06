const graphql = require('graphql');
const { 
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const UserType = require('./userType');
const ProfileType = require('./profileType');
const TransactionType = require('./transactionType');

const ProfileService = require('../../services/profileService');
const AccountService = require('../../services/accountService');

const mongoose = require('mongoose');
const User = mongoose.model('user');
const Profile = mongoose.model('profile');

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      resolve(parentValue, args, req) {
        return req.user;
      }
    },
    profile: {
      type: ProfileType,
      resolve(parentValue, args, req) {
        return ProfileService.findOne({ "userId": req.user.id });
      }
    },
    transactions: {
      type: new GraphQLList(TransactionType),
      resolve(parentValue, args, req) {
        return AccountService.getTransactions(req.user)
      }
    }
  }
});

module.exports = RootQueryType;
