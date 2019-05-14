// Dependencies.
var express = require('express'),
    http = require('http'),
    path = require('path'),
    Config = require('./config').constant,
    game = require('./game_files/game');

var app = express();
var server = http.Server(app);

app.set('port', process.env.PORT || Config.SERVER_PORT);
app.use('/public', express.static(__dirname + '/public'));

// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/config.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'config.js'));
});

game.startServer(server);
