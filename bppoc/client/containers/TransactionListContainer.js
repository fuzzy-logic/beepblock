import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import currentUserTransationsQuery from '../queries/currentUserTransactions';

import TransactionListItem from '../components/TransactionListItem';

class TransactionListContainer extends Component{

  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
    this.renderTransactions = this.renderTransactions.bind(this);
  }

  componentWillUpdate(nextProps) {
    if (!this.props.data.transactions && nextProps.data.transactions) {
      this.setState({
        transactions: nextProps.data.transactions
      });
    }
  }

  renderTransactions() {
    return this.state.transactions.map(t => {
      return (
        <TransactionListItem key={t.id} transaction={t}/>
      )
    })
  }

  render(){
    if(!this.state.transactions){
      return(<div>Loading...</div>)
    }
    return (
      <div>
        <h3>Transactions</h3>
        <ul>
          {this.renderTransactions()}
        </ul>
      </div>
    )
  }

}

export default graphql(currentUserTransationsQuery)(TransactionListContainer);