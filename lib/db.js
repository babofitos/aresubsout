module.exports = function(levelup) {
  return new Database(levelup)
}

function Database(levelup) {
  if (levelup) {
    Database.db = levelup
  }
}

Database.prototype.startWriteStream = function() {
  this.ws = Database.db.createWriteStream()

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
  this.rs = Database.db.createReadStream()
  var results = []
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

  this.rs.on('data', function(data) {
    //limit results to 50 or less
    if (resultsCtr <= 50) compare(data)
  })
  this.rs.on('error', function(err) {
    cb(err)
  })
  
  this.rs.on('end', function() {
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
        , value: { link: article.link, date: article.pubDate.toString() } 
        }
      )
      //not found, return false
      cb(false)
    }
  }.bind(this))
}