// eslint-disable-next-line no-unused-vars
import { Strategy, ExtractJwt } from 'passport-jwt'

// import mongoose from 'mongoose'
import User from '../models/User'
import keys from './keys'

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretOrKey
}
export default (passport: any) => {

  passport.use(new Strategy(opts, (jwtPayload: { id: string }, done: Function) => {
    // console.log("Finding user by payload..." + jwtPayload.id)m..
    User.findById(jwtPayload.id)
      .then(user => {
        if (user) {
          return done(null, user)
        }
        return done(null, false)
      })
      .catch(err => {
        throw JSON.stringify(err)
      })
  })
  )
}
