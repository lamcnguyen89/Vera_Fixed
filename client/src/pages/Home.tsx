import React, { useState, useEffect } from 'react'
import '../styles/App.css'
import '../styles/Home.css'
import LoginForm from '../components/Home/Login'
import RegisterForm from '../components/Home/Register'
import ToastNotification from '../components/ToastNotification'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'
import newLogoRed from '../assets/VERA-logo-main-300x157.png'
interface IHomeState {
  showLoginForm: boolean
  showToast: boolean
}

const Home = () => {
  const [showLoginForm, setShowLoginForm] = useState(true)
  const [showToast, setShowToast] = useState(false)

  const history = useHistory()
  const { isAuthenticated } = useSelector((state: any) => state.auth)
  useEffect(() => {
    if (isAuthenticated) history.replace('/admin/Dashboard')
  }, [isAuthenticated, history]) // only re-run effect if isAuthenticated changes; history should never change

  // Toggle between login and register
  const toggleForm = () => setShowLoginForm(!showLoginForm)
  // Toggle the toast upon registration
  const toggleToast = () => setShowToast(!showToast)

  return (
    <div className="row container-fluid full-height">
      <div className="col-md-7" id="home-left-box">
        <div className="home-inner-box">
          <img src={newLogoRed} alt="Sherlock Logo" />
          <h3 id="home-subtitle">Virtual Experience Research Accelerator </h3>
          <p id="home-description">This is a research tool that helps researchers record study data related to VR experiments.</p>
        </div>
      </div>

      <div className="col-md-5 border">
        <div className="home-inner-box">
          <ToastNotification
            visible={showToast}
            changeState={toggleToast}
          />
          {showLoginForm ?
            <div style={{ height: '100%' }}>
              <LoginForm />
              <button className="home-link" onClick={toggleForm}>New to VERA? Sign up.</button>
            </div>
            : <div style={{ height: '100%' }}>
              <RegisterForm
                toggle={toggleForm}
                toast={toggleToast}
              />
              <button className="home-link" onClick={toggleForm}>Sign in.</button>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

Home.displayName = 'Home'
export default Home
