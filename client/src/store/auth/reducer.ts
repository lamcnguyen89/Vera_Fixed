const initialState: any = {
  loading: false,
  isAuthenticated: false,
  token: null,
};

export default (state = initialState, action: any): any => {
  switch (action.type) {
    case "START_API_CALL_AUTH":
      return {
        ...state,
        loading: true,
      };
    case "END_API_CALL_AUTH":
      return {
        ...state,
        loading: false,
      };

    case "SET_CURRENT_USER":
      return {
        ...state,
        isAuthenticated: !!action.payload,
        token: action.payload ? action.payload.token : null,
        ...(action.payload ? action.payload.user : {}),
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        token: null,
      };

    default:
      return state;
  }
};
