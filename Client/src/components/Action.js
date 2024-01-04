import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Alert, Col, InputGroup, Form, SplitButton, Dropdown, Spinner, ProgressBar  } from "react-bootstrap";

import server from "../api/axios";
import { encrypt } from "../api/Crypto";
import { storeFiles, chunkSize } from "../api/Web3Storage";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const Action = ({ action }) => {
  
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [self, setSelf] = useState("");
  const [CID, setCID] = useState("");
  const [bufferChunks, setBufferChunks] = useState([]);
  const [chunkCount, setChunkCount] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [barLevel, setBarLevel] = useState(0);
  const [barMessage, setBarMessage] = useState("");
  const [validated, setValidated] = useState(false);

  const store = async (self, recipient, recipientPublicKey) => {

    setBarLevel(60);
    setBarMessage("Encrypting the file...");

    setBarLevel(80);
    setBarMessage("Uploading the encrypted file to IPFS...");   

    const files = await Promise.all(bufferChunks.map(
      async (chunk, index) => filefy(await encrypt(recipientPublicKey, chunk), index + 1)
    ));

    const cid = await storeFiles(files);

    setCID(cid);

    server("POST", "/file", token, { fileName, fileType, cid, from: self, to: recipient, chunkCount })
      
      .then((result) => {
        setBarLevel(100); 
        setBarMessage("Successfully uploaded to IPFS");
        setStatus("loaded");
      })
      .catch((error) => {
        setStatus("");
        setError("The file metadata could not get stored at the database.");
      });
  }
  
  const onSubmit = async (e) => {

    e.preventDefault();

    setValidated(true);
    
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      return;
    }

    setStatus("loading");                                   
    
    setBarLevel(20); 
    
    setBarMessage(`Preparing to ${action.toLowerCase()}...`);

    const result = await server("GET", "/users", token, "");
      
    const { username: self, publicKey: selfPublicKey } = result.data;

    setSelf(self);

    setBarLevel(40);
        
    if (action == "Upload") {

      store(self, self, selfPublicKey);  
      
    } else {
 
      server("GET", `/public-key-of/${recipient}`, token, "")
      
        .then((result) => {                                           

          const recipientPublicKey = result.data;                     

          store(self, recipient, recipientPublicKey);
        })
        .catch((error) => {
          setStatus("");
          setError("Invalid recipient username.");
        });
    }    
  }

  const captureFile = (e) => {
    
    e.preventDefault(); 

    const file = e.target.files[0]; 

    setFileType(file.type);
    
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => { 
      chunkify(new Uint8Array(reader.result));
    }
  }

  const chunkify = (buffer) => {          

    let chunks = [];

    let pointer = 0;

    const chunkCount = Math.ceil(buffer.byteLength / chunkSize);

    for (let i = 0; i < chunkCount; i++) {

      chunks.push(Buffer(buffer.subarray(pointer, pointer + chunkSize)));         

      pointer += chunkSize;
    }

    setBufferChunks(chunks);  

    setChunkCount(chunkCount);
  }

  const filefy = (object, no) => {  

    const blob = new Blob([JSON.stringify(object)], { type: 'application/json' });  

    return new File([blob], `${no}.json`); 
  }

  return (
    <div className="text-center">
      
      <h2>{action} a file</h2>
      
      <br/>

      <Col md={{ span: 6, offset: 3 }}>
        
        <Form noValidate validated={validated} onSubmit={onSubmit}>
          
          <Form.Group>
            <InputGroup hasValidation>
              <InputGroup.Text>
                File Name
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="Enter file name"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please choose a file name.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          { action == "Send" ? 
            <Form.Group>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  Recipient
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={recipient}
                  onChange={e => { setRecipient(e.target.value); setError(""); }}
                  placeholder="Enter recipient's username"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please choose a recipient.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            : <></>
          }

          <Form.Group>
            <InputGroup hasValidation>
              <Form.Control
                type="file"
                onChange={e => captureFile(e)}
                accept="image/png, image/jpg, video/mp4, application/pdf"
                required
              />
              <p className="float-left"><i>Choose an image, a video, or a PDF file.</i></p>
              <Form.Control.Feedback type="invalid">
                <p className="float-left">Please choose a file.</p>
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          
          <SplitButton
            type="submit"
            variant="primary"
            disabled={status == "loading"}
            title={ status == "loading" ? <Spinner animation="border" variant="light" size="sm" /> : action }
            className="float-right"
            onSelect={(e) => { window.location.href = e; }}
          >
            <Dropdown.Item eventKey="upload">Upload</Dropdown.Item>
            <Dropdown.Item eventKey="send">Send</Dropdown.Item>
          </SplitButton>

        </Form>

        <br/><br/><br/>

        { status == "loading" ? 
          <>{<i><b>{barMessage}</b></i>}
          <ProgressBar animated now={barLevel} label={<i><b>{barLevel} %</b></i>} /></> : 
          <></>
        }

        { status == "loaded" ? 
          <Alert variant="success">
            The file <a href={action == "Upload" ? `/file/${fileName}/${fileType.split("/").join("-")}/${CID}/${self}/${self}/${chunkCount}` : null}><i>"{fileName}"</i></a> has been { action == "Upload" ? "uploaded" : `sent to ${recipient}`}.
          </Alert> : 
          <></>
        }

        { error ? 
          <Alert variant="danger">
            {error}
          </Alert> : 
          <></>
        }

      </Col>
    </div>
  );
}

export default Action;