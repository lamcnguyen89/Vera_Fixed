import React, { useEffect, useState } from "react"
import styled from 'styled-components'
import { useTable } from 'react-table'
import DatePicker from 'react-datepicker'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import { persistedState } from "../index"
import { Button } from "react-bootstrap"
enum LogTypes {
  Navigate,
  Comment,
  CloseEditor,
  StoryUpdate,
  ChangePassage,
}
// Show all participants
const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

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
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }

  
`
function Table({ columns, data }) {
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
  })

  // Render the UI for your table
  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type AppDispatch = typeof persistedState.store.dispatch
type RootState = ReturnType<typeof persistedState.store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


export default function ({ match, participant, setShowLogs }) {
  let [logs, setLogs] = useState([])
  const columns = React.useMemo(
    () => {
      console.log("Logs update")
      let cols =
        [
          {
            Header: 'TS',
            accessor: 'ts',
            Cell: ({ value }) => <DatePicker value={value} />
          },
          {
            Header: 'ID',
            accessor: (row) => {
              let res = ""
              return row.eventId
              // switch (row.eventId) {
              //   case LogTypes.Navigate:
              //     res = 'nav'
              //     break
              //   case LogTypes.Comment:
              //     res = 'com'
              //     break
              //   case LogTypes.CloseEditor:
              //     res = 'closeEditor'
              //     break
              //   case LogTypes.StoryUpdate:
              //     res = 'storyUpdate'
              //     break
              //   case LogTypes.ChangePassage:
              //     res = 'changePassage'
              //     break
              // }
              // return res
            }
          }
        ]
      // Add remaining properties of row to cols
      if (logs.length > 0) {
      console.log(logs[0])
        for (let key in logs[0].data) {
            cols.push({
              Header: key,
              accessor: (row) => {
                // if key is object, serialize:
                  return JSON.stringify(row.data[key])
              },
            })
        }
      }
      return cols
    },
    [logs]
  )

  const auth = useAppSelector((state: any) => state.auth)
  useEffect(() => {
    let pId = ""
    console.log(match.params.participantId)
    console.log(participant)
    if (match.params.participantId !== undefined) {
      pId = match.params.participantId
    } else {
      pId = participant
    }
    console.log("Fetching " + `/api/logs/` + pId)
    fetch(`/api/logs/${pId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.token
      },
    })
      .then(async (res) => {
        let js = await res.json()
        console.log("Received logs")
        console.log(js)
        setLogs(js)
      })

  }, [])
  return (<>
    <Button onClick={() => setShowLogs("")}>Back to Overview</Button>
    <Styles>
      <Table columns={columns} data={logs} />
    </Styles>
    {/* <DateTime value={pairDateTime} onChange={(time)=>setPairDateTime(time)}></DateTime> */}
  </>)
}