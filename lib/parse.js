var FeedParser = require('feedparser')
  , request = require('request')
  , db = require('./db.js')

exports.save = function() {
  var results = []
    , date
    , feed = new FeedParser()

  //begin parsing, open writestream to write articles to
  db.startWriteStream()

  feed.on('error', function(error) {
    console.log('feed error', error)
  })
  feed.on('article', function(article) {
    console.log(article.title)
    console.log(article.link)
    console.log(article.pubDate)

    db.save(article, function(found) {
      if (found) {
        //end db and request stream since article was found
        db.endWriteStream()
        rss.end()
      }
    })
  })

  feed.on('end', function() {
    console.log('===end===')
    //done writing, close wstream
    db.endWriteStream()
  })

  //parse and save into db
  var rss = request('http://tokyotosho.info/rss.php?filter=1').pipe(feed)
}
