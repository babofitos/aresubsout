
/*
 * GET home page.
 */
var parse = require('../lib/parse.js')

exports.index = function(req, res) {
  res.render('index', { 
    title: 'Are Subs Out?'
  })
};

exports.show = function(req, res) {
  //list of animes
  var animes = JSON.parse(req.body.data)

  if (animes.length === 0) {
    res.send(204)
    return
  }
  
  parse.list(animes, function(err, results, date) {
    if (err) {
      next(err)
    }
    else {
      res.send(200, {results: results, date: date})
    }
  })
}