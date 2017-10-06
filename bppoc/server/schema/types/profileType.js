const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean
} = graphql;

const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields: {
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    accountName: { type: GraphQLString },
    hasBattery: { type: GraphQLBoolean },
    accountAddress: { type: GraphQLString }
  }
});

module.exports = ProfileType;