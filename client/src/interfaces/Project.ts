export default interface Project {
  name: string;
  createdBy: string;
  description: string;
  users: Array<string>;
  players: Array<string>;
  status: null | undefined | 'creator' | 'annotator';
  _id: string;
}
