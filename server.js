var fs = require('fs')
  , cluster = require('cluster')
  , path = require('path')
  , http = require('http')
  , express = require('express')
  , bodyParser = require('body-parser')
  , compression = require('compression');

// if(cluster.isMaster) {
//   // Create a worker for each CPU
//   for( var i = 0; i < require('os').cpus().length; i++ ) {
//     cluster.fork();
//   }
//   cluster.on( 'online', function( worker ) {
//     logger.info(`[cluster] Worker ${worker.process.pid} is online.`);
//   });
//   cluster.on( 'exit', function(worker, code, signal) {
//     var newWorker = cluster.fork(); 
//     logger.error(`[cluster] Worker ${worker.process.pid} died. Worker ${newWorker.process.pid} created.`);
//   });
//   return; 
// }

var app = module.exports = express();

// configure express:
app.set('port', process.env.PORT || 3005);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.set('view cache', config.viewCacheOn);

app.set('trust proxy', true);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());


// setup static directory
app.use(express.static(path.join(__dirname,'src')));
app.use(express.static(path.join(__dirname,'dist')));

app.get('/', (req,res) => res.render('index'));
app.get('/todo', (req,res) => res.render('todo'));

// global error handler
app.use(function (error, req, res, next) {
  if (!error) {
    next();
  } else {
    res.status(500).render('error');
  }
});

if(require.main == module) { 
  app.server = http.createServer(app).listen(app.get('port'),function(){
    console.log("EXPRESS LISTENING ON PORT #" + app.get('port'));
  });
}