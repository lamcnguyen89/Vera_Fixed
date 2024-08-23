import express from 'express'
// import fetch from 'node-fetch'
import request from 'request'
import passport from 'passport'
import querystring from 'querystring'
import convert from 'xml-js'
import owl from '../../common/OwlQueries.js'
const router = express.Router()

const header = {
  Authorization: process.env.NODE_APACHE_PASSWORD,
  'content-type': 'application/x-www-form-urlencoded'
}

/**
 * @route GET ${process.env.DOMAIN}/owl/protoelements/getAllProtoScenes/:ds
 * @desc  Gets all ProtoScenes in a specified dataset
 * @access private
 */
router.get('/getAllProto:Element/:ds', /* passport.authenticate("jwt", {session: false}), */ async (req, res) => {
  let result = null
  const proto: { protoelement: any; description: any }[] = []
  const ds = req.params.ds
  const element = req.params.Element
  console.log(element)
  let protoQuery = null
  switch (req.params.Element) {
    case 'Scenes':
      protoQuery = owl.getAllProtoScenes()
      break
    case 'Beats':
      protoQuery = owl.getAllProtoBeats()
      break
    case 'Choices':
      protoQuery = owl.getAllProtoChoices()
      break
  }
  const query = querystring.stringify({ query: protoQuery })
  console.log("getting triples...")
  try {
    result = await request.get({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/sparql?' + query
    }, (error, response, body) => {
      if (error !== null) {
        console.error('error:', error) // Print the error if one occurred
        return
      }
      console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received

      result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }))
      // if empty return empty array
      if ((result.sparql.results.result == null) || (result.sparql.results.result === undefined) || (result.sparql.results.result.length === 0)) {
        return res.json({ success: true, proto })
      } else if (!Array.isArray(result.sparql.results.result)) {
        // if only one element, conversion returns one object
        proto.push({ protoelement: result.sparql.results.result.binding[0].uri._text.split('#')[1], description: result.sparql.results.result.binding[2].literal._text })
      } else {
        // if multiple elements, conversion returns array of objects
        result.sparql.results.result.forEach((element: { binding: { literal: { _text: any }; uri?: { _text: string } }[] }) => {
          proto.push({ protoelement: element.binding[0].uri._text.split('#')[1], description: element.binding[2].literal._text })
        })
      }
      return res.json({ success: true, proto })
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
 * @route  POST ${process.env.DOMAIN}/owl/protoelements/addProtoScene/:ds
 * @desc   Creates a new ProtoScene for a specified dataset
 * @access private
 */
router.post('/addProto:Element/:ds', /* passport.authenticate("jwt", {session: false}), */(req, res) => {
  // const newScene = 0
  let result = null
  const description = req.body.description
  const ds = req.params.ds
  const element = req.params.Element
  const array: number[] = []
  let number = 0
  let protoQuery = null
  switch (element) {
    case "Scenes":
      protoQuery = owl.getNumberOfProtoScenes()
      break
    case "Beats":
      protoQuery = owl.getNumberOfProtoBeats()
      break
    case "Choices":
      protoQuery = owl.getNumberOfProtoChoices()
  }
  // get number of protoscenes in dataset
  const countQuery = querystring.stringify({ query: protoQuery })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + countQuery
    }, (error, response, body) => {
      if (error) {
        return res.send(response + error)
      } else {
        // increment number of protoscenes by one for next protoscene to be added
        result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }))
        // if there are no protoscenes already, manually set to 1
        if ('undefined'.localeCompare(JSON.stringify(result.sparql.results.result)) === 0) {
          number = 1
        } else {
          /// console.log(JSON.stringify(result.sparql.results.result, 'uri', '\t'));
          const jsonobj = (result.sparql.results.result)
          // if there's one element in the array
          if (jsonobj.length === undefined) {
            array[0] = 1
          }
          for (let i = 0; i < jsonobj.length; i++) {
            array[i] = parseInt(JSON.stringify(jsonobj[i].binding.uri._text).split(/(\d+)/)[5])
          }
          number = Math.max(...array) + 1
        }

        // add new protoscene
        let addQuery = null, newElement = ""
        switch (element) {
          case 'Scenes':
            newElement = 'S' + (number)
            addQuery = querystring.stringify({ update: owl.addProtoScene(newElement, description) })
            break
          case 'Beats':
            newElement = 'B' + (number)
            addQuery = querystring.stringify({ update: owl.addProtoBeat(newElement, description) })
            break
          case 'Choices':
            newElement = 'C' + (number)
            addQuery = querystring.stringify({ update: owl.addProtoChoice(newElement, description) })
            break
        }

        try {
          request.post({
            headers: header,
            url: 'http://localhost:3030/' + ds + '/?' + addQuery
          }, (error) => {
            if (error) {
              res.json({ success: false, error: error })
            } else {
              res.json({ success: true, newProto: { protoelement: newElement, description: description } })
            }
          })
        } catch (error) {
          res.json({ success: false, error: error })
        }
      }
    })
  } catch (error) {
    res.json({ success: false, error: error })
  }
})


/**
 * @route POST ${process.env.DOMAIN}/owl/protoelements/deleteProtoScene/:ds
 * @desc  Deletes Protoscene for a specified dataset
 * @access private
 */
router.post('/deleteProto:Element/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const element = req.params.Element
  let protoQuery = null, protoElement = null
  switch (element) {
    case 'Scene':
      protoQuery = owl.deleteProtoScene(req.body.ProtoScene)
      break
    case 'Beat':
      protoQuery = owl.deleteProtoBeat(req.body.ProtoBeat)
      break
    case 'Choice':
      protoQuery = owl.deleteProtoChoice(req.body.ProtoChoice)
      break
  }
  const query = querystring.stringify({ update: protoQuery })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        res.json({ success: false, error: error })
      } else {
        return res.json({ success: true })
      }
    })
  } catch (error) {
    res.json({ success: false, error: error })
  }
})

export default router
