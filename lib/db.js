var levelup = require('levelup')
  , options = { valueEncoding: 'json' }
  , db = levelup('./db', options)
  , ws
  , rs

exports.startWriteStream = function() {
  ws = db.createWriteStream()

  ws.on('error', function(err) {
    console.log('ws err', err)
  })

  ws.on('close', function() {
    console.log('Stream Closed')
  })
}

exports.endWriteStream = function() {
  ws.end()
}

exports.findArticles = function(filter, cb) {
  var rs = db.createReadStream()
    , results = []

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

exports.save = function(article, cb) {
  db.get(article.title, function(err) {
    //errors if article not found
    //end stream if no error since it's in db
    if (!err) {
      console.log('Found article in db')
      //found, return true
      cb(true)
    } else {
      console.log('Found new article')
      ws.write(
        { key: article.title
        , value: { link: article.link, date: article.pubDate.toString() } 
        }
      )
      //not found, return false
      cb(false)
    }
  })
}