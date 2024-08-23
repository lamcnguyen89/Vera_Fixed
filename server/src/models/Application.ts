import mongoose, { Schema } from 'mongoose'

/*      console.log(data.get('ethnicRacialAffiliation'));
      console.log(data.get('nativeLanguage'));
      console.log(data.get('languagePreference'));
      console.log(data.get('genderAffiliation'));
      console.log(data.get('prevExperience'));
      console.log(data.get('intro'));
      let dates = []
      email
*/
// creating project schema
const ApplicationSchema = new Schema({
  sonaIdentifier: {
    type: String,
    required: false
  },
  ethnicRacialAffiliation: {
    type: String,
    required: false
  },
  nativeLanguage: {
    type: String,
    required: false // optional
  },
  // able to modify project, add other users, etc... Creator of project will be here, and in users
  languagePreference: {
    type: String, // user id
    required: false
  },
  genderAffiliation: {
    type: String, // user id
    required: false
  },
  prevExperience: {
    type: String, // user id
    required: false
  },
  intro: {
    type: String, // user id
    required: false
  },
  // able to access project and add tags... no rights that are given to admins. Admins will be in this list too
  dates: {
    type: [String], // user ids
    required: true
  },
  email: {
    type: String, // user id
    required: true
  },
  cell: {
    type: String, // user id
    required: false
  },
  player: {
    type: String, // uid
    required: false
  }
})

export interface IApplication extends mongoose.Document {
  _id: string
  ethnicRacialAffiliation: string
  nativeLanguage: string
  languagePreference: string
  genderAffiliation: string
  prevExperience: string
  intro: string
  email: string
  dates: Array<string>
  player: string
}

export default mongoose.model<IApplication>('applications', ApplicationSchema)
