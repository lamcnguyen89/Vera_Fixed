import React, { Component } from 'react'
import { Toast } from 'react-bootstrap'

interface toastProps {
    visible: boolean;
    changeState: any;
}

export default class ToastNotification extends Component<toastProps> {
  render () {
    return (
      <Toast show={this.props.visible} onClose={this.props.changeState} autohide
        style={{
          position: 'absolute',
          top: 0,
          right: 0
        }}>
        <Toast.Header closeButton={false}>
          <strong className="mr-auto" style={{ fontSize: '18px' }}>Welcome to Sherlock</strong>
        </Toast.Header>
        <Toast.Body style={{ fontSize: '18px' }}>Your registration was successful!</Toast.Body>
      </Toast>
    )
  }
}
