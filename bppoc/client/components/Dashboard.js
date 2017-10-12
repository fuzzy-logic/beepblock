import React, { Component } from "react";
import socketIOClient from "socket.io-client";

import { Container, Row, Col, Table } from 'reactstrap';

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4000",
      transactions: []
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => {
      const latestTransactions =
        this.state.transactions
          .concat([data])
          .sort((a, b) => {
            if (a.blockNumber > b.blockNumber) return -1
            if (a.blockNumber < b.blockNumber) return 1
            return 0;
          })
          .slice(0, 15);
      this.setState({
        transactions: latestTransactions
      });
    });
  }

  renderTransactions() {
    if (!this.state.transactions) {
      return (
        <p>Loading...</p>
      )
    }
    return this.state.transactions.map(t => {
      return (
        <tr key={t.blockNumber} className="newRow">
          <td>{t.blockNumber}</td>
          <td>{t.from}</td>
          <td>{t.to}</td>
          <td className="text-right">£{t.amount}</td>
        </tr>
      )
    })
  }

  render() {
    const { response } = this.state;
    return (
      <Container>
        <Row>
          <Col>
            <h3>Latest Transactions</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>Block No.</th>
                  <th>From Acct.</th>
                  <th>To Acct.</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {this.renderTransactions()}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Dashboard;