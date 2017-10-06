import gql from 'graphql-tag';

export default gql`
  {
    profile {
      id,
      userId,
      hasBattery
    }
  }
`;