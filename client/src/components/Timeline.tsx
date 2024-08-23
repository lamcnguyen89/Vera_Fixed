import React from "react";
import "../styles/Timeline.css";
import "../styles/App.css";
// import testdata from '../assets/test-data.png'
// import classNames from 'classnames'
import { Row, Col, Tooltip, OverlayTrigger } from "react-bootstrap";
import SceneAnnotation from "./Annotations/SceneAnnotation";
import BeatAnnotation from "./Annotations/BeatAnnotation";
import ChoiceAnnotation from "./Annotations/ChoiceAnnotation";
import { connect } from "react-redux";
import GeneralModal from "./GeneralModal";
import hotKeys from "../constants/HotKeys";
import {
  getProtoScenes,
  getProtoBeats,
  getProtoChoices,
  getScenesForPlayer,
  getBeatsForPlayer,
  getChoicesForPlayer,
  addScene,
  addBeat,
  addChoice,
} from "../helpers/OwlAPIs";
import {
  convertAllFramesToTimestamps,
  getTimestampInSeconds,
  secondsToTimestamp,
  getFrameFromTimestamp,
} from "../helpers/TimelineHelpers";
import Chart from "./Chart";

interface ITimelineProps {
  project: any;
  playerData: any;
  playerName: String;
  playerId: any;
  currentAnnotationType: string;
  renderTypes: any;
  match: any;
  index: any;
  auth: any;
  duration: any;
}

interface ITimelineState {
  leftOffset: number;
  videoLength: number;
  secondsPerPixel: number;
  annotationTimes: any;
  firstClick: any;
  protoElements: any;
  showModal: boolean;
  modalHeader: any;
  modalElements: Array<any>;
  modalFunction: string;
  modalTxt: any;
  modalFormState: string;
  row1: Array<any>;
  row2: Array<any>;
  row3: Array<any>;
  footer: Array<any>;
  items: any;
  hoverX: any;
}

type ClickEvent = React.MouseEvent<HTMLDivElement>;
class Timeline extends React.Component<ITimelineProps, ITimelineState> {
  private timeline: React.RefObject<HTMLDivElement>;

  constructor(props: ITimelineProps) {
    super(props);
    this.timeline = React.createRef();
    this.state = {
      hoverX: 0,
      leftOffset: 0,
      videoLength: this.props.duration,
      secondsPerPixel: 0,
      annotationTimes: {
        sceneTimes: [],
        beatTimes: [],
        choiceTimes: [],
      },
      firstClick: {
        hasBeenClickedOnce: false,
        timestamp: "00:00:00",
      },
      protoElements: [],

      showModal: false,
      modalHeader: "",
      modalFunction: "",
      modalFormState: "",
      modalElements: [],
      modalTxt: "",
      row1: [],
      row2: [],
      row3: [],
      footer: [],
      items: {},
    };
  }

  componentDidMount() {
    this.calcTimelinePositioning();
    this.getAllProtoScenes();
    this.getAllProtoBeats()
    this.getAllProtoChoices()
    this.getAllScenesForPlayer()
    this.getAllBeatsForPlayer()
    this.getAllChoicesForPlayer()
    document.body.addEventListener("keydown", this.escapeAnnotation);
  }

  // ---------------- render annotation api calls --------------------
  getAllProtoScenes = () => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const state = (protoele: any, items: any) =>
      this.setState({
        protoElements: protoele,
        items: { ...this.state.items, Scene: items },
      });
    getProtoScenes(token, prj, state);
  };

  getAllProtoBeats = () => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const state = (protoele: any, items: any) =>
      this.setState({
        protoElements: protoele,
        items: { ...this.state.items, Beat: items },
      });
    getProtoBeats(token, prj, state);
  };

  getAllProtoChoices = () => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const state = (protoele: any, items: any) =>
      this.setState({
        protoElements: protoele,
        items: { ...this.state.items, Choice: items },
      });
    getProtoChoices(token, prj, state);
  };

  getAllScenesForPlayer = (): any => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    const state = (frames: any) =>
      this.setState((prevState) => ({
        annotationTimes: {
          ...prevState.annotationTimes,
          sceneTimes: convertAllFramesToTimestamps(
            "scene",
            "timeseries",
            frames
          ),
        },
      }));
    getScenesForPlayer(token, player, prj, state);
  };

  getAllBeatsForPlayer = (): any => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    const state = (frames: any) =>
      this.setState((prevState) => ({
        annotationTimes: {
          ...prevState.annotationTimes,
          beatTimes: convertAllFramesToTimestamps("beat", "timeseries", frames),
        },
      }));
    getBeatsForPlayer(token, player, prj, state);
  };

  getAllChoicesForPlayer = (): any => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    const state = (frames: any) =>
      this.setState((prevState) => ({
        annotationTimes: {
          ...prevState.annotationTimes,
          choiceTimes: convertAllFramesToTimestamps(
            "choice",
            "timestamp",
            frames
          ),
        },
      }));
    getChoicesForPlayer(token, player, prj, state);
  };

  // ---------------- add annotation api calls --------------------

  addTimestampAnnotation = (e: ClickEvent) => {
    const screenX = e.clientX;
    let timesArray: keyof ITimelineState["annotationTimes"];

    if (this.props.currentAnnotationType === "Choice") {
      timesArray = "choiceTimes";
    }

    // add annotation timestamp
    const timestamp = {
      time: secondsToTimestamp(
        (screenX - this.state.leftOffset) * this.state.secondsPerPixel
      ),
    };

    this.setState(
      (prevState) => ({
        annotationTimes: {
          ...prevState.annotationTimes,
          [timesArray]: [
            ...(prevState.annotationTimes[timesArray] || []),
            timestamp,
          ],
        },
      }),
      () => {
        const f1 = getFrameFromTimestamp(timestamp.time);
        this.handleAddAnnotation(f1, null);
      }
    );
  };

  addTimespanAnnotation = (e: ClickEvent) => {
    const screenX = e.clientX;
    let timesArray: keyof ITimelineState["annotationTimes"];
    let overlap = false;

    if (this.props.currentAnnotationType === "Scene") {
      timesArray = "sceneTimes";
    } else if (this.props.currentAnnotationType === "Beat") {
      timesArray = "beatTimes";
    }

    if (this.state.firstClick.hasBeenClickedOnce) {
      // setting end time
      const timeEnd: any = secondsToTimestamp(
        (screenX - this.state.leftOffset) * this.state.secondsPerPixel
      );
      // if trying to set an end before the start, return
      if (
        (screenX - this.state.leftOffset) * this.state.secondsPerPixel -
          getTimestampInSeconds(this.state.firstClick.timestamp) <
        0
      ) {
        return;
      }

      // check for overlap
      this.state.annotationTimes[timesArray].forEach((el: any) => {
        const prevEnd: any = new Date(Date.parse("1970-01-01 " + el.end));
        const prevStart: any = new Date(Date.parse("1970-01-01 " + el.start));
        const newEnd: any = new Date(Date.parse("1970-01-01 " + timeEnd));
        const newStart: any = new Date(
          Date.parse("1970-01-01 " + this.state.firstClick.timestamp)
        );

        if (prevEnd - newStart > 0 && newEnd - prevStart > 0) {
          overlap = true;
        }
      });

      if (!overlap) {
        // create scene with firstClick and current click
        const newTimespan = {
          start: this.state.firstClick.timestamp,
          end: timeEnd,
        };

        // add annotation
        const newTimespanTimes = this.state.annotationTimes[timesArray].slice();
        newTimespanTimes[newTimespanTimes.length - 1] = newTimespan;

        this.setState(
          (prevState) => ({
            annotationTimes: {
              ...prevState.annotationTimes,
              [timesArray]: newTimespanTimes,
            },
          }),
          () => {
            const f1 = getFrameFromTimestamp(this.state.firstClick.timestamp);
            const f2 = getFrameFromTimestamp(timeEnd);

            this.handleAddAnnotation(f1, f2);
          }
        );
      }
    } else {
      // setting start time
      const timeStart = secondsToTimestamp(
        (screenX - this.state.leftOffset) * this.state.secondsPerPixel
      );
      // check for overlap
      this.state.annotationTimes[timesArray].forEach((el: any) => {
        if (
          !(
            (new Date(Date.parse("1970-01-01 " + el.start)) >
              new Date(Date.parse("1970-01-01 " + timeStart)) &&
              new Date(Date.parse("1970-01-01 " + el.end)) >
                new Date(Date.parse("1970-01-01 " + timeStart))) ||
            (new Date(Date.parse("1970-01-01 " + el.start)) <
              new Date(Date.parse("1970-01-01 " + timeStart)) &&
              new Date(Date.parse("1970-01-01 " + el.end)) <
                new Date(Date.parse("1970-01-01 " + timeStart)))
          )
        )
          overlap = true;
      });

      if (!overlap) {
        // add the time start click
        const newAnnotation = { start: timeStart, end: timeStart };
        // set time start click so we can use its value to render annotation width on second click
        this.setState((prevState) => ({
          annotationTimes: {
            ...prevState.annotationTimes,
            [timesArray]: [
              ...(prevState.annotationTimes[timesArray] || []),
              newAnnotation,
            ],
          },
          firstClick: {
            hasBeenClickedOnce: true,
            timestamp: timeStart,
          },
        }));
      }
    }
  };

  addSceneAnnotation = (frame1: any, frame2: any): any => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    let protoScene = "1";

    if (this.state.modalFormState !== "") {
      protoScene = this.state.modalFormState.split(" ")[0].split("S")[1];
    }

    addScene(token, player, prj, frame1, frame2, protoScene);
    this.setState({
      firstClick: {
        hasBeenClickedOnce: false,
        timestamp: "00:00:00",
      },
      modalFormState: "",
    });
    this.toggleModal();
  };

  addBeatAnnotation = (frame1: any, frame2: any): any => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    let protoBeat = "1";

    if (this.state.modalFormState !== "") {
      protoBeat = this.state.modalFormState.split(" ")[0].split("B")[1];
    }

    addBeat(token, player, prj, frame1, frame2, protoBeat);
    this.setState({
      firstClick: {
        hasBeenClickedOnce: false,
        timestamp: "00:00:00",
      },
      modalFormState: "",
    });
    this.toggleModal();
  };

  addChoiceAnnotation = (frame1: any) => {
    const token = this.props.auth.token;
    const prj = this.props.match.params.projectId;
    const player = this.props.playerId;
    let protoChoice = "1";

    if (this.state.modalFormState !== "") {
      protoChoice = this.state.modalFormState.split(" ")[0].split("C")[1];
    }

    addChoice(token, player, prj, frame1, protoChoice);
    this.setState({ modalFormState: "" });
    this.toggleModal();
  };

  // ---------------- helper functions -----------------------------

  // starts positioning at left border of timeline and assigns a number of seconds per pixel
  calcTimelinePositioning = () => {
    this.setState({
      leftOffset: (window.innerWidth - this.timeline.current.offsetWidth) / 2,
      secondsPerPixel:
        this.state.videoLength / this.timeline.current.offsetWidth,
    });
  };

  getAnnotationXPosition = (timestamp: any) => {
    return getTimestampInSeconds(timestamp) / this.state.secondsPerPixel;
  };

  onSelect = (e: any) => {
    this.setState({ modalFormState: e.currentTarget.value });
  };

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal, modalFormState: "" });
  };

  // based on annotation type drop down selection, select div onClick function
  onAddStoryElement = () => {
    if (
      this.props.currentAnnotationType === "Scene" ||
      this.props.currentAnnotationType === "Beat"
    ) {
      return this.addTimespanAnnotation;
    }
  };

  onAddPlayerElement = () => {
    if (this.props.currentAnnotationType === "Choice") {
      return this.addTimestampAnnotation;
    }
  };

  cancelAddAnnotation = () => {
    this.toggleModal();
    let arrayType: any = null;
    if (this.props.currentAnnotationType === "Scene") {
      arrayType = "sceneTimes";
    } else if (this.props.currentAnnotationType === "Beat") {
      arrayType = "beatTimes";
    } else if (this.props.currentAnnotationType === "Choice") {
      arrayType = "choiceTimes";
    }

    let array = this.state.annotationTimes[arrayType];
    array = array.slice(0, array.length - 1);

    this.setState((prevState) => ({
      annotationTimes: {
        ...prevState.annotationTimes,
        [arrayType]: array,
      },
      firstClick: {
        hasBeenClickedOnce: false,
        timestamp: "00:00:00",
      },
    }));
  };

  escapeAnnotation = (e: any) => {
    if (e.code === hotKeys.escape) {
      let arrayType: any = null;
      if (this.props.currentAnnotationType === "Scene") {
        arrayType = "sceneTimes";
      } else if (this.props.currentAnnotationType === "Beat") {
        arrayType = "beatTimes";
      } else if (this.props.currentAnnotationType === "Choice") {
        arrayType = "choiceTimes";
      }

      let array = this.state.annotationTimes[arrayType];
      array = array.slice(0, array.length - 1);

      this.setState((prevState) => ({
        annotationTimes: {
          ...prevState.annotationTimes,
          [arrayType]: array,
        },
        firstClick: {
          hasBeenClickedOnce: false,
          timestamp: "00:00:00",
        },
      }));
    }
  };

  handleAnnotationRendering = () => {
    const annotationTypes = this.props.renderTypes;
    const annotationTimes = this.state.annotationTimes;

    return (
      <div className="annotations">
        <div
          className="timeline"
          ref={this.timeline}
          style={{ height: "50px" }}
          onClick={this.onAddStoryElement()}
        >
          {annotationTypes.forEach((type: any, index: any) => {
            if (type === "Scene") {
              return this.produceSceneAnnotations(annotationTimes);
            }
            if (type === "Beat") {
              return this.produceBeatAnnotations(annotationTimes);
            }
          })}
        </div>

        <div
          className="timeline"
          ref={this.timeline}
          style={{ height: "50px" }}
          onClick={this.onAddPlayerElement()}
        >
          {annotationTypes.forEach((type: any, index: any) => {
            if (type === "Choice") {
              return this.produceChoiceAnnotations(annotationTimes);
            }
          })}
        </div>
      </div>
    );
  };

  produceSceneAnnotations = (annotationTimes: any) => {
    const sceneTimes = annotationTimes.sceneTimes;

    sceneTimes.forEach((timeseries: any, index: any) => {
      const tsWidth = `${this.getAnnotationXPosition(timeseries.end) -
        this.getAnnotationXPosition(timeseries.start) +
        3}px`;
      return (
        <div key={index} style={{ position: "relative" }}>
          {" "}
          {/* Outer div allows relative positioned elements to overlap */}
          <div
            style={{
              display: "inline-block",
              height: "100%",
              top: "auto",
              left: this.getAnnotationXPosition(timeseries.start) + 1 + "px",
              position: "absolute",
            }}
          >
            <SceneAnnotation
              id={timeseries.id}
              width={tsWidth}
              match={this.props.match}
              subject={this.props.playerId}
            />
          </div>
        </div>
      );
    });
  };

  produceBeatAnnotations = (annotationTimes: any) => {
    const beatTimes = annotationTimes.beatTimes;

    beatTimes.map((timeseries: any, index: any) => {
      return (
        <div key={index} style={{ position: "relative" }}>
          {" "}
          {/* Outer div allows relative positioned elements to overlap */}
          <div
            style={{
              display: "inline-block",
              height: "100%",
              top: "auto",
              left: this.getAnnotationXPosition(timeseries.start) + 1 + "px",
              position: "absolute",
            }}
          >
            <BeatAnnotation
              id={timeseries.id}
              width={
                this.getAnnotationXPosition(timeseries.end) -
                this.getAnnotationXPosition(timeseries.start) +
                3 +
                "px"
              }
              match={this.props.match}
              subject={this.props.playerId}
            />
          </div>
        </div>
      );
    });
  };

  produceChoiceAnnotations = (annotationTimes: any) => {
    const choiceTimes = annotationTimes.choiceTimes;

    choiceTimes.map((timestamp: any, index: any) => {
      return (
        <div key={index} style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              height: "100%",
              top: "auto",
              marginLeft: 0,
              marginRight: 0,
              left: this.getAnnotationXPosition(timestamp.time) + "px",
              position: "absolute",
            }}
          >
            <ChoiceAnnotation
              id={timestamp.id}
              match={this.props.match}
              subject={this.props.playerId}
            />
          </div>
        </div>
      );
    });
  };

  // ---------------- modal functions -----------------------------

  // add annotation modal
  handleAddAnnotation = (frame1: any, frame2: any) => {
    let onClick: any;
    if (this.props.currentAnnotationType === "Scene") {
      onClick = () => this.addSceneAnnotation(frame1, frame2);
    } else if (this.props.currentAnnotationType === "Beat") {
      onClick = () => this.addBeatAnnotation(frame1, frame2);
    } else if (this.props.currentAnnotationType === "Choice") {
      onClick = () => this.addChoiceAnnotation(frame1);
    }

    this.setState({
      modalHeader: { title: "Add Annotation" },
      row1: [
        {
          element: "textbox",
          type: "select",
          label: "Select a ProtoElement to Link",
          items: this.state.items[
            this.props.currentAnnotationType
          ].map((str: string) => ({ name: str })),
          size: "lg",
          onChange: this.onSelect,
        },
      ],
      row2: null,
      row3: null,
      footer: [
        {
          element: "button",
          text: "Cancel",
          col: 2,
          variant: "danger",
          onClick: this.cancelAddAnnotation,
        },
        {
          element: "button",
          text: "Add",
          col: 2,
          variant: "primary",
          onClick: onClick,
        },
      ],
    });
    this.toggleModal();
  };

  renderTooltip = (props: any) => {
    return (
      <Tooltip {...props} show="true" id={1}>
        {this.state.hoverX}
      </Tooltip>
    );
  };

  // ---------------- render -----------------------------
  render() {
    const props = this.props;
    const top = -28 + "px";
    // allows element overlap based on single time annotations 19x19 px size
    const marginLeft = -9 + "px";
    const marginRight = -9 + "px";

    /*    const cursors = classNames({
      border: true,
      timeline: true
    })
    */
    return (
      <Row id={`timeline${props.index}`}>
        <Col
          md={1}
          className="px-0 timeline-container-element"
          id="project-name-container"
        >
          <p id="project-player-name">{this.props.playerName}</p>
        </Col>

        <Col className="col-md-10 px-0 timeline-container-element">
          <GeneralModal
            header={this.state.modalHeader}
            showModal={this.state.showModal}
            toggleModal={this.toggleModal}
            row1={this.state.row1}
            row2={this.state.row2}
            footer={this.state.footer}
          />

          <OverlayTrigger
            placement="right"
            delay={{ show: 0, hide: 100 }}
            overlay={this.renderTooltip}
          >
            <div
              className="annotations"
              onMouseMove={(e) => {
                this.setState({
                  hoverX: secondsToTimestamp(
                    (e.clientX - this.state.leftOffset) *
                      this.state.secondsPerPixel
                  ),
                });
              }}
            >
              {/* Story Element Annotations */}

              <div
                className="timeline"
                ref={this.timeline}
                style={{ height: "50px" }}
                onClick={this.onAddStoryElement()}
              >
                {this.props.renderTypes[0] === "Scene"
                  ? this.state.annotationTimes.sceneTimes.map(
                      (timeseries: any, index: any) => {
                        return (
                          <div key={index} style={{ position: "relative" }}>
                            <div
                              style={{
                                display: "inline-block",
                                height: "100%",
                                top,
                                left:
                                  this.getAnnotationXPosition(
                                    timeseries.start
                                  ) +
                                  1 +
                                  "px",
                                position: "absolute",
                              }}
                            >
                              <SceneAnnotation
                                id={timeseries.id}
                                width={
                                  this.getAnnotationXPosition(timeseries.end) -
                                  this.getAnnotationXPosition(
                                    timeseries.start
                                  ) +
                                  3 +
                                  "px"
                                }
                                match={this.props.match}
                                subject={this.props.playerId}
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                  : null}

                {this.props.renderTypes[1] === "Beat"
                  ? this.state.annotationTimes.beatTimes.map(
                      (timeseries: any, index: any) => {
                        return (
                          <div key={index} style={{ position: "relative" }}>
                            <div
                              style={{
                                display: "inline-block",
                                height: "100%",
                                top,
                                left:
                                  this.getAnnotationXPosition(
                                    timeseries.start
                                  ) +
                                  1 +
                                  "px",
                                position: "absolute",
                              }}
                            >
                              <BeatAnnotation
                                id={timeseries.id}
                                width={
                                  this.getAnnotationXPosition(timeseries.end) -
                                  this.getAnnotationXPosition(
                                    timeseries.start
                                  ) +
                                  3 +
                                  "px"
                                }
                                match={this.props.match}
                                subject={this.props.playerId}
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                  : null}
              </div>

              <div
                className="timeline"
                ref={this.timeline}
                style={{ height: "50px" }}
                onClick={this.onAddPlayerElement()}
              >
                {this.props.renderTypes[2] === "Choice"
                  ? this.state.annotationTimes.choiceTimes.map(
                      (timestamp: any, index: any) => {
                        return (
                          <div key={index} style={{ position: "relative" }}>
                            <div
                              style={{
                                display: "inline-block",
                                height: "100%",
                                top,
                                marginLeft,
                                marginRight,
                                left:
                                  this.getAnnotationXPosition(timestamp.time) +
                                  "px",
                                position: "absolute",
                              }}
                            >
                              <ChoiceAnnotation
                                id={timestamp.id}
                                match={this.props.match}
                                subject={this.props.playerId}
                              />
                            </div>
                          </div>
                        );
                      }
                    )
                  : null}
              </div>
            </div>
          </OverlayTrigger>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state: any) => ({
  project: state.project,
  auth: state.auth,
});

export default connect(mapStateToProps, {})(Timeline);
