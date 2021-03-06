if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({path: './env/development.env'});
} else if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({path: './env/production.env'});
}

var https = require('https');
var fs = require('fs');
var express = require('express');
var passport = require('passport');

var app = express();

require('./initialize/config-init.js')(app, express);
require('./initialize/db-init.js');
require('./initialize/auth-init.js')(app, express, passport);

// ########################### SOCKET.IO CODE ###########################

var http = require('http').Server(app);
exports.io = require('socket.io')(http);

app.use(express.static(__dirname + '/../public'));

http.listen(process.env.PORT, function(){
  console.log('Socket.io listening on port:' + process.env.PORT);
});

require('./socket.js');

// ######################### END SOCKET.IO CODE #########################

require('./routes/auth-routes.js')(app, passport);
app.use(require('./lib/ensureAuthenticated.js'));
require('./routes/view-routes.js')(app);

require('./routes/profile-routes.js')(app);
require('./routes/feedback-routes.js')(app);
require('./routes/message-routes.js')(app);
require('./routes/search-routes.js')(app);
require('./routes/item-routes.js')(app);
require('./routes/payment-routes.js')(app);

app.get('/*', function(req, res) {
  res.redirect('/');
})

https.createServer({
  key: fs.readFileSync('./env/key.pem'),
  cert: fs.readFileSync('./env/cert.pem')
}, app).listen(8080);
