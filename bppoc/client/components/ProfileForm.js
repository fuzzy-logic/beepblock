import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import profileQuery from '../queries/currentProfile';
import saveProfileMutation from '../mutations/SaveProfile';

import { Container, Row, Col, Form, Label, Input, FormGroup, Button } from 'reactstrap';

class ProfileForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      profile: {},
      hasBattery: false,
      errors: []
    };
    this.errors = [];
  }

  componentWillUpdate(nextProps) {
    if (!this.props.data.profile && nextProps.data.profile) {
      this.setState({
        profile: nextProps.data.profile,
        hasBattery: true
      },
        () => {
          console.log(this.state);
        });
    }
  }

  onSubmit(event) {
    event.preventDefault();
    for (const checkbox of this.selectedCheckboxes) {
      console.log(checkbox, 'is selected.');
    }
  }

  renderErrors() {
    return this.errors.map(err => {
      return (
        <div key={err}>{err}</div>
      )
    });
  }

  toggleHasBattery() {
    this.setState({
      profile: {
        hasBattery: !this.state.profile.hasBattery
      }
    });
  }

  render() {
    if (!this.state.profile) {
      return (
        <div>Loading...</div>
      )
    }
    return (
      <Container>
        <Row>
          <Col>
            <Form onSubmit={this.onSubmit.bind(this)} className="col s6">
              <FormGroup>
                <Label>
                  <Input type='checkbox' onChange={this.toggleHasBattery.bind(this)} checked={this.state.profile.hasBattery || false} />
                  Has Battery
                </Label>
              </FormGroup>
              <div className="errors">
                {this.renderErrors()}
              </div>
              <Button className="btn">Submit</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }

}

export default compose(
  graphql(
    profileQuery
  ),
  graphql(
    saveProfileMutation,
    {
      name: "saveProfileMutation"
    }
  )
)(ProfileForm);