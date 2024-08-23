import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import constants from '../../constants/constants'

interface IVimeoLoginProps {

}

interface IVimeoLoginState {
    showModal: boolean;
}

/** Will take them to the login process, even if they're already logged in */
export default class VimeoLoginButton extends React.Component<IVimeoLoginProps, IVimeoLoginState> {
  constructor (props: IVimeoLoginProps) {
    super(props)

    this.state = {
      showModal: false
    }
  }

    /** Toggles modal visibility */
    toggleModalVisibility = () => {
      this.setState({ showModal: !this.state.showModal })
    }

    render () {
      let modal = null
      if (this.state.showModal) {
        modal = (
          <Modal show={this.state.showModal} onHide={this.toggleModalVisibility}>

            <Modal.Header>
              <Modal.Title>
                            Login to Vimeo
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                        Body of modal
            </Modal.Body>

            <Modal.Footer>
              <button onClick={this.toggleModalVisibility}>Cancel</button>
              <button>Sign in</button>
            </Modal.Footer>

          </Modal>
        )
      }

      const hrefString = (
        'https://api.vimeo.com/oauth/authorize?response_type=code&client_id=' +
            constants.ClientIdentifier + '&redirect_uri=' + constants.localVimeoRedirectUri + '&scope=public private upload edit'
      )

      return (
        <div>
          {modal}
          <Button variant="primary"><a style={{ color: 'white', textDecoration: 'none' }} href={hrefString}>Login To Vimeo</a></Button>
        </div>
      )
    }
}
