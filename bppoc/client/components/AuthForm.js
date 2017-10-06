import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class AuthForm extends Component {

  constructor(props) {
    super(props);
  }

  renderErrors() {
    return this.props.errors.map(err => {
      return (
        <div key={err}>{err}</div>
      )
    });
  }

  render() {
    return (
      <div>
        <FormGroup className="input-field">
          <Input
            placeholder="Email"
            value={this.props.email}
            onChange={this.props.onEmailChange}
          />
        </FormGroup>
        <FormGroup className="input-field">
          <Input
            placeholder="Password"
            type="password"
            value={this.props.password}
            onChange={this.props.onPasswordChange}
          />
        </FormGroup>
      </div>
    )
  }
}

export default AuthForm;