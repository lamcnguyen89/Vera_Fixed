import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, Jumbotron, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap'
import { ButtonGroup, Modal } from "react-bootstrap"
import { BrowserView, MobileView } from 'react-device-detect'
import { useHistory } from 'react-router'
// import { useParams } from 'react-router-dom'
// import '../styles/dashboard.css'
import '../styles/App.css'

// css
import '../styles/dashboard.css'
import ConsentDoc from '../components/Session/Consent'
const emailIcon = <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 64 64" aria-labelledby="title"
  aria-describedby="desc" role="img" >
  <path data-name="layer2"
    fill="none" stroke="#202020" strokeMiterlimit="10" strokeWidth="2" d="M62 16H23.6L16 48h38.4L62 16z"
    strokeLinejoin="round" strokeLinecap="round"></path>
  <path data-name="layer2" fill="none" stroke="#202020" strokeMiterlimit="10"
    strokeWidth="2" d="M23.6 16l14.9 22L62 16M16 48l19.2-14.8M54.4 48L42.9 33.8"
    strokeLinejoin="round" strokeLinecap="round"></path>
  <path data-name="layer1" fill="none" stroke="#202020" strokeMiterlimit="10"
    strokeWidth="2" d="M2 24h11.9M2 32h10M2 40h8" strokeLinejoin="round"
    strokeLinecap="round"></path>
</svg>

var intervalId = { id: undefined }

// interfaces
const StudyHome = ({match}) => {
  let [availableSessions, setAvailableSessions] = useState([])
  useEffect(() => {
    fetch(`/api/study/${match.params.projectId}`, {
      method: 'GET',
    })
      .then(async (res) => {
        let js = await res.json()
        console.log(js)
        setAvailableSessions(js.sessions)
      })
  }, [])
  let [verifyEmail, setVerifyEmail] = useState("")
  let [email, setEmail] = useState("")
  let [consentStep, setConsentStep] = useState(0)
  let [emailVerificationShow, setEmailVerificationShow] = useState(false)
  let [playerId, setPlayerId] = useState()
  let [confirmSent, setConfirmSent] = useState(false)
  let [emailConfirmed, setEmailConfirmed] = useState(false)
  const [error, setError] = useState("")
  let participantEmailRef = useRef(null)
  let handleSubmit = (event) => {
    event.preventDefault()
    let dates = []
    const data = new FormData(event.target)
    for (var i = 0; i < availableSessions.length; i++) {
      let datet = data.get('datetime' + i)
      if (datet !== null) {
        console.log(datet)
        dates.push(datet)
      }
    }
    let fields = ['major', 'ethnicRacialAffiliation', 'nativeLanguage', 'languagePreference', 'genderAffiliation', 'prevExperience', 'intro', 'email']
    let missing = []
    for (var field of fields) {
      if (data.get(field) === null || data.get(field) === "")
        missing.push(field)
    }
    if (missing.length > 0) {
      setError("Error: Please complete all fields. Missing: " + missing.join(", "))
      return
    }
    if (dates.length == 0) {
      dates.push(availableSessions[0])
      // setError("Error: You must select at least one day for availability")
      // return
    }
    // if (!emailConfirmed) {
    //   setError("Error: You must verify your email before enrolling")
    //   return
    // }
    const dataDelivery = {
      major: data.get('major'),
      // sonaIdentifier: data.get('sonaIdentifier'),
      ethnicRacialAffiliation: data.get('ethnicRacialAffiliation'),
      nativeLanguage: data.get('nativeLanguage'),
      languagePreference: data.get('languagePreference'),
      genderAffiliation: data.get('genderAffiliation'),
      prevExperience: data.get('prevExperience'),
      intro: data.get('intro'),
      email: data.get('email'),
      // cell: data.get('cell'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dates,
      player: playerId
    }
    fetch(`/api/enrollPlayer/${match.params.projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        dataDelivery, // Use your own property name / key
      ),
    })
      .then(async (res) => {
        let js = await res.json()

        if (js.playerId == null) {
          setError("Already enrolled")
        } else {
          setError("")
        }
        setConsentStep(2)
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

          <Button color="primary" onClick={() => { setConsentStep(1) }} style={{ marginLeft: "auto", marginRight: "auto" }}>Accept and Continue</Button>
        </div>
      </Jumbotron>)
      // setStep(0)
      break
    case 1:
      Step = (<><Container>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="major">Bachelors:</Label>
            <Input name="major" id="major" />
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
            <Label>Please select the times you are available. Note you must attend the entire time listed if you are matched, and will need to confirm participation one hour prior.</Label>
            {availableSessions.map((item, i) => (
              <Row key={i} form style={{ textAlign: "center" }}>
                <Label for={`datetime${i}`} >
                  {new Date(item).toLocaleString()}
                </Label>
                <Input type="checkbox" name={`datetime${i}`} id={`datetime${i}`} checked value={item} />
              </Row>
            ))}

            <FormGroup>
              <Label for="participantEmail">Email: (Required for confirmation)</Label>
              <Input type="email" name="email" id="participantEmail" ref={participantEmailRef} value={email} onChange={(evt) => setEmail(evt.target.value)} placeholder="username@email.com" />
              {/* {!emailConfirmed ? <Button onClick={() => {
                console.log(email)
                fetch(`/api/sendConfirmEmail?email=${email}`, {
                  method: 'PUT',
                })
                  .then(async (res) => {
                    let js = await res.json()
                    setPlayerId(js.uid)
                    setVerifyEmail(js.verify_email)
                    setConfirmSent(true)
                    intervalId.id = setInterval(() => {
                      fetch(`/api/verifyEmail/${js.verify_email}`, {
                        method: 'GET',
                      })
                        .then(async (res) => {
                          console.log(res)
                          if (res.status === 200) {
                            setEmailVerificationShow(false)
                            setConfirmSent(false)
                            setEmailConfirmed(true)
                            clearInterval(intervalId.id)
                          }
                        })
                    }, 5000)
                  })
              }}>Confirm Email (Optional)</Button> : <span>Email confirmed!</span>} */}
            </FormGroup>
            {/* <FormGroup>
              <Label for="participantCell">Cell: (For reminders)</Label>
              <Input name="cell" id="participantCell" placeholder="(555) 343-3122" />
            </FormGroup> */}
            <Button color="primary" type="submit" >Apply</Button>
            {error !== "" ? <p>Error! {error}</p> : undefined}
          </FormGroup>
        </Form>
      </Container>
        <Modal show={confirmSent} onHide={() => setConfirmSent(false)}>
          <Modal.Body>
            <Jumbotron>
              <h2>Email Verification</h2>
              <p><span aria-hidden="true" className="fa fa-envelope fa-2x"></span></p>
              <p>Before continuing to the application, please check your inbox for a verification email. Sometimes it takes a few minutes.
                Maybe it's in your spam filter? You can change your email below if you believe it was entered wrong.</p>
              <Input type="text" id="email" name="email" className="form-control" placeholder="j******@lucidbard.com" value={email} onChange={evt => setEmail(evt.target.value)} />
              <Button id="reverify" name="reverify" onClick={() => {
                // console.log(email)
                fetch(`/api/sendConfirmEmail?email=${email}&uid=${playerId}`, {
                  method: 'PUT',
                })
                  .then(async (res) => {
                    let js = await res.json()
                    setPlayerId(js.uid)
                    setVerifyEmail(js.verify_email)
                    setConfirmSent(true)
                  })

              }
              }><span><span>{emailIcon}</span>
                  &nbsp; Resend Verification</span></Button>
            </Jumbotron>
          </Modal.Body>
        </Modal></>)

      // setStep("1")
      break
    case 2:
      Step = (<><p>Thank you for applying!</p>
        {error != "" ? <p>Your email was already enrolled.</p>
          : <p>You will hear back soon with a specific time if you are selected for the study</p>}
      </>)
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
