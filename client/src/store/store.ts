import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
// import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import thunk from 'redux-thunk'
import authReducer from './auth/reducer'
import vimeoReducer from './vimeo/reducer'
import projectReducer from './project/reducer'
import bioReducer from './bio/reducer'

import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()

const middleware = [thunk, sagaMiddleware]

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(
  persistConfig
  , combineReducers({
    auth: authReducer,
    vimeo: vimeoReducer,
    project: projectReducer,
    bio: bioReducer
  })
)
// eslint-disable-next-line no-underscore-dangle

export default () => {
  let store = createStore(
      persistedReducer
      , compose(
        applyMiddleware(...middleware)
        , ((window as any).__REDUX_DEVTOOLS_EXTENSION__ ? (window as any).__REDUX_DEVTOOLS_EXTENSION__() : (a:any) => a)
      )
    )
    sagaMiddleware.run(rootSaga)
  let persistor = persistStore(store)
  return {store, persistor}
}

