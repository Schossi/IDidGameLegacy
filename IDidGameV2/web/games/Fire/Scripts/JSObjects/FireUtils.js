/// <reference path="../Main.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../RSTools.js" />
/// <reference path="GameContext.js" />
/// <reference path="Effects.js" />
/// <reference path="Prototypes.js" />
/// <reference path="Sound.js" />
/// <reference path="FireUtils.js" />
/// <reference path="UI.js" />

var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    
    pub.UI = function () { };
    pub.UI.initUI = function (_gameContext) {
        var i;

        this.gameContext = _gameContext;
        this.elements = [];

        this.posX = (800 + pub.width * pub.blockSize) / 2 + 20;
        this.posY = 0;

        this.nextBack = RSTools.createObject(pub.Drawable);
        this.nextBack.initDrawable(this.gameContext, -pub.pxWidth - 240, 150, 180, 100, 180, 300, 100);
        this.elements.push(this.nextBack);

        this.powerRect = RSTools.createObject(pub.DrawableRect);
        this.powerRect.initRect(this.gameContext, this.nextBack.posX + 20, this.nextBack.posY + 189, 0, 25, "Green", 100);
        this.powerRect.alpha = 0.8;
        this.elements.push(this.powerRect);

        this.levelRect = RSTools.createObject(pub.DrawableRect);
        this.levelRect.initRect(this.gameContext, this.nextBack.posX + 20, this.nextBack.posY + 189 + 65, 0, 25, "Green", 100);
        this.levelRect.alpha = 0.8;
        this.elements.push(this.levelRect);

        this.back = RSTools.createObject(pub.Drawable);
        this.back.initDrawable(this.gameContext, 20, 150, 0, 100, 180, 300, 100);
        this.elements.push(this.back);

        this.textOff = 155;
        this.textinc = 80;
        this.textSize = 38;


        this.levelText = RSTools.createObject(pub.DrawableText);
        this.levelText.initText(this.gameContext, this.nextBack.posX + 90, this.nextBack.posY + 190 + 78, true, "0", 26, "White", 110);
        this.elements.push(this.levelText);

        this.scoreText = RSTools.createObject(pub.DrawableText);
        this.scoreText.initText(this.gameContext, 110, this.textOff + this.textinc, true, "0", this.textSize, "White", 110);
        this.scoreText.strokeStyle = "Black";
        this.elements.push(this.scoreText);

        this.linesText = RSTools.createObject(pub.DrawableText);
        this.linesText.initText(this.gameContext, 110, this.textOff + this.textinc * 2, true, "0", this.textSize, "White", 110);
        this.linesText.strokeStyle = "Black";
        this.elements.push(this.linesText);

        this.timeText = RSTools.createObject(pub.DrawableText);
        this.timeText.initText(this.gameContext, 110, this.textOff + this.textinc * 3, true, "0", this.textSize, "White", 110);
        this.timeText.strokeStyle = "Black";
        this.elements.push(this.timeText);

        for (i = 0; i < this.elements.length; i++) {
            this.elements[i].drawParent = this;
        }

        this.initGarbage();

        this.gameContext.toUpdate.push(this);
        this.gameContext.addToDraw(this, 100);
    };
    pub.UI.initGarbage = function () {
        var i, backTile,
            leftRand, lastLeftRand,
            rightRand,lastRightRand,
            tiles = 3;

        for (i = 0; i < 18; i++) {

            while (leftRand === lastLeftRand) {
                leftRand = RSTools.getRandomInt(tiles);
            }
            lastLeftRand = leftRand;

            //Left
            backTile = RSTools.createObject(pub.Drawable);
            backTile.initDrawable(this.gameContext, -50, 20 + i * 35, 400, 100 + 50 * leftRand, 300, 50, -10);

            while (rightRand === lastRightRand) {
                rightRand = RSTools.getRandomInt(tiles);
            }
            lastRightRand = rightRand;

            //Right
            backTile = RSTools.createObject(pub.Drawable);
            backTile.initDrawable(this.gameContext, 550, 20 + i * 35, 400, 100 + 50 * rightRand, 300, 50, -10);
        }

        //Bottom
        backTile = RSTools.createObject(pub.Drawable);
        backTile.initDrawable(this.gameContext, 150, 590, 400, 100 + 50 * RSTools.getRandomInt(tiles), 300, 50, -20);
        backTile = RSTools.createObject(pub.Drawable);
        backTile.initDrawable(this.gameContext, 350, 590, 400, 100 + 50 * RSTools.getRandomInt(tiles), 300, 50, -20);
    };
    pub.UI.commitPosition = function () {

    };
    pub.UI.draw = function () {
        if (pub.fire && pub.fire.nextSet) {
            pub.fire.nextSet.setAllBlocks(function () {
                this.draw();
            });
        }
    };
    pub.UI.update = function () {
        var mins, seks;

        if (pub.fire) {
            this.scoreText.text = pub.fire.score;
            this.linesText.text = pub.fire.lines;
            this.timeText.text = RSTools.formatDuration(pub.fire.time * 1000);
            this.levelText.text = pub.fire.level;
            this.levelRect.width = 140 * (pub.fire.levelCounter / pub.fire.maxLevelCounter);
            this.powerRect.width = 140 * (pub.fire.power / pub.fire.maxPower);

            if (pub.fire.power < pub.fire.maxPower / 2) {
                this.powerRect.fillStyle = "Red";
            } else if (pub.fire.power < pub.fire.maxPower) {
                this.powerRect.fillStyle = "Orange";
            } else {
                this.powerRect.fillStyle = "Green";
            }
        }
    };

    pub.Counter = function () { };
    pub.Counter.initCounter = function (_interval) {
        this.interval = _interval;
        this.counter = 0;
        this.speed = 1;
        this.triggered = false;
        this.active = true;
    };
    pub.Counter.update = function () {
        if (!this.active) {
            return;
        }

        if (this.counter >= this.interval) {
            this.triggered = true;
        } else {
            this.counter += 1;
        }
    }
    pub.Counter.reset = function () {
        this.counter = 0;
        this.triggered = false;
        this.active = true;
    };

    pub.Score = RSTools.createObject(pub.DrawableText);
    pub.Score.initScore = function (_gameContext, _posX, _posY, _amount) {
        this.initText(_gameContext, _posX + 10, _posY + 10, true, "+" + _amount, 10, "White", 100);
        this.alpha = 0.6;
        this.gameContext.toUpdate.push(this);
        this.counter = 0;
    };
    pub.Score.update = function () {

        if (this.counter < 8) {
            this.size += 1;
        } else if (this.counter < 18) {
            this.posY -= 1;
            this.alpha -= 0.05;
        } else {
            this.remove();
            return true;
        }

        this.counter += 1;
    };

    pub.CloudSpawner = function () { };
    pub.CloudSpawner.initSpawner = function (_gameContext,_amount) {
        var i;

        this.gameContext = _gameContext;
        this.amount = _amount;

        this.clouds = [];

        for ( i = 0; i < _amount; i++) {
            this.addCloud(false);
        }

        this.gameContext.toUpdate.push(this);
    };
    pub.CloudSpawner.addCloud = function (_outside) {
        var cloud,
            left = Math.random() > 0.5,
            posX = Math.random() * 800,
            posY = Math.random() * 400 - 50,
            spriteX = RSTools.getRandomInt(4) * 200,
            distance = 1 - Math.random(),
            speed = -1;

        if (left) {
            speed = 1;
        }

        if (_outside) {
            if (left) {
                posX = -200;
            } else {
                posX = 800;
            }
        }

        speed *= distance;

        cloud = RSTools.createObject(pub.Drawable);
        cloud.initDrawable(this.gameContext, posX, posY, spriteX, 405, 200, 150, -10 + distance);
        cloud.drawHeight = cloud.height * distance;
        cloud.drawWidth = cloud.width * distance;
        cloud.speed = speed;

        this.clouds.push(cloud);
    };
    pub.CloudSpawner.update = function () {
        var i,
            cloud;

        for ( i = this.clouds.length-1; i >=0; i--) {
            cloud = this.clouds[i];
            cloud.posX += cloud.speed;

            if (cloud.posX > 800 || cloud.posX < -200) {
                this.clouds.splice(i, 1);
                this.addCloud(true);
            }
        }
    };
    
    pub.Highscore = function () { };
    pub.Highscore.initScore = function () {
        var i,
            anyScores = false,
            loopScore, splitScore;

        this.scores = [];

        for (i = 0; i < 10; i++) {
            loopScore = pub.getStoredValue("ITScore" + i);
            if (loopScore && loopScore.indexOf("|") > 0) {
                splitScore = loopScore.split("|");
                this.scores.push({ name: splitScore[0], score: splitScore[1] });
            } else {
                this.scores.push({ score: 0, name: "" });
            }

            if (loopScore) {
                anyScores = true;
            }
        }

        if (anyScores === false) {
            this.setScore(49788, "Schossi");
            this.setScore(31515, "Schossi");
            this.setScore(12107, "Schossi");
        }
    };
    pub.Highscore.setScore = function (_score, _name) {
        var i,score;

        i = this.getHighscorePosition(_score);

        if (i >= 0) {
            this.scores.splice(i, 0, { score: _score, name: _name });
            this.scores.splice(10, 1);

            for (i = 0; i < 10; i++) {
                score=this.scores[i];
                if (score.name !== "") {
                    pub.setStoredValue("ITScore" + i, score.name + "|" + score.score);
                }
            }

            if (pub.SkyContext) {
                pub.SkyContext.refreshHighScores();
            }
            return true;
        }
        return false;
    };
    pub.Highscore.getHighscorePosition = function (_score) {
        var i;

        for (i = 0; i < 10; i++) {
            if (_score > this.scores[i].score) {
                return i;
            }
        }
        return -1;
    };

    pub.Textbox = function () { };
    pub.Textbox.initTextbox = function (_gameContext, _posX, _posY, _size, _maxLength) {

        this.gameContext = _gameContext;

        this.blinkCounter = RSTools.createObject(pub.Counter);
        this.blinkCounter.initCounter(15);

        this.displayText = RSTools.createObject(pub.DrawableText);
        this.displayText.initText(this.gameContext, _posX, _posY, false, "", _size, "White", 20);
        this.displayText.font = "Consolas";

        this.displayBack = RSTools.createObject(pub.DrawableRect);
        this.displayBack.initRect(this.gameContext, _posX - 8, _posY - 18, _maxLength * 20, 40, "Black", 19);
        this.displayBack.alpha = 0.3;

        this.maxLength = _maxLength;
        this.text = "";
        this.blinkOn = false;

        this.acceptableKeys = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

        this.gameContext.onKeyDown.push(this);
        this.gameContext.toUpdate.push(this);
    };
    pub.Textbox.update = function () {
        this.blinkCounter.update();
        
        if (this.blinkCounter.triggered) {
            this.blinkCounter.reset();

            this.blinkOn = !this.blinkOn;

            if (this.blinkOn && this.text.length<this.maxLength) {
                this.displayText.text = this.text + "|";
            } else {
                this.displayText.text = this.text;
            }
        }
    };
    pub.Textbox.onKeyDown = function (_args) {
        var keyName = RSTools.getKeyName(_args.keyCode);

        if (this.text.length<this.maxLength && this.acceptableKeys.indexOf(keyName) >= 0) {
            this.text += keyName;
        } else if (_args.keyCode == RSTools.Keys.BACKSPACE && this.text.length > 0) {
            this.text = this.text.slice(0, this.text.length - 1);
        }
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));