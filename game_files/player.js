var Config = require('../config').constant;

var MAX_ROTATION = -10;
var MIN_ROTATION = 60;
var ROTATION_SPEED = 8;
var GRAVITY_SPEED = 0.05;
var JUMP_SPEED = -0.6;

class Player {

    constructor(uid) {
        this.id = uid;
    }

    prepare(pos) {
        this.x = 10 + (pos % Config.MAX_BIRDS_IN_A_ROW * 50);
        this.y = 120 - (pos % Config.MAX_BIRDS_IN_A_ROW * 50);
        this.color = (pos % Config.MAX_BIRDS_IN_A_ROW) === 0 ? Config.enumBirdColor.RED : Config.enumBirdColor.BLUE;
        this.width = 25;
        this.height = 25;
        this.gravity = 0.1;
        this.gravitySpeed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.rotation = 0;
        this.state = Config.enumPlayerState.OnLoginScreen;
        this.score = 0;
    };


    update(frameNo) {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.score = parseInt(calculateScore(frameNo));

        if (this.state = Config.enumPlayerState.Playing) {
            this.rotation += Math.round(this.speedY * ROTATION_SPEED);
            if (this.rotation > MIN_ROTATION)
                this.rotation = MIN_ROTATION;
        }

        this.hitBottom();
    };

    hitBottom() {
        var rockbottom = Config.SCREEN_HEIGHT - this.height;
        if (this.y > rockbottom || this.y <= 0) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
            this.updateState(Config.enumPlayerState.Died);
        }
    };

    updateState(state) {
        this.state = state;
    };

    // jump() {
    //     this.gravitySpeed = JUMP_SPEED;
    //     this.rotation = MAX_ROTATION
    // }
}

function calculateScore(frameNo) {
    return frameNo / Config.DISTANCE_BETWEEN_PIPES
}

module.exports = Player;