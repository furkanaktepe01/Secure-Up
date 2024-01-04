import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spinner, Alert, Col, Row, Form, Button, InputGroup } from "react-bootstrap";
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import Iframe from 'react-iframe';
import { saveAs } from 'file-saver';

import server from "../api/axios";
import { decrypt, getPrivateKey, sign } from "../api/Crypto";
import { linkify } from "../api/Web3Storage";

const File = () => {

    const [password, setPassword] = useState("");
    const [encryptedBufferChunks, setEncryptedBufferChunks] = useState([]);
    const [buffer, setBuffer] = useState([]);
    const [status, setStatus] = useState("");
    const [isSigned, setIsSigned] = useState(false);
    const [signatureUsername, setSignatureUsername] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { fileName, fileType, cid, from, to: username, chunkCount } = useParams();

    useEffect(() => {  

      checkSignature();

      if (!encryptedBufferChunks.length) {
       
        retrieveEncryptedFile();
      } 
      
    }, [encryptedBufferChunks]);

    const checkSignature = async () => {

        const { data } = await server("POST", "/signatures/check", "", { cid: cid })

        setIsSigned(data);
    };

    const retrieveEncryptedFile = async () => {

        let chunks = [];

        for (let i = 1; i <= chunkCount; i++) {
            
            const chunk = originalify((await axios.get(linkify(cid, i))).data);
            
            chunks.push(chunk);
        }
 
        setEncryptedBufferChunks(chunks);
    }
 
    const decipher = async () => {

        const privateKey = getPrivateKey(username, password);   

        let decryptedChunks = [];

        for (let i = 0; i < chunkCount; i++) {     
            
            const decryptedChunk = await decrypt(privateKey, encryptedBufferChunks[i]);
            
            decryptedChunks = [...decryptedChunks, ...decryptedChunk];
        }

        setBuffer(decryptedChunks);
    }

    const verifyPassword = async () => {                                  
        
        return server("POST", "/login", "", { username, password })

            .then((result) => {
                return true;   
            })
            .catch((error) => {
                setStatus("Invalid password");
                return false;
            });
    }

    const originalify = (unoriginal) => {

        let original = {};

        Object.keys(unoriginal).forEach(k => { original[k] = Buffer.from(unoriginal[k].data); });

        return original;
    }

    const handleDecryption = async (e) => {

        e.preventDefault();

        setStatus("loading");

        if (! (await verifyPassword())) {

            return;
        } 

        await decipher();

        setStatus("");
    }

    const handleSigning = async (e) => {

        e.preventDefault();
        
        setStatus("signing");

        if (signatureUsername != username) {
            setStatus("Invalid username")
            return ;
        }

        const privateKey = Buffer.from(getPrivateKey(username, password));
        
        server("POST", "/signatures", "", { cid: cid, receiptSignature: await sign(cid, privateKey) })

            .then((result) => {
                setStatus("signed");
            })
            .catch((error) => {
                setStatus("");
            });
    }

    const display = (mimeType, data) => {

        let file;

        const source = `data:${mimeType};base64,${data}`;   

        switch (mimeType) {

            case "video/mp4":
                file = (
                    <video
                        src={ source } 
                        controls
                        width="640px"
                        height="360px"
                    />
                );
                break;

            case "image/png":
            case "image/jpg":
            case "image/jpeg":
                file = <img src={ source }/>;
            break;
            
            case "application/pdf": 
                file = (
                    <Iframe 
                        url={URL.createObjectURL(blobify(data))} 
                        width="950px"
                        height="750px"
                        position="relative"    
                    /> 
                );
                break;
        } 

        return file;
    }

    const blobify = (data) => {

        const bytes = atob(data);
        let length = bytes.length;
        let out = new Uint8Array(length);

        while (length--) {
            out[length] = bytes.charCodeAt(length);
        }

        return new Blob([out], { type: 'application/pdf' });
    };

    return (
        <div>
            
            <h1>{fileName}</h1>
            <a href={linkify(cid)} target="blank"><h6><i>{cid}</i></h6></a>
            <h5>Sent by: <i>{from}</i></h5><br/>

            { buffer.length ? 
                
                <>
                    {display(fileType.split("-").join("/"), Buffer.from(buffer).toString("base64"))}
                    <br/><br/>
                    <Button onClick={() => {
                        saveAs(`data:${fileType.split("-").join("/")};base64,${Buffer.from(buffer).toString("base64")}`, fileName)
                    }}>
                        Download
                    </Button>

                    <br/><br/><br/>

                    { (from != username && !isSigned) ?
                        
                        <Col>
                            <Row md={2} className="justify-content-md-left">
                                <Form>
                                    <InputGroup className="float-left">
                                        <InputGroup.Text id="inputGroup-sizing-default">
                                        Receipt Signature
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            name="signatureUsername"
                                            value={signatureUsername}
                                            onChange={(e) => setSignatureUsername(e.target.value)}
                                            placeholder="Enter your username to sign"
                                        />
                                        <Button type="submit" onClick={e => handleSigning(e)}>
                                            { status == "signing" ? <Spinner animation="border" variant="light" size="sm" /> : "Sign" }
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Row>
                            <br/>
                            <Row>
                                { status == "signed" ? 
                                    <Alert variant="success">
                                        The file <i>"{fileName}"</i> has been signed.
                                    </Alert> : 
                                    <></>
                                }
                            </Row>
                            <Row>
                                { status == "Invalid username" ? 
                                    <Alert variant="danger">
                                        Invalid username.
                                    </Alert> : 
                                    <></>
                                }
                            </Row>
                        </Col>: 
                        <></>
                    }
                    <br/><br/><br/>
                </> :

                <>{ encryptedBufferChunks.length ?

                    <Col>
                        <Row md={1} className="justify-content-md-left">
                            <Form>
                                <InputGroup className="float-left">
                                    <InputGroup.Text id="inputGroup-sizing-default">
                                    Password
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={ showPassword? "text" : "password"}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password to decrypt the file"
                                    />
                                    <Button variant="outline-secondary" size="sm" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword? <EyeSlash/> : <Eye/>}
                                    </Button>
                                    <Col>
                                        <Button type="submit" onClick={e => handleDecryption(e)}>
                                            { status == "loading" ? <Spinner animation="border" variant="light" size="sm" /> : "Decrypt" }
                                        </Button>
                                    </Col>
                                </InputGroup>
                            </Form>
                        </Row>
                        <br/>
                        <Row>
                            { status == "Invalid password" ? 
                                <Alert variant="danger">
                                    Invalid password.
                                </Alert> : 
                                <></>
                            }
                        </Row>
                    </Col> : 
                    <Spinner animation="border" variant="dark" size="lg" />
                }</>
            }
        </div>
    );

}

export default File;