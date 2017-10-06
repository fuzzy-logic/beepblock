import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import mutation from '../mutations/Signup';
import query from '../queries/currentUser';
import { hashHistory } from 'react-router';

import { Container, Row, Col, Form, Label, Input, FormGroup, Button } from 'reactstrap';

import AuthForm from './AuthForm';

class SignupForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      accountName: '',
      errors: []
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);

  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  componentWillUpdate(nextProps) {
    if (nextProps.data.user && !this.props.data.user) {
      hashHistory.push('/dashboard');
    }
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.mutate({
      variables: {
        email: this.state.email,
        password: this.state.password,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        accountName: this.state.accountName,
        hasBattery: false
      },
      refetchQueries: [{ query }]
    })
      .catch(resp => {
        const errors = resp.graphQLErrors.map(err => err.message);
        this.setState({ errors });
      })
  }

  renderErrors() {
    return this.state.errors.map(err => {
      return (
        <div key={err}>{err}</div>
      )
    });
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h3>Sign Up</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form onSubmit={this.onSubmit}>
              <AuthForm
                email={this.state.email}
                password={this.state.password}
                onEmailChange={this.handleEmailChange}
                onPasswordChange={this.handlePasswordChange}
              />
              <FormGroup className="input-field">
                <Input
                  placeholder="Account Name"
                  value={this.state.accountName}
                  onChange={e => this.setState({ accountName: e.target.value })}
                />
              </FormGroup>
              <FormGroup className="input-field">
                <Input
                  placeholder="First Name"
                  value={this.state.firstName}
                  onChange={e => this.setState({ firstName: e.target.value })}
                />
              </FormGroup>
              <FormGroup className="input-field">
                <Input
                  placeholder="Last Name"
                  value={this.state.lastName}
                  onChange={e => this.setState({ lastName: e.target.value })}
                />
              </FormGroup>
              <FormGroup className="errors">
                {this.renderErrors()}
              </FormGroup>
              <Button className="btn">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }

}

export default graphql(query)(
  graphql(mutation)(SignupForm)
);