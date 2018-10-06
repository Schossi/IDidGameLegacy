/// <reference path="../_references.js" />

var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";
    var Drawable;
    
    pub.Drawable = function () {
    };
    pub.Drawable.initDrawable = function (_gameContext, _posX, _posY, _spriteX, _spriteY, _width, _height, _zIndex) {
        this.gameContext = _gameContext;

        this.iposX = _posX;
        this.iposY = _posY;
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.spriteX = _spriteX;
        this.spriteY = _spriteY;
        this.rotation = undefined;
        this.drawParent = undefined;
        this.changeBit = false;
        this.alpha = 1;

        this.zIndex = _zIndex;

        this.gameContext.addToDraw(this);
        this.gameContext.toCommit.push(this);
    };
    pub.Drawable.initAnimation = function (_animationX,_animationY,_animationQuantity,_animationInterval) {
        this.animationX = _animationX;
        this.animationY = _animationY;
        this.animationQuantity = _animationQuantity;
        this.animationInterval = _animationInterval;
        this.animationCounter = 0;
        this.animationFrame=0;
    }
    pub.Drawable.stopAnimation = function () {
        this.animationQuantity = false;
    };
    pub.Drawable.draw = function () {
        var context = this.gameContext.drawingContext;
        
        if (this.animationQuantity) {
            this.animationCounter += 1;

            if (this.animationCounter >= this.animationInterval) {
                this.animationCounter = 0;
                this.animationFrame+=1;

                if (this.animationFrame === this.animationQuantity) {
                    this.animationFrame = 0;
                    this.spriteX -= this.animationX * (this.animationQuantity - 1);
                    this.spriteY -= this.animationY * (this.animationQuantity - 1);
                } else {
                    this.spriteX += this.animationX;
                    this.spriteY += this.animationY;
                }
            }
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }


        if (this.nonOffset) {
            this.gameContext.untransform();
        }

        if (this.rotation || this.rotOffX || this.rotOffY) {
            context.save();

            context.translate(this.centerX, this.centerY);
            context.rotate(RSTools.toRadian( this.rotation ));
            context.translate(-this.centerX - (this.rotOffX || 0), -this.centerY - (this.rotOffY || 0));

            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY,this.drawWidth || this.width, this.drawHeight || this.height);

            context.restore();
        } else {
            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY,this.drawWidth || this.width, this.drawHeight || this.height);
        }


        if (this.nonOffset) {
            this.gameContext.transform();
        }

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }

        if (this.layer === 1 || this.layer === 2) {
            return true;
        }
    }
    pub.Drawable.commitPosition = function (_changeBit) {
        if (this.changeBit === _changeBit) {
            return;
        }

        if (this.drawParent) {
            this.drawParent.commitPosition(_changeBit);

            this.posX = this.drawParent.posX + this.iposX;
            this.posY = this.drawParent.posY + this.iposY;

            this.changeBit = _changeBit;
        }
    };
    pub.Drawable.lookAt = function (target) {
        this.rotation = RSTools.vectorToAngle(target.centerX, target.centerY, this.centerX, this.centerY);
    };
    pub.Drawable.getDistance = function (x, y) {
        return RSTools.getDistance(this.posX, this.posY, x, y);
    };
    pub.Drawable.remove = function () {
        RSTools.removeFromArray(this.gameContext.toDraw, this);
        RSTools.removeFromArray(this.gameContext.toCommit, this);
    };
    Object.defineProperty(pub.Drawable, "centerX", {
        get: function () { return this.posX + (this.centOffX || (this.width / 2)); },
        set: function (value) { this.posX = value - (this.centOffX || (this.width / 2)); }
    });
    Object.defineProperty(pub.Drawable, "centerY", {
        get: function () { return this.posY + (this.centOffY || (this.height / 2)); },
        set: function (value) { this.posY = value - (this.centOffY || (this.height / 2)); }
    });


    pub.DrawableCircle = function () { };
    pub.DrawableCircle.initCircle = function (_gameContext,_centerX,_centerY,_radius,_fillstyle,_zIndex) {
        this.gameContext = _gameContext;

        this.centerX = _centerX;
        this.centerY = _centerY;
        this.radius = _radius;
        this.width = _radius * 2;
        this.height = _radius * 2;
        this.fillStyle = _fillstyle;
        this.changeBit = true;
        this.commitPosition();
        
        this.zIndex = _zIndex;

        this.add();

    };
    pub.DrawableCircle.draw = function () {
        var context = this.gameContext.drawingContext;


        if (this.layer === 1) {
            context = pub.contextBackground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        }
        else if (this.layer === 2) {
            context = pub.contextForeground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        } else if (this.layer === 3) {
            context = pub.contextOverlay;
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
    pub.DrawableCircle.commitPosition = function (_changeBit) {
        if (this.changeBit === _changeBit) {
            return;
        }

        if (this.drawParent) {
            this.drawParent.commitPosition(_changeBit);

            this.centerX = this.drawParent.centerX;
            this.centerY = this.drawParent.centerY;
        }

        this.posX = this.centerX - this.radius;
        this.posY = this.centerY - this.radius;
    }
    pub.DrawableCircle.add = function () {
        if (!this.added) {
            this.added = true;

            this.gameContext.addToDraw(this);
            this.gameContext.toCommit.push(this);
        }
    };
    pub.DrawableCircle.remove = function () {
        if (this.added) {
            this.added = false;
            RSTools.removeFromArray(this.gameContext.toDraw, this);
            RSTools.removeFromArray(this.gameContext.toCommit, this);
        }
    };

    pub.DrawableRect = function () { };
    pub.DrawableRect.initRect = function (_gameContext,_posX, _posY, _width, _height, _fillStyle,_zIndex) {
        this.gameContext = _gameContext;

        this.iposX = _posX;
        this.iposY = _posY;
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.fillStyle = _fillStyle;
        this.alpha = 1;
        this.changeBit = true;
        this.commitPosition();

        this.nonOffset = false;

        this.zIndex = _zIndex;

        this.commitPosition();
        this.add();
    };
    pub.DrawableRect.draw = function () {
        var context = this.gameContext.drawingContext;
        
        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.rotation) {
            context.save();

            context.translate(this.centerX, this.centerY);
            context.rotate(RSTools.toRadian(this.rotation));
            context.translate(-this.centerX, -this.centerY);
        }

        if (this.nonOffset) {
            this.gameContext.untransform();
        }

        context.fillStyle = this.fillStyle;
        context.fillRect(this.posX, this.posY, this.width, this.height);

        if (this.nonOffset) {
            this.gameContext.transform();
        }

        if (this.rotation) {
            context.restore();
        }

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    };
    pub.DrawableRect.commitPosition = function (_changeBit) {
        if (this.changeBit === _changeBit) {
            return;
        }

        if (this.drawParent) {
            this.drawParent.commitPosition(_changeBit);

            this.posX = this.drawParent.posX + this.iposX;
            this.posY = this.drawParent.posY + this.iposY;
        }
    }
    pub.DrawableRect.add = function () {
        if (!this.added) {
            this.added = true;

            this.gameContext.addToDraw(this);
            this.gameContext.toCommit.push(this);
        }
    };
    pub.DrawableRect.remove = function () {
        RSTools.removeFromArray(this.gameContext.toDraw, this);
        RSTools.removeFromArray(this.gameContext.toCommit, this);
    };
    Object.defineProperty(pub.DrawableRect, "centerX", {
        get: function () { return this.posX + (this.centOffX || (this.width / 2)); },
        set: function (value) { this.posX = value - (this.centOffX || (this.width / 2)); }
    });
    Object.defineProperty(pub.DrawableRect, "centerY", {
        get: function () { return this.posY + (this.centOffY || (this.height / 2)); },
        set: function (value) { this.posY = value - (this.centOffY || (this.height / 2)); }
    });

    pub.DrawableText = function () { };
    pub.DrawableText.initText = function (_gameContext,_posX, _posY, _centered, _text, _size,_fillStyle,_zIndex) {
        this.gameContext = _gameContext;

        this.posX = _posX;
        this.posY = _posY;
        this.centered = _centered;
        this.text = _text;
        this.size = _size;
        this.fillStyle=_fillStyle;
        this.zIndex = _zIndex;

        this.backThickness = this.size / 10;
        this.alpha = 1;

        this.gameContext.addToDraw(this);
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
        var drawX = this.posX, backThickness,
            context = this.gameContext.drawingContext;
        
        if (this.layer === 1) {
            context = pub.contextBackground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        }
        else if (this.layer === 2) {
            context = pub.contextForeground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        } else if (this.layer === 3) {
            context = pub.contextOverlay;
        }

        context.font ="bold "+ this.size + "px Arial";

        if (this.centered) {
            this.width = context.measureText(this.text).width;
            drawX -= this.width / 2;
        }

        if (this.layer === 1) {
            context.clearRect(drawX-this.backThickness*2, this.posY-this.size/2-this.backThickness, this.width+this.backThickness*4, this.size+this.backThickness*2);
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.background) {
            context.fillStyle = this.background;
            context.fillRect(drawX - this.backThickness, this.posY - this.size/2 - this.backThickness, this.width + this.backThickness * 2, this.size + this.backThickness * 2);
        }

        context.textBaseline = "middle";
        context.fillStyle = this.fillStyle;
        context.fillText(this.text, drawX, this.posY);

        if (this.alpha < 1) {
            context.globalAlpha = 1;
        }
    };
    pub.DrawableText.remove=function(){
        RSTools.removeFromArray(pub.toDraw,this);
    };

    pub.RepeatingDrawable = function(){};
    pub.RepeatingDrawable.init = function (_gameContext, _posX, _posY, _spriteX, _spriteY, _width, _height, _amountX, _amountY, _zIndex, _offsetX, _offsetY,_drawHeight,_drawWidth,_static) {
        var x, y, draw;

        this.gameContext = _gameContext;

        this.posX = _posX;
        this.posY = _posY;
        this.spriteX = _spriteX;
        this.spriteY = _spriteY;
        this.width = _width;
        this.height = _height;
        this.amountX = _amountX;
        this.amountY = _amountY;
        this.offsetX = _offsetX || this.width;
        this.offsetY = _offsetY || this.height;
        this.zIndex = _zIndex;

        this.draws = [];

        for (x = 0; x < this.amountX; x++) {
            for (y = 0; y < this.amountY; y++) {
                draw = RSTools.createObject(pub.Drawable);
                draw.initDrawable(this.gameContext, this.posX + this.offsetX * x, this.posY + this.offsetY * y, this.spriteX, this.spriteY, this.width, this.height, this.zIndex);
                draw.drawHeight = _drawHeight;
                draw.drawWidth = _drawWidth;
                this.draws.push(draw);
            }
        }

        if (!_static) {
            this.gameContext.toUpdate.push(this);
        }
    };
    pub.RepeatingDrawable.update = function () {
        var i;

        for (i = 0; i < this.draws.length; i++) {
            if (this.draws[i].posY > -this.gameContext.offsetY + 600) {
                this.draws[i].posY -= this.amountY * this.offsetY;
            }
        }
    };

    return pub;
}(IDIDGAME_Respawn || {}, undefined));