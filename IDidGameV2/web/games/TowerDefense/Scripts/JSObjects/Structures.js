var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
    
    pub.Gate = RSTools.createObject(pub.Drawable);
    pub.Gate.initGate = function () {

        this.initDrawable(275, 498, 0, 550, 50, 25);
        
        this.healthBar = RSTools.createObject(pub.Bar);
        this.healthBar.initBar(0, 30, 50, 10, 100, 1, this);

        pub.toUpdate.push(this);
    };
    pub.Gate.update=function(){
        var i,
            enemy;

        for (i = pub.enemies.length - 1; i >= 0; i--) {
            enemy = pub.enemies[i];

            if (enemy.posY + enemy.height > 500) {
                this.healthBar.value -= enemy.damage;
                enemy.die();
            }
        }

        if (this.healthBar.value <= 0) {
            this.alpha = 0;
            RSTools.createObject(pub.Smoke).init(this.centerX, this.centerY, 1, 20, 50);
            pub.GameOver("Overrun in Night " + (pub.World.currentDay + 1));
        }
    };
    pub.Gate.draw = function () {

        pub.contextMain.globalAlpha = this.alpha;

        if (this.healthBar.value < 75) {
            pub.contextMain.fillStyle = "Red";
        } else {
            pub.contextMain.fillStyle = "Blue";
        }
        pub.contextMain.fillRect(this.posX, this.posY, 15, 25);

        if (this.healthBar.value < 50) {
            pub.contextMain.fillStyle = "Red";
        } else {
            pub.contextMain.fillStyle = "Blue";
        }
        pub.contextMain.fillRect(this.posX+35, this.posY, 15, 25);

        if (this.healthBar.value < 25) {
            pub.contextMain.fillStyle = "Red";
        } else {
            pub.contextMain.fillStyle = "Blue";
        }
        pub.contextMain.fillRect(this.posX+15, this.posY, 20, 25);

        pub.contextMain.globalAlpha = 1;

        pub.Drawable.draw.apply(this);
    };

    pub.Field = RSTools.createObject(pub.Drawable);
    pub.Field.initField = function (x, y) {
        this.score = 5;
        this.cost = 50;
        this.active = true;

        this.initDrawable(x, y, 50, 550, 50, 50, false, true);

        pub.fields.push(this);
    };
    pub.Field.die = function () {
        RSTools.removeFromArray(pub.fields, this);

        pub.toUpdate.push(this);
    };
    pub.Field.update = function () {
        this.alpha -= 0.1;

        if (this.alpha < 0) {
            RSTools.removeFromArray(pub.toUpdate, this);
            this.remove();
        }
    };
    pub.Field.gainScore = function () {
        var text;
        
        if (this.active) {
            text = RSTools.createObject(pub.DrawableText);
            text.initText(this.centerX, this.centerY, true, "+" + this.score, 15, "Yellow");
            text.scroll(0, -1, 20);
            pub.money += this.score;

            pub.sound.coin.request();
        }
    };  
    pub.Field.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);

        pub.Level[this.levelX][this.levelY] = undefined;
    };

    pub.Wall = RSTools.createObject(pub.Drawable);
    pub.Wall.initWall = function (x, y) {
        this.cost = 5;
        this.desc = "Wall";
        this.initDrawable(x, y, 100, 550, 50, 50);
        pub.onMouseUp.push(this);
    };
    pub.Wall.onMouseUp = function () {
        var that = this;

        if (!this.selected && this.active) {
            pub.SetSelectedContextEntry(this);

            pub.onMouseDownAction.push(function (button) {
                if (button === 2) {
                    pub.SetSelectedContextEntry(false);
                    return true;
                }
            });
        }
    }
    pub.Wall.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);

        pub.Level[this.levelX][this.levelY] = undefined;

        pub.pathfinding.update();
        pub.pathfinding.calculate();
    };

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));