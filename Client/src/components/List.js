import { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { Col, Row, Button, SplitButton, Dropdown, Table, Spinner, Badge } from "react-bootstrap";
import { Unlock, Check2, DashLg } from 'react-bootstrap-icons';

import server from "../api/axios";
import { linkify } from "../api/Web3Storage";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const List = ({ type }) => {

  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  const receivedList = type == "Received";
  const sentList = type == "Sent";

  useEffect(() => {

    setStatus("loading");

    server("GET", `/files/${type.toLowerCase()}`, token, "")
      
      .then((result) => {

        const { files } = result.data;

        setFiles(files);
        
        setStatus("");
      })
      .catch((error) => {
        setStatus("error");
      });
  }, []);

  return (
      <>
          <Row>
            <Col>
              <h1>{type} Files</h1><br/>
            </Col>
            <Col>
              <SplitButton
                variant="primary"
                title={`${type} Files`}
                className="float-right"
                onSelect={(e) => { window.location.href = e; }}
                onClick={() => { window.location.reload(); }}
              >
                <Dropdown.Item eventKey="/sent-files">Sent Files</Dropdown.Item>
                <Dropdown.Item eventKey="/received-files">Received Files</Dropdown.Item>
              </SplitButton>
            </Col>
          </Row>

          <Table striped bordered hover>
                <thead>
                    <tr className="text-center">
                    <th>No</th>
                    <th>Name</th>
                    {receivedList ? <th>From</th> : ""}
                    {sentList ? <th>To</th> : ""}
                    <th>CID</th>
                    {!sentList ? <th>Decrypt</th> : ""}
                    {sentList ? <th>Receipt Signature</th> : ""}
                    </tr>
                </thead>
                <tbody className="text-center">
                    { files.map(({fileName, fileType, cid, from, to, chunkCount, receiptSignature}, index) => ( 
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{fileName}</td>
                        {receivedList ? <td>{from}</td> : ""}
                        {sentList ? <td>{to}</td> : ""}
                        <td><a href={linkify(cid)} target="blank">{cid}</a></td>
                        {!sentList ? <td>
                          <Button size="sm" href={`/file/${fileName}/${fileType.split("/").join("-")}/${cid}/${from}/${to}/${chunkCount}`}>
                            <Unlock size={20} color="white" />
                          </Button></td> : "" 
                        }
                        {sentList ? <td>{ receiptSignature.length ? 
                          <><Check2 size={40} color="green" />{" "}
                          <Badge variant="primary" onClick={() => window.location.href=`/receipt-signature/${cid}`}>. . .</Badge></> : 
                          <DashLg size={40} color="gray"/> 
                        }</td> : ""}
                      </tr> 
                    ))}
                    { ( status == "loading" ) ? 
                        <tr><td colSpan={5}><Spinner animation="border" variant="dark" size="lg" /></td></tr> :
                        ( files.length ? 
                            ( status == "error" ? <tr><td colSpan={5}><i>The files could not be retrieved.</i></td></tr> : <></>) :
                            <tr><td colSpan={5}><i>There is no {type.toLowerCase()} file to show.</i></td></tr>
                        )
                    }
                </tbody>
          </Table>
      </>
    );
}

export default List;