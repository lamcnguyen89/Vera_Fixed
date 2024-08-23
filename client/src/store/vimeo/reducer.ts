import {
  IVimeoState
} from './types'

const initialState: IVimeoState = {
  connected: false,
  token: '',
  videos: [],
  loading: false,
  client: null
}

export default (state = initialState, { type, payload }: any): IVimeoState => {
  switch (type) {
    case 'START_API_CALL_VIMEO':
      return {
        ...state,
        loading: true
      }
    case 'END_API_CALL_VIMEO':
      return {
        ...state,
        loading: false
      }

    case 'SET_VIMEO_TOKEN':
      return {
        ...state,
        token: payload,
        connected: true
      }

    case 'SET_VIMEO_CLIENT':
      return {
        ...state,
        client: payload
      }
    case 'CLEAR_VIMEO_CONNECTION':
      return {
        ...state,
        token: '',
        connected: false,
        client: null
      }

    default:
      return state
  }
}
