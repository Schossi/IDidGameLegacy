/// <reference path="Effects.js" />
/// <reference path="GameContext.js" />
/// <reference path="Sound.js" />
/// <reference path="UI.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../Main.js" />
/// <reference path="../RSTools.js" />
/// <reference path="Balls.js" />
/// <reference path="Prototypes.js" />


var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";

    pub.activeButton = undefined;

    pub.TextButton = function () { };
    pub.TextButton.initButton = function (_gameContext, _posX, _posY, _width, _height, _text, _action, _zIndex) {
        this.gameContext = _gameContext;
        this.zIndex = _zIndex;

        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;

        this.background = RSTools.createObject(pub.DrawableRect);
        this.text = RSTools.createObject(pub.DrawableText);

        this.background.initRect(_gameContext, _posX, _posY, _width, _height, "Brown", _zIndex);
        this.text.initText(_gameContext, _posX + _width / 2, _posY + _height / 2, true, _text, _height - 10, "White", _zIndex + 1);

        this.action = _action;
        this.idown = false;
        this.ivisible = true;

        this.uiElement = false;
        if (this.zIndex >= 10000) {
            this.uiElement = true;
        }

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
                this.background.fillStyle = "Brown";
                this.text.fillStyle = "White";
            }

        }
    });
    Object.defineProperty(pub.TextButton, "visible", {
        get: function () {
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

    pub.BuildButton = RSTools.createObject(pub.TextButton);
    pub.BuildButton.onMouseUp = function () {

    };
    pub.BuildButton.onMouseDown = function () {
        if (this.ivisible === false) {
            return;
        }

        if (this.down) {
            pub.MainContext.sideMenu.buildButtonPressed(false);
        } else {
            pub.MainContext.sideMenu.buildButtonPressed(this);
        }
        this.down = true;
        pub.sound.mouseDown.request();
    };

    pub.BuildOverlay = function () { };
    pub.BuildOverlay.initOverlay=function(_gameContext) {
        var that = this;

        this.gameContext = _gameContext;
        this.map=this.gameContext.TileMap;
        this.active= false;

        this.main = RSTools.createObject(pub.DrawableRect);
        this.main.initRect(this.gameContext, 0, 0, this.gameContext.TileMap.tileSize+1, this.gameContext.TileMap.tileSize+1, "Gray", 500);
        this.main.alpha = 0;

        this.addTiles = [];

        this.entry = RSTools.createObject(pub.DrawableRect);
        this.entry.initRect(this.gameContext, 0, 0, this.gameContext.TileMap.tileSize, this.gameContext.TileMap.tileSize, "Silver", 500);
        this.entry.alpha = 0;

        this.entryX = 0;
        this.entryY = 0;

        this.classToBuild = undefined;
        this.tag=undefined;

        this.isBuilding=false;

        this.x = 0;
        this.y = 0;

        this.down = false;

        this.gameContext.onMouseUpAction.push(function (e) {
            that.mouseUpAction(e);
        });
        this.gameContext.onMouseDownAction.push(function (e) {
            that.mouseDownAction(e);
        });
        this.gameContext.toUpdate.push(this);
    };
    pub.BuildOverlay.show = function () {
        var i, j, addTile;

        var size,tilesize;

        this.active = true;

        tilesize=this.gameContext.TileMap.tileSize;
        this.classToBuild = this.gameContext.sideMenu.pressedButton.class;
        this.tag=this.gameContext.sideMenu.pressedButton.tag;
        this.isBuilding=pub.Building.isPrototypeOf(this.classToBuild);

        if (this.isBuilding) {

            size = this.classToBuild.getSize();

            this.entryX = size.entryX * tilesize;
            this.entryY = size.entryY * tilesize;

            this.addTiles = [];
            for (i = 0; i < size.width; i++) {
                for (j = 0; j < size.height; j++) {
                    if (i > 0 || j > 0) {
                        addTile = RSTools.createObject(pub.DrawableRect);
                        addTile.initRect(this.gameContext, 0, 0, this.gameContext.TileMap.tileSize+1, this.gameContext.TileMap.tileSize+1, "Silver", 500);
                        addTile.offX = i;
                        addTile.offY = j;
                        addTile.aplha = 0;
                        this.addTiles.push(addTile);
                    }
                }
            }

        } else {
            this.addTiles = [];

            this.main.width = tilesize;
            this.main.height = tilesize;
        }
    };
    pub.BuildOverlay.hide = function () {
        this.active = false;
    };
    pub.BuildOverlay.update = function () {
        var i, tile,
            terrainTile,
            struc,
            newClass;

        this.buildPossible = true;

        var tilesize=this.gameContext.TileMap.tileSize;

        if (this.active && pub.absMouseX < 600) {

            this.main.alpha = 0.8;
            if (this.isBuilding) {
                this.entry.alpha = 0.8;
            } else {
                this.entry.alpha = 0;
            }

            this.x = Math.floor(pub.mouseX / tilesize);
            this.y = Math.floor(pub.mouseY / tilesize);

            this.main.posX = this.x * tilesize;
            this.main.posY = this.y * tilesize;

            terrainTile = this.map.getTile(this.x, this.y)
            if (terrainTile=false || terrainTile.occupied || !terrainTile.revealed) {
                this.buildPossible = false;
                this.main.fillStyle = "Red";
            } else {
                this.main.fillStyle = "Gray";
            }

            for (i = 0; i < this.addTiles.length; i++) {
                tile = this.addTiles[i];

                tile.posX = this.main.posX + tile.offX * tilesize;
                tile.posY = this.main.posY + tile.offY * tilesize;
                
                tile.alpha = 0.8;

                terrainTile=this.map.getTile(this.x + tile.offX,this.y + tile.offY);
                if (terrainTile=false || terrainTile.occupied || !terrainTile.revealed) {
                    this.buildPossible = false;
                    tile.fillStyle = "Red";
                } else {
                    tile.fillStyle = "Gray";
                }
            }

            if (this.isBuilding) {
                this.entry.posX = this.main.posX + this.entryX;
                this.entry.posY = this.main.posY + this.entryY;

                terrainTile=this.map.getTile(this.x + this.entryX/tilesize,this.y + this.entryY/tilesize);
                if (terrainTile = false || terrainTile.occupied || !terrainTile.revealed) {
                    this.buildPossible = false;
                    this.entry.fillStyle = "Red";
                } else {
                    this.entry.fillStyle = "Silver";
                }
            }


            if (this.buildPossible && this.down && pub.Street == this.classToBuild) {
                struc = this.map.structures[this.x][this.y];
                if(struc && struc.type===pub.StructureType.Street){

                }else{
                    newClass = RSTools.createObject(this.classToBuild);
                    newClass.init(this.gameContext, this.x, this.y, this.tag);
                }
            }


        } else {
            this.main.alpha = 0;
            this.entry.alpha = 0;
                        
            for (i = 0; i < this.addTiles.length; i++) {                
                this.addTiles[i].alpha = 0;
            }
        }
    };
    pub.BuildOverlay.mouseDownAction = function (_button) {
        if (_button === RSTools.MouseButtons.Left && pub.absMouseX < 600) {
            this.down = true;
        }
    }
    pub.BuildOverlay.mouseUpAction = function (_button) {
        var newClass;
        
        if (_button === RSTools.MouseButtons.Left) {
            this.down = false;

            if (this.buildPossible && this.active && pub.absMouseX < 600) {
                if (pub.Street == this.classToBuild) {
                    //newClass = RSTools.createObject(this.classToBuild);
                    //newClass.init(this.gameContext, this.x, this.y, this.tag);
                } else {
                    newClass = RSTools.createObject(pub.BuildContract);
                    newClass.init(this.gameContext, this.classToBuild, this.x, this.y, this.tag);
                }
            }
        }
    };


    pub.Button = RSTools.createObject(pub.Drawable);
    pub.Button.initButton = function (_gameContext, _posX, _posY, _onClick) {
        this.initDrawable(_gameContext, _posX, _posY, 500, 170, 200, 30, 1);

        this.idown = false;
        this.onClick = _onClick;

        this.gameContext.onMouseDown.push(this);
        this.gameContext.onMouseUp.push(this);
        this.gameContext.onMouseEnter.push(this);

    };
    pub.Button.onMouseDown = function () {
        this.down = true;
        //pub.sound.mouseDown.request();
    };
    pub.Button.onMouseUp = function () {
        if (this.down) {
            this.onClick();
            this.down = false;
            //pub.sound.mouseUp.request();
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
                this.spriteY = 170;
            }
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
        this.knob.initDrawable(this.gameContext, this.posX, this.posY, 30 + this.width, 220, this.width, this.width);

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.gameContext, this.posX + 15, this.posY - 5, true, _text, 10, "White");

        this.gameContext.onMouseDown.push(this);
        this.gameContext.toUpdate.push(this);
    };
    pub.AngleButton.update = function () {
        var rot;

        if (this.held) {
            rot = RSTools.vectorToAngle(this.knob.centerX, this.knob.centerY, pub.mouseX, pub.mouseY) - 90;

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

        if (!this.held && _button === 0) {
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
    pub.SliderButton.initButton = function (_gameContext, _posX, _posY, _value, _text, _onValueChanged) {
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

        this.ivalue = _value;
        this.value = _value;
        this.onValueChanged = _onValueChanged;

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this.gameContext, this.posX - 25, this.posY + 10, true, _text, 12, "Black", 2);

        this.gameContext.onMouseDown.push(this);
        this.gameContext.toUpdate.push(this);
    }
    pub.SliderButton.update = function () {
        var x;

        if (this.held) {
            this.value = (pub.mouseX - this.posX - 10) * 100 / 80;
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
    Object.defineProperty(pub.SliderButton, "value", {
        get: function () {
            return this.ivalue;
        },
        set: function (_value) {
            this.ivalue = _value;
            if (this.ivalue > 100) {
                this.ivalue = 100;
            } else if (this.ivalue < 0) {
                this.ivalue = 0;
            }

            this.knob.posX = this.posX + this.ivalue * 80 / 100;

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

    pub.RoundProgressbar = function () { };
    pub.RoundProgressbar.initBar = function (_gameContext, _posX, _posY, _maxValue) {
        this.gameContext = _gameContext;
        this.posX = _posX;
        this.posY = _posY;

        this.over = RSTools.createObject(pub.Drawable);
        this.over.initDrawable(this.gameContext, _posX, _posY, 500, 60, 110, 110, -5);
        this.over.alpha = 0.5;

        this.gameContext.toDraw.push(this);

        this.maxValue = _maxValue;
        this.value = 0;

        this.ivisible = true;
    };
    pub.RoundProgressbar.update = function () {

    };
    pub.RoundProgressbar.draw = function () {
        var context = this.gameContext.drawingContext;

        if (this.visible === false) {
            return;
        }

        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(this.posX + 55, this.posY + 55, 50, 0, Math.PI * 2 * (this.value / this.maxValue), false);
        context.lineTo(this.posX + 55, this.posY + 55);
        context.fillStyle = 'red';
        context.fill();
        context.globalAlpha = 1;

    };
    Object.defineProperty(pub.RoundProgressbar, "visible", {
        get: function () {
            return this.ivisible;
        },
        set: function (_value) {
            this.ivisible = _value;
            this.over.visible = _value;
        }
    });

    pub.MenuItem = function () { };
    pub.MenuItem.initItem = function (_gameContext, _posX, _posY, _level) {
        var i, ball;

        this.posX = _posX;
        this.posY = _posY;
        this.gameContext = _gameContext;

        this.level = _level;

        this.score = pub.getStoredValue(pub.LevelPrefix + this.level);
        this.lastScore = pub.getStoredValue(pub.LevelPrefix + (this.level - 1));

        this.locked = this.lastScore === null && this.level > 1;

        this.thickness = 10;
        this.width = 100;
        this.height = this.width;

        if (this.score) {
            this.timeText = RSTools.createObject(pub.DrawableText);
            this.timeText.initText(this.gameContext, _posX + 15, _posY + this.width - 20, false, RSTools.formatDuration(this.score), 12, "White");
        }

        if (this.locked) {
            this.lockRect = RSTools.createObject(pub.DrawableRect);
            this.lockRect.initRect(_gameContext, this.posX, this.posY, this.width, this.height, "Red", 10);
            this.lockRect.alpha = 0.5;
        }

        this.levelText = RSTools.createObject(pub.DrawableText);
        this.levelText.initText(this.gameContext, this.posX + this.width / 2, this.posY + this.width / 2, true, this.level, 60, "Red");
        this.levelText.strokeStyle = "White";
        this.levelText.alpha = 0.5;

        this.back = RSTools.createObject(pub.DrawableRect);
        this.back.initRect(this.gameContext, this.posX, this.posY, this.width, this.height, "White", -50);
        this.back.alpha = 0;


        this.walls = [];

        this.left = RSTools.createObject(pub.DrawableBoxRect);
        this.left.initRect(_gameContext, _posX, _posY, this.thickness, this.width, "Red", 0);
        this.walls.push(this.left);

        this.top = RSTools.createObject(pub.DrawableBoxRect);
        this.top.initRect(_gameContext, _posX, _posY, this.width, this.thickness, "Red", 0);
        this.walls.push(this.top);

        this.right = RSTools.createObject(pub.DrawableBoxRect);
        this.right.initRect(_gameContext, _posX + this.width - this.thickness, _posY, this.thickness, this.width, "Red", 0);
        this.walls.push(this.right);

        this.bottom = RSTools.createObject(pub.DrawableBoxRect);
        this.bottom.initRect(_gameContext, _posX, _posY + this.width - this.thickness, this.width, this.thickness, "Red", 0);
        this.walls.push(this.bottom);

        for (i = 0; i < this.walls.length; i++) {
            this.walls[i].bodyDevType = Box2D.Dynamics.b2Body.b2_kinematicBody;
            this.walls[i].initBoxRect();
        }

        this.balls = [];
        for (i = 0; i < this.level; i++) {
            ball = RSTools.createObject(pub.Ball);
            ball.initBall(this.gameContext, this.posX + this.width / 2, this.posY + this.width / 2, 5, 0, 0);
            ball.body.SetActive(false);
            this.balls.push(ball);
        }

        this.counter = 0;
        this.direction = 1;

        if (!this.locked) {
            this.gameContext.toUpdate.push(this);
            this.gameContext.onMouseEnter.push(this);
            this.gameContext.onMouseLeave.push(this);

            this.gameContext.onMouseDown.push(this);
            this.gameContext.onMouseUp.push(this);
        }
    };
    pub.MenuItem.onMouseDown = function () {
        this.back.alpha = 0.8;
    }
    pub.MenuItem.onMouseUp = function () {
        var that = this;

        pub.DoFadeUnfade(this.gameContext, function () {
            pub.MainContext.init(that.gameContext.drawingContext, that.level);
            pub.currentGameContext = pub.MainContext;
        });

    };
    pub.MenuItem.onMouseEnter = function () {
        var i, pos;

        this.back.alpha = 0.3;

        for (i = 0; i < this.balls.length; i++) {
            pos = this.balls[i].body.GetWorldCenter();
            this.balls[i].body.SetActive(true);
            this.balls[i].body.ApplyImpulse({ x: (Math.random() * 2 - 1) / 20, y: (Math.random() * -2) / 20 }, pos);
        }
    };
    pub.MenuItem.onMouseLeave = function () {
        var i;

        this.back.alpha = 0;

        for (i = 0; i < this.balls.length; i++) {
            this.balls[i].body.SetActive(false);
        }
    };
    pub.MenuItem.update = function () {
        var i, pos;
        /*
        for (i = 0; i < this.walls.length; i++) {
            //this.walls[i].posY = this.walls[i].iposY + this.counter;
            //this.walls[i].body.SetPosition({ x: this.walls[i].centerX/pub.boxscale, y: (this.walls[i].centerY + this.direction)/pub.boxscale });
        }

        this.counter += this.direction;

        if (this.counter === 50 || this.counter === 0) {
            this.direction *= -1;

            for (i = 0; i < this.balls.length; i++) {
                if (this.counter === 0) {
                    this.balls[i].body.SetActive(false);
                } else {
                    pos = this.balls[i].body.GetWorldCenter();
                    this.balls[i].body.SetActive(true);
                    this.balls[i].body.ApplyImpulse({ x: (Math.random() * 2 - 1) / 20, y: (Math.random() * -2) / 10 }, pos);
                }
            }
        }
        
        this.pos = { x: this.centerX / pub.boxscale, y: this.centerY / pub.boxscale };*/
    };

    pub.ResourceIcon = RSTools.createObject(pub.Drawable);
    pub.ResourceIcon.initIcon = function (_gameContext,_posX, _posY, _type) {
        var x=0, y=0;

        switch (_type) {
            case pub.ResourceType.Wood:
                x = 0;
                y = 0;
                break;
            case pub.ResourceType.Planks:
                x = 0;
                y = 1;
                break;
            case pub.ResourceType.Gold:
                x = 1;
                y = 0;
                break;
            case pub.ResourceType.Stone:
                x = 1;
                y = 1;
                break;
            case pub.ResourceType.Fish:
                x = 2;
                y = 0;
                break;
            case pub.ResourceType.Bread:
                x = 2;
                y = 1;
                break;
            case pub.ResourceType.Pig:
                x = 2;
                y = 2;
                break;
            case pub.ResourceType.Wheat:
                x = 3;
                y = 0;
                break;
            case pub.ResourceType.Flour:
                x = 3;
                y = 1;
                break;
            case pub.ResourceType.Water:
                x = 4;
                y = 0;
                break;
            case pub.ResourceType.Milk:
                x = 4;
                y = 1;
                break;
        };

        this.initDrawable(_gameContext, _posX, _posY, x * 15, y * 15, 15, 15, 10001);

    };

    pub.SideMenu = function () { };
    pub.SideMenu.initMenu = function (_gameContext) {
        var button,
            categoryButton, currentCatButton,
            that = this,
            i, j;

        this.gameContext = _gameContext;

        this.posX = 600;
        this.posY = 0;

        this.mapPos = this.posY;
        this.buildingPos = this.posY + 150;
        this.contextPos = this.posY + 400;

        this.MapBack = RSTools.createObject(pub.DrawableRect);
        this.MapBack.initRect(this.gameContext, this.posX, this.posY, 200, 150, "Black", 10000);
        this.MapBack.strokeStyle = "White";

        this.buildingBack = RSTools.createObject(pub.DrawableRect);
        this.buildingBack.initRect(this.gameContext, this.posX, this.buildingPos, 200, 300, "Black", 10000);
        this.buildingBack.strokeStyle = "White";

        this.contextBack = RSTools.createObject(pub.DrawableRect);
        this.contextBack.initRect(this.gameContext, this.posX, this.contextPos, 200, 200, "Black", 10000);
        this.contextBack.strokeStyle = "White";

        this.mini = RSTools.createObject(pub.MiniMap);
        this.mini.initMap(this.posX, this.mapPos, 200, 150, this.gameContext);

        this.contextName = RSTools.createObject(pub.DrawableText);
        this.contextName.initText(this.gameContext, this.posX + 100, this.contextPos + 20, true, "", 16, "White", 10001);

        this.contextText = [];

        this.currentContextObject = undefined;


        categoryButton = RSTools.createObject(pub.TextButton);
        categoryButton.initCatButton = function () {
            this.sideMenu = this;
            this.buildButtons = [];
        };
        categoryButton.onMouseUp = function () {

        };
        categoryButton.onMouseDown = function () {
            if (this.down) {
                pub.MainContext.sideMenu.categoryButtonPressed(false);
            } else {
                pub.MainContext.sideMenu.categoryButtonPressed(this);
            }
            this.down = !this.down;
            pub.sound.mouseDown.request();
        };

        this.buildButtons = [];
        this.catButtons = [];
        
        //General

        currentCatButton = RSTools.createObject(categoryButton);
        currentCatButton.initButton(this.gameContext, this.posX + 10, this.buildingPos+5, 60, 20, "GEN", false, 10001);
        currentCatButton.initCatButton();
        this.catButtons.push(currentCatButton);

        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 30, 180, 30, "Street",false, 10001);
        button.class = pub.Street;
        currentCatButton.buildButtons.push(button);

        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 65, 180, 30, "Base", false, 10001);
        button.class = pub.Base;
        currentCatButton.buildButtons.push(button);
        
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 100, 180, 30, "House", false, 10001);
        button.class = pub.House;
        currentCatButton.buildButtons.push(button);
        
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 135, 180, 30, "Watchtower", false, 10001);
        button.class = pub.Watchtower;
        currentCatButton.buildButtons.push(button);

        //Resources

        currentCatButton = RSTools.createObject(categoryButton);
        currentCatButton.initButton(this.gameContext, this.posX + 70, this.buildingPos+5, 60, 20, "RES", false, 10001);
        currentCatButton.initCatButton();
        this.catButtons.push(currentCatButton);


        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 30, 180, 30, "Woodman", false, 10001);
        button.class = pub.Woodman;
        currentCatButton.buildButtons.push(button);

        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 65, 180, 30, "Sawmill", false, 10001);
        button.class = pub.Sawmill;
        currentCatButton.buildButtons.push(button);

        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 100, 180, 30, "Mason", false, 10001);
        button.class = pub.Mason;
        currentCatButton.buildButtons.push(button);

        //Food

        currentCatButton = RSTools.createObject(categoryButton);
        currentCatButton.initButton(this.gameContext, this.posX + 130, this.buildingPos+5, 60, 20, "FOO", false, 10001);
        currentCatButton.initCatButton();
        this.catButtons.push(currentCatButton);


        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 30, 180, 30, "Well", false, 10001);
        button.class = pub.Well;
        currentCatButton.buildButtons.push(button);

        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 65, 180, 30, "Milk Farm", false, 10001);
        button.class = pub.Farm;
        currentCatButton.buildButtons.push(button);
        button.tag = pub.StructureType.MilkFarm;
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 100, 180, 30, "Pig Farm", false, 10001);
        button.class = pub.Farm;
        currentCatButton.buildButtons.push(button);
        button.tag = pub.StructureType.PigFarm;
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 135, 180, 30, "Wheat Farm", false, 10001);
        button.class = pub.Farm;
        currentCatButton.buildButtons.push(button);
        button.tag = pub.StructureType.WheatFarm;
        
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 170, 180, 30, "Mill", false, 10001);
        button.class = pub.Mill;
        currentCatButton.buildButtons.push(button);
        
        button = RSTools.createObject(pub.BuildButton);
        button.initButton(this.gameContext, this.posX + 10, this.buildingPos + 205, 180, 30, "Bakery", false, 10001);
        button.class = pub.Bakery;
        currentCatButton.buildButtons.push(button);


        for ( i = 0; i < this.catButtons.length; i++) {
            currentCatButton = this.catButtons[i];
            for (j = 0; j < currentCatButton.buildButtons.length; j++) {
                currentCatButton.buildButtons[j].visible = false;
            }
        }


        this.pressedButton = undefined;
        this.pressedCategoryButton = false;

        this.overlay = RSTools.createObject(pub.BuildOverlay);
        this.overlay.initOverlay(this.gameContext);

        this.gameContext.toUpdate.push(this);
        this.gameContext.onMouseUpAction.push(function (e) {
            that.mouseUpAction(e);
        });
    };
    pub.SideMenu.update = function () {
        var i;

        if (this.currentContextObject !== this.gameContext.selectedObject) {
            this.initContextText(this.gameContext.selectedObject);
        } else if (this.currentContextObject) {
            for ( i = 0; i < this.contextText.length; i++) {
                this.contextText[i].text = this.currentContextObject.resources[this.contextText[i].resType];
            }
        }
    };
    pub.SideMenu.initContextText = function (_newObject) {
        var i,
            resType,
            icon,
            text;

        this.currentContextObject = _newObject;

        for (i = 0; i < this.contextText.length; i++) {
            this.contextText[i].remove();
        }

        this.contextText = [];

        if (_newObject) {
            this.contextName.text = _newObject.description + "-" + _newObject.num;

            for (i = 0; i < _newObject.relevantResources.length; i++) {
                resType = _newObject.relevantResources[i];
                text = RSTools.createObject(pub.DrawableText);
                text.initText(this.gameContext, this.posX + 50, this.contextPos + 65 + 20 * i, true,  _newObject.resources[resType], 16, "White", 10001);
                text.resType =resType;
                this.contextText.push(text);

                icon = RSTools.createObject(pub.ResourceIcon);
                icon.initIcon(this.gameContext, this.posX + 20, this.contextPos + 55 + 20 * i, resType);
                this.contextText.push(icon);
            }

        } else {
            this.contextName.text = "";
        }
    };
    pub.SideMenu.buildButtonPressed = function (_button) {
        if (this.pressedButton) {
            this.pressedButton.down = false;
        }
        this.pressedButton = _button;

        if (this.pressedButton) {
            this.overlay.show();
        } else {
            this.overlay.hide();
        }
    };
    pub.SideMenu.categoryButtonPressed = function (_button) {
        var i;

        if (this.pressedCategoryButton) {
            this.pressedCategoryButton.down = false;

            for (i = 0; i < this.pressedCategoryButton.buildButtons.length; i++) {
                this.pressedCategoryButton.buildButtons[i].visible = false;
            }
        }

        this.pressedCategoryButton = _button;

        if (this.pressedCategoryButton) {
            for (i = 0; i < this.pressedCategoryButton.buildButtons.length; i++) {
                this.pressedCategoryButton.buildButtons[i].visible = true;
            }
        }
    };
    pub.SideMenu.mouseUpAction = function (_button) {
        var men = pub.MainContext.sideMenu;

        if (men.pressedButton && _button === RSTools.MouseButtons.Right) {
            men.pressedButton.down = false;
            men.pressedButton = undefined;

            this.overlay.hide();
        }
    };

    pub.MiniMap = function () { };
    pub.MiniMap.initMap = function (_posX,_posY,_width,_height,_gameContext) {

        this.posX = _posX;
        this.posY = _posY;

        this.width = _width;
        this.height = _height;

        this.gameContext = _gameContext;
        this.gameContext.MiniMap = this;

        this.ownWidth = 800;
        this.ownHeight = 600;

        this.ownCanvas = document.createElement('canvas');
        this.ownCanvas.width = this.ownWidth;
        this.ownCanvas.height = this.ownHeight;
        this.ownContext = this.ownCanvas.getContext("2d");

        this.gameContext.addToDraw(this, 10001);

    };
    pub.MiniMap.drawOn = function (_x, _y, _width, _height, _fillStyle) {
        this.ownContext.fillStyle = _fillStyle;
        this.ownContext.fillRect(_x + this.ownWidth/2, _y + this.ownHeight/2, _width, _height);
    };
    pub.MiniMap.draw = function () {
        var context = this.gameContext.drawingContext,
            x, y, cent = this.gameContext.centerPos,
            tilesize=this.gameContext.TileMap.tileSize;

        x = (cent.x / tilesize) + this.ownWidth/2 - this.width / 2;
        y = (cent.y / tilesize) + this.ownHeight/2 - this.height / 2;

        //this.gameContext.drawingContext.drawImage(this.ownCanvas, x, y, this.width , this.height , this.posX, this.posY, this.width, this.height);
        this.gameContext.drawingContext.drawImage(this.ownCanvas, x, y, this.width, this.height, this.posX, this.posY, this.width, this.height);
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));