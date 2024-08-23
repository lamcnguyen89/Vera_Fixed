import mongoose, { Schema } from 'mongoose'

// create schema
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
/*
  roles: {
    [] //fk
  },
  lastlogin: {
    //???
  },
  lastlogout: {
    //???
  }
  */
})

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  date: Date;
}

export default mongoose.model<IUser>('users', UserSchema)
