// the api routes for the Apache Jena Fuseki server
import express from 'express'
import request from 'request'
// import passport from 'passport'
import querystring from 'querystring'
import convert from 'xml-js'
const router = express.Router()

/*
  const header = {
  Authorization: process.env.NODE_APACHE_PASSWORD,
  'content-type': 'application/x-www-form-urlencoded'
}
*/

/**
 * @route   GET ${process.env.DOMAIN}/owl/ajf/test/
 * @desc    test route
 * @access  public
 */
router.get('/test', (req, res) => res.json({ msg: req.body.dbName }))

/**
 * @route   POST ${process.env.DOMAIN}/owl/ajf/createDataset/
 * @desc    Creates a new dataset
 * @access  public
 */
router.post('/createDataset', (req, res) => {
  try {
    const dbName = req.body.dbName

    request.post({
      headers: { Authorization: process.env.NODE_APACHE_PASSWORD },
      url: 'http://localhost:3030/$/datasets?dbName=/' + dbName + '&dbType=tdb2'
    }, (error) => {
      if (error) { console.error(error) }
    })

    return res.json({ success: true, msg: dbName + ' dataset created' })
  } catch (error) {
    res.json({ success: false, error: error })
  };
})

/**
 * @route   GET ${process.env.DOMAIN}/owl/ajf/getalltriples/:id
 * @desc    Gets all triples in a specified dataset
 * @access  public
 */
router.get('/getalltriples/:id', (req, res) => {
  const query = querystring.stringify({ query: 'SELECT ?s ?p ?o WHERE {?s ?p ?o}' })

  const dbName = req.params.id
  try {
    request.get({
      headers: { Authorization: process.env.NODE_APACHE_PASSWORD },
    }, (error, response) => {
      if (error) {
        res.json(error)
      } else {
        res.json(
          {
            success: true,
            triples: (JSON.parse(
              convert.xml2json(
                response.body,
                { compact: true, spaces: 4 })))
              .sparql.results
          })
      }
    })
  } catch (error) {
    res.json({ success: false, error: error })
  }
})

export default router
