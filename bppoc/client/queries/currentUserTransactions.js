import gql from 'graphql-tag';

export default gql`
  {
    transactions {
      id,
      from,
      to,
      amount,
      timestamp
    }
  }
`;