import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function Debug({ playerId, step, history }) {
  let [players, setPlayers] = React.useState([])
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
    fetch(`/api/players/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        let cPlayers = await res.json()
        console.log(cPlayers)
        setPlayers(cPlayers)
      })
  }, [])
  return (<div style={{ width: "100vw", height: "100px" }}>
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ display: 'flex' }}>
        <Button size="sm" onClick={() => clearCache()}>Clear Cache</Button>
        <Button size="sm" onClick={() => clearPlayerCache()}>Clear Player Cache</Button>
        <Button size="sm" onClick={() => clearPlayerLogs()}>Clear Player Logs</Button>
        <Button size="sm" onClick={() => clearPlayerComments(playerId)}>Clear Player Comments</Button>
      </div>
      {players ?
        <div style={{ flex: "1 1 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {
              players.map(
                (player, i) =>
                  <p key={i} style={{ flex: "1 0 auto", backgroundColor: player.uid == playerId ? "yellow" : undefined }}>
                    <Button size="sm" onClick={() => window.location.href = `/study/1/${player.uid}/session?debug=1&step=${step}`}>
                      {player.note}|S:{new Date(player.sessionStart).toLocaleString()}
                    </Button>
                  </p>)
            }
          </div>
        </div>
        : undefined}
    </div>
    <div style={{ flex: "1 0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {
          [0, 1, 2, 3, 4, 5, 6, 7].map(
            (newStep, i) =>
              <p key={i} style={{ flex: "1 0 auto" }}>
                <Button size="sm" variant={newStep == step ? "primary" : "secondary"} onClick={() => window.location.href = `/study/1/${playerId}/session?debug=1&step=${newStep.toString()}`}>
                  Step {newStep}
                </Button>
              </p>)
        }
      </div>
    </div>
  </div>)
}