import React, { useEffect, useState } from 'react'
import { Container, Jumbotron, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap'
import { BrowserView, MobileView } from 'react-device-detect'
let style = {
  p: {
    marginTop: "0in",
    marginRight: ".5in",
    marginLeft: ".5in",
    // marginBottom:"8.0pt",
    marginBottom: ".55pt",
    // lineHeight:"107%",
    // fontSize:"11.0pt",
    fontSize: "12.0pt",
    fontFamily: "Calibri,sans-serif",
    color: "black",
    lineHeight: "103%"
  }
  , li: {
    marginRight: ".5in",
    marginLeft: ".5in",
    marginBottom: ".55pt",
    lineHeight: "103%",
    fontSize: "12.0pt",
    fontGamily: "Cambria,serif"
  }
}
let surveyText = [
  { text: "Was the Platform easy to use? ", type: "q" },
  { text: "Do you have any suggestions for improving the Platform?  If so, please explain.", type: "q" },
  { text: "Were all the instructions easy to understand? ", type: "q" },
  { text: "Please answer these next questions from your experience as an IDN designer. ", type: "s" },
  { text: "1.	What did you learn from your experience as an IDN designer?", type: "q" },
  { text: "2.	Did comments from the player surprise you in any way? If so, how were those comments surprising?", type: "q" },
  { text: "3.	Did the comments from the player inform you in any way? If so, how are those comments informative?", type: "q" },
  { text: "4.	How would you suggest improving this IDN design process in future research and education?", type: "q" },
  { text: "5.	Is there anything else you would like to comment on about the design process? Please explain.", type: "q" },
  { text: "Please answer these next questions from your experience as an IDN player. ", type: "s" },
  { text: "1.	What did you learn from the IDN player process?", type: "q" },
  { text: "2.	Did your experience as a player of a peer’s IDN surprise you in any way? If so, how was the player experience surprising?", type: "q" },
  { text: "3.	Did your experience as a player of a peer’s IDN inform you in any way? If so, how was the player experience informative?", type: "q" },
  { text: "4.	How would you suggest improving the IDN play process in future research and education?", type: "q" },
  { text: "5.	Is there anything else you would like to comment on about the IDN player experience process?", type: "q" },
]
export default function ExitDoc({ setStep, playerId }) {
  let handleSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    const dataDelivery = { uid: playerId, ts: new Date(Date.now()) }
    for (var i = 1; i <= 14; i++) {
      let datet = data.get('q' + i)
      if (datet !== null && surveyText[i].type == "q") {
        dataDelivery['q' + i] = data.get("q" + i)
      }
    }
    fetch(`/api/Exit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        dataDelivery, // Use your own property name / key
      ),
    })
      .then((res) => {
        setStep(10)
      })
      // .then((result) => setData(result.rows))
      .catch((err) => console.error('error: ' + err))
  }
  console.log("Rendering...")
  let Step = (<Container>
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        {surveyText.map((item, i) =>
          item.type == "q" ?
            <div key={i}>
              <Label for={"q" + i}>{item.text}</Label>
              <Input name={"q" + i} type="textarea" id={"q" + i} /></div> :
            <Label key={i}>{item.text}</Label>
        )
        }
        <Button color="primary" type="submit" >Submit</Button>
      </FormGroup>
    </Form>
  </Container>)
  // setStep("1")
  return (
    <Container fluid className="container-fluid">
      <Container>
        {Step}
      </Container>
    </Container>
  )
}
