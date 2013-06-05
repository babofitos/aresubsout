
/*
 * GET home page.
 */
var parse = require('../lib/parse.js')
  , db = require('../lib/db.js')

exports.index = function(req, res) {
  res.render('index', { 
    title: 'Are Subs Out?'
  })
};

exports.show = function(req, res, next) {
  //list of animes
  var filter = JSON.parse(req.body.data)
  if (filter.length === 0) {
    res.send(204)
    return
  }
  db.findArticle(filter, function(err, results) {
    if (err) next(err)
    else res.send(200, {results: results})
  })
}