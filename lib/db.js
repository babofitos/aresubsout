var levelup = require('levelup')
  , options = { valueEncoding: 'json' }
  , db = levelup('../db', options)
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
    , resultsCtr = 0

  function compare(data) {
    var len = filter.length

    for (var i=0;i<len;i++) {
      //make sure it's a string so that .replace works
      //if user entered a number as a filter
      if (typeof filter[i] !== 'string') { 
        filter[i] = filter[i].toString()
      }
      //make sure the element is not ""
      //if malicious user tries to bypass client js
      if (!filter[i]) continue

      //escape user input if they are regexp special
      var escapeBrackets = filter[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        , currentFilter = escapeBrackets.split(' ')
        , re = '(?=.*'

      re += currentFilter.join(')(?=.*')
      re += ').+'
      var reobj = new RegExp(re, "i")
      if (data.key.match(reobj) != null) {
        resultsCtr++
        results.push({ 
          link: data.value.link.replace('http://www.nyaa.eu/?page=download', 'http://www.nyaa.eu/?page=view')
        , title: data.key
        })
      }
    }
  }

  rs.on('data', function(data) {
    //limit results to 50 or less
    if (resultsCtr <= 50) compare(data)
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
      // console.log('Found article in db')
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