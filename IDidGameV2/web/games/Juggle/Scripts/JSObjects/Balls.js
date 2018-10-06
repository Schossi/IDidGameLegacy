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

    pub.Ball = RSTools.createObject(pub.DrawableBoxCircle);
    pub.Ball.initBall = function (_gameContext,_posX, _posY, _radius, _pulseX, _pulseY) {
        this.initCircle(_gameContext, _posX, _posY, _radius, "Red", 0);

        this.lineWidth = 2;
        this.strokeStyle = "White";

        this.density = 0.65;
        this.initBoxCircle();

        this.body.tag = this;

        var pos = this.body.GetWorldCenter();
        this.body.ApplyImpulse({ x: _pulseX, y: _pulseY }, pos);
    };

    /*
        pub.DrawableBoxRect.onKeyDown = function (e) {
        var pos=this.body.GetWorldCenter();
    }
    //var pos = this.bodyDef.getPosition();
        //this.iposX = this.bodyDef.position.x * 30;
        //this.iposY = this.bodyDef.position.y * 30;
    
        if (this.up) {
            this.body.ApplyImpulse({ x: 0, y: -1 }, pos);
        }
        if (this.down) {
            this.body.ApplyImpulse({ x: 0, y: 1 }, pos);
        }
        if (this.left) {
            this.body.ApplyImpulse({ x: -1, y: 0 }, pos);
        }
        if (this.right) {
            this.body.ApplyImpulse({ x: 1, y: 0 }, pos);
        } 

                this.gameContext.onKeyDown.push(this);
        
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        this.gameContext.onKeyChange.push({ key: RSTools.Keys.A, action: function (value) { that.left = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.W, action: function (value) { that.up = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.S, action: function (value) { that.down = value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.D, action: function (value) { that.right = value; } });

    */


    return pub;
}(IDIDGAME_Juggle || {}, undefined));