import mongoose from 'mongoose'
import passport from 'passport'
// eslint-disable-next-line no-unused-vars
import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
// routes
import users from './routes/api/users'
import projects from './routes/api/projects'
import players from './routes/api/players'
import vimeoRoutes from './routes/api/vimeo'
import bio from './routes/api/bio'
import study from './routes/api/study'
import ajf from './routes/owl/ajf'
import protoelements from './routes/owl/protoelements'
import segments from './routes/owl/segments'
import selfreports from './routes/owl/selfreports'
// import { Agenda } from "agenda"
var jwt = require('jsonwebtoken')

// **** DB CONFIG ****

import configPassport from './config/passport'
import keys from './config/keys'
import { json2xml } from 'xml-js'
import User from './models/User'
// export const agenda = new Agenda({ db: { address: keys.agendaMongoURI } })
const LOCAL = true
const db = LOCAL ? keys.localMongoURI : keys.localMongoURI

mongoose.set('useFindAndModify', false)
const app: Express = express()
var expressWs = require('express-ws')(app)

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json({ limit: '100mb' }))

// app.use(function (req, res, next) {
//   console.log('middleware')
//   console.log(req.protocol)
//   req.testing = 'testing'
//   return next()
// })

app.get('/', function (req, res, next) {
  console.log('get route', req.testing)
  res.end()
})

app.ws('/api/ws', function (ws, req) {
  // console.log("Connected", ws)
  console.log(ws.protocol)
  ws.on('message', function (msg) {
    try {
      let parsed = JSON.parse(msg)
      if (parsed.type === "authenticate") {
        jwt.verify(parsed.payload.token, keys.secretOrKey, async function (err, decoded) {
          if (decoded == undefined || err !== null) {
            ws.send(JSON.stringify({ type: "authentication", payload: false, msg: err }))
          } else {
            User.findById(decoded.id)
              .then(user => {
                if (user) {
                  return ws.send(JSON.stringify({ type: "authentication", payload: true }))
                } else {
                  ws.send(JSON.stringify({ type: "authentication", payload: false }))
                  ws.closeGracefully()
                }
              })
              .catch(err => {
                throw JSON.stringify(err)
              })
          }
        })
      }
      else if (parsed.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }))
      } else {
        ws.send(msg)
      }
    } catch (err) {
      console.error(err)
    }
  })
  ws.on('error', (err) => {
    console.log(err)
  })
})

// OWL config
// const store = $rdf.graph()
// const ICE = 'http://www.semanticweb.org/lucid/ontologies/2018/2/ice#'
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, authSource: process.env.MONGO_AUTH_DB })
  .then(() => console.log('MongoDB Connected'))
  .catch((err: any) => console.log(err))



// passport middleware
app.use(passport.initialize())
// passport config
configPassport(passport)

// allow localhost (developing) and website (not known yet) to access these APIs
// var whitelist = ['http://api:4000', 'http://localhost', 'http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#', 'http://www.w3.org/2002/07/owl#', 'http://www.semanticweb.org/lucid/ontologies/2018/2/ice#', 'http://www.w3.org/2006/time#', 'http://localhost:3030/', 'http://www.semanticweb.org/lucid/ontologies/2018/3/ucsc#']
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       // accept this origin
//       callback(null, true)
//     } else {
//       // not an accepted origin
//       callback(new Error(origin + 'Not allowed by CORS'))
//     }
//   }
// }
app.use('*', cors())

/** Will add ```.serverConfig``` to ```req``` object */
const addServerConfig = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // passing some db and mongoose information to these routes
  req.serverConfig = {
    db: db,
    mongoose: mongoose,
  }
  next()
}

// API route modules.
app.use(`/api/users`, addServerConfig, users)
app.use(`/api/projects`, addServerConfig, projects)
app.use(`/api/players`, addServerConfig, players)
app.use(`/api/static`, express.static('../public'))
// Vimeo
app.use(`/api/`, vimeoRoutes)
app.use(`/api/`, bio)
app.use(`/api/`, study)

// OWL route modules
app.use('/owl/ajf', ajf)
app.use('/owl/protoelements', protoelements)
app.use('/owl/segments', segments)
app.use('/owl/selfreports', selfreports)

// This will catch any route not picked up by the above .get's, will also send users to react app.
// Will only work after running react build
app.get('*', (req, res) => {
  try {
    // The main react build file
    res.send("Out")
    // res.sendFile('client/public/index.html', { root: './' })
  } catch (err) {
    if (err !== undefined) {
      console.log('Error!', err)
    }
  }
})

// local server will run on port 4000
const PORT = process.env.NODE_PORT !== undefined ? process.env.NODE_PORT : 4000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
async function closeGracefully(signal) {
  console.log(`*^!@4=> Received signal to terminate: ${signal}`)

  // await fastify.close()
  // await mongoose.closeGracefully()// if we have a db connection in this app
  // await other things we should cleanup nicely
  process.exit()
}
process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)