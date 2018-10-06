/// <reference path="../_references.js" />

var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";
    
    pub.Ship = RSTools.createObject(pub.Drawable);
    pub.Ship.init = function (_gameContext) {
        var that = this, i, j, ga;
        
        this.initDrawable(_gameContext, -25, -25, 0, 0, 50, 50, 0);

        this.shadow = RSTools.createObject(pub.Drawable);
        this.shadow.initDrawable(this.gameContext, 0, 0, 50, 0, 50, 50, -100);
        this.shadow.drawParent = this;
        this.shadow.alpha = 0;

        this.flame = RSTools.createObject(pub.Drawable);
        this.flame.initDrawable(this.gameContext, 19, 50, 120, 0, 12, 20, -1);
        this.flame.initAnimation(12, 0, 3, 3);
        this.flame.drawParent = this;
        this.flame.drawHeight = 0.001;

        this.uoShine = RSTools.createObject(pub.Drawable);
        this.uoShine.initDrawable(this.gameContext, -5, -5, 300, 0, 60, 60, -2);
        this.uoShine.alpha = 0;
        this.uoShine.drawParent = this;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        this.status = 0;

        //UPGRADABLE
        this.health = 100;
        this.maxHealth = 100;
        
        this.energy = 100;
        this.maxEnergy = 100;

        this.energyGain = 1;
        
        this.maxSpeedX = 10;

        this.warp = false;
        //UPGRADABLE

        this.scrollSpeed = 0;
        this.zHeight = 0;

        this.maxSpeedY = 5;

        this.speedX = 0;
        this.speedY = 0;

        this.hitFrames = 0;

        this.accelerationX = 1;
        this.accelerationY = 0.5;
        this.counterAccelerationX = 1.5;
        this.counterAccelerationY = 1;
        this.decelerationX = 1;
        this.decelerationY = 0.5;

        this.gameContext.onKeyChange.push({ key: RSTools.Keys.A, action: function (value) { that.left = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.W, action: function (value) { that.up = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.S, action: function (value) { that.down = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.D, action: function (value) { that.right = value; } });

        this.leftTap = RSTools.createObject(pub.TapRecognizer);
        this.leftTap.init(function () {
            if (pub.MainContext.Ship.energy >= 40) {
                pub.MainContext.Ship.posX -= 150;
                pub.MainContext.Ship.energy -= 40;

                pub.MainContext.toCall.push(function () {
                    var w = RSTools.createObject(pub.Drawable),
                        speedY = pub.MainContext.Ship.speedY - pub.MainContext.Ship.scrollSpeed;

                    w.initDrawable(pub.MainContext, pub.MainContext.Ship.posX+150, pub.MainContext.Ship.posY, 250, 0, 50, 50, -1);

                    return function () {
                        w.alpha -= 0.1;
                        w.posY += speedY;
                        if (w.alpha <= 0) {
                            w.remove();
                            return true;
                        }
                    };
                }());
            }
        });
        this.rightTap = RSTools.createObject(pub.TapRecognizer);
        this.rightTap.init(function () {
            if (pub.MainContext.Ship.energy >= 40) {
                pub.MainContext.Ship.posX += 150;
                pub.MainContext.Ship.energy -= 40;

                pub.MainContext.toCall.push(function () {
                    var w = RSTools.createObject(pub.Drawable),
                        speedY = pub.MainContext.Ship.speedY - pub.MainContext.Ship.scrollSpeed;

                    w.initDrawable(pub.MainContext, pub.MainContext.Ship.posX-150, pub.MainContext.Ship.posY, 250, 0, 50, 50, -1);

                    return function () {
                        w.alpha -= 0.1;
                        w.posY += speedY;
                        if (w.alpha <= 0) {
                            w.remove();
                            return true;
                        }
                    };
                }());
            }
        });
        /*this.upTap = RSTools.createObject(pub.TapRecognizer);
        this.upTap.init(function () {
            pub.MainContext.Ship.posY += 200;
        });
        this.downTap = RSTools.createObject(pub.TapRecognizer);
        this.downTap.init(function () {
            pub.MainContext.Ship.posY -= 200;
        });*/

        this.guns = [];
        this.mainGun = RSTools.createObject(pub.Gun);
        this.mainGun.init(this, pub.Guntype.shipMain);
        this.mainGun.tag = 0;
        this.guns.push(this.mainGun);
        this.sideGun1 = RSTools.createObject(pub.Gun);
        this.sideGun1.init(this, pub.Guntype.shipSide, 0, 5);
        this.sideGun1.tag = 1;
        this.guns.push(this.sideGun1);
        this.sideGun2 = RSTools.createObject(pub.Gun);
        this.sideGun2.init(this, pub.Guntype.shipSide, 35, 5);
        this.sideGun2.tag = 2;
        this.guns.push(this.sideGun2);
        this.sideGun3 = RSTools.createObject(pub.Gun);
        this.sideGun3.init(this, pub.Guntype.shipSide, 6, 28);
        this.sideGun3.tag = 3;
        this.guns.push(this.sideGun3);
        this.sideGun4 = RSTools.createObject(pub.Gun);
        this.sideGun4.init(this, pub.Guntype.shipSide, 28, 28);
        this.sideGun4.tag = 4;
        this.guns.push(this.sideGun4);

        if (!this.gameContext.prevShip) {
            this.gunAssignment = [];
        }

        for (i = 0; i < 10; i++) {
            if (!this.gunAssignment[i]) {
                ga = RSTools.createObject(pub.GunAssign);
                ga.init(i);
                this.gunAssignment.push(ga);
            } else {
                ga = this.gunAssignment[i];
                for (j = 0; j < ga.guns.length; j++) {
                    switch (ga.guns[j].tag) {
                        case 0:
                            ga.guns[j] = this.mainGun;
                            break;
                        case 1:
                            ga.guns[j] = this.sideGun1;
                            break;
                        case 2:
                            ga.guns[j] = this.sideGun2;
                            break;
                        case 3:
                            ga.guns[j] = this.sideGun3;
                            break;
                        case 4:
                            ga.guns[j] = this.sideGun4;
                            break;
                    }
                }
            }
            this.gameContext.onKeyChange.push({
                key: RSTools.Keys.NUM_ZERO + i, action: function () {
                    var a = ga;
                    return function (value) {
                        a.firing = value;
                    };
                }()
            });
        }

        if (!this.gameContext.prevShip) {
            this.gunAssignment[5].guns.push(this.mainGun);
        }

        this.gameContext.toUpdate.push(this);

    };
    pub.Ship.update = function () {
        var smoke, i, j;

        this.flame.drawHeight = 0.001;
        if (this.status === 0) {///Parked
            if (this.up) {
                this.gameContext.toCall.push(function (_this) {
                    var count = 0, that = _this;

                    return function () {
                        count += 1;
                        that.gameContext.GateLeft.posX -= 2;
                        that.gameContext.GateRight.posX += 2;

                        if (count === 100) {
                            return true;
                        }
                    };
                }(this));

                this.status = 1;
                smoke = RSTools.createObject(pub.Smoke);
                smoke.init(this.gameContext, this.centerX, this.centerY, 3, 20, 30);

                pub.sound.sLiftOff.request();
                pub.sound.mAggressive.play();
            }
            return;
        } else if (this.status === 1) {///LiftOff
            this.zHeight += 1;
            this.shadow.alpha = 1;
            this.shadow.iposX = this.zHeight;
            this.shadow.iposY = this.zHeight / 2;
            if (this.zHeight === 30) {
                this.status = 2;
            }
            return;
        } else if (this.status === 2) {///BlastOff
            this.scrollSpeed += 1;
            if (this.scrollSpeed === pub.scrollSpeed) {
                this.status = 3;
                pub.sound.sEngine.request();
            }
            return;
        }
        
        //WARP
        if (this.warp) {
            this.leftTap.update(this.left);
            this.rightTap.update(this.right);
        }
        //WARP

        ///MOVEMENT
        if (this.left) {
            if (this.speedX > 0) {
                this.speedX -= this.counterAccelerationX;
            } else {
                this.speedX = Math.max(-this.maxSpeedX, this.speedX - this.accelerationX);
            }
        } else if (this.right) {
            if (this.speedX < 0) {
                this.speedX += this.counterAccelerationX;
            } else {
                this.speedX = Math.min(this.maxSpeedX, this.speedX + this.accelerationX);
            }
        } else if (this.speedX !== 0) {
            if (this.speedX > 0) {
                this.speedX = Math.max(0, this.speedX - this.decelerationX);
            } else {
                this.speedX = Math.min(0, this.speedX + this.decelerationX);
            }
        }

        if (this.up) {
            if (this.speedY > 0) {
                this.speedY -= this.counterAccelerationY;
            } else {
                this.speedY = Math.max(-this.maxSpeedY, this.speedY - this.accelerationY);
            }
        } else if (this.down) {
            if (this.speedY < 0) {
                this.speedY += this.counterAccelerationY;
            } else {
                this.speedY = Math.min(this.maxSpeedY, this.speedY + this.accelerationY);
            }
        } else if (this.speedY !== 0) {
            if (this.speedY > 0) {
                this.speedY = Math.max(0, this.speedY - this.decelerationY);
            } else {
                this.speedY = Math.min(0, this.speedY + this.decelerationY);
            }
        }
        
        this.posX += this.speedX;
        this.posY += this.speedY - this.scrollSpeed;

        if (this.posX < -360) {
            this.posX = -360;
        } else if (this.posX > 310) {
            this.posX = 310;
        }
        ///MOVEMENT

        ///FIRING
        for (i = 0; i < this.guns.length; i++) {
            this.guns[i].rotation = 0;
            this.guns[i].firing = 0;
        }

        for (i = 0; i < 10; i++) {
            for (j = 0; j < this.gunAssignment[i].guns.length; j++) {
                if (this.gunAssignment[i].firing) {
                    this.gunAssignment[i].guns[j].rotation = this.gunAssignment[i].rotation;
                    this.gunAssignment[i].guns[j].firing = true;
                }
            }
        }
        ///FIRING

        ///CHARGING
        this.energy = Math.min(this.energy + this.energyGain, this.maxEnergy);
        ///CHARGING

        ///FLAME
        this.flame.drawHeight = Math.max(0.1, (-this.speedY + this.maxSpeedY + Math.random() * 3 + 2));
        ///FLAME

        //UOShine
        if (this.uoShine.alpha) {
            this.uoShine.alpha = Math.max(0, this.uoShine.alpha - 0.2);
        }
        //UOShine

        //HITFRAMES
        this.spriteX = 0;
        if (this.hitFrames) {
            this.hitFrames -= 1;
            if (this.dead) {
                this.spriteX = 250;
                this.alpha = Math.max(0, this.alpha - 0.05);
                for (i = 0; i < this.guns.length; i++) {
                    this.guns[i].alpha = this.alpha;
                }
                this.shadow.alpha = this.alpha;
            } else {
                this.spriteX = 200;
            }
            this.posX += Math.random() * 4 - 2;
            this.posY += Math.random() * 4 - 2;
            this.flame.drawHeight = 0.1;
        }
        //HITFRAMES
    }
    pub.Ship.hit = function (_bullet) {
        var that = this;

        if (this.hitFrames===0) {
            this.hitFrames = 5;
            this.health = Math.max(this.health - _bullet.damage, 0);
            pub.sound.sHit.request();

            if (!this.dead && this.health === 0) {
                this.dead = true;
                this.hitFrames = 100;

                pub.sound.sEngine.eff.pause();
                
                pub.trySubmitScore("Score Pilot" + (6 - this.gameContext.lives), this.gameContext.score - this.gameContext.waveScore);

                if (that.gameContext.lives === 1) {
                    that.gameContext.lives = undefined;
                    that.gameContext.prevShip = false;
                    pub.GameOverContext.init(pub.contextOverlay);
                } else {
                    RSTools.createObject(pub.FadeUnfade).init(this.gameContext, function () {

                        that.gameContext.lives -= 1;
                        that.gameContext.prevShip = that;

                        that.gameContext.init(this.gameContext.drawingContext);
                    }, false, 100);
                }
            }
        }
    };

    pub.GunAssign = function () { };
    pub.GunAssign.init = function (_num) {
        this.guns = [];
        this.firing = false;
        this.num = _num;
        this.rotation = 0;
    };
    pub.GunAssign.hasGun= function (_gun) {
        return this.guns.indexOf(_gun) !== -1;
    };
    pub.GunAssign.switchGun=function(_gun){
        if (this.hasGun(_gun)) {
            RSTools.removeFromArray(this.guns, _gun);
        } else {
            this.guns.push(_gun);
        }
    }
        

    pub.TapRecognizer = function () { };
    pub.TapRecognizer.init = function (_tapAction) {
        this.tapAction = _tapAction;

        this.state = 0;
        this.counter = 0;
        this.timing = 10;
    };
    pub.TapRecognizer.update = function (_pressed) {

        switch (this.state) {
            case 0:
                if (_pressed) {
                    this.state = 1;
                }
                break;
            case 1://down
                this.counter += 1;
                if (this.counter > this.timing) {
                    this.state = 0;
                    this.counter = 0;
                } else if (!_pressed) {
                    this.state = 2;
                    this.counter = 0;
                }
                break;
            case 2://up
                this.counter += 1;
                if (this.counter > this.timing) {
                    this.state = 0;
                    this.counter = 0;
                } else if (_pressed) {
                    this.state = 3;
                    this.counter = 0;
                }
                break;
            case 3://down
                this.counter += 1;
                if (this.counter > this.timing) {
                    this.state = 0;
                    this.counter = 0;
                } else if (!_pressed) {
                    this.state = 0;
                    this.counter = 0;
                    this.tapAction();
                }
                break;
        }
    }

    pub.Guntype = { shipMain: 0, shipSide: 1, enemyDefault: 10 };

    pub.Gun = RSTools.createObject(pub.Drawable);
    pub.Gun.init = function (_ship,_type,_posX,_posY) {
        this.ship = _ship;
        this.type = _type;
        this.strength = 1;
        this.mod = 3;

        this.firing = false;

        this.coolDown = 5;
        this.coolDownCounter = 0;

        if (this.type === pub.Guntype.shipSide) {
            this.initDrawable(_ship.gameContext, _posX, _posY, 100, 0, 15, 15, 60);
            this.drawParent = _ship;
            this.rotation = 0;
            this.mod = 1;
            this.strength = 0;
        } else {

        }

        this.update();
        this.ship.gameContext.toUpdate.push(this);
    };
    pub.Gun.update = function () {
        var bullet;

        if (this.strength === 0) {
            this.alpha = 0;
            return;
        } else {
            this.alpha = 1;
        }

        if (this.coolDownCounter) {
            this.coolDownCounter -= 1;
            return;
        }
        
        if (this.firing && this.ship.energy >= this.strength*this.mod) {
            bullet = RSTools.createObject(pub.Bullet);
            bullet.init(this.centerX || this.ship.centerX, this.centerY || this.ship.centerY, this);
            this.coolDownCounter = this.coolDown;
            this.ship.energy -= this.strength * this.mod;

            if (this.type === pub.Guntype.enemyDefault) {
                pub.sound.eShoot.request();
            }
            else {
                pub.sound.sShoot.request();
            }
        }
    }
    

    pub.Bullet = function () { };
    pub.Bullet.init = function (_centerX, _centerY, _gun) {
        var vec;

        this.framesToLive = 200;
        this.gun = _gun;
        this.isEnemy = false;
        this.collideByDraw = true;

        this.gameContext = this.gun.ship.gameContext;

        this.color = "White";
        if (this.gun.type === pub.Guntype.shipMain || this.gun.type === pub.Guntype.shipSide) {
            switch (this.gun.strength) {
                case 1:
                    this.color = "Blue";
                    break;
                case 2:
                    this.color = "Lightblue";
                    break;
                case 3:
                    this.color = "White";
                    break;
            }
        } else {
            this.isEnemy = true;
            switch (this.gun.strength) {
                case 1:
                    this.color = "Yellow";
                    break;
                case 2:
                    this.color = "Orange";
                    break;
                case 3:
                    this.color = "Red";
                    break;
            }
        }
        
        switch (this.gun.type) {
            case pub.Guntype.shipMain:
                this.width = 6;
                this.height = 12;
                this.speed = 35;
                break;
            case pub.Guntype.shipSide:
                this.width = 4;
                this.height = 8;
                this.speed = 35;
                break;
            case pub.Guntype.enemyDefault:
                this.width = pub.bulletSize;
                this.height = pub.bulletSize;
                this.speed = pub.bulletSpeed;
                break;
        }
        
        if (this.isEnemy) {
            this.gameContext.enemyBullets.push(this);
            this.draw = RSTools.createObject(pub.DrawableCircle);
            this.draw.initCircle(this.gameContext, _centerX, _centerY, this.width, this.color, 50);
        } else {
            this.gameContext.shipBullets.push(this);
            this.draw = RSTools.createObject(pub.DrawableRect);
            this.draw.initRect(this.gameContext, _centerX - this.width / 2, _centerY - 15, this.width, this.height, this.color, 50);
            this.draw.rotation = this.gun.rotation;
        }
        this.draw.alpha = 1;

        this.gameContext.toUpdate.push(this);

        if (this.gun.rotation) {
            this.rotation = this.gun.rotation;

            vec = RSTools.angleToVector(this.rotation-90);

            this.speedX = vec.x*this.speed;
            this.speedY = vec.y*this.speed;
        } else {
            this.speedX = 0;
            this.speedY = -this.speed;
        }

        this.speedX += this.gun.ship.speedX;
        this.speedY += this.gun.ship.speedY;

        this.damage = this.gun.strength*2 ;

        this.hitCounter = 0;
    }
    pub.Bullet.update = function () {
        if (this.hitCounter) {
            if (this.hitCounter > 10) {
                this.remove();
            }
            this.draw.alpha -= 0.1;
            this.hitCounter += 1;

            if (this.isEnemy) {
                this.draw.radius += 1;
            }
            return;
        }


        if (this.gun.type === pub.Guntype.enemyDefault) {
            this.draw.centerY += this.speedY;
            this.draw.centerX += this.speedX;
        } else {
            this.draw.posY += this.speedY;
            this.draw.posX += this.speedX;
        }

        this.framesToLive -= 1;
        if (this.framesToLive === 0 || this.draw.posX > 350-this.width || this.draw.posX < -350) {
            this.hit();
        }
    }
    pub.Bullet.hit = function () {
        if (this.hitCounter === 0) {
            if (this.isEnemy) {
                RSTools.removeFromArray(this.gameContext.enemyBullets, this);
            } else {
                RSTools.removeFromArray(this.gameContext.shipBullets, this);
                this.remove();
            }
            this.hitCounter = 1;
        }
    }
    pub.Bullet.remove = function () {
        RSTools.removeFromArray(this.gameContext.toUpdate, this);
        this.draw.remove();        
    }

    return pub;
}(IDIDGAME_Respawn || {}, undefined));