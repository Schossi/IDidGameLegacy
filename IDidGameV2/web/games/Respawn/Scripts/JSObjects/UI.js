/// <reference path="../_references.js" />

var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";
   
    pub.activeButton=undefined;

    pub.TextButton = function () { };
    pub.TextButton.initButton = function (_gameContext,_posX, _posY,_width,_height, _text, _action,_zIndex) {
        this.gameContext = _gameContext;
        this.zIndex = _zIndex;

        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;

        this.background = RSTools.createObject(pub.DrawableRect);
        this.text = RSTools.createObject(pub.DrawableText);

        this.background.initRect(_gameContext,_posX, _posY, _width, _height, "Gray", _zIndex);
        this.text.initText(_gameContext, _posX + _width / 2, _posY + _height / 2, true, _text, _height - 10, "White", _zIndex + 1);
        
        this.action = _action;
        this.idown = false;
        this.ivisible = true;

        this.gameContext.onMouseDown.push(this);
        this.gameContext.onMouseUp.push(this);
        this.gameContext.onMouseEnter.push(this);
    };
    pub.TextButton.onMouseDown = function () {
        this.down = true;
        pub.sound.mouseDown.request();
    };
    pub.TextButton.onMouseUp = function () {
        if (this.down) {
            pub.sound.mouseUp.request();
            this.down = false;
            this.action();
        }
    };
    pub.TextButton.onMouseEnter = function () {

    };
    pub.TextButton.onMouseLeave = function () {
        if (this.down) {
            pub.sound.mouseUp.request();
            this.down = false;
        }
    };
    pub.TextButton.hide = function () {
        this.text.alpha = 0;
        this.background.alpha = 0;
        this.ivisible = false;
        this.down = false;
    };
    pub.TextButton.show = function () {
        this.text.alpha = 1;
        this.background.alpha = 1;
        this.background.draw();
        this.ivisible = true;
        this.down = false;
    };
    Object.defineProperty(pub.TextButton, "down", {
        get: function () {
            return this.idown;
        },
        set: function (value) {
            if (!this.visible) {
                return;
            }

            this.idown = value;

            if (this.idown) {
                this.background.fillStyle = "White";
                this.text.fillStyle = "Black";
            } else {
                this.background.fillStyle = "Gray";
                this.text.fillStyle = "White";
            }

        }
    });
    Object.defineProperty(pub.TextButton, "visible", {
        get:function(){
            return this.ivisible;
        },
        set: function (value) {
            this.ivisible = value;

            if (value) {
                this.show();
            } else {
                this.hide();
            }
        }
    });
    Object.defineProperty(pub.TextButton, "alpha", {
        get: function () {
            return this.text.alpha;
        },
        set: function (value) {
            this.text.alpha = value;
            this.background.alpha = 0;
        }
    });
    
    pub.Button = RSTools.createObject(pub.Drawable);
    pub.Button.initButton = function (_posX, _posY,_spriteX,_onClick) {
        this.initDrawable(_posX, _posY, _spriteX, 150, 25, 50, 1);

        this.idown = false;
        this.onClick = _onClick;
        
        pub.onMouseDown.push(this);
        pub.onMouseUp.push(this);
        pub.onMouseEnter.push(this);

        this.draw();
    };
    pub.Button.onMouseDown = function () {
        this.down = true;
        pub.sound.mouseDown.request();
    };
    pub.Button.onMouseUp = function () {
        if (this.down) {
            this.onClick();
            this.down = false;
            pub.sound.mouseUp.request();
        }
    };
    pub.Button.onMouseEnter = function () {
        
    }
    pub.Button.onMouseLeave = function () {
        this.down = false;
    };
    Object.defineProperty(pub.Button, "down", {
        get: function () {
            return this.idown;
        },
        set: function (value) {
            this.idown = value;

            if (this.idown) {
                this.spriteY = 200;
            } else {
                this.spriteY = 150;
            }

            this.draw();
        }
    });
    
    pub.AngleButton = function () { };
    pub.AngleButton.initButton = function (_gameContext, _posX, _posY, _text, _onAngleChanged) {
        this.gameContext = _gameContext;

        this.posX = _posX;
        this.posY = _posY;
        this.itext = _text;
        this.width = 30;
        this.height = 30;
        this.held = false;
        this.onAngleChanged = _onAngleChanged;

        this.lastAngle = 0;

        this.base = RSTools.createObject(pub.Drawable);
        this.knob = RSTools.createObject(pub.Drawable);

        this.base.initDrawable(this.gameContext, this.posX, this.posY, 30, 220, this.width, this.width);
        this.knob.initDrawable(this.gameContext, this.posX, this.posY, 30+this.width, 220, this.width, this.width);

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.gameContext, this.posX + 15, this.posY - 5, true, _text, 10, "White");

        this.gameContext.onMouseDown.push(this);
        this.gameContext.toUpdate.push(this);
    };
    pub.AngleButton.update = function () {
        var rot;

        if (this.held) {
            rot =  RSTools.vectorToAngle(this.knob.centerX, this.knob.centerY, pub.mouseX, pub.mouseY) - 90;
            
            if (this.steps) {
                if (rot < 0) {
                    rot += 360;
                }

                if (rot < 45) {
                    rot = 0;
                } else if (rot < 135) {
                    rot = 90;
                } else if (rot < 225) {
                    rot = 180;
                } else {
                    rot = 270;
                }
            }

            this.knob.rotation = rot;
        }
    };
    pub.AngleButton.onMouseDown = function (_button) {
        var that = this;

        if (!this.held && _button===0) {
            this.held = true;
            this.lastAngle = this.knob.rotation;

            pub.sound.mouseDown.request();

            this.gameContext.onMouseDownAction.push(function (but) {
                if (that.held) {
                    that.onMouseDown(but);
                }
                return true;
            });
            this.gameContext.onMouseUpAction.push(function () {
                that.held = false;
                if (that.onAngleChanged) {
                    that.onAngleChanged(that.knob.rotation);
                }

                pub.sound.mouseUp.request();
                return true;
            });
        } else if (this.held && _button === 2) {
            this.held = false;
            this.knob.rotation = this.lastAngle;

            pub.sound.mouseUp.request();
        }
    };
    Object.defineProperty(pub.AngleButton, "visible", {
        set: function (value) {
            if (value) {
                this.text.text = this.itext;
                this.base.alpha = 1;
                this.knob.alpha = 1;
            } else {
                this.text.text = "";
                this.base.alpha = 0;
                this.knob.alpha = 0;
            }
        }
    })

    pub.SliderButton = function () { };
    pub.SliderButton.initButton = function (_gameContext,_posX, _posY,_value, _text, _onValueChanged) {
        this.gameContext = _gameContext;

        this.posX = _posX;
        this.posY = _posY;
        this.width = 100;
        this.height = 20;
        this.held = false;
        this.itext = _text;

        this.base = RSTools.createObject(pub.Drawable);
        this.knob = RSTools.createObject(pub.Drawable);

        this.base.initDrawable(this.gameContext, this.posX, this.posY, 60, 250, this.width, this.height);
        this.knob.initDrawable(this.gameContext, this.posX, this.posY, 60 + this.width, 250, this.width, this.height);
        
        this.ivalue=_value;
        this.value=_value;
        this.onValueChanged = _onValueChanged;

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.gameContext,this.posX -25, this.posY +10, true, _text, 12, "Black",2);

        this.gameContext.onMouseDown.push(this);
        this.gameContext.toUpdate.push(this);
    }    
    pub.SliderButton.update = function () {
        var x;

        if (this.held) {
            this.value = (pub.mouseX - this.posX -10) * 100 / 80;
        }
    };
    pub.SliderButton.onMouseDown = function (_button) {
        var that = this;

        if (!this.held && _button === 0) {
            this.held = true;
            this.lastAngle = this.knob.rotation;

            this.gameContext.onMouseDownAction.push(function (but) {
                if (that.held) {
                    that.onMouseDown(but);
                }
                return true;
            });
            this.gameContext.onMouseUpAction.push(function () {
                that.held = false;
                return true;
            });
        } else if (this.held && _button === 2) {
            this.held = false;
            this.knob.rotation = this.lastAngle;
        }
    };
    Object.defineProperty(pub.SliderButton,"value",{
        get:function(){
            return this.ivalue;
        },
        set:function(_value){
            this.ivalue = _value;
            if (this.ivalue > 100) {
                this.ivalue = 100;
            } else if (this.ivalue < 0) {
                this.ivalue = 0;
            }
            
            this.knob.posX = this.posX  + this.ivalue * 80 / 100;

            if (this.onValueChanged) {
                this.onValueChanged(this.ivalue);
            }
        }
    });
    Object.defineProperty(pub.SliderButton, "visible", {
        set: function (value) {
            if (value) {
                this.text.text = this.itext;
                this.base.alpha = 1;
                this.knob.alpha = 1;
            } else {
                this.text.text = "";
                this.base.alpha = 0;
                this.knob.alpha = 0;
            }
        }
    })

    pub.spriteXArrowLeft = 25;
    pub.spriteXArrowRight = 0;

    return pub;
}(IDIDGAME_Respawn || {}, undefined));