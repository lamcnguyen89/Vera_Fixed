import React from "react";
import Timeline from "../components/Timeline";
import VideoContainer from "../components/VideoControls/VideoContainer";
import "../styles/Project.css";
import NavMenu from "../components/NavMenu";
import { connect } from "react-redux";
import GeneralModal from "../components/GeneralModal";
import { Button, Container, Row, Col } from "react-bootstrap";
import { getSubject, getBioData, getMLData } from "../helpers/DatabaseAPIs";
import Player from "@vimeo/player";
import hotKeys from "../constants/HotKeys";
import HelpModal from "../components/HelpModal";
import LineGraph from "../components/LineGraph";

interface IProjectProps {
  history: any;
  location: any;
  auth: any;
  project: any;
  match: any;
}

interface IProjectState {
  subjectBios: any;
  subjects: Array<any>;
  selectedSubjects: Array<any>;
  subjectsDisplaying: Array<any>;
  videoPlayers: Array<any>;
  videoPlayersInUse: Array<any>;
  takenOptions: Array<any>;

  showIndividualVideoSelect: boolean; //
  selectedPlayer: string; //
  currentAnnotationType: string;
  isLoading: boolean;

  showModal: boolean;
  showHelpModal: boolean;
  modalHeader: any;
  modalElements: Array<any>;
  modalFunction: string;
  modalTxt: any;
  modalFormState: string;
  row1: Array<any>;
  row2: Array<any>;
  row3: Array<any>;
  footer: Array<any>;
  items: Array<any>;

  currentlyCheckedSubjects: Array<any>;
  currentlyCheckedAnnotations: Array<any>;
  selectedAnnotations: Array<any>;
}

type SelectElement = React.FormEvent<HTMLSelectElement>;

class Project extends React.Component<IProjectProps, IProjectState> {
  video1 = React.createRef();
  constructor(props: IProjectProps) {
    super(props);

    this.state = {
      subjectBios: {},
      subjects: [],
      selectedSubjects: [],
      subjectsDisplaying: [],
      videoPlayers: [],
      videoPlayersInUse: [],
      takenOptions: [],

      showIndividualVideoSelect: false,
      selectedPlayer: "",
      currentAnnotationType: "Scene",
      isLoading: true,

      showModal: false,
      showHelpModal: false,
      modalHeader: "",
      modalFunction: "",
      modalFormState: "",
      modalElements: [],
      modalTxt: "",
      row1: [],
      row2: [],
      row3: [],
      footer: [],
      items: [],

      currentlyCheckedSubjects: [],
      currentlyCheckedAnnotations: [],
      selectedAnnotations: [],
    };
  }

  componentDidMount() {
    this.getSubjects();
    this.setState({
      selectedAnnotations: ["Scene", "Beat", "Choice"],
      // currentlyCheckedAnnotations: [true, true, true]
    });

    document.body.addEventListener("keydown", this.handleHotKeys);
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    document.body.removeEventListener("keydown", this.handleHotKeys);
  }

  handleResize = () => {
    this.setState({ isLoading: true });
    window.location.reload();
  };

  // ------ project api calls --------
  getSubjects = () => {
    const prjId = this.props.match.params.projectId;
    const token = this.props.auth.token;
    const state = (e: any) => {
      for (const subject of e) {
        const prjId = subject.uid;
        const token = this.props.auth.token;

        const hrState = (e: any, uid: any) => {
          const subjectBios = { ...this.state.subjectBios };

          if (subjectBios[uid] === undefined) {
            subjectBios[uid] = {
              hr: {},
            };
          }
          subjectBios[uid]["hr"] = e;

          const hrMLState = (e2: any, uid: any) => {
            const mlData = [];
            e2.map((point) => {
              const index = e.ms.indexOf(point);
              mlData.push({
                x: point,
                y: e.v[index],
              });
            });

            const subjectBios = { ...this.state.subjectBios };

            if (subjectBios[uid] === undefined) {
              subjectBios[uid] = {
                hrML: {},
              };
            }
            subjectBios[uid]["hrML"] = mlData;
            return this.setState({ subjectBios: subjectBios });
          };
          getMLData(prjId, "hr", token, hrMLState);

          const emotionsState = (e2: any, uid: any) => {
            console.log(e2);
            const emotionsData = [];
            e2.map((point) => {
              emotionsData.push({
                x: point,
                y: point.v,
              });
            });

            const subjectBios = { ...this.state.subjectBios };

            if (subjectBios[uid] === undefined) {
              subjectBios[uid] = {
                emotions: {},
              };
            }
            subjectBios[uid]["emotions"] = emotionsData;
            return this.setState({ subjectBios: subjectBios });
          };
          getMLData(prjId, "au", token, emotionsState);

          return this.setState({ subjectBios: subjectBios });
        };

        const gsrState = (e: any, uid: any) => {
          const subjectBios = { ...this.state.subjectBios };

          if (subjectBios[uid] === undefined) {
            subjectBios[uid] = {
              gsr: {},
            };
          }
          subjectBios[uid]["gsr"] = e;

          const gsrMLState = (e2: any, uid: any) => {
            const mlData = [];
            e2.map((point) => {
              const index = e.ms.indexOf(point);
              mlData.push({
                x: point,
                y: e.v[index],
              });
            });

            const subjectBios = { ...this.state.subjectBios };

            if (subjectBios[uid] === undefined) {
              subjectBios[uid] = {
                gsrML: {},
              };
            }
            subjectBios[uid]["gsrML"] = mlData;
            return this.setState({ subjectBios: subjectBios });
          };
          getMLData(prjId, "gsr", token, gsrMLState);

          return this.setState({ subjectBios: subjectBios });
        };

        const ibiState = (e: any, uid: any) => {
          const subjectBios = { ...this.state.subjectBios };

          if (subjectBios[uid] === undefined) {
            subjectBios[uid] = {
              ibi: {},
            };
          }
          subjectBios[uid]["ibi"] = e;

          const ibiMLState = (e2: any, uid: any) => {
            const mlData = [];
            e2.map((point) => {
              const index = e.ms.indexOf(point);
              mlData.push({
                x: point,
                y: e.v[index],
              });
            });

            const subjectBios = { ...this.state.subjectBios };

            if (subjectBios[uid] === undefined) {
              subjectBios[uid] = {
                ibiML: {},
              };
            }
            subjectBios[uid]["ibiML"] = mlData;
            return this.setState({ subjectBios: subjectBios });
          };
          getMLData(prjId, "ibi", token, ibiMLState);

          return this.setState({ subjectBios: subjectBios });
        };

        getBioData(prjId, "hr", token, hrState);
        getBioData(prjId, "gsr", token, gsrState);
        getBioData(prjId, "ibi", token, ibiState);
      }
      return this.setState({ subjects: e });
    };

    getSubject(prjId, token, state);
  };

  // ---------------- helper functions -----------------------------
  onSelectAnnotationType = (e: SelectElement) => {
    this.setState({ currentAnnotationType: e.currentTarget.value });
  };

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal, modalFormState: "" });
  };

  onCheckedSubject = (e: any, index: any) => {
    const newCheckedSubjects = this.state.currentlyCheckedSubjects.slice();
    newCheckedSubjects[index] = !newCheckedSubjects[index];

    this.setState({ currentlyCheckedSubjects: newCheckedSubjects });
  };

  onCheckAnnotations = (e: any, key: any) => {
    const newCheckedAnnotations = this.state.currentlyCheckedAnnotations.slice();
    newCheckedAnnotations[key] = !newCheckedAnnotations[key];

    this.setState({ currentlyCheckedAnnotations: newCheckedAnnotations });
  };

  onSubmitFiltering = () => {
    const currentlyCheckedSubjects = this.state.currentlyCheckedSubjects;

    this.state.selectedSubjects.forEach((subject: any, index: any) => {
      const videoSlot = document.getElementById(`videoSlot${index}`);
      const videoTimeline = document.getElementById(`timeline${index}`);

      if (
        currentlyCheckedSubjects[index] === false ||
        currentlyCheckedSubjects[index] === undefined
      ) {
        videoSlot.style.display = "none";
        videoTimeline.style.display = "none";
      } else if (videoSlot.style.display === "none") {
        videoSlot.style.display = "block";
        videoTimeline.style.display = "block";
      }
    });

    const annTypes = ["Scene", "Beat", "Choice"];
    const annotations: any = [];
    annTypes.forEach((type, index) => {
      if (
        this.state.currentlyCheckedAnnotations[index] !== "false" &&
        this.state.currentlyCheckedAnnotations[index] !== undefined
      ) {
        annotations.push(type);
      } else {
        annotations.push("");
      }
    });
    this.setState({ selectedAnnotations: annotations }, () => {
      this.setState({ currentlyCheckedAnnotations: [] });
      this.toggleModal();
    });
  };

  filteringHelper = (annotations: any) => {
    const currentlyCheckedAnnotations = this.state.currentlyCheckedAnnotations;
    // debugger
    for (let i = 0; i < annotations.length; i++) {
      const annotation = annotations[i];

      if (
        currentlyCheckedAnnotations[i] === false ||
        currentlyCheckedAnnotations[i] === undefined
      ) {
        annotation.style.display = "none";
      } else if (annotation.style.display === "none") {
        annotation.style.display = "block";
      }
    }
  };

  getTimelines = () => {
    let timelines = null;

    timelines = this.state.selectedSubjects.map((subject: any, index: any) => {
      return (
        <Container fluid id={`timeline${index}`} key={index}>
          <Timeline
            match={this.props.match}
            playerName={subject.playerName}
            playerId={subject._id}
            playerData={subject.data}
            currentAnnotationType={this.state.currentAnnotationType}
            renderTypes={this.state.selectedAnnotations}
            duration={subject.vimeoVideos[0].duration}
            index={index}
            key={subject._id}
          />
          <div>
            <LineGraph
              xValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].hr.ms
                  : []
              }
              yValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].hr.v
                  : []
              }
              color="255,0,0"
              label="Heart Rate"
              ml={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].hrML
                  : []
              }
              emotions={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].emotions
                  : []
              }
            />
          </div>

          <div>
            <LineGraph
              xValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].gsr.ms
                  : []
              }
              yValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].gsr.v
                  : []
              }
              color="0,255,0"
              label="Galvanic Skin Response"
              ml={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].gsrML
                  : []
              }
              emotions={[]}
            />
          </div>

          <div>
            <LineGraph
              xValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].ibi.ms
                  : []
              }
              yValues={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].ibi.v
                  : []
              }
              color="0,0,255"
              label="Inner Beat Interval"
              ml={
                this.state.subjectBios[subject.uid]
                  ? this.state.subjectBios[subject.uid].ibiML
                  : []
              }
              emotions={[]}
            />
          </div>
        </Container>
      );
    });

    return timelines;
  };

  // ----------------Select subjects-------------------------------

  handleSelectSubject = () => {
    const testSubject = [{ name: "None" }].concat(
      this.state.subjects.map((subject) => {
        return { name: subject.uid };
      })
    );

    this.setState(
      {
        modalHeader: { title: "Select Subjects (Max 5) " },
        row1: [
          {
            element: "textbox",
            type: "select",
            label: "Subject 1",
            items: testSubject,
            size: "lg",
          },
          {
            element: "textbox",
            type: "select",
            label: "Subject 2",
            items: testSubject,
            size: "lg",
          },
          {
            element: "textbox",
            type: "select",
            label: "Subject 3",
            items: testSubject,
            size: "lg",
          },
          {
            element: "textbox",
            type: "select",
            label: "Subject 4",
            items: testSubject,
            size: "lg",
          },
          {
            element: "textbox",
            type: "select",
            label: "Subject 5",
            items: testSubject,
            size: "lg",
          },
        ],
        row2: [],
        footer: [
          {
            element: "button",
            text: "Cancel",
            variant: "danger",
            col: 2,
            onClick: this.toggleModal,
          },
          {
            element: "button",
            text: "Accept",
            variant: "primary",
            col: 2,
            onClick: this.addSelectedSubjects,
          },
        ],
      },
      () => this.toggleModal()
    );
  };

  // adds the selected subjects subjects into state
  addSelectedSubjects = () => {
    const selected = this.addSelectedHelper(
      document.getElementsByClassName("form-control-lg")
    );
    const checkedSubjects = [...selected];

    this.setState(
      { selectedSubjects: selected, currentlyCheckedSubjects: checkedSubjects },
      () => {
        this.addPlayers(document.getElementsByTagName("iframe"));
      }
    );
    this.toggleModal();
  };

  // helper function for addSelectedSubjects
  addSelectedHelper = (selected: any) => {
    const subjects = this.state.subjects;
    const selectedSubjects: any = [];

    for (let i = 0; i < selected.length; i++) {
      const subject = subjects.find(
        (subject) => subject.uid === selected[i].value
      );

      if (subject) {
        selectedSubjects.push(subject);
      }
    }

    return selectedSubjects;
  };

  // creates the vimeo 'Player' for each test subject and adds it to state
  addPlayers = (frames: any) => {
    const players: any = [];

    for (let i = 0; i < frames.length; i++) {
      players.push({ index: i, player: new Player(frames[i]) });

      players[i].player.on("timeupdate", (data: any) => {
        const currentTimeElement = document.getElementById(
          `videoCurrentTime${i}`
        );
        currentTimeElement.innerHTML = this.formatTime(data.seconds);
      });
    }

    this.setState({ videoPlayers: players, videoPlayersInUse: players });
  };

  // ---------------- modal functions -----------------------------

  handleFilter = () => {
    const currentlyCheckedSubjects = this.state.currentlyCheckedSubjects;
    const subjects: any = [
      { element: "p", fontSize: "18px", text: "Subjects" },
    ];

    this.state.selectedSubjects.forEach((player, index) => {
      const subjectCheckbox: any = {
        element: "checkbox",
        label: player.uid,
        onChange: (e: any) => this.onCheckedSubject(e, index),
        key: `filterCheckbox${index}-${player.playerName}`,
      };

      if (currentlyCheckedSubjects[index]) {
        subjectCheckbox.checked = true;
      }

      subjects.push(subjectCheckbox);
    });

    this.setState(
      {
        modalHeader: { title: "Filter" },
        row1: subjects,
        row2: [
          { element: "p", fontSize: "18px", text: "Annotations" },
          {
            element: "checkbox",
            label: "Scenes",
            inline: true,
            onChange: (e: any /*, key: any */) => this.onCheckAnnotations(e, 0),
            key: 0,
          },
          {
            element: "checkbox",
            label: "Beats",
            inline: true,
            onChange: (e: any /*, key: any */) => this.onCheckAnnotations(e, 1),
            key: 1,
          },
          {
            element: "checkbox",
            label: "Choices",
            inline: true,
            onChange: (e: any /*, key: any */) => this.onCheckAnnotations(e, 2),
            key: 2,
          },
        ],
        footer: [
          {
            element: "button",
            text: "Cancel",
            col: 2,
            variant: "danger",
            onClick: this.toggleModal,
          },
          {
            element: "button",
            text: "Apply",
            col: 2,
            variant: "primary",
            onClick: this.onSubmitFiltering,
          },
        ],
      },
      () => {
        this.toggleModal();
      }
    );
  };

  // handles video control hotkeys
  handleHotKeys = (event: any) => {
    const videos = this.state.videoPlayersInUse;

    switch (event.key) {
      case hotKeys.playOrPause:
        event.preventDefault();
        this.playOrPause(videos);
        break;
      case hotKeys.forward_x_seconds:
        this.fastForward(videos);
        break;
      case hotKeys.rewind_x_seconds:
        this.rewind(videos);
        break;
      case hotKeys.nextFrame:
        this.nextFrame(videos);
        break;
      case hotKeys.prevFrame:
        this.prevFrame(videos);
        break;
      case hotKeys.restart:
        this.reStartVideo(videos);
        break;
      case hotKeys.toggleSingleVideoMode:
        this.toggleSingleVideoMode(videos);
        break;
      case hotKeys.nextVideo:
        this.nextVideo(videos);
        break;
      case hotKeys.prevVideo:
        this.prevVideo(videos);
        break;
      default:
        break;
    }

    if (
      event.key === hotKeys.toggleSubject1 ||
      event.key === hotKeys.toggleSubject2 ||
      event.key === hotKeys.toggleSubject3 ||
      event.key === hotKeys.toggleSubject4 ||
      event.key === hotKeys.toggleSubject5
    ) {
      this.toggleVideos(videos, event.key);
    }
  };

  // play or pause the videos
  playOrPause = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.getPaused().then((data: any) => {
        if (data) {
          video.player.play();
        } else {
          video.player.pause();
        }
      });
    });
  };

  // fast-forward x secs
  fastForward = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.getCurrentTime().then((seconds: any) => {
        const ff = seconds + hotKeys.seconds;
        video.player.setCurrentTime(ff);
      });
    });
  };

  // rewind x secs
  rewind = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.getCurrentTime().then((seconds: any) => {
        const rwd = seconds - hotKeys.seconds;
        video.player.setCurrentTime(rwd);
      });
    });
  };

  // shows next frame
  nextFrame = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.getCurrentTime().then((seconds: any) => {
        const rwd = seconds + hotKeys.frame;
        video.player.setCurrentTime(rwd);
      });
    });
  };

  // shows previous frame
  prevFrame = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.getCurrentTime().then((seconds: any) => {
        const rwd = seconds - hotKeys.frame;
        video.player.setCurrentTime(rwd);
      });
    });
  };

  // toggles in and out of single video control mode
  toggleSingleVideoMode = (videos: any) => {
    const videoPlayers = this.state.videoPlayers;
    const singleVideoInUse = this.state.videoPlayersInUse[0];
    const index = singleVideoInUse.index;

    if (videos.length > 1) {
      this.setState({ videoPlayersInUse: [singleVideoInUse] });
      document.getElementById("videoDesc0").style.color = "#5cb5ea";
    } else if (videos.length === 1) {
      document.getElementById(`videoDesc${index}`).style.color = "white";
      this.setState({
        videoPlayersInUse: videoPlayers.map((vidPlayer) => vidPlayer),
      });
    }
  };

  // controls the next videos
  nextVideo = (videos: any) => {
    const videoPlayers = this.state.videoPlayers;
    const lastIndex = videoPlayers.length - 1;
    const currIndex = videos[0].index;
    const nextIndex = currIndex + 1 <= lastIndex ? currIndex + 1 : 0;

    if (videos.length === 1) {
      document.getElementById(`videoDesc${currIndex}`).style.color = "white";
      document.getElementById(`videoDesc${nextIndex}`).style.color = "#5cb5ea";

      this.setState({ videoPlayersInUse: [videoPlayers[nextIndex]] });
    }
  };

  // controls the previous video
  prevVideo = (videos: any) => {
    const videoPlayers = this.state.videoPlayers;
    const lastIndex = videoPlayers.length - 1;
    const currIndex = videos[0].index;
    const prevIndex = currIndex - 1 >= 0 ? currIndex - 1 : lastIndex;

    document.getElementById(`videoDesc${currIndex}`).style.color = "white";
    document.getElementById(`videoDesc${prevIndex}`).style.color = "#5cb5ea";

    this.setState({ videoPlayersInUse: [videoPlayers[prevIndex]] });
  };

  // toggles between hiding and displaying a video
  toggleVideos = (videos: any, videoNum: any) => {
    const index = Number(videoNum) - 1;
    const videoSlot = document.getElementById(`videoSlot${index}`);
    const currentlyCheckedSubjects = this.state.currentlyCheckedSubjects;

    if (videoSlot) {
      const videoTimeline = document.getElementById(`timeline${index}`);

      if (currentlyCheckedSubjects[index] === true) {
        videoSlot.style.display = "none";
        videoTimeline.style.display = "none";
        currentlyCheckedSubjects[index] = false;
      } else if (currentlyCheckedSubjects[index] === false) {
        videoSlot.style.display = "block";
        videoTimeline.style.display = "block";
        currentlyCheckedSubjects[index] = true;
      }
    }
  };

  // restarts all selected videos
  reStartVideo = (videos: any) => {
    videos.forEach((video: any) => {
      video.player.setCurrentTime(0);
    });
  };

  // formats time in seconds into hr: min :sec
  formatTime = (totalSeconds: any) => {
    let hours: any = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes: any = Math.floor(totalSeconds / 60);
    let seconds: any = Math.floor(totalSeconds % 60);

    if (hours < 10) {
      hours = `0${hours}`;
    }
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    const timeFormat: any =
      hours >= 1 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    return timeFormat;
  };

  // ---------------- render -----------------------------
  render() {
    const state = this.state;

    return (
      <Container fluid>
        <HelpModal
          showModal={this.state.showHelpModal}
          onHide={() =>
            this.setState({ showHelpModal: !this.state.showHelpModal })
          }
        />
        <GeneralModal
          header={state.modalHeader}
          showModal={state.showModal}
          toggleModal={this.toggleModal}
          row1={state.row1}
          row2={state.row2}
          footer={state.footer}
        />

        <NavMenu title="Project" />

        <VideoContainer
          selectedSubjects={state.selectedSubjects}
          formatTime={this.formatTime}
        />
        <div className="project-inner-box">
          <Row>
            <Col md={10} className="offset-md-1 px-0">
              <hr></hr>
            </Col>
          </Row>

          <Row className="project-buttons-container">
            <Col md={10} className="offset-md-1 px-0">
              <Button
                className="mr-2 project-menu-btn"
                onClick={this.handleSelectSubject}
              >
                Select Subjects
              </Button>
              <Button onClick={this.handleFilter} className="project-menu-btn">
                Filter
              </Button>
              <Button
                className="project-menu-btn"
                href={"../settings/" + this.props.match.params.projectId}
              >
                ProtoElements
              </Button>
              <Button
                className="project-menu-btn"
                onClick={() =>
                  this.setState({ showHelpModal: !this.state.showHelpModal })
                }
              >
                Help
              </Button>

              <div style={{ float: "right" }}>
                <select
                  className="form-control project-video-select"
                  onChange={this.onSelectAnnotationType}
                >
                  <option>Scene</option> {/* green */}
                  <option>Beat</option> {/* blue */}
                  <option>Choice</option>{" "}
                  {/* red diamond, option will be orange? */}
                </select>
              </div>
            </Col>
          </Row>

          <Row className="timelines-container">
            {state.subjects.length > 0 ? (
              this.getTimelines()
            ) : (
              <p>There are no subjects selected on this project.</p>
            )}
          </Row>
        </div>
      </Container>
    );
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth,
  project: state.project,
});

export default connect(mapStateToProps, {})(Project);
