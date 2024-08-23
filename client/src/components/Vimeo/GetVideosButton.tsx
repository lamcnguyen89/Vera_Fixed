import React from 'react'
import { Button, Card, Modal, Form } from 'react-bootstrap'
import VimeoLoginButton from './VimeoLoginButton'
import { connect } from 'react-redux'

interface IGetVideosButtonState {
    videoList: Array<any>;
    showModal: boolean;
    errorMessage: null | string;
    searchString: string;
    clickedVideos: Array<number>;
    currPage: number;
    lastPage: number;
    firstPage: number;
    nextPage: number | null;
    prevPage: number | null;
    loadingVideos: boolean;
    sendingInProgress: boolean;
    sendingResult: string;

}

interface IGetVideosButtonProps {
    vimeoClient: any;
    projectId: string;
    playerId: string;
    auth: string;
}

interface vimeoGetVideoResponse {
    data: Array<any>;
    page: number;
    paging: {
        first: string | null;
        last: string | null;
        next: string | null;
        previous: string | null;
    }
    // eslint-disable-next-line camelcase
    per_page: number;
    total: number;
}

const errorMessages = {
  notSignedIn: 'No Vimeo information found. Sign into Vimeo first before trying to get videos.',
  couldNotGetVideos: 'An error occurred. Could not get videos. Try signing into Vimeo again.',
  noVideosFound: 'No videos found.',
  unknownError: 'An unkown error occurred.',
  couldNotSendSelection: 'An error occurred. Could not save selected videos.',
  videoSelectionSent: 'Selected videos successfully sent.'
}

/** This button is for a user who has already signed into vimeo and wants to get their video selections to use on this website */
class GetVideosButton extends React.Component<IGetVideosButtonProps, IGetVideosButtonState> {
  constructor (props: IGetVideosButtonProps) {
    super(props)

    this.state = {
      videoList: [],
      showModal: false,
      errorMessage: null,
      searchString: '',
      clickedVideos: [],
      currPage: 1,
      lastPage: 1,
      firstPage: 1,
      nextPage: null,
      prevPage: null,
      loadingVideos: false,
      sendingInProgress: false,
      sendingResult: ''
    }
  }

    /** User pressed button to get videos. */
    handleGetVideosClick = (pageNum: number) => {
      if (typeof pageNum !== 'number' || pageNum < this.state.firstPage || pageNum > this.state.lastPage || !pageNum) {
        return
      }

      // Getting vimeo object from helper
      const vimeoObject = this.props.vimeoClient

      this.setState({ loadingVideos: true })

      // an error occurred and couldn't get the user's Vimeo object
      if ((vimeoObject && vimeoObject.error) || !vimeoObject) {
        this.setState({ errorMessage: errorMessages.notSignedIn })
      } else {
        // make request with user information to get Vimeo videos on their account
        vimeoObject.request({
          method: 'GET',
          path: ('/me/videos?page=' + pageNum)
        }, (error: any, body: vimeoGetVideoResponse, statusCode: number, headers: any) => {
          if (error) {
            this.setState({ errorMessage: errorMessages.couldNotGetVideos })
          } else if (body.data === null || body.total === 0 || body.total === null) {
            this.setState({ errorMessage: 'No videos found.' })
          } else if (statusCode === 200) { // status code "ok"
            const firstPage = body.paging.first as string
            const lastPage = body.paging.last as string
            let nextPage: string | null | number = body.paging.next
            let previousPage: string | null | number = body.paging.previous

            if (typeof nextPage === 'string') {
              nextPage = parseInt(nextPage.replace('/me/videos?page=', ''))
            }
            if (typeof previousPage === 'string') {
              previousPage = parseInt(previousPage.replace('/me/videos?page=', ''))
            }

            this.setState({
              videoList: body.data,
              errorMessage: null,
              currPage: body.page,
              firstPage: parseInt(firstPage.replace('/me/videos?page=', '')),
              lastPage: parseInt(lastPage.replace('/me/videos?page=', '')),
              nextPage: nextPage,
              prevPage: previousPage
            })
          } else {
            this.setState({ errorMessage: errorMessages.unknownError })
          }

          this.setState({ loadingVideos: false })
        })
      }
      // open modal to either show error message or list of videos
      this.setState({ showModal: true })
    }

    toggleModalVisibility = () => {
      this.setState({ showModal: !this.state.showModal })
    }

    /** Returns modal shown to user */
    getModalJSX = (): null | JSX.Element => {
      // tell user we were not able to get their videos, or not videos available yet
      if (this.state.showModal && (this.state.errorMessage || this.state.videoList.length < 1)) {
        return (
          <Modal show={this.state.showModal} onHide={this.toggleModalVisibility}>

            <Modal.Body>
              {this.state.errorMessage}
            </Modal.Body>

            <Modal.Footer>
              <Button onClick={this.toggleModalVisibility}>Close</Button>
              {this.state.errorMessage === errorMessages.notSignedIn ? <VimeoLoginButton /> : null}
            </Modal.Footer>
          </Modal>
        )
      } else if (this.state.showModal) { // show videos
        const backgroundColor = this.state.sendingResult === errorMessages.videoSelectionSent
          ? '#33cc33'
          : '#ff5959'

        // show video list. Will usually have two columns per row. Depends on user's screen size
        const videoList = this.state.videoList.map((videoObject, idx: number) => {
          // user search matched this video's title
          if (videoObject.name.includes(this.state.searchString)) {
            // TODO: Make this prettier...
            // if user wants this video, background color will be green
            const cardStyle = { margin: '10px', maxHeight: '280px', width: '18rem', backgroundColor: 'white' }
            if (this.state.clickedVideos.includes(idx)) {
              cardStyle.backgroundColor = '#54DC33'
            }

            return (
              <Card onClick={() => this.addOrRemoveFromVideoList(idx)} key={idx} style={cardStyle}>
                <Card.Img variant="top" src={videoObject.pictures.sizes[2].link} />
                <Card.Body>
                  <Card.Title>Title: {videoObject.name}</Card.Title>
                  <Card.Text>
                                    Description: {videoObject.description === null ? 'None' : videoObject.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            )
          } else {
            return null
          }
        })

        return (
          <Modal size="lg" show={this.state.showModal} onHide={this.toggleModalVisibility}>

            <Modal.Header>
              <Form.Group style={{ width: '75%' }} controlId="VideoTitleSearch">
                <Form.Label>Search for a video title in this page</Form.Label>
                <Form.Control value={this.state.searchString} onChange={(event: any) => this.setState({ searchString: event.target.value })} placeholder="search here..." type="text" />
                <div style={{ marginTop: '15px', marginBottom: '5px' }}>Page: {this.state.currPage + '/' + this.state.lastPage}</div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button onClick={() => this.handleGetVideosClick(this.state.prevPage as number)} disabled={!!((this.state.prevPage === null || this.state.loadingVideos))} title="Go to previous page">&larr;</Button>
                  <Form.Control disabled={this.state.loadingVideos} value={this.state.currPage.toString()} onChange={(e: any) => this.handleGetVideosClick(parseInt(e.target.value))} type="number" min={this.state.firstPage} max={this.state.lastPage} style={{ marginLeft: '5px', marginRight: '5px', width: '15%' }} />
                  <Button onClick={() => this.handleGetVideosClick(this.state.nextPage as number)} disabled={!!((this.state.nextPage === null || this.state.loadingVideos))} title="Go to next page">&rarr;</Button>
                </div>
              </Form.Group>
            </Modal.Header>

            <Modal.Body style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {this.state.loadingVideos ? 'Loading...' : videoList}
            </Modal.Body>

            <Modal.Footer>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <Button style={{ marginRight: '5px' }} onClick={this.toggleModalVisibility}>Close</Button>
                <Button style={{ marginRight: '5px' }} onClick={() => this.setState({ clickedVideos: [] })}>Reset selected Videos</Button>
                <Button style={{ marginRight: '5px' }} disabled={this.state.sendingInProgress} onClick={this.sendSelectedVideos}>{this.state.sendingInProgress ? 'Loading...' : 'Get Selected Videos'}</Button>
                {
                  !this.state.sendingResult ? null
                    : <div style={{ background: backgroundColor, color: 'white', borderRadius: '5px', padding: '5px', marginTop: '5px' }}>
                      {this.state.sendingResult}
                    </div>
                }
              </div>
            </Modal.Footer>
          </Modal>
        )
      } else {
        // show nothing
        return null
      }
    }

    /** Adds or removes videos that the user wants to see from clicked video list based on their clicks */
    addOrRemoveFromVideoList = (index: number) => {
      // remove video from list if its already on the list
      if (this.state.clickedVideos.includes(index)) {
        let list = this.state.clickedVideos
        list = list.filter((value) => {
          return value !== index
        })

        this.setState({ clickedVideos: list })
      } else {
        // add video onto the list
        const list = this.state.clickedVideos
        list.push(index)
        this.setState({ clickedVideos: list })
      }
    };

    /** Send selected Vimeo video objects to the DB. */
    sendSelectedVideos = () => {
      this.setState({ sendingInProgress: true, sendingResult: '' })

      const videoLinkList: Array<any> = []

      this.state.clickedVideos.forEach((val, idx) => {
        if (this.state.videoList[val]) {
          videoLinkList.push(this.state.videoList[val])
        }
      })

      fetch(`/api/players/AddVimeoJSON`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.props.auth
        },
        body: JSON.stringify({
          projectId: this.props.projectId,
          playerId: this.props.playerId,
          jsonArray: videoLinkList
        })
      })
        .then((res) => res.json())
        .then((res) => {
          this.setState({ sendingInProgress: false, sendingResult: errorMessages.videoSelectionSent })
          console.log(res)
        })
        .catch((res) => {
          console.log(res)
          this.setState({ sendingInProgress: false, sendingResult: errorMessages.couldNotSendSelection })
        })
    }

    render () {
      const modal = this.getModalJSX()

      return (
        <div>
          {modal}
          <Button onClick={() => this.handleGetVideosClick(this.state.currPage)}>Get Vimeo Videos</Button>
        </div>
      )
    }
}

export default connect((state:any) => ({ vimeoClient: state.vimeo.client }))(GetVideosButton)
