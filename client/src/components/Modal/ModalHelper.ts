export default {
  createProject: {
    modalType: 'add-prj',
    title: 'Create a new project',
    formPlaceholder: "Enter the project's name",
    acceptBtn: 'Add',
    delete: {
      modalType: 'delete',
      target: 'project',
      title: 'Delete Project',
      warningMsg: `Are you sure you want to delete this project? doing so will
                    permanently delete all the data attached to this project `,
      warningPlaceholder: 'Enter the project name to delete it',
      acceptBtn: 'Delete'
    }
  },
  // deleteProject: {
  //     modalType: "delete",
  //     deleteTitle: "Delete Project",
  //     warningMsg: `Are you sure you want to delete this project? doing so will
  //                 permanently delete all the data attached to this project `,
  //     acceptBtn: "Delete"
  // },
  addAnnotator: {
    modalType: 'add-annotator',
    title: 'Add a new annotator',
    formPlaceholder: 'Enter Annotators email',
    acceptBtn: 'Add',
    delete: {
      modalType: 'delete',
      target: 'annotator',
      title: 'Remove annotator',
      warningMsg: `Are you sure you want to remove this annotator from the project? doing so will
                    cause the project to be inaccessible to them`,
      acceptBtn: 'Delete'
    }
  },
  // deleteAnnotator: {
  //     modalType: "delete",
  //     deleteTitle: "Remove annotator",
  //     warningMsg: `Are you sure you want to remove this annotator from the project? doing so will
  //                 cause the project to be inaccessible to them`,
  //     acceptBtn: "Delete"
  // },
  addTestSubject: {
    modalType: 'add-subject',
    title: 'Add a new test subject',
    formPlaceholder: 'Enter test subjects name',
    videos: 'Import content videos from vimeo',
    HR: 'Import Heart Rate',
    SC: 'Import Skin Conductivity',
    acceptBtn: 'Add',
    delete: {
      modalType: 'delete',
      target: 'subject',
      deleteTitle: 'Remove test subject',
      warningMsg: `Are you sure you want to remove this test subject from the project? doing so will
                    permanently remove any data that's attached to them from the project`,
      acceptBtn: 'Delete'
    }
  }
  // deleteTestSubject: {
  //     modalType: "delete",
  //     deleteTitle: "Remove test subject",
  //     warningMsg: `Are you sure you want to remove this test subject from the project? doing so will
  //                 permanently remove any data that's attached to them from the project`,
  //     acceptBtn: "Delete"
  // }
}
