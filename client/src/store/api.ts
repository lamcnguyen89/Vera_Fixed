import { persistedState } from "../index";
// import { type } from 'os'
import localforage from "localforage";
const store = persistedState.store;
const dispatch = store.dispatch;

export const getAllPlayers = () =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/study/players/",
      token: store.getState().auth.token,
      callType: "PLAYERS",
      actionType: "GET_PLAYERS",
    },
  });
export const getAllProjects = () =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/projects/GetAllCreatedProjects",
      token: store.getState().auth.token,
      callType: "PROJECT",
      actionType: "ADD_PROJECTS",
      getPayloadFromResult: (res: any) =>
        res.projects
          .filter((p: any) => p.users.includes(store.getState().auth.id))
          .map((p: any) => ({ status: "creator", ...p })),
    },
  });

export const createProject = (prjName: string) =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/projects/CreateProject",
      token: store.getState().auth.token,
      callType: "PROJECT",
      body: { name: prjName },
      actionType: "ADD_PROJECT",
      getPayloadFromResult: (res: any) => res,
    },
  });

type userData = { email: string; password: string };
type onError = (error: { toString: { (): string; (): string } }) => void;

export const login = (body: userData, onError: onError) => {
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/users/login",
      token: store.getState().auth.token,
      callType: "AUTH",
      body,
      actionType: "SET_CURRENT_USER",
      getPayloadFromResult: (res: any) => ({
        token: res ? res.token : null,
        user: res ? res.payload : null,
      }),
      onCatch: onError,
    },
  });
};

type registerData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export const register = (
  body: registerData,
  onError: onError,
  onSuccess: any
) =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/users/register",
      token: store.getState().auth.token,
      callType: "USER",
      actionType: "REGISTER_USER",
      body,
      getPayloadFromResult: onSuccess,
      onCatch: onError,
    },
  });

// too large for local cache/redux, store in localForage (indexedDB)
export const getBio = (uid: string, t: "hr" | "sc", framerate?: number) =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/bio",
      token: store.getState().auth.token,
      callType: "BIO",
      body: {
        uid: uid,
        t: t,
        framerate: framerate || 30,
      },
      actionType: "SET_BIO",

      getPayloadFromResult: async (res: any) => {
        await localforage.setItem(uid + t, res.arr).catch(console.log);
        return uid + t;
      },
    },
  });

// upload csv, will be in req.body.data.file
export const putBio = (
  data: File,
  uid: 2 | 3 | 4 | 5 | 6 | 7,
  t: "hr" | "sc"
) =>
  dispatch({
    type: "API_CALL",
    payload: {
      route: "/api/bio/" + t + "/" + uid,
      token: store.getState().auth.token,
      callType: "BIO",
      contentType: "text/csv",
      body: data,
      actionType: "SET_BIO",

      getPayloadFromResult: async (/* res: any */) => {
        // debugger
      },
    },
  });
