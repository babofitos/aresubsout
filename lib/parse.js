var FeedParser = require('feedparser')
  , request = require('request')

exports.list = function(filter, cb) {
  var results = []
    , date = ''
    , len = filter.length

  request('http://tokyotosho.info/rss.php')
    .pipe(new FeedParser())
    .on('error', function(error) {
      cb(error)
    })
    .on('meta', function(meta) {
      console.log('meta')
      date = meta.pubDate
    })
    .on('article', function(article) {
      var title = article.title.toLowerCase()

      for (var i=0;i<len;i++) {
        if (title.indexOf(filter[i]) !== -1) {
          results.push({ 
            link: article.link
          , title: article.title
          })
        }
      }
    })
    .on('end', function() {
      console.log('===end===')
      cb(null, results, date)
    })
}
