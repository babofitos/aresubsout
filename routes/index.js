
/*
 * GET home page.
 */
var parse = require('../lib/parse.js')
  , db = require('../lib/db.js')

module.exports = function(app, io) {
  app.get('/', function(req, res) {
    res.render('index', { 
      title: 'Are Subs Out?'
    })

    io.sockets.on('connection', function(socket) {
      socket.on('filter', function(data) {
        console.log('data.filters', data.filters)
        try {
          data.filters = JSON.parse(data.filters)
          if (!Array.isArray(data.filters)) { throw new Error() }
          if (data.filters.length >= 30) { 
            socket.emit('error', {msg: 'You have too many filters. Try to lower the amount'})
            return
          }
        }
        catch(e) {
          socket.emit('error', {msg: 'Error parsing filters. Try clearing your filters.'})
          return
        }
        
        //list of animes
        var filter = data.filters
        if (filter.length === 0) {
          socket.emit('results', {results: null})
        }
        db.findArticles(filter, function(err, results) {
          if (err) {
            socket.emit('error', {error: 'Error retrieving data'})
          } else {
            socket.emit('results', {results: results})
          }
        })
      })
    })
  })
}