import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Navbar, Nav, Form, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LogoutButton, LoginButton } from './Auth';
import { useState, useEffect } from 'react';
import API from './API';

const Navigation = (props) => {

  const handleSubmit = (event) => {
    event.preventDefault();

  }
  const [dirtyName, setDirtyName] = useState();
  useEffect(() => {
    API.getName()
      .then(name => {
        props.setSiteName(name);
        setDirtyName(false);
      })
      .catch(e => {
        handleErrors(e); setDirtyName(false);
      });
  }, [dirtyName]);

  return (
    <Navbar bg="success" expand="sm" variant="dark" fixed="top" className="navbar-padding ml-auto">
      <Container fluid>
        <Link to="/">
          <Navbar.Brand>
            <i className="bi bi-subtract icon-size" />{props.siteName}
          </Navbar.Brand>
        </Link>
        <Nav className="ml-auto">
          <div className="d-flex justify-content-end">
            <Form className="mx-2">
              {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
            </Form>
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}

export { Navigation }; 