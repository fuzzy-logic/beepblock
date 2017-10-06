import gql from 'graphql-tag';

export default gql`
  mutation Signup($email: String, $password: String, $firstName:String, $lastName:String, $accountName:String, $hasBattery:Boolean) {
    signup(email:$email, password:$password, firstName:$firstName, lastName:$lastName, accountName:$accountName, hasBattery:$hasBattery) {
      id,
      profile {
        id
      }
    }
  }
`;