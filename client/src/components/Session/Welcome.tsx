import React from 'react'
import { Button, Container, Jumbotron } from 'reactstrap'

export default function ({ timeRemaining, sessionStart, canCheckIn, checkIn, checkInStatus }) {
  console.log(checkInStatus)
  console.log((new Date(sessionStart).valueOf() - new Date().valueOf()) > 20 * 60 * 1000)
  return (<Container fluid="md" className="container-fluid" >
    {
    // (new Date(sessionStart).valueOf() - new Date().valueOf()) > 20 * 60 * 1000 && checkInStatus !== "Checked In!" || (new Date(sessionStart).valueOf() - new Date().valueOf()) < 20 * 60 * 1000 && checkInStatus === "Checked In!" ?
        <Jumbotron>
          <h3 className="display-3">Welcome!</h3>
          <hr className="my-2" />
          <h3>Your session is at {new Date(sessionStart).toLocaleString()}</h3>
          <hr className="my-2" />
        <p>Welcome to the study, <em>Imagining the Other in IDN Design Education</em></p>
        <p>If you need to review the video, you can find it here: <a href="https://www.youtube.com/watch?v=iKFZhIHD7Xk&feature=emb_title" target="_blank">Twine Video</a>
          <a href="http://www.adamhammond.com/wp-content/uploads/2017/03/1_gettingstarted_twineguide2-1_hammond.pdf" target="_blank">Twine Cheat Sheet</a></p>

          <p>Here’s what we’ll ask you to do in this 2 hour workshop.</p>
          <ol>
            <li>Design an IDN (15 minutes).</li>
            <li>Play and share your thoughts/feelings with a peer’s IDN design. They will share their thoughts/feelings about your design. (15 minutes)</li>
            <li>Check your peer’s player experience reflection about your design.</li>
            <li>Continue creating your IDN. (15 minutes for steps 4 and 5)</li>
            <li>Repeat steps 2 – 5. (15 minutes each time)</li>
            <li>(On your own after): Complete a final reflection survey.</li>
            <li>Download your Certificate of Completion!</li>
          </ol>

          <p>If you run into any technical issues or trouble during the study, first try reloading the page. Next, you can reach out to one of the researchers via email (sherlock [at] mrl.ai</p>
          <p>Make sure you are on a laptop or desktop and not a smartphone. The first step is a brief video and will start on this page automatically.</p>
          <Container><h2>It will begin in {timeRemaining} </h2>
            {canCheckIn && checkInStatus !== "Checked In!" ? <Button onClick={() => checkIn()}>Check In Now</Button> : undefined}
            <h3>Check In Status: {checkInStatus}</h3>
          </Container>
        </Jumbotron>
        // : <Jumbotron><h2>You have not checked in on time and have been withdrawn. If you wish to be rescheduled, please contact us at sherlock@mrl.ai.</h2></Jumbotron>
    }
  </Container>)
}