import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Test from '../Test'
import VimeoTest from '../VimeoTest'
import ReceiveVimeoToken from '../ReceiveVimeoToken'
import PageNotFound from '../PageNotFound'
import ProtectedRoute from './ProtectedRoute'

const Home = React.lazy(() => import('../Home'))
const Study = React.lazy(() => import('../../components/Study'))
const Enroll = React.lazy(() => import('../Enroll'))
const Session = React.lazy(() => import('../Session'))
const SessionView = React.lazy(() => import('../SessionView'))
const Project = React.lazy(() => import('../Project'))
const Dashboard = React.lazy(() => import('../Dashboard'))
const Settings = React.lazy(() => import('../Settings'))
const Account = React.lazy(() => import('../Account'))
const LogView = React.lazy(() => import('../LogView'))
const Admin = React.lazy(() => import('../Admin'))

const AllRoutes = () => (
  <Switch>
    <Route exact path="/admin" component={Home} />
    <Route path="/study/:projectId/enroll" component={Enroll} />
    <Route path="/study/:projectId/:participantId/session" component={Session} />
    <ProtectedRoute path="/admin/study/:projectId/:participantId/sessionView" component={SessionView} />
    <ProtectedRoute path="/admin/manage/:projectId" component={Admin} />
    <ProtectedRoute path="/admin/logs/:participantId" component={LogView} />
    <ProtectedRoute path="/admin/project/:projectId" component={Project} />
    <ProtectedRoute path="/admin/dashboard" component={Dashboard} />
    <ProtectedRoute path="/admin/settings/:projectId" component={Settings} />
    <ProtectedRoute path="/admin/account" component={Account} />
    <ProtectedRoute exact path="/receiveVimeoToken" component={ReceiveVimeoToken} />
    <ProtectedRoute exact path="/VimeoTest" component={VimeoTest} />
    <Route component={PageNotFound} />
  </Switch>
)
AllRoutes.displayName = 'AllRoutes'
export default AllRoutes
