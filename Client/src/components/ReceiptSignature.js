import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Cookies from "universal-cookie";
import { Table, Button, Col, Alert, Spinner } from "react-bootstrap";

import server from "../api/axios";
import { verify, sha256 } from "../api/Crypto";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const ReceiptSignature = () => {

    const [file, setFile] = useState();
    const [supposedPublicKey, setSupposedPublicKey] = useState([]);
    const [status, setStatus] = useState("");

    const { cid } = useParams();
    const cidHash = sha256(cid);

    useEffect(() => {

        setStatus("loading");

        server("POST", `/signature-of`, token, { cid: cid})
        
            .then((result) => {

                setFile(result.data[0]);    

                server("GET", `/public-key-of/${result.data[0].to}`, token, "")
      
                    .then((result) => {

                        setSupposedPublicKey(result.data);
                    });
                
                setStatus("");
            })
            .catch((error) => {
                setStatus("error");
            });
        
        
    }, []);

    const verifySignature = async () => {  

        await verify(supposedPublicKey, cidHash, file.receiptSignature) ?
        setStatus("verified") :
        setStatus("unverified");
    }
    
    return (
        <div>
            <h2 className="text-center">Receipt Signature</h2>
            <br/>
            { supposedPublicKey.length ? 

                ( status == "verified" ? 

                    <Col>
                        <Table striped bordered hover>
                            <tbody>
                                <tr>
                                    <td><b>File</b></td>
                                    <td><i>{file.fileName}</i></td>
                                </tr>
                                <tr>
                                    <td><b>Receiver</b></td>
                                    <td><i>{file.to}</i></td>
                                </tr>
                                <tr>
                                    <td><b>Message</b></td>
                                    <td><i>{cid}</i></td>
                                </tr>
                                <tr>
                                    <td><b>Message Hash</b></td>
                                    <td><i>{cidHash}</i></td>
                                </tr>
                                <tr>
                                    <td><b>Signature</b></td>
                                    <td>
                                        <i>{file.receiptSignature.filter((n, i) => {return i < file.receiptSignature.length/2 ? n : ""})}</i><br/>
                                        <i>{file.receiptSignature.filter((n, i) => {return i >= file.receiptSignature.length/2 ? n : ""})}</i>
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>Signer's Public Key</b></td>
                                    <td>
                                        <i>{supposedPublicKey.filter((n, i) => {return i < supposedPublicKey.length/2 ? n : ""})}</i><br/>
                                        <i>{supposedPublicKey.filter((n, i) => {return i >= supposedPublicKey.length/2 ? n : ""})}</i>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col> :
                    
                    ( status == "unverified" ?
                        <Alert variant="danger">Invalid Receipt Signature.</Alert>:
                        <Button size="lg" className="float-right" onClick={verifySignature}>Verify Signature</Button> 
                    )
                ) :
                <Spinner className="float-right" animation="border" variant="dark" size="lg" />
            }
             
        </div>
    );
}

export default ReceiptSignature;