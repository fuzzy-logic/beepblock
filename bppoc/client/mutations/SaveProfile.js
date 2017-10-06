import gql from 'graphql-tag';

export default gql`
  mutation SaveProfile($hasBattery: Boolean) {
    saveProfile(hasBattery:$hasBattery) {
      id,
      userId,
      hasBattery
    }
  }
`;