import { Switch, Route } from "react-router-dom";
import { Container } from "react-bootstrap";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Action from "./components/Action";
import List from "./components/List";
import File from "./components/File";
import Welcome from "./components/Welcome";
import About from "./components/About";
import ReceiptSignature from "./components/ReceiptSignature";
import ProtocolDescription from "./components/ProtocolDescription";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar/>
      <Container>
      <Switch>
        <Route exact path="/" component={Welcome} />
        <Route exact path="/about" component={About} />
        <Route exact path="/protocol-description" component={ProtocolDescription} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/sign-up" component={Register} />
        <ProtectedRoutes path="/home" component={Home} />
        <ProtectedRoutes path="/upload" component={() => <Action action="Upload"/>} />
        <ProtectedRoutes path="/send" component={() => <Action action="Send"/>} />
        <ProtectedRoutes path="/uploaded-files" component={() => <List type="Uploaded"/>} />
        <ProtectedRoutes path="/received-files" component={() => <List type="Received"/>} />
        <ProtectedRoutes path="/sent-files" component={() => <List type="Sent"/>} />
        <ProtectedRoutes path="/receipt-signature/:cid" component={ReceiptSignature} />
        <ProtectedRoutes path="/file/:fileName/:fileType/:cid/:from/:to/:chunkCount" component={File} />
      </Switch>
    </Container><br/>
    </div>
    
  );
}

export default App;
