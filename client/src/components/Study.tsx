import React, { useCallback, useEffect, useState } from 'react'
import { Container, Jumbotron, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap'
import { BrowserView, MobileView } from 'react-device-detect'
import { useHistory } from 'react-router'
// import { useParams } from 'react-router-dom'
// import '../styles/dashboard.css'
import '../styles/App.css'

// css
import '../styles/dashboard.css'
import ConsentDoc from './Session/Consent'

// interfaces
const StudyHome = ({ playerId, setConsent }) => {
  let [consentStep, setConsentStep] = useState(0)
  let sendConsent = useCallback(() => {
    fetch(`/api/players/id/` + playerId, {
      method: 'PUT',
      body: JSON.stringify({ consented: true, consentedDate: new Date() }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        let js = await res.json()
      })
  }, [])

  const [error, setError] = useState("")

  let handleSubmit = (event) => {
    event.preventDefault()
    const data = new FormData(event.target)
    const dataDelivery = {
      ethnicRacialAffiliation: data.get('ethnicRacialAffiliation'),
      nativeLanguage: data.get('nativeLanguage'),
      languagePreference: data.get('languagePreference'),
      genderAffiliation: data.get('genderAffiliation'),
      prevExperience: data.get('prevExperience'),
      intro: data.get('intro'),
      email: data.get('email'),
      dates: [],
      player: playerId
    }
    for (var i = 0; i < 5 * 5; i++) {
      let datet = data.get('datetime' + i)
      if (datet !== null) {
        console.log(datet)
        dataDelivery.dates.push(datet)
      }
    }
    fetch(`/api/Apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        dataDelivery, // Use your own property name / key
      ),
    })
      .then((res) => {
        setConsent(true)
      })
      // .then((result) => setData(result.rows))
      .catch((err) => setError('error: ' + err))
  }
  let day = []
  for (var i = 0; i < 7; i++) {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + i)
    var options = { weekday: 'long' } as const

    day.push(
      {
        time: date, text: `${new Intl.DateTimeFormat('en-US', options).format(date)} ${date.getDate()}/${date.getMonth()}`
      })
  }
  let Step = undefined

  switch (consentStep) {
    case 0:
      Step = (<Jumbotron>
        <h1 className="display-3">Interactive Narrative Study</h1>
        <ConsentDoc />
        <div style={{ textAlign: "center" }}>

          <Button color="primary" onClick={() => { sendConsent(); setConsentStep(1) }} style={{ marginLeft: "auto", marginRight: "auto" }}>Accept and Continue</Button>
        </div>
      </Jumbotron>)
      // setStep(0)
      break
    case 1:
      Step = (<Container>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="ethnicRacialAffiliation">Please state your preferred ethnical/racial affiliation:</Label>
            <Input name="ethnicRacialAffiliation" id="ethnicRacialAffiliation" />
            <Label for="nativeLanguage">What is your native language?</Label>
            <Input name="nativeLanguage" id="nativeLanguage" />
            <Label for="languagePreference">What language do you prefer to speak?</Label>
            <Input name="languagePreference" id="languagePreference" />
            <Label for="genderAffiliation">Please state your preferred gender affiliation</Label>
            <Input name="genderAffiliation" id="genderAffiliation" />
            <FormGroup tag="fieldset">
              <Label>Do you have previous experience with interactive digital narratives (e.g. adventure books, hypertext novels, etc.)?</Label>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="prevExperience" />{' '}
                  I have heard of it, but do not know for sure what it means
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="prevExperience" />{' '}
                  No, I do not think I have experience with it
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="prevExperience" />{' '}
                  Yes, I played a bit with interactive narratives before
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="prevExperience" />{' '}
                  I have a lot of experience with interactive narratives
                </Label>
              </FormGroup>
            </FormGroup>
            <Label for="intro">Please write a short (approximately 50 words) introduction that you would like to share with your peer collaborator in this creative activity</Label>
            <Input name="intro" type="textarea" id="intro" placeholder="Something important to know about me is..." />
            <Label>Please select the times you are available for the next week. Note you will need to attend the entire time listed if you are matched.</Label>
            <Row form style={{ textAlign: "center" }}>
              <Col md={2}>
                Time
              </Col>
              {day.map(day => (
                <Col md={1} key={day.text}>
                  {day.text}
                </Col>
              ))}
            </Row>
            {[{ text: "9:30-12:00a", time: 9 * (60 * 60 * 1000) + 30 * (60 * 1000) },
            { text: "12:00-2:30p", time: 12 * (60 * 60 * 1000) },
            { text: "2:30-5:00p", time: 14 * (60 * 60 * 1000) + 30 * (60 * 1000) },
            { text: "5:00-7:30p", time: 17 * (60 * 60 * 1000) },
            { text: "7:30-10:00p", time: 19 * (60 * 60 * 1000) + 30 * (60 * 1000) }
            ].map((item, i) => (
              <Row form key={item.text} style={{ textAlign: "center" }}>
                <Col md={2}>
                  <Label>
                    {item.text}
                  </Label>
                </Col>
                {day.map((d, di) => (
                  <Col key={d.text} md={1}>
                    <Input type="checkbox" name={`datetime${di * 5 + i} `} value={new Date(item.time + d.time.valueOf()).toISOString()} />
                  </Col>))}
              </Row>))}
            <FormGroup>
              <Label for="participantEmail">Email: (Used for confirmation)</Label>
              <Input type="email" name="email" id="participantEmail" placeholder="username@email.com" />
            </FormGroup>
            <Button color="primary" type="submit" >Apply</Button>
            {error !== "" ? <p>Error! {error}</p> : undefined}
          </FormGroup>
        </Form>
      </Container>)
      // setStep("1")
      break
    case 2:
      Step = (<><p>Thank you for applying!</p>
        <p>You will hear back soon with a specific time if you are selected for the study</p></>)
      // setStep("2")
      break
  }
  return (
    <Container fluid className="container-fluid">
      <Container>
        {Step}
      </Container>
    </Container>
  )
}

export default StudyHome
