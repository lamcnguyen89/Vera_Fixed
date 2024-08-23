import React, { useCallback, useEffect, useState } from 'react'
import { Container, Jumbotron, Button, Spinner } from 'reactstrap'
import { useHistory } from 'react-router'
// import { useParams } from 'react-router-dom'
// import '../styles/dashboard.css'
import '../styles/App.css'

// css
import '../styles/dashboard.css'
import CommentPanel from '../components/Session/Comments'
import Welcome from '../components/Session/Welcome'
import Debug from '../components/Session/Debug'
import Exit from '../components/Session/Exit'

let playerInfo: {
  consented: boolean, checkedIn: Date,
  sessionStart?: Date, currentStory: any,
  bio: string, state: string, availability: [],
  info: string, uid: string
} = {
  consented: false,
  checkedIn: new Date(0),
  sessionStart: undefined,
  state: "",
  availability: [],
  currentStory: {},
  bio: "",
  info: "",
  uid: ""
}
let cStep = 0
let mutex = false
let partnerInfo: {
  consented: boolean, checkedIn: Date,
  sessionStart?: Date, currentStory: any,
  bio: string, info: string, uid: string,
  comments: any[]
} = {
  sessionStart: undefined,
  checkedIn: new Date(0),
  consented: false,
  currentStory: {},
  bio: "",
  info: "",
  uid: "",
  comments: []
}
const BioPanel = ({ partnerInfo }) => (<>
  <hr />
  {partnerInfo.bio}
  <hr />
</>)
function clearPlayerCache() {
  // let pInfo = {...playerInfo}
  // let curStory = playerInfo.currentStory
  // Get all substories
  sessionStorage.clear()
  localStorage.setItem("twine-prefs", "a812d7f5-fbcd-47b6-b526-f0b481c306da")
  localStorage.setItem("twine-prefs-a812d7f5-fbcd-47b6-b526-f0b481c306da",
    "{\"id\": \"a812d7f5-fbcd-47b6-b526-f0b481c306da\", \"name\": \"welcomeSeen\", \"value\": true}")
  // localStorage.clear()    
}

enum LogTypes {
  Navigate,
  Comment,
  CloseEditor,
  StoryUpdate,
  ChangePassage,
}
let timeRemainingTimer = undefined
const minutes = 60 * 1000
const instructions = [
  undefined,
  undefined,
  <div><p>Now that you’ve completed the Twine video, begin to design your own IDN.</p>
    <p>If you need to review the video, you can find it here: <a href="https://www.youtube.com/watch?v=iKFZhIHD7Xk&feature=emb_title" target="_blank">Twine Video</a>
      <a href="http://www.adamhammond.com/wp-content/uploads/2017/03/1_gettingstarted_twineguide2-1_hammond.pdf" target="_blank">Twine Cheat Sheet</a></p>
    <p>Take 2 or 3 minutes to come up with a story idea. Do any of these spark your ideas?</p>
    <ul>
      <li>
        … murder mystery</li>
      <li>
        … travel adventure, where the character gets lost
      </li>
      <li>
        … escape from a danger
      </li>
      <li>… something strange or puzzling you saw in life or another interesting idea…
      </li>
    </ul>
    <p>
      Now that you have an idea for your story, take a little time to jot notes or to think about your story. Let your imagination take you where it will.
    </p>
    <p>
      Remember, this will be an interactive story that a player will act on alternate paths you offer.
    </p>
  </div>,
  <div><p>Play through your peer’s IDN.Tell the peer designer what you are thinking and feeling as you play. These “player reflections” will appear in the column to the right. Your partner will see the name of the passage you are on above your comments.)</p></div>,
  <div><p>Read your player’s reflections  and think about the next steps of your IDN design.</p></div>,
  <div>Now, it’s time for another round of sharing your share your thoughts and feelings to your partner about their IDN so far, hearing your peer’s experience, and continuing your design. </div>,
  <div><p>As before, make revisions based on the feedback.</p></div>,
  <div><p>This is the last chance to provide feedback on your partner's work.</p></div>,
  <div><p>This is your last chance to revise your work.</p></div>,
  <div>Congratulations on having created your first Interactive Digital Narrative!</div>
]
// The offset from the session start that is shown in the countdown.
// const segmentOffsetsReal = [
//   0, // Step 0 offset (in minutes). Waiting Room
//   15, // Step 1 (Twine Video)
//   30, // Step 2 (Authoring 1)
//   45, // Step 3 (Playing 1)
//   60, // Step 4 (Authoring 2)
//   75, // Step 5 (Playing 2)
//   90, // Step 6 (Authoring 3)
//   105, // Step 7 (Playing 3)
//   120, // Step 8 (Authoring 4)
//   200, // Step 9 (Survey?)
// ]
const segmentOffsetsReal = [
  0, // Step 0 offset (in minutes). Waiting Room
  0, // Step 1 (Twine Video)
  15, // Step 2 (Authoring 1)
  30, // Step 3 (Playing 1)
  45, // Step 4 (Authoring 2)
  60, // Step 5 (Playing 2)
  75, // Step 6 (Authoring 3)
  90, // Step 7 (Playing 3)
  105, // Step 8 (Authoring 4)
  20000, // Step 9 (Survey?)
]
const segmentOffsets = segmentOffsetsReal
// interfaces
const Session = ({ location, match }) => {
  function sendLog(log) {
    fetch(`/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          ts: Date.now(),
          player: match.params.participantId,
          ...log
        }, // Use your own property name / key
      ),
    })
      .catch((err) => console.log(err))

  }
  function getQueryStringValue(property) {
    if (location.search !== "") {
      let value = new URLSearchParams(location.search)
      return parseInt(value.get(property))
    }
    return false
  }
  let [consent, setConsent] = useState(false)
  let [comments, setComments] = useState([])
  let [partnerComments, setPartnerComments] = useState([])
  let pushComment = (comment) => {
    sendLog({ content: comment.content, passageTitle: contextInfo.currentPassage, ts: new Date(), eventId: LogTypes.Comment })
    setComments((oldState) => [...oldState, comment])
  }
  const history = useHistory()
  const [timeRemaining, setTimeRemaining] = useState("")
  const [waiting, setWaiting] = useState(true)
  const [checkInStatus, setCheckInStatus] = useState("Not checked in. You can check in 1 hour before the start of the study")
  const [step, setStep] = useState(getQueryStringValue("step") || -1)
  const [debug, setDebug] = useState(getQueryStringValue("debug") == 1 || false)
  const [contextInfo, setContextInfo] = useState({ currentPassage: "" })
  function saveStory() {
    // let pInfo = {...playerInfo}
    let curStory = playerInfo.currentStory
    // Get all substories
    // let twineStories = localStorage.getItem('twine-stories').split(",")
    let twineStory = localStorage.getItem(`twine-stories-${curStory.info.id}`)
    curStory.info = JSON.parse(twineStory)
    console.log(curStory.info)
    let passageNames = localStorage.getItem('twine-passages').split(",")
    let passages = []
    for (var psgId of passageNames) {
      console.log(localStorage.getItem('twine-passages-' + psgId))
      let passageCandidate = JSON.parse(localStorage.getItem('twine-passages-' + psgId))
      console.log(passageCandidate)
      if (passageCandidate !== null && passageCandidate.story == curStory.info.id) {
        passages.push(passageCandidate)
      }
    }
    curStory.passages = passages
    console.log(curStory)
    let logMsg = { content: JSON.stringify(curStory), eventId: LogTypes.StoryUpdate }
    // setPlayerInfo(pInfo)
    sendLog({ content: JSON.stringify(curStory), eventId: LogTypes.StoryUpdate })
  }
  function injectStory(story) {
    let prevStories = localStorage.getItem('twine-stories')
    let curStories = prevStories !== null ? new Set<String>(prevStories.split(',')) : new Set<String>()
    curStories.add(story.info.id)
    localStorage.setItem('twine-stories', [...curStories].join(","))
    localStorage.setItem(`twine-stories-${story.info.id}`, JSON.stringify(story.info))
    let prevPassages = localStorage.getItem('twine-passages')
    let curPassages = prevPassages !== null ? new Set<String>(prevPassages.split(',')) : new Set([])
    // console.log(story.passages)
    story.passages.forEach(psg => curPassages.add(psg.id))
    localStorage.setItem('twine-passages', [...curPassages].join(","))
    for (let psg of story.passages) {
      localStorage.setItem(`twine-passages-${psg.id}`, JSON.stringify(psg))
    }
  }
  // const myo = {
  //     x: "a",
  //     y: "b",
  //     z: "c"
  // }

  // let {x, ...somethingelse} = myo

  // useSelector is the replacement for connect() and mapStateToProps().
  // it takes a function which is passed the whole redux state, and returns just the sub-section
  // of it that you want to pay attention to. only changes in that section of redux state will trigger
  // rerenders. https://react-redux.js.org/next/api/hooks#useselector
  // const projects = useSelector((state:any) => state.project.arr)
  // const auth = useSelector((state: any) => state.auth)

  // const history = useHistory()

  // this replaces both componentDidMount and componentWillUnmount. when react pushes this component to the browser's painting
  // engine, it calls all the functions passed to any useEffect call. the function you pass does work at this point, and the function
  // you might want to return from that passed function will be stored by react and automaticallly called on unmount. this is SO AWESOME
  // for pub/sub models, but /we/ prob won't need to return anything from the functions we pass to useEffect.
  // note the [] as the second argument to useEffect. this is the dependancy array. on first render, the function you passed to useEffect
  // (called an `effect`) will always be called, but after that, further re-renders only result in you effect being called if one of the
  // variables you list in the dependancy array changes. this might feel like "the other side" of useState cuz it is.
  // https://reactjs.org/docs/hooks-reference.html#useeffect

  const onTick = useCallback(() => {
    // console.log("tick " + new Date(Date.now()).toLocaleTimeString())
    if (playerInfo.sessionStart === undefined)
      return
    // console.log("Now: " + Date.now().valueOf())
    // console.log("Now: " + new Date(Date.now()).toUTCString())
    // console.log("Session start: " + new Date(playerInfo.sessionStart).valueOf())
    let elapsed = Date.now() - new Date(playerInfo.sessionStart).valueOf()
    // console.log(elapsed)
    let times = segmentOffsets.map(offset => offset * minutes)
    let curStep = 0

    for (let i = 0; i < times.length; i++) {
      // console.log("compare" + elapsed>times[i])
      // console.log("elapsed:"+elapsed + ","+times[i])
      if (elapsed > times[i]) {
        curStep = i + 1
        // console.log("elapsed:"+elapsed + ","+times[i])
        continue
      } else {
        let hours_remaining = (Math.floor((times[i] - elapsed) / (1000 * 60 * 60))).toString()
        let minutes_remaining = (Math.floor((times[i] - elapsed) / (1000 * 60)) % 60).toString()
        let seconds_remaining = (Math.floor((times[i] - elapsed) / (1000)) % 60).toString()
        setTimeRemaining(`${hours_remaining.padStart(2, "0")}:${minutes_remaining.padStart(2, "0")}:${seconds_remaining.padStart(2, "0")}`)
        break
      }
    }
    // console.log(`curStep: ${curStep}, cStep: ${cStep}, cStep !== 3 && partnerInfo.currentStory.info ${(cStep !== 3 && partnerInfo.currentStory.info !== undefined || partnerInfo.consented == false)}`)
    if (curStep == cStep && ((cStep >= 3 && partnerInfo.currentStory.info !== undefined || partnerInfo.consented == false) || mutex)) {
      return
    }
    if (curStep == 3 || curStep == 4 || curStep == 5 || curStep == 6 || curStep == 7 || curStep == 8) {
      console.log("Getting partner details...")
      mutex = true
      fetch(`/api/partner/` + match.params.participantId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (res) => {
          if (res.status == 301) {
            setStep(0)
            setWaiting(false)
          } else {
            mutex = false
            let js = await res.json()
            cStep = curStep
            if (curStep == 3 || curStep == 5 || curStep == 7) {
              js.currentStory = JSON.parse(js.currentStory)
              // console.log(js.currentStory)
              injectStory(js.currentStory)
            }
            partnerInfo = js
            if (curStep == 3) {
              cStep = curStep
              sendLog({ eventId: LogTypes.Navigate, content: cStep })
              setStep(curStep)
              setWaiting(false)
              return
            } else {
              mutex = true
              fetch(`/api/partnerComments/` + match.params.participantId, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              }).then(async (res) => {
                clearPlayerCache()
                let js = await res.json()
                mutex = false
                cStep = curStep
                setPartnerComments(js)
                setStep(curStep)
                sendLog({ eventId: LogTypes.Navigate, content: cStep })
                setWaiting(false)
              })
            }
          }
        })
        .catch((err) => console.log(err))
    } else {
      clearPlayerCache()
      cStep = curStep
      sendLog({ eventId: LogTypes.Navigate, content: cStep })
      setStep(curStep)
    }
  }, [])
  useEffect(() => {
    let prefIdsRaw = localStorage.getItem("twine-prefs")
    let prefSet = false
    if (prefIdsRaw !== null) {
      let prefIds = prefIdsRaw.split(",")
      for (let prefId of prefIds) {
        let pref = JSON.parse(localStorage.getItem(`twine-prefs-${prefId}`))
        if (pref.name == "welcomeSeen" && pref.value == false) {
          pref.value = true
          localStorage.setItem(`twine-prefs-${prefId}`, JSON.stringify(pref))
          prefSet = true
        }
      }
    }
    if (!prefSet) {
      localStorage.setItem("twine-prefs", "a812d7f5-fbcd-47b6-b526-f0b481c306da")
      localStorage.setItem("twine-prefs-a812d7f5-fbcd-47b6-b526-f0b481c306da", "{\"id\": \"a812d7f5-fbcd-47b6-b526-f0b481c306da\", \"name\": \"welcomeSeen\", \"value\": true}")
    }

    mutex = true
    console.log("Getting player info...")
    fetch(`/api/players/id/` + match.params.participantId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (res.status !== 200) {
          console.log("Not found")
          setStep(-2)
          return
        }
        let js = await res.json()
        js.currentStory = JSON.parse(js.currentStory)
        // console.log("Setting player info to",{...js})
        playerInfo = js
        setConsent(playerInfo.consented)
        if (timeRemainingTimer !== undefined) {
          clearInterval(timeRemainingTimer)
        }
        timeRemainingTimer = setInterval(onTick, 1000)
        injectStory(js.currentStory)
        if (new Date(playerInfo.checkedIn).valueOf() > (new Date(playerInfo.sessionStart).valueOf() - 60 * 60 * 1000)) {
          setCheckInStatus("Checked In!")
        }
        setWaiting(false)
        mutex = false
        setStep(0)
        // onTick()
      })
  }, [])
  useEffect(() => {
    window.addEventListener("message", async (event) => {
      switch (event.data.eventId) {
        case 2:
          // Send story update
          setTimeout(saveStory, 500)
          break
        case 4:
        case 5:
          // Send story update
          sendLog(event.data)
      }
      if (event.data.passage !== undefined) {
        setContextInfo({ currentPassage: event.data.passage })
      }
      // console.log(event.data)
    }, false)
  }, [])

  let nextStep = () => setStep((prevStep) => prevStep + 1)
  let checkInPlayer = () => {
    console.log("Checking in player...")
    fetch(`/api/checkIn/` + match.params.participantId, {
      method: 'PUT',
    })
      .then(async (res) => {
        if (res.status === 200) {
          playerInfo.checkedIn = new Date()
          setCheckInStatus("Checked In!")
        } else {
          setCheckInStatus(await res.text())
        }
      })
  }
  let Step = undefined
  // let playerInfo.storyId = "d6cd2093-8aee-4fad-a279-4f37ae5dd10f"
  const route = `/twine/#!/stories`
  let iFrameHeight = debug ? "calc( 100vh - 125px)" : "100vh"
  // console.log("Rendering step "+step+", consent"+consent)
  switch (step) {
    case -2:
      console.log("Step -2")
      Step = <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Error, participant not found. Check your email or contact the study administrators.</Jumbotron>
      break
    case -1:
      Step = <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron>
      break
    case 0:
      switch (playerInfo.state) {
        case "withdrawn":
          Step = waiting ? <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> : <Jumbotron><h2>We have received a previous request to withdraw from the study. If this is in error, contact the study team at sherlock [at] mrl.ai.</h2></Jumbotron>
          break
        case "removed":
          Step = waiting ? <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> : <Jumbotron><h2>You have been removed from the study. Possible reasons include failure to check in on time, or a lack of confirmation and available sessions. If this is in error, contact the study team at sherlock [at] mrl.ai.</h2></Jumbotron>
          break
        default:
          Step = waiting ? <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> : <Welcome sessionStart={playerInfo.sessionStart} timeRemaining={timeRemaining} canCheckIn={(new Date(playerInfo.sessionStart).valueOf() - new Date().valueOf()) < 60 * 60 * 1000 && (new Date(playerInfo.sessionStart).valueOf() - new Date().valueOf()) > 20 * 60 * 1000}
            checkInStatus={checkInStatus} checkIn={() => checkInPlayer()}></Welcome>
          break
      }
      break
    case 1:
      Step = <>
        <iframe style={{ flex: "1 1 auto", height: iFrameHeight }}
          src="https://www.youtube-nocookie.com/embed/iKFZhIHD7Xk?controls=0&autoplay=1"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
        </iframe><CommentPanel debug={debug}
          step={step}
          Bio={undefined}
          segmentEnd={timeRemaining}
          comments={partnerComments}
          instructions={instructions[step]}
          segments={segmentOffsets}
          showComments={false}
          nextStep={() => nextStep()}></CommentPanel></>
      break
    case 2:
    case 4:
    case 6:
    case 8:
      Step = (<>{
        waiting ?
          <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> :
          <><iframe style={{ flex: "1 1 auto", height: iFrameHeight }}
            src={`${route}/${playerInfo.currentStory.info.id}`}
            key={step + playerInfo.currentStory.info.id}
            title="Twine authoring" frameBorder="0"></iframe>
            <CommentPanel debug={debug}
              step={step}
              Bio={step == 2 ? undefined : <BioPanel partnerInfo={partnerInfo}></BioPanel>}
              segmentEnd={timeRemaining}
              comments={partnerComments}
              instructions={instructions[step]}
              segments={segmentOffsets}
              showComments={false}
              nextStep={() => nextStep()}></CommentPanel></>}</>
      )
      break
    case 3:
    case 5:
    case 7:
      Step = (<>
        {
          waiting || partnerInfo.currentStory.info == undefined ?
            <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> :
            <><iframe style={{ flex: "1 1 auto", height: iFrameHeight }}
              src={partnerInfo.consented ? `${route}/${partnerInfo.currentStory.info.id}/play` : `${route}/${playerInfo.currentStory.info.id}/play`}
              key={step + partnerInfo.currentStory.info.id}
              title="Twine Experience" frameBorder="0"></iframe>
              <CommentPanel debug={debug} segmentEnd={timeRemaining} showComments={true}
                step={step}
                pushComment={pushComment}
                instructions={instructions[step]}
                comments={comments}
                nextStep={() => nextStep()}></CommentPanel></>}
      </>)
      break
    case 9:
      Step = <Exit playerId={match.params.participantId} setStep={(i) => setStep(i)}></Exit>
      // setFrameSrc(`${route}/${playerInfo.storyId}`)
      break
    case 10:
      Step = <Jumbotron>
        Thank you! Here is your certificate of completion!
        <a href="https://www.dropbox.com/s/41no62pt2e8jdm9/certificateOfCompletion.pdf?dl=0">Download certificate here</a>
      </Jumbotron>
      break
  }

  return (<><div style={{ display: "flex", width: "100vw" }}>{Step}</div>
    {debug ? <Debug playerId={match.params.participantId} step={step} history={history}></Debug> : undefined}
  </>)
}

export default Session
