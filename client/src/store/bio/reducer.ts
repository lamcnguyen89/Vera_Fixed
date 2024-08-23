import {
  IBioState
} from './types'

const initialState: IBioState = {
  loading: false,
  uids: []
}

export default (state = initialState, { type, payload }: any): IBioState => {
  switch (type) {
    case 'START_API_CALL_BIO':
      return {
        ...state,
        loading: true
      }
    case 'END_API_CALL_BIO':
      return {
        ...state,
        loading: false
      }

    case 'SET_BIO':
      return {
        ...state,
        uids: [...state.uids, payload]
      }

    default:
      return state
  }
}
