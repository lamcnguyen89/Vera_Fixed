import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import serverConstants from '../../serverConstants'
const router = express.Router()

// use json parsing for these routes
router.use(express.json())

// enabled cors for this path
router.options('/GetVimeoAccessToken', cors())
router.post('/GetVimeoAccessToken', cors(), function (req, res) {
  // sending request to vimeo. Will send the returned access token back to client.
  const auth = 'basic ' + Buffer.from(serverConstants.ClientIdentifier + ':' + serverConstants.ClientSecret).toString('base64')
  console.log(req)
    fetch('https://api.vimeo.com/oauth/access_token', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4'
    },
    body: JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: 'authorization_code',
      code: req.body.code,
      // eslint-disable-next-line @typescript-eslint/camelcase
      redirect_uri: req.body.redirect_uri
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log('result: ', result)
      // an error occurred. Send back message with an error.
      if (result.error) {
        res.json({
          error: true
        })
      } else {
        // send back access token if successful
        res.json({
          // eslint-disable-next-line @typescript-eslint/camelcase
          access_token: result.access_token
        })
      }
    })
})

export default router
