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
import Study from '../components/Study'
import { Item } from 'react-bootstrap/lib/Breadcrumb'
import StoryTimeline from '../components/Session/StoryTimeline'

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { persistedState } from "../index"
let playerInfo: { consented: boolean, checkedIn: Date, sessionStart?: number, currentStory: any, bio: string, info: string, uid: string } = {
  consented: false,
  checkedIn: new Date(0),
  sessionStart: undefined,
  currentStory: {},
  bio: "",
  info: "",
  uid: ""
}
let cStep = 0
let mutex = false
let partnerInfo: { consented: boolean, checkedIn: Date, sessionStart?: number, currentStory: any, bio: string, info: string, uid: string, comments: any[] } = {
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
  localStorage.setItem("twine-prefs-a812d7f5-fbcd-47b6-b526-f0b481c306da", "{\"id\": \"a812d7f5-fbcd-47b6-b526-f0b481c306da\", \"name\": \"welcomeSeen\", \"value\": true}")
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
  <div><p>Now that you’ve completed the Twine video, begin to design your own IDN.
    Take 2 or 3 minutes to come up with a story idea. Do any of these spark your ideas?</p>
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
  <div><p>Play through your peer’s IDN. Tell the peer designer what you are thinking and feeling as you play. These “player reflections” will appear in the column to the right. Your partner will see the name of the passage you are on above your comments.)</p></div>,
  <div><p>Read your player’s reflections  and think about the next steps of your IDN design.</p></div>,
  <div>Now, it’s time for another round of sharing your player experience, hearing your peer’s experience, and continuing your design.</div>,
  undefined,
  undefined,
  <div>Congratulations on having created your first Interactive Digital Narrative!</div>
]
// The offset from the session start that is shown in the countdown.
const segmentOffsets = [
  0, // Step 0 offset (in minutes). Waiting Room
  15, // Step 1 (Twine Video)
  30, // Step 2 (Authoring 1)
  45, // Step 3 (Playing 1)
  60, // Step 4 (Authoring 2)
  75, // Step 5 (Playing 2)
  90, // Step 6 (Authoring 3)
  105, // Step 7 (Playing 3)
  120, // Step 8 (Authoring 4)
  160, // Step 9 (Survey?)
]
// const segmentOffsets=[
//   0, // Step 0 offset (in minutes). Waiting Room
//   15, // Step 1 (Twine Video)
//   30, // Step 2 (Authoring 1)
//   45, // Step 3 (Playing 1)
//   60, // Step 4 (Authoring 2)
//   75, // Step 5 (Playing 2)
//   90, // Step 6 (Authoring 3)
//   105, // Step 7 (Playing 3)
//   120, // Step 8 (Authoring 4)
//   160, // Step 9 (Survey?)
// ]
// Use throughout your app instead of plain `useDispatch` and `useSelector`
type AppDispatch = typeof persistedState.store.dispatch
type RootState = ReturnType<typeof persistedState.store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// interfaces
const Session = ({ location, match }) => {
  const auth = useAppSelector((state: any) => state.auth)

  function sendLog(log) {
    fetch(`/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.token
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
  let [storyKey, setStoryKey] = useState(0)
  let [comments, setComments] = useState([])
  let [partnerComments, setPartnerComments] = useState([])
  let pushComment = (comment) => {
    sendLog({ content: comment.content, passageTitle: contextInfo.currentPassage, ts: new Date(), eventId: LogTypes.Comment })
    setComments((oldState) => [...oldState, comment])
  }
  const history = useHistory()
  const [timeRemaining, setTimeRemaining] = useState("")
  const [waiting, setWaiting] = useState(true)
  const [step, setStep] = useState(getQueryStringValue("step") || -1)
  const [debug, setDebug] = useState(true)
  const [contextInfo, setContextInfo] = useState({ currentPassage: "" })
  function saveStory() {
    // let pInfo = {...playerInfo}
    let curStory = playerInfo.currentStory
    // Get all substories
    let twineStories = localStorage.getItem('twine-stories').split(",")
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
        let js = await res.json()
        js.currentStory = JSON.parse(js.currentStory)
        // console.log("Setting player info to",{...js})
        playerInfo = js
        if (timeRemainingTimer !== undefined) {
          clearInterval(timeRemainingTimer)
        }
        injectStory(js.currentStory)
        console.log("Setting wait to false")
        setWaiting(false)
        mutex = false
        fetch(`/api/partnerComments/${match.params.participantId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(async (res) => {
            mutex = false
            let js = (await res.json()).filter(evt => evt.eventId === LogTypes.Comment)
            setPartnerComments(js)
            setWaiting(false)
          })
        // onTick()
      })
  }, [])

  let nextStep = () => setStep((prevStep) => prevStep + 1)
  let Step = undefined
  // let playerInfo.storyId = "d6cd2093-8aee-4fad-a279-4f37ae5dd10f"
  const route = `/#!/stories`
  let iFrameHeight = debug ? "calc( 100vh - 125px)" : "100vh"
  // console.log("Rendering step "+step+", consent"+consent)
  Step = (<>{
    waiting ?
      <Jumbotron style={{ flex: "1 1 auto", height: iFrameHeight }}>Loading, please wait...<Spinner animation="border" /></Jumbotron> :
      <><iframe style={{ flex: "1 1 auto", height: iFrameHeight }}
        src={`/twine/${route}/${playerInfo.currentStory.info.id}`}
        key={storyKey}
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

  return (<><div style={{ display: "flex", width: "100vw" }}>{Step}</div>
    {debug ? <StoryTimeline playerInfo={playerInfo} playerId={match.params.participantId} step={step} history={history} refreshStory={() => setStoryKey(prev => prev + 1)}></StoryTimeline> : undefined}
  </>)
}

export default Session
