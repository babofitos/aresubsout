
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , type = require('./lib/type')
  , parse = require('./lib/parse')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(type('application/json', express.limit('100kb')))
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(function(err, req, res, next) {
    if (err) res.send('Something went wrong', 500)
    if (app.settings.env === 'development') console.log(err)
  })
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res) {
    res.send(404, 'Page Not Found')
  })
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index)
app.post('/', routes.show)

//fetch and save RSS every 5 minutes
setInterval(parse.save, 300000)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
