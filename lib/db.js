var compare = require('./compare').compare

module.exports = function(levelup) {
  return new Database(levelup)
}

function Database(levelup) {
  if (levelup) {
    Database.db = levelup
  }
}

Database.prototype.startWriteStream = function() {
  this.ws = Database.db.writeStream()
  this.ws.on('error', function(err) {
    console.log('ws err', err)
  })

  this.ws.on('close', function() {
    console.log('Stream Closed')
  })
}

Database.prototype.endWriteStream = function() {
  this.ws.end()
}

Database.prototype.findArticles = function(filter, cb) {
  this.rs = Database.db.readStream()
  var results = []
    , resultsCtr = 0

  this.rs.on('data', function(data) {
    //limit results to 50 or less
    if (resultsCtr <= 50) compare(filter, data, results, resultsCtr)
  })
  this.rs.on('error', function(err) {
    cb(err)
  })
  
  this.rs.on('end', function() {
    console.log('ending')
    cb(null, results)
  })
}

Database.prototype.save = function(article, cb) {
  Database.db.get(article.title, function(err) {
    //errors if article not found
    //end stream if no error since it's in db
    if (!err) {
      // console.log('Found article in db')
      //found, return true
      cb(true)
    } else {
      console.log('Found new article')
      this.ws.write(
        { key: article.title
        , value: { 
            link: article.link
          , date: article.pubDate.getTime() 
          } 
        }
      )
      //not found, return false
      cb(false)
    }
  }.bind(this))
}

Database.prototype.purge = function(cb) {
  this.rs = Database.db.readStream()

  this.rs.on('data', function(data) {
    //if 1 week ago in milliseconds greater than date added to db
    if ((Date.now() - 604800000) >= data.value.date) {
      db.del(date.key, function(err) {
        if (err) cb(err)
      })
    }
  })

  this.rs.on('err', function(err) {
    cb(err)
  })

  this.rs.on('end', function() {
    cb(null)
  })
}