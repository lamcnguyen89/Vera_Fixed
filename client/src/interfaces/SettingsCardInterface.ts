
// working on it
export default interface SettingsCardInterface {
  list: Array<Annotator> | Array<TestSubject> | Array<any>
}

interface Annotator {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
}

interface TestSubject {
  playerName: string;
  vimeoVideos: Array<string>; // array of vimeo video links
  files: Array<string>; // array of file IDs from the DB
  _id: string;
}
