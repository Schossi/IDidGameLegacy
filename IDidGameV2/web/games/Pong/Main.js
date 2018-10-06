/// <reference path="Index.html" />

var IDIDGAME_Pong = (function (undefined) {
    var pub = {},

    version = '0.8.0';

    //INPUT
    pub.mouse = function (e) {
        var xPos = e.pageX - div_gameObject.offsetLeft;
        var yPos = e.pageY - div_gameObject.offsetTop;

        x.innerHTML = xPos;
        y.innerHTML = yPos;
    }
    pub.mouseDown = function (e) {
        var xPos = e.pageX - div_gameObject.offsetLeft;
        var yPos = e.pageY - div_gameObject.offsetTop;

        if (xPos > 775 && yPos > 575)
            toggleMute();
        else if (!runLoop) {
            leftPlayer.score = 0;
            rightPlayer.score = 0;
            start_loop();
        }
    }
    pub.key_down = function (e) {
        var key_id = e.keyCode || e.which;

        if (key_id == 40) {//down
            rightPlayer.keyDown = true;
        }
        else if (key_id == 38) {//up
            rightPlayer.keyUp = true;
        }
        else if (key_id == 37) {//left
            rightPlayer.keyLeft = true;
        }
        else if (key_id == 39) {//right
            rightPlayer.keyRight = true;
        }

        if (key_id == 83) {//S
            leftPlayer.keyDown = true;
        }
        else if (key_id == 87) {//W
            leftPlayer.keyUp = true;
        }
        else if (key_id == 65) {//A
            leftPlayer.keyLeft = true;
        }
        else if (key_id == 68) {//D
            leftPlayer.keyRight = true;
        }
        e.preventDefault();
    }
    pub.key_up = function (e) {
        var key_id = e.keyCode || e.which;

        if (key_id == 40) {//down
            rightPlayer.keyDown = false;
        }
        else if (key_id == 38) {//up
            rightPlayer.keyUp = false;
        }
        else if (key_id == 37) {//left
            rightPlayer.keyLeft = false;
        }
        else if (key_id == 39) {//right
            rightPlayer.keyRight = false;
        }

        if (key_id == 83) {//down
            leftPlayer.keyDown = false;
        }
        else if (key_id == 87) {//up
            leftPlayer.keyUp = false;
        }
        else if (key_id == 65) {//left
            leftPlayer.keyLeft = false;
        }
        else if (key_id == 68) {//right
            leftPlayer.keyRight = false;
        }
        e.preventDefault();
    }

    context_main = undefined;
    context_background = undefined;

    borderSize = 25;

    runLoop = false;

    leftPlayer = undefined;
    rightPlayer = undefined;

    ball = undefined;

    scoreLimit = 10;

    slowMoFactor = 1;

    mute = true;

    //Media
    sprite_Background = undefined;
    sprite_Main = undefined;

    effect_wall = undefined;
    effect_paddle = undefined;
    effect_music = undefined;


    //Paddle

    function Paddle() {
        this.score = 0;
        this.scoring = false;
        this.opposingPlayer = undefined;

        this.maxSideFactor = 2;
        this.sideFactor = 0;

        this.maxSpeed = 5;
        this.keyUp = false;
        this.keyDown = false;
        this.keyLeft = false;
        this.keyRight = false;

        this.spriteX = 0;
        this.spriteY = 0;

        this.width = 50;
        this.height = 100;

        this.posX = 0;
        this.posY = 0;

        this.momentumY = 0;
        this.accelleration = 0.4;
        this.decelleration = 0.2;
    }
    Paddle.prototype.draw = function () {
        context_main.drawImage(sprite_Main, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);
    };
    Paddle.prototype.update = function () {

        if (this.keyLeft || this.keyRight) {
            this.sideFactor += 0.02;
            if (this.sideFactor > this.maxSideFactor) {
                this.sideFactor = this.maxSideFactor;
            }
        } else {
            this.sideFactor = 0;
        }

        if (this.keyDown) {//down
            this.momentumY += this.accelleration;
        }
        else if (this.keyUp) {//up
            this.momentumY -= this.accelleration;
        }
        else if (this.momentumY > 0) {
            if (this.momentumY < this.decelleration)
                this.momentumY = 0;
            else
                this.momentumY -= this.decelleration;
        }
        else if (this.momentumY < 0) {
            if (this.momentumY > -this.decelleration)
                this.momentumY = 0;
            else
                this.momentumY += this.decelleration;
        }

        if (this.momentumY > this.maxSpeed)
            this.momentumY = this.maxSpeed;
        else if (this.momentumY < -this.maxSpeed)
            this.momentumY = -this.maxSpeed;
    };
    Paddle.prototype.move = function () {
        this.posY += this.momentumY * slowMoFactor;

        if (this.posY < 25) {
            this.posY = 25;
            this.momentumY = 0;
        }
        if (this.posY + this.height > canvas_main.height - 25) {
            this.posY = canvas_main.height - this.height - 25;
            this.momentumY = 0;
        }
    };


    //Ball

    function Ball() {
        this.spriteX = 0;
        this.spriteY = 0;

        this.width = 20;
        this.height = 20;

        this.posX = 0;
        this.posY = 0;

        this.maxSpeedX = 15;
        this.speedX = 5;
        this.speedY = 0;
    }
    Ball.prototype.draw = function () {
        context_main.drawImage(sprite_Main, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);
    };
    Ball.prototype.update = function () {
        if (this.posY <= borderSize || this.posY + this.height >= canvas_main.height - borderSize) {
            this.speedY = -this.speedY;
            effect_wall.play();
        }
        if (this.posX <= borderSize || this.posX + this.width >= canvas_main.width - borderSize) {
            this.speedX = -this.speedX;
            effect_wall.play();
        }

        if (this.posX <= borderSize + 5 + leftPlayer.width) {
            this.checkCollision(leftPlayer);
        }
        else {
            rightPlayer.scoring = false;
        }

        if (this.posX + this.width > canvas_main.width - borderSize - 5 - rightPlayer.width) {
            this.checkCollision(rightPlayer);
        }
        else {
            leftPlayer.scoring = false;
        }

        BallSpeed.textContent = this.speedX;
    };
    Ball.prototype.move = function () {
        this.posX += this.speedX * slowMoFactor;
        this.posY += this.speedY * slowMoFactor;

        if (this.posY < borderSize)
            this.posY = borderSize;
        if (this.posY + this.height > canvas_main.height - borderSize)
            this.posY = canvas_main.height - this.height - borderSize;
        if (this.posX < borderSize)
            this.posX = borderSize;
        if (this.posX + this.width > canvas_main.width - borderSize)
            this.posX = canvas_main.width - this.width - borderSize;
    };
    Ball.prototype.checkCollision = function (player) {
        var caught = false;

        if (this.posY < player.posY + player.height) {
            if (this.posY + this.height > player.posY) {
                caught = true;
            }
        }

        if (caught && !player.opposingPlayer.scoring) {
            if (this.speedX > 0) {
                this.speedX = -this.speedX - 0.8;
                if (this.speedX < -this.maxSpeedX) {
                    this.speedX = -this.maxSpeedX;
                } else {
                    effect_music.playbackRate += 0.1;
                }
            }
            else {
                this.speedX = -this.speedX + 0.8;
                if (this.speedX > this.maxSpeedX) {
                    this.speedX = this.maxSpeedX;
                } else {
                    effect_music.playbackRate += 0.1;
                }
            }

            if (player.keyLeft)
                this.speedY -= player.sideFactor;
            else if (player.keyRight)
                this.speedY += player.sideFactor;

            effect_paddle.play();
        }
        else if (!player.opposingPlayer.scoring) {
            if (this.speedX < 0)
                this.speedX = -5;
            else
                this.speedX = 5;

            this.speedY = 0;

            player.opposingPlayer.score++;
            player.opposingPlayer.scoring = true;

            effect_music.playbackRate = 1;
        }

    };

    //INIT
    Init();
    function Init() {
        context_main = canvas_main.getContext('2d');
        context_background = canvas_background.getContext('2d');

        LoadMedia();

        leftPlayer = new Paddle();
        leftPlayer.posY = 250;
        leftPlayer.posX = 30;
        rightPlayer = new Paddle();
        rightPlayer.posX = 720;
        rightPlayer.posY = 250;
        rightPlayer.spriteX = 50;
        rightPlayer.sideFactor = -1;

        leftPlayer.opposingPlayer = rightPlayer;
        rightPlayer.opposingPlayer = leftPlayer;

        ball = new Ball();
        ball.spriteY = 100;
        ball.posX = 390;
        ball.posY = 290;

        if (Math.random() > 0.5)
            ball.speedX = -5;

        document.addEventListener('keydown', pub.key_down, false);
        document.addEventListener('keyup', pub.key_up, false);

        requestFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.moxRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }
    function LoadMedia() {
        var myAudio = document.createElement('audio');
        var canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
        var canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
        var format;
        if (canPlayMp3)
            format = ".mp3";
        else
            format = ".ogg";

        sprite_Background = new Image();
        sprite_Background.onload = backgroundLoaded;
        sprite_Background.src = "Images/PongDefault.png";
        sprite_Main = new Image();
        sprite_Main.onload = mainLoaded;
        sprite_Main.src = "Images/PongMain.png";

        effect_wall = new Audio();
        effect_wall.src = "Effects/Wall" + format;
        effect_paddle = new Audio();
        effect_paddle.src = "Effects/Paddle" + format;
        effect_music = new Audio();
        effect_music.src = "Effects/Gameboy" + format;
        effect_music.loop = true;
    }
    function backgroundLoaded() {
        context_background.drawImage(sprite_Background, 0, 0);
        context_background.font = "10px Arial";
        context_background.fillStyle = "black";
        context_background.fillText("V" + version + " ©IDidGame.com", 2, 595);

    }
    function mainLoaded() {
        context_main.fillStyle = "rgba(100,100,100,0.5)";
        context_main.fillRect(25, 25, 750, 550);
        context_main.drawImage(sprite_Main, 0, 120, 400, 200, 200, 200, 400, 200);
        toggleMute();
    }

    //LOOP

    function start_loop() {
        runLoop = true;
        effect_music.play();
        loop();
    }
    function stop_loop() {
        runLoop = false;
    }
    function loop() {
        clear_main();

        leftPlayer.update();
        rightPlayer.update();
        ball.update();

        if (rightPlayer.scoring || leftPlayer.scoring)
            slowMoFactor = 0.2;
        else
            slowMoFactor = 1;

        leftPlayer.move();
        rightPlayer.move();
        ball.move();

        leftPlayer.draw();
        rightPlayer.draw();
        ball.draw();

        context_main.font = "50px Arial";
        context_main.fillStyle = 'red';
        context_main.fillText(leftPlayer.score.toString(), 200, 100, 200);
        context_main.fillStyle = 'blue';
        context_main.fillText(rightPlayer.score.toString(), 600, 100, 200);

        if (leftPlayer.scoring && leftPlayer.score > 0) {
            context_main.drawImage(sprite_Main, 300, 0, 200, 100, canvas_main.width / 2 - 100, canvas_main.height / 2 - 50, 200, 100);
        }
        else if (rightPlayer.scoring && rightPlayer.score > 0) {
            context_main.drawImage(sprite_Main, 100, 0, 200, 100, canvas_main.width / 2 - 100, canvas_main.height / 2 - 50, 200, 100);
        }

        if (leftPlayer.score === scoreLimit || rightPlayer.score === scoreLimit) {
            if (leftPlayer.score === scoreLimit) {
                context_main.fillStyle = "rgba(255,100,100,0.5)";
                context_main.fillRect(25, 25, 750, 550);
                context_main.drawImage(sprite_Main, 300, 320, 200, 100, canvas_main.width / 2 - 100, 80, 200, 100);
            }
            else {
                context_main.fillStyle = "rgba(100,100,255,0.5)";
                context_main.fillRect(25, 25, 750, 550);
                context_main.drawImage(sprite_Main, 100, 320, 200, 100, canvas_main.width / 2 - 100, 80, 200, 100);
            }

            context_main.drawImage(sprite_Main, 0, 120, 400, 200, 200, 200, 400, 200);
            effect_music.pause();
            stop_loop();
        }

        if (runLoop) {
            requestFrame(loop);
        }
    }

    function clear_main() {
        context_main.clearRect(0, 0, 800, 600);
    }

    function toggleMute() {
        mute = !mute;

        context_background.clearRect(775, 575, 25, 25);

        if (mute) {
            effect_paddle.volume = 0;
            effect_wall.volume = 0;
            effect_music.volume = 0;

            context_background.drawImage(sprite_Main, 25, 320, 25, 25, 775, 575, 25, 25);
        }
        else {
            effect_paddle.volume = 0.8;
            effect_wall.volume = 0.8;
            effect_music.volume = 0.8;

            context_background.drawImage(sprite_Main, 0, 320, 25, 25, 775, 575, 25, 25);
        }
    }

    return pub;
}());

