import mongoose, { Schema } from 'mongoose'

// create schema
const EmailConfirmationSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  dateRequested: {
    type: Date,
    required: true
  },
  dateConfirmed: {
    type: Date,
    required: false
  },
  verify_email: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  }

})

export interface IEmailConfirmation extends mongoose.Document {
  id: string
  date: Date
  verify_email: string
  email: string
  verified: string
}
export default mongoose.model<IEmailConfirmation>('confirmations', EmailConfirmationSchema)
