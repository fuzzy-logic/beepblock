import React, { Component } from 'react';
import { graphql } from 'react-apollo';

import currentUserTransationsQuery from '../queries/currentUserTransactions';

import { Container, Row, Col } from 'reactstrap';

import TransactionList from '../components/TransactionList';

class TransactionListContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    }
    this.renderTransactions = this.renderTransactions.bind(this);
    this.renderIncomingTransactions = this.renderIncomingTransactions.bind(this);
    this.renderOutgoingTransactions = this.renderOutgoingTransactions.bind(this);
  }

  componentWillUpdate(nextProps) {
    if (!this.props.data.transactions && nextProps.data.transactions) {
      console.log('Setting transaction state..');
      this.setState({
        transactions: nextProps.data.transactions
      });
    }
  }

  renderIncomingTransactions() {
    console.log(`renderIncomingTransactions:${this.state.transactions.length}`);
    const incomingTransactions = this.state.transactions.filter((t) => {
      return t.transactionType == 'C';
    });
    return this.renderTransactions(incomingTransactions, true, false);
  }

  renderOutgoingTransactions() {
    console.log(`renderIncomingTransactions:${this.state.transactions.length}`);
    const outgoingTransactions = this.state.transactions.filter((t) => {
      return t.transactionType == 'D';
    });
    return this.renderTransactions(outgoingTransactions, false, true);
  }

  renderTransactions(transactions, showFrom, showTo) {
    return (
      <TransactionList transactions={transactions} showFrom={showFrom} showTo={showTo} />
    )
  }

  render() {
    if (!this.state.transactions) {
      return (<div>Loading...</div>)
    }
    return (
      <Container>
        <Row>
          <Col>
            <h3>Incoming Transactions</h3>
            {this.renderIncomingTransactions()}
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Outgoing Transactions</h3>
            {this.renderOutgoingTransactions()}
          </Col>
        </Row>
      </Container>
    )
  }

}

export default graphql(currentUserTransationsQuery)(TransactionListContainer);