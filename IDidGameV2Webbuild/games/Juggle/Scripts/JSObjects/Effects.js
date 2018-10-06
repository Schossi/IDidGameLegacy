/// <reference path="../_references.js" />

var IDIDGAME_Juggle = (function (pub, undefined) {
    "use strict";

    pub.Smoke = function () { };
    pub.Smoke.init = function (_gameContext,_xCenter, _yCenter, _speed, _quantity, _framesToLive) {
        var i, draw;

        this.gameContext = _gameContext;

        this.xPos = _xCenter - 15;
        this.yPos = _yCenter - 15;

        this.counter = 0;
        this.quantity = _quantity || 3;
        this.speed = _speed;
        this.framesToLive = _framesToLive || 50;

        this.draws = [];

        for (i = 0; i < this.quantity; i++) {
            draw = RSTools.createObject(pub.Drawable);
            draw.initDrawable(this.gameContext,this.xPos, this.yPos, 0, 220, 30, 30, -250);
            draw.speedX = (Math.random() * _speed * 2) - _speed;
            draw.speedY = (Math.random() * _speed * 2) - _speed;
            this.draws.push(draw);
        }

        this.gameContext.toUpdate.push(this);
    };
    pub.Smoke.update = function () {
        var i, draw;
                
        for (i = 0; i < this.quantity; i++) {
            draw = this.draws[i];

            draw.posX += draw.speedX;
            draw.posY += draw.speedY;

            draw.alpha = 1 - (this.counter / this.framesToLive);
        }

        this.counter += 1;

        if (this.framesToLive <= this.counter) {
            for (i = 0; i < this.quantity; i++) {
                draw = this.draws[i];
                draw.remove();
            }
            RSTools.removeFromArray(this.gameContext.toUpdate, this);
        }
    };

    pub.Disassemble = function () { };
    pub.Disassemble.init = function (_drawable,_xParts,_yParts,_speedX,_speedY,_accelerate,_directionX,_directionY,_frames) {
        var x, y, draw,
            partSizeX = _drawable.width / _xParts, partSizeY = _drawable.height / _yParts,
            pX, pY, sX, sY, cX, cY;

        this.drawable = _drawable;
        this.draws = [];
        this.xParts = _xParts;
        this.yParts = _yParts;

        this.accelerate = _accelerate;
        this.speedX = _speedX || 2;
        this.speedY = _speedY || 2;

        if (!_directionX) {
            _directionX = 0;
        }
        if (!_directionY) {
            _directionY = 0;
        }

        this.counter = 0;
        this.frames = _frames || 100;

        for (x = 0; x < this.xParts; x++) {
            for (y = 0; y < this.yParts; y++) {
                pX = this.drawable.posX + x * partSizeX;
                pY = this.drawable.posY + y * partSizeY;
                sX = this.drawable.spriteX + x * partSizeX;
                sY = this.drawable.spriteY + y * partSizeY;
                cX = this.drawable.width / 2 - x * partSizeX;
                cY = this.drawable.height / 2 - y * partSizeY;

                draw = RSTools.createObject(pub.Drawable);
                draw.initDrawable(_drawable.gameContext, pX, pY, sX, sY, partSizeX, partSizeY, _drawable.zIndex);
                draw.centOffX = cX;
                draw.centOffY = cY;
                draw.speedX = (Math.random() - 0.5 + _directionX) * this.speedX;
                draw.speedY = (Math.random() - 0.5 + _directionY) * this.speedY;

                this.draws.push(draw);
            }
        }

        pub.toUpdate.push(this);
    };
    pub.Disassemble.update = function () {
        var i,draw;

        for (i = 0; i < this.draws.length; i++) {
            draw = this.draws[i];
            draw.posX += draw.speedX;
            draw.posY += draw.speedY;

            if (this.accelerate) {
                draw.speedY += draw.speedY * 0.01;
                draw.speedX += draw.speedX * 0.01;
            } else {
                draw.speedY -= draw.speedY * 0.1;
                draw.speedX -= draw.speedX * 0.1;
            }

            draw.alpha = 1 - ( this.counter/this.frames);
        }

        this.counter += 1;

        if (this.counter === this.frames) {
            RSTools.removeFromArray(pub.toUpdate, this);

            for (i = 0; i < this.draws.length; i++) {
                this.draws[i].remove();
            }
        }
    };

    pub.FadeUnfade = RSTools.createObject(pub.DrawableRect);
    pub.FadeUnfade.init = function (_gameContext, _fadedAction, _unfadedAction, _duration, _color) {
        this.fadedAction = _fadedAction;
        this.unfadedAction = _unfadedAction;

        this.state = 1;

        this.duration = _duration;
        this.counter = 1;
        this.step =(100/this.duration)/100;

        this.initRect(_gameContext, 0, 0, pub.canvas_main.width , pub.canvas_main.height , _color || "Black", 500);
        this.nonOffset = true;
        this.alpha = 0;

        this.gameContext.toUpdate.push(this);
    };
    pub.FadeUnfade.update = function () {
        if (this.state===1) {
            this.counter += 1;
            this.alpha = this.step * this.counter;

            if (this.counter >= this.duration) {
                if (this.fadedAction) {
                    this.fadedAction();

                    this.gameContext = pub.currentGameContext;
                    if (this.gameContext.toUpdate.indexOf(this) === -1) {
                        this.added = false;
                        this.add();
                        this.gameContext.toUpdate.push(this);
                    }
                }
                this.counter = 0;
                this.state = 2;
            }
        } else if (this.state === 2) {
            this.counter += 1;
            this.alpha = 1;

            if (this.counter >= this.duration) {
                
                this.counter = this.duration;
                this.state = 3;
            }
        } else {
            this.counter -= 1;
            this.alpha = this.counter * this.step;

            if (this.counter <= 0) {
                if (this.unfadedAction) {
                    this.unfadedAction();
                }
                RSTools.removeFromArray(this.gameContext.toUpdate, this);
                this.remove();
            }
        }
    };

    pub.DoFadeUnfade = function (_gameContext, _fadedAction) {
        var fade = RSTools.createObject(pub.FadeUnfade);
        fade.init(_gameContext, _fadedAction, function () { }, 5, "Black");
    };

    return pub;
}(IDIDGAME_Juggle || {}, undefined));