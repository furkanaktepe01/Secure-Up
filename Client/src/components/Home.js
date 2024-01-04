import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Table, Button, Card, Col, Row, Spinner } from "react-bootstrap";

import server from "../api/axios";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function Home() {

  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [publicKey, setPublicKey] = useState([]);

  const spinner = <Spinner animation="border" variant="primary" size="lg" />;

  useEffect(() => {

    server("GET", "/users", token, "")
      
      .then((result) => {

        const { id, username, publicKey } = result.data;
        
        setId(id); 
        setUsername(username); 
        setPublicKey(publicKey);
      })
      .catch((error) => {
        error = new Error();
      });
    
  }, []);

  return (
    <div>
      
      <h1 className="text-center">Welcome</h1>
      
      <br/>
      
      <Col md={{ span: 6, offset: 3 }}>
        <Table striped bordered hover >
          <tbody>
            <tr>
              <td><b>Username</b></td>
              <td><i>{ username.length ? username : spinner }</i></td>
            </tr>
            <tr>
              <td><b>User ID</b></td>
              <td><i>{ id.length ? id : spinner }</i></td>
            </tr>
            <tr>
              <td><b>Public Key</b></td>
              <td> { publicKey.length ? 
                <><i>{publicKey.filter((n, i) => {return (i < publicKey.length/4) ? n : ""})}</i><br/>
                <i>{publicKey.filter((n, i) => {return (i >= publicKey.length/4 && i < publicKey.length/2) ? n : ""})}</i><br/>
                <i>{publicKey.filter((n, i) => {return (i >= publicKey.length/2 && i < 3*(publicKey.length/4)) ? n : ""})}</i><br/>
                <i>{publicKey.filter((n, i) => {return (i >= 3*(publicKey.length/4)) ? n : ""})}</i></>
                : spinner}
              </td>
            </tr>
            
          </tbody>
        </Table>
      </Col>
      

      <br/>

      <Row>
        <Col md={{ span: 3, offset: 1 }}>
          <Card style={{ width: '23rem' }}>
            <Card.Body>
              <Card.Title><p style={{textAlign: "center"}}>Personal Files</p></Card.Title>
              <Card.Text>
                <ul>
                  <li>Uploaded files get encrypted by the uploader's credentials and stored on InterPlanetary File System.</li>
                  <li>Only the uploader can decrypt and view the file.</li>
                </ul>
              </Card.Text>
              <Button variant="primary" className="float-left" href="/upload">Upload a file</Button>
              <Button variant="primary" className="float-right" href="/uploaded-files">View uploaded files</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={{ span: 3, offset: 3 }}>
          <Card style={{ width: '25rem' }}>
            <Card.Body>
              <Card.Title><p style={{textAlign: "center"}}>Shared Files</p></Card.Title>
              <Card.Text>
                <ul>
                  <li>Sent files get encrypted by the receiver's credentials and stored on InterPlanetary File System.</li>
                  <li>Only the receiver can decrypt and view the file.</li>
                </ul>
              </Card.Text>
              <Button variant="primary" className="float-left" href="/send">Send a file</Button>
              <Button variant="primary" className="float-right" href="/sent-files">View sent/received files</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      

    </div>
  );
}
