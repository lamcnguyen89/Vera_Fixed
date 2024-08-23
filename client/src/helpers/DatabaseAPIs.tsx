// var Vimeo = require('vimeo').Vimeo
const api = `/api`
// ---------- project api calls -----------
export function createNewProject(
  prjName: string,
  authToken: string,
  actingFunction: any
) {
  return fetch(
    `${api}/projects/CreateProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        name: prjName,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        // user successfully added a project, add this to project array
        actingFunction(res)
      } else {
        // throw error
        throw res
      }
    })
    .catch((err) => {
      // project not added. Show error message
      console.log(err)
    })
}

// .then((res) => {

//         console.log(res);

//         setProjects(oldProjs => {
//             res.project.status="creator";
//             return [...oldProjs, res.project];
//         })
//     }
//     else {
//         // throw error
//         throw res;
//     }
// })
// .catch((err) => {
//     // project not added. Show error message
//     console.log(err);
// })
export function downloadParticipant(projectId:any, uid: any,
  authToken: string) {
  console.log("Downloading participant...")
  fetch(`/api/players/logs/${uid}`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken,
    },
  })
    .then(response => response.json())
    .then((json:any) => {
      console.log("Got from server", json)
      if (json!==null && json.length > 0) {
        // Convert the json into a csv format, assuming that it is an array of objects
        let { data, ...otherFields } = json[0]
        const fields = Object.keys(otherFields).filter((field) => field !== '__v' && field !== "_id" && field !== "player")
        const dataFields = Object.keys(data)

        const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here

        const escapeCsvValue = (value) => {
          if (typeof value === 'string') {
            value = value.replace(/"/g, '""') // Escape double quotes by doubling them
            value = `"${value}"` // Enclose in double quotes
          }
          return value
        }

        const csv = json.map(row => {
          const rowData = [
            ...fields.map(fieldName => {
              switch (fieldName) {
                case "ts":
                  return new Date(row[fieldName]).toISOString()
                default:
                  return escapeCsvValue(row[fieldName])
              }
            }),
            ...dataFields.map(otherFieldName => {
              const dataValue = row.data[otherFieldName]
              let retValue
              switch (typeof dataValue) {
                case 'number':
                  retValue = dataValue
                  break
                default:
                  retValue = escapeCsvValue(dataValue)
              }
              return retValue
            })
          ]
          return rowData.join(',')
        })

        csv.unshift([...fields, ...dataFields].map(field => `"${field}"`).join(',')) // add header column and escape headers
        const blob = new Blob([csv.join('\r\n')], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${projectId}_${uid}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link);

      } else {
        console.log("No data found")
      }
    })
    .catch(error => {
      console.error('Error downloading participant:', error)
    })
}

export function downloadData(projectId: any,
  authToken: string) {
  console.log("Downloading participant...")
  // fetch(`/api/players/logs/zip/${projectId}`, {
  //   method: 'GET',
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: authToken,
  //   },
  // })
  //   .then(response => response.blob())
  //   .then(blob => {
  //     console.log("Got from server", json)
  //     if (blob !==null && blob.size > 0) {
        
  //       // Convert the json into a csv format, assuming that it is an array of objects
  //       const url = window.URL.createObjectURL(blob)
  //       const link = document.createElement('a')
  //       link.href = url
  //       link.setAttribute('download', `study_${projectId}.zip`)
  //       document.body.appendChild(link)
  //       link.click()
  //       document.body.removeChild(link)
  //     } else {
  //       console.log("No data found")
  //     }
  //   })
  //   .catch(error => {
  //     console.error('Error downloading participant:', error)
  //   })
}

export function deleteParticipant(participantId, authToken) {
  return fetch(`/api/player/${participantId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  })
}
export function createData(studyId, authToken) {
  return fetch(`/api/createParticipant/${studyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  })
}
export function createParticipant(studyId, authToken) {
  return fetch(`/api/createParticipant/${studyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  })
}
export function createPair(studyId, pairDateTime, authToken) {
  return fetch(`/api/createParticipantPair/${studyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      sessionStart: pairDateTime.valueOf()
    })
  })
}
export function addSession(studyId, newSessionDateTime, authToken) {
  return fetch(`/api/session/${studyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({ sessionStart: newSessionDateTime })
  })
}
export function deleteSession(studyId, newSessionDateTime, authToken) {
  return fetch(`/api/session/${studyId}/${newSessionDateTime}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
  })
}
export function updatePlayerApi(playerId, update, authToken) {
  return fetch(`/api/player/${playerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify(update)
  })
}

export function getExit(
  participantId: string,
  authToken: string,
) {
  return fetch(`/api/exit/${participantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
}
export function getApplication(
  participantId: string,
  authToken: string,
) {
  return fetch(`/api/application/${participantId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
}
export function setPartner(
  participantId: string,
  partnerId: string,
  authToken: string,
) {
  return fetch(`/api/partner/${participantId}/${partnerId}`, {
    method: 'PUT',
    headers: {
      Authorization: authToken
    }
  })
}
export function removePartner(
  participantId: string,
  authToken: string
) {
  return fetch(`/api/partner/${participantId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: authToken
    }
  })
}

export function getAllPlayers(
  authToken: string,
  studyId: string,
) {
  console.log("Getting all players")
  return fetch(
    `${api}/players/${studyId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  )
    .then((res) => {
      console.log(res)
      return res.status == 200 ?
        res.json() : { success: false, type: "unauthorized" }
    })

    .catch((res) => {
      console.log(res)
    })
}
export function getAllProjects(
  authToken: string,
  userId: string,
  actingFunction: any
) {
  fetch(
    `${api}/projects/GetAllProjects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  )
    .then((res) => res.status == 200 ?
      res.json() : { success: false, type: "unauthorized" })
    .then((res) => {
      if (res.success) {
        const temp: Array<any> = []
        res.projects.forEach((proj: any) => {
          proj.createdBy === userId
            ? (proj.status = "creator")
            : (proj.status = "annotator")
          temp.push(proj)
        })
        /** Update projects variable */
        actingFunction(temp)
      } else {

      }
    })
    .catch((res) => {
      console.log(res)
    })
}

export function getProject(
  prjId: string,
  authToken: string,
  actingFunction: any
) {
  // get project... GetProjectForSettings
  fetch(
    `${api}/projects/GetProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // console.log(res.project)
      if (res.success) {
        actingFunction(res.project)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

/**
 * Will load projects from Website and update projects variable once it is updated.
 * Only projects user has created
 */
export function getCreatedProjects(authToken: string) {
  fetch(
    `${api}/projects/GetAllCreatedProjects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // if it doesn't have success, it failed. Throw error
      if (res.success) {
        const temp: Array<any> = []
        res.projects.forEach((prj: any) => {
          prj.status = "creator"
          temp.push(prj)
        })

        /** Update projects variable */
        // setProjects(oldProjs => {
        //     console.log(oldProjs)
        //     return [...oldProjs, ...temp];
        // })
      } else throw res
    })
    .catch((err) => {
      console.log(err)
    })
}

/**
 * Will load projects from Website and update projects variable once it is updated.
 * Only projects user is participating in, but not created
 */
export function getParticipatingProjects(authToken: string) {
  fetch(
    `${api}/projects/GetAllParticipatingProjects`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // if it doesn't have success, it failed. Throw error
      if (res.success) {
        // let temp: Array<Project> = [];
        // res.projects.forEach((proj: Project) => {
        //     proj.status = "annotator";
        //     temp.push(proj);
        // })
        // console.log(temp);
        /** Update projects variable */
        // setProjects(oldProjs => {
        //     return [...oldProjs, ...temp];
        // })
        // console.log(projects)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function deleteProject(
  prjId: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/projects/deleteProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      actingFunction()
    })
    .catch((res) => {
      console.log(res)
    })
}

// --------- annotators api calls --------------------

export function getAnnotator(
  prjId: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/projects/GetAllUsers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // console.log(res);
      if (res.success) {
        // if succesful set the parent state with the annotators
        actingFunction(res.users)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function addAnnotator(
  prjId: string,
  email: string,
  authToken: string,
  actingFunction: any
) {
  // add a new annotator to the list
  return fetch(
    `${api}/projects/AddUserToProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
        userEmail: email,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // if successful add re-load users from the DB
      actingFunction()
    })
    .then((res: any) => {
      console.log(res)
      if (res.success) {
        return res.user
      } else throw res
    })
    .catch((res) => {
      console.log(res)
      return null
    })
}

export function deleteAnnotator(
  prjId: string,
  email: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/projects/RemoveUserFromProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
        userEmail: email,
      }),
    }
  )
    .then((res) => res.json())
    .then(() => {
      // if successful updates parent state
      actingFunction()
    })
    .catch((res) => {
      // debugger
      console.log(res)
      // return true
    })
}

// ------------ subject api calls ------------------

export function getSubject(
  prjId: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/projects/GetAllPlayersForProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      // if successful
      if (res.success) {
        // console.log("hereeeeee",res.players)
        actingFunction(res.players)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function addSubject(
  prjId: string,
  authToken: string,
  actingFunction: any
) {
  return fetch(
    `${api}/projects/AddPlayerToProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res: any) => {
      console.log(res)
      if (res.success) {
        console.log(res)
        actingFunction(res.player)
        // return res.player;
      } else throw res
    })
    .catch((res) => {
      console.log(res)
      return null
    })
}

export function deleteSubject(
  prjId: string,
  authToken: string,
  id: any,
  actingFunction: any
) {
  fetch(
    `${api}/projects/RemovePlayerFromProject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        playerId: id,
        projectId: prjId,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      actingFunction()
    })
    .catch((res) => {
      console.log(res)
    })
}

// ------------ annotation api calls ------------------

export function getBioData(
  uid: string,
  t: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/bio`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        uid: uid,
        t: t,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      actingFunction(res, uid)
    })
    .catch((res) => {
      // console.log(res);
    })
}

export function getMLData(
  uid: string,
  t: string,
  authToken: string,
  actingFunction: any
) {
  fetch(
    `${api}/bio/ml`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        uid: uid,
        t: t,
      }),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      actingFunction(res, uid)
    })
    .catch((res) => {
      // console.log(res);
    })
}

export function addBioFile(
  t: string,
  uid: string,
  authToken: string,
  file: string,
  actingFunction: any
) {
  return fetch(
    `${api}/bio/${t}/${uid}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({ file: file }),
    }
  )
    .then((res) => res.json())
    .then((res: any) => {
      console.log(res)
      if (res.success) {
        console.log(res)
        actingFunction(res.player)
        // return res.player;
      } else throw res
    })
    .catch((res) => {
      console.log(res)
      return null
    })
}
