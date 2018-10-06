/// <reference path="_references.js" />

var IDIDGAMEPEBBLE = (function (pub, undefined) {
    "use strict";
    var version = '0.0.1',

    contextBackground,

    runLoop = false,

    changeBit = true,

    loopTime,requestFrame,

    //Media
    spriteBackground,

    //dom
    div_gameObject,
    canvas_main, canvas_background, canvas_foreground, canvas_overlay,

    //hoistedFunctions
    loadMedia,
    backgroundLoaded,
    mainLoaded,
    gridLoaded,
    
    initGameObjects,

    drawBoard,drawPrison,drawBorder,

    startLoop,loop,clearMain;

        
    //INPUT
    pub.mouseMove = function (e) {
        var i,
            mouseObj,
             xPos = e.pageX - div_gameObject.offsetLeft,
            yPos = e.pageY - div_gameObject.offsetTop;

        pub.mouseX = e.pageX - div_gameObject.offsetLeft;
        pub.mouseY = e.pageY - div_gameObject.offsetTop;

        if (pub.onMouseMoveAction) {
            for (i = pub.onMouseMoveAction.length-1; i >= 0; i--) {
                if (pub.onMouseMoveAction[i]() === true) {
                    pub.onMouseMoveAction.splice(i, 1);
                }
            }
        }

        if (pub.onMouseEnter) {
            mouseObj = {
                posX: xPos,
                posY: yPos,
                width: 1,
                height: 1
            };

            for (i = 0; i < pub.onMouseEnter.length; i++) {
                if (RSTools.intersects(pub.onMouseEnter[i], mouseObj)) {
                    pub.onMouseEnter[i].onMouseEnter();
                    pub.onMouseLeave.push(pub.onMouseEnter[i]);
                    break;
                }
            }

            for (i = pub.onMouseLeave.length-1; i >=0 ; i--) {
                if (!RSTools.intersects(pub.onMouseLeave[i], mouseObj)) {
                    pub.onMouseLeave[i].onMouseLeave();
                    pub.onMouseLeave.splice(i, 1);
                    break;
                }
            }
        }

    };
    pub.mouseDown = function (e) {
        var i,
            xPosSide, yPosSide,
            xPos, yPos,
             mouseObj, mouseObjSide;

        xPosSide = e.pageX -canvas_main.offsetLeft;
        yPosSide = e.pageY -canvas_main.offsetTop;

        xPos = (xPosSide - 50) / pub.zoom;
        yPos = (550 - (yPosSide)) / pub.zoom;

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        }
        mouseObjSide = {
            posX: xPosSide,
            posY: yPosSide,
            width: 1,
            height: 1
        }


        if (e.button === 2) {
            if (pub.activeButton) {
                pub.activeButton.active = false;
            }
        }

        if (runLoop) {
            for (i = pub.onMouseDownAction.length - 1; i >= 0; i--) {
                if (pub.onMouseDownAction[i](e.button) === true) {
                    pub.onMouseDownAction.splice(i, 1);
                }
            }

            for (i = 0; i < pub.onMouseDown.length; i++) {
                if (pub.onMouseDown[i].side) {
                    if (RSTools.intersects(pub.onMouseDown[i], mouseObjSide)) {
                        pub.onMouseDown[i].onMouseDown();
                        break;
                    }
                } else {
                    if (RSTools.intersects(pub.onMouseDown[i], mouseObj)) {
                        pub.onMouseDown[i].onMouseDown();
                        break;
                    }
                }
            }
        }
    };
    pub.mouseUp = function (e) {
        var i,
            xPosSide, yPosSide,
            xPos, yPos,
             mouseObj, mouseObjSide;

        xPosSide = e.pageX -canvas_main.offsetLeft;
        yPosSide=e.pageY - canvas_main.offsetTop;

        xPos = (xPosSide - 50) / pub.zoom;
        yPos = (550 - (yPosSide)) / pub.zoom;

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        }
        mouseObjSide = {
            posX: xPosSide,
            posY: yPosSide,
            width: 1,
            height: 1
        }

        if (pub.onMouseUpAction) {
            for (i = pub.onMouseUpAction.length - 1; i >= 0; i--) {
                if (pub.onMouseUpAction[i]() === true) {
                    pub.onMouseUpAction.splice(i, 1);
                }
            }
        }

        if (pub.onMouseUp) {
            for (i = 0; i < pub.onMouseUp.length; i++) {
                if (pub.onMouseUp[i].side) {
                    if (RSTools.intersects(pub.onMouseUp[i], mouseObjSide)) {
                        pub.onMouseUp[i].onMouseUp(mouseObjSide.posX, mouseObjSide.posY);
                        break;
                    }
                } else {
                    if (RSTools.intersects(pub.onMouseUp[i], mouseObj)) {
                        pub.onMouseUp[i].onMouseUp();
                        break;
                    }
                }
            }
        }
    };
    pub.key_down = function (e) {
        var key_id = e.keyCode;

        e.preventDefault();
    };
    pub.key_up = function (e) {
        var key_id = e.keyCode;

        e.preventDefault();
    };
    pub.contextMenu = function (e) {
        e.preventDefault();
        return false;
    };

    //INIT
    function init() {

        pub.info = "";

        canvas_main = document.getElementById("canvas_main");
        canvas_background = document.getElementById("canvas_background");
        canvas_foreground = document.getElementById("canvas_foreground");
        canvas_overlay = document.getElementById("canvas_overlay");

        div_gameObject = document.getElementById("div_gameObject");

        pub.contextMain = canvas_main.getContext('2d');
        pub.contextForeground = canvas_foreground.getContext("2d");
        pub.contextSide = canvas_overlay.getContext("2d");
        contextBackground = canvas_background.getContext('2d');

        loadMedia();

        document.addEventListener('keydown', pub.key_down, false);
        document.addEventListener('keyup', pub.key_up, false);

        canvas_overlay.addEventListener('mousedown', pub.mouseDown);
        canvas_overlay.addEventListener('mouseup', pub.mouseUp);
        canvas_overlay.addEventListener('mousemove', pub.mouseMove);
        canvas_overlay.addEventListener('contextmenu', pub.contextMenu);

        pub.toCall = [];

        pub.toDraw = [];
        pub.toCommit = [];
        pub.toUpdate = [];

        pub.onMouseDownAction = [];
        pub.onMouseUpAction = [];
        pub.onMouseMoveAction = [];

        pub.onMouseDown = [];
        pub.onMouseUp = [];
        pub.onMouseEnter = [];
        pub.onMouseLeave = [];

        initGameObjects();
        drawBorder();
        pub.initGame();

        pub.contextMain.translate(50, 550);
        pub.contextSide.translate(600, 0);

        requestFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.moxRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };

    }
    loadMedia = function () {
        var myAudio = document.createElement('audio'),
            canPlayMp3 = !!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/mpeg'),
            canPlayOgg = !!myAudio.canPlayType && "" !== myAudio.canPlayType('audio/ogg; codecs="vorbis"'),
            format;

        if (canPlayMp3) {
            format = ".mp3";
        } else if (canPlayOgg) {
            format = ".ogg";
        }

        pub.spriteMain = new Image();
        pub.spriteMain.onload = mainLoaded;
        pub.spriteMain.src = "Images/PebbleMain.png";

    };
    backgroundLoaded = function () {
        contextBackground.drawImage(spriteBackground, 25, 25, 750, 550, 25, 25,750,550);

        pub.contextForeground.fillStyle = "White";
        pub.contextForeground.fillRect(0, 0, 800, 25);
        pub.contextForeground.fillRect(0, 0, 25, 600);
        pub.contextForeground.fillRect(775, 0, 25, 600);
        pub.contextForeground.fillRect(0, 575, 800, 25);

        pub.contextForeground.font = "10px Arial";
        pub.contextForeground.fillStyle = "black";
        pub.contextForeground.fillText("V" + version + " ©IDidGame.com", 2, 595);

    };
    mainLoaded = function () {
    };
    gridLoaded = function () {
    };


    //LOOP
    startLoop = function () {
        
        runLoop = true;
        loop();
    };
    pub.stopLoop = function () {
        runLoop = false;
    };
    loop = function () {
        var i,
            j;

        loopTime = new Date().getTime() - loopTime;
        loopTime = new Date().getTime();

        clearMain();
        pub.contextMain.scale(pub.zoom, -pub.zoom);

        drawBoard();

        for (i = 0; i < pub.toDraw.length; i++) {
            pub.toDraw[i].draw();
        }

        drawPrison();

        for (i = 0; i < pub.toUpdate.length; i++) {
            pub.toUpdate[i].update();
        }
        pub.contextMain.scale(-1 / pub.zoom, 1 / pub.zoom);

        pub.zoom += (pub.desiredZoom - pub.zoom) / 5;

        if (runLoop) {
            requestFrame(loop);
        }
    };
    
    clearMain = function () {
        pub.contextMain.clearRect(0, 0, 1800, -1600);
        pub.contextSide.clearRect(0, 0, 200, 600);
    };
      
    //Game
    pub.initGame = function () {

        if (pub.pebbles) {
            for (var i = 0; i < pub.pebbles.length; i++) {
                pub.pebbles[i].remove();
            }
        }

        pub.won = false;

        pub.Prison = pub.TempPrison.arr.slice();
        pub.InitialPebbles = pub.TempInitialPebbles.arr.slice();
        pub.ReplicationPattern = pub.TempReplicationPattern.arr.slice();

        pub.Board = RSTools.createObject(RSTools.Array2D);
        pub.Board.init();
        
        pub.pebbles = [];

        pub.gridSizeX = 10;
        pub.gridSizeY = 10;

        pub.zoom = 1;
        pub.desiredZoom = 1;
        pub.initPebbles();
    }
    initGameObjects = function () {
        pub.Prison = [];
        pub.Prison[0] = { x: 0, y: 0 };
        pub.Prison[1] = { x: 1, y: 0 };
        pub.Prison[2] = { x: 0, y: 1 };

        pub.InitialPebbles = [];
        pub.InitialPebbles[0] = { x: 0, y: 0 };
        pub.InitialPebbles[1] = { x: 1, y: 0 };
        pub.InitialPebbles[2] = { x: 0, y: 1 };

        pub.ReplicationPattern = [];
        pub.ReplicationPattern[0] = { x: 1, y: 0 };
        pub.ReplicationPattern[1] = { x: 0, y: 1 };

        pub.TempPrison = RSTools.createObject(pub.TemplateBoard);
        pub.TempPrison.init(pub.Prison.slice(), 180, 0);
        pub.TempInitialPebbles = RSTools.createObject(pub.TemplateBoard);
        pub.TempInitialPebbles.init(pub.InitialPebbles.slice(), 360, 1);
        pub.TempReplicationPattern = RSTools.createObject(pub.TemplateBoard);
        pub.TempReplicationPattern.init(pub.ReplicationPattern.slice(), 540, 2);

        pub.CreateButton = RSTools.createObject(pub.TextButton);
        pub.CreateButton.initButton(20, 550, 160, 40, "Create", pub.initGame);
    };
    
    pub.initPebbles = function () {
        var i, p;

        for (i = 0; i < pub.InitialPebbles.length; i++) {
            p = RSTools.createObject(pub.Pebble);
            p.initPebble(pub.InitialPebbles[i].x, pub.InitialPebbles[i].x, pub.InitialPebbles[i].y, pub.InitialPebbles[i].y);
        }
    }

    drawBorder = function () {
        var i, j, add = 0;

        pub.contextForeground.fillStyle = "White";
        pub.contextForeground.fillRect(0, 0, 50, 600);
        pub.contextForeground.fillRect(0, 0, 600, 50);
        pub.contextForeground.fillRect(550, 0, 50, 600);
        pub.contextForeground.fillRect(0, 550, 600, 50);
        contextBackground.fillStyle = "DarkGray";
        contextBackground.fillRect(600, 0, 200, 600);

        contextBackground.font = "bold 16px Arial";
        contextBackground.fillStyle = "Black";

        //Prison
        contextBackground.fillText("PRISON", 620, 15);
        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                if ((j + add) % 2 === 0) {
                    contextBackground.fillStyle = "Grey";
                } else {
                    contextBackground.fillStyle = "LightGrey";
                }

                contextBackground.fillRect(620 + i * 20, 20 + j * 20, 20, 20);
            }

            if (add === 0) {
                add = 1;
            } else {
                add = 0;
            }
        }
        //Initial Pebbles
        contextBackground.fillStyle = "Black";
        contextBackground.fillText("PEBBLES", 620, 195);
        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                if ((j + add) % 2 === 0) {
                    contextBackground.fillStyle = "Grey";
                } else {
                    contextBackground.fillStyle = "LightGrey";
                }

                contextBackground.fillRect(620 + i * 20, 200 + j * 20, 20, 20);
            }

            if (add === 0) {
                add = 1;
            } else {
                add = 0;
            }
        }
        //ReplicationPattern
        contextBackground.fillStyle = "Black";
        contextBackground.fillText("CLONING PATTERN", 620, 375);
        for (i = 0; i < 8; i++) {
            for (j = 0; j < 8; j++) {
                if ((j + add) % 2 === 0) {
                    contextBackground.fillStyle = "Grey";
                } else {
                    contextBackground.fillStyle = "LightGrey";
                }

                contextBackground.fillRect(620 + i * 20, 380 + j * 20, 20, 20);
            }

            if (add === 0) {
                add = 1;
            } else {
                add = 0;
            }
        }
    }
    drawBoard = function () {
        var i, j, add = 0;
        
        
        for (i = 0; i < pub.gridSizeX; i++) {
            for (j = 0; j < pub.gridSizeY; j++) {
                if ((j+add)%2===0) {
                    pub.contextMain.fillStyle = "Grey";
                } else {
                    pub.contextMain.fillStyle = "LightGrey";
                }

                pub.contextMain.fillRect(i * 50, j * 50, 50, 50);
            }

            if (add === 0) {
                add = 1;
            } else {
                add = 0;
            }
        }
    }
    drawPrison = function () {
        var i,spriteX=0;

        if (pub.won) {
            spriteX = 50;
        }

        pub.contextMain.globalAlpha = 0.5;
        for (i = 0; i < pub.Prison.length; i++) {
            pub.contextMain.drawImage(pub.spriteMain, spriteX, 50, 50, 50, pub.Prison[i].x*50, pub.Prison[i].y*50, 50, 50);
        }
        pub.contextMain.globalAlpha = 1;
    }

    pub.won = false;
    pub.checkForWin = function () {
        var i;

        if (pub.won) {
            return;
        }

        for (i = 0; i < pub.Prison.length; i++) {
            if (pub.Board.get(pub.Prison[i].x, pub.Prison[i].y)) {
                return;
            }
        }

        pub.won = true;
    };
    pub.expandBoard = function () {
        pub.gridSizeX += 1;
        pub.gridSizeY += 1;
        pub.desiredZoom = 10 / pub.gridSizeX;
    }

    //actually Start
    init();
    startLoop();

    return pub;
}(IDIDGAMEPEBBLE || {}, undefined));

