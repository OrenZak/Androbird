define(['../config'], function (Config) {
    var socket = io();

    var SPRITE_BIRD_HEIGHT = 60;
    var SPRITE_BIRD_WIDTH = 85;
    var DURATION_BIRD_ANIMATION = 150;
    var FRAME_NUMBER_ANIMATION = 3;
    var BIRDS_SPRITES = ['public/images/clumsy-blue.png', 'public/images/clumsy-red.png'];
    var birdsImages = [];

    // Load birds sprites
    for (var i = 0; i < BIRDS_SPRITES.length; i++) {
        var bird = new Image();
        bird.src = BIRDS_SPRITES[i];
        // Add bird sprite in our array
        birdsImages.push(bird);
    }

    var myGameArea = {
        canvas: document.getElementById("canvas"),
        start: function () {
            this.canvas.width = Config.SCREEN_WIDTH;
            this.canvas.height = Config.SCREEN_HEIGHT;
            this.context = this.canvas.getContext("2d");
        },
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    };
    myGameArea.start();

    function drawInitialState(players, obstacles) {
        myGameArea.clear();
        drawObstacles(obstacles);
        for (var id in players) {
            drawPlayer(players[id], 0);
        }
    }

    function gameLoop(players, obstacles) {
        var now = new Date().getTime(),
            player;
        for (var i = 0; i < obstacles.length; i += 1) {
            for (var id in players) {
                player = players[id];
                if (isMe(player) && crashWith(player, obstacles[i])) {
                    if (player.state !== Config.enumPlayerState.Died) {
                        updateAccountState(Config.enumPlayerState.Died);
                    }
                }
            }
        }
        myGameArea.clear();

        drawObstacles(obstacles);

        for (var id in players) {
            player = players[id];
            if (isMe(player)) {
                drawText("SCORE: " + player.score, "25px Consolas", 280, 40)
            }
            drawPlayer(player, now);
        }
    }

    function drawObstacles(obstacles) {
        for (var i = 0; i < obstacles.length; i += 1) {
            var obstacle = obstacles[i];
            myGameArea.context.fillStyle = obstacle.color;
            myGameArea.context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }

    function crashWith(player, otherobj) {
        var myleft = player.x;
        var myright = player.x + (player.width);
        var mytop = player.y;
        var mybottom = player.y + (player.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    };

    function isMe(player) {
        return player.id === socket.id;
    }

    function drawText(text, font, color, x, y) {
        myGameArea.context.font = font;
        myGameArea.context.fillStyle = color;
        myGameArea.context.fillText(text, x, y);
    }

    function drawPlayer(player, time) {
        // Then draw bird
        if (player.state === Config.enumPlayerState.OnLoginScreen || player.state === Config.enumPlayerState.Died) {
            myGameArea.context.drawImage(birdsImages[player.color], 0, 0, SPRITE_BIRD_WIDTH, SPRITE_BIRD_HEIGHT, player.x, player.y, Config.BIRD_WIDTH, Config.BIRD_HEIGHT);
        }
        // If he is ready or in game, animate the bird !
        else {
            var frameNumber = Math.round(time / DURATION_BIRD_ANIMATION) % FRAME_NUMBER_ANIMATION;
            myGameArea.context.drawImage(birdsImages[player.color], frameNumber * SPRITE_BIRD_WIDTH, 0, SPRITE_BIRD_WIDTH, SPRITE_BIRD_HEIGHT, player.x, player.y, Config.BIRD_WIDTH, Config.BIRD_HEIGHT);
        }
    }

    function showGameOver() {
        var info = document.getElementById("info_text");
        info.innerText = "Game Over Mate :)";
        showHideMenu("game_info_panel", true);
        info.classList.add("fade");
    }

    function showLeaderBoard(players) {
        document.getElementById("info_text").classList.toggle("fade");
        showHideMenu('game_info_panel', false);

        var leaderTable = document.getElementById("leaderboard_table");
        leaderTable.innerHTML = "";

        var nameTH = document.createElement('th');
        var scoreTH = document.createElement('th');
        nameTH.appendChild(document.createTextNode("Player Name"));
        scoreTH.appendChild(document.createTextNode("Score"));
        leaderTable.appendChild(nameTH);
        leaderTable.appendChild(scoreTH);


        var tbdy = document.createElement('tbody');
        for (var id in players) {
            var player = players[id];
            var tr = document.createElement('tr');
            var tdN = document.createElement('td');
            var tdS = document.createElement('td');
            tdN.appendChild(document.createTextNode(isMe(player) ? "You!" : player.id));
            tdS.appendChild(document.createTextNode(player.score));
            tr.appendChild(tdN);
            tr.appendChild(tdS);
            tbdy.appendChild(tr);
        }
        leaderTable.appendChild(tbdy);

        leaderTable.classList.add("open");
        showHideMenu("leaderboard_panel", true);

        setTimeout(function () {
            leaderTable.classList.remove("open");
            showHideMenu("leaderboard_panel", false);
        }, 4500);
    }

    function showGameAboutToBeginIn(time) {
        var count = time;
        var countText = document.getElementById("info_text");
        countText.innerText = "";
        showHideMenu("game_info_panel", true);
        var animInterval = setInterval(function () {
            countText.classList.add("fade");
            countText.innerHTML = (count - 1 === 0) ? "Go!" : count;
            count -= 1;
            setTimeout(function () {
                countText.classList.toggle("fade");
            }, 500);
            if (count === 0) {
                setTimeout(function () {
                    showHideMenu("game_info_panel", false);
                }, 500);
                clearInterval(animInterval);
            }
        }, 1000);
    }

    function accelerate(n) {
        socket.emit('accelerate', socket.id, n);
    }

    function updateAccountState(accountState) {
        socket.emit('update_account_state', socket.id, accountState);
    }

    function showHideMenu(panelName, isShow) {
        var panel = document.getElementById(panelName),
            currentOverlayPanel = document.querySelector('.overlay');

        if (isShow) {
            if (currentOverlayPanel)
                currentOverlayPanel.classList.remove('overlay');
            panel.classList.add('overlay');
        }
        else {
            if (currentOverlayPanel)
                currentOverlayPanel.classList.remove('overlay');
        }
    }

    socket.on('waiting_for_players', function (players, obstacles) {
        drawInitialState(players, obstacles);
    });

    socket.on('game_about_to_begin', function (time) {
        console.log("showGameAboutToBeginIn " + time);
        showGameAboutToBeginIn(time);
    });

    socket.on('draw', function (players, obstacles, currentFrameNum) {
        gameLoop(players, obstacles, currentFrameNum);
    });

    socket.on('game_over', function () {
        showGameOver();
    });

    socket.on('show_leader_board', function (players) {
        console.log("show_leader_board");
        showLeaderBoard(players);
    });

    document.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
            case 32: // Space
                accelerate(-0.3);
                break;
        }
    });
    document.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 32: // Space
                accelerate(0.05);
                break;
            case 82: // 'r/R'
                updateAccountState(Config.enumPlayerState.Ready); // state Ready
                break;
        }
    });
});