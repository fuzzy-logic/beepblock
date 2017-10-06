const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID
} = graphql;

const UserType = require('./types/userType');
const ProfileType = require('./types/profileType');

const AuthService = require('../services/authService');
const ProfileService = require('../services/profileService');

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    signup: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        accountName: { type: GraphQLString },
        hasBattery: { type: GraphQLBoolean }
      },
      resolve(parentValue, { email, password, firstName, lastNamee, accountName, hasBattery }, req) {
        return AuthService.signup({
          email,
          password,
          firstName, 
          lastNamee, 
          accountName,
          hasBattery,
          req
        });
      }
    },
    logout: {
      type: UserType,
      resolve(parentValue, args, req) {
        const { user } = req;
        req.logout();
        return user;
      }
    },
    login: {
      type: UserType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString}
      },
      resolve(parentValue, { email, password }, req) {
        return AuthService.login({
          email,
          password,
          req
        });
      }
    },
    saveProfile: {
      type: ProfileType,
      args: {
        hasBattery: { type: GraphQLBoolean }
      },
      resolve(parentValue, { hasBattery }, req) {
        return ProfileService.save({
          userId: req.user.id,
          hasBattery
        });
      }
    }
  }
});

module.exports = mutation;