import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import currentUserTransationsQuery from '../queries/currentUserTransactions';

import TransactionListItem from '../components/TransactionListItem';

import { Table } from 'reactstrap';

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
  }

  render() {
    return (
      <div>
        <h3>Dashboard</h3>
      </div>
    )
  }

}

export default Dashboard;