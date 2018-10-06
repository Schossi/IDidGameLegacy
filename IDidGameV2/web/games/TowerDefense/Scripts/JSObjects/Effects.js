var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";

    pub.Smoke = function () { };
    pub.Smoke.init = function (_xCenter, _yCenter, _speed, _quantity, _framesToLive) {
        var i, draw;

        this.xPos = _xCenter - 15;
        this.yPos = _yCenter - 15;

        this.counter = 0;
        this.quantity = _quantity || 3;
        this.speed = _speed;
        this.framesToLive = _framesToLive || 50;

        this.draws = [];

        for (i = 0; i < this.quantity; i++) {
            draw = RSTools.createObject(pub.Drawable);
            draw.initDrawable(this.xPos, this.yPos, 0, 350, 30, 30, false, true);
            draw.speedX = (Math.random() * _speed * 2) - _speed;
            draw.speedY = (Math.random() * _speed * 2) - _speed;
            this.draws.push(draw);
        }

        pub.toUpdate.push(this);
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
            RSTools.removeFromArray(pub.toUpdate, this);
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
                draw.initDrawable(pX, pY, sX, sY, partSizeX, partSizeY, false, true);
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

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));