import mongoose, { Schema, ObjectId } from 'mongoose'

// create schema
const PlayerSchema = new Schema({
  uid: {
    type: String,
    required: true
  },
  projectId: {
    type: 'ObjectId',
    ref: 'projects',
    required: true
  },
  exclude: {
    type: Boolean,
    required: false
  },
  consented: {
    type: Boolean,
    required: false
  },
  consentedDate: {
    type: Date,
    required: false
  },
  timezone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  major: {
    type: String,
    required: false
  },
  cell: {
    type: String,
    required: false
  },
  availability: {
    type: [Date],
    required: false
  },
  partner: {
    type: String,
    required: false
  },
  note: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    required: false
  },
  vimeoVideos: {
    type: [],
    required: false
  },
  files: {
    type: [], // any file...
    required: false
  },
  storyId: {
    type: String, // any file...
    required: false
  },
  state: {
    type: String,
    required: false
  },
  checkedIn: {
    type: Date,
    required: false
  },
  communications: {
    type: [],
    required: false
  },
  sessionStart: {
    type: Date,
    required: false
  },
  currentStory: {
    type: String, // any file...
    required: false
  },
  previousStories: {
    type: [String], // any file...
    required: false
  },
})

export interface IPlayer extends mongoose.Document {
  playerName: string
  projectId: ObjectId
  consented: boolean
  partner: string
  exclude: boolean
  bio: string
  email: string
  cell: string
  note: string
  state: string
  vimeoVideos: Array<string>
  files: Array<string>
  storyId: string
  checkedIn: Date
  sessionStart: Date
  currentStory: string
  previousStories: Array<string>
  communications: Array<string>
  comments: Array<any>
}
export default mongoose.model<IPlayer>('players', PlayerSchema)
