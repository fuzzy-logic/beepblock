import React, { Component } from 'react';

import { Table } from 'reactstrap';

import TransactionListItem from '../components/TransactionListItem';

class TransactionList extends Component {

  constructor(props) {
    super(props);
  }

  renderTransactions() {
    const {
      showFrom,
      showTo
    } = this.props;
    return this.props.transactions.map(t => {
      return (
        <TransactionListItem key={t.id} transaction={t} showFrom={showFrom} showTo={showTo}/>
      )
    })
  }

  render() {
    return (
      <Table responsive size="sm">
        <thead>
          <tr>
            <th>Date</th>
            {
              this.props.showFrom ?
                <th>From</th>
                : null
            }
            {
              this.props.showTo ?
                <th>To</th>
                : null
            }
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {this.renderTransactions()}
        </tbody>
      </Table>
    )
  }

}

export default TransactionList;