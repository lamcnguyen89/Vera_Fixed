export function getVimeoVideos (vimeoObject: any, actingFunction: any) {
  interface vimeoGetVideoResponse {
    data: any;
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

  vimeoObject.request({
    method: 'GET',
    path: ('/me/videos?page=' + 1)
  }, (error: any, body: vimeoGetVideoResponse) => {
    if (error) {
      console.error(error)
      throw error
    }
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
    console.log(body.data)
    actingFunction(body.data, body.page, parseInt(firstPage.replace('/me/videos?page=', '')), parseInt(lastPage.replace('/me/videos?page=', '')), nextPage, previousPage)
  })
}

export function sendSelectedVideos (selectedVid:any, authToken:any, prjId:any, playerId: any) {
  // this.setState({sendingInProgress: true, sendingResult: ""});
  const videoLinkList: Array<any> = []
  videoLinkList.push(selectedVid)
  // this.state.clickedVideos.forEach((val, idx) => {
  //     if (this.state.videoList[val]) {
  //         videoLinkList.push(this.state.videoList[val]);
  //     }
  // });
  fetch(`/api/players/AddVimeoJSON`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authToken
    },
    body: JSON.stringify({
      projectId: prjId,
      jsonArray: videoLinkList,
      playerId: playerId
    })
  })
    .then((res) => res.json())
    .then((res) => {
      // this.setState({sendingInProgress: false, sendingResult: errorMessages.videoSelectionSent});
      console.log(res)
    })
    .catch((res) => {
      console.log(res)
      // this.setState({sendingInProgress: false, sendingResult: errorMessages.couldNotSendSelection});
    })
}
