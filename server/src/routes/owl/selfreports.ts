// the api routes for the Apache Jena Fuseki server
import express from 'express'
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
* @route  POST ${process.env.DOMAIN}/owl/selfreports/addChoice/:ds
* @desc Creates a new choice for a specified dataset and test subject
* @access private
*/
router.post('/addChoice/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const testSubject = req.body.testSubject
  const frame1 = req.body.frame1
  const protoChoice = req.body.protoChoice

  const query = querystring.stringify({ update: owl.addChoice(testSubject, frame1, protoChoice) })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        return res.json({ success: false, newChoice: {} })
      } else {
        return res.json({ success: true, newChoice: { protochoice: protoChoice, frame1: frame1 } })
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
* @route GET ${process.env.DOMAIN}/owl/selfreports/getChoices/:ds
* @desc Gets all choices per test subject
* @access private
*/
router.get('/getChoices/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const testSubject = req.query.id
  const ds = req.params.ds
  const choices = []

  // get all frames for each choice for a test subject
  const choicesQuery = querystring.stringify({ query: owl.getAllChoicesPerSubject(testSubject) })

  try {
    request.get({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/sparql?' + choicesQuery
    }, (error, response, body) => {
      if (error) {
        return res.json({ success: false, error: error })
      } else {
        // convert apache results from xml to json
        const result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }))
        // if empty return empty array
        if ((result.sparql.results.result == null) || (result.sparql.results.result === undefined) || (result.sparql.results.result.length === 0)) { return res.json({ success: true, choices }) } else if (!Array.isArray(result.sparql.results.result)) {
          // if only one element, conversion returns one object
          choices.push({ choice: result.sparql.results.result.binding['0'].uri._text.split('_')[1], time: result.sparql.results.result.binding['1'].uri._text.split('_F')[1] })
          res.json({ success: true, choices })
        } else {
          // if multiple elements, conversion returns array of objects
          result.sparql.results.result.forEach((element) => {
            choices.push({ choice: element.binding['0'].uri._text.split('_')[1], time: element.binding['1'].uri._text.split('_F')[1] })
          })
          res.json({ success: true, choices })
        }
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
 * @route POST ${process.env.DOMAIN}/owl/ajf/deleteBeat/:ds
 * @desc Deletes Choice for a specified dataset and test subject
 * @access public
 */
router.post('/deleteChoice/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const choice = req.body.choice
  const testSubject = req.body.testSubject

  const query = querystring.stringify({ update: owl.deleteChoicePerSubject(testSubject, choice) })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        return res.json({ success: false, error: error })
      } else {
        return res.json({ success: true })
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

export default router
