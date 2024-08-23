// import fs from 'fs'
import express from "express"
import * as csv from "fast-csv"
import Player from "../../models/Player"
import EmailConfirmation from "../../models/Confirmations"
import Application from "../../models/Application"
import Exit from "../../models/Exit"
import Project from "../../models/Project"
import passport from "passport"
import Log from "../../models/Log"
import { InvalidatedProjectKind } from "typescript"
// const { zip } = require('zip-lib')

const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

const multer = require('multer')
const { parse } = require('csv')
var nodemailer = require('nodemailer')
process.env.TZ = 'America/New_York'
// create reusable transporter object using the default SMTP transport

// Configure Multer for File Uploads
const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

async function sendMail(mailOptions) {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport(`smtps://john%40lucidbard.com:b3h6cd2y8qdrk9me@smtp.fastmail.com`)
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error)
      } else {
        resolve('Message sent: ' + info.response)
      }
    })
  }
  )
}

function template(strings, ...keys) {
  return (function (...values) {
    let dict = values[values.length - 1] || {}
    let result = [strings[0]]
    keys.forEach(function (key, i) {
      let value = Number.isInteger(key) ? values[key] : dict[key]
      result.push(value, strings[i + 1])
    })
    return result.join('')
  })
}

let completeEmailHtml = template`<div style="font-family: arial; width: 100%; text-align: center; border: 4px solid #888; border-radius: 5px; width: 500px; max-width: 500px; margin: auto; padding: 20px;">
  <p>
    Thank you for participating in the Imagining the Other Study!
  </p>
  <p>
  Your certificate of completion is attached.
    </p>
    </div>`
let completeEmailText = template`Thank you for participating in the Imagining the Other Study!

Your certificate of completion is attached.`

let confirmEmailHtml = template`<div style="font-family: arial; width: 100%; text-align: center; border: 4px solid #888; border-radius: 5px; width: 500px; max-width: 500px; margin: auto; padding: 20px;">
    <p>
        Welcome to the Imagining the Other Study!
    </p>
    <p>
    <table style="margin-right:auto;margin-left:auto"  cellspacing="0" cellpadding="0">
  <tr>
      <td>
          <table cellspacing="0" cellpadding="0">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#ED2939">
                      <a href="https://${'domain'}/api/confirmEmail?verify_email=${'emailId'}&id=${'participantId'}" target="_blank" style="padding: 8px 12px; border: 1px solid #ED2939;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                          Confirm email
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
    </p>
    </div>`
let confirmEmailText = template`<div style="font-family: arial; width: 100%; text-align: center; border: 4px solid #888; border-radius: 5px; width: 500px; max-width: 500px; margin: auto; padding: 20px;">
    <p>
        Welcome to the Imagining the Other Study!
    </p>
    <p>
        <a href="https://${'domain'}/api/confirmEmail?verify_email=${'emailId'}&id=${'participantId'}">Click here to confirm your e-mail address!</a>
    </p>
    </div>`

let confirmTimeHtml = template`<div style="font-family: arial; width: 100%; text-align: center; border: 4px solid #888; border-radius: 5px; width: 500px; max-width: 500px; margin: auto; padding: 20px;">
    <p>Welcome to the Imagining the Other Study!</p>
    <p>You have been scheduled for ${'datetimeText'}. </p>
    <p>You may confirm you can attend the scheduled time by visiting the following link, so we can ensure that everyone has a partner. You can confirm by visiting the following link:</p>
    <table style="margin-right:auto;margin-left:auto" cellspacing="0" cellpadding="0">
  <tr>
      <td>
          <table style="margin-right:auto;margin-left:auto" cellspacing="0" cellpadding="0">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#ED2939">
                      <a href="https://${'domain'}/api/confirmAppointment/${'participantId'}?session=${'datetime'}" target="_blank" style="padding: 8px 12px; border: 1px solid #ED2939;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                          Confirm Appointment
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table>
    <p>Check in will be available an hour before the study start time to check in.  
    You must complete the study on a laptop or a desktop.    
    <br/>
<table style="margin-right:auto;margin-left:auto" cellspacing="0" cellpadding="0">
  <tr>
      <td>
          <table cellspacing="0" cellpadding="0">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#0060FF">
                      <a href="https://${'domain'}/study/${'projectId'}/${'participantId'}/session" target="_blank" style="padding: 8px 12px; border: 1px solid #ED2939;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                          Check In for Study Session
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table></p>
    <p>If you wish to withdraw for whatever reason,
    please click below. Once you've withdrawn, you will not be able to participate in a future session. 
        <a href="https://${'domain'}/api/withdrawParticipant/${'participantId'}">Click here to withdraw from the study.</a>
    </p>
    <p>Thanks again for signing up!<br/>Imagining the Other Study Team</p>
    </div>`

let confirmTimeText = template`Welcome to the Imagining the Other Workshop!

You have been scheduled for ${'datetime'}.

You must confirm you can attend the scheduled time by visiting the following link before the day of the study:
https://${'domain'}/api/confirmAppointment/${'participantId'}?session=${'datetime'}

Check in will be available an hour before the study start time to check in. You must check in at least 20 minutes before the start. 
You must complete the study on a laptop or a desktop.
https://${'domain'}/study/${'projectId'}/${'participantId'}/session
    
If you wish to withdraw for whatever reason, please click below. Once you've withdrawn, you will not be able to participate in a future session. 
https://${'domain'}/api/withdraw/${'projectId'}/${'participantId'}

Thanks again for signing up!
Imagining the Other Study Team
`
let remindTimeHtml = template`<div style="font-family: arial; width: 100%; text-align: center; border: 4px solid #888; border-radius: 5px; width: 500px; max-width: 500px; margin: auto; padding: 20px;">
    <p>
        Thank you for signing up for the "Imagining the Other" Workshop!
    </p>
    <p>This is a reminder that your study appointment is today.</p>
<p>You have been scheduled for ${'datetime'}.</p>
<p>Please visit the following link one (1) hour before the study start time to check in.</p>
<p>You must complete the study on a laptop or a desktop.</p>
<table style="margin-right:auto;margin-left:auto"  cellspacing="0" cellpadding="0">
  <tr>
      <td>
          <table cellspacing="0" cellpadding="0">
              <tr>
                  <td style="border-radius: 2px;" bgcolor="#0060FF">
                      <a href="https://${'domain'}/study/${'projectId'}/${'participantId'}/session" target="_blank" style="padding: 8px 12px; border: 1px solid #ED2939;border-radius: 2px;font-family: Helvetica, Arial, sans-serif;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                          Check In for Study Session
                      </a>
                  </td>
              </tr>
          </table>
      </td>
  </tr>
</table></p>
<p>If you wish to withdraw for whatever reason, please click below. Once you've withdrawn, you will not be able to participate in a future session. </p>
        <p><a href="https://${'domain'}/api/withdrawParticipant/${'participantId'}">Click here to withdraw from the study.</a>
</p>
</div>`

let remindTimeText = template`Thank you for signing up for the "Imagining the Other" Study!

This is a reminder that your study appointment is today.

You have been scheduled for ${'datetime'}.

Please visit the following link one (1) hour before the study start time to check in.

You must complete the study on a laptop or a desktop.

https://${'domain'}/study/${'projectId'}/${'participantId'}/session
    
If you wish to withdraw for whatever reason, please click below. Once you've withdrawn, you will not be able to participate in a future session. 
https://${'domain'}/api/withdraw/${'projectId'}/${'participantId'}`




// import ChartjsNode from 'chartjs-node'
const questions = {
  "_id": {
    "$oid": "60d0b51f11ebcc9418a691f0"
  },
  "questions": [{
    "text": "Was the Platform easy to use? ",
    "type": "q"
  }, {
    "text": "Do you have any suggestions for improving the Platform?  If so, please explain.",
    "type": "q"
  }, {
    "text": "Were all the instructions easy to understand? ",
    "type": "q"
  }, {
    "text": "Please answer these next questions from your experience as an IDN designer. ",
    "type": "s"
  }, {
    "text": "1. What did you learn from your experience as an IDN designer?",
    "type": "q"
  }, {
    "text": "2. Did comments from the player surprise you in any way? If so, how were those comments surprising?",
    "type": "q"
  }, {
    "text": "3. Did the comments from the player inform you in any way? If so, how are those comments informative?",
    "type": "q"
  }, {
    "text": "4. How would you suggest improving this IDN design process in future research and education?",
    "type": "q"
  }, {
    "text": "5. Is there anything else you would like to comment on about the design process? Please explain.",
    "type": "q"
  }, {
    "text": "Please answer these next questions from your experience as an IDN player. ",
    "type": "s"
  }, {
    "text": "1. What did you learn from the IDN player process?",
    "type": "q"
  }, {
    "text": "2. Did your experience as a player of a peer’s IDN surprise you in any way? If so, how was the player experience surprising?",
    "type": "q"
  }, {
    "text": "3. Did your experience as a player of a peer’s IDN inform you in any way? If so, how was the player experience informative?",
    "type": "q"
  }, {
    "text": "4. How would you suggest improving the IDN play process in future research and education?",
    "type": "q"
  }, {
    "text": "5. Is there anything else you would like to comment on about the IDN player experience process?",
    "type": "q"
  }],
  "project": {
    "$oid": "60c14d296822a026656bcc2d"
  }
}
const router = express.Router()

//const emailVerifications = [{ id: 0, verify_email: "8d2c8c18-27a0-4e4e-8b03-1a76db4e9464", verified: true, email: "" }, { id: 1, verify_email: "5c5b9f91-7c84-4ae5-9960-8304556a61a2", verified: true, email: "" }]
router.get(
  "/withdrawparticipant/:studyId/:participantId", async function (req, res) {
    let participant = await Player.findOne({ uid: req.params.participantId })
    if (participant !== undefined && participant !== null && participant.state !== "withdrawn") {
      participant.state = "withdrawn"
      participant.partner = undefined
      participant.save()
      let reason = ""
      switch (req.headers.Reason) {
        case "noconfirmation":
          reason = "You either did not confirm in time or didn't check in prior to 15 minutes before the start of the session."
        default:
          reason = ""
      }
      var mailOptions = {
        from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
        to: "Daiute, Colette <CDaiute@gc.cuny.edu>; jtm@ucf.edu", // list of receivers
        subject: 'Subject ' + participant.note + " withdrew from the study", // Subject line
        text: "A subject has withdrawn from the study", // plaintext body
        html: "<p>A subject has withdrawn from the study. Their partner may need to be re-paired</p><p>" + reason + "</p>" // html body
      }
      console.log("Sending mail... ", mailOptions)
      await sendMail(mailOptions)
      const emailHtml = remindTimeHtml({ 'domain': process.env.DOMAIN, 'projectId':req.params.studyId, 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toLocaleString() })
      const emailText = remindTimeText({ 'domain': process.env.DOMAIN, 'projectId': req.params.studyId, 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toLocaleString() })
      console.log(emailHtml)
      // setup e-mail data with unicode symbols
      mailOptions = {
        from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
        to: `${participant.email}; Daiute, Colette <CDaiute@gc.cuny.edu>; jtm@ucf.edu`, // list of receivers
        subject: 'A Subject has withdrawn from the study', // Subject line
        text: emailText, // plaintext body
        html: emailHtml // html body
      }
      let statusOfEmail = ""
      if (participant.communications == undefined) {
        participant.communications = []
      }
      participant.communications.push(`Sent: ${new Date()}: Content: ${emailHtml}, Status: ${statusOfEmail}`)
      await sendMail(mailOptions)
      res.send("You have been withdrawn from the study. Thank you for your interest!")
    } else if (participant !== undefined && participant !== null && participant.state === "withdrawn") {
      res.send("You have already withdrawn from the study.")
    } else {
      res.send("No participant found by that id")
    }
  })
router.get(
  "/verifyEmail/:verify_email",
  async function (req, res) {
    console.log("verify email request...")
    console.log(req.params.verify_email)
    let email = await EmailConfirmation.findOne({ verify_email: req.params.verify_email })
    if (email !== null && email !== undefined && (email.state == "verified" || email.state == "confirmed")) {
      email.state = "confirmed"
      email.dateConfirmed = new Date()
      email.save()
      console.log(email)
      res.sendStatus(200)
    } else {
      console.log("error", req.params.verify_email)
      res.sendStatus(202)
    }
  }
)

router.get(
  "/study/:studyId",
  async function (req, res) {
    try {
      // First, check if project is a project
      let project = await Project.findOne({ _id: req.params.studyId })
      res.send(JSON.stringify(project))
    } catch {
      // Then try to find one by name:
      let project = await Project.findOne({ pid: req.params.studyId })
      res.send(JSON.stringify(project))
    }
  }
)

router.get(
  "/confirmEmail",
  async function (req, res) {
    let item = await EmailConfirmation.findOne({ id: req.query.id, verify_email: req.query.verify_email })
    if (item !== undefined && item !== null) {
      item.state = "verified"
      await item.save()
      res.send("<html><body><p>Your email address has been confirmed. You can close this tab or window and return to the sign in form.</p></body></html>")
    } else {
      res.send("<html><body><p>There was an error in confirming your email. Please resend the email using the button in the form and try again.</p></body></html>")
    }
  }
)
router.get(
  "/confirmAppointment/:participantId",
  async function (req, res) {
    console.log(req.query.session)
    console.log(new Date(req.query.session))
    let item = await Player.findOne({ uid: req.params.participantId, sessionStart: new Date(req.query.session).toUTCString() })
    if (item !== undefined && item !== null) {
      if (item.state !== "confirmed") {
        item.state = "confirmed"
        await item.save()
        res.send(`<html><body><h3>Study Appointment Confirmation</h3><p>You have confirmed your appointment for: <br/> ${new Date(item.sessionStart).toLocaleString()}. You will need to check in on the day of the session 1 hour before the session, and no later than 30 minutes beforehand. </p><p>You can close this tab now..</p></body></html>`)
      } else if (item.state === "confirmed" || item.state === "checkedin") {
        res.send(`<html><body><h3>Study Appointment Confirmation</h3><p>You have already confirmed your appointment for: <br/>${new Date(item.sessionStart).toLocaleString()}.</p> You will need to check in on the day of the session 1 hour before the session, and no later than 30 minutes beforehand.</p><p>You can close this tab now..</p></body></html>`)
      }
    } else {
      res.send("<html><body><p>There was an error in confirming your appointment. Please contact the study staff at sherlock@mrl.ai</p></body></html>")
    }
  }
)

router.put(
  "/sendCheckInReminder/:participantId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log("Received request to remind participant of check in")
    async function sendCheckInEmail(pid) {
      let participant = await Player.findOne({ uid: pid })
      const emailHtml = remindTimeHtml({ 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toLocaleString() })
      const emailText = remindTimeText({ 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toLocaleString() })
      console.log(emailHtml)
      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
        to: `${participant.email}; Daiute, Colette <CDaiute@gc.cuny.edu>; jtm@ucf.edu`, // list of receivers
        subject: 'Reminder: Study Today for Imagining the Other', // Subject line
        text: emailText, // plaintext body
        html: emailHtml // html body
      }
      let statusOfEmail = ""
      if (participant.communications == undefined) {
        participant.communications = []
      }
      participant.communications.push(`Sent: ${new Date()}: Content: ${emailHtml}, Status: ${statusOfEmail}`)
      await participant.save()
      await sendMail(mailOptions)
    }
    await sendCheckInEmail(req.params.participantId)
    res.sendStatus(200)
  }
)
router.put(
  "/sendScheduleEmail/:projectId/:participantId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log("Received request to schedule participant")
    console.log(req.query)
    async function sendScheduleEmail(pid) {
      let participant = await Player.findOne({ uid: pid })
      const emailHtml = confirmTimeHtml({ 'domain': process.env.DOMAIN, projectId: req.params.projectId, 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toISOString(), 'datetimeText': new Date(participant.sessionStart).toLocaleString() })
      const emailText = confirmTimeText({ 'domain': process.env.DOMAIN, projectId: req.params.projectId, 'participantId': participant.uid, 'datetime': new Date(participant.sessionStart).toISOString(), 'datetimeText': new Date(participant.sessionStart).toLocaleString() })
      console.log(emailHtml)
      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
        to: `${participant.email}; Daiute, Colette <CDaiute@gc.cuny.edu>; jtm@ucf.edu;`, // list of receivers
        subject: 'Your Appointment for Imagining the Other Study', // Subject line
        text: emailText, // plaintext body
        html: emailHtml // html body
      }
      participant.state = "scheduled"
      let statusOfEmail = ""
      if (participant.communications == undefined) {
        participant.communications = []
      }
      participant.communications.push(`Sent: ${new Date()
        }: Content: ${emailHtml}, Status: ${statusOfEmail} `)
      await participant.save()
      await sendMail(mailOptions)
    }
    await sendScheduleEmail(req.params.participantId)
    res.sendStatus(200)
  }
)

router.put(
  "/sendConfirmEmail",
  async function (req, res) {
    console.log("Received confirm email request")
    let emailId = uuidv4()
    let participantId = uuidv4()
    const emailVerifyHtml = confirmEmailHtml({ 'domain': process.env.DOMAIN, 'participantId': participantId, 'emailId': emailId })
    const emailVerifyText = `
Welcome to the Imagining the Other Study!

Click here to confirm your e - mail address: https://sherlock.mrl.ai/api/confirmEmail?verify_email=${emailId}&id=${participantId}
    `
    console.log(`http://${process.env.DOMAIN}/api/confirmEmail?verify_email=${emailId}&id=${participantId}`)
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
      to: req.query.email, // list of receivers
      subject: 'Please confirm your email for Imagining the Other', // Subject line
      text: emailVerifyText, // plaintext body
      html: emailVerifyHtml // html body
    }
    sendMail(mailOptions)
    let emailVerify = new EmailConfirmation({ 'domain': process.env.DOMAIN, id: participantId, verify_email: emailId, verified: false, dateRequested: new Date(), email: req.query.email, dateConfirmed: undefined, state: "requested" })
    await emailVerify.save()
    res.send({ verify_email: emailId, uid: participantId })
  }
)


router.put(
  "/sendCompletionCertificate/:participantId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    let participant = await Player.findOne({ uid: req.params.participantId })
    participant.state = "certificateSent"
    await participant.save()
    const emailVerifyHtml = completeEmailHtml()
    const emailVerifyText = completeEmailText()
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"Imagining the Other Study Team" <sherlock@mrl.ai>', // sender address
      to: `${participant.email}`, // list of receivers
      subject: 'Your Completion Certificate for Imagining the Other', // Subject line
      text: emailVerifyText, // plaintext body
      html: emailVerifyHtml, // html body
      attachments: [
        {
          filename: 'certificateOfCompletion.pdf',
          contentType: 'application/pdf',
          path: path.join(__dirname, '../../../static/certificateOfCompletion.pdf'),
        }]
    }
    console.log(path.join(__dirname, '../../../static/certificateOfCompletion.pdf'))
    await sendMail(mailOptions)
    res.sendStatus(200)
  }
)

router.post(
  "/exit",
  async function (req, res) {
    console.log(req.body)
    let app = new Exit(req.body)
    await Player.findOneAndUpdate({ uid: req.body.uid }, { $set: { "state": "complete" } })
    await app.save()
    res.sendStatus(200)
  }
)
router.get(
  "/exit/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Exit.findOne({ uid: req.params.playerId })
      .then(exit => {
        res.json(exit)
      })
  }
)
router.delete(
  "/logs/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    Log.deleteMany({ player: req.params.playerId })
      .then(
        () => res.sendStatus(200)
      )
  }
)
router.post(
  "/log",
  function (req, res) {
    // let contents = JSON.parse(req.body)
    console.log(req.body)
    let log = new Log(req.body)
    log.save()
    console.log("Saving log ",log);
    // TODO: Re-enable this for TWINE STUDIES
    if (log.eventId == 3) {
      console.log("Updating player story...")
      Player.findOne({ uid: log.player })
        .then(player => {
          player.currentStory = log.content
          player.save()
        })
    }
    res.sendStatus(200)
  }
)
router.patch(
  "/player/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    console.log("Patching player...")
    let player = req.body
    console.log("Patching player...")
    console.log(player)
    Player.findOneAndUpdate({ uid: req.params.playerId }, { $set: player })
      .then((player) => {
        // res.sendStatus(200)
        res.send(player)
        console.log(player)
      })
  })
router.put(
  "/player/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    let player = req.body
    console.log("Updating player...")
    console.log(player)
    Player.findOneAndUpdate({ uid: req.params.playerId }, player)
      .then(() => res.sendStatus(200))
  })
let skipNextParticipant = { "RED": false, "YELLOW": false }
let currentParticipant = {"RED": "", "YELLOW": ""}
router.get(
  "/getParticipant/:project/:unit",
  function (req, res) {
    if (skipNextParticipant[req.params.unit]) {
      res.send("") 
    } else {
      res.send(currentParticipant[req.params.unit])
    }
  }
)
router.post(
  "/skipParticipant/:projectId/:unit",
  function (req, res) {
    skipNextParticipant[req.params.unit] = true
    currentParticipant[req.params.unit] = ""
    res.sendStatus(200)
  })

router.post(
  "/updateParticipantState/:udid/:state",
  function (req, res) {
    let player = Player.findOne({ uid: req.params.udid })
      .then((player) => {
        player.state=req.params.state
        player.save()
      })  
    res.sendStatus(200)
  })
router.post(
  "/completeParticipant/:projectId/:udid",
  function (req, res) {
    let player = Player.findOne({ uid: req.params.udid })
      .then((player) => {
        player.state="complete"
        player.save()
      })
    if (currentParticipant["RED"] == req.params.udid) {
      currentParticipant["RED"] = ""
    }
    if (currentParticipant["YELLOW"] == req.params.udid) {
      currentParticipant["YELLOW"] = ""
    }
    res.sendStatus(200)
  })

router.post(
  "/enrollParticipant/:projectId/:unit",
  function (req, res) {
    let player = req.body
    console.log(req.params.projectId)
    console.log(req.params.unit)
    let color = req.params.unit == "RED" ? "R" : "Y"
    Project.findById(req.params.projectId)
      .then(async project => {
        Player.find({}).then(async (players) => {
          let max
          if (players.length == 0) {
            max = -1
          } else {
            let filtered = players.filter(p=>p.note.slice(0,1)==color).map(player => parseInt(player.note.slice(1)))
            filtered = filtered.filter(a => (a == a))
            max = Math.max(...filtered)
          }
          let playerId = uuidv4()
          let player = new Player(
            {
              "availability": [],
              "storyId": undefined,
              "cell": "",
              "consented": true,
              "consentedDate": new Date(),
              "currentStory": `{}`,
              "email": "",
              "files": [],
              "bio": "",
              "note": color + (max + 1).toString(),
              "previousStories": [],
              "state": 'enrolled',
              "uid": playerId,
              "projectId": project._id,
              "vimeoVideos": [],
            })
          currentParticipant[req.params.unit] = playerId
          skipNextParticipant[req.params.unit] = false
          player.save()
            .then(() => res.send({ udid: player.uid }))
          // res.send({})
        })
      })
  })
router.post(
  "/enrollPlayer/:projectId",
  function (req, res) {
    let player = req.body
    Project.findOne({ pid: req.params.projectId })
      .then(async project => {
        Player.find({}).then(async (players) => {
          let max
          if (players.length == 0) {
            max = -1
          } else {
            let filtered = players.map(player => parseInt(player.note.slice(1)))
            filtered = filtered.filter(a => (a == a))
            max = Math.max(...filtered)
          }
          let player1Id = uuidv4()
          let story1Id = uuidv4()
          let passage1 = uuidv4()
          let app = new Application({ ...req.body, player: player1Id })
          if (players.find(p => p.email == app.email) !== undefined) {
            res.send({ playerId: null, error: "Error: Already enrolled email" })
            return
          }
          let player = new Player(
            {
              "availability": app.dates,
              "storyId": story1Id,
              "cell": app.cell,
              "consented": true,
              "consentedDate": new Date(),
              "currentStory": `{
            \"id\":\"${story1Id}\",\"version\":\"\",\"info\":{\"id\":\"${story1Id}\",\"lastUpdate\":\"2021-06-09T20:01:29.020Z\",\"ifid\":\"F165FBA2-FFAB-45FA-81F8-A579A689D929\",\"tagColors\":{},\"name\":\"My Story\",\"startPassage\":\"${passage1}\",\"zoom\":1,\"snapToGrid\":true,\"stylesheet\":\"\",\"script\":\"\",\"storyFormat\":\"Harlowe\",\"storyFormatVersion\":\"3.2.3\"},\"passages\":[{\"id\":\"${passage1}\",\"story\":\"${story1Id}\",\"top\":500,\"left\":475,\"width\":100,\"height\":100,\"tags\":[],\"name\":\"Untitled Passage\",\"selected\":true,\"text\":\"Double-click this passage to edit it.\"}]}`,
              "email": app.email,
              "files": [],
              "bio": app.intro,
              "note": "P" + (max + 1).toString(),
              "previousStories": [],
              "state": 'enrolled',
              "uid": player1Id,
              "projectId": req.params.projectId,
              "vimeoVideos": [],
            })
          await app.save()
          player.save()
            .then(() => res.send({ playerId: player.uid }))
        })
      })
  })

router.get(
  "/player/:playerId",
  function (req, res) {
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(player => {
          Application.findOne({ player: req.params.playerId })
            .then(application => {
              if (player !== null) {
                player.consented = application !== null
                res.json(player)
              } else {
                res.sendStatus(301)
              }
            })
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/players/:studyId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    console.log(req.user)
    console.log("Got request for players...")
    Project.findById(req.params.studyId).then(
      project => {
        try {
          console.log(project._id)
          let user = project.users.find(id => req.user._id.equals(id))
          if (user !== undefined) {
            Player.find({ projectId: project._id })
              .then(players => {
                res.json(players)
              })
          } else {
            res.sendStatus(401)
          }
        } catch (err) {
          console.log(err)
          res.sendStatus(301)
        }
      })
  }
)
router.post(
  "/logs/:studyId/:playerId",
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  async function (req, res) {
    console.log("Posting player logs for " + req.params.playerId)

    if (!req.file) {
      return res.status(400).send('No file uploaded.')
    }

    const logs = []
    const studyId = req.params.studyId
    const playerId = req.params.playerId
    // If participant dosen't exist, create it and associate with study
    let participant = await Player.findOne({ uid: req.params.playerId })
    console.log(participant)
    if (participant == null) {
      console.log("Participant not found. Creating new participant")
      participant = new Player({ uid: req.params.playerId, projectId: studyId })
    }
    console.log("Getting player " + req.params.playerId + " for " + req.params.studyId)
    // Parse CSV file
    const stream = require('stream')
    const bufferStream = new stream.PassThrough()
    bufferStream.end(req.file.buffer)
    let sessionStart = null
    bufferStream.pipe(parse({
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (context.header) {
          return value
        }
        if (!isNaN(value) && value.trim() !== '') {
          return parseFloat(value)
        }
        return value
      }
    }))
      .on('data', (row) => {
        let { ts, eventId, ...otherData } = row 
        if (sessionStart == null) {
          sessionStart = ts
        }
        // Customize the row parsing as necessary
        const log = new Log({
          ts: ts,
          studyId: studyId,
          player: playerId,
          eventId: eventId,
          data: otherData
        })
        // Add in remaining fields as necessary

        logs.push(log)
      })
      .on('end', async () => {
        console.log("Finished parsing CSV")
        // let participant = Player.findOne({ uid: playerId })
        if (participant) {
          participant.sessionStart = sessionStart
          await participant.save()
        }
        // Save all logs to the database
        await Log.insertMany(logs)
          .then(() => {
            console.log("All logs saved successfully")
            res.sendStatus(200)
          })
          .catch(err => {
            console.error("Error saving logs: ", err)
            res.status(500).send("Error saving logs")
          })
      })
      .on('error', (err) => {
        console.error("Error parsing CSV: ", err)
        res.status(500).send("Error parsing CSV")
      })
  }
);

router.get(
  "/logs/zip/:studyId",
  passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    try {
      console.log("Getting all player logs for " + req.params.studyId)

      // Get all players from projectId
      const players = await Player.find({ projectId: req.params.studyId })

      // Get all logs for each player
      const logsPromises = players.map(player => Log.find({ player: player.uid }))
      const allLogs = await Promise.all(logsPromises)

      // Flatten the array of arrays
      const logs = allLogs.flat()

      // Create a temporary directory to store the log files
      const tmpDir = path.join(__dirname, 'tmp')
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir)
      }

      // Write each log to a file in the temporary directory
      logs.forEach(log => {
        const logData = JSON.stringify(log)
        const logFilePath = path.join(tmpDir, `${log.player}-${log.ts}.json`)
        fs.writeFileSync(logFilePath, logData)
      })

      // Create the zip file
      const zipFilePath = path.join(tmpDir, 'logs.zip')
      // await zip(tmpDir, zipFilePath)

      // Stream the zip file to the client
      res.setHeader('Content-Disposition', 'attachment; filename=logs.zip')
      res.setHeader('Content-Type', 'application/zip')
      const fileStream = fs.createReadStream(zipFilePath)
      fileStream.pipe(res)

      // Clean up temporary files
      fileStream.on('end', () => {
        fs.readdir(tmpDir, (err, files) => {
          if (err) throw err
          for (const file of files) {
            fs.unlink(path.join(tmpDir, file), err => {
              if (err) throw err
            })
          }
        })
      })

    } catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  }
);

router.get(
  "/logs/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    try {
      console.log("Getting player logs for " + req.params.playerId)
      Log.find({ player: req.params.playerId })
        .then(logs => {
          res.json(logs)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.delete(
  "/player/:playerId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    if (Player.findOne({ uid: req.params.playerId }) == null) {
      res.sendStatus(301)
    } else {

    try {
      console.log("Deleting player logs for " + req.params.playerId)
      await Player.remove({ uid: req.params.playerId })
      console.log("Deleted player")
      await Log.remove({ player: req.params.playerId })
      console.log("Deleted logs")
      await Exit.remove({ uid: req.params.playerId })
      console.log("Deleted exit surveys")
      res.sendStatus(200)
    }
    catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
    }
  })

router.delete(
  "/logs/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    try {
      console.log("Deleting player logs for " + req.params.playerId)
      Log.remove({ player: req.params.playerId })
        .then(logs => {
          res.json(logs)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/application/:playerId", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    // console.log("Getting request")
    try {
      Application.findOne({ player: req.params.playerId })
        .then(applications => {
          res.json(applications)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/applications/", passport.authenticate('jwt', { session: false }),
  function (req, res) {
    try {
      Application.find({})
        .then(applications => {
          res.json(applications)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.put(
  "/checkIn/:playerId",
  async function (req, res) {
    console.log("Checking in player...")
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(async player => {
          let checkInTime = new Date()
          if ((new Date(player.sessionStart).valueOf() - checkInTime.valueOf()) > 20 * 60 * 1000 &&
            (new Date(player.sessionStart).valueOf() - checkInTime.valueOf()) < 60 * 60 * 1000 && player.state !== "withdrawn") {
            player.checkedIn = checkInTime
            player.state = "checked in"
            await player.save()
            console.log("Successfully checked in")
            res.sendStatus(200)
          } else {
            console.log("Error, too early or too late")
            res.status(412).send((new Date(player.sessionStart).valueOf() - checkInTime.valueOf()) > 30 * 60 * 1000 ? 'Error: Too early for check-in' :
              'Error: Too late for Check-in')
          }
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  })

router.delete(
  "/partner/:playerId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log("Setting partner..." + req.params.playerId + " to " + req.params.partnerId)
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(async player => {
          await Player.findOneAndUpdate({ uid: player.partner }, { $set: { partner: undefined } })
          player.partner = undefined
          await player.save()
          res.sendStatus(200)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.put(
  "/partner/:playerId/:partnerId", passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    console.log("Setting partner..." + req.params.playerId + " to " + req.params.partnerId)
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(async player => {
          Player.findOne({ uid: req.params.partnerId })
            .then(async newPartner => {
              player.partner = req.params.partnerId
              await player.save()
              newPartner.partner = player.uid
              await newPartner.save()
              res.sendStatus(200)
            })
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/partner/:playerId",
  function (req, res) {
    console.log("Getting partner data..." + req.params.playerId)
    try {
      Player.findOne({ partner: req.params.playerId })
        .then(player => {
          if (player !== null) {

            Application.findOne({ player: player.uid })
              .then(application => {
                // console.log(application)
                player.consented = application !== null
                res.json(player)
              })
          } else {
            res.sendStatus(301)
          }
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/comments/:playerId",
  function (req, res) {
    // console.log("Getting player data..." + req.params.playerId)
    try {
      Log.find({ uid: req.params.playerId })
        .then(logs => {
          // console.log("Sending player...")
          res.json(logs)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/partnerComments/:playerId",
  function (req, res) {
    console.log("Getting comment data..." + req.params.playerId)
    try {
      Player.findOne({ partner: req.params.playerId })
        .then((player => {
          if (player !== null) {
            console.log("Getting player logs ..." + player.uid)
            Log.find({ player: player.uid, eventId: "1" })
              .then(logs => {
                res.json(logs)
              })
          } else {
            res.sendStatus(502)
          }
        }))
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)

const { v4: uuidv4 } = require('uuid')
router.put('/session/:studyId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log("Adding a session to the study...")
  console.log(req.body.sessionStart)
  let project = await Project.findById( req.params.studyId )
  console.log(project)
  if (project.sessions == null) {
    project.sessions = [req.body.sessionStart]
  } else {
    project.sessions.push(req.body.sessionStart)
  }
  await project.save()
  res.send(JSON.stringify(project))
  // Get the highest P value
})

router.delete('/session/:studyId/:sessionTime', passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log("Removing a session from the study...")
  console.log(req.params.sessionTime)
  console.log(req.params.studyId)
  let project = await Project.findById( req.params.studyId )
  console.log(project)
  console.log(project.sessions)
  if (project.sessions != null) {
    project.sessions.splice(project.sessions.indexOf(req.params.sessionTime), 1)
    console.log(project.sessions)
  }
  await project.save()
  res.send(JSON.stringify(project))
  // Get the highest P value
})

router.put('/createParticipant/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log("Creating participant...")
  // Get the highest P value
  Player.find({projectId:req.params.projectId}).then((players) => {
    let max
    if (players.length == 0) {
      max = -1
    } else {
      let filtered = players.map(player => parseInt(player.note.slice(1)))
      filtered = filtered.filter(a => (a == a))
      max = Math.max(...filtered)
    }
    let player1Id = uuidv4()
    let player1 = new Player(
      {
        "uid": player1Id,
        "storyId": undefined,
        "cell": "",
        "sessionStart": req.body.sessionStart,
        "files": [],
        "state": "created",
        "previousStories": [],
        "consented": false,
        "consentedDate": new Date(0),
        "checkedIn": new Date(0),
        "vimeoVideos": [],
        "email": "",
        "projectId": req.params.projectId,
        "note": "P" + (max + 1).toString(),
        "bio": ""
      })
    player1.save()
    res.send([player1])
  })
})
router.put('/createParticipantPair/:projectId', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log("Creating participant pair...")
  // Get the highest P value
  Player.find({}).then((players) => {
    let max
    if (players.length == 0) {
      max = -1
    } else {
      let filtered = players.map(player => parseInt(player.note.slice(1)))
      filtered = filtered.filter(a => (a == a))
      max = Math.max(...filtered)
    }
    let player1Id = uuidv4()
    let story1Id = uuidv4()
    let passage1 = uuidv4()
    let player2Id = uuidv4()
    let story2Id = uuidv4()
    let passage2 = uuidv4()
    let player1 = new Player(
      {
        "uid": player1Id,
        "storyId": story1Id,
        "cell": "",
        "currentStory": `{\"id\":\"${story1Id}\",\"version\":\"\",\"info\":{\"id\":\"${story1Id}\",\"lastUpdate\":\"2021-06-09T20:01:29.020Z\",\"ifid\":\"F165FBA2-FFAB-45FA-81F8-A579A689D929\",\"tagColors\":{},\"name\":\"My Story\",\"startPassage\":\"${passage1}\",\"zoom\":1,\"snapToGrid\":true,\"stylesheet\":\"\",\"script\":\"\",\"storyFormat\":\"Harlowe\",\"storyFormatVersion\":\"3.2.3\"},\"passages\":[{\"id\":\"${passage1}\",\"story\":\"${story1Id}\",\"top\":500,\"left\":475,\"width\":100,\"height\":100,\"tags\":[],\"name\":\"Untitled Passage\",\"selected\":true,\"text\":\"Double-click this passage to edit it.\"}]}`,
        "sessionStart": req.body.sessionStart,
        "files": [],
        "state": "created",
        "previousStories": [],
        "consented": false,
        "consentedDate": new Date(0),
        "checkedIn": new Date(0),
        "vimeoVideos": [],
        "email": "",
        "partner": player2Id,
        "projectId": req.params.projectId,
        "note": "P" + (max + 1).toString(),
        "bio": ""
      })
    player1.save()
    let player2 = new Player(
      {
        "uid": player2Id,
        "storyId": story2Id,
        "currentStory": `{\"id\":\"${story2Id}\",\"version\":\"\",\"info\":{\"id\":\"${story2Id}\",\"lastUpdate\":\"2021-06-09T20:01:29.020Z\",\"ifid\":\"F165FBA2-FFAB-45FA-81F8-A579A689D929\",\"tagColors\":{},\"name\":\"My Story\",\"startPassage\":\"${passage2}\",\"zoom\":1,\"snapToGrid\":true,\"stylesheet\":\"\",\"script\":\"\",\"storyFormat\":\"Harlowe\",\"storyFormatVersion\":\"3.2.3\"},\"passages\":[{\"id\":\"${passage2}\",\"story\":\"${story1Id}\",\"top\":500,\"left\":475,\"width\":100,\"height\":100,\"tags\":[],\"name\":\"Untitled Passage\",\"selected\":true,\"text\":\"Double-click this passage to edit it.\"}]}`,
        "sessionStart": req.body.sessionStart,
        "files": [],
        "state": "created",
        "previousStories": [],
        "consented": false,
        "consentedDate": new Date(0),
        "checkedIn": new Date(0),
        "vimeoVideos": [],
        "email": "",
        "cell": "",
        "partner": player1Id,
        "projectId": req.params.projectId,
        "note": "P" + (max + 2).toString(),
        "bio": ""
      })
    player2.save()
    res.send([player1, player2])
  })
})
export default router

