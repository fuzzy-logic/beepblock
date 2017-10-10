import React, { Component } from 'react';
import AuthForm from './AuthForm';
import mutation from '../mutations/Login';
import { graphql } from 'react-apollo';
import query from '../queries/currentUser';
import { hashHistory } from 'react-router';

import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';

class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: []
    };

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
        password: this.state.password
      },
      refetchQueries: [{ query }]
    }).catch(resp => {
      const errors = resp.graphQLErrors.map(err => err.message);
      this.setState({ errors });
    });
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
            <h3>Login</h3>
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
  graphql(mutation)(LoginForm)
);