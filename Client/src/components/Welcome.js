import Cookies from "universal-cookie";
import { Col, Row, Button, Card } from "react-bootstrap";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const Welcome = () => {

    return (
        <div>
            <Row>
                <Col><h1>Welcome to <i style={{color: "darkcyan"}}>Secure-up</i></h1></Col>
                <Col><Button className="float-right" href={token ? "/home": "/login"}><i>Start Securing Up!</i></Button></Col>
            </Row>
            <br/>
            <h5><i>
                Secure-up is a secure, distributed file storage and sharing system <br/>
                that combines the security of <a target="blank" href="https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme">modern cryptography</a> and 
                the decentralization of <a target="blank" href="https://en.wikipedia.org/wiki/InterPlanetary_File_System">InterPlanetary File System</a>.    
            </i></h5><br/>
            <Card>
                <Card.Body>
                    <Card.Title>Sign Up</Card.Title>
                    <Card.Text>
                        Choose a username and a password to sign up in the system. Your account with an associated <a href="https://en.wikipedia.org/wiki/Public-key_cryptography" target="blank"><i><b>key pair</b></i></a> gets created as you sign up.
                        Behind the scenes, this key pair will be used for the underlying <a href="https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme" target="blank"><i><b>cryptographic operations</b></i></a>, hence the privacy of your password is 
                        the key to the security of your identity in the system and the files associated with your account.
                    </Card.Text>
                </Card.Body>
            </Card><br/>
            <Card>
                <Card.Body>
                    <Card.Title>Encrypt & Upload/Send</Card.Title>
                    <Card.Text>
                        You can upload files for yourself or send files to others. The file gets divided into smaller chunks and then, using <a href="https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme" target="blank"><i><b>Elliptic Curve Integrated Encryption Scheme</b></i></a>, each chunk gets encrypted with the public key of the recipient, 
                        which means the only person who can view these chunks and hence the file is the holder of the corresponding private key, the recipient. 
                    </Card.Text>
                </Card.Body>
            </Card><br/>
            <Card>
                <Card.Body>
                    <Card.Title>IPFS & Filecoin</Card.Title>
                    <Card.Text>
                        The encrypted file chunks are stored on the <a href="https://en.wikipedia.org/wiki/Filecoin" target="blank"><i><b>Filecoin network</b></i></a>, 
                        via <a href="https://web3.storage" target="blank"><i><b>web3.storage</b></i></a>, 
                        and is accessible on the public <a href="https://en.wikipedia.org/wiki/InterPlanetary_File_System" target="blank"><i><b>IPFS network</b></i></a>, which means no central authority can ever delete, alter, or censor the stored data.
                    </Card.Text>
                </Card.Body>
            </Card><br/>
            <Card>
                <Card.Body>
                    <Card.Title>Decrypt & View & Sign</Card.Title>
                    <Card.Text>
                        You can view the files uploaded by you or sent to you, by decrypting them using your password, the file chunks get retrieved  
                        and decrypted then joined to form the original file. 
                        Then you can sign the files sent to you by typing your username; which creates a receipt signature for the file, using 
                        <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm" target="blank"><i><b> Elliptic Curve Digital Signature Algorithm</b></i></a>, 
                        enabling the sender to verify that you have received the file. 
                    </Card.Text>
                </Card.Body>
            </Card><br/>
            <Button className="float-right" href={token ? "/home": "/login"}><i>Start Securing Up!</i></Button><br/><br/><br/><br/>
        </div>
    );
}

export default Welcome;