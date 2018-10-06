var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
    
    pub.Tower=function(){

    };
    pub.Tower.initTower=function(_posX,_posY,_head,_shaft,_base){
       
        if (_head) {
            //STATS
            this.fired = 0;
            this.hit = 0;
            this.frags = 0;


            this.baseSpeed = 100;
            this.speedMultiplier = 1;
            this.baseRange = 100;
            this.rangeMultiplier = 1;
            this.baseDamage = 100;
            this.damageMultiplier = 1;

            this.color = "Orange";

            //effetts
            this.freezeFrames = 0;
            
            this.base = _base;
            this.base.initBase(_posX, _posY, this);
            this.shaft = _shaft;
            this.shaft.initShaft(this);
            this.head = _head;
            this.head.initHead(this);
            
            this.width = 50;
            this.height = 50;

            this.head.drawParent = this.base;
            this.shaft.drawParent = this.base;

            this.mouseOver = false;
            this.selected=false;
            this.rangeAlpha = 0;

            if (!this.initialized) {
                pub.toUpdate.push(this);
                pub.towers.push(this);
                pub.onMouseEnter.push(this);
                pub.toDraw.push(this);
                this.active = true;
            }

            this.initialized = true;
        }
    };
    pub.Tower.applyEffects = function (_enemy) {
        if (_enemy) {
            if (this.freezeFrames > 0) {
                _enemy.freezeFrames = this.freezeFrames;
                if (_enemy.freezeSlow < 300) {
                    _enemy.freezeSlow += this.damage / 2;
                }
            }
        }
    };
    pub.Tower.update = function () {
        if (this.base.update) {
            this.base.update();
        }
        if (this.shaft.update) {
            this.shaft.update();
        }
        if (this.head.update) {
            this.head.update();
        }
    };
    pub.Tower.draw = function () {
        if (this.mouseOver || this.selected) {
            this.rangeAlpha += 0.05;
        } else {
            this.rangeAlpha -= 0.2;
        }

        if (this.rangeAlpha < 0) {
            this.rangeAlpha = 0;
        } else if (this.rangeAlpha > 1) {
            this.rangeAlpha = 1;
        }

        if (this.rangeAlpha > 0) {
            pub.contextMain.globalAlpha = this.rangeAlpha;
            pub.contextMain.fillStyle = "rgba(150, 150, 150,0.3)";

            if (pub.LaserHead.isPrototypeOf(this.head) || pub.MortarHead.isPrototypeOf(this.head)) {
                pub.contextMain.fillRect(this.posX, this.posY, -this.range, this.height);
                pub.contextMain.fillRect(this.posX, this.posY, this.width, -this.range);
                pub.contextMain.fillRect(this.posX+this.width, this.posY, this.range, this.height);
                pub.contextMain.fillRect(this.posX, this.posY+this.width, this.width, this.range);
            } else {
                pub.contextMain.beginPath();
                pub.contextMain.arc(this.centerX, this.centerY, this.range, 0, Math.PI * 2);
                pub.contextMain.fill();
            }
            pub.contextMain.globalAlpha = 1;
        }
    }
    pub.Tower.onMouseEnter = function () {
        this.mouseOver = true;
    };
    pub.Tower.onMouseLeave = function () {
        if (this.mouseOver) {
            this.mouseOver = false;
        }
    };
    pub.Tower.onMouseUp = function () {
        var that = this;

        if (this.active && !this.selected) {
            pub.SetSelectedContextEntry(this);

            pub.onMouseDownAction.push(function (button) {
                if (button === 2) {
                    pub.SetSelectedContextEntry(false);
                    return true;
                }
            });
        }
    };
    pub.Tower.remove = function () {
        this.head.remove();
        this.shaft.remove();
        this.base.remove();

        RSTools.removeFromArray(pub.toUpdate, this);
        RSTools.removeFromArray(pub.toDraw, this);
        RSTools.removeFromArray(pub.onMouseEnter, this);
        RSTools.removeFromArray(pub.onMouseUp, this);
        RSTools.removeFromArray(pub.towers, this);

        pub.Level[this.levelX][this.levelY] = undefined;

        pub.pathfinding.update();
        pub.pathfinding.calculate();
    };
    Object.defineProperty(pub.Tower, "speed", {
        get: function () { return this.baseSpeed * this.speedMultiplier; }
    });
    Object.defineProperty(pub.Tower, "range", {
        get: function () { return this.baseRange * this.rangeMultiplier; }
    });
    Object.defineProperty(pub.Tower, "damage", {
        get: function () { return this.baseDamage * this.damageMultiplier;}
    });
    Object.defineProperty(pub.Tower, "posX", {
        get: function () { return this.base.posX; },
        set: function (value) { this.base.posX = value; }
    });
    Object.defineProperty(pub.Tower, "posY", {
        get: function () { return this.base.posY; },
        set: function (value) { this.base.posY = value; }
    });
    Object.defineProperty(pub.Tower, "centerX", {
        get: function () { return this.base.centerX; },
        set: function (value) { this.base.centerX = value; }
    });
    Object.defineProperty(pub.Tower, "centerY", {
        get: function () { return this.base.centerY; },
        set: function (value) { this.base.centerY = value; }
    });
    Object.defineProperty(pub.Tower, "alpha", {
        get: function () { return this.base.alpha; },
        set: function (value) {
            this.base.alpha = value;
            this.head.alpha = value;
            this.shaft.alpha = value;
        }
    });
    Object.defineProperty(pub.Tower, "cost", {
        get: function () { return this.base.cost + this.shaft.cost + this.head.cost;}
    });
    Object.defineProperty(pub.Tower, "desc", {
        get: function () { return  this.base.desc + " " + this.shaft.desc + " " + this.head.desc; }
    });

    pub.Head = RSTools.createObject(pub.Drawable);
    pub.Head.initHead = function (_tower) {
        this.tower = _tower;

        this.initDrawable(0, 0, 0, 400, 50, 50);
        this.target = undefined;
        this.shotCounter = 0;
        this.lead = 0;
        this.bulletType = pub.Bullet;

        this.cost = 5;
        this.desc = "Cannon";
        
        this.rotation = 0;
    };
    pub.Head.update = function () {
        var e,
            distance,
            closest,
            closestDistance,
            repl;

        if (this.tower.active) {
            for (var i = 0; i < pub.enemies.length; i++) {
                e = pub.enemies[i];
                distance = this.getDistance(e.posX, e.posY);
                if (distance < this.tower.range) {
                    if (!closest) {
                        repl = true;
                    } else if (distance < closestDistance) {
                        repl = true;
                    }
                }

                if (repl) {
                    closest = e;
                    closestDistance = distance;
                    repl = false;
                }
            }
        }

        if (closest) {
            this.lookAt(closest);
            this.rotation += this.lead;
            this.target = closest;
            this.shotCounter += this.tower.speed/20;
        }
        else {
            this.rotation += this.tower.speed/100;
            this.shotCounter = 0;
        }

        if (this.shotCounter >=100) {
            this.shoot();
            pub.sound.fire.request();
            this.shotCounter = 0;
        }

        if (this.rotOffX) {
            this.rotOffX -= 0.5;
        }
    };
    pub.Head.shoot = function () {
        var b,
            vec;
        
        this.tower.fired += 1;

        b=RSTools.createObject(this.bulletType);
        vec=RSTools.angleToVector(this.rotation);

        this.rotOffX = 3;
        b.initBullet(this.centerX, this.centerY, vec.x * 5, vec.y * 5, this.tower.range, this.target, this);

    }

    pub.BurstHead = RSTools.createObject(pub.Head);
    pub.BurstHead.initHead = function (_tower) {
        this.burstAmount = 10;
        this.spread = 60;

        pub.Head.initHead.apply(this, [_tower]);

        this.tower.baseDamage -= 80;
        this.spriteX = 50;

        this.cost = 10;
        this.desc = "Burster";
    };
    pub.BurstHead.shoot = function () {
        var b,
            vec;
        
        for (var i = 0; i < this.burstAmount; i++) {
            this.tower.fired += 1;

            b = RSTools.createObject(this.bulletType);
            vec = RSTools.angleToVector(this.rotation + Math.random() * this.spread - this.spread / 2);
            b.initBullet(this.centerX, this.centerY, vec.x * 8, vec.y * 8,this.tower.range, this.target,this);
            b.damage *= this.tower.damage/100;
        }

        this.rotOffX = 5;
    }

    pub.LaserHead = RSTools.createObject(pub.Head);
    pub.LaserHead.initHead = function (_tower) {

        pub.Head.initHead.apply(this, [_tower]);

        //this.tower.damageMultiplier += 1;
        this.tower.SpeedBase -= 50;

        this.spriteX = 100;

        this.cost = 30;
        this.desc = "Laser";

        this.counter = 0;
        this.shooting = false;

    }
    pub.LaserHead.update = function () {

        if (this.tower.active && pub.enemies.length>0) {
            this.counter += this.tower.speed / 100;

            if (this.counter > 50) {
                this.shooting = true;
                this.counter = 0;
            }

            if (this.shooting) {
                this.shoot();
                pub.sound.laser.request();
                this.shooting = false;
            }
        }

        if (this.rotOffX) {
            this.rotOffX -= 0.5;
        }
    };
    pub.LaserHead.shoot = function () {
        var b = RSTools.createObject(pub.LaserBullet);
        b.initBullet(this.centerX, this.centerY, 20, this.tower.range,undefined, this);

        this.tower.fired += 1;

        this.rotOffX = 8;

    };

    pub.MortarHead = RSTools.createObject(pub.Head);
    pub.MortarHead.initHead = function (_tower) {

        pub.Head.initHead.apply(this, [_tower]);
        
        this.tower.damageMultiplier += 1;
        this.tower.SpeedBase -= 40;

        this.spriteX = 150;

        this.cost = 50;
        this.desc = "Mortar";
        
        this.counter = 0;
        this.shooting = false;
    };
    pub.MortarHead.update = function () {

        if (this.tower.active && pub.enemies.length > 0) {
            this.counter += this.tower.speed / 100;

            if (this.counter > 50) {
                this.shooting = true;
                this.counter = 0;
            }

            if (this.shooting) {
                this.shoot();
                pub.sound.fire.request();
                this.shooting = false;
            }

            if (this.rotOffX) {
                this.rotOffX -= 1;
            }
        }
    };
    pub.MortarHead.shoot = function () {
        var b, vec;
        
        vec = RSTools.angleToVector(this.rotation);

        b = RSTools.createObject(pub.MortarBullet);
        b.initBullet(this.centerX, this.centerY, vec.x * 2, vec.y * 2, this.tower.range,undefined, this);

        this.tower.fired += 1;

        this.rotOffX = 10;

    };

    pub.GlobeHead = RSTools.createObject(pub.Head);
    pub.GlobeHead.initHead = function (_tower) {

        pub.Head.initHead.apply(this, [_tower]);

        this.tower.baseSpeed -= 50;
        this.tower.baseRange -= 20;
        this.tower.baseDamage -= 50;
        this.bulletType = pub.GlobeBullet;
        this.spriteX = 200;
        this.rotSpeed = this.tower.speed / 100;

        this.cost = 60;
        this.desc = "Coil";
    };
    pub.GlobeHead.update = function () {
        var e,
            distance,
            closest,
            closestDistance,
            repl;

        if (this.tower.active) {
            for (var i = 0; i < pub.enemies.length; i++) {
                e = pub.enemies[i];
                distance = this.getDistance(e.posX, e.posY);
                if (distance < this.tower.range) {
                    if (!closest) {
                        repl = true;
                    } else if (distance < closestDistance) {
                        repl = true;
                    }
                }

                if (repl) {
                    closest = e;
                    closestDistance = distance;
                    repl = false;
                }
            }
        }
        
        if (this.rotSpeed > this.tower.speed / 100) {
            this.rotSpeed -= 1;
        }

        this.rotation += this.rotSpeed;

        if (closest) {
            this.target = closest;
            this.shotCounter += this.tower.speed / 20;
        }
        else {
            this.shotCounter = 0;
        }

        if (this.shotCounter >= 100) {
            this.shoot();
            pub.sound.laser.request();
            this.shotCounter = 0;
            this.rotSpeed += 10;
        }

        if (this.rotOffX) {
            this.rotOffX = 0;
        }
    };

    pub.GunsHead = RSTools.createObject(pub.Head);
    pub.GunsHead.initHead = function (_tower) {

        pub.Head.initHead.apply(this, [_tower]);

        this.tower.speedMultiplier += 1;
        this.tower.baseRange -= 30;
        this.spriteX = 250;

        this.cost = 30;
        this.desc = "Guns";
    };
    pub.GunsHead.update = function () {
        var e,
            distance,
            closest,
            closestDistance,
            repl;

        if (this.tower.active) {
            for (var i = 0; i < pub.enemies.length; i++) {
                e = pub.enemies[i];
                distance = this.getDistance(e.posX, e.posY);
                if (distance < this.tower.range) {
                    if (!closest) {
                        repl = true;
                    } else if (distance < closestDistance) {
                        repl = true;
                    }
                }

                if (repl) {
                    closest = e;
                    closestDistance = distance;
                    repl = false;
                }
            }
        }

        this.rotation += this.tower.speed / 100;

        if (closest) {
            this.shotCounter += this.tower.speed / 20;
            this.target = closest;
        }
        else {
            this.shotCounter = 0;
        }

        if (this.shotCounter >= 100) {
            this.shoot();
            pub.sound.fire.request();
            this.shotCounter = 0;
        }

        if (this.rotOffX) {
            this.rotOffX = 0;
        }
    };
    pub.GunsHead.shoot = function () {
        var b,
            vec,
            i;

        for (i = 0; i < 4; i++) {
            this.tower.fired += 1;

            b = RSTools.createObject(this.bulletType);
            vec = RSTools.angleToVector(this.rotation + i * 90);

            this.rotOffX = 3;
            b.initBullet(this.centerX, this.centerY, vec.x * 5, vec.y * 5, this.tower.range, this.target, this);
        }
    };

    pub.Shaft = RSTools.createObject(pub.Drawable);
    pub.Shaft.initShaft = function (_tower) {
        this.tower = _tower;

        this.cost = 20;
        this.desc = "high";

        this.tower.rangeMultiplier += 1;

        this.initDrawable(0, 0, 0, 450, 50, 50);

    };

    pub.MediumShaft = RSTools.createObject(pub.Shaft);
    pub.MediumShaft.initShaft = function (_tower) {
        pub.Shaft.initShaft.apply(this, [_tower]);
        this.spriteX = 50;

        this.cost = 10;
        this.desc = "middle";

        this.tower.rangeMultiplier -= 0.5;
    }

    pub.LowShaft = RSTools.createObject(pub.Shaft);
    pub.LowShaft.initShaft = function (_tower) {
        pub.Shaft.initShaft.apply(this, [_tower]);
        this.spriteX = 100;

        this.cost = 0;
        this.desc = "low";

        this.tower.rangeMultiplier -= 1;
    }

    pub.Base = RSTools.createObject(pub.Drawable);
    pub.Base.initBase = function (_posX, _posY, _tower) {
        this.tower = _tower;

        this.cost = 0;
        this.desc = "Basic";

        this.initDrawable(_posX, _posY, 0, 500, 50, 50);
    };

    pub.SpeedBase = RSTools.createObject(pub.Base);
    pub.SpeedBase.initBase=function(_posX, _posY, _tower) {
        pub.Base.initBase.apply(this, [_posX, _posY, _tower]);
        this.spriteX = 50;

        this.cost = 10;
        this.desc = "Fast";

        this.tower.color = "Yellow";
        this.tower.speedMultiplier += 1;
    };

    pub.DamageBase = RSTools.createObject(pub.Base);
    pub.DamageBase.initBase = function (_posX, _posY, _tower) {
        pub.Base.initBase.apply(this, [_posX, _posY, _tower]);
        this.spriteX = 100;

        this.cost = 10;
        this.desc = "Strong";

        this.tower.damageMultiplier += 1;
        this.tower.color = "Red";
    };

    pub.FreezeBase = RSTools.createObject(pub.Base);
    pub.FreezeBase.initBase = function (_posX, _posY, _tower) {
        pub.Base.initBase.apply(this, [_posX, _posY, _tower]);
        this.spriteX = 150;

        this.cost = 20;
        this.desc = "Cold";

        this.tower.DamageBase -= 90;
        this.tower.color = "Blue";
        this.tower.freezeFrames += 100;
    };

    pub.Bullet = RSTools.createObject(pub.DrawableCircle);
    pub.Bullet.initBullet = function (_centerX, _centerY, _speedX, _speedY,_range,_target,_parent) {
        this.speedX = _speedX;
        this.speedY = _speedY;
        this.damage = 5* _parent.tower.damage / 100;

        this.framesToLive =_range/ RSTools.getDistance(0, 0, _speedX, _speedY);
        this.framesLived = 0;
        this.originalX = _centerX;
        this.originalY = _centerY;
        this.parent = _parent;

        this.initCircle(_centerX, _centerY, 3, this.parent.tower.color);

        pub.bullets.push(this);
        pub.toUpdate.push(this);        
    }
    pub.Bullet.update = function () {
        this.centerX += this.speedX;
        this.centerY += this.speedY;

        this.framesLived += 1;

        if (this.framesLived >= this.framesToLive) {
            if (this.framesLived >= this.framesToLive + 5) {
                this.die();
            }
            else {
                this.alpha -= 0.2;
            }
        }
    }
    pub.Bullet.hit = function (_opposition) {
        this.die();
        this.parent.tower.hit += 1;
        this.parent.tower.applyEffects(_opposition);
    }
    pub.Bullet.die = function () {
        RSTools.removeFromArray(pub.toUpdate, this);
        RSTools.removeFromArray(pub.bullets, this);

        this.remove();
    }
    
    pub.ChaseBullet = RSTools.createObject(pub.Bullet);
    pub.ChaseBullet.initBullet = function (_posX, _posY, _speedX,_speedY, _range,_target,_parent) {
        this.target = _target;
        this.speed = Math.sqrt(_speedX * _speedX + _speedY * _speedY);

        pub.Bullet.initBullet.apply(this,[_posX, _posY, _speedX,_speedY, _range,_target,_parent]);
    };
    pub.ChaseBullet.update = function () {
        var angle,
            vector,
            that = this;

        if (this.target.health > 0) {
            angle = RSTools.vectorToAngle(this.target.posX, this.target.posY, this.posX, this.posY);
            vector = RSTools.angleToVector(angle);
            this.speedX = (this.speedX + vector.x * this.speed) / 2;
            this.speedY = (this.speedY + vector.y * this.speed) / 2;
        }

        pub.Bullet.update.apply(this);
    };

    pub.LaserBullet = RSTools.createObject(pub.DrawableRect);
    pub.LaserBullet.initBullet = function (_centerX, _centerY, _offset, _range,_target, _parent) {

        this.parent = _parent;
        this.damage = 5 * _parent.tower.damage / 100;
        this.counter = 0;
        
        if (_parent.rotation === 0) {
            this.initRect(_centerX + _offset, _centerY - 6, _range, 13, this.parent.tower.color);//right
        } else if (_parent.rotation === 90) {
            this.initRect(_centerX - 6, _centerY + _offset, 13, _range, this.parent.tower.color);//down
        } else if (_parent.rotation === 180) {
            this.initRect(_centerX - _offset - _range, _centerY - 6, _range, 13, this.parent.tower.color);//left
        } else if (_parent.rotation === 270) {
            this.initRect(_centerX - 6, _centerY - _offset - _range, 13, _range, this.parent.tower.color);//up
        }

        this.alpha = 0.5;

        pub.bullets.push(this);
        pub.toUpdate.push(this);
    };
    pub.LaserBullet.hit = function (_opposition) {
        if (this.counter===1) {
            this.parent.tower.hit += 1;
            this.parent.tower.applyEffects(_opposition);
        }
    };
    pub.LaserBullet.update = function () {
        this.counter += 1;

        if (this.counter===2 ) {
            RSTools.removeFromArray(pub.bullets, this);
        }

        if (this.counter=== 5) {
            this.die();
        }
    };
    pub.LaserBullet.die = function () {
        RSTools.removeFromArray(pub.toUpdate, this);

        this.remove();
    }

    pub.MortarBullet = RSTools.createObject(pub.Bullet);
    pub.MortarBullet.initBullet = function (_posX, _posY, _speedX, _speedY, _range,_target,_parent) {
        pub.Bullet.initBullet.apply(this, [_posX, _posY, _speedX, _speedY, _range,_target,_parent]);

        this.radius = 5;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.commitPosition();
        this.lineWidth = 2;
        this.strokeStyle = "White";

        this.hasHit = 0;
    };
    pub.MortarBullet.update = function () {
        pub.Bullet.update.apply(this, []);

        if (this.hasHit === 1) {
            this.hasHit += 1;
        }else if (this.hasHit>1) {
            this.die();
        }
    }
    pub.MortarBullet.hit = function (_opposition) {
        if (!this.hasHit) {
            this.radius = 100;
            this.lineWidth = 0;
            this.width = this.radius * 2;
            this.height = this.radius * 2;
            this.commitPosition();
            this.alpha = 0.2;
            
            this.parent.tower.hit += 1;
            this.parent.tower.applyEffects(_opposition);
            
            this.hasHit += 1;

            pub.sound.laser.request();
        }
    };

    pub.GlobeBullet = RSTools.createObject(pub.Bullet);
    pub.GlobeBullet.initBullet = function (_posX, _posY,_speedX,_speedY, _range,_target, _parent) {
        pub.Bullet.initBullet.apply(this, [_posX, _posY, _speedX, _speedY, _range, _target, _parent]);

        this.radius = this.parent.tower.range;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.commitPosition();
        this.alpha = 0.2;

        this.counter = 0;
    };
    pub.GlobeBullet.update = function () {

        this.counter += 1;

        if (this.counter === 2) {
            this.die();
        }
    };
    pub.GlobeBullet.hit = function (_opposition) {
        this.parent.tower.hit += 1;
        this.parent.tower.applyEffects(_opposition);
    };

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));