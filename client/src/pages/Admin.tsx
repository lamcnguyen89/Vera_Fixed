import React, { useCallback, useEffect, useState } from "react"
import styled from 'styled-components'
import { useTable, useSortBy, useFilters } from 'react-table'
// import Form from "react-bootstrap/Form"
import NavMenu from '../components/NavMenu'
import { persistedState } from "../index"
import { Switch, Route, HashRouter, withRouter } from 'react-router-dom'
import {
  Container, Row, Col, Button, Form, Label, Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Input,
  FormGroup, CustomInput, Table, Modal, ModalHeader, ButtonGroup, ModalFooter, ModalBody, UncontrolledDropdown,
  TabContent, TabPane, Nav, NavItem, NavLink, Card, CardTitle, CardText,
  InputGroupButtonDropdown, InputGroupText, InputGroup
} from 'reactstrap'
import { ChangeEvent } from 'react'
import classnames from 'classnames'
// import { DateTime } from 'react-datetime-bootstrap'
import DatePicker from 'react-datepicker'
import '../styles/App.css'
import 'react-datepicker/dist/react-datepicker-cssmodules.css'
// import 'bootstrap/dist/css/bootstrap.min.css'
import { trackPromise } from 'react-promise-tracker'
import { usePromiseTracker } from "react-promise-tracker"
import Loader from 'react-loader-spinner'
import { useHistory, useParams } from "react-router-dom"
import useWebSocket, { ReadyState } from 'react-use-websocket'

// import 'bootstrap/dist/css/bootstrap.min.css'
import { addSession, deleteSession, createPair, deleteParticipant, getAllPlayers, getApplication, getCreatedProjects, getExit, removePartner, setPartner, updatePlayerApi, createParticipant, downloadParticipant, createData } from "../helpers/DatabaseAPIs"
import LogView from "./LogView"
import { WSA_E_CANCELLED } from "constants"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import InputForm from "../components/Modal/InputForm"
const clipboard = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
</svg>
const email = <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 64 64" aria-labelledby="title"
  aria-describedby="desc" role="img" >
  <path data-name="layer2"
    fill="none" stroke="#FFFFFF" strokeMiterlimit="10" strokeWidth="2" d="M62 16H23.6L16 48h38.4L62 16z"
    strokeLinejoin="round" strokeLinecap="round"></path>
  <path data-name="layer2" fill="none" stroke="#FFFFFF" strokeMiterlimit="10"
    strokeWidth="2" d="M23.6 16l14.9 22L62 16M16 48l19.2-14.8M54.4 48L42.9 33.8"
    strokeLinejoin="round" strokeLinecap="round"></path>
  <path data-name="layer1" fill="none" stroke="#FFFFFF" strokeMiterlimit="10"
    strokeWidth="2" d="M2 24h11.9M2 32h10M2 40h8" strokeLinejoin="round"
    strokeLinecap="round"></path>
</svg>

const LoadingIndicator = props => {
  return (
    <div
      style={{
        width: "100%",
        height: "100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }
      }>
      <Loader type="ThreeDots" color="#2BAD60" height="100" width="100" />
    </div >
  )
}

// Show all participants
const Styles = styled.div`
  padding: .5rem;

  table {
    border-spacing: 0;
    border: 1px solid black;
    border-collapse:revert;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0rem 0rem .1rem .1rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`
function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the min and max
  // using the preFilteredRows
  // console.log(filterValue, id)
  return <CustomInput id="futureCheck" type="checkbox" inline style={{ width: 30, height: 30 }} label="Future" defaultChecked={filterValue !== undefined} onChange={(elem) => {
    setFilter(elem.target.checked === true ? true : undefined)
  }
  }></CustomInput>
}
export interface IApplication {
  ethnicRacialAffiliation: string
  nativeLanguage: string
  languagePreference: string
  genderAffiliation: string
  prevExperience: string
  intro: string
  email: string
  dates: Array<string>
  player: string
}

export interface IExit {
  ts: Date,
  uid: string,
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  q8: string
  q9: string
  q10: string
  q11: string
  q12: string
  q13: string
  q14: string
}

export interface IApplication {
  ethnicRacialAffiliation: string
  nativeLanguage: string
  languagePreference: string
  genderAffiliation: string
  prevExperience: string
  intro: string
  email: string
  dates: Array<string>
  player: string
}
const SESSION_LENGTH = 3 * 60 * 60 * 1000

export interface IParticipant {
  state: string
  email: string
  cell: string
  availability?: string[]
  sessionStart?: string
  note: string
  checkedIn: Date
  consented: boolean
  currentStory: any
  bio: string
  info: string
  uid: string
  comments: any[]
}

export interface IStudy {
  configuration: {
    checkinTimeInMinutes: number,
    checkin: boolean,
    confirmation: boolean,
    schedule: number[]
  }
  name: string
  pid: string
  users: string[]
  sessions: string[]
}
// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter(row => {
    let rowValue = new Date().getTime()
    if (row.values[id] !== undefined) {
      rowValue = new Date(row.values[id]).getTime()
    }
    // console.log(row)
    let sessionDay = new Date(rowValue)
    sessionDay.setHours(0, 0, 0, 0)
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    return sessionDay.getTime() >= today.getTime() || row.values['State'] === "enrolled"
  })
}
function ParticipantTable({ columns, data, auth, setIndex }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      date: filterGreaterThan,
    }),
    []
  )
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
    defaultCanFilter: false,
    filterTypes,
    initialState: { sortBy: [{ id: 'sessionStart', desc: true }] }
  },
    useFilters,
    useSortBy
  )

  // Render the UI for your table
  return (
    <Table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column, i) => (
              <th scope="col" key={i} {...column.getHeaderProps()}
                style={{ minWidth: column.minWidth, width: column.width }}>
                <div {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </div>
                <div>{column.canFilter ? column.render('Filter') : null}</div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}
            >
              {row.cells.map(cell => {
                return <td {...cell.getCellProps({ style: { minWidth: cell.column.minWidth, width: cell.column.width } })}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}
let pinging = undefined
// Use throughout your app instead of plain `useDispatch` and `useSelector`
type AppDispatch = typeof persistedState.store.dispatch
type RootState = ReturnType<typeof persistedState.store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default function ({ match }) {

  const history = useHistory()
  const auth = useSelector((state: any) => state.auth)
  const socketUrl = `${window.location.protocol == "http:" ? "ws:" : "wss:"}//${window.location.hostname}${window.location.port !== "80" ? ":" + window.location.port : ""}/api/ws`
  // const socketUrl = `ws://${persistedState.store.getState().auth.token}@localhost:4001/api/ws`
  // console.log(persistedState.store.getState().auth)
  if (!persistedState.store.getState().auth.isAuthenticated) {
    history.replace("/admin")
    return
  }
  var msg = {
    type: 'authenticate',
    payload: { token: persistedState.store.getState().auth.token.slice(7) }
  }
  const dispatch = useAppDispatch()

  const {
    sendJsonMessage,
    lastJsonMessage,
    readyState
  } = useWebSocket(socketUrl, {
    share: true,
    onOpen: () => {
      // console.log('opened' + new Date().toLocaleString())
      sendJsonMessage(msg)
    },
    onMessage: (msg) => {
      try {
        let parsed = JSON.parse(msg.data)
        switch (parsed.type) {
          case "authentication":
            if (!parsed.payload) {
              console.log(parsed)
              console.log("Logging out...")
              dispatch({ type: 'LOGOUT' }); history.replace('/admin')
            }
            break
          default:
          // console.log(parsed);
        }

      } catch {
        console.log(msg)
      }
    },
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  })
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      if (pinging !== undefined) {
        clearInterval(pinging)
        pinging = setInterval(() => { sendJsonMessage({ type: "ping" }) }, 10000)
      } else {
        pinging = setInterval(() => { sendJsonMessage({ type: "ping" }) }, 10000)
      }
    }
  }, [readyState])
  let [pairDateTime, setPairDateTime] = useState(new Date())
  let [newSessionDateTime, setNewSessionDateTime] = useState(new Date())
  let [participantExitSurvey, setParticipantExitSurvey] = useState<IExit | undefined>()
  let [participantApplication, setParticipantApplication] = useState<IApplication | undefined>()
  let [participantMatched, setParticipantMatched] = useState(false)
  let [partnerExitSurvey, setPartnerExitSurvey] = useState<IExit | undefined>()
  let [partnerApplication, setPartnerApplication] = useState<IApplication | undefined>()
  let [selectedParticipant, setSelectedParticipant] = useState<IParticipant>({
    state: "",
    cell: "",
    email: "",
    sessionStart: undefined,
    note: "",
    checkedIn: new Date(0),
    consented: false,
    currentStory: {},
    bio: "",
    info: "",
    uid: "",
    comments: []
  })
  let [selectedPartner, setSelectedPartner] = useState<IParticipant>({
    state: "",
    cell: "",
    email: "",
    sessionStart: undefined,
    note: "",
    checkedIn: new Date(0),
    consented: false,
    currentStory: {},
    bio: "",
    info: "",
    uid: "",
    comments: []
  })

  useEffect(() => {
    setParticipantMatched(false)

    if (selectedParticipant.uid === "") {
      return
    }
    trackPromise(
      Promise.all([
        getApplication(selectedParticipant.uid, auth.token)
          .then(async (res) => {
            let application: IApplication = await res.json()
            console.log("Got request", application)
            setParticipantApplication(application)
          }),
        getExit(selectedParticipant.uid, auth.token)
          .then(async (res) => {
            let exit: IExit = await res.json()
            setParticipantExitSurvey(exit)
          })
      ]
      )
      , "participant")

  }, [selectedParticipant])

  // const [activeTab, setActiveTab] = useState(location.hash === "#participants" ? '1' : '2')
  // history.listen((location, action) => {
  //   setActiveTab(location.hash === "#participants" ? '1' : '2')
  // })
  // const toggle = tab => {
  //   if (activeTab !== tab) setActiveTab(tab)
  // }
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const toggleDropdown = () => setDropdownOpen(prevState => !prevState)
  let [showLogs, setShowLogs] = useState("")
  let [players, setPlayers] = useState<IParticipant[]>([])
  let [study, setStudy] = useState<IStudy>(undefined)
  let [applications, setApplications] = useState<IApplication[]>([])
  const [show, setShow] = useState(false)
  const [showAddParticipants, setShowAddParticipants] = useState(false)
  const [index, setIndex] = useState(undefined)
  const [showDetails, setShowDetails] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const handleClose = () => setShow(false)
  const handleCloseAddParticipants = () => setShowAddParticipants(false)
  const { promiseInProgress } = usePromiseTracker({ area: "table" })
  const { promiseInProgress: participantPromiseInProgress } = usePromiseTracker({ area: "participant" })
  let overlappingSessions = useCallback((part1, part2) => {
    if ((part1 && part1.availability == undefined) || (part2 && part2.availability == undefined)) {
      return false
    } else {
      return study.sessions.filter((session, index2) => {
        let pDate = part1.availability.find(psession => new Date(psession).valueOf() == new Date(session).valueOf())
        let participantHas = pDate !== undefined
        let partnerHas = false
        if (part2 !== undefined && part2.uid !== "") {
          let partDate = part2.availability.find(psession => new Date(psession).valueOf() === new Date(session).valueOf())
          partnerHas = partDate !== undefined
        } else {
          partnerHas = false
        }
        return participantHas && partnerHas
      }).length > 0
    }
  }, [study])
  const columns = React.useMemo(
    () => [
      // {
      //   Header: 'P#',
      //   accessor: 'note',
      //   width: 50,
      //   disableFilters: true
      // },
      {
        Header: 'UDID',
        accessor: 'uid',
        Cell: ({ value, row }) => 
          value,
        width: 50,
        disableFilters: true
      },
      {
        Header: 'Start',
        accessor: 'sessionStart',
        Cell: ({ value, row }) => 
          value === undefined ? "" : new Date(value).toLocaleString(),
        width: 50,
        disableFilters: true
      },
      // {
      //   Header: 'Email',
      //   accessor: 'email',
      //   Cell: ({ value, row }) => <Button variant="outline-info" style={{ paddingTop: "1px", paddingBottom: "1px", whiteSpace: "nowrap" }} onClick={() => {
      //     // href={`/study/1/${value}/session`}
      //     var input = `${window.location.protocol}//${window.location.hostname}${window.location.port !== "80" ? ":" + window.location.port : ""}/study/1/${value}/session`
      //     navigator.clipboard.writeText(input)
      //     // document.body.removeChild(input)
      //   }} > {email}</Button>,
      //   width: 50,
      //   disableFilters: true
      // },
      {
        Header: 'State',
        width: 50,
        disableFilters: true,
        accessor: row => row.state,
      },
      {
        Header: 'Logs',
        width: 50,
        disableFilters: true,
        accessor: (row) => row.uid,
        Cell: ({ value, row }) => <Button variant="outline-secondary" onClick={() => { console.log(value); setShowLogs(value) }}>Logs</Button>
      },
      {
        Header: 'Details',
        width: 50,
        Cell: ({ row }) => <Button variant="outline-info" onClick={() => {
          setSelectedParticipant(row.original)
          setShowDetails(true)
        }}>Details</Button>
      },
      {
        Header: 'Exclude',
        width: 50,
        Cell: ({ row }) => <Input type="checkbox" label="Exclude" style={{ 
          marginLeft: "revert", width: 30, height: 30, textAlign: "center"
        }} value={row.exclude}  onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setExcludeCallback(row.original.uid, event.target.checked)
        }}></Input>
      },
      {
        Header: 'Download',
        width: 50,
        Cell: ({ row }) => <Button variant="outline-info" onClick={() => {
          downloadParticipant(projectId, row.original.uid, auth.token);
        }}>CSV</Button>
      },
      // {
      //   Header: 'Stories',
      //   width: 50,
      //   Cell: ({ row }) => <Button variant="outline-info" onClick={() => {
      //     let path = `/admin/study/${study.pid}/${row.original.uid}/sessionView`
      //     history.push(path)
      //   }}>Stories</Button>
      // },
    ],
    [players, applications, index]
  )
  let updatePlayerCallback = useCallback((playerId, update) => {
    console.log("Updating " + playerId)
    console.log(update)
    updatePlayerApi(playerId, update, auth.token)
      .then(async (res) => {
        console.log(res.status)
        setPlayers(prev => prev.map(pls => {
          if (pls.uid === playerId) {
            for (let key of Object.keys(update)) {
              pls[key] = update[key]
            }
          }
          return pls
        }))
      })
  }, [])

  let setExcludeCallback = useCallback((uid, exclude) => {
    updatePlayerApi(uid, {exclude}, auth.token)
      .then(async (res) => {
        let js = await res.text()
        console.log(res.status)
      })
  }, [newSessionDateTime])
  let deleteSessionCallback = useCallback((sess) => {
    deleteSession(projectId, sess, auth.token)
      .then(async (res) => {
        let js = await res.json()
        console.log(res.status)
        setStudy(js)
      })
  }, [newSessionDateTime])

  let addSessionCallback = useCallback(() => {
    addSession(projectId, newSessionDateTime, auth.token)
      .then(async (res) => {
        let js = await res.json()
        console.log(res.status)
        setStudy(js)
      })
  }, [newSessionDateTime])

  let createPairCallback = useCallback(() => {
    createPair(projectId, pairDateTime, auth.token)
      .then(async (res) => {
        let js = await res.json()
        console.log(res.status)
        setPlayers((prev) => [...prev, ...js])
      })
  }, [pairDateTime])
  let createParticipantCallback = useCallback(() => {
    createParticipant(projectId, auth.token)
      .then(async (res) => {
        let js = await res.json()
        console.log(res.status)
        setPlayers((prev) => [...prev, ...js])
      })
  }, [pairDateTime])
  let createDataCallback = useCallback(() => {
    createData(projectId, auth.token)
      .then(async (res) => {
        let js = await res.json()
        console.log(res.status)
      })
  }, [pairDateTime])

  let showCreatePair = useCallback(() => {
    setShow(true)
  }, [])
  let deleteParticipantCallback = useCallback((participant) => {
    console.log("Deleting ", participant)
    console.log("Deleting ", selectedParticipant)
    
    deleteParticipant(participant.uid, auth.token)
      .then(async (res) => {
        let status = res.status
        console.log(res.status)
        if (res.status === 200) {
          setShowConfirmDelete(false)
          setShowDetails(false)

          console.log(participant)
          let playerIndex = players.indexOf(participant)
          if (players.length > 1) {
          setSelectedParticipant(players[(playerIndex + 1) % (players.length - 1)])
          } else {
            setSelectedParticipant({
              state: "",
              cell: "",
              email: "",
              sessionStart: undefined,
              note: "",
              checkedIn: new Date(0),
              consented: false,
              currentStory: {},
              bio: "",
              info: "",
              uid: "",
              comments: []
            })
          }
          setPlayers((prev) => prev.filter(player => player.uid !== participant.uid))
        }
      })
  }, [selectedParticipant])
  let withdrawParticipant = useCallback(async (reason) => {
    console.log(`/api/withdrawparticipant/${projectId}/${selectedParticipant.uid}`)
    await Promise.all([
      fetch(`/api/withdrawparticipant/${projectId}/${selectedParticipant.uid}`, {
        method: 'GET',
        headers: {
          Authorization: auth.token,
          Reason: reason
        }
      })])
    setPlayers(players.map(pply => {
      if (pply.uid === selectedParticipant.uid) {
        pply.state = "withdrawn"
      }
      return pply
    }))

  }, [selectedParticipant])
  let sendParticipantCheckInReminder = useCallback(() => {
    console.log(`/api/sendCheckInReminder/${selectedParticipant.uid}`)
    Promise.all([
      fetch(`/api/sendCheckInReminder/${selectedParticipant.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: auth.token
        }
      }),
      fetch(`/api/sendCheckInReminder/${selectedPartner.uid}`, {
        method: 'PUT',
        headers: {
          Authorization: auth.token
        }

      })])
  }, [selectedParticipant])
  let sendParticipantScheduleEmail = useCallback(() => {
    // console.log(`/api/sendScheduleEmail/${selectedParticipant.uid}`)
    fetch(`/api/sendScheduleEmail/${projectId}/${selectedParticipant.uid}`, {
      method: 'PUT',
      headers: {
        Authorization: auth.token
      }

    }).then(async () => {
      console.log("Messages sent")
      // set state for both to scheduled
      setPlayers(players.map(pply => {
        if (pply.uid === selectedParticipant.uid) {
          pply.state = "scheduled"
        }
        return pply
      }))
    })
  }, [selectedParticipant])
  let sendCompletionCertificate = useCallback(() => {
    // console.log(`/api/sendScheduleEmail/${selectedParticipant.uid}`)
    fetch(`/api/sendCompletionCertificate/${selectedParticipant.uid}`, {
      method: 'PUT',
      headers: {
        Authorization: auth.token
      }

    }).then(async () => {
      console.log("Messages sent")
      // set state for both to scheduled
      setPlayers(players.map(pply => {
        if (pply.uid === selectedParticipant.uid) {
          pply.state = "certificateSent"
        }
        return pply
      }))
    })
  }, [selectedParticipant])
  useSelector((state: any) => state.auth)
  let { projectId } = useParams<{ projectId: string }>()
  useEffect(() => {
    trackPromise(
      Promise.all([
        fetch(`/api/study/${projectId}`).then(async (res) => {
          let js = await res.json()
          if (projectId !== js._id) {
            history.replace("/admin/manage/" + js._id)
            projectId = js._id
          }
          setStudy(js)
        }),
        getAllPlayers(auth.token, projectId)
          .then(async (res) => {
            if (res.success !== false) {
              console.log(res)
              setPlayers(res)
            } else {
              history.replace("/admin/Dashboard")
            }
          })])
      , "table")
  }, [])
  const token = auth.token.split(" ")[1];

  // console.log(players)
  return (showLogs === "" ?
      <Container fluid className="container-fluid">
        <NavMenu title={study === undefined ? "Management" : study.name + " Management"} />
        <HashRouter basename={`/`} hashType="noslash">
        <Container>
          {/* <Nav tabs>
            <NavItem>
              <NavLink href="#"
                className={classnames({ active: activeTab === '1' })}
                onClick={() => { toggle('1'); history.push(`/admin/manage/${projectId}#participants`) }}
              >
                Participants
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="#"
                className={classnames({ active: activeTab === '2' })}
                onClick={() => { toggle('2'); history.push(`/admin/manage/${projectId}#settings`) }}
              >
                Settings
              </NavLink>
            </NavItem>
          </Nav> */}
          {/* <TabContent activeTab={activeTab}>
            <TabPane tabId="1"> */}
          <Container>
            <div>
              API Key <Button variant="outline-info" style={{ paddingTop: "1px", paddingBottom: "1px", whiteSpace: "nowrap" }} onClick={() => {
                // href={`/study/1/${value}/session`}
                navigator.clipboard.writeText(token)
                // document.body.removeChild(input)
              }} > {clipboard} </Button> {/*
              <span style={{fontSize: "smaller", overflowWrap:"anywhere"}}>
              {token}
              </span>
              **/}
              Study UDID: 
           
            <Button variant="" style={{ display: "outline", paddingTop: "1px", paddingBottom: "1px", whiteSpace: "nowrap" }} onClick={() => {
              // href={`/study/1/${value}/session`}
              var input = projectId
              navigator.clipboard.writeText(input)
              // document.body.removeChild(input)
            }} > {clipboard}<Input readOnly style={{ marginLeft:"10px", display: "inline",  }} defaultValue={projectId}></Input></Button>
            </div>            
              <Styles>
                {promiseInProgress || !Array.isArray(columns) || !Array.isArray(players) ?
                  <LoadingIndicator></LoadingIndicator>
                  :
                  <ParticipantTable auth={auth} columns={columns} data={players} setIndex={setIndex} />}
                <ButtonGroup aria-label="Create synthetic participant">
                  <Button variant="primary" onClick={() => createParticipantCallback()}>Create Sim Participant</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="Download all participants">
                  <Button variant="primary" disabled={true} onClick={() => console.log()}>Download all</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="Upload participant data">
                  <Button variant="primary" disabled={true} onClick={() => console.log()}>Upload data</Button>
                </ButtonGroup>
              </Styles>
            {/* </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="8">
                  <Card body>
                    <CardTitle><b>Study UDID</b></CardTitle>
                    <CardText><Input readOnly defaultValue={projectId}></Input>
                      <Button variant="outline-info" style={{ paddingTop: "1px", paddingBottom: "1px", whiteSpace: "nowrap" }} onClick={() => {
                        // href={`/study/1/${value}/session`}
                        var input = projectId
                        navigator.clipboard.writeText(input)
                        // document.body.removeChild(input)
                      }} > {clipboard}</Button>
                    </CardText>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </TabContent> */}
          </Container>
          {/* <DateTime value={pairDateTime} onChange={(time)=>setPairDateTime(time)}></DateTime> */}
          <Modal isOpen={show} toggle={() => setShow(!show)}>
            <ModalHeader>
              Create new participant
            </ModalHeader>
            <ModalBody>
              <p>
                Select session date:
              </p>
              <DatePicker selected={pairDateTime}
                onChange={(value) => {
                  setPairDateTime(value)
                }}
                showTimeInput timeFormat="p"
                showTimeSelect
                timeIntervals={30} dateFormat="MMMM d, h:mm aa" />

            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => {
                // console.log("Saving timestamp...")
                createPairCallback()
                handleClose()
              }}>
                Save
              </Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={showConfirmDelete} toggle={() => setShowConfirmDelete(!showConfirmDelete)}>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              <p>This will delete the participant and remove any related logs, exit surveys and related data.</p>
              <Button onClick={() => {
                deleteParticipantCallback(selectedParticipant)
              }
              }>Confirm</Button>
              <Button onClick={() => { setShowConfirmDelete(false); setShowDetails(true) }}>Cancel</Button>
            </ModalBody>
          </Modal>
          <Modal size="lg" style={{ width: '100%' }} isOpen={showDetails} toggle={() => setShowDetails(!showDetails)}>
            <ModalHeader>
              {
                selectedParticipant ? selectedParticipant.note ? selectedParticipant.note : `UID: ${selectedParticipant.uid}` :
              "none"
              }
            </ModalHeader>
            <ModalBody>
              {participantPromiseInProgress ? <LoadingIndicator></LoadingIndicator> :
                <Table responsive size="lg">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>{selectedParticipant.note}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>UID</th>
                      <td>{selectedParticipant.uid}</td>
                      </tr>
                    <tr><th>Exit Survey</th></tr>
                    {selectedPartner && participantExitSurvey && Object.keys(participantExitSurvey).map(function (key, index) {
                      return (
                        key !== "_id" && key !== "__v" && key !== "player" ?
                          <tr key={key + index}>
                            <th>{key}</th>
                            <td>{participantExitSurvey[key]}</td>
                            {selectedPartner.uid !== "" ? <td>{partnerExitSurvey[key]}</td> : undefined}
                          </tr> : undefined)
                    })
                    }
                  </tbody>
                </Table>
              }
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setShowDetails(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={() => { setShowConfirmDelete(true) }}>
                Delete
              </Button>
            </ModalFooter>
          </Modal>
    </Container>
      </HashRouter>
        </Container > : <LogView match={match} participant={showLogs} setShowLogs={setShowLogs}></LogView>)
}

