/// <reference path="Effects.js" />
/// <reference path="GameContext.js" />
/// <reference path="Sound.js" />
/// <reference path="UI.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../Main.js" />
/// <reference path="../RSTools.js" />
/// <reference path="Balls.js" />
/// <reference path="Prototypes.js" />

var IDIDGAME_Juggle = (function (pub, undefined) {
    "use strict";

    /*
    
    
    Physics.prototype.collision = function () {
    this.listener = new Box2D.Dynamics.b2ContactListener();
    this.listener.PostSolve = function (contact, impulse) {
        var bodyA = context.GetFixtureA().GetBody().GetUserData(),
            bodyB = context.GetFixtureB().GetBody().GetUserData();
 
        if (bodyA.contact) {
            bodyA.contact(contact, impulse, true)
        }
        if (bodyB.contact) {
            bodyB.contact(contact, impulse, false)
        }
 
    };
    this.world.SetContactListener(this.listener);
};
    
    */

    pub.ballSize = 12;

    pub.Hand = RSTools.createObject(pub.DrawableBoxRect);
    pub.Hand.initHand = function (_gameContext, _posX, _posY, _key,_direction,_ballCount) {
        var that = this;

        this.initRect(_gameContext, _posX - 25, _posY, 50, 20, "Blue", 0);
        this.bodyDevType = Box2D.Dynamics.b2Body.b2_kinematicBody;
        this.initBoxRect();
        
        this.alpha = 0;

        this.sprite = RSTools.createObject(pub.Drawable);
        this.sprite.initDrawable(this.gameContext, this.posX, this.posY - 10, 500, 0, 50, 40, 10);

        this.body.tag = this;

        this.initPosY = this.posY;
        this.initPosX = this.posX;

        this.key = _key;
        this.direction = _direction;
        this.alternate = false;

        this.prevDown = false;
        this.down = false;
        this.downCounter = 0;
        this.sideCounter = 0;
        this.maxSideCounter = 125;

        this.initBallCount = _ballCount;
        this.ballCount = _ballCount;
        this.catchCount = 0;
        this.caughtBalls = 0;
        this.thrownBalls = 0;
        this.Balls = [];

        this.xFactor = 1;
        
        this.keyText = RSTools.createObject(pub.DrawableText);
        this.keyText.initText(this.gameContext, this.posX + 25, this.posY + 45, true,RSTools.getKeyName(this.key), 25, "White", -10);
        //this.keyText.strokeStyle = "White";
        
        this.gameContext.hands.push(this);

        this.gameContext.onKeyChange.push({ key: _key, action: function (value) { that.down = value; } });

        this.gameContext.toUpdate.push(this);
    };
    pub.Hand.draw = function () {
        var i,
            quantity = 0,
            ballPosX = this.posX,
            context = this.gameContext.drawingContext;

        if (this.gameContext.state === pub.GameStates.Throw) {
            quantity = this.ballCount-1;
        } else if (this.gameContext.state === pub.GameStates.Catch || this.gameContext.state==pub.GameStates.Success) {
            quantity = this.caughtBalls;
        }

        if (this.direction < 0) {
            ballPosX += 50;
        }

        ballPosX += 10 * -this.direction;

        context.fillStyle = "Red";
        context.strokeStyle = "White";
        context.lineWidth = 2;
        for (i = 0; i < quantity; i++) {
            context.beginPath();
            context.arc(ballPosX, this.initPosY+30-i*10, 10, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
        }

        pub.DrawableRect.draw.apply(this);
    };
    pub.Hand.Hit=function(body){
        if (!this.ballCount) {
            this.ballCount += 1;

            this.gameContext.BoxDestroyList.push(body);
        }
    }
    pub.Hand.update = function () {
        var pos;

        if (this.prevDown) {
            this.downCounter = Math.min(this.downCounter + 1, 50);
        } else {
            this.downCounter = 0;
        }

        var sideSpeed = 10;
        if (this.ballCount) {
            this.sideCounter = Math.max(this.sideCounter - sideSpeed, 0);
        } else {
            this.sideCounter = Math.min(this.maxSideCounter, this.sideCounter + sideSpeed);
        }

        if (this.sideCounter === this.maxSideCounter) {
            //this.Ball = true;
        }

        this.visualizeCounters();

        //var joint = new Box2D.Dynamics.Joints.b2WeldJointDef();
        //joint.Initialize(body1, body2, { x: 0, y: 0 });

        if (this.ballCount && this.prevDown && this.downCounter > 25 && !this.down && !this.sideCounter) {
            this.thrownBalls += 1;
            this.throwBall();
        }

        if (this.ballCount) {
            this.fillStyle = "Blue";
        } else {
            this.fillStyle = "Green";
        }

        
        if (this.gameContext.state===2) {
            if (this.ballCount && this.prevDown && !this.down) {
                if (this.catchCount < 15) {
                    this.ballCount = 0;
                    this.caughtBalls += 1;
                }
            }

            if (this.prevDown) {
                this.catchCount += 1;
            } else {
                this.catchCount = 0;
            }
        }


        this.prevDown = this.down;

        this.pos = { x: this.centerX / pub.boxscale, y: this.centerY / pub.boxscale };
        this.body.SetPosition(this.pos);

        this.keyText.posX = this.posX + 25;

        this.sprite.posX = this.posX;
        this.sprite.posY = this.posY - 10;

        if (this.ballCount) {
            if (this.direction === 1) {
                this.sprite.spriteX = 550;
            } else {
                this.sprite.spriteX = 500;
            }
        } else {
            if (this.direction === 1) {
                this.sprite.spriteX = 600;
            } else {
                this.sprite.spriteX = 450;
            }
        }

        if (this.side) {
            this.sprite.spriteX += 200;
        }
    };
    pub.Hand.throwBall = function () {
        var ball;

        this.ballCount -= 1;
        ball = RSTools.createObject(pub.Ball);
        ball.initBall(this.gameContext, this.centerX, this.centerY - 50, pub.ballSize, (1.8 / Math.sqrt(this.downCounter)) * this.direction*this.xFactor, -1.8 * (this.downCounter + 30) / 100);

        if (this.alternate) {
            this.direction = this.direction * -1;
        }
    };
    pub.Hand.visualizeCounters = function () {
        this.posY = this.initPosY + this.downCounter / 5;
        this.posX = this.initPosX + this.sideCounter * -this.direction;
    };

    pub.ReverseHand = RSTools.createObject(pub.Hand);
    pub.ReverseHand.visualizeCounters = function () {
        this.posY = this.initPosY + this.downCounter / 5;
        this.posX = this.initPosX + this.sideCounter * this.direction;
    };

    pub.SideHand = RSTools.createObject(pub.Hand);
    pub.SideHand.throwBall = function () {
        var ball;


        this.ballCount -= 1;
        ball = RSTools.createObject(pub.Ball);
        ball.initBall(this.gameContext, this.centerX+50*this.direction, this.centerY , pub.ballSize, this.downCounter/25 * this.direction,0);

    };
    pub.SideHand.visualizeCounters = function () {

        this.side = true;

        this.posX = this.initPosX - this.downCounter / 5 * this.direction;
    };

    return pub;
}(IDIDGAME_Juggle || {}, undefined));