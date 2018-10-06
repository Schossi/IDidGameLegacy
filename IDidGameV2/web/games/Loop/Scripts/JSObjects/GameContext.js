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

        this.wave = RSTools.createObject(pub.Wave);
        this.wave.init(this);
    };
    pub.MainContext.work = function () {
        var i;

        pub.contextOverlay.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        
        pub.GameContext.work.apply(this, []);

        this.collision();

        this.drawUI();
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

    return pub;
}(IDIDGAME_Loop || {}, undefined));