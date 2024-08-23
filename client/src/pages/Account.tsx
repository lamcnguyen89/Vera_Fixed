import React from 'react'
import { Card, CardBody, CardTitle, Container, Row, Col, Button } from 'reactstrap'
import '../styles/settings.css'
import { useSelector, useDispatch } from 'react-redux'
import constants from '../constants/constants'
import NavMenu from '../components/NavMenu'
import '../styles/App.css'

const Account = () => {
  const { connected } = useSelector((state: any) => state.vimeo)
  const auth = useSelector((state: any) => state.auth)

  const dispatch = useDispatch()
  // const vimeoClient = useSelector((state: any) => state.vimeo.client)

  // TODO: WE HAVE TO UPDATE OUR TOKENS TO USE SHERLOCKS STUFF NOW!
  const href = `https://api.vimeo.com/oauth/authorize?response_type=code&client_id=${constants.ClientIdentifier}&redirect_uri=${constants.localVimeoRedirectUri}&scope=public private upload edit`
  console.log(auth)
  const token = auth.token.split(" ")[1];
  const clipboard = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
  </svg>

  return (
    <Container fluid={true} className="container-fluid">
      <NavMenu title="Account Settings"/>
      <Container >

        <div id="settings-prjName" className="text-center">
          <h3>Account Settings</h3>
        </div>

        <Row>
          <Col>
            <Row>
              <Card style={{ border: '2px solid black' }}>
                <CardBody>
                  <CardTitle className="text-center" style={{ fontSize: '1.5rem' }}>
                                        API Key
                  </CardTitle>
                  {token}
                  <Button variant="outline-info" style={{ paddingTop: "1px", paddingBottom: "1px", whiteSpace: "nowrap" }} onClick={() => {
                    // href={`/study/1/${value}/session`}
                    navigator.clipboard.writeText(token)
                    // document.body.removeChild(input)
                  }} > {clipboard}</Button>
                </CardBody>
              </Card>
            </Row>
            <Row>
              <Card style={{ border: '2px solid black' }}>
                <CardBody>
                  <CardTitle className="text-center" style={{ fontSize: '1.5rem' }}>
                                        Vimeo Account Connection
                  </CardTitle>
                                    Status: {connected ? 'Connected' : 'Not Connected'}
                  <br/>
                  {connected
                    ? <Button variant="primary" onClick={() => dispatch({ type: 'CLEAR_VIMEO_CONNECTION' })}>Disconnect</Button>
                    : <a href={href}><Button variant="primary">Connect Vimeo</Button></a>
                  }
                </CardBody>
              </Card>
            </Row>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}

Account.displayName = 'Account'
export default Account
