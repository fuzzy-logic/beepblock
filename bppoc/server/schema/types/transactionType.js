const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} = graphql;

const TransactionType = new GraphQLObjectType({
  name: 'TransactionType',
  fields: {
    id: { type: GraphQLID },
    from: { type: GraphQLString },
    to: { type: GraphQLString },
    amount: { type: GraphQLString }
  }
});

module.exports = TransactionType;