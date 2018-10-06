/// <reference path="../_references.js" />

var IDIDGAME_Loop = (function (pub, undefined) {
    "use strict";

    pub.Smoke = function () { };
    pub.Smoke.init = function (_gameContext,_xCenter, _yCenter, _speed, _quantity, _framesToLive) {
        var i, draw;

        this.gameContext = _gameContext;

        this.xPos = _xCenter - 15;
        this.yPos = _yCenter - 15;

        this.counter = 0;
        this.quantity = _quantity || 3;
        this.speed = _speed;
        this.framesToLive = _framesToLive || 50;

        this.draws = [];

        for (i = 0; i < this.quantity; i++) {
            draw = RSTools.createObject(pub.Drawable);
            draw.initDrawable(this.gameContext,this.xPos, this.yPos, 0, 220, 30, 30, -250);
            draw.speedX = (Math.random() * _speed * 2) - _speed;
            draw.speedY = (Math.random() * _speed * 2) - _speed;
            this.draws.push(draw);
        }

        this.gameContext.toUpdate.push(this);
    };
    pub.Smoke.update = function () {
        var i, draw;
                
        for (i = 0; i < this.quantity; i++) {
            draw = this.draws[i];

            draw.posX += draw.speedX;
            draw.posY += draw.speedY;

            draw.alpha = 1 - (this.counter / this.framesToLive);
        }

        this.counter += 1;

        if (this.framesToLive <= this.counter) {
            for (i = 0; i < this.quantity; i++) {
                draw = this.draws[i];
                draw.remove();
            }
            RSTools.removeFromArray(this.gameContext.toUpdate, this);
        }
    };

    pub.Disassemble = function () { };
    pub.Disassemble.init = function (_drawable,_xParts,_yParts,_speedX,_speedY,_accelerate,_directionX,_directionY,_frames) {
        var x, y, draw,
            partSizeX = _drawable.width / _xParts, partSizeY = _drawable.height / _yParts,
            pX, pY, sX, sY, cX, cY;

        this.drawable = _drawable;
        this.draws = [];
        this.xParts = _xParts;
        this.yParts = _yParts;

        this.accelerate = _accelerate;
        this.speedX = _speedX || 2;
        this.speedY = _speedY || 2;

        if (!_directionX) {
            _directionX = 0;
        }
        if (!_directionY) {
            _directionY = 0;
        }

        this.counter = 0;
        this.frames = _frames || 100;

        for (x = 0; x < this.xParts; x++) {
            for (y = 0; y < this.yParts; y++) {
                pX = this.drawable.posX + x * partSizeX;
                pY = this.drawable.posY + y * partSizeY;
                sX = this.drawable.spriteX + x * partSizeX;
                sY = this.drawable.spriteY + y * partSizeY;
                cX = this.drawable.width / 2 - x * partSizeX;
                cY = this.drawable.height / 2 - y * partSizeY;

                draw = RSTools.createObject(pub.Drawable);
                draw.initDrawable(_drawable.gameContext, pX, pY, sX, sY, partSizeX, partSizeY, _drawable.zIndex);
                draw.centOffX = cX;
                draw.centOffY = cY;
                draw.speedX = (Math.random() - 0.5 + _directionX) * this.speedX;
                draw.speedY = (Math.random() - 0.5 + _directionY) * this.speedY;

                this.draws.push(draw);
            }
        }

        pub.toUpdate.push(this);
    };
    pub.Disassemble.update = function () {
        var i,draw;

        for (i = 0; i < this.draws.length; i++) {
            draw = this.draws[i];
            draw.posX += draw.speedX;
            draw.posY += draw.speedY;

            if (this.accelerate) {
                draw.speedY += draw.speedY * 0.01;
                draw.speedX += draw.speedX * 0.01;
            } else {
                draw.speedY -= draw.speedY * 0.1;
                draw.speedX -= draw.speedX * 0.1;
            }

            draw.alpha = 1 - ( this.counter/this.frames);
        }

        this.counter += 1;

        if (this.counter === this.frames) {
            RSTools.removeFromArray(pub.toUpdate, this);

            for (i = 0; i < this.draws.length; i++) {
                this.draws[i].remove();
            }
        }
    };

    pub.FadeUnfade = RSTools.createObject(pub.DrawableRect);
    pub.FadeUnfade.init = function (_gameContext, _fadedAction, _unfadedAction, _duration, _color) {
        this.fadedAction = _fadedAction;
        this.unfadedAction = _unfadedAction;

        this.duration = _duration;
        this.counter = 1;
        this.step = (this.duration/100) / 100 + 0.01;

        this.initRect(_gameContext, _gameContext.borderSize, _gameContext.borderSize, pub.canvas_main.width - 2 * _gameContext.borderSize, pub.canvas_main.height - 2 * _gameContext.borderSize, _color || "Black", 500);
        this.nonOffset = true;
        this.alpha = 0;

        this.gameContext.toUpdate.push(this);
    };
    pub.FadeUnfade.update = function () {
        if (this.counter > 0) {
            this.counter += 1;
            this.alpha = Math.min(1, this.alpha + this.step);

            if (this.counter >= this.duration) {
                if (this.fadedAction) {
                    this.fadedAction();

                    if (this.gameContext.toUpdate.indexOf(this) === -1) {
                        this.added = false;
                        this.add();
                        this.gameContext.toUpdate.push(this);
                    }
                }
                this.counter = -1;
            }
        } else {
            this.counter -= 1;
            this.alpha = Math.max(0, this.alpha - this.step);

            if (this.counter <= -this.duration) {
                if (this.unfadedAction) {
                    this.unfadedAction();
                }
                RSTools.removeFromArray(this.gameContext.toUpdate, this);
                this.remove();
            }
        }
    };

    pub.Wave = function () { };
    pub.Wave.init = function (_gameContext) {
        var that = this;

        this.gameContext = _gameContext;
        
        this.scale = pub.selectScale.options[pub.selectScale.selectedIndex].value;

        this.width = (pub.canvas_main.width - this.gameContext.borderSize)  / this.scale;
        this.height = (pub.canvas_main.height - this.gameContext.borderSize)  / this.scale;
        this.zIndex = -500;

        this.gameContext.toUpdate.push(this);
        this.gameContext.toDraw.push(this);

        this.gameContext.onMouseDown.push(this);
        this.gameContext.onMouseUp.push(this);
        /*this.gameContext.onMouseMoveAction.push(function () {
            pub.contextMain.fillStyle = "White";
            pub.contextMain.beginPath();
            pub.contextMain.arc(pub.mouseX, pub.mouseY, 5, 0, 2 * Math.PI, false);
            pub.contextMain.fill();
        });*/

        this.up = true;
        this.down = true;
        this.left = true;
        this.right = true;

        this.acc = false;

        this.fade =  pub.inputFade.value;
        
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.ARR_UP, action: function (value) { that.up = !value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.ARR_DOWN, action: function (value) { that.down = !value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.ARR_LEFT, action: function (value) { that.left = !value; } });
        this.gameContext.onKeyChange.push({ key: RSTools.Keys.ARR_RIGHT, action: function (value) { that.right = !value; } });

        this.getNewImageData = true;
        this.imageData = undefined;

        this.ownCanvas = document.createElement('canvas');
        this.ownCanvas.width = this.width;
        this.ownCanvas.height = this.height;
        this.ownContext = this.ownCanvas.getContext("2d");
        this.ownContext.fillStyle = "Black";
        this.ownContext.fillRect(0, 0, this.width, this.height);


        this.ownContext.imageSmoothingEnabled = false;
        this.ownContext.webkitImageSmoothingEnabled = false;
        this.ownContext.mozImageSmoothingEnabled = false;

        this.gameContext.drawingContext.imageSmoothingEnabled = false;
        this.gameContext.drawingContext.webkitImageSmoothingEnabled = false;
        this.gameContext.drawingContext.mozImageSmoothingEnabled = false;

    };
    pub.Wave.update = function () {
        var pixels,
            numPixels,
            i;

        if (this.getNewImageData) {
            //this.imageData = this.gameContext.drawingContext.getImageData(this.gameContext.borderSize, this.gameContext.borderSize, this.width, this.height);
            this.imageData = this.ownContext.getImageData(0, 0, this.width, this.height);
            this.getNewImageData = false;
        }
        if (this.imageData) {
            pixels = this.imageData.data;
            numPixels = this.imageData.width * this.imageData.height*4;

            for (i = 0; i < numPixels; i+=4) {
                //pixels[i * 4] = 255 - pixels[i * 4]; // Red  
                //pixels[i * 4 + 1] = 255 - pixels[i * 4 + 1]; // Green  
                //pixels[i * 4 + 2] = 255 - pixels[i * 4 + 2]; // Blue  
                
                if (pixels[i] === 255) {
                    if (i < this.width * 4 || i > this.width * this.height * 4 - this.width) {
                       
                    } else if (i % (this.width * 4) === 0 || (i - 4) % (this.width * 4) === 0 || (i + 1) % (this.width * 4) === 0 || (i -3) % (this.width * 4) === 0) {
                       
                    } else {

                        if (this.left) {
                            if (!pixels[i - 4]) {
                                pixels[i - 4] = 254;
                            }
                        }

                        if (this.right) {
                            if (!pixels[i + 4]) {
                                pixels[i + 4] = 254;
                            }
                        }

                        if (this.up) {
                            if (!pixels[i - this.width * 4]) {
                                pixels[i - this.width * 4] = 254;
                            }
                        }

                        if (this.down) {
                            if (!pixels[i + this.width * 4]) {
                                pixels[i + this.width * 4] = 254;
                            }
                        }

                        if (this.up || this.left) {
                            if (!pixels[i - this.width * 4 - 4]) {
                                pixels[i - this.width * 4 - 4] = 254;
                            }
                        }

                        if (this.up || this.right) {
                            if (!pixels[i - this.width * 4 + 4]) {
                                pixels[i - this.width * 4 + 4] = 254;
                            }
                        }

                        if (this.down || this.left) {
                            if (!pixels[i + this.width * 4 - 4]) {
                                pixels[i + this.width * 4 - 4] = 254;
                            }
                        }

                        if (this.down || this.right) {
                            if (!pixels[i + this.width * 4 + 4]) {
                                pixels[i + this.width * 4 + 4] = 254;
                            }
                        }

                        if (this.acc) {
                            if (!pixels[i - 8]) {
                                pixels[i - 8] = 254;
                            }

                            if (!pixels[i + 8]) {
                                pixels[i + 8] = 254;
                            }

                            if (!pixels[i - this.width * 8]) {
                                pixels[i - this.width * 8] = 254;
                            }

                            if (!pixels[i + this.width * 8]) {
                                pixels[i + this.width * 8] = 254;
                            }
                        }

                        if (this.acc) {
                            pixels[i + 1] = pixels[i]; // Green
                            //pixels[i + 2] = pixels[i]; // Blue    
                        }
                    }
                }

                if (pixels[i] === 254) {
                    
                }else if (pixels[i]) {
                    if (pixels[i] > this.fade) {
                        pixels[i] -= this.fade; // Red
                    } else {
                        pixels[i] = 0; // Red
                    }

                    if (this.acc) {
                        pixels[i + 1] = pixels[i]; // Green
                        //pixels[i + 2] = pixels[i]; // Blue    
                    }
                } else if (!this.acc && pixels[i + 2] > this.fade) {
                    pixels[i + 2] -= this.fade;
                }

            };
            
            for (i = 0; i < numPixels; i += 4) {
                if (pixels[i + 1] === 255) {
                    pixels[i] = 0;
                }else if (pixels[i] === 254) {
                    pixels[i] = 255;//Red

                    //pixels[i + 1] = pixels[i]; // Green
                    //pixels[i + 2] = pixels[i]; // Blue    
                }
            }

            this.ownContext.putImageData(this.imageData, 0, 0);

            this.gameContext.drawingContext.scale(this.scale, this.scale);
            this.gameContext.drawingContext.drawImage(this.ownCanvas, this.gameContext.borderSize/this.scale, this.gameContext.borderSize/this.scale);
            this.gameContext.drawingContext.scale(1 / this.scale, 1 / this.scale);
        }
    };
    pub.Wave.draw = function () {
        /*if (this.map[0]) {
            pub.contextMain.drawImage(this.buffer, 0, 0);
        }*/
    };
    pub.Wave.onMouseDown = function (_button) {
        if (_button === 0) {
            this.gameContext.toCall.push(function () {
                pub.MainContext.wave.ownContext.fillStyle = "rgba(255,255,255,255)";
                pub.MainContext.wave.ownContext.fillRect((pub.mouseX - pub.MainContext.borderSize) / pub.MainContext.wave.scale -1, (pub.mouseY - pub.MainContext.borderSize) / pub.MainContext.wave.scale-1, 2, 2);

                //pub.MainContext.wave.ownContext.beginPath();
                //pub.MainContext.wave.ownContext.arc((pub.mouseX-pub.MainContext.borderSize) / pub.MainContext.wave.scale, (pub.mouseY-pub.MainContext.borderSize) / pub.MainContext.wave.scale, 4, 0, 2 * Math.PI, false);
                //pub.MainContext.wave.ownContext.fill();
                pub.MainContext.wave.getNewImageData = true;
                pub.MainContext.wave.acc = true;
                return true;
            });
        } else {
            this.gameContext.toCall.push(function () {
                pub.contextMain.fillStyle = "rgba(0,255,0,255)";
                pub.contextMain.beginPath();
                pub.contextMain.arc(pub.mouseX, pub.mouseY, 10, 0, 2 * Math.PI, false);
                pub.contextMain.fill();
                pub.MainContext.wave.getNewImageData = true;
                return true;
            });
        }
    };
    pub.Wave.onMouseUp = function () {
        pub.MainContext.wave.acc = false;
    };

    return pub;
}(IDIDGAME_Loop || {}, undefined));