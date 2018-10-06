/// <reference path="Index.html" />

var IDIDGAME_Breakout = (function (undefined) {
    "use strict";
    var pub = {},

        version = '0.6.0',

        context_main,
        context_background,

        mouseControlled = false,
        mousePosX = 0,
        mousePosY = 0,

        borderSize = 25,

        runLoop = false,

        mainPaddle,

        ball,

        blocks = [],
        balls = [],
        powerups = [],

        currentLevel = 1,
        brokenBlocks = 0,

        maxLives = 1,
        lives = 1,
        maxBalls=3,
        remainingBalls = 3,
        score = 0,

        slowMoFactor = 1,

        mute = true,
        paused = false,

        loopTime,
        requestFrame,

        //Media
        sprite_Background,
        sprite_Main,
        effect_wall,
        effect_paddle,
        effect_music,

        //dom
        div_gameObject,
        x,
        y,
        canvas_main,
        canvas_background,
        fps,
        ballCount,

        //hoistedFunctions
        initGame,
        toggleMute,
        checkBounce,
        multiball,
        superball,
        getCenter,
        loadMedia,
        loadLevel,
        buildLevel,
        backgroundLoaded,
        mainLoaded,
        initFirstBall,

        start_loop,
        loop,
        onLoopEnd,
        clear_main,
        drawUI,
        drawPaused,
        drawLiveLost,
        drawGameOver,
        onAnyKey,

        //Objects
        Powerup, Ball, Block, Paddle;

    //INPUT
    pub.mouse = function (e) {
        mousePosX = e.pageX -canvas_main.offsetLeft;
        mousePosY = e.pageY -canvas_main.offsetTop;

        x.innerHTML = mousePosX;
        y.innerHTML = mousePosY;
    };
    pub.mouseDown = function (e) {
        var xPos = e.pageX -canvas_main.offsetLeft,
            yPos = e.pageY - canvas_main.offsetTop;

        if (onAnyKey) {
            onAnyKey();
            onAnyKey = undefined;
            return;
        }

        if (e.button === 0) {
            if (xPos > 775 && yPos > 575) {
                toggleMute();
            } else {
                if (runLoop) {
                    mainPaddle.pulling = true;
                }
            }
        } else if (e.button === 2) {
            if (!runLoop) {
                mouseControlled = true;
                start_loop();
            }

            if (mouseControlled) {
                mainPaddle.pushing = true;
            }
        }
    };
    pub.mouseUp = function () {
        if (runLoop) {
            mainPaddle.pulling = false;
        }
    };
    pub.key_down = function (e) {
        var key_id = e.keyCode || e.which;

        if (onAnyKey) {
            onAnyKey();
            onAnyKey = undefined;
            return;
        }

        if (key_id === 40) {//down
            mainPaddle.keyDown = true;
        } else if (key_id === 38) {//up
            if (!runLoop) {
                start_loop();
            }

            mainPaddle.keyUp = true;
        } else if (key_id === 37) {//left
            mainPaddle.keyLeft = true;
        } else if (key_id === 39) {//right
            mainPaddle.keyRight = true;
        } else if (key_id === 32) {//space
            paused = !paused;
        }

        e.preventDefault();
    };
    pub.key_up = function (e) {
        var key_id = e.keyCode || e.which;

        if (key_id === 40) {//down
            mainPaddle.keyDown = false;
        } else if (key_id === 38) {//up
            mainPaddle.keyUp = false;
        } else if (key_id === 37) {//left
            mainPaddle.keyLeft = false;
        } else if (key_id === 39) {//right
            mainPaddle.keyRight = false;
        }

        e.preventDefault();
    };
    pub.contextMenu = function (e) {
        e.preventDefault();
        return false;
    };


    //Paddle

    Paddle = function () {

        this.maxSpeed = function () {
            if (mouseControlled) {
                return 50;
            }
            return 20;
        };

        this.keyUp = false;
        this.keyDown = false;
        this.keyLeft = false;
        this.keyRight = false;

        this.pushing = false;
        this.pushTimeout = 7;
        this.pushCounter = 0;
        this.pulling = false;

        this.pushPullPixels = 5;

        this.spriteX = 0;
        this.spriteY = 0;

        this.width = 100;
        this.height = 50;

        this.posX = 0;
        this.posY = 0;
        this.modY = 0;

        this.momentumX = 0;

        this.turnFactor = 0;
        this.maxTurnFactor = 10;

        this.accelleration = 1.5;
        this.decelleration = 3;
    };
    Paddle.prototype.draw = function () {
        context_main.save();

        context_main.translate(this.posX + this.width / 2, this.posY + this.modY + this.height / 2);

        context_main.rotate(this.turnFactor * Math.PI / 180);

        context_main.translate(-(this.posX + this.width / 2), -(this.posY + this.modY + this.height / 2));
        context_main.drawImage(sprite_Main, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY + this.modY, this.width, this.height);
        context_main.restore();
    };
    Paddle.prototype.update = function () {

        this.modY = 0;

        if (mouseControlled) {
            if (this.pushing) {
                this.modY -= this.pushPullPixels;
                this.pushCounter += 1;

                if (this.pushCounter >= this.pushTimeout) {
                    this.pushCounter = 0;
                    this.pushing = false;
                }
            }
            if (this.pulling) {
                this.modY += this.pushPullPixels;
            }

            this.momentumX = mousePosX - this.posX - this.width / 2;
        } else {
            if (this.keyUp) {
                if (this.pushing) {
                    this.pushCounter += 1;

                    if (this.pushCounter >= this.pushTimeout) {
                        this.pushCounter = this.pushTimeout;
                    } else {
                        this.modY -= this.pushPullPixels;
                    }
                } else {
                    this.pushing = true;
                    this.modY -= this.pushPullPixels;
                }
            } else if (this.pushing) {
                this.pushing = false;
                this.pushCounter = 0;
            }

            if (this.keyDown) {
                this.modY += this.pushPullPixels;
                this.pulling = true;
            } else if (this.pulling) {
                this.pulling = false;
            }

            if (this.keyLeft) {//down
                this.momentumX -= this.accelleration;

                if (this.momentumX > 0) {
                    this.momentumX -= this.accelleration;
                }
            } else if (this.keyRight) {//up
                this.momentumX += this.accelleration;

                if (this.momentumX < 0) {
                    this.momentumX += this.accelleration;
                }
            } else if (this.momentumX > 0) {
                if (this.momentumX < this.decelleration) {
                    this.momentumX = 0;
                } else {
                    this.momentumX -= this.decelleration;
                }
            } else if (this.momentumX < 0) {
                if (this.momentumX > -this.decelleration) {
                    this.momentumX = 0;
                } else {
                    this.momentumX += this.decelleration;
                }
            }
        }

        if (this.momentumX > this.maxSpeed()) {
            this.momentumX = this.maxSpeed();
        } else if (this.momentumX < -this.maxSpeed()) {
            this.momentumX = -this.maxSpeed();
        }

        this.turnFactor += this.momentumX;
        this.turnFactor -= this.turnFactor / 5;

        if (Math.abs(this.turnFactor) > this.maxTurnFactor) {
            if (this.turnFactor > 0) {
                this.turnFactor = this.maxTurnFactor;
            } else {
                this.turnFactor = -this.maxTurnFactor;
            }
        }
    };
    Paddle.prototype.move = function () {
        this.posX += this.momentumX * slowMoFactor;

        if (this.posX < borderSize) {
            this.posX = borderSize;
            this.momentumX = 0;
            this.turnFactor = 0;
        }
        if (this.posX + this.width > canvas_main.width - borderSize) {
            this.posX = canvas_main.width - this.width - borderSize;
            this.momentumX = 0;
            this.turnFactor = 0;
        }
    };


    //Ball

    Ball = function () {
        this.spriteX = 0;
        this.spriteY = 50;

        this.width = 20;
        this.height = 20;

        this.posX = 0;
        this.posY = 0;

        this.speedX = 0;
        this.speedY = -4;

        this.speedModifier = 0;
        this.maxSpeedMod = 3;

        this.maxSpeedX = 5;

        this.super = false;
        this.superCounter = 0;

        this.out=false;
        this.outAnimationCounter=0;
    };
    Ball.prototype.draw = function () {
        if (this.super) {
            this.spriteX += 20;
        }
        context_main.drawImage(sprite_Main, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);
        if (this.super) {
            this.spriteX -= 20;
        }
    };
    Ball.prototype.update = function () {

        if (this.super) {
            this.superCounter -= 1;

            if (this.superCounter <= 0) {
                this.super = false;
            }
        }

        if (this.posY + this.height >= canvas_main.height - borderSize) {
            this.out = true;
        }
        if (this.posY <= borderSize) {
            this.speedY = -this.speedY;
        }
        if (this.posX <= borderSize || this.posX + this.width >= canvas_main.width - borderSize) {
            this.speedX = -this.speedX;
        }
    };
    Ball.prototype.move = function () {
        if (this.out) {
            this.outAnimationCounter += 1;
            
            this.posX += Math.random() * 6 - 3;
            this.posY += Math.random() * 6 - 3;

            if (this.outAnimationCounter === 10) {
                balls.splice(balls.indexOf(this), 1);

                if (balls.length === 0) {
                    remainingBalls -= 1;

                    if (remainingBalls === 0) {
                        lives -= 1;
                    }

                    if (lives === 0) {
                        onLoopEnd= drawGameOver;
                    } else if (remainingBalls === 0) {
                        remainingBalls = maxBalls;
                        onLoopEnd= drawLiveLost;
                    } else {
                        initFirstBall();
                        return;
                    }

                    pub.stop_loop();
                }
            }
        } else {
            this.posX += this.speedX * slowMoFactor;
            this.posY += this.speedY * slowMoFactor * this.speedModifier;

            if (this.posY < borderSize) {
                this.posY = borderSize;
            }
            if (this.posY + this.height > canvas_main.height - borderSize) {
                this.posY = canvas_main.height - this.height - borderSize;
            }
            if (this.posX + this.width > canvas_main.width - borderSize) {
                this.posX = canvas_main.width - this.width - borderSize;
            }
        }
    };
    Ball.prototype.collisionHandling = function () {
        var collisionVector,
            i;

        if (this.posY > canvas_main.height - borderSize - mainPaddle.height - this.height - 30) {//Check for Paddle Collision
            mainPaddle.posY += mainPaddle.modY;
            collisionVector = checkBounce(this, mainPaddle);
            if (collisionVector) {
                effect_paddle.play();

                if (collisionVector.y === 1) {
                    this.speedX *= collisionVector.x;
                } else {
                    this.speedY = -Math.abs(this.speedY);
                    if (mainPaddle.pushing) {
                        mainPaddle.pushing = false;
                        mainPaddle.keyUp = false;

                        if (this.speedModifier < this.maxSpeedMod) {
                            if (this.speedModifier === 0) {
                                this.speedX = 1;
                            }

                            this.speedModifier += 1;
                        }
                    } else if (mainPaddle.pulling) {
                        if (this.speedModifier > 1) {
                            this.speedModifier -= 1;
                        }
                    }

                    if (mainPaddle.momentumX) {
                        this.speedX += mainPaddle.turnFactor / 5;

                        if (Math.abs(this.speedX) > this.maxSpeedX) {
                            if (this.speedX > 0) {
                                this.speedX = this.maxSpeedX;
                            } else {
                                this.speedX = -this.maxSpeedX;
                            }
                        }
                    }
                }
            }
            mainPaddle.posY -= mainPaddle.modY;
        } else if (this.posY < canvas_main.height - borderSize - 100) {//Check for Block Collision

            //CheckCollision
            for (i = 0; i < blocks.length; i += 1) {
                if (!blocks[i].broken) {
                    collisionVector = checkBounce(this, blocks[i]);
                    if (collisionVector) {

                        if (!this.super) {
                            this.speedX *= collisionVector.x;
                            this.speedY *= collisionVector.y;
                        }

                        if (this.speedModifier > blocks[i].type || this.super) {
                            effect_wall.play();
                            blocks[i].broken = true;
                            score += (blocks[i].type + 1) * this.speedModifier;
                            brokenBlocks += 1;
                        }
                        else {
                            effect_paddle.play();
                        }
                        break;
                    }
                }
            }
        }
    };


    //Block

    Block = function () {
        this.type = 0;

        this.spriteX = 40;
        this.spriteY = 70;

        this.width = 40;
        this.height = 20;

        this.posX = 0;
        this.posY = 0;

        this.broken = false;
        this.gone = false;

        this.hopY = 0;
    };
    Block.prototype.update = function () {
        var type,
            powerup,
            rand;

        if (this.broken && !this.gone) {
            this.hopY += 1;

            if (this.hopY > 3) {
                this.posY += 1;
            } else {
                this.posY -= 1;
            }

            if (this.hopY > 10) {
                this.gone = true;

                if (Math.random() * 100 > 90) {
                    rand = Math.random() * 100;
                    if (rand < 5) {
                        type = 3;
                    } else if (rand < 50) {
                        type = 2;
                    } else {
                        type = 1;
                    }
                    powerup = new Powerup();
                    powerup.type = type;
                    powerup.posX = this.posX;
                    powerup.posY = this.posY;
                    powerups[powerups.length] = powerup;
                }
            }
        }
    };
    Block.prototype.draw = function () {
        if (!this.gone) {
            if (this.broken) {
                context_main.globalAlpha = 1 - this.hopY / 10;
            }

            context_main.drawImage(sprite_Main, this.spriteX * this.type, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);

            context_main.globalAlpha = 1;
        }
    };


    //Powerup

    Powerup = function () {
        this.posX = 0;
        this.posY = 0;

        this.width = 40;
        this.height = 20;

        this.type = 0;

        this.activated = false;
        this.activationCounter = 0;
    };
    Powerup.prototype.update = function () {
        this.posY += 6;
    };
    Powerup.prototype.draw = function () {
        if (this.activated) {
            this.activationCounter += 1;

            this.posX -= 1;
            this.width += 2;
            context_main.globalAlpha = 1 - this.activationCounter / 10;

            if (this.activationCounter === 10) {
                powerups.splice(powerups.indexOf(this), 1);
            }
        }

        context_main.drawImage(sprite_Main, 200 + this.width * (this.type - 1), 70, 40, 20, this.posX, this.posY, this.width, this.height);
        context_main.globalAlpha = 1;
    };
    Powerup.prototype.activate = function () {
        this.activated = true;

        switch (this.type) {
            case 1:
                multiball();
                break;
            case 2:
                superball();
                break;
            case 3:
                lives += 1;
                break;
        }
    };
    Powerup.prototype.collisionHandling = function () {
        if (!this.activated && checkBounce(this, mainPaddle, true)) {
            this.activate();
        }
    };

    multiball = function () {
        var newBall,
            oldBall,
            currentBallCount = balls.length,
            k = currentBallCount,
            i;

        for (i = 0; i < currentBallCount; i += 1) {
            oldBall = balls[i];
            newBall = new Ball();
            newBall.posX = oldBall.posX;
            newBall.posY = oldBall.posY;
            newBall.speedY = oldBall.speedY;
            newBall.speedX = oldBall.speedX + 3;
            newBall.speedModifier = oldBall.speedModifier;
            balls[k] = newBall;
            k += 1;
        }
    };
    superball = function () {
        var i;

        for (i = 0; i < balls.length; i += 1) {
            balls[i].super = true;
            balls[i].superCounter = Math.random() * 300;
        }
    };


    //Helpers
    checkBounce = function (movingObj, staticObj, ignoreDirection) {
        var returnVector,
            movingCenter, staticCenter,
            collisionCase,
            penX, penY;

        if (movingObj.posX + movingObj.width < staticObj.posX) {//Left Off
            return undefined;
        }
        if (movingObj.posX > staticObj.posX + staticObj.width) {//Right Off
            return undefined;
        }
        if (movingObj.posY + movingObj.height < staticObj.posY) {//Over
            return undefined;
        }
        if (movingObj.posY > staticObj.posY + staticObj.height) {//Under
            return undefined;
        }

        if (ignoreDirection) {
            return true;
        }

        //CollisionDetected
        returnVector = {};
        returnVector.x = 0;
        returnVector.y = 0;

        movingCenter = getCenter(movingObj);
        staticCenter = getCenter(staticObj);

        //0|1 CollisionCase
        //---
        //2|3

        collisionCase = 0;
        //Determine Collision Case
        if (movingCenter.x > staticCenter.x) {//Right
            collisionCase += 1;
        }
        if (movingCenter.y > staticCenter.y) {//Under
            collisionCase += 2;
        }

        //Calculate Penetration
        if (movingCenter.y < staticCenter.y) {//Over
            penY = movingObj.posY + movingObj.height - staticObj.posY;
        } else {//Under
            penY = staticObj.posY + staticObj.height - movingObj.posY;
        }
        if (movingCenter.x < staticCenter.x) {//Left
            penX = movingObj.posX + movingObj.width - staticObj.posX;
        } else {//Right
            penX = staticObj.posX + staticObj.width - movingObj.posX;
        }

        //Debugging Purposes
        returnVector.penX = penX;
        returnVector.penY = penY;
        returnVector.case = collisionCase;

        if (penY < penX) {//bounce Y
            returnVector.y = -1;
            returnVector.x = 1;
        } else {//bounce X
            returnVector.x = -1;
            returnVector.y = 1;
        }

        return returnVector;
    };
    getCenter = function (obj) {
        return (function (obj) {
            var ret = {};

            ret.x = obj.posX + obj.width;
            ret.y = obj.posY + obj.height / 2;
            return ret;
        }(obj));
    };

    //INIT
    function init() {

        remainingBalls = maxBalls;
        lives = maxLives;
        score = 0;

        x = document.getElementById("x");
        y = document.getElementById("y");

        canvas_main = document.getElementById("canvas_main");
        canvas_background = document.getElementById("canvas_background");

        div_gameObject = document.getElementById("div_gameObject");

        fps = document.getElementById("fps");
        ballCount = document.getElementById("ballCount");

        context_main = canvas_main.getContext('2d');
        context_background = canvas_background.getContext('2d');

        loadMedia();

        mainPaddle = new Paddle();
        mainPaddle.posX = canvas_main.width / 2 - mainPaddle.width / 2;
        mainPaddle.posY = canvas_main.height - borderSize * 2 - mainPaddle.height;

        initGame();

        document.addEventListener('keydown', pub.key_down, false);
        document.addEventListener('keyup', pub.key_up, false);

        canvas_main.addEventListener('mousedown', pub.mouseDown);
        canvas_main.addEventListener('mouseup', pub.mouseUp);
        canvas_main.addEventListener('mousemove', pub.mouse);
        canvas_main.addEventListener('contextmenu', pub.contextMenu);

        requestFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.moxRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };

    }
    initGame = function () {
        var Level = [];

        balls = [];
        powerups = [];
        blocks = [];

        initFirstBall();

        brokenBlocks = 0;

        loadLevel(currentLevel, Level);

        buildLevel(Level);
    };
    initFirstBall = function () {
        ball = new Ball();
        ball.posX = canvas_main.width / 2 - ball.width / 2;
        ball.posY = mainPaddle.posY - ball.height - 1;
        balls[0] = ball;
    };
    loadMedia = function () {
        var myAudio = document.createElement('audio'),
            canPlayMp3 = !!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/mpeg'),
            canPlayOgg = !!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/ogg; codecs="vorbis"'),
            format;

        if (canPlayMp3) {
            format = ".mp3";
        } else if (canPlayOgg) {
            format = ".ogg";
        }

        sprite_Background = new Image();
        sprite_Background.onload = backgroundLoaded;
        sprite_Background.src = "Images/BreakoutDefault.png";
        sprite_Main = new Image();
        sprite_Main.onload = mainLoaded;
        sprite_Main.src = "Images/BreakoutMain.png";

        effect_wall = new Audio();
        effect_wall.src = "Effects/Wall" + format;
        effect_paddle = new Audio();
        effect_paddle.src = "Effects/Paddle" + format;
        effect_music = new Audio();
        effect_music.src = "Effects/Breakout" + format;
        if (typeof effect_music.loop == 'boolean')
        {
            effect_music.loop = true;
        }
        else
        {
            effect_music.addEventListener('ended', function() {
                this.currentTime = 0;
                this.load();
                this.play();
            }, false);
        }
    };
    backgroundLoaded = function () {
        context_background.drawImage(sprite_Background, 0, 0);
        context_background.font = "10px Arial";
        context_background.fillStyle = "black";
        context_background.fillText("V" + version + " ©IDidGame.com", 2, 595);

        if (!pub.muteToggled)
            toggleMute();
    };
    mainLoaded = function () {
        context_main.fillStyle = "rgba(100,100,100,0.5)";
        context_main.fillRect(25, 25, 750, 550);
        context_main.drawImage(sprite_Main, 0, 120, 400, 200, 200, 200, 400, 200);

        if (!pub.muteToggled)
            toggleMute();
    };

    loadLevel = function (levelNum, Level) {
        while (levelNum > 4) {
            levelNum -= 3;
        }

        if (levelNum === 1) {
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
        }else if (levelNum === 2) {
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 0, 1, 2, 1, 2, 1, 2, 1, 0, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 9, 9]);
            Level.push([9, 9, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 9, 9]);
            Level.push([9, 9, 9, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
        } else if (levelNum === 3) {
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 0, 1, 0, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 0, 1, 2, 1, 0, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 0, 1, 2, 2, 2, 1, 0, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 0, 1, 2, 2, 1, 2, 2, 1, 0, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 0, 1, 2, 2, 1, 0, 1, 2, 2, 1, 0, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 0, 1, 2, 2, 1, 2, 2, 1, 0, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 0, 1, 2, 2, 2, 1, 0, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 0, 1, 2, 1, 0, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 0, 1, 0, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
        } else if (levelNum === 4) {
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9]);
            Level.push([9, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9]);
            Level.push([9, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 9]);
            Level.push([9, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
            Level.push([9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
        }
    };
    buildLevel = function (Level) {
        var i, j,
            k = 0,
            loopBlock;

        for (i = 0; i < 18; i += 1) {
            for (j = 0; j < 15; j += 1) {
                if (Level[j][i] < 9) {
                    loopBlock = new Block();
                    loopBlock.type = Level[j][i];
                    loopBlock.posY = 60 + loopBlock.height * j;
                    loopBlock.posX = borderSize + i * loopBlock.width + 15;
                    blocks[k] = loopBlock;
                    k += 1;
                }
            }
        }
    }
    //LOOP



    start_loop = function () {
        runLoop = true;
        effect_music.play();
        loop();
    };
    pub.stop_loop = function () {
        runLoop = false;
        effect_music.pause();
    };
    loop = function () {
        var i;

        loopTime = new Date().getTime() - loopTime;
        fps.innerHTML = Math.round(1000 / loopTime);
        if (balls.length > 0) {
            ballCount.innerHTML = balls[0].speedModifier;
        }
        loopTime = new Date().getTime();

        if (paused) {
            drawPaused();
        } else {
            clear_main();

            for (i = 0; i < balls.length; i += 1) {
                balls[i].collisionHandling();
            }
            for (i = 0; i < powerups.length; i += 1) {
                powerups[i].collisionHandling();
            }

            mainPaddle.update();
            for (i = 0; i < balls.length; i += 1) {
                balls[i].update();
            }
            for (i = 0; i < blocks.length; i += 1) {
                blocks[i].update();
            }
            for (i = 0; i < powerups.length; i += 1) {
                powerups[i].update();
            }

            mainPaddle.move();
            for (i = 0; i < balls.length; i += 1) {
                balls[i].move();
            }

            mainPaddle.draw();
            for (i = 0; i < powerups.length; i += 1) {
                powerups[i].draw();
            }
            for (i = 0; i < balls.length; i += 1) {
                balls[i].draw();
            }
            for (i = 0; i < blocks.length; i += 1) {
                blocks[i].draw();
            }
            drawUI();

            if (brokenBlocks === blocks.length) {
                brokenBlocks += 1;
                currentLevel += 1;
                initGame();
            }

            if (onLoopEnd) {
                onLoopEnd();
                onLoopEnd = undefined;
            }
        }

        if (runLoop) {
            requestFrame(loop);
        }
    };

    drawPaused = function () {
        context_main.fillStyle = "rgba(100,100,100,0.1)";
        context_main.fillRect(0, 0, canvas_main.width, canvas_main.height);
        context_main.fillStyle = 'white';
        context_main.fillRect(250, 50, 100, 500);
        context_main.fillRect(450, 50, 100, 500);
    };

    drawGameOver = function () {
        context_main.globalAlpha = 0.3;
        context_main.fillStyle = "black";
        context_main.fillRect(0, 0, canvas_main.width, canvas_main.height);
        context_main.globalAlpha = 1;
        context_main.drawImage(sprite_Main, 0, 346, 400, 200, canvas_main.width / 2 - 200, canvas_main.height / 2 - 100, 400, 200);

        context_main.font = "40px Arial";
        context_main.fillStyle = "white";
        context_main.fillText("Game Over", 260,280);
        context_main.font = "20px Arial";
        context_main.fillStyle = "white";
        context_main.fillText("Final Score: " + score, 260, 330);
        context_main.fillText("Level: " + (currentLevel + 1), 260, 360);

        onAnyKey = init;
    };

    drawLiveLost = function () {
        var Level = [];

        context_main.globalAlpha = 0.3;
        context_main.fillStyle = "black";
        context_main.fillRect(0, 0, canvas_main.width, canvas_main.height);
        context_main.globalAlpha = 1;
        context_main.drawImage(sprite_Main, 0, 346, 400, 200, canvas_main.width / 2 - 200, canvas_main.height / 2 - 100, 400, 200);
        
        context_main.font = "40px Arial";
        context_main.fillStyle = "white";
        if (lives > 1) {
            context_main.fillText(lives + " Lives remaining", 240, 320);
        }
        else {
            context_main.fillText(lives + " Live remaining", 240, 320);
        }

        brokenBlocks = 0;

        blocks = [];
        loadLevel(currentLevel,Level);
        buildLevel(Level);

        initFirstBall();

        onAnyKey = start_loop;

        context_main.globalAlpha = 0;
    };

    drawUI = function () {
        var i;
        for (i = 0; i < lives; i += 1) {
            context_main.drawImage(sprite_Main, 0, 90, 20, 20, 28 + i * 20, 30, 20, 20);
        }
        for (i = 0; i < remainingBalls; i += 1) {
            context_main.drawImage(sprite_Main, 0, 50, 20, 20, canvas_main.width - 50 - i * 22, 30, 20, 20);
        }

        context_main.font = "20px Arial";
        context_main.fillStyle = "white";
        context_main.fillText("Score: " + score, 400, 42);
        context_main.fillText("Level: " + currentLevel, 300, 42);
    };

    clear_main = function () {
        context_main.clearRect(0, 0, 800, 600);
    };

    toggleMute = function () {
        pub.muteToggled = true;
        mute = !mute;

        context_background.clearRect(775, 575, 25, 25);

        if (mute) {
            context_background.drawImage(sprite_Main, 25, 320, 25, 25, 775, 575, 25, 25);
        } else {
            context_background.drawImage(sprite_Main, 0, 320, 25, 25, 775, 575, 25, 25);
        }

        if (mute) {
            effect_music.volume = 0;
            effect_paddle.volume = 0;
            effect_wall.volume = 0;
        } else {
            effect_music.volume = 0.8;
            effect_paddle.volume = 0.5;
            effect_wall.volume = 0.5;
        }
    };

    //actually Start
    init();

    return pub;
}());

