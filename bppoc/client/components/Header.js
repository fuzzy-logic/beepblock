import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';
import query from '../queries/currentUser';
import mutation from '../mutations/Logout';

import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    }
  }

  onLogoutClick() {
    this.props.mutate({
      refetchQueries: [{ query }]
    });
  }

  renderButtons() {
    const {
      user,
      loading
     } = this.props.data;
    if (loading) { return <div />; }

    if (user) {
      return (
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="/#/dashboard">Dashboard</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/#/transactions">Transactions</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/#/profile">Profile</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#" onClick={this.onLogoutClick.bind(this)}>Logout</NavLink>
          </NavItem>
        </Nav>
      );
    } else {
      return (
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink href="/#/signup">Signup</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/#/login">Login</NavLink>
          </NavItem>
        </Nav>
      );
    }
  }

  render() {
    return (
      <Navbar className="navbar-dark bg-dark" expand="md">
        <NavbarBrand href="/">Home</NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          {this.renderButtons()}
        </Collapse>
      </Navbar>
    );
  }
}

export default graphql(mutation)(
  graphql(query)(Header)
);