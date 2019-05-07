var Config = require('../config').constant;

class Obstacle {

    constructor(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
    }

    canBeDroped() {
        if (this.x + Config.PIPE_WIDTH < 0)
            return (true);
        return (false);
    };

    update() {
        if (this.x >= -Config.PIPE_WIDTH) {
            this.x += -1;
        }
    }
}

module.exports = Obstacle;