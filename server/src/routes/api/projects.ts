import deleteMethods from '../../common/deleteMethods'
import { errRes } from '../../common/utilities'
import express from 'express'
import passport from 'passport'
// Load project model
import Project from '../../models/Project'
import User from '../../models/User'
import Player from '../../models/Player'

import { v4 as uuid } from 'uuid'
const router = express.Router()

// parse all JSON coming into these routes below. Routes above do not use JSON for the body
router.use(express.json())

/**
 * This route will create a new project with the given name in the DB.
 * body params required:
 * name: (project name given by user)
 *
 * In fetch header, (react-side) make sure its json content, and "Authorization": (user's token here)
 */
router.post('/CreateProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    if (!req.body.name) {
      res.json(errRes('Project name required'))
      return
    }

    const newProject = new Project({
      name: req.body.name, // project name
      // description: req.body.description,
      createdBy: req.user.id, // creator of the project will be an admin
      users: [req.user.id], // creator will be in the list of users here too
      players: [] // empty array. No users initially
    })

    newProject.save((err, project) => {
      if (err) console.log(`error saving ${newProject} to db: `, err)
      res.json({ success: true, project, _id: project._id })// project created in DB successfully
    })
  } catch (error) {
    res.json(errRes(`Unknown error:  ${error}`))
  }
})

/**
 * This will get all projects that a user has created.
 * Need Authorization token in fetch header
 */
router.post('/GetAllCreatedProjects', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    Project.find({ createdBy: req.user.id }).then((projects) => {
      res.json({ success: true, projects })
    })
      .catch((err) => {
        res.json(errRes(`Unknown error ${err}`))
      })
  } catch (error) {
    res.json(errRes('Unknown error'))
  }
})

/**
 * This will get a specific project that the user is a part of.
 *
 * Body params required:
 * projectId
 *
 * Need authorization header
 */
router.post('/GetProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    if (!req.body.projectId) {
      res.json(errRes('Project ID required.'))
      return
    }

    Project.findOne({ $or: [{ createdBy: req.user.id }, { users: req.user.id }], _id: req.body.projectId }).then((userProject) => {
      if (!userProject) {
        res.json(errRes('Could not find project'))
      } else {
        res.json({ success: true, project: userProject })
      }
    })
      .catch((err) => {
        res.json(errRes(`Could not load project ${err}`))
      })
  } catch (error) {
    res.json(errRes('Unknown error'))
  }
})

/**
 * This will get all projects that a user is in, but not the owner of.
 *
 * Need Authorization token in fetch header
 */
router.post('/GetAllParticipatingProjects', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    Project.find({ createdBy: { $ne: req.user.id }, users: req.user.id }).then((projects) => {
      res.json({ success: true, projects, ids: projects.map(p => p.id) })
    })
      .catch((err) => {
        res.json(errRes(`Unknown error ${err}`))
      })
  } catch (error) {
    res.json(errRes(`Unknown error ${error}`))
  }
})

/**
 * This will get all projects that a user is in
 *
 * Note: This will get both projects that a user has created, and is participating in
 *
 * Need Authorization token in fetch header
 */
router.post('/GetAllProjects', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    Project.find({ $or: [{ createdBy: req.user.id }, { users: req.user.id }] }).then((projects) => {
      res.json({ success: true, projects, ids: projects.map(p => p.id) })
    })
      .catch((err) => {
        res.json(errRes(`Unknown error ${err}`))
      })
  } catch (error) {
    res.json(errRes(`Unknown error ${error}`))
  }
})

/**
 * This will add a user to the user array in a project so that they can annotate this project
 * NOTE: can only be done by the owner of the project
 *
 * body params required:
 * projectId: (the project id for the project to add a user to)
 * userEmail: (the user to add to this project. Will find him by a given email)
 *
 * Need Authorization token in fetch header
 */
router.post('/AddUserToProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    // need a project id
    if (!req.body.projectId) {
      res.json(errRes('Project id is required'))
      return
    }

    // need the user's email
    if (!req.body.userEmail) {
      res.json(errRes('User\'s email is required'))
      return
    }

    Project.findOne({ _id: req.body.projectId }).then((userProject) => {
      if (!userProject) {
        res.json(errRes('Could not find project'))
      } else if (userProject.createdBy === req.user.id) {
        User.findOne({ email: req.body.userEmail }).then((user) => {
          if (!user) {
            res.json(errRes('Could not find user from the given email'))
          } else {
            if (req.user.id === user.id) {
              res.json(errRes('Can not add project owner to the list.'))
            } else {
              // now we have the project id, the user's id to add to the list, and we know the user that requested this is the owner
              Project.updateOne(
                { _id: req.body.projectId },
                { $addToSet: { users: user.id } } // only adds if the user isn't already there
              )
                .then(() => {
                  res.json({ success: true, user: user })
                })
                .catch((err) => {
                  res.json(errRes(`Could not add user to project ${err}`))
                })
            }
          }
        })
          .catch((err) => {
            res.json(errRes(`Could not find user from the given email ${err}`))
          })
      } else {
        res.json('User does not own project')
      }
    })
      .catch((err) => {
        res.json(errRes(`Could not find project ${err}`))
      })
  } catch (error) {
    res.json(errRes('Unknown error'))
  }
})

/**
 * Will remove a user from participating in a given project.
 * NOTE: Can only be done by the project's owner.
 * NOTE: If user is not in the user's array, but user exists, this will return a success message.
 *
 * Body params required:
 * userEmail: (email of the user to be removed from the project)
 * projectId: (project id to remove the user from)
 *
 * Need Authorization token in fetch header
 *
 */
router.post('/RemoveUserFromProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    // need a project id
    if (!req.body.projectId) {
      res.json(errRes('Project id is required'))
      return
    }

    // need a project id
    if (!req.body.userEmail) {
      res.json(errRes("user's email is required"))
      return
    }

    Project.findOne({ _id: req.body.projectId }).then((userProject) => {
      if (!userProject) {
        res.json(errRes('Could not find project'))
      } else if (userProject.createdBy === req.user.id) {
        User.findOne({ email: req.body.userEmail }).then((user) => {
          if (!user) {
            res.json(errRes('Could not find user from the given email'))
          } else {
            if (req.user.id === user.id) {
              res.json(errRes('Can not remove project owner from the list.'))
            } else {
              Project.updateOne(
                { _id: req.body.projectId },
                { $pull: { users: user.id } }
              )
                .then(() => {
                  res.json({ success: true })
                })
                .catch((err) => {
                  res.json(errRes(`Could not remove user from project ${err}`))
                })
            }
          }
        })
          .catch((err) => {
            res.json(errRes(`Could not find user from the given email. ${err}`))
          })
      } else {
        res.json('User does not own project')
      }
    })
      .catch((err) => {
        res.json(errRes(`Could not find project ${err}`))
      })
  } catch (error) {
    res.json(errRes('Unknown error'))
  }
})

/**
 * Will add a new Player to a project.
 * NOTE: Can only be done by project owner
 *
 * Body params required/used:
 * playerName: (string of the new player name)
 * projectId: (Project id to add the player to)
 *
 * Need Authorization token in fetch header
 */
router.post('/AddPlayerToProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    // need a project id
    if (!req.body.projectId) {
      res.json(errRes('Project id is required'))
      return
    }

    Project.findOne({ _id: req.body.projectId }).then((userProject) => {
      if (!userProject) {
        res.json(errRes('Could not find project'))
      } else if (userProject.createdBy === req.user.id) {
        // Won't add vimeo links and files to the user when first creating it
        const tempPlayer = new Player({
          uid: uuid()
        })

        tempPlayer.save().then((player) => {
          Project.updateOne(
            { _id: req.body.projectId },
            { $addToSet: { players: player.id } }
          )
            .then(() => {
              res.json({ success: true, player: player })
            })
            .catch((err) => {
              res.json(errRes(`Player created, but could not add to project. ${err}`))
            })
        })
          .catch((err) => {
            res.json(errRes(`Could not create new player. ${err}`))
          })
      } else {
        res.json(errRes('User does not own project'))
      }
    })
      .catch((err) => {
        res.json(errRes(`Could not find project ${err}`))
      })
  } catch (error) {
    res.json(errRes(`Unknown error ${error}`))
  }
})

/**
 * Will remove a Player from a project, and delete it from the players collection.
 * NOTE: Can only be done by project owner
 *
 * Body params required/used:
 * playerId: (string of the new player's id)
 * projectId: (Project id to remove the player from)
 *
 * Need Authorization token in fetch header
 */
router.post('/RemovePlayerFromProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    deleteMethods.deletePlayer(req.body.projectId, req.body.playerId, req.user.id, req.serverConfig)
      .then((delRes) => {
        res.json(delRes)
      })
  } catch (error) {
    console.log(error)
    res.json(errRes('Unknown error'))
  }
})

/**
 * Will return all players for a given project
 * NOTE: Can only be done by someone in the project
 *
 * Body params required/used:
 * projectId: (Project id to remove the player from)
 *
 * Need Authorization token in fetch header
 */
router.post('/GetAllPlayersForProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    if (!req.body.projectId) {
      res.json('Project id required')
      return
    }

    // Get the project, and make sure user is actually allowed to be in the project
    Project.findOne({ _id: req.body.projectId, $or: [{ createdBy: req.user.id }, { users: req.user.id }] }).then((userProject) => {
      if (!userProject) {
        res.json('Could not get project')
        return
      }

      const playersArray = userProject.players

      Player.find({ _id: { $in: playersArray } }).then((players) => {
        res.json({ success: true, players })
      })
        .catch((err) => {
          res.json(errRes(`Could not find players ${err}`))
        })
    })
      .catch((err) => {
        res.json(errRes(`Could not find project ${err}`))
      })
  } catch (error) {
    res.json(errRes('Unknown error'))
  }
})

/**
 * Will delete the project, and any players in the project,
 * along with all of those player's files.
 *
 * Body params required:
 * projectId: (the project ID to delete)
 *
 * Need authorization token in fetch header
 */
router.post('/deleteProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    deleteMethods.deleteProject(req.body.projectId, req.user.id, req.serverConfig).then((retVal) => {
      res.json({ retVal, deletedProjectId: req.body.projectId })
    })
      .catch((err) => {
        throw err
      })
  } catch (error) {
    console.log(error)
    res.json(errRes(`Unknown error ${error}`))
  }
})

/**
 * Will return an array with all users in a given project
 * NOTE: only project owner can do this
 * NOTE: Project owner will also be in returning list (because they have annotator rights, and can't be removed).
 *
 * Body params required:
 * projectId: (project to get users from)
 *
 * Need authorization token in fetch header
 */
router.post('/GetAllUsers', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    if (!req.body.projectId) {
      res.json('Project id required')
      return
    }

    Project.findOne({ _id: req.body.projectId }).then((userProject) => {
      // no project found
      if (!userProject) {
        res.json('Project not found')
      } else {
        // check user owns this project
        if (userProject.createdBy !== req.user.id) {
          res.json('User does not own this project')
        } else {
          const userArray = userProject.users

          // send back an array of users
          User.find({ _id: { $in: userArray } }).then((users) => {
            // remove password field from all objects
            users = users.map((oneUser) => {
              oneUser.password = undefined
              oneUser.date = undefined
              return oneUser
            })

            res.json({ success: true, users: users })
          })
            .catch((err) => {
              res.json(errRes(`Could not get users ${err}`))
            })
        }
      }
    })
      .catch((err) => {
        res.json(errRes(`Unable to get project ${err}`))
      })
  } catch (error) {
    res.json('Unknown error')
  }
})

/**
 * This route will remove a user from a project's user array,
 * as long as they do not own the project.
 *
 * NOTE: If user tries to remove himself from a project he is not a part, it will return a success message
 *
 * Body params required:
 * projectId: (projectId to remove user from, but cannot be the owner of the project)
 *
 * Need authorization token in fetch header
 */
router.post('/removeSelfFromProject', passport.authenticate('jwt', { session: false }), (req, res) => {
  try {
    if (!req.body.projectId) {
      res.json(errRes('Project id required'))
      return
    }

    Project.findOne({ _id: req.body.projectId }).then((userProject) => {
      if (!userProject) {
        res.json(errRes('Could not find project'))
        return
      }

      // don't remove user from this project if he is the owner of it
      if (userProject.createdBy === req.user.id) {
        res.json(errRes('Cannot remove project owner'))
      } else {
        Project.updateOne(
          { _id: req.body.projectId }, // search
          { $pull: { users: req.user.id } } // replace
        )
          .then(() => {
            res.json({ success: true })
          })
          .catch(() => {
            res.json('Could not remove user from project')
          })
      }
    })
      .catch((err) => {
        res.json(errRes(`Could not load project ${err}`))
      })
  } catch (error) {
    res.json(errRes(`Unknown error ${error}`))
  }
})

// export this to be used as middleware in express
export default router
