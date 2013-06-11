var FeedParser = require('feedparser')
  , request = require('request')
  , articleEmitter = require('./emitters').articleEmitter

module.exports = function(db) {
  return new Parse(db)
}

function Parse(db) {
  this.db = db
}

Parse.prototype.save = function(src, cb) {
  var results = []
    , date
    , feed = new FeedParser()

  //begin parsing, open writestream to write articles to
  this.db.startWriteStream()

  feed.on('meta', function(meta) {
    // console.log('meta', meta)
  })
  feed.on('error', function(error) {
    console.log('feed error', error)
  })
  feed.on('article', function(article) {
    // console.log(article.title)
    // console.log(article.link)
    // console.log(article.pubDate)
    this.db.save(article, function(found) {
      if (found) {
        //end db and request stream since article was found
        this.db.endWriteStream()
        rss.end()
        cb()
      } else {
        //since found something not in db, it's new! emit to all clients
        //so that it can be shown without a refresh
        articleEmitter.emit('new', article)
      }
    }.bind(this))
  }.bind(this))

  feed.on('end', function() {
    console.log('===end===')
    //done writing, close wstream
    this.db.endWriteStream()
    cb()
  }.bind(this))

  //parse and save into db
  var rss = request(src)
  rss.pipe(feed)
  rss.on('error', function(err) {
    console.log('problem with RSS request', err)
  })
}