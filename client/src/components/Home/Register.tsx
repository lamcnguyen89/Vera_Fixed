import React from 'react'
import { connect } from 'react-redux'
import { register } from '../../store/api'

interface IRegisterProps {
  auth: any
  toggle: any;
  toast: any;
  dispatch: any;
}

interface IRegisterState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  errorMessage: string | null;
  isLoading: boolean;
}

type FormElement = React.FormEvent<HTMLFormElement>;
type InputElement = React.ChangeEvent<HTMLInputElement>;
const REGISTER = 'Register'

const errorMessages = {
  passwordsDontMatch: 'Passwords do not match. Please try again.',
  cannotConnect: 'Unable to connect. Check your network connection.',
  emailTaken: 'This email is already registered to an existing account.',
  unknownError: 'An unknown error occurred. Please refresh the page and try again.',
  formNotAllFilled: 'Please fill out every field above.',
  minPassRequirements: 'Password must have at least 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character'
}

class Register extends React.Component<IRegisterProps, IRegisterState> {
  constructor (props: IRegisterProps) {
    super(props)

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: null,
      isLoading: false
    }
  }

    onChange = (e:InputElement) => {
      this.setState({
        [e.currentTarget.name]: e.currentTarget.value
      } as unknown as { [K in keyof IRegisterState]: IRegisterState[K] })
    }

    onSubmit = (e:FormElement):void => {
      e.preventDefault()

      // Check if passwords match or not
      if (this.state.confirmPassword !== this.state.password) {
        this.setState({ errorMessage: errorMessages.passwordsDontMatch })
        return
      } else if ( // Check if something wasn't filled out
        !this.state.confirmPassword ||
            !this.state.email ||
            !this.state.firstName ||
            !this.state.lastName ||
            !this.state.password) {
        this.setState({ errorMessage: errorMessages.formNotAllFilled })
        return
      }

      // reset error message
      this.setState({ errorMessage: null, isLoading: true })

      const inputData = {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        password: this.state.password,
        type: REGISTER
      }

      const onError = (err: any) => {
        this.setState({ isLoading: false })
        if (err.toString() === 'Email already exists') { this.setState({ errorMessage: errorMessages.emailTaken }) } else if (err.toString() === 'TypeError: Failed to fetch') { this.setState({ errorMessage: errorMessages.cannotConnect }) } else if (err.toString() === 'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character') { this.setState({ errorMessage: errorMessages.minPassRequirements }) } else { this.setState({ errorMessage: errorMessages.unknownError }) }
      }

      const onSuccess = (res: any) => {
        this.setState({ isLoading: false })
        this.props.toast()
        this.props.toggle()
        console.log('register successful, result: ', res)
      }

      register(inputData, onError, onSuccess)
    }

    render () {
      const alert = (
        this.state.errorMessage
          ? (<div className="home-inputs">
            <div style={{ background: '#ff5959', color: 'white', borderRadius: '5px', padding: '5px' }}>
              {this.state.errorMessage}
            </div>
          </div>)
          : null
      )

      return (
        <div style={{ height: '100%' }}>

          <form className="home-form" onSubmit={this.onSubmit}>
            <h1 className="home-title">Sign Up</h1>
            <div className="home-inputs">
              <label className="home-label">First Name</label>
              <input className="home-input" type="text" placeholder="Enter your first name" name="firstName" onChange={this.onChange}></input>
            </div>
            <div className="home-inputs">
              <label className="home-label">Last Name</label>
              <input className="home-input" type="text" placeholder="Enter your last name" name="lastName" onChange={this.onChange}></input>
            </div>
            <div className="home-inputs">
              <label className="home-label">Email</label>
              <input className="home-input" type="email" placeholder="Enter your email" name="email" onChange={this.onChange}></input>
            </div>
            <div className="home-inputs">
              <label className="home-label">Password</label>
              <input className="home-input" type="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" name="password" onChange={this.onChange}></input>
            </div>
            <div className="home-inputs">
              <label className="home-label">Confirm Password</label>
              <input className="home-input" type="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;" name="confirmPassword" onChange={this.onChange}></input>
            </div>
            {alert}
            <div className="home-inputs">
              <button type="submit" className="btn home-btn">{this.state.isLoading ? 'Loading...' : 'Sign Up'}</button>
            </div>
          </form>

        </div>
      )
    }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, dispatch => ({ dispatch: dispatch }))(Register)
