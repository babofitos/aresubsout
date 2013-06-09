var FeedParser = require('feedparser')
  , request = require('request')
  , db = require('./db.js')()

exports.save = function(src, io, cb) {
  var results = []
    , date
    , feed = new FeedParser()

  //begin parsing, open writestream to write articles to
  db.startWriteStream()

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
    db.save(article, function(found) {
      if (found) {
        //end db and request stream since article was found
        db.endWriteStream()
        rss.end()
        cb()
      } else {
        //since found something not in db, it's new! emit to all clients
        //so that it can be shown without a refresh
        io.sockets.emit('new', {link: article.link, title: article.title})
      }
    })
  })

  feed.on('end', function() {
    console.log('===end===')
    //done writing, close wstream
    db.endWriteStream()
    cb()
  })

  //parse and save into db
  var rss = request(src)
  rss.pipe(feed)
  rss.on('error', function(err) {
    console.log('problem with RSS request', err)
  })
}