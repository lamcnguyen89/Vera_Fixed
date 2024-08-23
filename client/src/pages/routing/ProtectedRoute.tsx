import { Route, Redirect, useHistory } from 'react-router-dom'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import React, { useCallback } from 'react'
import { faLongArrowAltUp } from '@fortawesome/free-solid-svg-icons'

import { persistedState } from '../..'
type AppDispatch = typeof persistedState.store.dispatch
type RootState = ReturnType<typeof persistedState.store.getState>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch (e) {
    return null
  }
}

const ProtectedRoute = ({ component: Component, ...props }: any) => {
  const history = useHistory()

  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const logOut = useCallback(() => {
    dispatch({ type: 'LOGOUT' }); history.replace('/admin')
  }, [dispatch])
  if (props.auth !== undefined && props.auth.token !== null) {
    const decodedJwt = parseJwt(props.auth.token.slice(7))
    // console.log("Token Expires on " + new Date(decodedJwt.exp*1000).toLocaleString())
    if (decodedJwt.exp * 1000 < Date.now()) {
      // Need to refresh token
      console.log("Token refresh needed!")
    }
  }
  let isAuthenticated = true
  if (auth !== undefined && auth.token !== null) {
    const decodedJwt = parseJwt(auth.token.slice(7))
    // console.log("Token Expires on " + new Date(decodedJwt.exp*1000).toLocaleString())
    if (decodedJwt.exp * 1000 < Date.now()) {
      // Need to refresh token
      console.log("Token refresh needed!")
      logOut()
      // props.logOut();
    } else {
      isAuthenticated = true
    }
  }
  return (
    <Route
      {...props}
      render={innerProps =>
        isAuthenticated
          ? <Component {...innerProps} />
          : <Redirect to="/admin" />
      }
    />
  )
}
ProtectedRoute.displayName = 'ProtectedRoute'
export default ProtectedRoute
