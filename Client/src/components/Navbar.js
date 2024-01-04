import Cookies from "universal-cookie";
import { Button, Container, Nav, Navbar } from 'react-bootstrap';

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const NavBar = () => {

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand href="/"><h1>Secure-up</h1></Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="about">About Secure-up</Nav.Link> 
            <Nav.Link href="protocol-description">Protocol Description</Nav.Link>
            <Nav.Link href="https://github.com/furkanaktepe01/Secure-up" target="_blank">Source Code</Nav.Link>
          </Nav>
        </Container>
        <Button 
          variant={ token ? "danger" : "light" } 
          href={ token ? "/" : "/login" }
          onClick={() => { if (token) { cookies.remove("TOKEN", { path: "/" }); }}}
        >
          { token ? <b>Logout</b> : <b style={{color: "blue"}} >Login</b> }
        </Button>
      </Navbar>
      <br/><br/>
    </>
  );
}

export default NavBar;