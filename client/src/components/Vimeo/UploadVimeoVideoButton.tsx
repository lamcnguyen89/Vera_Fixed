import React from 'react'
import { Button, Modal, Form, ProgressBar, Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
const Vimeo = require('vimeo').Vimeo
// import VimeoHelper from "../../helpers/VimeoHelper";

interface IUploadVimeoButtonProps {
    vimeoClient;
    /** Function to update state to hold video object to upload to DB */
    setVideoObjectToState?;
    vimeo?;
    /** Change the button name shown */
    buttonName?: string;
}

interface IUploadVimeoButtonState {
    showModal: boolean;
    videoTitle: string;
    videoDescription: string;
    videoFile; // specific video object
    uploadProgress: number;
    uploadButtonDisabled: boolean;
    alert: JSX.Element | null;
}

const promiseMessages = {
  videoUploaded: 'Video file sent to Vimeo',
  clientNotFound: 'Could not upload video to Vimeo. Please try signing into Vimeo.',
  transcodingComplete: 'Video finished transcoding. Upload complete.',
  transcodingInProgress: 'Vimeo is transcoding the video...',
  transcodingFailed: 'Your video encountered an error during transcoding.',
  processComplete: 'Video Successfully uploaded to Vimeo',
  processFailed: 'An error occurred and the video was no uploaded to Vimeo',
  informationNotFound: 'Could not find Vimeo information. Please sign into Vimeo.',
  TitleOrDescriptionNotFound: 'Please fill out both video title, and description.',
  uploadSuccess: 'Uploaded file to Vimeo'
}

class UploadVimeoButton extends React.Component<IUploadVimeoButtonProps, IUploadVimeoButtonState> {
  constructor (props: IUploadVimeoButtonProps) {
    super(props)

    this.state = {
      showModal: false,
      videoTitle: '',
      videoDescription: '',
      videoFile: '',
      uploadProgress: 0,
      uploadButtonDisabled: false,
      alert: null
    }
  }

    /** Toggle whether to view or hide the modal */
    toggleModal = () => {
      this.setState({ showModal: !this.state.showModal })
    }

    /** Returns null or the correct modal */
    getModalJSX = (): JSX.Element | null => {
      if (this.state.showModal) {
        return (
          <Modal show={this.state.showModal} onHide={this.toggleModal}>
            <Modal.Header>Upload video to Vimeo</Modal.Header>

            <Modal.Body>

              <Form.Group controlId="TitleForm">
                <Form.Label>Video title</Form.Label>
                <Form.Control onChange={(e): void => { this.setState({ videoTitle: e.target.value }) }} value={this.state.videoTitle} placeholder="Title" />
              </Form.Group>

              <Form.Group controlId="DescriptionForm">
                <Form.Label>Video Description</Form.Label>
                <Form.Control onChange={(e: any): void => this.setState({ videoDescription: e.target.value })} value={this.state.videoDescription} placeholder="Description" />
              </Form.Group>

              <Form.Group controlId="FileForm">
                <Form.Label>video file</Form.Label>
                <Form.Control onChange={(e: any) => this.setState({ videoFile: e.target.files[0] })} type="file" accept=".mp4"/>
              </Form.Group>

              {this.state.alert}
              {this.state.uploadProgress > 0 ? (<ProgressBar label={this.state.uploadProgress + '%'} now={this.state.uploadProgress}/>) : null}

            </Modal.Body>

            <Modal.Footer>
              <Button disabled={this.state.uploadButtonDisabled} onClick={this.handleUploadVideo}>Upload Video</Button>
              <Button onClick={() => this.setState({ alert: null, videoFile: '', uploadButtonDisabled: false, videoTitle: '', videoDescription: '', uploadProgress: 0 })}>Reset</Button>
              <Button onClick={this.toggleModal}>Cancel</Button>
            </Modal.Footer>

          </Modal>
        )
      } else {
        return null
      }
    }

    /** Handles submitting video file to vimeo */
    handleUploadVideo = () => {
      // disableButton so only one video is uploaded at a time. Stops errors from occurring.
      this.setState({ uploadButtonDisabled: true, uploadProgress: 0, alert: null })

      // see if the user is signed into vimeo, and we can upload videos
      // let client = VimeoHelper.getVimeoClient();
      const clientToken = this.props.vimeoClient._accessToken

      if (!clientToken) {
        console.log(promiseMessages.clientNotFound)
        this.setState({
          alert: <Alert variant="danger">{promiseMessages.informationNotFound}</Alert>,
          uploadButtonDisabled: false
        })
      } else if (this.state.videoTitle === '' || this.state.videoDescription === '') {
        this.setState({
          alert: <Alert variant="danger">{promiseMessages.TitleOrDescriptionNotFound}</Alert>,
          uploadButtonDisabled: false
        })
      } else {
        const client = new Vimeo('', '', clientToken)

        this.uploadPromiseMethod(client)
          .then((uri: string) => {
            this.setState({
              uploadButtonDisabled: false,
              alert: <Alert variant="success">{promiseMessages.uploadSuccess}</Alert>
            })

            const videoId = uri.match(/\d+/g).map(Number)[0]

            // get full video object
            client.request({
              method: 'GET',
              path: ('/videos/' + videoId)
            }, (error: any, body: any, statusCode: number) => {
              if (statusCode === 200) {
                console.log(body)
                if (this.props.setVideoObjectToState) {
                  this.props.setVideoObjectToState(body)
                }
              } else {
                console.log(error)
              }
            })
            console.log(uri)
            console.log(videoId)
          })
      }
    }

    /** Handles first part of uploading video to Vimeo. */
    uploadPromiseMethod = (client: any): Promise<string> => {
      return new Promise((resolve, reject) => {
        // start uploading video to Vimeo...
        client.upload(
          this.state.videoFile,
          {
            name: this.state.videoTitle,
            description: this.state.videoDescription

          }, (uri: string) => {
            console.log('Video uri is', uri)
            resolve(uri)
          }, (bytesUploaded: number, bytesTotal: number) => {
            const percentage = parseInt((bytesUploaded / bytesTotal * 100).toFixed(2))
            this.setState({ uploadProgress: percentage })
            // console.log(bytes_uploaded, bytes_total, percentage + '%')
          }, (err: string) => {
            console.log(err)

            if (err === 'Unable to locate file to upload.') {
              this.setState({
                alert: <Alert variant="danger">{err}</Alert>,
                uploadButtonDisabled: false
              })
            } else {
              this.setState({
                alert: <Alert variant="danger">An error occurred while uploading the video. Video not uploaded to Vimeo.</Alert>,
                uploadButtonDisabled: false
              })
            }

            reject(err)
          }
        )
      })
    }

    render () {
      const modal = this.getModalJSX()

      return (
        <div>
          {modal}
          <Button onClick={this.toggleModal}>
            {this.props.buttonName ? this.props.buttonName : 'Upload Video to Vimeo'}
          </Button>
        </div>
      )
    }
}

export default connect((state: any) => ({ vimeoClient: state.vimeo.client }))(UploadVimeoButton)
