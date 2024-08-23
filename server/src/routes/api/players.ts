import express from "express"
import passport from "passport"
import formidable from "formidable"
import Player from "../../models/Player"
import Project from "../../models/Project"
import fs from "fs"
import nodemailer from "nodemailer"
import Application from "../../models/Application"
import deleteMethods from "../../common/deleteMethods"
import { createSemicolonClassElement } from "typescript"
import Log from "../../models/Log"
// import { HashRouter, RouteChildrenProps } from 'react-router-dom'
const router = express.Router()

// for file writing/reading/modifying/deleting

/**
 * Simple error wrapper for return JSON message
 * @param msg Error message
 */
function err(msg: string) {
  return { success: false, error: msg }
}

// TODO: Move this to the players module
/**
 * This will add a file to a specific project. Will be visible to all people working on this project.
 * Body params required:
 * playerId: (player id to add the file to)
 * projectId: (project id the player belongs to)
 * file: (the file to add to the project)
 * fileName: (the name/title the user wants to give to the file)
 *
 * Need Authorization token in fetch header
 * NOTE: Only project owner can do this...
 */
router.post(
  "/AddFileToPlayer",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      // everything checks out, add file to player
      new formidable.IncomingForm().parse(req, (error, fields, files) => {
        if (error) {
          console.log(error)
          throw error
        } else {
          // received and parsed files correctly
          console.log("fields: ", fields)
          console.log("file: ", files.file.name, files.file.path)

          if (!fields.playerId) {
            res.json(err("Player ID required."))
            return
          }

          if (!fields.projectId) {
            res.json(err("Project ID required."))
            return
          }

          Player.findOne({ _id: fields.playerId })
            .then((foundPlayer) => {
              if (!foundPlayer) {
                res.json(err("Player not found."))
              } else {
                // check if the user owns this project, and that the player is in said project
                Project.findOne({ _id: fields.projectId }).then(
                  (foundProject) => {
                    if (!foundProject) {
                      res.json(err("Project not found."))
                    } else if (foundProject.createdBy !== req.user.id) {
                      res.json(err("User does not own this project"))
                    } else if (
                      foundProject.players.indexOf(foundPlayer.id) === -1
                    ) {
                      res.json(err("Player is not in the project given"))
                    } else if (
                      foundProject.players.indexOf(foundPlayer.id) !== -1
                    ) {
                      // project and player exist, and player is in project, and user owns project

                      // sent from the server.js file
                      const mongoose = req.serverConfig.mongoose
                      const db = req.serverConfig.db

                      // to be used for writing files to the DB's bucket
                      // Grid.mongo = mongoose.mongo;
                      const conn = mongoose.createConnection(db)
                      conn.once("open", function () {
                        // var gfs = Grid(conn.db, mongoose.mongo);
                        const gridFSBucket = new mongoose.mongo.GridFSBucket(
                          conn.db
                        )

                        console.log("GFS HERE")

                        // TODO: Add metadata options here.
                        // streaming to gridFS. File name to be used below.
                        const writeStream = gridFSBucket.openUploadStream({
                          metadata: {
                            // files.file.name
                          },
                        })

                        // what to read, and what to use to write
                        fs.createReadStream(files.file.path).pipe(writeStream)
                        const id = writeStream.id

                        writeStream.on("finish", function () {
                          console.log(writeStream.id)
                          console.log(
                            files.file.name + " Was written to the DB"
                          )
                          console.log(id)

                          // add file id to the players file array now
                          Player.updateOne(
                            { _id: fields.playerId },
                            { $addToSet: { files: id } }
                          )
                            .then((result) => {
                              if (result.ok === 1) {
                                res.json({ success: true, message: result })
                              }
                            })
                            .catch((error) => {
                              res.json(
                                err(`Unable to update player. ${error}`)
                              )
                            })
                        })
                      })
                    } else {
                      throw new Error("Unknown error")
                    }
                  }
                )
              }
            })
            .catch((error) => {
              res.json(err(`Unable to get player. ${error}`))
            })
        }
      })
    } catch (error) {
      res.json(err(`Unknown error: ${error}`))
    }
  }
)

/**
 * This will get all files associated with a player on the DB.
 *
 * NOTE: User must be included in the project's user's array
 *
 * body params required:
 * projectId: (project id player is in)
 * playerId: (player id to get files from)
 * fileId: (file id of the requested file)
 *
 * Authentication header required
 */
router.post(
  "/GetFileFromPlayer",
  passport.authenticate("jwt", { session: false }),
  express.json(),
  (req, res) => {
    try {
      if (!req.body.projectId) {
        res.json(err("Project ID required."))
        return
      }

      if (!req.body.playerId) {
        res.json(err("Player ID required."))
        return
      }

      if (!req.body.fileId) {
        res.json("File ID required.")
        return
      }

      // make sure project exists
      Project.findOne({ _id: req.body.projectId })
        .then((userProject) => {
          if (!userProject) {
            res.json("Project not found.")
            return
          }

          // make sure user is in the project's user array
          if (userProject.users.indexOf(req.user.id) !== -1) {
            // make sure player is in the project's player array
            if (userProject.players.indexOf(req.body.playerId) !== -1) {
              // we've verified project exists, and user/player are in the project. Now get the player object.
              Player.findOne({ _id: req.body.playerId })
                .then((foundPlayer) => {
                  if (!foundPlayer) {
                    res.json("Could not get player")
                    return
                  }

                  // player in project has requested file.
                  const idxFound = foundPlayer.files.indexOf(req.body.fileId)
                  if (idxFound !== -1) {
                    const foundFileId = foundPlayer.files[idxFound]

                    // sent from the server.js file
                    const mongoose = req.serverConfig.mongoose
                    const db = req.serverConfig.db

                    const conn = mongoose.createConnection(db)

                    conn.once("open", function () {
                      const gridFSBucket = new mongoose.mongo.GridFSBucket(
                        conn.db
                      )

                      const downloadStream = gridFSBucket.openDownloadStream(
                        foundFileId
                      )

                      downloadStream.on("error", function (err1: string) {
                        res.json(
                          err(
                            `Error occurred while streaming file. ${err1}\n` +
                            err +
                            foundFileId
                          )
                        )
                        res.end()
                      })

                      downloadStream.pipe(res)

                      // // array to hold files related to each player.
                      // // let filesArray = [];

                      // const readStream = gridFSBucket.createReadStream({_id: req.body.fileId})

                      // readStream.on("error", function(err) {
                      //     res.json("Unknown error");
                      //     res.end();
                      // })

                      // readStream.pipe(res);
                    })
                  } else {
                    res.json(err("Could not find file."))
                  }
                })
                .catch((error) => {
                  res.json(err(`Unable to get player. ${error}`))
                })
            } else {
              res.json(err("Player does not belong to project."))
            }
          } else {
            res.json(err("User does not belong to project."))
          }
        })
        .catch((error) => {
          res.json(err(`Unable to get project. ${error}`))
        })
    } catch (error) {
      res.json(err(`Unknown error: ${error}`))
    }
  }
)

/**
 * This will delete a file (and its chunks) from a player
 *
 * NOTE: Only the project owner can do this
 *
 * body params required:
 * projectId: (project id player is in)
 * playerId: (player id file is from)
 * fileId: (file id for file to delete)
 *
 * Authentication header required
 *
 */
router.post(
  "/DeleteFileFromPlayer",
  passport.authenticate("jwt", { session: false }),
  express.json(),
  (req, res) => {
    deleteMethods
      .deleteFile(
        req.body.projectId,
        req.body.playerId,
        req.body.fileId,
        req.user.id,
        req.serverConfig
      )
      .then((result) => {
        res.json(result)
      })
  }
)

/**
 * This route will add an array of json objects to a player.
 * The JSON is what was received from Vimeo get videos call.
 *
 * Body params required:
 * ProjectId: (Project ID player is in)
 * playerId: (player Id to add json array to)
 * jsonArray: (array of vimeo json user wants)
 *
 * Authentication required
 *  Must be project owner
 */
router.post(
  "/AddVimeoJSON",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      if (!req.body.projectId) {
        res.json(err("Project ID required"))
        return
      }
      if (!req.body.playerId) {
        res.json(err("Player ID required"))
        return
      }
      if (!req.body.jsonArray) {
        res.json(err("Vimeo JSON array required"))
        return
      }

      // make sure project exists
      Project.findOne({ _id: req.body.projectId }).then((userProject) => {
        if (!userProject) {
          res.json(err("Project not found."))
          return
        }

        // make sure user owns project
        if (userProject.createdBy !== req.user.id) {
          res.json(err("User does not own project"))
          return
        }

        // make sure user is in the project's user array
        if (userProject.users.indexOf(req.user.id) !== -1) {
          // make sure player is in the project's player array
          if (userProject.players.indexOf(req.body.playerId) !== -1) {
            // we've verified project exists, and user/player are in the project. Now get the player object.
            Player.findOne({ _id: req.body.playerId }).then((foundPlayer) => {
              if (!foundPlayer) {
                res.json(err("Could not get player"))
                return
              }

              // add the array of json
              Player.updateOne(
                { _id: req.body.playerId },
                { $addToSet: { vimeoVideos: req.body.jsonArray } }
              )
                .then(() => {
                  res.json({ success: true })
                })
                .catch((err) => {
                  console.log(err)
                  res.json(err("Error occurred while updating player"))
                })
            })
          }
        }
      })
    } catch (error) {
      console.log(error)
      res.json(err(`Unknown error ${error}`))
    }
  }
)

router.patch(
  "/:playerId",
  function (req, res) {
    console.log("Patching player...")
    let player = req.body
    console.log("Patching player...")
    console.log(player)
    Player.findOneAndUpdate({ uid: req.params.playerId }, { $set: player })
      .then(() => res.sendStatus(200))
  })
router.post("/send", async function (req, res) {
  console.log("Sending email... now!")
  // let poolConfig = "smtps://john@lucidbard.com:m3kpf4vpsq6dvw3t@smtp.fastmail.com/?pool=true";
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "john@lucidbard.com", // generated ethereal user
      pass: "m3kpf4vpsq6dvw3t", // generated ethereal password
    },
  })
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Sherlock" <sherlock@mrl.ai>', // sender address
    to: "johnthomasmurray@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  })
  console.log("Message sent: %s", info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  console.log("Sent")
  res.sendStatus(200)
})
router.put(
  "/:playerId",
  function (req, res) {
    let player = req.body
    console.log("Updating player...")
    console.log(player)
    Player.findOneAndUpdate({ uid: req.params.playerId }, player)
      .then(() => res.sendStatus(200))
  })

router.get(
  "/id/:playerId",
  function (req, res) {
    console.log("Getting player...")
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(player => {
          Application.findOne({ player: req.params.playerId })
            .then(application => {
              if (player) {
                player.consented = application !== null
                res.json(player)
              } else {
                res.json({})
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
  "/logs/:playerId",
  function (req, res) {
    console.log("Getting player...")
    try {
      Player.findOne({ uid: req.params.playerId })
        .then(player => {
          Log.find({ player: req.params.playerId })
            .then(logs => {
                res.json(logs)
            })
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)
router.get(
  "/",
  function (req, res) {
    try {
      Player.find({})
        .then(players => {
          res.json(players)
        })
    } catch (err) {
      console.log(err)
      res.sendStatus(301)
    }
  }
)

export default router
