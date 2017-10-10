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
    this.renderTransactions = this.renderTransactions.bind(this);
  }

  componentWillUpdate(nextProps) {
    console.log(nextProps.data.transactions);
    if (!this.props.data.transactions && nextProps.data.transactions) {
      this.setState({
        transactions: nextProps.data.transactions
      });
    }
  }

  renderTransactions() {
    return this.state.transactions.map(t => {
      return (
        <TransactionListItem key={t.id} transaction={t} />
      )
    })
  }

  render() {
    if (!this.state.transactions) {
      return (<div>Loading...</div>)
    }
    return (
      <div>
        <h3>Transactions</h3>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {this.renderTransactions()}
          </tbody>
        </Table>
      </div>
    )
  }

}

export default graphql(currentUserTransationsQuery)(Dashboard);