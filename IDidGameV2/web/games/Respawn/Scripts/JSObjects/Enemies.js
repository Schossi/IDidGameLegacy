/// <reference path="../_references.js" />

var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";

    pub.EnemyDirector = function () { };
    pub.EnemyDirector.init = function (_gameContext) {
        this.wave = [];
        this.rails = [];
        this.queuedRails = [];
        this.railpositions = [];
        this.maxRails=4;

        this.initRails();
        this.initBackRails();

        this.currentWave = 0;
        this.availablePoints = 50;
        this.counter = 0;

        this.gameContext=_gameContext;

        this.gameContext.toUpdate.push(this);
    };
    pub.EnemyDirector.initRails = function () {
        var rail, enemy, i;

        this.possibleRails=[];
        this.counter = 0;

        
        //ONE MOVING ONE GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotationSpeed = 5;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 50;
        this.possibleRails.push(rail);
        //ONE STATIC FOUR GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 4;
        enemy.rotationSpeed = 1;
        enemy.posX = 350;
        enemy.speedX = 0;
        rail.templateEnemies.push(enemy);
        rail.score = 75;
        this.possibleRails.push(rail);
        //TWO RANDOM ENEMIES
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotationSpeed = 0;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotationSpeed = 0;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 75;
        //ONE MOVING TWO GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 2;
        enemy.rotationSpeed = 5;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 75;
        this.possibleRails.push(rail);
        //ONE MOVING ONE GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 4;
        enemy.rotationSpeed = 2;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 75;
        this.possibleRails.push(rail);
        //ONE TWO GUN ENEMY TWO ONE GUNS ENEMIES
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.posX = 350;
        enemy.gunCount = 2;
        enemy.rotOffset = -45;
        rail.templateEnemies.push(enemy);

        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.posX = 100;
        enemy.rotOffset = -30;
        rail.templateEnemies.push(enemy);

        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.posX = 600;
        enemy.rotOffset = 30;
        rail.templateEnemies.push(enemy);
        rail.score = 100;
        this.possibleRails.push(rail);
        //THREE TIGHTLY PACKED ENEMIES PER SIDE
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 100;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 120;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 140;
        rail.templateEnemies.push(enemy);

        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 600;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 580;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.posX = 560;
        rail.templateEnemies.push(enemy);
        rail.score = 125;
        this.possibleRails.push(rail);
        //ONE SLOW STRONG ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(50);
        enemy.rotOffset = 20;
        enemy.strength = 2;
        enemy.posX = undefined;
        enemy.speedX = 3;
        rail.templateEnemies.push(enemy);
        rail.score = 125;
        this.possibleRails.push(rail);
        //BARRAGE POINTING OUTWARD
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];

        for (i = 1; i < 4; i++) {
            enemy = RSTools.createObject(pub.RailEnemy);
            enemy.setup(25);
            enemy.posX = 350 - 50 * i;
            enemy.rotOffset = 30;
            rail.templateEnemies.push(enemy);

            enemy = RSTools.createObject(pub.RailEnemy);
            enemy.setup(25);
            enemy.posX = 350 + 50 * i;
            enemy.rotOffset = -30;
            rail.templateEnemies.push(enemy);
        }

        rail.score = 150;
        this.possibleRails.push(rail);
        //ONE MOVING FOUR GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 4;
        enemy.rotationSpeed = 5;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 200;
        this.possibleRails.push(rail);
        //ONE VERY STRONG ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(75);
        enemy.gunCount = 4;
        enemy.strength = 3;
        enemy.rotationSpeed = 5;
        enemy.posX = 350;
        rail.templateEnemies.push(enemy);
        rail.score = 200;
        this.possibleRails.push(rail);
        //TWO STRONG ROTATING ENEMIES
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(50);
        enemy.gunCount = 2;
        enemy.strength = 2;
        enemy.rotationSpeed = 5;
        enemy.posX = 50;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 2;
        enemy.strength = 2;
        enemy.rotationSpeed = 5;
        enemy.posX = 400;
        rail.templateEnemies.push(enemy);
        rail.score = 250;
        this.possibleRails.push(rail);
        //BARRAGE OF STRAIGHT ENEMIES
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        for (i = 0; i < 12; i++) {
            enemy = RSTools.createObject(pub.RailEnemy);
            enemy.setup(25);
            enemy.gunCount = 1;
            enemy.rotationSpeed = 0;
            enemy.posX = 50 + 50 * i;
            enemy.speedX = 0;
            rail.templateEnemies.push(enemy);
        }
        rail.score = 500;
        this.possibleRails.push(rail);
        
    };
    pub.EnemyDirector.initBackRails = function () {
        var rail, enemy;

        this.possibleBackRails = [];

        //ONE MOVING ONE GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotOffset = 180;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 100;
        this.possibleBackRails.push(rail);
        //TWO ONE GUN ENEMIES
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotOffset = 180;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 1;
        enemy.rotOffset = 180;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 150;
        this.possibleBackRails.push(rail);
        //ONE MOVING TWO GUN ENEMY
        rail = RSTools.createObject(pub.Rail);
        rail.templateEnemies = [];
        enemy = RSTools.createObject(pub.RailEnemy);
        enemy.setup(25);
        enemy.gunCount = 2;
        enemy.rotOffset = 180 - 45;
        enemy.posX = undefined;
        enemy.speedX = undefined;
        rail.templateEnemies.push(enemy);
        rail.score = 125;
        this.possibleBackRails.push(rail);
    };
    pub.EnemyDirector.update = function () {
        var i, j;

        if (this.gameContext.Ship.posY > -1000) {
            return;
        }

        for (i = this.wave.length - 1; i >= 0; i--) {
            if (this.wave[i].dead) {
                this.wave.splice(i, 1);
            }
        }

        for (i = this.rails.length-1; i >= 0; i--) {
            if (this.rails[i].deadCounter) {

                if (this.queuedRails.length > 0) {
                    this.queuedRails[0].init(this.gameContext, this.rails[i].railposition);
                    for (j = 0; j < this.queuedRails[0].enemies.length; j++) {
                        this.wave.push(this.queuedRails[0].enemies[j]);
                    }

                    this.rails[i] = this.queuedRails[0];
                    this.queuedRails.splice(0, 1);
                } else {
                    this.rails.splice(i, 1);
                }
            }
        }

        if (this.wave.length == 0) {
            this.newWave();
        }
    };
    pub.EnemyDirector.newWave = function () {
        var points = this.availablePoints,
            rand, i, j,
            loopRail, newRail, enemy;

        if (this.counter < 100) {
            this.counter += 1;
            return;
        }
        this.counter = 0;

        this.currentWave += 1;

        this.wave = [];
        this.rails = [];
        this.queuedRails = [];
        this.railpositions = [];

        //LASERENEMY EVERY 5TH
        if (this.currentWave % 5 === 0) {
            enemy = RSTools.createObject(pub.LaserEnemy);
            enemy.init(this.gameContext, this.gameContext.Ship.posY - 1000, 50, 100);
            this.wave.push(enemy);
        }
        //REGULAR RAILS
        while (points > 30) {
            rand =Math.floor(Math.random() * this.possibleRails.length);
            loopRail = this.possibleRails[rand];
            if (loopRail.score <= points) {
                newRail = RSTools.createObject(loopRail);
                this.queuedRails.push(newRail);
                points -= loopRail.score;
            }
        }
        //ADD FIRST BATCH
        for (i = 0; i < this.queuedRails.length && i<this.maxRails; i++) {
            this.rails[i] = this.queuedRails[i];
            this.rails[i].init(this.gameContext, i);

            for (j = 0; j < this.rails[i].enemies.length; j++) {
                this.wave.push(this.rails[i].enemies[j]);
            }
        }
        this.queuedRails.splice(0, i + 1);
        //ADD BACK RAIL
        if (this.availablePoints >= 500) {
            rand = Math.floor(Math.random() * this.possibleBackRails.length);
            loopRail = this.possibleBackRails[rand];
            loopRail = RSTools.createObject(loopRail);
            loopRail.init(this.gameContext, 10);

            for (j = 0; j < loopRail.enemies.length; j++) {
                this.wave.push(loopRail.enemies[j]);
            }
        }

        this.availablePoints += 50;
    };

    pub.Rail = function () { };
    pub.Rail.init = function (_gameContext,_railposition) {
        var i,enemy, draw;

        this.railposition = _railposition;

        this.gameContext = _gameContext;
        this.draws = [];
        
        draw = RSTools.createObject(pub.Drawable);
        draw.initDrawable(this.gameContext, 0, 0, 500, 520, 20, 20, -400);
        draw.drawParent = this;
        this.draws.push(draw);

        for (i = 0; i < 14; i++) {
            draw = RSTools.createObject(pub.Drawable);
            draw.initDrawable(this.gameContext, 20 + 48 * i, 0, 500, 500, 50, 20, -400);
            draw.drawParent = this;
            this.draws.push(draw);
        }
        
        draw = RSTools.createObject(pub.Drawable);
        draw.initDrawable(this.gameContext, 680, 0, 500, 520, 20, 20, -399);
        draw.drawParent = this;
        this.draws.push(draw);
        
        this.enemies = [];
        for (i = 0; i < this.templateEnemies.length; i++) {
            enemy = RSTools.createObject(this.templateEnemies[i]);
            enemy.init(this);
            this.enemies.push(enemy);
        }
                
        this.posY = this.gameContext.Ship.posY - 1000;
        this.posX = -350;

        this.speedY = 0;
        this.desiredY = -550 + _railposition * 50;

        this.deadCounter = 0;

        this.gameContext.toUpdate.push(this);
    };
    pub.Rail.update = function () {
        var i;

        if (!this.active) {
            if (this.gameContext.Ship.posY - 250 < this.posY) {
                this.active = true;
            } else {
                return;
            }
        }

        if (this.enemies && this.enemies.length === 0) {
            this.deadCounter += 1;

            if (this.deadCounter === 50) {
                RSTools.removeFromArray(this.gameContext.toUpdate, this);

                for (i = 0; i < this.draws.length; i++) {
                    this.draws[i].remove();
                }
            }
            return;
        }

        var currentY = this.posY - this.gameContext.Ship.posY - this.desiredY;


        if (currentY < 0) {
            this.speedY = -currentY / 10;
        } else {
            this.speedY = -currentY / 10;
        }

        this.posY += this.speedY;

    };
    pub.Rail.commitPosition = function () {

    };

    pub.RailEnemy = RSTools.createObject(pub.Drawable);
    pub.RailEnemy.setup=function(_health){
        
        this.dead = false;
        this.speedX = 0;
        this.gunCount =  1;
        this.rotOffset =  0;
        this.rotationSpeed =  0;
        this.posX =  350;
        this.health = _health || 100;
        this.originalHealth = this.health;
    };
    pub.RailEnemy.init = function (_rail) {
        var i, gun;
        
        if (this.posX===undefined) {
            this.posX = 50 + Math.random() * 600;
        }
        if (this.speedX===undefined) {
            this.speedX = Math.random() * 10;
        }

        this.rail = _rail;
        this.initDrawable(_rail.gameContext, this.posX, -5, 0, 300, 30, 30, 0);
        this.initAnimation(30, 0, 2, 30);
        this.rotation = 90;
        this.drawParent = this.rail;

        this.speedY = this.rail.speedY;
        this.counter = 0;

        this.health = 50;

        this.guns = [];
        for (i = 0; i < this.gunCount; i++) {
            gun = RSTools.createObject(pub.Gun);
            gun.init(this, pub.Guntype.enemyDefault, 15, 15);
            gun.irotation = (i+1) * 90+this.rotOffset;
            gun.rotation = gun.irotation;
            gun.coolDown = 10;

            if (this.strength) {
                gun.strength = this.strength;
            }

            this.guns.push(gun);
        }

        this.hitCounter = 0;
        this.dieCounter = 0;

        this.gameContext.enemies.push(this);
        this.gameContext.toUpdate.push(this);
    };
    pub.RailEnemy.update = function () {
        var b,i;

        if (!this.rail.active) {
            return;
        }

        if (this.hitCounter) {
            this.hitCounter -= 1;
            if (!this.hitCounter) {
                this.spriteX = 0;
                this.spriteY = 300;
                this.initAnimation(30, 0, 2, this.animationInterval);
            }
        }

        if (this.health <= 0) {
            this.dieCounter += 1;
            this.speedY = 0;
            this.drawParent = false;
            this.posY -= 10;

            if (this.dieCounter < 5) {
                this.spriteX = 60;
            } else if (this.dieCounter < 20) {
                this.spriteX = 90;
            } else if (this.dieCounter < 40) {
                this.spriteX = 120;
            }else {
                this.remove();
            }
            return;
        }

        this.iposX += this.speedX;
        this.speedY = this.rail.speedY;

        this.rotation += this.rotationSpeed;
        for (i = 0; i < this.guns.length; i++) {
            this.guns[i].rotation = this.guns[i].irotation + this.rotation;
            this.guns[i].firing = true;
        }


        if (this.iposX > 680 || this.iposX<0) {
            this.speedX *= -1;
        }

        if (this.counter > 20) {
            this.energy = 500;
        } else {
            this.counter += 1;
        }
    };
    pub.RailEnemy.remove = function () {
        pub.Drawable.remove.apply(this);
        RSTools.removeFromArray(this.rail.enemies,this);
        RSTools.removeFromArray(this.gameContext.toUpdate, this);
        RSTools.removeFromArray(this.gameContext.enemies, this);
    };
    pub.RailEnemy.hit = function (_bullet) {
        var i, uo;

        if (!this.guns) {
            return;
        }

        pub.sound.laser.request();

        this.health -= _bullet.damage;

        this.animationInterval = 30 - (100 - this.health) / 25;

        this.stopAnimation();
        this.spriteX = 0;
        this.spriteY = 270;
        this.hitCounter = 3;

        if (this.health <= 0 ) {
            for (i = 0; i < this.guns.length; i++) {
                RSTools.removeFromArray(this.gameContext.toUpdate, this.guns[i]);
            }
            this.guns = false;

            this.dead = true;
            this.spriteY = 300;

            this.gameContext.score += this.originalHealth;

            uo = RSTools.createObject(pub.UOExplosion);
            uo.init(this, this.speedY, 4);

            pub.sound.eExplosion.request();
        }
    }

    pub.LaserEnemy = RSTools.createObject(pub.Drawable);
    pub.LaserEnemy.init = function (_gameContext,_posY,_perPauseInterval, _fireInterval) {
        this.initDrawable(_gameContext, -300, _posY, 0, 370, 600, 30, -1);
        this.initAnimation(0, 30, 3, 2);

        this.perPauseInterval = _perPauseInterval;
        this.fireInterval = _fireInterval;

        this.left = RSTools.createObject(pub.LaserSide);
        this.left.initDrawable(this.gameContext, -50, -5, 0, 330, 50, 40, -1);
        this.left.initSide(this);
        this.left.drawParent = this;
        this.right = RSTools.createObject(pub.LaserSide);
        this.right.initDrawable(this.gameContext, 600, -5, 350, 330, 50, 40, -1);
        this.right.initSide(this);
        this.right.drawParent = this;

        this.desiredY = 50;
        this.direction = -2;

        this.counter = 0;
        
        this.deadCounter = 0;

        this.stage = 0;
        this.alpha = 0;

        this.damage = 1;
        this.gameContext.toUpdate.push(this);
    };
    pub.LaserEnemy.update = function () {
        if (this.dead) {
            this.deadCounter += 1;

            if (this.deadCounter === 50) {
                RSTools.removeFromArray(this.gameContext.toUpdate, this);

                this.left.remove();
                this.right.remove();
            }
            return;
        }

        if (this.direction < 0) {
            if (this.gameContext.Ship.posY - this.posY > 200) {
                this.direction *= -1;
            }
        } else {
            if (this.posY > this.gameContext.Ship.posY + 200) {
                this.direction *= -1;
            }
        }

        this.desiredY += this.direction;

        pub.Rail.update.apply(this);

        if (this.active) {
            this.counter += 1;
        }

        switch (this.stage) {
            case 0:
                if (this.counter == this.fireInterval) {
                    this.counter = 0;
                    this.stage = 1;
                    this.alpha = 0;
                    RSTools.removeFromArray(this.gameContext.enemyBullets, this);
                    this.setSprites();

                    pub.sound.eLaser.eff.pause();
                }
                break;
            case 1:
                if (this.counter == this.perPauseInterval) {
                    this.counter = 0;
                    this.stage = 2;
                    this.setSprites();
                }
                break;
            case 2:
                if (this.counter == this.perPauseInterval) {
                    this.counter = 0;
                    this.stage = 3;
                    this.setSprites();
                }
                break;
            case 3:
                if (this.counter == this.perPauseInterval) {
                    this.counter = 0;
                    this.stage = 0;
                    this.alpha = 1;
                    this.gameContext.enemyBullets.push(this);
                    this.setSprites();

                    pub.sound.eLaser.request();
                }
                break;
            default:
                break;
        }
    };
    pub.LaserEnemy.setSprites = function () {
        this.left.spriteX = 50 * this.stage;
        this.right.spriteX = 350 - 50 * this.stage;
    };
    pub.LaserEnemy.die = function () {
        this.dead = true;
        this.gameContext.score += 200;
        RSTools.removeFromArray(this.gameContext.enemyBullets, this);
        this.remove();

        pub.sound.eExplosion.request();
    };
    pub.LaserEnemy.hit = function () {

    };
    
    pub.LaserSide = RSTools.createObject(pub.Drawable);
    pub.LaserSide.initSide = function (_laser) {
        this.laser = _laser;
        this.health = 100;

        this.gameContext.enemies.push(this);
    };
    pub.LaserSide.hit = function (_bullet) {
        var uo;

        pub.sound.laser.request();

        if (!this.laser.dead) {
            this.health -= _bullet.damage;

            if (this.health <= 0) {
                this.laser.die();

                uo = RSTools.createObject(pub.UOExplosion);
                uo.init(this, this.laser.speedY, 5);
            }
        }
    };
    pub.LaserSide.remove = function () {
        pub.Drawable.remove.apply(this);
        RSTools.removeFromArray(this.gameContext.enemies, this);

    };

    pub.UOExplosion = function () { };
    pub.UOExplosion.init = function (_drawable,_speedY,_amount) {
        var i,
            part;

        this.speedY = _speedY;
        this.amount = _amount;
        this.particles = [];
        for (i = 0; i < _amount; i++) {
            part = RSTools.createObject(pub.UOParticle);
            part.init(_drawable);
            part.speedX = Math.random() * 10 - 5;
            part.speedY = _speedY + Math.random() * 4 - 2;

            this.particles.push(part);
        }

        this.gameContext = _drawable.gameContext;
        this.gameContext.toUpdate.push(this);
    };
    pub.UOExplosion.update = function () {
        var i,
            part;

        for (var i = this.particles.length-1; i >= 0; i--) {
            part=this.particles[i];
            part.posY += part.speedY;
            part.speedY += 0.2;
            part.posX += part.speedX;
            part.speedX -= part.speedX / 10;

            if (part.picked || part.posY > this.gameContext.Ship.posY + 200) {
                part.remove();
                RSTools.removeFromArray(this.gameContext.pickups, part);
                this.particles.splice(i, 1);
            }
        }

        if (this.particles.length === 0) {
            RSTools.removeFromArray(this.gameContext.toUpdate);
        }
    };

    pub.UOParticle = RSTools.createObject(pub.Drawable);
    pub.UOParticle.init = function (_drawable) {
        this.initDrawable(_drawable.gameContext, _drawable.posX, _drawable.posY, Math.floor(Math.random() * 5), 250, 10, 10, 0);

        this.gameContext.pickups.push(this);
    };
    pub.UOParticle.hit = function () {
        this.gameContext.Ship.uoShine.alpha = 1;
        this.gameContext.resources += 50;
        this.picked = true;
        pub.sound.fire.request();
        RSTools.removeFromArray(this.gameContext.pickups, this);
    };

    return pub;
}(IDIDGAME_Respawn || {}, undefined));