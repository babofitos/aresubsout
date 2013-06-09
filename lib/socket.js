var db = require('./db')()

module.exports = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('filter', function(data) {
      console.log('socket?', socket.id)
      console.log('data.filters', data.filters)
      console.log('data filter type', typeof data.filters)
      try {
        data.filters = JSON.parse(data.filters)
        if (!Array.isArray(data.filters)) {
          throw new Error()
        }
        if (data.filters.length >= 30) { 
          return socket.emit('error', {msg: 'You have too many filters. Try to lower the amount'})
        }
      }
      catch(e) {
        return socket.emit('error', {msg: 'Error parsing filters. Try clearing your filters.'})
      }
      
      //list of animes
      var filter = data.filters
      if (filter.length === 0) {
        return socket.emit('results', {results: null})
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
}
