import mongoose, { Schema } from 'mongoose'

enum LogTypes {
  Navigate,
  Comment,
  CloseEditor,
  StoryUpdate,
  ChangePassage,
  RewindPassage,
}

// creating project schema
const LogSchema = new Schema({
  ts: {
    type: Date,
    required: true
  },
  // ts_absolute: {
  //   type: Date,
  //   required: true
  // },
  player: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
  passageTitle: {
    type: String,
    required: false
  },
  eventId: {
    type: Number,
    required: true
  },
  data: {
    type: Object
  }
})

export interface ILog extends mongoose.Document {
  _id: string
  ts: Date
  // ts_absolute: Date
  player: string
  content: string
  passageTitle: string
  eventId: number
  data: any
}

export default mongoose.model<ILog>('logs', LogSchema)
