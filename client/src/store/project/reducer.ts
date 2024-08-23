import Project from '../../interfaces/Project'

const initialState: any = {
  arr: [],
  ids: [],
  loading: false,
  selectedProjectId: ''
}

export default (state = initialState, { type, payload }: any): any => {
  switch (type) {
    case 'START_API_CALL_PROJECT':
      return {
        ...state,
        loading: true
      }
    case 'END_API_CALL_PROJECT':
      return {
        ...state,
        loading: false
      }

    case 'SET_SELECTED_PROJECT_ID':
      return {
        ...state,
        selectedProjectId: payload
      }
    case 'ADD_PROJECTS': {
      const anyNewProjects = () => payload
        .map((p: Project) => p._id) // get ids from payload
        .some((payloadId: string) => !state.ids.includes(payloadId)) // do any of those ids now exist in redux `ids` array
      if (payload && anyNewProjects()) {
        return {
          ...state,
          arr: [...state.arr, ...payload.filter((p: Project) => !state.ids.includes(p._id))],
          ids: [...state.ids, ...payload.map((p: Project) => p._id).filter((id: string) => !state.ids.includes(id))]
        }
      } else return state
    }
    case 'REMOVE_PROJECTS':
      if (payload && state.ids.some((idThatExists: string) => payload.includes(idThatExists))) {
        return {
          ...state,
          arr: state.arr.filter((p: any) => !payload.includes(p._id)),
          ids: state.ids.filter((id: string) => !payload.includes(id))
        }
      } else return state

    default:
      return state
  }
}
