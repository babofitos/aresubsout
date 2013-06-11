var cronJob = require('cron').CronJob
  , db = require('./db')()

module.exports = function(io) {
  var parse = require('./parse')(db)

  // fetch and save RSS every 5 minutes
  var fetchRSS = new cronJob('0 */5 * * * *', function() {
    parse.save('http://tokyotosho.info/rss.php?filter=1', function(){})
  }, null, true).start()

  var deleteWeekOld = new cronJob('00 00 00 * * 0-6', function() {
    console.log('deleting week old keys')
    db.purge(function(err) {
      if (err) console.log('error deleting')
    })
  }, null, false).start()
}
