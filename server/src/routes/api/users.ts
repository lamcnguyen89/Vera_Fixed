import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import keys from '../../config/keys'
import passport from 'passport'
import { errRes } from '../../common/utilities'
// Load user model
import User from '../../models/User'

import deleteMethods from '../../common/deleteMethods'
const hardPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const easyPwd = /^.{4,}$/
const devMode = true
// parse all JSON coming into these routes
const router = express.Router()
router.use(express.json())

/**
 * @route   GET  api/users/test
 * @desc    Tests users route
 * @access  public
*/
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }))

/**
 * @route  POST  api/users/register
 * @desc   Registers user
 * @access public
 */
router.post('/register', (req, res) => {
  console.log("Registration attempted")
  // If the email is not in ucf.edu domain, reject the registration
  if (!req.body.email.includes('ucf.edu')) {
    return res.status(401).json(errRes('Email must be a UCF email address'))
  }
  try {
    User.findOne({ email: req.body.email })
      .then(user => {
        // Checks to make sure that this email doesn't exist in our DB yet
        if (user) {
          console.log("User found")
          res.status(401).json(errRes('Email already exists'))
        // } else if (!(devMode ? easyPwd : hardPwd).test(req.body.password)) {
        //   // Min password requirements...
        //   res.status(401).json(errRes('Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'))
        } else {
          const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
          })

          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              console.error(err)
              throw (err)
            }
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err
              newUser.password = hash
              newUser
                .save() // save to DB
                .then(() => {
                  res.json({ success: true })
                })
                .catch(err => {
                  res.status(400).json(errRes(`Unknown error: ${err}`))
                })
            })
          })
        }
      })
  } catch (error) {
    res.json('Unknown error')
  }
})

/**
 * @route  POST  api/users/login
 * @desc   logs in a user
 * @access public
 */
router.post('/login', (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    console.log("Logging in")
    // find user by email
    User.findOne({ email: { $regex: new RegExp("^" + email.toLowerCase(), "i") } })
      .then(user => {
        // check user
        if (!user) {
          return res.status(401).json('Email or password not found')
        }
        console.log("User found")
        // check password
        bcrypt.compare(password, user.password)
          .then((isMatch) => {
            if (isMatch) {
              // user matched
              // create jwt payload
              const payload = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email }

              // sign token
              jwt.sign(payload, keys.secretOrKey, { expiresIn: '8h' }, (error, token) => {
                if (error) {
                  console.error(error)
                  throw (error)
                }
                res.json({
                  success: true,
                  token: 'Bearer ' + token,
                  payload: payload
                })
              })
            } else {
              return res.status(401).json('Email or password not found')
            }
          })
      })
  } catch (error) {
    res.json(errRes(`Unknown error ${error}`))
  }
})

/**
 * @route  POST  api/users/current
 * @desc   Return current user
 * @access private
 */
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email
  })
})

/**
 * TODO: Do...
 * This will update the user's password field, given the user knows his password
 *
 */
router.post('/ChangePassword', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json('Under construction...')
})

/**
 * This will delete the user, and all things asociated with said user.
 * This means all project, players, and their files, will be deleted.
 *
 * Body param required:
 * TODO: password: (user's password to confirm they want to delete everything)
 *
 * Authentication header required in fetch header
 */
router.post('/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
  deleteMethods.deleteUser(req.user.id, req.serverConfig).then((result) => {
    return res.json(result)
  })
})

export default router
