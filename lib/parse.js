var FeedParser = require('feedparser')
  , request = require('request')

exports.list = function(filter, cb) {
  var results = []
    , date = 'Retrieved on '
    , len = filter.length
    , ctr=0

  request('http://tokyotosho.info/rss.php?filter=1&zwnj=0&entries=450')
    .pipe(new FeedParser())
    .on('error', function(error) {
      cb(error)
    })
    .on('meta', function(meta) {
      date += meta.pubDate.toString()
    })
    .on('article', function(article) {
      console.log(article.title)
      ctr+=1
      
      for (var i=0;i<len;i++) {
        var escapeBrackets = filter[i].replace('[', '\\[').replace(']', '\\]')
          , currentFilter = escapeBrackets.split(' ')
          , re = '(?=.*'

        re += currentFilter.join(')(?=.*')
        re += ').+'
        console.log(re)
        var reobj = new RegExp(re, "i")

        if (article.title.match(reobj) != null) {
          results.push({ 
            link: article.link.replace('http://www.nyaa.eu/?page=download', 'http://www.nyaa.eu/?page=view')
          , title: article.title
          })
        }
      }
    })
    .on('end', function() {
      console.log('===end===')
      console.log('ctr', ctr)
      console.log('results', results)
      cb(null, results, date)
    })
}
