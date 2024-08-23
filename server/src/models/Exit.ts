import mongoose, { Schema } from 'mongoose'

// creating project schema
const ExitSchema = new Schema({
  ts: {
    type: Date,
    required: false
  },
  uid: {
    type: String,
    required: false
  },
  q1: {
    type: String,
    required: false
  },
  q2: {
    type: String,
    required: false
  },
  q3: {
    type: String,
    required: false
  },
  q4: {
    type: String,
    required: false
  },
  q5: {
    type: String,
    required: false
  },
  q6: {
    type: String,
    required: false
  },
  q7: {
    type: String,
    required: false
  },
  q8: {
    type: String,
    required: false
  },
  q9: {
    type: String,
    required: false
  },
  q10: {
    type: String,
    required: false
  },
  q11: {
    type: String,
    required: false
  },
  q12: {
    type: String,
    required: false
  },
  q13: {
    type: String,
    required: false
  },
  q14: {
    type: String,
    required: false
  },
})

export interface IExit extends mongoose.Document {
    _id: string;
    ts: Date,
    uid: string,
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    q7: string;
    q8: string;
    q9: string;
    q10: string;
    q11: string;
    q12: string;
    q13: string;
    q14: string;
}

export default mongoose.model<IExit>('exits', ExitSchema)
