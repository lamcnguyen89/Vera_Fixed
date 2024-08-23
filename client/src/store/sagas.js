import { put, takeEvery, all } from 'redux-saga/effects'

function * apiCall ({ payload }) {
  yield put({ type: 'START_API_CALL_' + payload.callType, payload })

  console.log(payload)
  const returnedPayload = yield fetch(`` + payload.route, {
    method: payload.method || 'POST',
    headers: {
      'Content-Type': payload.contentType || 'application/json',
      Authorization: payload.token
    },
    body: payload.contentType === 'text/csv'
      ? payload.body
      : JSON.stringify(payload.body)
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) throw res
      return payload.getPayloadFromResult(res)
    })
    .catch(payload.onCatch || ((res, err) => console.log('sagaError', res, err)))

  yield put({ type: payload.actionType, payload: returnedPayload })
  yield put({ type: 'END_API_CALL_' + payload.callType })
}

// function* getBio({ payload }) {
//   yield put({ type: "START_API_CALL_BIO", payload})

//   // const bioSample = yield fetch("/BioSample", {
//   //   method: "POST"
//   //   ,headers: {
//   //       'Content-Type': 'application/json',
//   //       Authorization: payload.token
//   //   }
//   // })
//   //   .then(res => res.json())
//   //   .then(res => res)
//   //   .catch((err) => console.log("couldn't get bioSample; error: ", err));

//   // yield put({ type: "SET_BIO", payload: bioSample })

//   const bioAll = yield fetch("/BioAll", {
//     method: "POST"
//     ,headers: {
//         'Content-Type': 'application/json',
//         Authorization: payload.token
//     }
//     ,body: JSON.stringify(payload)
//   })
//     .then(res => res.json())
//     .then(res => {console.log(res); return res})
//     .catch((err) => console.log("couldn't get allBio; error: ", err));

//   yield put({ type: "SET_BIO", payload: bioAll })

//   yield put({ type: "END_API_CALL_BIO" })

// }

function * watchApiCall () {
  yield takeEvery('API_CALL', apiCall)
}

// function* watchGetBio() {
//   yield takeEvery('GET_BIO', getBio)
// }

export default function * rootSaga () {
  yield all([
    watchApiCall()
    // ,watchGetBio()
  ])
}
