// Define all constants usefull by the server and the client
var constant = {
    SERVER_PORT: 5000,
    SOCKET_PORT: 1337,
    WEB_URL: 'http://localhost',

    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 500,

    BIRD_WIDTH: 42,
    BIRD_HEIGHT: 30,
    MAX_BIRDS_IN_A_ROW: 2,

    // Pipe constants
    MIN_PIPE_HEIGHT: 50,
    MAX_PIPE_HEIGHT: 350,

    MIN_HEIGHT_BETWEEN_PIPES: 60,
    MAX_HEIGHT_BETWEEN_PIPES: 200,

    PIPE_WIDTH: 30,
    DISTANCE_BETWEEN_PIPES: 200,

    enumPlayerState: {
        OnLoginScreen: 1,
        Ready: 2,
        Playing: 3,
        Died: 4
    },

    enumGameState: {
        None:0,
        WaitingForPlayers: 1,
        Playing: 2,
        GameOver: 3
    },

    enumBirdColor: {
        RED: 0,
        BLUE: 1
    }
};


// To be use by the server part, we have to provide the object with exports
if (typeof exports != 'undefined') {
    exports.constant = constant;
}
// Else provide the const object to require.js with define()
else {
    define(constant);
}


