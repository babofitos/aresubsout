
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , type = require('./lib/type')
  , parse = require('./lib/parse')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , levelup = require('levelup')
  , options = { valueEncoding: 'json' }
  , db = require('./lib/db')(levelup('./db', options))
  , cronJob = require('cron').CronJob

io.configure('production', function(){
  io.enable('browser client minification')
  io.enable('browser client etag')
  io.enable('browser client gzip')
  io.set('log level', 1);

  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ])
})

io.configure('development', function(){
  io.set('transports', ['websocket'])
  io.set('log level', 3)
})

require('./lib/socket')(io)

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.limit('100kb'))
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(err, req, res, next) {
    if (err) res.send('Something went wrong', 500)
    if (app.settings.env === 'development') console.log(err)
  })
  app.use(function(req, res) {
    res.send(404, 'Page Not Found')
  })
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes/index.js')(app, io)

// fetch and save RSS every 5 minutes
var fetchRSS = new cronJob('0 */5 * * * *', function() {
  parse.save('http://tokyotosho.info/rss.php?filter=1', io, function(){})
}, null, true).start()

var deleteWeekOld = new cronJob('00 00 00 * * 0-6', function() {
  console.log('deleting week old keys')
  db.purge(function(err) {
    if (err) console.log('error deleting')
  })
}, null, false).start()
// parse.save('http://tokyotosho.info/rss.php?filter=1', io, function() {
// })

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});