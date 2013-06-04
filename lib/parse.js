var FeedParser = require('feedparser')
  , request = require('request')
  , levelup = require('levelup')
  , options = { valueEncoding: 'json' }
  , db = levelup('./db', options)

exports.save = function() {
  var results = []
    , date
    , ws = db.createWriteStream()
    , feed = new FeedParser()

  ws.on('error', function(err) {
    console.log('ws err', err)
  })
  ws.on('close', function() {
    console.log('Stream Closed')
  })

  //parse and save into db
  var parseRSS = request('http://tokyotosho.info/rss.php?filter=1')
    .pipe(feed)
    .on('error', function(error) {
      console.log(error)
    })
    .on('article', function(article) {
      console.log(article.title)
      console.log(article.link)
      console.log(article.pubDate)
      db.get(article.title, function(err, value) {
        //if found, end streams since we have data in db
        if (!err) {
          console.log('Found article in db')
          ws.end()
          parseRSS.end()
        } else {
          ws.write(
            { key: article.title
            , value: { link: article.link, date: article.pubDate.toString() } 
            }
          )
        }
      })
      
    })
    .on('end', function() {
      console.log('===end===')
      //done writing, close wstream
      ws.end()
    })
}

exports.list = function(filter, cb) {
  var results = []
    , rs = db.createReadStream()
    
  function compare(data) {
    var len = filter.length

    for (var i=0;i<len;i++) {
      var escapeBrackets = filter[i].replace('[', '\\[').replace(']', '\\]')
        , currentFilter = escapeBrackets.split(' ')
        , re = '(?=.*'

      re += currentFilter.join(')(?=.*')
      re += ').+'
      var reobj = new RegExp(re, "i")
      if (data.key.match(reobj) != null) {
        results.push({ 
          link: data.value.link.replace('http://www.nyaa.eu/?page=download', 'http://www.nyaa.eu/?page=view')
        , title: data.key
        })
      }
    }
  }
  rs.on('data', function(data) {
    compare(data)
  })
  rs.on('error', function(err) {
    cb(err)
  })
  
  rs.on('end', function() {
    cb(null, results)
  })
}
