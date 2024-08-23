import React, { Component, JSXElementConstructor, KeyboardEventHandler, useEffect, useState } from 'react'
import { JsxExpression } from 'typescript'
import { Tabs, Tab, Button, Accordion } from 'react-bootstrap'

interface ICommentPanelProps {
  showComments?: boolean
  comments?: { _id: string, __v: string, eventId: number, passageTitle: string, content: string, ts: Date, player: string }[]
  segmentEnd: string
  instructions?: JSX.Element
  segments?: number[]
  debug?: boolean
  step: number
  pushComment?: (any) => void
  nextStep: () => void
  Bio?: any
}
interface ICommentProps {
  content: string
  passageTitle: string
  ts: Date
}
const minutes = 60 * 1000

function Comment(elem: ICommentProps) {
  return (
    <div style={{ padding: "5px", margin: "2px", marginLeft: "4px", borderRadius: "5px", backgroundColor: "blue", color: "white" }}>
      <p style={{ fontSize: "10px", fontWeight: "bold" }}>{elem.passageTitle}<span style={{ fontSize: "10px", fontWeight: "bold", float: "right" }}>{new Date(elem.ts).toLocaleTimeString()}</span></p>
      <span>
        {elem.content}
      </span>
    </div>)
}
let curInterval = null
function CommentPanel({ Bio, step, comments, debug, showComments, segments, instructions, segmentEnd, pushComment, nextStep }: ICommentPanelProps) {
  let [curTime, setCurTime] = useState(Date.now())
  let [commentInput, setCommentInput] = useState("")
  let addComment = (comment, evt?: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (comment == "") {
      return
    }
    pushComment({ content: comment, ts: new Date() })
    setCommentInput("")
    if (evt !== undefined) {
      evt.preventDefault()
    }
  }
  useEffect(() => {
    if (curInterval == null) {
      curInterval = setInterval(() => setCurTime(Date.now()), 1000)
    }
  })
  let sHeightN = 100
  let tHeightN = 91
  if (showComments) {
    sHeightN -= 20
    tHeightN -= 20
  }
  let sHeight = debug ? "calc( " + sHeightN + "vh - 100px )" : sHeightN + "vh"
  let tHeight = debug ? "calc( " + tHeightN + "vh - 100px )" : tHeightN + "vh"
  // if (comments == undefined) return <p>Error</p>
  return <div id="container" style={{
    width: "200px",
    display: "flex", flexDirection: "column", flex: "0 1 auto",
    height: debug ? "calc( 100vh - 125px )" : "100vh",
    backgroundColor: "black"
  }}>
    <div id="statusContainer" style={{
      flex: "0 1 auto", margin: 0,
      color: "white", borderBottom: "2px solid white", textAlign: "center"
    }}>
      <p style={{ fontSize: "1em", marginBottom: 0, marginTop: 0 }}>Time remaining on step {step}/9:</p>
      <p style={{ fontSize: "25px", marginBottom: 0, marginTop: 0 }}>{segmentEnd}</p>
    </div>
    <div id="sideContainer" style={{
      height: tHeight, width: "100%", margin: 0
    }}>
      <Accordion defaultActiveKey="0">
        {instructions !== undefined ?
          <><Accordion.Toggle as={Button} eventKey="0">
            instructions
          </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <div style={{ width: "100%", margin: "0", padding: "3px", color: "white", fontSize: "12px" }}>
                {instructions}
              </div>
            </Accordion.Collapse></>
          : undefined}
        {Bio !== undefined ?
          <><Accordion.Toggle as={Button} variant="link" eventKey="1">
            Partner Bio
          </Accordion.Toggle>
            <Accordion.Collapse eventKey="1">
              <div style={{ width: "100px", margin: "0", padding: "0", color: "white" }}>
                {Bio ? Bio : undefined}
              </div>
            </Accordion.Collapse></>
          : undefined}
      </Accordion>
      <Tabs variant="pills" defaultActiveKey="4" id="uncontrolled-tab-example">
        <Tab eventKey="4" title="1">
          <div id="commentContainer" style={{
            overflowY: "scroll", height: showComments ? "45vh" : "70vh", width: "100%", margin: 0, display: "flex", flexDirection: "column-reverse"
          }}>
            {comments !== undefined && comments.map((elem, i) => (
              <Comment key={i} {...elem}></Comment>
            ))}
          </div>
        </Tab>
        {step > 4 ?
          <Tab eventKey="6" title="2">
            <div id="commentContainer" style={{
              overflowY: "scroll", height: showComments ? "45vh" : "70vh", width: "100%", margin: 0, display: "flex", flexDirection: "column-reverse"
            }}>
              {comments !== undefined && comments.map((elem, i) => (
                <Comment key={i} {...elem}></Comment>
              ))}
            </div>
          </Tab>
          : undefined}
        {step > 6 ?
          <Tab eventKey="8" title="3">
            <div id="commentContainer" style={{
              overflowY: "scroll", height: showComments ? "45vh" : "70vh", width: "100%", margin: 0, display: "flex", flexDirection: "column-reverse"
            }}>
              {comments !== undefined && comments.map((elem, i) => (
                <Comment key={i} {...elem}></Comment>
              ))}
            </div>
          </Tab> : undefined}
      </Tabs>

    </div>
    {showComments &&
      <div id="inputContainer" style={{ height: "20vh", width: "100%" }}>
        <textarea style={{ width: "100%", height: "15vh", padding: "10px" }}
          onKeyPress={((evt) => (evt.charCode === 13) ? addComment(commentInput, evt) : undefined)}
          placeholder="Enter your response here." onChange={(e) => setCommentInput(e.target.value)} value={commentInput}></textarea>
        <button style={{ fontSize: "16px" }} onClick={() => addComment(commentInput)
        }>Submit Response</button>
      </div>
    }
  </div >
}
export default CommentPanel
