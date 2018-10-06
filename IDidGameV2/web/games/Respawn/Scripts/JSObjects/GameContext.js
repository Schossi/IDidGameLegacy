/// <reference path="../_references.js" />

var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";

    pub.GameContext = function () { };
    pub.GameContext.init = function (_drawingContext) {
        this.toDraw = [];
        this.toCommit = [];
        this.toUpdate = [];
        this.toCall = [];

        this.onMouseDownAction = [];
        this.onMouseUpAction = [];
        this.onMouseMoveAction = [];

        this.onMouseDown = [];
        this.onMouseUp = [];
        this.onMouseEnter = [];
        this.onMouseLeave = [];

        this.onKeyChange = [];

        this.drawingContext = _drawingContext;

        this.changeBit = false;

    };
    pub.GameContext.work = function () {
        var i;

        if (!this.drawOver) {
            this.drawingContext.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        }

        for (i = this.toCall.length - 1; i >= 0 ; i--) {
            if (this.toCall[i]()) {
                this.toCall.splice(i, 1);
            }
        }

        for (i = 0; i < this.toCommit.length; i++) {
            this.toCommit[i].commitPosition(this.changeBit);
        }
        
        this.transform();

        for (i = this.toDraw.length-1; i >= 0; i--) {
            if (this.toDraw[i].draw()) {
                this.toDraw.splice(i, 1);
            }
        }

        this.untransform();

        for (i = 0; i < this.toUpdate.length; i++) {
            this.toUpdate[i].update();
        }

        this.changeBit = !this.changeBit;
    };
    pub.GameContext.transform = function () {

        if (this.offsetX || this.offsetY) {
            this.drawingContext.translate(this.offsetX, this.offsetY);
        }

        if (this.zoom) {
            this.drawingContext.scale(this.zoom, this.zoom);
        }
    }
    pub.GameContext.addToDraw = function (_entry, _zIndex) {
        var index = _zIndex || _entry.zIndex,
            i=0;

        while (this.toDraw[i] && this.toDraw[i].zIndex > index) { i += 1; }

        this.toDraw.splice(i, 0, _entry);
    };
    pub.GameContext.untransform = function () {

        if (this.zoom) {
            this.drawingContext.scale(1 / this.zoom, 1 / this.zoom);
        }

        if (this.offsetX || this.offsetY) {
            this.drawingContext.translate(-this.offsetX, -this.offsetY);
        }

    }
    pub.GameContext.mouseMove = function (e) {
        var i,
            mouseObj,
            xPos = e.pageX - pub.canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - pub.canvas_main.offsetTop-this.offsetY;

        pub.mouseX = e.pageX - pub.canvas_main.offsetLeft-this.offsetX;
        pub.mouseY = e.pageY - pub.canvas_main.offsetTop-this.offsetY;

        for (i = this.onMouseMoveAction.length - 1; i >= 0; i--) {
            if (this.onMouseMoveAction[i]() === true) {
                this.onMouseMoveAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        };

        for (i = 0; i < this.onMouseEnter.length; i++) {
            if (RSTools.intersects(this.onMouseEnter[i], mouseObj)) {
                this.onMouseEnter[i].onMouseEnter();
                this.onMouseLeave.push(this.onMouseEnter[i]);
                break;
            }
        }

        for (i = this.onMouseLeave.length - 1; i >= 0 ; i--) {
            if (!RSTools.intersects(this.onMouseLeave[i], mouseObj)) {
                this.onMouseLeave[i].onMouseLeave();
                this.onMouseLeave.splice(i, 1);
                break;
            }
        }
    };
    pub.GameContext.mouseDown = function (e) {
        var xPos = e.pageX - canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - canvas_main.offsetTop-this.offsetY,
            i,
            mouseObj;

        for (i = this.onMouseDownAction.length - 1; i >= 0; i--) {
            if (this.onMouseDownAction[i](e.button) === true) {
                this.onMouseDownAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        };
        for (i = 0; i < this.onMouseDown.length; i++) {
            if (RSTools.intersects(this.onMouseDown[i], mouseObj)) {
                this.onMouseDown[i].onMouseDown(e.button);
                break;
            }
        }
    };
    pub.GameContext.mouseUp = function (e) {
        var i,
            xPos = e.pageX - canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - canvas_main.offsetTop-this.offsetY,
             mouseObj;

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        }

        if (this.onMouseUpAction) {
            for (i = this.onMouseUpAction.length - 1; i >= 0; i--) {
                if (this.onMouseUpAction[i]() === true) {
                    this.onMouseUpAction.splice(i, 1);
                }
            }
        }

        if (this.onMouseUp) {
            for (i = 0; i < this.onMouseUp.length; i++) {
                if (RSTools.intersects(this.onMouseUp[i], mouseObj)) {
                    this.onMouseUp[i].onMouseUp();
                    break;
                }
            }
        }
    };
    pub.GameContext.key_down = function (e) {
        var key_id = e.keyCode,
            i;

        for (i = 0; i < this.onKeyChange.length; i++) {
            if (this.onKeyChange[i].key === key_id) {
                this.onKeyChange[i].action(true);
            }
        }

        e.preventDefault();
    };
    pub.GameContext.key_up = function (e) {
        var key_id = e.keyCode,
            i;

        for (i = 0; i < this.onKeyChange.length; i++) {
            if (this.onKeyChange[i].key === key_id) {
                this.onKeyChange[i].action(false);
            }
        }

        e.preventDefault();
    };

    pub.MainContext = RSTools.createObject(pub.GameContext);
    pub.MainContext.init = function (_drawingContext) {
        var i, draw;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 400;
        this.offsetY = 500;

        this.borderSize = 20;

        this.enemies = [];
        this.shipBullets = [];
        this.enemyBullets = [];
        this.pickups = [];
        
        this.Ship = RSTools.createObject(pub.Ship);
        if (this.prevShip) {
            this.Ship.gunAssignment = this.prevShip.gunAssignment;
        }
        this.Ship.init(this);

        if (this.prevShip) {
            this.Ship.maxHealth = this.prevShip.maxHealth;
            this.Ship.health = this.Ship.maxHealth;
            this.Ship.maxEnergy = this.prevShip.maxEnergy;
            this.Ship.energy = 0;

            this.Ship.energyGain = this.prevShip.energyGain;
            this.Ship.maxSpeedX = this.prevShip.maxSpeedX;

            this.Ship.mainGun.strength = this.prevShip.mainGun.strength;
            this.Ship.sideGun1.strength = this.prevShip.sideGun1.strength;
            this.Ship.sideGun2.strength = this.prevShip.sideGun2.strength;
            this.Ship.sideGun3.strength = this.prevShip.sideGun3.strength;
            this.Ship.sideGun4.strength = this.prevShip.sideGun4.strength;

            this.Ship.warp = this.prevShip.warp;

            this.prevShip = undefined;
        }

        this.Ground = RSTools.createObject(pub.RepeatingDrawable);
        this.Ground.init(this, -500, -960, 0, 600, 200, 200, 5, 4, -499);

        this.BaseGround = RSTools.createObject(pub.RepeatingDrawable);
        this.BaseGround.init(this, -500, -200, 200, 600, 200, 200, 5, 4, -500,false,false,false,false,true);

        this.LeftWall = RSTools.createObject(pub.RepeatingDrawable);
        this.LeftWall.init(this, -380, -1100, 400, 500, 50, 300, 1, 3, -450);

        this.RightWall = RSTools.createObject(pub.RepeatingDrawable);
        this.RightWall.init(this, 330, -1100, 450, 500, 50, 300, 1, 3, -450);

        this.GateWallLeft = RSTools.createObject(pub.Drawable);
        this.GateWallLeft.initDrawable(this, -380, -200, 500, 760, 200, 40, 10);
        this.GateWallRight = RSTools.createObject(pub.Drawable);
        this.GateWallRight.initDrawable(this, 180, -200, 500, 760, 200, 40, 10);

        this.GateLeft = RSTools.createObject(pub.Drawable);
        this.GateLeft.initDrawable(this, -200, -200, 500, 720, 200, 40, -10);
        this.GateRight = RSTools.createObject(pub.Drawable);
        this.GateRight.initDrawable(this, 0, -200, 500, 720, 200, 40, -10);

        this.Base = RSTools.createObject(pub.Drawable);
        this.Base.initDrawable(this, -150, -50, 0, 50, 300, 100, -250);

        this.BriefingButton = RSTools.createObject(pub.TextButton);
        this.BriefingButton.initButton(this, 160, -30, 200, 20, "Briefing", function () {
            pub.BriefingContext.init(pub.contextOverlay);
        },-240);

        this.UpgradeButton = RSTools.createObject(pub.TextButton);
        this.UpgradeButton.initButton(this, 160, -4, 200, 20, "Upgrade", function () {
            pub.UpgradeContext.init(pub.contextOverlay);
        }, -240);

        this.ConfigButton = RSTools.createObject(pub.TextButton);
        this.ConfigButton.initButton(this, 160, 22, 200, 20, "Configure", function () {
            pub.ConfigureContext.init(pub.contextOverlay);
        }, -240);

        this.Director = RSTools.createObject(pub.EnemyDirector);
        this.Director.init(this);

        if (this.lives===undefined) {
            this.lives = 5;
            this.toCall.push(function () {
                pub.BriefingContext.init(pub.contextOverlay);
                return true;
            });
        } else {
            pub.sound.mChill.play();
        }

        if (!this.resources) {
            this.resources = 1000;
        }

        if (this.score===undefined) {
            this.score = 0;
        }
        this.waveScore = this.score;

        for (i = 0; i < 5-this.lives; i++) {
            draw = RSTools.createObject(pub.Drawable);
            draw.initDrawable(this, -96 - i * 17, -25, 0, 150, 20, 45, -245);
        }
    };
    pub.MainContext.work = function () {
        var i;

        //this.offsetX += (400 - this.Ship.centerX - this.offsetX) / 5;
        this.offsetY += Math.round((500 - this.Ship.centerY - this.offsetY) / 5);
        

        pub.contextOverlay.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);

        pub.GameContext.work.apply(this, []);

        this.collision();

        this.drawUI();
    };
    pub.MainContext.collision = function () {
        var i, j;

        for (i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.enemyBullets[i]) {
                if (this.enemyBullets[i].collideByDraw) {
                    if (RSTools.intersectsSpecial(this.enemyBullets[i].draw, this.Ship)) {
                        this.Ship.hit(this.enemyBullets[i]);
                        if (this.enemyBullets[i]) {
                            this.enemyBullets[i].hit();
                        }
                    }
                } else {
                    if (RSTools.intersectsSpecial(this.enemyBullets[i], this.Ship)) {
                        this.Ship.hit(this.enemyBullets[i]);
                        if (this.enemyBullets[i]) {
                            this.enemyBullets[i].hit();
                        }
                    }
                }
            }
        }
        for (i = this.shipBullets.length - 1; i >= 0; i--) {
            for (j = this.enemies.length - 1; j >= 0; j--) {
                if (this.shipBullets[i] && this.enemies[j]) {
                    if (RSTools.intersectsSpecial(this.shipBullets[i].draw, this.enemies[j])) {
                        this.enemies[j].hit(this.shipBullets[i]);
                        this.shipBullets[i].hit();
                    }
                }
            }
        }

        for (i = this.pickups.length - 1; i >= 0; i--) {
            if (this.pickups[i]) {
                if (RSTools.intersectsSpecial(this.pickups[i], this.Ship)) {
                    if (this.pickups[i]) {
                        this.pickups[i].hit();
                    }
                }
            }
        }
    };
    pub.MainContext.drawUI = function () {
        var i;

        this.drawingContext.fillStyle = "White";
        this.drawingContext.fillRect(0, 0, pub.canvas_main.width, this.borderSize);
        this.drawingContext.fillRect(0, 0, this.borderSize, pub.canvas_main.height);
        this.drawingContext.fillRect(pub.canvas_main.width - this.borderSize, 0, this.borderSize, pub.canvas_main.height);
        this.drawingContext.fillRect(0, pub.canvas_main.height - this.borderSize, pub.canvas_main.width, this.borderSize);

        this.drawingContext.fillStyle = "Black";
        this.drawingContext.fillRect(5, pub.canvas_main.height - 20, 10, (-pub.canvas_main.height + 40) * this.Ship.maxHealth / 300);
        this.drawingContext.fillRect(pub.canvas_main.width - 15, pub.canvas_main.height - 20, 10, (-pub.canvas_main.height + 40) * this.Ship.maxEnergy / 300);
        this.drawingContext.fillStyle = "Red";
        this.drawingContext.fillRect(5, pub.canvas_main.height - 20, 10, (-pub.canvas_main.height + 40) * this.Ship.health / 300);
        this.drawingContext.fillStyle = "Blue";
        this.drawingContext.fillRect(pub.canvas_main.width - 15, pub.canvas_main.height - 20, 10, (-pub.canvas_main.height + 40) * this.Ship.energy / 300);

        this.drawingContext.fillStyle = "Green";
        this.drawingContext.font = "bold 20px Arial";
        this.drawingContext.textBaseline = "top";
        this.drawingContext.fillText("UO-99 : " + this.resources + " J", 0, pub.canvas_main.height - 20);

        if (this.score) {
            this.drawingContext.fillStyle = "Black";
            this.drawingContext.font = "bold 20px Arial";
            this.drawingContext.textBaseline = "top";
            this.drawingContext.fillText("SCORE : " + this.score, pub.canvas_main.width / 2 - 40, 0);
        }
    };

    pub.BriefingContext = RSTools.createObject(pub.GameContext);
    pub.BriefingContext.init = function (_drawingContext) {

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.Back=RSTools.createObject(pub.DrawableRect);
        this.Back.initRect(this, 20, 20, 760, 560, "White", -300);
        this.Back.alpha = 0;
        this.Back.nonOffset = true;

        this.Background = RSTools.createObject(pub.Drawable);
        this.Background.initDrawable(this, 200, 30, 400, 0, 400, 300, -100);
        this.Background.alpha = 0;

        this.wasd = RSTools.createObject(pub.Drawable);
        this.wasd.initDrawable(this, 50, 350, 1200, 0, 300, 220, -80);
        this.wasd.alpha = 0;

        this.num = RSTools.createObject(pub.Drawable);
        this.num.initDrawable(this, 450, 350, 1200, 220, 300, 220, -70);
        this.num.alpha = 0;

        this.Button_Exit = RSTools.createObject(pub.TextButton);
        this.Button_Exit.initButton(this, 550, 280, 30, 30, "X", function () {
            pub.BriefingContext.toCall.push(function () {
                var counter = 100;

                pub.BriefingContext.Button_Exit.hide();

                return function () {
                    counter -= 10;
                    pub.BriefingContext.Back.alpha = counter / 200;
                    pub.BriefingContext.Background.alpha = counter/100;
                    pub.BriefingContext.wasd.alpha = counter / 100;
                    pub.BriefingContext.num.alpha = counter / 100;
                    pub.BriefingContext.offsetY = counter * 3 - 300;

                    if (counter === 0) {
                        pub.currentGameContext = pub.MainContext;
                        pub.sound.mChill.play();
                        return true;
                    }
                };
            }());
        });
        this.Button_Exit.hide();

        this.offsetY = 300;
        this.offsetX = 0;
        this.toCall.push(function () {
            var counter = 0;

            return function () {
                counter += 10;
                pub.BriefingContext.Back.alpha = counter / 200;
                pub.BriefingContext.Background.alpha = counter / 100;
                pub.BriefingContext.wasd.alpha = counter / 100;
                pub.BriefingContext.num.alpha = counter / 100;
                pub.BriefingContext.offsetY = counter * 3 - 300;

                if (counter === 100) {
                    pub.BriefingContext.Button_Exit.show();
                    return true;
                }
            };
        }());

        pub.currentGameContext = this;
    };

    pub.UpgradeContext = RSTools.createObject(pub.GameContext);
    pub.UpgradeContext.init = function (_drawingContext) {

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.Back = RSTools.createObject(pub.DrawableRect);
        this.Back.initRect(this, 20, 20, 760, 560, "White", -300);
        this.Back.alpha = 0;
        this.Back.nonOffset = true;

        this.Background = RSTools.createObject(pub.Drawable);
        this.Background.initDrawable(this, 150, 100, 700, 400, 500, 400, -100);
        this.Background.alpha = 0;

        this.Button_Exit = RSTools.createObject(pub.TextButton);
        this.Button_Exit.initButton(this, 600, 450, 30, 30, "X", function () {
            pub.UpgradeContext.toCall.push(function () {
                var counter = 100;

                pub.UpgradeContext.Button_Exit.hide();

                return function () {
                    counter -= 10;
                    pub.UpgradeContext.Back.alpha = counter / 200;
                    pub.UpgradeContext.Background.alpha = counter / 100;
                    pub.UpgradeContext.offsetY = counter * 3 - 300;

                    if (counter === 0) {
                        pub.currentGameContext = pub.MainContext;
                        return true;
                    }
                };
            }());
        });
        this.Button_Exit.hide();

        this.tShip = RSTools.createObject(pub.DrawableText);
        this.tShip.initText(this, 275, 150, true, "Ship", 26, "White", 0);
        this.tCannons = RSTools.createObject(pub.DrawableText);
        this.tCannons.initText(this, 525, 150, true, "Cannons", 26, "White", 0);

        this.setCannons();
        this.setShip();

        this.offsetY = 300;
        this.offsetX = 0;
        this.toCall.push(function () {
            var counter = 0;

            return function () {
                counter += 10;
                pub.UpgradeContext.Back.alpha = counter / 200;
                pub.UpgradeContext.Background.alpha = counter / 100;
                pub.UpgradeContext.offsetY = counter * 3 - 300;

                if (counter === 100) {
                    pub.UpgradeContext.Button_Exit.show();
                    return true;
                }
            };
        }());

        pub.currentGameContext = this;
    };
    pub.UpgradeContext.setCannons = function () {
        var mainCost = 1000,
            side1CostB = 500,
            side2CostB = 500,
            side3CostB = 500,
            side4CostB = 500,
            side1Cost = side1CostB * (pub.MainContext.Ship.sideGun1.strength + 1),
            side2Cost = side2CostB * (pub.MainContext.Ship.sideGun2.strength + 1),
            side3Cost = side3CostB * (pub.MainContext.Ship.sideGun3.strength + 1),
            side4Cost = side4CostB * (pub.MainContext.Ship.sideGun4.strength + 1),
            name = "Main Cannon";

        this.tMainCannon = RSTools.createObject(pub.DrawableText);
        this.tMainCannon.initText(this, 525, 200, true, name+" Lv3", 18, "White", 0);
        if (pub.MainContext.Ship.mainGun.strength < 3) {
            this.bMainCannon = RSTools.createObject(pub.TextButton);
            this.bMainCannon.initButton(this, 425, 190, 200, 24, mainCost+" UO "+name+" Lv" + (pub.MainContext.Ship.mainGun.strength + 1), function () {
                if (pub.MainContext.resources >= mainCost) {
                    pub.MainContext.Ship.mainGun.strength += 1;
                    pub.MainContext.resources -= mainCost;

                    if (pub.MainContext.Ship.mainGun.strength === 3) {
                        pub.UpgradeContext.bMainCannon.hide();
                    } else {
                        pub.UpgradeContext.bMainCannon.text.text = mainCost + " UO " + "Main Cannon" + " Lv" + (pub.MainContext.Ship.mainGun.strength + 1);
                    }
                }
            }, 10);
        }

        name = "Front Left";
        this.tFLCannon = RSTools.createObject(pub.DrawableText);
        this.tFLCannon.initText(this, 525, 250, true, name+" Lv3", 18, "White", 0);
        if (pub.MainContext.Ship.sideGun1.strength < 3) {
            this.tFLCannon = RSTools.createObject(pub.TextButton);
            this.tFLCannon.initButton(this, 425, 240, 200, 24, side1Cost+" UO "+name+" Lv" + (pub.MainContext.Ship.sideGun1.strength + 1), function () {
                if (pub.MainContext.resources >= side1CostB * (pub.MainContext.Ship.sideGun1.strength + 1)) {
                    pub.MainContext.resources -= side1CostB * (pub.MainContext.Ship.sideGun1.strength + 1);
                    pub.MainContext.Ship.sideGun1.strength += 1;

                    if (pub.MainContext.Ship.sideGun1.strength === 3) {
                        pub.UpgradeContext.tFLCannon.hide();
                    } else {
                        pub.UpgradeContext.tFLCannon.text.text = side1CostB * (pub.MainContext.Ship.sideGun1.strength + 1) + " UO " + "Front Left" + " Lv" + (pub.MainContext.Ship.sideGun1.strength + 1);
                    }
                }
            }, 10);
        }

        name = "Front Right";
        this.tFRCannon = RSTools.createObject(pub.DrawableText);
        this.tFRCannon.initText(this, 525, 275, true, name+" Lv3", 18, "White", 0);
        if (pub.MainContext.Ship.sideGun1.strength < 3) {
            this.tFRCannon = RSTools.createObject(pub.TextButton);
            this.tFRCannon.initButton(this, 425, 265, 200, 24, side2Cost+" UO "+name+" Lv" + (pub.MainContext.Ship.sideGun2.strength + 1), function () {
                if (pub.MainContext.resources >= side2CostB * (pub.MainContext.Ship.sideGun2.strength + 1)) {
                    pub.MainContext.resources -= side2CostB * (pub.MainContext.Ship.sideGun2.strength + 1);
                    pub.MainContext.Ship.sideGun2.strength += 1;

                    if (pub.MainContext.Ship.sideGun2.strength === 3) {
                        pub.UpgradeContext.tFRCannon.hide();
                    } else {
                        pub.UpgradeContext.tFRCannon.text.text = side2CostB * (pub.MainContext.Ship.sideGun2.strength + 1) + " UO " + "Front Right" + " Lv" + (pub.MainContext.Ship.sideGun2.strength + 1);
                    }
                }
            }, 10);
        }

        name = "Back Left";
        this.tBLCannon = RSTools.createObject(pub.DrawableText);
        this.tBLCannon.initText(this, 525, 300, true, name+" Lv3", 18, "White", 0);
        if (pub.MainContext.Ship.sideGun3.strength < 3) {
            this.tBLCannon = RSTools.createObject(pub.TextButton);
            this.tBLCannon.initButton(this, 425, 290, 200, 24, side3Cost + " UO " + name + " Lv" + (pub.MainContext.Ship.sideGun3.strength + 1), function () {
                if (pub.MainContext.resources >= side3CostB * (pub.MainContext.Ship.sideGun3.strength + 1)) {
                    pub.MainContext.resources -= side3CostB * (pub.MainContext.Ship.sideGun3.strength + 1);
                    pub.MainContext.Ship.sideGun3.strength += 1;

                    if (pub.MainContext.Ship.sideGun3.strength === 3) {
                        pub.UpgradeContext.tBLCannon.hide();
                    } else {
                        pub.UpgradeContext.tBLCannon.text.text = side3CostB * (pub.MainContext.Ship.sideGun3.strength + 1) + " UO " + "Back Left" + " Lv" + (pub.MainContext.Ship.sideGun3.strength + 1);
                    }
                }
            }, 10);
        }

        name = "Back Right";
        this.tBRCannon = RSTools.createObject(pub.DrawableText);
        this.tBRCannon.initText(this, 525, 325, true, name+" Lv3", 18, "White", 0);
        if (pub.MainContext.Ship.sideGun4.strength < 3) {
            this.tBRCannon = RSTools.createObject(pub.TextButton);
            this.tBRCannon.initButton(this, 425, 315, 200, 24, side4Cost+" UO "+name+" Lv" + (pub.MainContext.Ship.sideGun4.strength + 1), function () {
                if (pub.MainContext.resources >= side4CostB * (pub.MainContext.Ship.sideGun4.strength + 1)) {
                    pub.MainContext.resources -= side4CostB * (pub.MainContext.Ship.sideGun4.strength + 1);
                    pub.MainContext.Ship.sideGun4.strength += 1;

                    if (pub.MainContext.Ship.sideGun4.strength === 3) {
                        pub.UpgradeContext.tBRCannon.hide();
                    } else {
                        pub.UpgradeContext.tBRCannon.text.text = side4CostB * (pub.MainContext.Ship.sideGun4.strength + 1) + " UO " + "Back Right" + " Lv" + (pub.MainContext.Ship.sideGun4.strength + 1);
                    }
                }
            }, 10);
        }

    };
    pub.UpgradeContext.setShip = function () {
        var armorCost = 200,
            energyCost = 200,
            energyRateCost = 500,
            sideBoosterCost = 500,
            warpCost = 1000,
            name = "";

        name = "Armor";
        this.tArmor = RSTools.createObject(pub.DrawableText);
        this.tArmor.initText(this, 275, 200, true, name + " 300", 18, "White", 0);
        if (pub.MainContext.Ship.maxHealth < 300) {
            this.bArmor = RSTools.createObject(pub.TextButton);
            this.bArmor.initButton(this, 175, 190, 200, 24, armorCost + " UO " + name + " " + (pub.MainContext.Ship.maxHealth+100), function () {
                
                if (pub.MainContext.resources >= armorCost) {
                    pub.MainContext.Ship.maxHealth += 10;
                    pub.MainContext.Ship.health = pub.MainContext.Ship.maxHealth;
                    pub.MainContext.resources -= armorCost;

                    if (pub.MainContext.Ship.maxHealth === 300) {
                        pub.UpgradeContext.bArmor.hide();
                    } else {
                        pub.UpgradeContext.bArmor.text.text = armorCost + " UO " + "Armor" + " " + (pub.MainContext.Ship.maxHealth + 100);
                    }
                }
            }, 10);
        }

        name = "Battery";
        this.tBattery = RSTools.createObject(pub.DrawableText);
        this.tBattery.initText(this, 275, 225, true, name + " 300", 18, "White", 0);
        if (pub.MainContext.Ship.maxEnergy < 300) {
            this.bBattery = RSTools.createObject(pub.TextButton);
            this.bBattery.initButton(this, 175, 215, 200, 24, energyCost + " UO " + name + " " + (pub.MainContext.Ship.maxEnergy + 100), function () {
                if (pub.MainContext.resources >= energyCost) {
                    pub.MainContext.Ship.maxEnergy += 10;
                    pub.MainContext.Ship.energy = pub.MainContext.Ship.maxEnergy;
                    pub.MainContext.resources -= energyCost;

                    if (pub.MainContext.Ship.maxEnergy === 300) {
                        pub.UpgradeContext.bBattery.hide();
                    } else {
                        pub.UpgradeContext.bBattery.text.text = energyCost + " UO " + "Battery" + " " + (pub.MainContext.Ship.maxEnergy + 100);
                    }
                }
            }, 10);
        }

        name = "Generator";
        this.tGenerator = RSTools.createObject(pub.DrawableText);
        this.tGenerator.initText(this, 275, 275, true, name + " x 3", 18, "White", 0);
        if (pub.MainContext.Ship.energyGain < 3) {
            this.bGenerator = RSTools.createObject(pub.TextButton);
            this.bGenerator.initButton(this, 175, 265, 200, 24, energyRateCost + " UO " + name + " x " + (pub.MainContext.Ship.energyGain + 0.5), function () {
                if (pub.MainContext.resources >= energyRateCost) {
                    pub.MainContext.Ship.energyGain += 0.5;
                    pub.MainContext.resources -= energyRateCost;

                    if (pub.MainContext.Ship.energyGain === 3) {
                        pub.UpgradeContext.bGenerator.hide();
                    } else {
                        pub.UpgradeContext.bGenerator.text.text = energyRateCost + " UO " + "Generator" + " x " + (pub.MainContext.Ship.energyGain + 0.5);
                    }
                }
            }, 10);
        }

        name = "Side Boosters";
        this.tSideBooster = RSTools.createObject(pub.DrawableText);
        this.tSideBooster.initText(this, 275, 325, true, name +" installed", 18, "White", 0);
        if (pub.MainContext.Ship.maxSpeedX < 15) {
            this.bSideBooster = RSTools.createObject(pub.TextButton);
            this.bSideBooster.initButton(this, 175, 315, 200, 24, sideBoosterCost + " UO " + name, function () {
                if (pub.MainContext.resources >= sideBoosterCost) {
                    pub.MainContext.Ship.maxSpeedX += 5;
                    pub.MainContext.resources -= sideBoosterCost;

                    if (pub.MainContext.Ship.maxSpeedX === 15) {
                        pub.UpgradeContext.bSideBooster.hide();
                    } else {
                        pub.UpgradeContext.bSideBooster.text.text = sideBoosterCost + " UO " + "Side Boosters";
                    }
                }
            }, 10);
        }

        name = "SD Warp";
        this.tWarp = RSTools.createObject(pub.DrawableText);
        this.tWarp.initText(this, 275, 350, true, name + " installed", 18, "White", 0);
        if (!pub.MainContext.Ship.warp) {
            this.bWarp = RSTools.createObject(pub.TextButton);
            this.bWarp.initButton(this, 175, 340, 200, 24, warpCost + " UO " + name, function () {
                if (pub.MainContext.resources >= warpCost) {
                    pub.MainContext.Ship.warp = true;
                    pub.MainContext.resources -= warpCost;

                    if (pub.MainContext.Ship.warp) {
                        pub.UpgradeContext.bWarp.hide();
                    } else {
                        pub.UpgradeContext.bWarp.text.text = warpCost + " UO " + "SD Warp";
                    }
                }
            }, 10);
        }
    };
    pub.UpgradeContext.work = function () {

        pub.GameContext.work.apply(this);
        pub.MainContext.drawUI();
    }

    pub.ConfigureContext = RSTools.createObject(pub.GameContext);
    pub.ConfigureContext.init = function (_drawingContext) {

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.Back = RSTools.createObject(pub.DrawableRect);
        this.Back.initRect(this, 20, 20, 760, 560, "White", -300);
        this.Back.alpha = 0;
        this.Back.nonOffset = true;

        this.Background = RSTools.createObject(pub.Drawable);
        this.Background.initDrawable(this, 150, 100, 700, 400, 500, 400, -100);
        this.Background.alpha = 0;

        this.Button_Exit = RSTools.createObject(pub.TextButton);
        this.Button_Exit.initButton(this, 600, 450, 30, 30, "X", function () {
            pub.ConfigureContext.toCall.push(function () {
                var counter = 100;

                pub.ConfigureContext.Button_Exit.hide();

                return function () {
                    counter -= 10;
                    pub.ConfigureContext.Back.alpha = counter / 200;
                    pub.ConfigureContext.Background.alpha = counter / 100;
                    pub.ConfigureContext.offsetY = counter * 3 - 300;

                    if (counter === 0) {
                        pub.currentGameContext = pub.MainContext;
                        return true;
                    }
                };
            }());
        });
        this.Button_Exit.hide();

        this.tShip = RSTools.createObject(pub.DrawableText);
        this.tShip.initText(this, 300, 150, true, "Config", 26, "White", 0);
        this.tCannons = RSTools.createObject(pub.DrawableText);
        this.tCannons.initText(this, 540, 150, true, "Buttons", 26, "White", 0);
        
        this.setButtons();
        this.initConfig();

        this.offsetY = 300;
        this.offsetX = 0;
        this.toCall.push(function () {
            var counter = 0;

            return function () {
                counter += 10;
                pub.ConfigureContext.Back.alpha = counter / 200;
                pub.ConfigureContext.Background.alpha = counter / 100;
                pub.ConfigureContext.offsetY = counter * 3 - 300;

                if (counter === 100) {
                    pub.ConfigureContext.Button_Exit.show();
                    return true;
                }
            };
        }());

        pub.currentGameContext = this;
    };
    pub.ConfigureContext.setButtons = function () {
        var i, j,
            button,
            num;

        this.buttons = [];
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                num = i + j * 3 + 1;

                button = RSTools.createObject(pub.TextButton);
                button.initButton(this, 460 + 60 * i, 300 - 60 * j, 50, 50, num, function () {
                    var n = num;

                    return function () {
                        pub.ConfigureContext.setConfig(n);
                    };
                }(), 10);
                this.buttons.push(button);
            }
        }

        num = 0;
        button = RSTools.createObject(pub.TextButton);
        button.initButton(this, 460, 360, 170, 50, "0", function () {
            var n = num;

            return function () {
                pub.ConfigureContext.setConfig(n);
            };
        }(), 10);
    };
    pub.ConfigureContext.initConfig = function () {
        var xoff = 300,
            yoff = 235, yint = 50,
            colorInactive="White";

        this.tNum = RSTools.createObject(pub.DrawableText);
        this.tNum.initText(this, 300, 200, true, "", 24, "White", 0);

        this.rMain = RSTools.createObject(pub.DrawableRect);
        this.rMain.initRect(this, xoff - 10, yoff - 10, 120, 44, colorInactive, 5);
        this.rMain.alpha = 0;
        this.bMain = RSTools.createObject(pub.TextButton);
        this.bMain.initButton(this, xoff, yoff, 100, 24, "Main Cannon", function () {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].switchGun(pub.MainContext.Ship.mainGun);
            pub.ConfigureContext.refreshRectangles();
        }, 10);
        this.bMain.visible = false;
        

        this.rSide1 = RSTools.createObject(pub.DrawableRect);
        this.rSide1.initRect(this, xoff - 10, yoff+yint - 10, 120, 44, colorInactive, 5);
        this.rSide1.alpha = 0;
        this.bSide1 = RSTools.createObject(pub.TextButton);
        this.bSide1.initButton(this, xoff, yoff+yint, 100, 24, "Front Left", function () {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].switchGun(pub.MainContext.Ship.sideGun1);
            pub.ConfigureContext.refreshRectangles();
        }, 10);
        this.bSide1.visible = false;

        this.rSide2 = RSTools.createObject(pub.DrawableRect);
        this.rSide2.initRect(this, xoff - 10, yoff + yint*2 - 10, 120, 44, colorInactive, 5);
        this.rSide2.alpha = 0;
        this.bSide2 = RSTools.createObject(pub.TextButton);
        this.bSide2.initButton(this, xoff, yoff+yint*2, 100, 24, "Front Right", function () {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].switchGun(pub.MainContext.Ship.sideGun2);
            pub.ConfigureContext.refreshRectangles();
        }, 10);
        this.bSide2.visible = false;

        this.rSide3 = RSTools.createObject(pub.DrawableRect);
        this.rSide3.initRect(this, xoff - 10, yoff + yint*3 - 10, 120, 44, colorInactive, 5);
        this.rSide3.alpha = 0;
        this.bSide3 = RSTools.createObject(pub.TextButton);
        this.bSide3.initButton(this, xoff, yoff+yint*3, 100, 24, "Back Left", function () {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].switchGun(pub.MainContext.Ship.sideGun3);
            pub.ConfigureContext.refreshRectangles();
        }, 10);
        this.bSide3.visible = false;

        this.rSide4 = RSTools.createObject(pub.DrawableRect);
        this.rSide4.initRect(this, xoff - 10, yoff + yint*4 - 10, 120, 44, colorInactive, 5);
        this.rSide4.alpha = 0;
        this.bSide4 = RSTools.createObject(pub.TextButton);
        this.bSide4.initButton(this, xoff, yoff+yint*4, 100, 24, "Back Right", function () {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].switchGun(pub.MainContext.Ship.sideGun4);
            pub.ConfigureContext.refreshRectangles();
        }, 10);
        this.bSide4.visible = false;

        this.oRotate = RSTools.createObject(pub.AngleButton);
        this.oRotate.initButton(this,200, 325, "Direction", function (_rot) {
            pub.MainContext.Ship.gunAssignment[pub.ConfigureContext.num].rotation = _rot;
        });
        this.oRotate.visible = false;
    };
    pub.ConfigureContext.setConfig = function (_num) {
        var but,
            s1 = pub.MainContext.Ship.sideGun1.strength > 0,
            s2 = pub.MainContext.Ship.sideGun2.strength > 0,
            s3 = pub.MainContext.Ship.sideGun3.strength > 0,
            s4 = pub.MainContext.Ship.sideGun4.strength > 0;

        this.num=_num;

        this.tNum.text = _num;

        this.bMain.visible = true;
        
        if (s1) {
            this.bSide1.visible = true;
        }
        if (s2) {
            this.bSide2.visible = true;
        }
        if (s3) {
            this.bSide3.visible = true;
        }
        if (s4) {
            this.bSide4.visible = true;
        }

        this.rMain.alpha = 1;

        if (s1) {
            this.rSide1.alpha = 1;
        }
        if (s2) {
            this.rSide2.alpha = 1;
        }
        if (s3) {
            this.rSide3.alpha = 1;
        }
        if (s4) {
            this.rSide4.alpha = 1;
        }

        this.refreshRectangles();

        this.oRotate.visible = true;
        this.oRotate.knob.rotation = pub.MainContext.Ship.gunAssignment[this.num].rotation;
    };
    pub.ConfigureContext.refreshRectangles = function () {
        var inactiveColor = "White",
            activeColor = "Blue";

        if (pub.MainContext.Ship.gunAssignment[this.num].hasGun(pub.MainContext.Ship.mainGun)) {
            this.rMain.fillStyle = activeColor;
        } else {
            this.rMain.fillStyle = inactiveColor;
        }

        if (pub.MainContext.Ship.gunAssignment[this.num].hasGun(pub.MainContext.Ship.sideGun1)) {
            this.rSide1.fillStyle = activeColor;
        } else {
            this.rSide1.fillStyle = inactiveColor;
        }

        if (pub.MainContext.Ship.gunAssignment[this.num].hasGun(pub.MainContext.Ship.sideGun2)) {
            this.rSide2.fillStyle = activeColor;
        } else {
            this.rSide2.fillStyle = inactiveColor;
        }

        if (pub.MainContext.Ship.gunAssignment[this.num].hasGun(pub.MainContext.Ship.sideGun3)) {
            this.rSide3.fillStyle = activeColor;
        } else {
            this.rSide3.fillStyle = inactiveColor;
        }

        if (pub.MainContext.Ship.gunAssignment[this.num].hasGun(pub.MainContext.Ship.sideGun4)) {
            this.rSide4.fillStyle = activeColor;
        } else {
            this.rSide4.fillStyle = inactiveColor;
        }
    }
    pub.ConfigureContext.work = function () {
        pub.GameContext.work.apply(this);
        pub.MainContext.drawUI();
    }

    pub.GameOverContext = RSTools.createObject(pub.GameContext);
    pub.GameOverContext.init = function (_drawingContext) {
        
        pub.GameContext.init.apply(this, [_drawingContext]);

        this.Back = RSTools.createObject(pub.DrawableRect);
        this.Back.initRect(this, 20, 20, 760, 560, "Black", -300);
        this.Back.alpha = 0;

        this.Background = RSTools.createObject(pub.Drawable);
        this.Background.initDrawable(this, 200, 150, 800, 0, 400, 300, -100);
        this.Background.alpha = 0;

        this.Text = RSTools.createObject(pub.DrawableText);
        this.Text.initText(this, 400, 225, true, "FINAL SCORE : " + pub.MainContext.score, 24, "White", 0);
        this.Text.alpha = 0;

        pub.trySubmitScore("GameOver", 1);
        pub.trySubmitScore("Score Total", pub.MainContext.score);

        pub.MainContext.score = undefined;

        this.Button_Exit = RSTools.createObject(pub.TextButton);
        this.Button_Exit.initButton(this, 550, 400, 30, 30, "X", function () {
            pub.GameOverContext.toCall.push(function () {
                var counter = 100;

                pub.GameOverContext.Button_Exit.hide();

                return function () {
                    if (counter === 100) {
                        pub.MainContext.score = undefined;
                        pub.MainContext.resources = undefined;
                        pub.MainContext.init(pub.contextMain);
                        pub.MainContext.work();
                        pub.currentGameContext = pub.GameOverContext;
                    }

                    counter -= 2;
                    pub.GameOverContext.Back.alpha = counter / 100;
                    pub.GameOverContext.Background.alpha = counter / 100;
                    pub.GameOverContext.Text.alpha = counter / 100;

                    if (counter === 0) {
                        pub.currentGameContext = pub.MainContext;
                        return true;
                    }
                };
            }());
        });
        this.Button_Exit.hide();

        this.toCall.push(function () {
            var counter = 0;

            return function () {
                pub.MainContext.work();

                counter += 2;
                pub.GameOverContext.Back.alpha = counter / 100;
                pub.GameOverContext.Background.alpha = counter / 100;
                pub.GameOverContext.Text.alpha = counter / 100;

                if (counter === 100) {
                    pub.GameOverContext.Button_Exit.show();
                    return true;
                }
            };
        }());

        pub.currentGameContext = this;

        pub.sound.mChill.play();
    };

    pub.SoundSliderContext = RSTools.createObject(pub.GameContext);
    pub.SoundSliderContext.init = function (_drawingContext) {

        this.drawOver = true;

        pub.GameContext.init.apply(this, [_drawingContext]);
        
        this.offsetX = 0;
        this.offsetY = 0;

        this.volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        this.volumeEffectSlider.initButton(this, 535, 580, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume);
        this.volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        this.volumeMusicSlider.initButton(this, 680, 580, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume);

    };

    pub.MenuContext = RSTools.createObject(pub.GameContext);

    return pub;
}(IDIDGAME_Respawn || {}, undefined));