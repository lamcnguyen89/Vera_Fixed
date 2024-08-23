import React, { Component } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { connect } from "react-redux";

// interfaces
import Annotator from "../interfaces/Annotator";
import Player from "../interfaces/TestSubject";
import Project from "../interfaces/Project";

// components
import SettingsCard from "../components/Settings/SettingsCard";
import NavMenu from "../components/NavMenu";
import GeneralModal from "../components/GeneralModal";

// helper api file
import {
  getProject,
  deleteProject,
  getAnnotator,
  addAnnotator,
  deleteAnnotator,
  getSubject,
  addSubject,
  deleteSubject,
  addBioFile,
} from "../helpers/DatabaseAPIs";
import { getVimeoVideos, sendSelectedVideos } from "../helpers/VimeoAPIs";
import {
  getProtoElements,
  addProtoElement,
  deleteProtoScene,
  deleteProtoBeat,
  deleteProtoChoice,
  getAllTriples,
} from "../helpers/OwlAPIs";

// styles
import "../styles/settings.css";

// needed to connect to vimeo... idk why :/
const Vimeo = require("vimeo").Vimeo;

interface ISettingsProps {
  history: any;
  location: any;
  auth: any;
  match: any;
  vimeoClient: any;
}

interface ISettingsState {
  // page states
  annotators: Array<Annotator>;
  subjects: Array<Player>;
  protoElements: Array<any>;
  project: Project | null;
  loading: boolean;
  showModal: boolean;
  showAlert: boolean;
  projectId: any;
  deleteId: any;

  // vimeo states
  videoList: Array<any>;
  currPage: number;
  lastPage: number;
  firstPage: number;
  nextPage: number | null;
  prevPage: number | null;
  subjectVideo: any;
  selectableVideos: Array<any>;
  selectedVideo: any;

  selectedHrFile: any;
  selectedGsrFile: any;
  selectedIbiFile: any;
  selectedFauFile: any;

  // modal states
  modalFormState: string;
  searchedString: string;
  modalSize: string;
  modalHeader: any;
  row1: Array<any>;
  row2: Array<any>;
  row3: Array<any>;
  footer: Array<any>;

  currentProtoElementType: string;
}

class Settings extends Component<ISettingsProps, ISettingsState> {
  constructor(props: ISettingsProps) {
    super(props);

    this.state = {
      // page states
      annotators: [],
      subjects: [],
      protoElements: [],
      project: null,
      projectId: this.props.match.params.projectId,
      loading: true,
      showModal: false,
      deleteId: "",

      // vimeo states
      videoList: [],
      selectableVideos: [],
      selectedVideo: "",
      subjectVideo: "",
      currPage: 1,
      lastPage: 1,
      firstPage: 1,
      nextPage: null,
      prevPage: null,

      selectedHrFile: "",
      selectedGsrFile: "",
      selectedIbiFile: "",
      selectedFauFile: "",

      // modal states
      showAlert: false,
      modalHeader: "",
      modalSize: "",
      modalFormState: "",
      searchedString: "",
      row1: [],
      row2: [],
      row3: [],
      footer: [],

      currentProtoElementType: "Scenes",
    };
  }

  componentDidMount() {
    this.getProject();
    this.getProtoElements();
  }

  // --------- project api calls -------------

  getProject = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;
    const state = (prj: any) =>
      this.setState({ project: prj }, () => {
        this.getAnnotators();
        this.getSubjects();
        this.getProtoElements();
      });

    getProject(prjId, token, state);
  };

  deleteProject = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;

    if (this.state.modalFormState === this.state.project.name) {
      deleteProject(prjId, token, this.returnToDashboard);
    } else {
      alert("wrong name");
    }
  };

  // ---------- annotators api calls ------------------

  getAnnotators = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;
    const state = (e: any) => this.setState({ annotators: e });

    getAnnotator(prjId, token, state);
  };

  addAnnotator = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;
    const email = this.state.modalFormState;

    addAnnotator(prjId, email, token, this.getAnnotators);
    this.toggleModal();
  };

  deleteAnnotator = () => {
    const prjId = this.state.projectId;
    const email = this.state.deleteId;
    const token = this.props.auth.token;
    const state = () =>
      this.setState({
        annotators: this.state.annotators.filter((p) => p.email !== email),
      });

    deleteAnnotator(prjId, email, token, state);
    this.toggleModal();
  };

  // ------- subjects api calls -----------

  getSubjects = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;
    const state = (e: any) => this.setState({ subjects: e });

    getSubject(prjId, token, state);
  };

  addSubjectToProject = () => {
    const prjId = this.state.projectId;
    const token = this.props.auth.token;
    const name = this.state.modalFormState;
    const selectedVideo = this.state.subjectVideo.allAtr;
    let playerId;

    const actingFunction = (subject: any) => {
      if (this.state.selectedHrFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          addBioFile(
            "hr",
            subject.uid,
            token,
            e.target["result"] as string,
            () => {}
          );
        };
        reader.readAsDataURL(this.state.selectedHrFile);
      }

      if (this.state.selectedGsrFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          addBioFile(
            "gsr",
            subject.uid,
            token,
            e.target["result"] as string,
            () => {}
          );
        };
        reader.readAsDataURL(this.state.selectedGsrFile);
      }

      if (this.state.selectedIbiFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          addBioFile(
            "ibi",
            subject.uid,
            token,
            e.target["result"] as string,
            () => {}
          );
        };
        reader.readAsDataURL(this.state.selectedIbiFile);
      }

      if (this.state.selectedFauFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          addBioFile(
            "au",
            subject.uid,
            token,
            e.target["result"] as string,
            () => {}
          );
        };
        reader.readAsDataURL(this.state.selectedFauFile);
      }

      this.setState(
        (prevState) => {
          playerId = subject._id;
          return {
            subjects: [...prevState.subjects, subject],
            subjectVideo: "",
          };
        },
        () => sendSelectedVideos(selectedVideo, token, prjId, playerId)
      );
    };

    // if (!this.state.subjectVideo) {
      // alert("You have not imported a video for this subject");
    // } else {
      addSubject(prjId, token, actingFunction);
      this.toggleModal();
    // }
  };

  deleteSubject = () => {
    const prjId = this.state.projectId;
    const id = this.state.deleteId;
    const token = this.props.auth.token;

    deleteSubject(prjId, token, id, this.getSubjects);
    this.toggleModal();
  };

  deleteProtoElement = () => {
    const token = this.props.auth.token;
    const prjId = this.state.projectId;
    const protoelementId = this.state.deleteId;

    if (this.state.currentProtoElementType === "Scenes") {
      deleteProtoScene(token, prjId, protoelementId, this.getProtoElements);
    } else if (this.state.currentProtoElementType === "Beats") {
      deleteProtoBeat(token, prjId, protoelementId, this.getProtoElements);
    } else if (this.state.currentProtoElementType === "Choices") {
      deleteProtoChoice(token, prjId, protoelementId, this.getProtoElements);
    }

    this.toggleModal();
  };

  // ------ vimeo api calls --------

  getVimeoVideos = () => {
    const vimeoClient = this.props.vimeoClient;
    const vimeoObject = new Vimeo(
      "",
      vimeoClient._clientSecret,
      vimeoClient._accessToken
    );

    const state = (
      vidList: any,
      currentPage: any,
      firstPge: any,
      lastPge: any,
      nextPge: any,
      prevPge: any
    ) =>
      this.setState(
        () => {
          return {
            selectableVideos: [],
            videoList: vidList,
            currPage: currentPage,
            firstPage: firstPge,
            lastPage: lastPge,
            nextPage: nextPge,
            prevPage: prevPge,
          };
        },
        () => this.subjectVideoSelection()
      );

    getVimeoVideos(vimeoObject, state);
  };

  getVideoSubjects = () => {
    this.setState((state) => {
      return {
        modalSize: "lg",
        modalHeader: {
          title: "Import Biometric Data",
          extras: [],
        },
        row1: [
          {
            element: "textbox",
            type: "file",
            label: "Select Heart Rate File",
            placeholder: "hr",
            size: "lg",
            onChange: (e) => this.selectFiles(e),
          },
          {
            element: "textbox",
            type: "file",
            label: "Select Galvanic Skin Response File",
            placeholder: "gsr",
            size: "lg",
            onChange: (e) => this.selectFiles(e),
          },
          {
            element: "textbox",
            type: "file",
            label: "Select Inner Beat Interval File",
            placeholder: "ibi",
            size: "lg",
            onChange: (e) => this.selectFiles(e),
          },
          {
            element: "textbox",
            type: "file",
            label: "Select Facial Action Units File",
            placeholder: "au",
            size: "lg",
            onChange: (e) => this.selectFiles(e),
          },
        ],
        row2: [],
        row3: [],
        footer: [
          {
            element: "button",
            text: "Back",
            variant: "secondary",
            col: 1,
            onClick: () => this.handleAddSubject(),
          },
          {
            element: "button",
            text: "Select Files",
            variant: "primary",
            col: 3,
            onClick: this.acceptFiles,
          },
        ],
      };
    });
    // const state = () =>
    //   this.setState(
    //     () => {
    //       return {};
    //     },
    //     () => this.subjectVideoSelection()
    //   );

    // getVimeoVideos(vimeoObject, state);
  };

  // tracks the search bar on the modal
  onVideoSearch = (e: any) => {
    this.setState(
      {
        searchedString: e.target.value,
      },
      () => this.searchVideos()
    );
  };

  // filters viewable videos depending on the state of the search bar
  searchVideos = () => {
    const { searchedString } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchedVideos = this.state.selectableVideos.filter((video: any) =>
      video.title.includes(searchedString)
    );
    this.setState(() => {
      return {
        row2: searchedVideos,
      };
    });
  };

  getProtoElements = () => {
    const type = this.state.currentProtoElementType;
    const token = this.props.auth.token;
    const prjId = this.state.projectId;
    const actingFunction = (res: any) => this.setState({ protoElements: res });

    getProtoElements(token, type, prjId, actingFunction);
  };

  // creates adding annotator modal
  handleAddAnnotator = () => {
    this.setState({
      modalHeader: { title: "Add Researchers" },
      modalSize: "md",
      row1: [
        {
          element: "textbox",
          type: "email",
          placeholder: "Enter Researchers Email",
          label: "Researchers Email",
          onChange: this.onChange,
          size: "lg",
        },
      ],
      row2: null,
      row3: null,
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
          text: "Add",
          variant: "primary",
          col: 2,
          onClick: this.addAnnotator,
        },
      ],
    });
    this.toggleModal();
  };

  // creates delete annotator modal
  handleDeleteAnnotator = (id: any) => {
    this.setState({
      deleteId: id,
      modalHeader: { title: "Delete Researchers" },
      modalSize: "md",
      row1: [
        {
          element: "p",
          text:
            "Are you sure you want to delete this person? doing so will make them unable to see/work on the project any further",
        },
      ],
      row2: null,
      row3: null,
      footer: [
        {
          element: "button",
          text: "Cancel",
          variant: "primary",
          col: 2,
          onClick: this.toggleModal,
        },
        {
          element: "button",
          text: "Delete",
          variant: "danger",
          col: 2,
          onClick: this.deleteAnnotator,
        },
      ],
    });
    this.toggleModal();
  };

  // creates adding subject modal
  handleAddSubject = () => {
    const subjectVideo = this.state.subjectVideo;
    let subjectVideoCard = {};

    if (subjectVideo) {
      subjectVideoCard = {
        element: "card",
        containerclass: "justify-content-center",
        title: subjectVideo.title,
        col: 12,
        text: subjectVideo.description,
        id: subjectVideo.id,
        image: subjectVideo.image,
        classname: "mb-4",
      };
    } else {
      subjectVideoCard = { element: "none" };
    }

    this.setState({
      modalHeader: { title: "Add Subject" },
      modalSize: "md",
      selectedVideo: "",
      row1: [],
      row2: [
        subjectVideoCard && subjectVideoCard["element"] !== "none"
          ? {
              element: "p",
              text: "Selected Video",
              fontWeight: "bold",
            }
          : {},
        subjectVideoCard,
        {
          element: "button",
          text: "Import Content Video",
          variant: "dark",
          containerclass: "justify-content-center",
          onClick: this.getVimeoVideos,
        },
      ],
      row3: [
        {
          element: "button",
          text: "Import Biometric Data",
          containerclass: "justify-content-center",
          variant: "dark",
          onClick: this.getVideoSubjects,
        },
      ],
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
          text: "Add",
          variant: "primary",
          col: 2,
          onClick: this.addSubjectToProject,
        },
      ],
    });
  };

  handleAddFiles = () => {
    const hrFile = this.state.selectedHrFile;
    const gsrFile = this.state.selectedGsrFile;
    const ibiFile = this.state.selectedIbiFile;
    const fauFile = this.state.selectedFauFile;
    const subjectVideo = this.state.subjectVideo;
    let subjectVideoCard = {};
    let hrFileP = {};
    let gsrFileP = {};
    let ibiFileP = {};
    let fauFileP = {};

    if (subjectVideo) {
      subjectVideoCard = {
        element: "card",
        containerclass: "justify-content-center",
        title: subjectVideo.title,
        col: 12,
        text: subjectVideo.description,
        id: subjectVideo.id,
        image: subjectVideo.image,
        classname: "mb-4",
      };
    } else {
      subjectVideoCard = { element: "none" };
    }

    if (hrFile) {
      hrFileP = {
        element: "p",
        text: hrFile.name,
      };
    } else {
      hrFileP = { element: "none" };
    }

    if (gsrFile) {
      gsrFileP = {
        element: "p",
        text: gsrFile.name,
      };
    } else {
      gsrFileP = { element: "none" };
    }

    if (ibiFile) {
      ibiFileP = {
        element: "p",
        text: ibiFile.name,
      };
    } else {
      ibiFileP = { element: "none" };
    }

    if (fauFile) {
      fauFileP = {
        element: "p",
        text: fauFile.name,
      };
    } else {
      fauFileP = { element: "none" };
    }

    this.setState({
      modalHeader: { title: "Add Subject" },
      modalSize: "md",
      selectedVideo: "",
      row1: [],
      row2: [
        subjectVideoCard && subjectVideoCard["element"] !== "none"
          ? {
              element: "p",
              text: "Selected Video",
              fontWeight: "bold",
            }
          : {},
        subjectVideoCard,
        hrFile
          ? {
              element: "p",
              text: "Selected Heart Rate File",
              fontWeight: "bold",
            }
          : {},
        hrFileP,
        gsrFile
          ? {
              element: "p",
              text: "Selected Galvanic Skin Response File",
              fontWeight: "bold",
            }
          : {},
        gsrFileP,
        ibiFile
          ? {
              element: "p",
              text: "Selected Interbeat Interval File",
              fontWeight: "bold",
            }
          : {},
        ibiFileP,
        fauFileP
          ? {
              element: "p",
              text: "Selected Facial Action Units File",
              fontWeight: "bold",
            }
          : {},
        fauFileP,
        {
          element: "button",
          text: "Import Content Video",
          variant: "dark",
          containerclass: "justify-content-center",
          onClick: this.getVimeoVideos,
        },
      ],
      row3: [
        {
          element: "button",
          text: "Import Biometric Data",
          containerclass: "justify-content-center",
          variant: "dark",
          onClick: this.getVideoSubjects,
        },
      ],
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
          text: "Add",
          variant: "primary",
          col: 2,
          onClick: this.addSubjectToProject,
        },
      ],
    });
  };

  // transforms the addSubject modal to show all available videos on vimeo
  subjectVideoSelection = () => {
    const videoList = this.state.videoList;
    const vidCards: any = [];

    videoList.map((video: any, idx: any) =>
      vidCards.push({
        element: "card",
        allAtr: video,
        title: video.name,
        col: 6,
        text: video.description,
        id: video.uri,
        image: video.pictures.sizes[4].link,
        classname: "mb-4",
        onClick: () => this.selectVideos(idx),
      })
    );

    this.setState((state) => {
      return {
        selectableVideos: vidCards,
        modalSize: "lg",
        modalHeader: {
          title: "Vimeo Account Videos",
          extras: [
            {
              element: "pagination",
              col: 6,
              size: "md",
              currentPage: state.currPage,
              lastPage: state.lastPage,
              firstPage: state.firstPage,
            },
          ],
        },
        row1: [
          {
            element: "textbox",
            type: "text",
            label: "Search Videos",
            placeholder: "Search Here",
            onChange: this.onVideoSearch,
            col: 6,
            size: "lg",
          },
        ],
        row2: vidCards,
        row3: [],
        footer: [
          {
            element: "button",
            text: "Back",
            variant: "secondary",
            col: 1,
            onClick: () => this.handleAddSubject(),
          },
          {
            element: "button",
            text: "Select Video",
            variant: "primary",
            col: 3,
            onClick: this.acceptVideo,
          },
        ],
      };
    });
  };

  // creates delete subject modal
  handleDeleteSubject = (id: any) => {
    this.setState({
      deleteId: id,
      modalHeader: { title: "Delete Subject" },
      modalSize: "md",
      row1: [
        {
          element: "p",
          text:
            "Are you sure you want to delete this Subject? doing so will permanently erase all data tied to it",
        },
      ],
      row2: null,
      row3: null,
      footer: [
        {
          element: "button",
          text: "Cancel",
          variant: "primary",
          col: 2,
          onClick: this.toggleModal,
        },
        {
          element: "button",
          text: "Delete",
          variant: "danger",
          col: 2,
          onClick: this.deleteSubject,
        },
      ],
    });
    this.toggleModal();
  };

  // creates delete project modal
  handleDeleteProject = () => {
    const prjName = this.state.project.name;

    this.setState({
      modalHeader: { title: "Delete Project" },
      row1: [
        {
          element: "p",
          fontSize: "18px",
          text: `Are you sure you want to delete this project? doing so will make permanently delete all data attached to it. ENTER THE PROJECT'S NAME TO DELETE IT: ${prjName}`,
        },
      ],
      row2: [
        {
          element: "textbox",
          type: "text",
          placeholder: prjName,
          onChange: this.onChange,
          size: "lg",
          label: "Projects Name",
        },
      ],
      row3: null,
      footer: [
        {
          element: "button",
          text: "Cancel",
          variant: "primary",
          col: 2,
          onClick: this.toggleModal,
        },
        {
          element: "button",
          text: "Delete",
          variant: "danger",
          col: 2,
          onClick: this.deleteProject,
        },
      ],
    });
    this.toggleModal();
  };

  // keeps track of the video the user wants to add to a subject, and adjust the videos
  // className so that it can be affected by css to highlight the video
  selectVideos = (index: number) => {
    let selected = this.state.selectedVideo;
    const selectableVideos = this.state.selectableVideos;

    if (selected.id === selectableVideos[index].id) {
      selected = "";
      selectableVideos[index].classname = "";
      this.setState({ selectedVideo: "mb-4" });
    } else {
      selectableVideos.map((video) => {
        video.classname = "mb-4";
        return video;
      });
      selectableVideos[index].classname = "mb-4 selectedVid";
      this.setState({ selectedVideo: this.state.selectableVideos[index] });
    }
  };

  selectFiles = (event: any) => {
    if (event.target.files.length > 0) {
      if (event.target.placeholder === "hr") {
        this.setState({ selectedHrFile: event.target.files[0] });
      } else if (event.target.placeholder === "gsr") {
        this.setState({ selectedGsrFile: event.target.files[0] });
      } else if (event.target.placeholder === "ibi") {
        this.setState({ selectedIbiFile: event.target.files[0] });
      } else if (event.target.placeholder === "au") {
        this.setState({ selectedFauFile: event.target.files[0] });
      }
    }
  };

  // sets state to represent the subject video the user wants, and reverts the modal back
  // to the add subject modal
  acceptVideo = () => {
    this.setState(
      (prevState) => {
        return {
          subjectVideo: prevState.selectedVideo,
        };
      },
      () => this.handleAddSubject()
    );
  };

  acceptFiles = () => {
    this.setState(
      (prevState) => {},
      () => this.handleAddFiles()
    );
  };

  // toggles the visibility of the modal from show/hide
  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal,
      modalFormState: "",
      searchedString: "",
    });
  };

  // temp function i use to check state, will be deleted eventually
  checkState = () => {
    console.log(this.state);
    this.toggleModal();
  };

  handleAddProtoElement = () => {
    this.setState(
      {
        modalHeader: {
          title: `Add Proto ${this.state.currentProtoElementType}`,
        },
        row1: [
          {
            element: "textbox",
            label: `Proto${this.state.currentProtoElementType} Description`,
            type: "text",
            placeholder: "Enter Description",
            onChange: this.onChange,
            size: "lg",
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
            onClick: this.toggleModal,
          },
          {
            element: "button",
            text: "Add",
            col: 2,
            variant: "primary",
            onClick: this.addProtoElement,
          },
        ],
      },
      () => {
        this.getProtoElements();
        this.toggleModal();
      }
    );
  };

  addProtoElement = () => {
    const token = this.props.auth.token;
    const type = this.state.currentProtoElementType;
    const prjId = this.state.projectId;
    const description = this.state.modalFormState;
    const actingFunction = (res: any) =>
      this.setState(
        (prevState) =>
          ({ protoElements: [...prevState.protoElements, res] } as any)
      );

    addProtoElement(token, type, prjId, description, actingFunction);
    this.toggleModal();
  };

  // creates delete proto element modal
  handleDeleteProtoElement = (id: any) => {
    this.setState({
      deleteId: id,
      modalHeader: { title: "Delete ProtoElement" },
      row1: [
        {
          element: "p",
          fontSize: "18px",
          text:
            "Are you sure you want to delete this protoelement? Doing so will permanently delete all data attached to it.",
        },
      ],
      row2: null,
      row3: null,
      footer: [
        {
          element: "button",
          text: "Cancel",
          variant: "primary",
          col: 2,
          onClick: this.toggleModal,
        },
        {
          element: "button",
          text: "Delete",
          variant: "danger",
          col: 2,
          onClick: this.deleteProtoElement,
        },
      ],
    });
    this.toggleModal();
  };

  onChange = (e: any) => {
    this.setState({
      modalFormState: e.target.value,
    });
  };

  onSelect = (e: any) => {
    this.setState({ currentProtoElementType: e.target.value });
  };

  returnToDashboard = () => {
    this.props.history.goBack();
  };

  handleProtoElementType = (type: any) => {
    this.setState({ currentProtoElementType: type }, () => {
      this.getProtoElements();
    });
  };

  onGetAllTriples = () => {
    const prjId = this.state.projectId;
    getAllTriples(prjId);
  };

  render() {
    return (
      <Container
        id="setting-page"
        fluid
        style={{ paddingRight: 0, paddingLeft: 0 }}
      >
        <NavMenu title="Settings" />

        <Container>
          <div id="settings-prjName" className="text-center">
            <h3 style={{ fontWeight: "bold" }}>
              {this.state.project && this.state.project.name
                ? `${this.state.project.name} Settings Page`
                : "Loading..."}
            </h3>
          </div>

          <Row style={{ marginBottom: "20px" }}>
            <GeneralModal
              showModal={this.state.showModal}
              toggleModal={this.toggleModal}
              header={this.state.modalHeader}
              size={this.state.modalSize}
              row1={this.state.row1}
              row2={this.state.row2}
              row3={this.state.row3}
              footer={this.state.footer}
            />

            <Col>
              <SettingsCard
                title="Researchers"
                annotatorList={this.state.annotators}
                seeModal={this.state.showModal}
                toggleModal={this.toggleModal}
                handleAdd={this.handleAddAnnotator}
                handleDelete={this.handleDeleteAnnotator}
              />
            </Col>

            <Col xs={4}>
              <SettingsCard
                title="Subjects"
                testSubjectList={this.state.subjects}
                seeModal={this.state.showModal}
                toggleModal={this.toggleModal}
                handleAdd={() =>
                  setTimeout(() => {
                    this.handleAddSubject();
                    setTimeout(this.toggleModal, 0);
                  }, 25)
                }
                handleDelete={this.handleDeleteSubject}
              />
            </Col>

            {/* <Col>
              <SettingsCard
                title="ProtoElements"
                protoElementsList={this.state.protoElements}
                seeModal={this.state.showModal}
                toggleModal={this.toggleModal}
                handleAdd={this.handleAddProtoElement}
                handleDelete={this.handleDeleteProtoElement}
                onSelectProtoElementType={this.handleProtoElementType}
              />
            </Col> */}
          </Row>

          <hr></hr>
          <Row style={{ marginTop: "20px" }}>
            <Col xs={1}>
              <Button
                size="lg"
                variant="dark"
                onClick={this.returnToDashboard}
                style={{ marginBottom: "15px" }}
              >
                Back
              </Button>
            </Col>
            {/* <Col xs={3}>
              <Button
                size="lg"
                variant="dark"
                onClick={this.onGetAllTriples}
                style={{ marginBottom: "15px" }}
              >
                Get All OWL Triples
              </Button>
            </Col> */}
            <Col xs={2}>
              <Button
                size="lg"
                variant="danger"
                onClick={this.handleDeleteProject}
              >
                Delete Project
              </Button>
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth,
  vimeoClient: state.vimeo.client,
});

export default connect(mapStateToProps, {})(Settings);
