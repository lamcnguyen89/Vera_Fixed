import mongoose, { Schema } from 'mongoose'

// creating project schema
const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false // optional
  },
  // able to modify project, add other users, etc... Creator of project will be here, and in users
  createdBy: {
    type: String, // user id
    required: true
  },
  // able to access project and add tags... no rights that are given to admins. Admins will be in this list too
  users: {
    type: [String], // user ids
    required: true
  },
  sessions: {
    type: [String],
    required: false
  },
  // the subjects in each project. They will have files themselves, not the users or projects
  players: {
    type: [String], // array of Player id's...
    required: false
  },
  configuration: {
    checkinTimeInMinutes: {
      type: Number,
      default: 60
    },
    checkin: {
      type: Boolean,
      default: true
    },
    confirmation: {
      type: Boolean,
      default: true
    },
    schedule: {
      type: [Number],
      default: [
        0, // Step 0 offset (in minutes). Waiting Room
        15, // Step 1 (Twine Video)
        30, // Step 2 (Authoring 1)
        45, // Step 3 (Playing 1)
        60, // Step 4 (Authoring 2)
        75, // Step 5 (Playing 2)
        90, // Step 6 (Authoring 3)
        105, // Step 7 (Playing 3)
        120, // Step 8 (Authoring 4)
        200, // Step 9 (Survey?)
      ]
    }
  }
})

export interface IProject extends mongoose.Document {
  _id: string
  name: string
  description: string
  createdBy: string
  sessions: Array<string>
  users: Array<string>
  players: Array<string>
}

export default mongoose.model<IProject>('projects', ProjectSchema)
