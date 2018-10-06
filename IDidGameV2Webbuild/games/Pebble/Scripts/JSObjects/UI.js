var IDIDGAMEPEBBLE = (function (pub, undefined) {
    "use strict";
   
    pub.activeButton=undefined;

    pub.TextButton = function () { };
    pub.TextButton.initButton = function (_posX, _posY,_width,_height, _text, _action) {
        this.posX = _posX+600;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;

        this.background = RSTools.createObject(pub.DrawableRect);
        this.text = RSTools.createObject(pub.DrawableText);

        this.background.initRect(_posX, _posY, _width, _height, "Gray", 1);
        this.text.initText(_posX + _width / 2, _posY + 28, true, _text, _height - 10, "White", 2);
        
        this.background.side = true;
        this.text.side = true;

        this.side = true;

        this.action = _action;
        this.idown = false;
        this.ivisible = true;

        pub.onMouseDown.push(this);
        pub.onMouseUp.push(this);
        pub.onMouseEnter.push(this);
    };
    pub.TextButton.onMouseDown = function () {
        this.down = true;
    };
    pub.TextButton.onMouseUp = function () {
        if (this.down) {
            this.action();
            this.down = false;
        }
    };
    pub.TextButton.onMouseEnter = function () {

    };
    pub.TextButton.onMouseLeave = function () {
        if (this.down) {
            this.down = false;
        }
    };
    pub.TextButton.hide = function () {
        this.text.alpha = 0;
        this.background.alpha = 0;
        this.background.draw();
        this.down = false;
    };
    pub.TextButton.show = function () {
        this.text.alpha = 1;
        this.background.alpha = 1;
        this.background.draw();
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

            this.background.draw();
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



    pub.DnDButton = RSTools.createObject(pub.Drawable);
    pub.DnDButton.initButton = function (_posX, _posY, _tower) {
        this.initDrawable(_posX, _posY, 0, 90, 60, 60, 1);

        this.tower = _tower;
        this.tower.centerX = this.centerX;
        this.tower.centerY = this.centerY;
        this.tower.active = false;

        this.isTower = pub.Tower.isPrototypeOf(this.tower);
        this.isField = pub.Field.isPrototypeOf(this.tower);
        this.isWall = pub.Wall.isPrototypeOf(this.tower);

        this.levelX = 0;
        this.levelY = 0;

        this.alpha = 0.7;

        this.positionValid = false;

        pub.onMouseDown.push(this);
    };
    pub.DnDButton.onMouseDown = function () {
        this.active = !this.active;
    };
    pub.DnDButton.onMouseMove = function () {
        var that = this,
            lastLevelX = -1,
            lastLevelY = -1,
            blockingPath = false;

        return function () {
            var x = pub.mouseX,
                y = pub.mouseY;

            if (x > pub.towerMinX && x < pub.towerMaxX && y > pub.towerMinY && y < pub.towerMaxY) {

                x -= pub.towerMinX;
                y -= pub.towerMinY;

                that.levelX = Math.floor(x / 50);
                that.levelY = Math.floor(y / 50);
                
                x = that.levelX * 50;
                y = that.levelY * 50;

                x += pub.towerMinX;
                y += pub.towerMinY;

                if (pub.Level[that.levelX][that.levelY] && (that.isField || !pub.Field.isPrototypeOf(pub.Level[that.levelX][that.levelY]))) {
                    that.positionValid = false;
                }
                else if (that.isField) {
                    that.positionValid = true;
                }
                else{
                    if (lastLevelX !== that.levelX || lastLevelY !== that.levelY) {
                        if (pub.enemies.length > 0 && pub.pathfinding.isOnRoute(that.levelX, that.levelY)) {
                            blockingPath = true;
                        }
                        else {
                            pub.Level[that.levelX][that.levelY] = true;
                            pub.pathfinding.update();
                            pub.pathfinding.calculate();
                            pub.Level[that.levelX][that.levelY] = undefined;

                            if (!pub.pathfinding.pathPossible) {
                                blockingPath = !pub.pathfinding.pathPossible;
                            } else {
                                blockingPath = false;
                            }
                        }

                        lastLevelX = that.levelX;
                        lastLevelY = that.levelY;
                    }
                    
                    if (blockingPath) {
                        that.positionValid = false;
                    }
                    else {
                        that.positionValid = true;
                    }
                }
            }
            else {
                that.positionValid = false;                
            }

            if (that.positionValid) {
                that.tower.posX = x;
                that.tower.posY = y;
                
                that.tower.alpha = 0.8;
            }
            else {
                that.tower.alpha = 0.3;

                if(that.tower)
                that.tower.centerX = pub.mouseX;
                that.tower.centerY = pub.mouseY;
            }
        };
    };
    pub.DnDButton.onMouseClick = function () {
        var that = this;
        return function () {
            var t;
            
            if (that.positionValid) {

                t = RSTools.createObject(that.tower);

                if (that.isTower) {
                    t.initialized = false;
                    t.initTower(that.tower.base.posX, that.tower.base.posY, RSTools.createObject(that.tower.head), RSTools.createObject(that.tower.shaft), RSTools.createObject(that.tower.base));
                    t.active = true;
                    pub.onMouseUp.push(t);
                } else if (that.isField) {
                    t.initField(that.tower.posX, that.tower.posY);
                } else if (that.isWall) {
                    t.initWall(that.tower.posX, that.tower.posY);
                }

                if (pub.Level[that.levelX][that.levelY]) {
                    pub.Level[that.levelX][that.levelY].remove();
                }

                pub.Level[that.levelX][that.levelY] = t;
                t.levelX = that.levelX;
                t.levelY = that.levelY;

                pub.pathfinding.update();
                pub.pathfinding.calculate();

                pub.money -= t.cost;

                pub.drawMoney();
            }
        };
    };
    Object.defineProperty(pub.DnDButton, "active", {
        get: function () {
            return this.iactive;
        },
        set: function (value) {
            var i;

            this.iactive = value;

            if (this.iactive) {
                this.spriteX = 60;
            } else {
                this.spriteX = 0;
            }

            if (this.iactive) {
                if (pub.activeButton) {
                    pub.activeButton.active = false;
                }

                pub.activeButton = this;
            }else if (pub.activeButton === this) {
                pub.activeButton = undefined;
            }

            if (!this.iactive) {
                pub.onMouseMoveAction.splice(this.mouseMovePos, 1);
                pub.onMouseDownAction.splice(this.mouseClickPos, 1);

                if (this.tower) {
                    this.tower.centerX = this.centerX;
                    this.tower.centerY = this.centerY;
                    this.tower.mouseOver = false;
                    this.tower.rangeAlpha = 0;
                }

                pub.contextForeground.clearRect(25, 100, 550, 400);

                pub.pathfinding.update();
                pub.pathfinding.calculate();
            }
            else {
                pub.onMouseMoveAction.push(this.onMouseMove());
                this.mouseMovePos = pub.onMouseMoveAction.length - 1;
                pub.onMouseDownAction.push(this.onMouseClick());
                this.mouseClickPos = pub.onMouseDownAction.length - 1;
                
                pub.contextForeground.drawImage(pub.spriteGrid, 25, 100);
            }

            this.draw();
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
    };
    pub.Button.onMouseUp = function () {
        if (this.down) {
            this.onClick();
            this.down = false;
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
    pub.AngleButton.initButton = function (_posX,_posY,_text,_onAngleChanged) {
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

        this.base.initDrawable(this.posX, this.posY, 0, 250, this.width, this.width);
        this.knob.initDrawable(this.posX, this.posY, this.width, 250, this.width, this.width);

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.posX + 15, this.posY - 2, true, _text, 10, "White");

        pub.onMouseDown.push(this);
        pub.toUpdate.push(this);
    }
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

            pub.onMouseDownAction.push(function (but) {
                if (that.held) {
                    that.onMouseDown(but);
                }
                return true;
            });
            pub.onMouseUpAction.push(function () {
                that.held = false;
                if (that.onAngleChanged) {
                    that.onAngleChanged(that.knob.rotation);
                }
                return true;
            });
        } else if (this.held && _button === 2) {
            this.held = false;
            this.knob.rotation = this.lastAngle;

            
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
    pub.SliderButton.initButton = function (_posX, _posY,_value, _text, _onValueChanged,_layer) {
        this.posX = _posX;
        this.posY = _posY;
        this.width = 100;
        this.height = 20;
        this.held = false;
        this.itext = _text;

        this.base = RSTools.createObject(pub.Drawable);
        this.knob = RSTools.createObject(pub.Drawable);

        this.base.initDrawable(this.posX, this.posY, 60, 250, this.width, this.height,_layer);
        this.knob.initDrawable(this.posX, this.posY,60+ this.width, 250, this.width, this.height,_layer);
        
        this.ivalue=_value;
        this.value=_value;
        this.onValueChanged = _onValueChanged;

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.posX -30, this.posY +14, true, _text, 12, "Black",2);

        pub.onMouseDown.push(this);
        pub.toUpdate.push(this);
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

            pub.onMouseDownAction.push(function (but) {
                if (that.held) {
                    that.onMouseDown(but);
                }
                return true;
            });
            pub.onMouseUpAction.push(function () {
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
}(IDIDGAMEPEBBLE || {}, undefined));