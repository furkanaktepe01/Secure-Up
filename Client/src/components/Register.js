import React, { useState } from "react";
import { Alert, Col, Form, Button, InputGroup, Spinner } from "react-bootstrap";
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { Link } from "react-router-dom";

import server from "../api/axios";
import { getPublicKey } from "../api/Crypto";

export default function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {   

    e.preventDefault();

    setStatus("loading");

    const publicKey = getPublicKey(username, password);  

    server("POST", "/register", "", { username, password, publicKey })
      
      .then((result) => {

        window.location.href = "/login";
      })
      .catch((error) => {
        setStatus("");
        setError(error);
      });
  };

  return (

    <Col xs={12} sm={12} md={5}>
      
      <h2>Sign Up</h2>

      <Form onSubmit={(e) => handleSubmit(e)}>
        
        <br />
        
        <InputGroup className="mb-3">
          <InputGroup.Text id="inputGroup-sizing-default">
            Username
          </InputGroup.Text>
          <Form.Control
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </InputGroup>
        
        <InputGroup className="mb-3">
          <InputGroup.Text id="inputGroup-sizing-default">
            Password
          </InputGroup.Text>
          <Form.Control
            type={ showPassword? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <Button variant="outline-secondary" size="sm" onClick={() => setShowPassword(!showPassword)}>
            {showPassword? <EyeSlash/> : <Eye/>}
          </Button>
        </InputGroup>

        <Button
          variant="primary"
          type="submit"
          className="float-right"
        >
          { status == "loading" ? <Spinner animation="border" variant="light" size="sm" /> : "Sign Up" }
        </Button>
        <br/><br/>

        { error ? 
          <Alert variant="danger">
            Invalid username or password.
          </Alert> : 
          <></>
        }

        <p>Already have an account?</p><Link to="/login">Login</Link>
      </Form>
    </Col>
  );
}
