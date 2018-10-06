/// <reference path="../_references.js" />

var IDIDGAME_Loop = (function (pub, undefined) {
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

        //e.preventDefault();
    };
    pub.GameContext.key_up = function (e) {
        var key_id = e.keyCode,
            i;

        for (i = 0; i < this.onKeyChange.length; i++) {
            if (this.onKeyChange[i].key === key_id) {
                this.onKeyChange[i].action(false);
            }
        }

        //e.preventDefault();
    };

    pub.MainContext = RSTools.createObject(pub.GameContext);
    pub.MainContext.init = function (_drawingContext) {
        var i, draw;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.borderSize = 20;

        this.drawOver = true;

        this.PixArray = RSTools.createObject(pub.PxArr);
        this.PixArray.init(600, 600);

        
        this.K1 = RSTools.createObject(pub.Kurve);
        this.K1.init(this,1, "Red", RSTools.Keys.A, RSTools.Keys.S);
        
        this.K2 = RSTools.createObject(pub.Kurve);
        this.K2.init(this,2, "Blue", RSTools.Keys.K, RSTools.Keys.L);

    };
    pub.MainContext.work = function () {
        var i;

        pub.contextOverlay.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        

        if (this.K1.dead) {
            pub.contextOverlay.font = "bold 30px Arial";
            pub.contextOverlay.fillStyle = "White";
            pub.contextOverlay.fillText("Blue wins", 300, 300);
        } else if (this.K2.dead) {
            pub.contextOverlay.fillStyle = "White";
            pub.contextOverlay.font = "bold 30px Arial";
            pub.contextOverlay.fillText("Red wins", 300, 300);
        } else {
            pub.GameContext.work.apply(this, []);
        }
        this.drawUI();

        pub.globalSpeedFactor += 0.0001;

    };
    pub.MainContext.collision = function () {
        
    };
    pub.MainContext.drawUI = function () {
        var i;

        pub.contextOverlay.fillStyle = "White";
        pub.contextOverlay.fillRect(0, 0, pub.canvas_main.width, this.borderSize);
        pub.contextOverlay.fillRect(0, 0, this.borderSize, pub.canvas_main.height);
        pub.contextOverlay.fillRect(pub.canvas_main.width - this.borderSize, 0, this.borderSize, pub.canvas_main.height);
        pub.contextOverlay.fillRect(0, pub.canvas_main.height - this.borderSize, pub.canvas_main.width, this.borderSize);
    };
    
    pub.SoundSliderContext = RSTools.createObject(pub.GameContext);
    pub.SoundSliderContext.init = function (_drawingContext) {

        this.drawOver = true;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        //this.volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        //this.volumeEffectSlider.initButton(this, 535, 580, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume);
        //this.volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        //this.volumeMusicSlider.initButton(this, 680, 580, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume);

    };

    pub.globalSpeedFactor = 1;
    
    pub.PxArr = function () { };
    pub.PxArr.init = function (_width, _height) {
        this.width = _width;
        this.height = _height;

        this.arr = new Int8Array(_width * _height);
    };
    pub.PxArr.setCircle = function (_index,_x,_y,_radius) {
        var i, j,
            pix,
            offx, offy, offi, offj,
            added=0,
            currentIndex;

        _radius -= 1;

        _x = Math.round(_x);
        _y = Math.round(_y);

        for (i = _x - _radius; i <= _x + _radius; i++) {
            for (j = _y - _radius; j <= _y + _radius; j++) {

                if (i > this.width || j > this.height || i<0 || j<0) {
                    return false;
                }

                offi = i - _x;
                offj = j - _y;

                offi *= offi;
                offj *= offj;

                //if (offi + offj < _radius * _radius) {
                    currentIndex= this.arr[Math.round(i * this.width + j)];

                    if(currentIndex===0){
                        this.arr[Math.round(i * this.width + j)] = _index;
                        added += 1;
                    }else if(currentIndex!=_index){
                        return false;
                    }
                //}
            }
        }

        if (added) {
            return true;
        } else {
            return false;
        }
    };


    pub.Kurve = RSTools.createObject(pub.DrawableCircle);
    pub.Kurve.init = function (_gameContext,_index, _color, _lKey, _rKey) {
        var initX, initY,
            that = this;

        initX = pub.canvas_main.clientWidth / 2;
        initY = pub.canvas_main.clientHeight / 2;

        initX += initX * Math.random() - initX / 2;
        initY += initY * Math.random() - initY / 2;
        
        this.initCircle(_gameContext, initX, initY, 3, _color, 0);

        this.left = false;
        this.right = false;

        this.pindex=_index;

        this.direction = Math.random() * 360;
        this.speed = 2;
        this.turnSpeed = 5;

        this.gap = false;
        this.gapCounter = 500*Math.random();

        this.dead = false;


        this.gameContext.onKeyChange.push({ key: _lKey, action: function (value) { that.left = value; } });
        this.gameContext.onKeyChange.push({ key: _rKey, action: function (value) { that.right = value; } });

        this.gameContext.toUpdate.push(this);
    };
    pub.Kurve.update = function () {
        var vDir;

        if (this.dead) {
            return;
        }

        if (this.left) {
            this.direction -= this.turnSpeed;
        }else if (this.right) {
            this.direction += this.turnSpeed;
        }

        vDir = RSTools.angleToVector(this.direction)

        this.centerX += vDir.x * this.speed * pub.globalSpeedFactor;
        this.centerY += vDir.y * this.speed * pub.globalSpeedFactor;

        if (!this.gap) {
            if (!this.gameContext.PixArray.setCircle(this.pindex, this.centerX, this.centerY, this.radius)) {
                this.dead = true;
            }
        }

        if(this.gapCounter<=0)        {
            if (this.gap) {
                this.gap = false;
                this.alpha = 1;
                this.gapCounter = 100 + 200 * Math.random();
            } else {
                this.gap = true;
                this.alpha = 0;
                this.gapCounter = 15;
            }
        }
        this.gapCounter -= 1;

    };


    return pub;
}(IDIDGAME_Loop || {}, undefined));