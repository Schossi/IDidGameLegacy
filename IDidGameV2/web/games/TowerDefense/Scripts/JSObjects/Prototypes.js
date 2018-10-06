
var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
    var Drawable;
    
    pub.Drawable = function () {
    };
    pub.Drawable.initDrawable= function (_posX, _posY,_spriteX,_spriteY, _width, _height,_layer,_unshift) {

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
        
        this.layer =_layer|| 0;

        if (this.layer === 1) {
            pub.toDrawForeground.push(this);
        } else {
            if (_unshift) {
                pub.toDraw.unshift(this);
            } else {
                pub.toDraw.push(this);
            }
        }

        pub.toCommit.push(this);
    };
    pub.Drawable.draw = function () {
        var context = pub.contextMain;

        if (this.layer===1) {
            context = pub.contextForeground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        }
        else if (this.layer === 2) {
            context = pub.contextOverlay;
        }

        if (this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        if (this.rotation || this.rotOffX || this.rotOffY) {
            context.save();

            context.translate(this.centerX, this.centerY);
            context.rotate(RSTools.toRadian( this.rotation ));
            context.translate(-this.centerX - (this.rotOffX || 0), -this.centerY - (this.rotOffY || 0));

            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY , this.width, this.height);

            context.restore();
        } else {
            context.drawImage(pub.spriteMain, this.spriteX, this.spriteY, this.width, this.height, this.posX, this.posY, this.width, this.height);
        }

        if (this.alpha < 1) {
            context.globalAlpha = 1;
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
        }
    };
    pub.Drawable.lookAt = function (target) {
        this.rotation = RSTools.vectorToAngle(target.centerX, target.centerY, this.centerX, this.centerY);
    };
    pub.Drawable.getDistance = function (x, y) {
        return RSTools.getDistance(this.posX, this.posY, x, y);
    };
    pub.Drawable.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);
        RSTools.removeFromArray(pub.toCommit, this);
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
    pub.DrawableCircle.initCircle = function (_centerX,_centerY,_radius,_fillstyle,_layer,_unshift) {
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
        var context;

        if (this.layer === 1) {
            context = pub.contextForeground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        }
        else if (this.layer === 2) {
            context = pub.contextOverlay;
        } else {
            context = pub.contextMain;
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
    pub.DrawableCircle.add = function (_layer, _unshift) {
        if (!this.added) {
            this.added = true;

            this.layer = _layer || 0;

            if (this.layer === 1) {
                pub.toDrawForeground.push(this);
            } else {
                if (_unshift) {
                    pub.toDraw.unshift(this);
                } else {
                    pub.toDraw.push(this);
                }
            }
            
            pub.toCommit.push(this);
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
    pub.DrawableRect.initRect = function (_posX, _posY, _width, _height, _fillStyle,_layer,_unshift) {
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.fillStyle = _fillStyle;
        this.alpha = 1;

        if (!this.added) {
            this.added = true;

            this.layer = _layer || 0;

            if (this.layer === 1) {
                pub.toDrawForeground.push(this);
            } else {
                if (_unshift) {
                    pub.toDraw.unshift(this);
                } else {
                    pub.toDraw.push(this);
                }
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
        var context;

        if (this.layer === 1) {
            context = pub.contextForeground;
            context.clearRect(this.posX, this.posY, this.width, this.height);
        }
        else if (this.layer === 2) {
            context = pub.contextOverlay;
        } else {
            context = pub.contextMain;
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
    pub.DrawableText.initText = function (_posX, _posY, _centered, _text, _size,_fillStyle,_layer,_unshift) {
        this.posX = _posX;
        this.posY = _posY;
        this.centered = _centered;
        this.text = _text;
        this.size = _size;
        this.fillStyle=_fillStyle;
        this.layer = _layer || 0;

        this.backThickness = this.size / 10;
        this.alpha = 1;

        if (this.layer === 1) {
            pub.toDrawForeground.push(this);
        } else {
            if (this.unshift) {
                pub.toDraw.push(this);
            } else {
                pub.toDraw.push(this);
            }
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
        var drawX = this.posX,backThickness,
            context;
        
        if (this.layer === 1) {
            context = pub.contextForeground;
        }
        else if (this.layer === 2) {
            context = pub.contextOverlay;
        } else {
            context = pub.contextMain;
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

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));