
var IDIDGAMEPEBBLE = (function (pub, undefined) {
    "use strict";
    var Drawable;
    
    pub.Drawable = function () {
    };
    pub.Drawable.initDrawable = function (_posX, _posY, _spriteX, _spriteY, _width, _height) {

        this.iposX = _posX;
        this.iposY = _posY;
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.spriteX = _spriteX;
        this.spriteY = _spriteY;
        this.rotation = undefined;
        this.changeBit = false;
        this.alpha = 1;

        pub.toDraw.push(this);
    };
    pub.Drawable.draw = function () {
        var context = pub.contextMain;

        if (this.side) {
            context = pub.contextSide;
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.rotation) {
            context.save();

            context.translate(this.centerX, this.centerY);
            context.rotate(RSTools.toRadian( this.rotation ));
            context.translate(-this.centerX, -this.centerY);

            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY , this.width, this.height);

            context.restore();
        } else {
            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);
        }

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    }
    pub.Drawable.lookAt = function (target) {
        this.rotation = RSTools.vectorToAngle(target.centerX, target.centerY, this.centerX, this.centerY);
    };
    pub.Drawable.getDistance = function (x, y) {
        return RSTools.getDistance(this.posX, this.posY, x, y);
    };
    pub.Drawable.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);
    };
    Object.defineProperty(pub.Drawable, "centerX", {
        get: function () { return this.posX + this.width / 2; },
        set: function (value) { this.posX = value - this.width / 2;}
    });
    Object.defineProperty(pub.Drawable, "centerY", {
        get: function () { return this.posY + this.height / 2; },
        set: function (value) { this.posY = value - this.height / 2; }
    });


    pub.DrawableCircle = function () { };
    pub.DrawableCircle.initCircle = function (_centerX,_centerY,_radius,_fillstyle,_unshift) {
        this.centerX = _centerX;
        this.centerY = _centerY;
        this.radius = _radius;
        this.width = _radius * 2;
        this.height = _radius * 2;
        this.fillStyle = _fillstyle;
        this.changeBit = true;
        this.commitPosition();
        
        this.add(_layer, _unshift);

    };
    pub.DrawableCircle.draw = function () {
        var context = pub.contextMain;
        
        if (this.side) {
            context = pub.contextSide;
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        context.fillStyle = this.fillStyle;
        context.beginPath();
        context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
        context.fill();

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }

        if (this.lineWidth) {
            context.strokeStyle = this.strokeStyle || this.fillStyle;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
            context.stroke();
        }
    };
    pub.DrawableCircle.add = function (_layer, _unshift) {
        if (!this.added) {

            if (_unshift) {
                pub.toDraw.unshift(this);
            } else {
                pub.toDraw.push(this);
            }
        }
    };
    pub.DrawableCircle.remove = function () {
        if (this.added) {
            this.added = false;
            RSTools.removeFromArray(pub.toDraw, this);
            RSTools.removeFromArray(pub.toCommit, this);
        }
    };

    pub.DrawableRect = function () { };
    pub.DrawableRect.initRect = function (_posX, _posY, _width, _height, _fillStyle,_unshift) {
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.fillStyle = _fillStyle;
        this.alpha = 1;

        if (!this.added) {
            this.added = true;

            if (_unshift) {
                pub.toDraw.unshift(this);
            } else {
                pub.toDraw.push(this);
            }
        }
    };
    pub.DrawableRect.initOffRotation = function (_centerX, _centerY, _rotation) {
        this.rotCenterX = _centerX;
        this.rotCenterY = _centerY;
        this.rotation = _rotation;
        this.offRotation=true;
    };
    pub.DrawableRect.draw = function () {
        var context = pub.contextMain;
        
        if (this.side) {
            context = pub.contextSide;
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.offRotation) {
            context.save();

            context.translate(this.centerX, this.centerY);
            context.rotate(RSTools.toRadian(this.rotation));
            context.translate(-this.centerX, -this.centerY);
        }

        context.fillStyle = this.fillStyle;
        context.fillRect(this.posX, this.posY, this.width, this.height);

        if (this.offRotation) {
            context.restore();
        }

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    };
    pub.DrawableRect.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);
    };

    pub.DrawableText = function () { };
    pub.DrawableText.initText = function (_posX, _posY, _centered, _text, _size, _fillStyle, _unshift) {
        this.posX = _posX;
        this.posY = _posY;
        this.centered = _centered;
        this.text = _text;
        this.size = _size;
        this.fillStyle = _fillStyle;

        this.alpha = 1;

        if (this.unshift) {
            pub.toDraw.push(this);
        } else {
            pub.toDraw.push(this);
        }
    };
    pub.DrawableText.scroll = function (_speedX, _speedY, _framesToLive) {
        this.speedX = _speedX;
        this.speedY = _speedY;
        this.framesToLive = _framesToLive;

        pub.toUpdate.push(this);
    }
    pub.DrawableText.update = function () {
        this.posX += this.speedX;
        this.posY += this.speedY;

        this.framesToLive -= 1;

        if (this.framesToLive < 0) {
            this.alpha -= 0.1;

            if (this.alpha < 0) {
                RSTools.removeFromArray(pub.toUpdate, this);
                this.remove();
            }
        }
    }
    pub.DrawableText.draw = function () {
        var drawX = this.posX,
            context = pub.contextSide;
        
        if (this.side) {
            context = pub.contextSide;
        }

        context.font ="bold "+ this.size + "px Times New Roman";

        if (this.centered) {
            this.width = context.measureText(this.text).width;
            drawX -= this.width / 2;
        }

        if (this.layer === 1) {
            context.clearRect(drawX, this.posY-this.size, this.width, this.size);
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.background) {
            context.fillStyle = this.background;
            context.fillRect(drawX-2, this.posY-this.size-2, this.width+4, this.size+6);
        }

        context.fillStyle = this.fillStyle;
        context.fillText(this.text, drawX, this.posY);

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    };
    pub.DrawableText.remove=function(){
        RSTools.removeFromArray(pub.toDraw,this);
    };

    return pub;
}(IDIDGAMEPEBBLE || {}, undefined));