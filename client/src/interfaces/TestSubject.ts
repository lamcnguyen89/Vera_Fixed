export default interface TestSubject {
  playerName: string;
  vimeoVideos: Array<string>; // array of vimeo video links
  files: Array<string>; // array of file IDs from the DB
  _id: string;
}
