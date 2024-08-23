export function createDataset (prjId:any) {
  fetch(`/owl/ajf/createDataset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dbName: prjId
    })
  })
    .then((res) => res.json())
    .catch((res) => { console.log(res) })
}

export function getProtoElements (authToken:string, type:any, prjId:any, actingFunction:any) {
  fetch(`/owl/protoelements/getAllProto${type}/${prjId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      // if (res.success) {this.setState({protoElements: res.proto}, () => {})}
      // else throw res
      if (res.success) { actingFunction(res.proto) } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function getProtoScenes (authToken:string, prjId:any, actingFunction:any) {
  fetch(`/owl/protoelements/getAllProtoScenes/${prjId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        // set link protoscene dropdown options
        const dropdownOptions:any = []
        res.proto.forEach((pe:any) => {
          const name = pe.protoelement
          const desc = pe.description
          dropdownOptions.push(name + ' ' + desc)
        })
        actingFunction(res.proto, dropdownOptions)
      } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function getProtoBeats (authToken:string, prjId:any, actingFunction:any) {
  fetch(`/owl/protoelements/getAllProtoBeats/${prjId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        // set link protoscene dropdown options
        const dropdownOptions:any = []
        res.proto.forEach((pe:any) => {
          const name = pe.protoelement
          const desc = pe.description
          dropdownOptions.push(name + ' ' + desc)
        })
        actingFunction(res.proto, dropdownOptions)
      } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function getProtoChoices (authToken:string, prjId:any, actingFunction:any) {
  fetch(`/owl/protoelements/getAllProtoChoices/${prjId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        // set link protoscene dropdown options
        const dropdownOptions:any = []
        res.proto.forEach((pe:any) => {
          const name = pe.protoelement
          const desc = pe.description
          dropdownOptions.push(name + ' ' + desc)
        })
        actingFunction(res.proto, dropdownOptions)
      } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function getScenesForPlayer (authToken:string, player:any, prj: any, actingFunction: any) {
  fetch(`/owl/segments/getScenes/${prj}?id=${player}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      // if successful
      if (res.success) {
        actingFunction(res.scenes)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function getBeatsForPlayer (authToken:string, player:any, prj: any, actingFunction: any) {
  fetch(`/owl/segments/getBeats/${prj}?id=${player}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      // if successful
      if (res.success) {
        actingFunction(res.beats)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function getChoicesForPlayer (authToken:string, player:any, prj: any, actingFunction: any) {
  fetch(`/owl/selfreports/getChoices/${prj}?id=${player}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    }
  })
    .then((res) => res.json())
    .then((res) => {
      // if successful
      if (res.success) {
        actingFunction(res.choices)
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}

export function addProtoElement(authToken: string, type: any, prjId: any, description: any, actingFunction: any) {
  fetch(`/owl/protoelements/addProto${type}/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      description: description
    })
  })
    .then((res) => res.json())
    .then((res) => {
      // if (res.success) {this.setState(prevState => ({protoElements: [...prevState["protoElements"], res.newProto]} as any));}
      // else throw res
      if (res.success) { actingFunction(res.newProto) } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function addScene (authToken:string, playerId:any, prjId:any, frame1:any, frame2:any, protoScene:any) {
  fetch(`/owl/segments/addScene/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      testSubject: playerId,
      frame1: frame1,
      frame2: frame2,
      protoScene: protoScene
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function addBeat (authToken:string, playerId:any, prjId:any, frame1:any, frame2:any, protoBeat:any) {
  console.log({
    testSubject: playerId,
    frame1: frame1,
    frame2: frame2,
    protoBeat: protoBeat
  })

  fetch(`/owl/segments/addBeat/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      testSubject: playerId,
      frame1: frame1,
      frame2: frame2,
      protoBeat: protoBeat
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function addChoice (authToken:string, playerId:any, prjId:any, frame1:any, protoChoice:any) {
  fetch(`/owl/selfreports/addChoice/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      testSubject: playerId,
      frame1: frame1,
      protoChoice: protoChoice
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteProtoScene (authToken:string, prjId:any, proto:any, actingFunction:any) {
  fetch(`/owl/protoelements/deleteProtoScene/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      ProtoScene: proto
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) { actingFunction() } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteProtoBeat (authToken:string, prjId:any, proto:any, actingFunction:any) {
  fetch(`/owl/protoelements/deleteProtoBeat/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      ProtoBeat: proto
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) { actingFunction() } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteProtoChoice (authToken:string, prjId:any, proto:any, actingFunction:any) {
  fetch(`/owl/protoelements/deleteProtoChoice/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      ProtoChoice: proto
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) { actingFunction() } else throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteScene (authToken:string, prjId:any, scene:string, subject:any, actingFunction:any) {
  fetch(`/owl/segments/deleteScene/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      Scene: scene,
      testSubject: subject
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteBeat (authToken:string, prjId:any, beat:string, subject:any, actingFunction:any) {
  fetch(`/owl/segments/deleteBeat/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      beat: beat,
      testSubject: subject
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function deleteChoice (authToken:string, prjId:any, choice:string, subject:any, actingFunction:any) {
  fetch(`/owl/selfreports/deleteChoice/` + prjId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      choice: choice,
      testSubject: subject
    })
  })
    .then((res) => res.json())
    .then((res) => {
      if (!res.success) throw res
    })
    .catch((res) => { console.log(res) })
}

export function getAllTriples (prj: any) {
  fetch(`/owl/ajf/getalltriples/` + prj, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((res) => {
      // if successful
      if (res.success) {
        const content = JSON.stringify(res.triples)
        const uriContent = 'data:application/octet-stream,' + encodeURIComponent(content)
        window.open(uriContent, 'triples.txt')
      } else throw res
    })
    .catch((res) => {
      console.log(res)
    })
}
