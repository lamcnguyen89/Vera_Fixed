/* eslint-disable no-unused-vars */
import Project, { IProject } from "../models/Project"
import Player from "../models/Player"
import User from "../models/User"
const deleteMethods = {
  /**
   * TODO: Test
   * Will remove all files from the given array of file ids.
   * Will call ```deleteFile``` function for each file. Just a controller function/wrapper.
   *
   * @param {string} projectId
   * @param {string} playerId
   * @param {Array<string>} fileIds
   * @param {string} userId
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   *
   * @return {Promise}
   */
  deleteFiles: async function (
    projectId: string,
    playerId: string,
    fileIds: string[],
    userId: string,
    serverConfig: object
  ): Promise<{
    success: boolean
    error?: string
  }> {
    return await new Promise((resolve) => {
      const delResults: Array<Promise<{
        success: boolean
        error?: string
      }>> = []

      // delete all fileIds
      fileIds.forEach((fileId) => {
        delResults.push(
          this.deleteFile(projectId, playerId, fileId, userId, serverConfig)
        )
      })

      // Once all file delete methods are done running, check to see if they were all successful
      Promise.all(delResults).then((results) => {
        let errorCheck = false

        results.forEach((result) => {
          if (!errorCheck && !result.success) {
            errorCheck = true
          }
        })

        // If we found error send back error message saying we couldn't delete all files
        if (errorCheck) {
          return resolve({
            success: false,
            error: "Unable to delete all files.",
          })
        } else {
          // successfully deleted all files
          return resolve({ success: true })
        }
      })
    })
  },

  /**
   * TODO: Test
   * Will remove a file from the given file id
   *
   * @param {string} fileId
   * @param {string} playerId
   * @param {string} fileId
   * @param {string} userId The user ID from authentication
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   *
   * @return {Promise}
   */
  deleteFile: async function (
    projectId: string,
    playerId: string,
    fileId: string,
    userId: string,
    serverConfig: any
  ): Promise<{ success: boolean; error?: string }> {
    return await new Promise((resolve) => {
      if (!projectId) {
        return resolve({ success: false, error: "Project ID required." })
      }
      if (!playerId) {
        return resolve({ success: false, error: "Player ID required" })
      }
      if (!fileId) {
        return resolve({ success: false, error: "File ID required" })
      }

      // all params present. Check that the project exists
      Project.findOne({ _id: projectId })
        .then((userProject) => {
          if (!userProject) {
            return resolve({ success: false, error: "Could not find project." })
          }

          if (userProject.createdBy !== userId) {
            return resolve({
              success: false,
              error: "User does not own project.",
            })
          }

          if (userProject.players.indexOf(playerId) === -1) {
            return resolve({
              success: false,
              error: "Player does not belong to this project.",
            })
          }

          Player.findOne({ _id: playerId })
            .then((foundPlayer) => {
              if (!foundPlayer) {
                return resolve({
                  success: false,
                  error: "Could not find player.",
                })
              }

              const idxFound = foundPlayer.files.indexOf(fileId)
              if (idxFound === -1) {
                return resolve({
                  success: false,
                  error: "File does not belong to this project.",
                })
              } else {
                // user owns project, player is in project, file is in player.
                // We can now delete the file and then remove from player's file array.
                const foundFileId = foundPlayer.files[idxFound]

                // sent from the server.js file
                const mongoose = serverConfig.mongoose
                const db = serverConfig.db

                const conn = mongoose.createConnection(db)

                conn.once("open", function () {
                  const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db)

                  gridFSBucket.delete(foundFileId, function (err: any) {
                    if (!err) {
                      // file deleted succesfully, remove from the files array
                      Player.updateOne(
                        { _id: playerId },
                        { $pull: { files: foundFileId } }
                      )
                        .then(() => {
                          return resolve({ success: true })
                        })
                        .catch((err) => {
                          return resolve({
                            success: false,
                            error: `Unable to update player. ${err}`,
                          })
                        })
                    } else {
                      return resolve({
                        success: false,
                        error: "Error deleting file.",
                      })
                    }
                  })
                })
              }
            })
            .catch((err) => {
              return resolve({
                success: false,
                error: `Unable to get player. ${err}`,
              })
            })
        })
        .catch((err) => {
          return resolve({
            success: false,
            error: `Unable to get project. ${err}`,
          })
        })
    })
  },

  /**
   * Will remove a player from a project, and also delete the player from the players collection,
   * as well as all files associated with the player...
   *
   * @param {string} projectId
   * @param {string} playerIds
   * @param {string} ownerId id from the authentication token (req.user.id)
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   */
  deletePlayer: async function (
    projectId: string,
    playerId: string,
    ownerId: string,
    serverConfig: any
  ) {
    return await new Promise((resolve) => {
      // need a player id before removing it from the project.
      if (!playerId) {
        return resolve("Player id is required.")
      }

      // need a project id before removing it from the project.
      if (!projectId) {
        return resolve("Project id is required")
      }

      // get all files for a given player, to then remove those files.
      Player.findOne({ _id: playerId })
        .then((player) => {
          if (!player) {
            return resolve("Could not find player")
          }

          const tempFiles = player.files

          // Make sure we can find the project, and the project owner is doing this
          Project.findOne({ _id: projectId })
            .then((project) => {
              if (!project) {
                return resolve("Could not find project")
              }

              if (project.createdBy === ownerId) {
                // Delete files for player
                this.deleteFiles(
                  projectId,
                  playerId,
                  tempFiles,
                  ownerId,
                  serverConfig
                ).then((filesRes) => {
                  if (filesRes.success) {
                    // Now delete player from player collection
                    Player.deleteOne({ _id: playerId })
                      .then(() => {
                        Project.updateOne(
                          { _id: projectId },
                          { $pull: { players: playerId } }
                        )
                          .then(() => {
                            // console.log("Deleted player successfully");
                            return resolve({ success: true })
                          })
                          .catch((err) => {
                            return resolve({
                              success: false,
                              error: `Could not remove user from project: ${err}`,
                            })
                          })
                      })
                      .catch(() => {
                        return resolve({
                          success: false,
                          error: "Could not delete player from collection",
                        })
                      })
                  } else {
                    return resolve({
                      success: false,
                      error: "Could not delete all files for player",
                    })
                  }
                })
              } else {
                return resolve({
                  success: false,
                  error: "User does not own this project",
                })
              }
            })
            .catch(() => {
              return resolve({
                success: false,
                error: "Could not find project",
              })
            })
        })
        .catch((err) => {
          return resolve({
            success: false,
            error: `Could not find player ${err}`,
          })
        })
    })
  },

  /**
   * This will delete a user's project, including all players, and their files.
   *
   * @param {string} projectId
   * @param {string} userId
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   *
   * @return {Promise}
   */
  deleteProject: async function (
    projectId: string,
    userId: string,
    serverConfig: any
  ): Promise<{ success: boolean; error?: string }> {
    return await new Promise((resolve) => {
      if (!projectId) {
        return resolve({ success: false, error: "No project id received" })
      }

      // find the project they want to delete.
      Project.findOne({ _id: projectId }).then((userProject) => {
        if (!userProject) {
          return resolve({ success: false, error: "Could not find project" })
        }

        // check that the user owns this project
        if (userProject.createdBy !== userId) {
          return resolve({ success: false, error: "User does not own project" })
        } else {
          const players = userProject.players
          const delMethodRetVal: Array<Promise<any>> = []

          // call the players delete function for each player.
          // It will also delete all files associated with each player.
          players.forEach((player) => {
            delMethodRetVal.push(
              deleteMethods.deletePlayer(
                projectId,
                player,
                userId,
                serverConfig
              )
            )
          })

          // Make sure all players were successfully deleted. If not, say some weren't deleted
          Promise.all(delMethodRetVal).then((retArray) => {
            let errorFound = false
            retArray.forEach((delRetVal) => {
              if (!delRetVal.success) {
                errorFound = true
              }
            })

            // all players, and their files, were deleted
            if (!errorFound) {
              // now delete the current project
              Project.deleteOne({ _id: projectId })
                .then(() => {
                  return resolve({ success: true })
                })
                .catch((err) => {
                  return resolve({
                    success: false,
                    error: `Unable to delete project ${err}`,
                  })
                })
            } else {
              return resolve({
                success: false,
                error: "Unable to delete all players. Did not delete project",
              })
            }
          })
        }
      })
    })
  },

  /**
   * Will delete an array of projects given to it, and all data associated with it
   *
   * @param {Array<string>} projects an array of projects from the DB
   * @param {string} userId The user ID from authentication
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   *
   * @returns {Promise}
   */
  deleteProjects: async function (
    projects: IProject[],
    userId: string,
    serverConfig: any
  ): Promise<{ success: boolean; error?: string }> {
    return await new Promise((resolve) => {
      const results: Array<Promise<{ success: boolean; error?: string }>> = []

      projects.forEach((project) => {
        results.push(this.deleteProject(project._id, userId, serverConfig))
      })

      Promise.all(results).then((promisesDone) => {
        let errorCheck = false
        promisesDone.forEach((prms) => {
          if (!errorCheck && !prms.success) {
            errorCheck = true
          }
        })

        // Some error occurred, Couldn't delete everything
        if (errorCheck) {
          return resolve({
            success: false,
            error: "Could not delete all projects",
          })
        } else {
          // everyhing deleted fine. Send success message
          return resolve({ success: true })
        }
      })
    })
  },

  /** TODO: Later
   *
   * Will need to call ```deleteProjects``` (wrapper) for all projects owned by this user.
   * This will in turn delete all players, and files, associated with these projects.
   * Once all this is done, remove user from table, and delete is successful.
   *
   * @param {string} userId The user ID from authentication
   * @param {object} serverConfig the server config. Found in ```req.serverConfig```
   *
   * @returns {Promise}
   */
  deleteUser: async function (userId: string, serverConfig: any) {
    return await new Promise((resolve) => {
      if (!userId) {
        return resolve("No user ID found")
      }

      // This one shouldn't happen
      if (!serverConfig) {
        return resolve("No server config found...")
      }

      // get a list of projects owned by this user
      Project.find({ createdBy: userId })
        .then((projects) => {
          // now that we have list of projects, delete all of them and their related data
          this.deleteProjects(projects, userId, serverConfig).then(
            (delProjectsRes) => {
              if (delProjectsRes.success) {
                // everything deleted, now delete user, then send back success/failure message
                User.deleteOne({ _id: userId })
                  .then((delUser) => {
                    if (delUser) {
                      return resolve({ success: true, delUser })
                    } else {
                      return resolve({
                        success: false,
                        error: "Could not delete user",
                      })
                    }
                  })
                  .catch((err) => {
                    return resolve({
                      success: false,
                      error: `Could not delete user. ${err}`,
                    })
                  })
              } else {
                return resolve("Could not delete all projects")
              }
            }
          )
        })
        .catch((err) => {
          return resolve({
            success: false,
            error: `Could not find projects to delete ${err}`,
          })
        })
    })
  },
}
export default deleteMethods
