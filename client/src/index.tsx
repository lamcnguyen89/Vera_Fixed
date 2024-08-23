import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import './styles/dashboard.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import "../node_modules/react-loader-spinner/dist/loader/css/react-spinner-loader.css"

import { PersistGate } from 'redux-persist/integration/react'
import createPersistedState from './store/store'
import Loading from './components/Loading'

export const persistedState = createPersistedState()

ReactDOM.render(
  <Provider store={persistedState.store}>
    <PersistGate loading={<Loading />} persistor={persistedState.persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
  , document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
