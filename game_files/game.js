var Config = require('../config').constant,
    Player = require('./player'),
    Obstacle = require('./obstacle'),
    socketIO = require('socket.io');

var io;
var interval = null;
var sockets = {};
var players = {};
var players_count = 0;
var obstacles = [];
var gameState = Config.enumGameState.None;
var frameNo = 0;
var gameFPS = 1000 / 60;

function pushNewObstacle(xPos) {
    var height = Math.floor(Math.random() * (Config.MAX_PIPE_HEIGHT - Config.MIN_PIPE_HEIGHT + 1) + Config.MIN_PIPE_HEIGHT);
    var gap = Math.floor(Math.random() * (Config.MAX_HEIGHT_BETWEEN_PIPES - Config.MIN_HEIGHT_BETWEEN_PIPES + 1) + Config.MIN_HEIGHT_BETWEEN_PIPES);
    obstacles.push(new Obstacle(Config.PIPE_WIDTH, height, "green", xPos, 0));
    obstacles.push(new Obstacle(Config.PIPE_WIDTH, Config.SCREEN_HEIGHT - height - gap, "green", xPos, height + gap));
}

function preparePlayers() {
    var index = 0;
    for (var id in players) {
        var player = players[id];
        if (player.state !== Config.enumPlayerState.Playing) {
            player.prepare(index)
        }
        index++;
    }
}

function startGame() {
    gameState = Config.enumGameState.WaitingForPlayers;
    interval = setInterval(function () {
        switch (gameState) {
            case Config.enumGameState.WaitingForPlayers:
                showInitialState();
                break;
            case Config.enumGameState.Playing:
                drawGame();
                break;
            case Config.enumGameState.GameOver:
                endGame();
                break;
        }
    }, gameFPS);
}

function showInitialState() {
    if (obstacles.length === 0) {
        pushNewObstacle(Config.DISTANCE_BETWEEN_PIPES);
        pushNewObstacle(Config.DISTANCE_BETWEEN_PIPES * 2);
        pushNewObstacle(Config.DISTANCE_BETWEEN_PIPES * 3);
    }
    io.sockets.emit('waiting_for_players', players, obstacles);
}

function drawGame() {
    frameNo += 1;
    if (obstacles.length > 0 && obstacles[0].canBeDroped()) {
        obstacles.shift();

    }

    if (frameNo === 1 || newObstacleNeeded()) {
        pushNewObstacle(Config.SCREEN_WIDTH);
    }

    for (var i = 0; i < obstacles.length; i += 1) {
        var obstacle = obstacles[i];
        obstacle.update();
    }

    for (var id in players) {
        var player = players[id];
        if (player.state !== Config.enumPlayerState.Died) {
            player.update(frameNo);
        }
    }
    io.sockets.emit('draw', players, obstacles, frameNo);
}

function newObstacleNeeded() {
    return (frameNo / Config.DISTANCE_BETWEEN_PIPES) % 1 === 0;

}

function showGameOver(player) {
    sockets[player.id].emit('game_over');
}

function showLeaderBoard() {
    io.sockets.emit('show_leader_board', players);
}

function endGame() {
    clearInterval(interval);
    showLeaderBoard();
    restartGame();
}

function restartGame() {
    setTimeout(function () {
        initialState();
        startGame();
    }, 5000)
}

function initialState() {
    frameNo = 0;
    obstacles = [];
    gameState = Config.enumGameState.None;
    preparePlayers();
}

function playersAreReady() {
    for (var id in players) {
        if (players[id].state !== Config.enumPlayerState.Ready) {
            return false;
        }
    }
    return true;
}

function playersAreCrashed() {
    for (var id in players) {
        if (players[id].state !== Config.enumPlayerState.Died) {
            return false;
        }
    }
    return true;
}


exports.startServer = function (server) {
    server.listen(process.env.PORT || Config.SERVER_PORT, function () {
        console.log('Starting server on port ' + Config.SERVER_PORT);
        console.log('Enter to game : ' + Config.WEB_URL + ':' + Config.SERVER_PORT);
    });
    io = socketIO(server);

    io.on('connection', function (socket) {
        if (players_count === 2) {
            socket.emit('max_users_limit');
        } else {
            // Add new Player
            sockets[socket.id] = socket;
            players[socket.id] = new Player(socket.id);
            players_count += 1;

            preparePlayers()
        }
        console.log("socket count = " + players_count);

        if (gameState === Config.enumGameState.None) {
            startGame();
        }

        socket.on('accelerate', function (id, n) {
            players[id].gravity = n;
        });

        socket.on('update_account_state', function (id, state) {
            players[id].updateState(state);
            if (state === Config.enumPlayerState.Died) {
                showGameOver(this);
            }
            if (gameState !== Config.enumGameState.Playing && playersAreReady()) {
                io.sockets.emit('game_about_to_begin', 3);
                setTimeout(function () {
                    gameState = Config.enumGameState.Playing;
                }, 3000);
            } else {
                if (playersAreCrashed()) {
                    gameState = Config.enumGameState.GameOver;
                }
            }
        });

        socket.on('disconnect', function () {
            delete sockets[socket.id];
            delete players[socket.id];
            players_count -= 1;

            if (players_count === 0) {
                clearInterval(interval);
                initialState();
            }
            console.log("socket count = " + players_count);
        });

    });
};
