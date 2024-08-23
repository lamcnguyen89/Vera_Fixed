import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import "../../styles/VideoPlayer.css";
import PropTypes from "prop-types";

class VideoContainer extends Component {
  render() {
    const { selectedSubjects, formatTime } = this.props;

    return (
      <Row style={{ backgroundColor: "black" }}>
        {selectedSubjects.map((subject, index) => {
          const vidId = subject.vimeoVideos[0].uri.split("/")[2];
          const duration = subject.vimeoVideos[0].duration;
          return (
            <Col
              id={`videoSlot${index}`}
              key={`videoSlot${index}-${subject.playerName}`}
              style={{ width: "0px" }}
            >
              <iframe
                title="video"
                src={`https://player.vimeo.com/video/${vidId}?autopause=0&controls=false`}
                width="640"
                height="360"
                frameBorder="0"
                allow="autoplay; fullscreen"
                autopause={0}
                allowFullScreen
              ></iframe>
              <br></br>
              <div
                id={`videoDesc${index}`}
                className="text-center"
                style={{ color: "white", fontSize: "20px" }}
              >{`video-${index + 1} : ${subject.vimeoVideos[0].name}`}</div>
              <br></br>
              <div
                className="text-center"
                style={{ color: "white", fontSize: "20px" }}
              >
                <span id={`videoCurrentTime${index}`}>00:00</span> |{" "}
                <span>{formatTime(duration)}</span>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  }
}
VideoContainer.propTypes = {
  selectedSubjects: PropTypes.array,
  formatTime: PropTypes.func,
};

export default VideoContainer;
