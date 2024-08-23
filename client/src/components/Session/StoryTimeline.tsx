import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import { persistedState } from "../../index"
type AppDispatch = typeof persistedState.store.dispatch
type RootState = ReturnType<typeof persistedState.store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default function Debug({ playerId, playerInfo, refreshStory, step, history }) {
  const auth = useAppSelector((state: any) => state.auth)

  let [logs, setLogs] = React.useState([])
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
  function clearCache() {
    // let pInfo = {...playerInfo}
    // let curStory = playerInfo.currentStory
    // Get all substories
    localStorage.clear()
    localStorage.setItem("twine-prefs", "a812d7f5-fbcd-47b6-b526-f0b481c306da")
    localStorage.setItem("twine-prefs-a812d7f5-fbcd-47b6-b526-f0b481c306da", "{\"id\": \"a812d7f5-fbcd-47b6-b526-f0b481c306da\", \"name\": \"welcomeSeen\", \"value\": true}")
  }
  function clearPlayerCache() {
    sessionStorage.clear()
  }
  function clearPlayerLogs() {
    fetch(`/api/logs/${playerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  function clearPlayerComments(playerId) {
    // let pInfo = {...playerInfo}
    // let curStory = playerInfo.currentStory
    // Get all substories
    localStorage.clear()
  }
  useEffect(() => {
    fetch(`/api/logs/${playerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.token
      },
    })
      .then(async (res) => {
        let cLogs = await res.json()
        console.log(cLogs)
        setLogs(cLogs.filter(entry => entry.eventId === 3))
      })
  }, [])
  console.log(new Date(playerInfo.sessionStart).valueOf())
  return (<div style={{ width: "100vw", height: "100px" }}>
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* <div style={{ display: 'flex' }}>
        <Button size="sm" onClick={() => clearCache()}>Clear Cache</Button>
        <Button size="sm" onClick={() => clearPlayerCache()}>Clear Player Cache</Button>
        <Button size="sm" onClick={() => clearPlayerLogs()}>Clear Player Logs</Button>
        <Button size="sm" onClick={() => clearPlayerComments(playerId)}>Clear Player Comments</Button>
      </div> */}
      {logs ?
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {
              logs.map(
                (log, i) =>
                  <p key={i} style={{ flex: "1 0 auto" }}>
                    <Button size="sm" onClick={() => { clearCache(); console.log("Loading story: ", JSON.parse(log.content)); injectStory(JSON.parse(log.content)); refreshStory() }}>
                      S:{new Date(new Date(log.ts).valueOf() + (0 * 1000 * 60 * 60)).toLocaleTimeString()}
                    </Button>
                  </p>)
            }
          </div>
        </div>
        : undefined}
    </div>
  </div >)
}