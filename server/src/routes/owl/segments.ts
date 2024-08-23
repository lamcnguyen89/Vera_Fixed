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
 * @route POST ${process.env.DOMAIN}/owl/segments/addScene/:ds
 * @desc Creates a new scene for a specified dataset and test subject
 * @access private
 */
router.post('/addScene/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const testSubject = req.body.testSubject
  const frame1 = req.body.frame1
  const frame2 = req.body.frame2
  const protoScene = req.body.protoScene

  const query = querystring.stringify({ update: owl.addScene(testSubject, frame1, frame2, protoScene) })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        return res.json({ success: false, newScene: {} })
      } else {
        return res.json({ success: true, newScene: { protoscene: protoScene, frame1: frame1, frame2: frame2 } })
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
 * @route GET ${process.env.DOMAIN}/owl/segments/getScenes/:id
 * @desc Gets all scenes per test subject
 * @access private
 */
router.get('/getScenes/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const testSubject = req.query.id
  const ds = req.params.ds
  const scenes: { scene: any; start: any; end?: any }[] = []

  // get all beginning and end frames for each scene for a test subject
  const scenesQuery = querystring.stringify({ query: owl.getAllScenesPerSubject(testSubject) })

  try {
    request.get({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/sparql?' + scenesQuery
    }, (error, response, body) => {
      if (error) {
        return res.json({ success: false, error: error })
      } else {
        // convert apache results from xml to json
        const result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }))
        // if empty return empty array
        if ((result.sparql.results.result == null) || (result.sparql.results.result === undefined) || (result.sparql.results.result.length === 0)) { return res.json({ success: true, scenes }) } else {
          // conversion returns array of objects
          result.sparql.results.result.forEach((element: { binding: { [x: string]: { uri: { _text: string } } } }, index: number) => {
            // query gets all frames ordered by scene, so we group each start and end frame into an object {scene, start, end}

            // start frame
            if (index % 2 === 0) {
              scenes.push({ scene: element.binding['0'].uri._text.split('_')[1], start: element.binding['1'].uri._text.split('_F')[1] })
            } else {
              // end frame
              const prevStart = scenes[scenes.length - 1].start
              // ensures end frames are ordered before start frames
              if (parseInt(prevStart) > parseInt(element.binding['1'].uri._text.split('_F')[1])) {
                scenes[scenes.length - 1].start = element.binding['1'].uri._text.split('_F')[1]
                scenes[scenes.length - 1].end = prevStart
              } else {
                scenes[scenes.length - 1].end = element.binding['1'].uri._text.split('_F')[1]
              }
            }
          })
          return res.json({ success: true, scenes })
        }
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
 * @route POST ${process.env.DOMAIN}/owl/segments/deleteScene/:ds
 * @desc Deletes Scene for a specified dataset and test subject
 * @access private
 */
router.post('/deleteScene/:ds', (req, res) => {
  const ds = req.params.ds
  const Scene = req.body.Scene
  const testSubject = req.body.testSubject

  const query = querystring.stringify({ update: owl.deleteScenePerSubject(testSubject, Scene) })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        return res.json({ success: false, error: error })
      } else {
        res.json({ success: true, error: error })
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
* @route POST ${process.env.DOMAIN}/owl/segments/addBeat/:ds
* @desc Creates a new beat for a specified dataset and test subject
* @access private
*/
router.post('/addBeat/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const testSubject = req.body.testSubject
  const frame1 = req.body.frame1
  const frame2 = req.body.frame2
  const protoBeat = req.body.protoBeat

  const query = querystring.stringify({ update: owl.addBeat(testSubject, frame1, frame2, protoBeat) })

  try {
    request.post({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/?' + query
    }, (error) => {
      if (error) {
        return res.json({ success: false, newBeat: {} })
      } else {
        return res.json({ success: true, newBeat: { protobeat: protoBeat, frame1: frame1, frame2: frame2 } })
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
* @route GET ${process.env.DOMAIN}/owl/segments/getBeats/:ds
* @desc Gets all beats per test subject
* @access private
*/
router.get('/getBeats/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const testSubject = req.query.id
  const ds = req.params.ds
  const beats: { beat: any; start: any; end?: any }[] = []

  // get all beginning and end frames for each beat for a test subject
  const beatsQuery = querystring.stringify({ query: owl.getAllBeatsPerSubject(testSubject) })

  try {
    request.get({
      headers: header,
      url: 'http://localhost:3030/' + ds + '/sparql?' + beatsQuery
    }, (error, response, body) => {
      if (error) {
        return res.json({ success: false, error: error })
      } else {
        // convert apache results from xml to json
        const result = JSON.parse(convert.xml2json(body, { compact: true, spaces: 4 }))
        // if empty return empty array
        if ((result.sparql.results.result == null) || (result.sparql.results.result === undefined) || (result.sparql.results.result.length === 0)) { return res.json({ success: true, beats }) } else {
          // conversion returns array of objects
          result.sparql.results.result.forEach((element: { binding: { [x: string]: { uri: { _text: string } } } }, index: number) => {
            // query gets all frames ordered by scene, so we group each start and end frame into an object {scene, start, end}

            // start frame
            if (index % 2 === 0) {
              beats.push({ beat: element.binding['0'].uri._text.split('_')[1], start: element.binding['1'].uri._text.split('_F')[1] })
            } else {
              // end frame
              const prevStart = beats[beats.length - 1].start
              // ensures end frames are ordered before start frames
              if (parseInt(prevStart) > parseInt(element.binding['1'].uri._text.split('_F')[1])) {
                beats[beats.length - 1].start = element.binding['1'].uri._text.split('_F')[1]
                beats[beats.length - 1].end = prevStart
              } else {
                beats[beats.length - 1].end = element.binding['1'].uri._text.split('_F')[1]
              }
            }
          })
          return res.json({ success: true, beats })
        }
      }
    })
  } catch (error) {
    return res.json({ success: false, error: error })
  }
})

/**
 * @route POST ${process.env.DOMAIN}/owl/segments/deleteBeat/:ds
 * @desc Deletes Beat for a specified dataset and test subject
 * @access private
 */
router.post('/deleteBeat/:ds', passport.authenticate('jwt', { session: false }), (req, res) => {
  const ds = req.params.ds
  const beat = req.body.beat
  const testSubject = req.body.testSubject

  const query = querystring.stringify({ update: owl.deleteBeatPerSubject(testSubject, beat) })

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

/*
PREFIX : <http://www.semanticweb.org/lucid/ontologies/2019/9/ucf#>
PREFIX ucsc: <http://www.semanticweb.org/lucid/ontologies/2018/3/ucsc#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX ice: <http://www.semanticweb.org/lucid/ontologies/2018/2/ice#>
PREFIX time: <http://www.w3.org/2006/time#>
DELETE DATA
{
   :P1_F1 <rdf:type> ice:Frame, <owl:NamedIndividual> ;
   time:numericPosition 1 .
   :P1_F100 <rdf:type> ice:Frame, <owl:NamedIndividual> ;
   time:numericPosition 100 .
   :S1 <rdf:type> ice:ProtoScene, <owl:NamedIndividual> ;
   ice:hasCharacterIn ucsc:CharacterBigby .
   :P1_S1 <rdf:type> ice:Scene, <owl:NamedIndividual> ;
   time:hasBeginning :P1_F1 ;
   time:hasEnd :P1_F100 ;
   ice:instanceOf :S1 .
}

*/
