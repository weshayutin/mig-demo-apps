var restify = require('restify'),
    fs      = require('fs'),
    config  = require('./bin/config.js'),
    db      = require('./bin/db.js');
var app     = restify.createServer();

// Initialize database asynchronously (will retry when MongoDB is available)
db.initDB('keepAlive').catch(err => {
  console.error('Database initialization failed (MongoDB may not be ready yet):', err.message);
  console.log('Application will continue to start and retry database connection...');
});

app.use(restify.plugins.queryParser())
app.use(restify.plugins.cors())
app.use(restify.plugins.fullResponse())

// Routes
app.get('/parks/within', db.selectBox);
app.get('/parks', db.selectAll);
app.get('/status', function (req, res, next)
{
  res.send("{status: 'ok'}");
});

app.get('/', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/index.html');
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});

app.get(/\/(css|js|img)\/?.*/, restify.plugins.serveStatic({directory: __dirname+'/static/'}));

app.listen(config.get('PORT'), config.get('IP'), function () {
  console.log( "Listening on " + config.get('IP') + ", port " + config.get('PORT'))
});
