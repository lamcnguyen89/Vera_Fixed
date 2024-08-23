import React from 'react'
import '../styles/VideoPlayer.css'
import '../styles/App.css'

interface IVideoPlayerProps {
  source: string;
}

const VideoPlayer = (props:IVideoPlayerProps) => {
  return (
    <div className="video-player">
      <video width="320" height="240" controls>
        <source src={props.source} type="video/mp4" />
        <p>Your browser does not support the video tag.</p>
      </video>
      {/* <video ref="vidRef" width="560" height="315" controls
      >
        <source id="testVideo" src="https://player.vimeo.com/external/368138282.hd.mp4?s=bcdf09d4889c81d4ae697ac92327c5b122a9e438&profile_id=174" type="video/mp4" />
      </video> */}
    </div>
  )
}

export default VideoPlayer
