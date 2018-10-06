/// <reference path="_references.js" />

var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
    var version = '0.4.0',

    contextBackground,

    gsLoading = 0, gsMenu = 10, gsGame = 20, gsPaused = 30, gsTransition = 40,gsGameOver=50,
    gameState = gsLoading,

    startTransition,transitionCounter,
    transitionMidAction,transitionEndAction,

    mouseControlled = false,

    borderSize = 0,

    runLoop = false,

    mute = true,
    paused = false,
    changeBit = true,

    loopTime,
    requestFrame,

    //Media
    spriteBackground,spriteMenu,
    effect_wall,
    effect_paddle,

    //dom
    div_gameObject,
    x,
    y,
    canvas_main,canvas_background,canvas_foreground,canvas_overlay,
    span_fps,span_status,

    //hoistedFunctions
    volumeChanged,
    volumeEffectSlider,volumeMusicSlider,
    loadMedia,loadedMedia=0,
    backgroundLoaded,menuLoaded,mainLoaded,gridLoaded,

    voidTower, buildTower, buildField, buildWall,

    towerButton, fieldButton, wallButton,

    fieldCostText, wallCostText, towerCostText, bankText,

    draw_dangerDay, draw_dangerNight, gate,

    towerNameText,
    dayText,

    initMenu,

    initGame,initGameOver,
    initGameObjects, initLevelArray, initBuildMenu, initContextMenu, initWorld,

    updateContextMenu,
    buildButtons,

    switchTowerPart,
    fadeOutMoving, fadeInMoving,

    fadeToNight, fadeToDay,
    startNight, startDay,

    startButton,

    startLoop,
    loop,gameLoop,menuLoop,gameOverLoop,
    clearMain;
        
    //INPUT
    pub.mouseMove = function (e) {
        var i,
            mouseObj,
             xPos = e.pageX -canvas_main.offsetLeft,
            yPos = e.pageY - canvas_main.offsetTop;

        pub.mouseX = e.pageX - canvas_main.offsetLeft;
        pub.mouseY = e.pageY - canvas_main.offsetTop;

        x.innerHTML = pub.mouseX;
        y.innerHTML = pub.mouseY;

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
        var xPos = e.pageX -canvas_main.offsetLeft,
            yPos = e.pageY - canvas_main.offsetTop,
            i,
            mouseObj;

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

            mouseObj = {
                posX: xPos,
                posY: yPos,
                width: 1,
                height: 1
            };
            for (i = 0; i < pub.onMouseDown.length; i++) {
                if (RSTools.intersects(pub.onMouseDown[i], mouseObj)) {
                    pub.onMouseDown[i].onMouseDown(e.button);
                    break;
                }
            }
        }
    };
    pub.mouseUp = function (e) {
        var i,
            xPos = e.pageX -canvas_main.offsetLeft,
            yPos = e.pageY - canvas_main.offsetTop,
             mouseObj;

        mouseObj = {
            posX: xPos,
            posY: yPos,
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
                if (RSTools.intersects(pub.onMouseUp[i], mouseObj)) {
                    pub.onMouseUp[i].onMouseUp();
                    break;
                }
            }
        }
    };
    pub.key_down = function (e) {
        var key_id = e.keyCode;

        if (key_id === 32) {
            if (gameState === gsGame) {
                gameState = gsPaused;

                if (pub.sound.currentTrack) {
                    pub.sound.currentTrack.eff.pause();
                }
            } else if (gameState === gsPaused) {
                gameState = gsGame;

                if (pub.sound.currentTrack) {
                    pub.sound.currentTrack.eff.play();
                }
            }
        }

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

        x = document.getElementById("x");
        y = document.getElementById("y");

        pub.info = "";

        canvas_main = document.getElementById("canvas_main");
        canvas_background = document.getElementById("canvas_background");
        canvas_foreground = document.getElementById("canvas_foreground");
        canvas_overlay = document.getElementById("canvas_overlay");

        div_gameObject = document.getElementById("div_gameObject");

        span_fps = document.getElementById("span_fps");
        span_status = document.getElementById("span_status");

        pub.contextMain = canvas_main.getContext('2d');
        pub.contextForeground = canvas_foreground.getContext("2d");
        pub.contextOverlay = canvas_overlay.getContext("2d");
        contextBackground = canvas_background.getContext('2d');

        loadMedia();

        document.addEventListener('keydown', pub.key_down, false);
        document.addEventListener('keyup', pub.key_up, false);

        canvas_overlay.addEventListener('mousedown', pub.mouseDown);
        canvas_overlay.addEventListener('mouseup', pub.mouseUp);
        //canvas_overlay.addEventListener('mouseout', pub.mouseUp);
        canvas_overlay.addEventListener('mousemove', pub.mouseMove);
        canvas_overlay.addEventListener('contextmenu', pub.contextMenu);

        pub.towerMinX = 25;
        pub.towerMaxX = 575;
        pub.towerMinY = 100;
        pub.towerMaxY = 500;
        
        requestFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.moxRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };

    }
    initMenu = function () {
        var i, but;
        
        pub.contextForeground.clearRect(0, 0, 800, 600);
        contextBackground.clearRect(0, 0, 800, 600);

        contextBackground.drawImage(spriteMenu, 25, 25, 750, 550, 25, 25, 750, 550);

        pub.contextForeground.fillStyle = "White";
        pub.contextForeground.fillRect(0, 0, 800, 25);
        pub.contextForeground.fillRect(0, 0, 25, 600);
        pub.contextForeground.fillRect(775, 0, 25, 600);
        pub.contextForeground.fillRect(0, 575, 800, 25);

        pub.contextForeground.font = "10px Arial";
        pub.contextForeground.fillStyle = "black";
        pub.contextForeground.fillText("V" + version + " ©IDidGame.com", 2, 595);

        pub.toCall = [];

        pub.toDraw = [];
        pub.toCommit = [];
        pub.toDrawForeground = [];
        pub.toUpdate = [];
        pub.toAnimate = [];
        pub.toClick = [];

        pub.onMouseDownAction = [];
        pub.onMouseUpAction = [];
        pub.onMouseMoveAction = [];

        pub.onMouseDown = [];
        pub.onMouseUp = [];
        pub.onMouseEnter = [];
        pub.onMouseLeave = [];

        pub.Worlds = pub.GetWorlds();

        but = RSTools.createObject(pub.DrawableText);
        but.initText(400, 155, true, "IDG TowerDefense", 50, "Black", 2);

        for (i = 0; i < pub.Worlds.length; i++) {
            but = RSTools.createObject(pub.TextButton);
            but.initButton(300, 200 + 100 * i, 200, 50, pub.Worlds[i].desc, function () {
                var w = pub.Worlds[i];
                return function () {
                    startTransition(function () {
                        initGame(w);
                        gameLoop();
                    }, function () {
                        gameState = gsGame;
                    })
                };
            }());
            but.background.draw();
        }

        gameState = gsMenu;
        
        volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        volumeEffectSlider.initButton(500, 578, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume, 2);
        volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        volumeMusicSlider.initButton(675, 578, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume, 2);
    }
    initGame = function (_world) {
        pub.World = _world;
        
        pub.contextForeground.clearRect(0, 0, 800, 600);
        contextBackground.clearRect(0, 0, 800, 600);

        contextBackground.drawImage(spriteBackground, 25, 25, 750, 550, 25, 25, 750, 550);

        pub.contextForeground.fillStyle = "White";
        pub.contextForeground.fillRect(0, 0, 800, 25);
        pub.contextForeground.fillRect(0, 0, 25, 600);
        pub.contextForeground.fillRect(775, 0, 25, 600);
        pub.contextForeground.fillRect(0, 575, 800, 25);

        pub.contextForeground.font = "10px Arial";
        pub.contextForeground.fillStyle = "black";
        pub.contextForeground.fillText("V" + version + " ©IDidGame.com", 2, 595);

        pub.toCall = [];

        pub.toDraw = [];
        pub.toCommit = [];
        pub.toDrawForeground = [];
        pub.toUpdate = [];
        pub.toAnimate = [];
        pub.toClick = [];
        pub.towers = [];
        pub.enemies = [];
        pub.fields = [];
        pub.bullets = [];

        pub.homeBase = [];

        pub.voidTower = RSTools.createObject(pub.Tower);
        pub.voidTower.initTower(0, 0);

        pub.onMouseDownAction = [];
        pub.onMouseUpAction = [];
        pub.onMouseMoveAction = [];

        pub.onMouseDown = [];
        pub.onMouseUp = [];
        pub.onMouseEnter = [];
        pub.onMouseLeave = [];
        
        initLevelArray();
        initWorld();
        initBuildMenu();
        initContextMenu();
        initGameObjects();

        pub.displayMoney = 0;

        for (var i = 0; i < pub.toDrawForeground.length; i++) {
            pub.toDrawForeground[i].draw();
        }

        pub.pathfinding = new pub.AStartGrid(11, 8, 5, 0, 5, 7);
        pub.pathfinding.calculate();

        volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        volumeEffectSlider.initButton(500, 578, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume, 2);
        volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        volumeMusicSlider.initButton(675, 578, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume, 2);

        pub.sound.day.play();
    }
    pub.GameOver = function (_text) {
        if (gameState === gsGame) {
            pub.gameOverText = _text;
            startTransition(initGameOver, function () {
                gameState = gsGameOver;
            });
        }
    };
    initGameOver = function () {
        var but, rec, tex;

        pub.contextForeground.clearRect(0, 0, 800, 600);
        contextBackground.clearRect(0, 0, 800, 600);

        contextBackground.drawImage(spriteMenu, 25, 25, 750, 550, 25, 25, 750, 550);

        pub.toCall = [];

        pub.toDraw = [];
        pub.toCommit = [];
        pub.toDrawForeground = [];
        pub.toUpdate = [];
        pub.toAnimate = [];
        pub.toClick = [];

        pub.onMouseDownAction = [];
        pub.onMouseUpAction = [];
        pub.onMouseMoveAction = [];

        pub.onMouseDown = [];
        pub.onMouseUp = [];
        pub.onMouseEnter = [];
        pub.onMouseLeave = [];

        pub.continues -= 1;
        
        tex = RSTools.createObject(pub.DrawableText);
        tex.initText(400, 200, true, pub.World.desc , 50, "Black", 2);
        tex = RSTools.createObject(pub.DrawableText);
        tex.initText(400, 250, true,pub.gameOverText , 50, "Black", 2);

        but = RSTools.createObject(pub.TextButton);
        but.initButton(250, 400, 300, 50, "Back", function () {
            startTransition(initMenu, gameState = gsMenu);
        });
        but.background.draw();

        gameState = gsGameOver;
    };
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

        pub.sound.load(format);
        pub.sound.setEffectVolume(50);
        pub.sound.setMusicVolume(50);

        spriteBackground = new Image();
        spriteBackground.onload = backgroundLoaded;
        spriteBackground.src = "Images/TowerDefenseDefault.png";
        spriteMenu = new Image();
        spriteMenu.onload = menuLoaded;
        spriteMenu.src = "Images/TowerDefenseMenu.png";
        pub.spriteMain = new Image();
        pub.spriteMain.onload = mainLoaded;
        pub.spriteMain.src = "Images/TowerDefenseMain.png";
        pub.spriteGrid = new Image();
        pub.spriteGrid.onload = gridLoaded;
        pub.spriteGrid.src = "Images/Grid550x400.png";
    };
    backgroundLoaded = function () {
        loadedMedia += 1;
    };
    menuLoaded = function () {
        loadedMedia += 1;
    };
    mainLoaded = function () {
        loadedMedia += 1;
    };
    gridLoaded = function () {
        loadedMedia += 1;
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
        
        switch (gameState) {
            case gsLoading:
                if (loadedMedia === 4) {
                    initMenu();
                }
                break;
            case gsMenu:
                menuLoop();
                pub.sound.play();
                break;
            case gsGame:
                gameLoop();
                pub.sound.play();
                break;
            case gsPaused:
                pub.contextOverlay.fillStyle = "rgba(100,100,100,0.01)";
                pub.contextOverlay.fillRect(0, 0, canvas_main.width, canvas_main.height);
                pub.contextOverlay.fillStyle = 'white';
                pub.contextOverlay.fillRect(250, 50, 100, 500);
                pub.contextOverlay.fillRect(450, 50, 100, 500);
                break;
            case gsTransition:

                if (transitionMidAction) {
                    transitionCounter += 3;
                } else if (transitionCounter > 0) {
                    transitionCounter -= 3;
                } else {
                    transitionEndAction();
                    transitionEndAction = undefined;
                }

                if (transitionCounter >= 100) {
                    transitionMidAction();
                    transitionMidAction = undefined;
                }

                pub.contextOverlay.globalAlpha = transitionCounter / 100;
                pub.contextOverlay.clearRect(0, 0, canvas_main.width, canvas_main.height);
                pub.contextOverlay.fillStyle = "Black";
                pub.contextOverlay.fillRect(0, 0, canvas_main.width, canvas_main.height);
                pub.contextOverlay.globalAlpha = 1;

                pub.sound.play();
                
                break;
            case gsGameOver:
                gameOverLoop();
                pub.sound.play();
                break;
            default:
        }

        if (runLoop) {
            requestFrame(loop);
        }
    };
    menuLoop = function () {
        var i;

        clearMain();

        for (i = 0; i < pub.toDraw.length; i++) {
            pub.toDraw[i].draw();
        }

        for (i = 0; i < pub.toUpdate.length; i++) {
            pub.toUpdate[i].update();
        }
    };
    gameOverLoop = function () {
        var i;

        clearMain();

        for (i = 0; i < pub.toDraw.length; i++) {
            pub.toDraw[i].draw();
        }
    };
    gameLoop = function () {
        var i, j;
        
        loopTime = new Date().getTime() - loopTime;
        span_fps.innerHTML = Math.round(1000 / loopTime);
        span_status.innerHTML = " draws:" + pub.toDraw.length + " updates:" + pub.toUpdate.length + " info:" + pub.info;
        loopTime = new Date().getTime();

        clearMain();

        pub.pathfinding.paint();

        for (i = pub.toCall.length - 1; i >= 0 ; i--) {
            if (pub.toCall[i]()) {
                pub.toCall.splice(i, 1);
            }
        }

        for (i = 0; i < pub.toCommit.length; i++) {
            pub.toCommit[i].commitPosition(changeBit);
        }

        for (i = 0; i < pub.toDraw.length; i++) {
            pub.toDraw[i].draw();
        }

        for (i = 0; i < pub.toUpdate.length; i++) {
            pub.toUpdate[i].update();
        }

        for (i = pub.bullets.length - 1; i >= 0; i -= 1) {
            for (j = pub.enemies.length - 1; j >= 0; j -= 1) {
                if (RSTools.intersects(pub.bullets[i], pub.enemies[j])) {
                    pub.enemies[j].hit(pub.bullets[i]);
                    pub.bullets[i].hit(pub.enemies[j]);
                }

                if (!pub.bullets[i]) {
                    break;
                }
            }
        }

        if (pub.displayMoney > pub.money) {
            pub.displayMoney -= 1;
            pub.drawMoney();
        } else if(pub.displayMoney<pub.money){
            pub.displayMoney += 1;
            pub.drawMoney();
        }

        updateContextMenu();

        changeBit = !changeBit;
    };

    clearMain = function () {
        pub.contextMain.clearRect(0, 0, 800, 600);
        pub.contextOverlay.clearRect(0, 0, 800, 600);
    };
    
    startTransition = function (_midAction, _endAction) {
        transitionMidAction = _midAction;
        transitionEndAction = _endAction;
        transitionCounter = 0;

        gameState = gsTransition;
    };

    initLevelArray = function () {
        pub.Level = [];
        for (var i = 0; i < 11; i++) {
            pub.Level[i] = [];
        }
    };

    buildButtons = {
        buttons:[]
    };
    initBuildMenu = function () {
        var arrowButton,i;

        buildTower = RSTools.createObject(pub.Tower);

        buildField = RSTools.createObject(pub.Field);
        buildField.initField(0, 0);
        buildField.active = false;

        buildWall = RSTools.createObject(pub.Wall);
        buildWall.initWall(0, 0);
        buildWall.active = false;

        towerNameText = RSTools.createObject(pub.DrawableText);
        towerNameText.initText(675, 45, true, "", 16, "black");

        pub.Heads = new RSTools.flipCollection(RSTools.createObject(pub.Head), RSTools.createObject(pub.BurstHead), RSTools.createObject(pub.LaserHead), RSTools.createObject(pub.MortarHead),RSTools.createObject(pub.GlobeHead),RSTools.createObject(pub.GunsHead));
        pub.Shafts = new RSTools.flipCollection(RSTools.createObject(pub.Shaft), RSTools.createObject(pub.MediumShaft), RSTools.createObject(pub.LowShaft));
        pub.Bases = new RSTools.flipCollection(RSTools.createObject(pub.Base), RSTools.createObject(pub.SpeedBase),RSTools.createObject(pub.DamageBase),RSTools.createObject(pub.FreezeBase));

        pub.Heads.applyToAll(function () {
            this.initHead(pub.voidTower);
        });
        pub.Shafts.applyToAll(function () {
            this.initShaft(pub.voidTower);
        });
        pub.Bases.applyToAll(function () {
            this.initBase(0, 0, pub.voidTower);
        });

        pub.Heads.applyToAll(function () {
            this.alpha = 0;
            this.posY = 55;
        });
        pub.Shafts.applyToAll(function () {
            this.alpha = 0;
            this.posY = 105;
        });
        pub.Bases.applyToAll(function () {
            this.alpha = 0;
            this.posY = 155;
        });

        for (var i = 0; i < 3; i++) {
            arrowButton = RSTools.createObject(pub.Button);
            arrowButton.initButton(595, 55 + 50 * i, pub.spriteXArrowLeft, switchTowerPart(i, -1));

            arrowButton = RSTools.createObject(pub.Button);
            arrowButton.initButton(730, 55 + 50 * i, pub.spriteXArrowRight, switchTowerPart(i, 1));

            switchTowerPart(i, 0)();
        }

        towerButton = RSTools.createObject(pub.DnDButton);
        towerButton.initButton(645, 225, buildTower);
        towerButton.draw();

        fieldButton = RSTools.createObject(pub.DnDButton);
        fieldButton.initButton(590, 310, buildField);
        fieldButton.draw();

        wallButton = RSTools.createObject(pub.DnDButton);
        wallButton.initButton(700, 310, buildWall);
        wallButton.draw();

        fieldCostText = RSTools.createObject(pub.DrawableText);
        fieldCostText.initText(620, 300, true, buildField.cost + "S", 16, "Black", 1);

        wallCostText = RSTools.createObject(pub.DrawableText);
        wallCostText.initText(730, 300, true, buildWall.cost + "S", 16, "Black", 1);

        towerCostText = RSTools.createObject(pub.DrawableText);
        towerCostText.initText(675, 215, true, buildTower.cost + "S", 16, "Black", 1);

        bankText = RSTools.createObject(pub.DrawableText);
        bankText.background = "Black";
        bankText.initText(675, 300, true, "0S", 16, "White");
    }
    pub.drawMoney = function () {
        bankText.text = pub.displayMoney + "S";
    };
    
    switchTowerPart = function (_towerPart, _direction) {
        var towerPart = _towerPart,
            direction = _direction;

        return function () {
            var partCollection,
                lastEntry,
                headRotation,
                posX=0,
                posY=0;

            switch (towerPart) {
                case 0:
                    partCollection = pub.Heads;
                    break;
                case 1:
                    partCollection = pub.Shafts;
                    break;
                case 2:
                    partCollection = pub.Bases;
                    break;
                default:
            }
            
            lastEntry=partCollection.currentEntry;
            partCollection.current += direction;

            if (direction === 0) {
                partCollection.currentEntry.alpha = 1;
                partCollection.currentEntry.posX = 650;
            } else if (direction > 0) {//right
                partCollection.currentEntry.posX = 600;
                fadeInMoving(partCollection.currentEntry, 1);
                fadeOutMoving(lastEntry, 1);
            } else {//left
                partCollection.currentEntry.posX = 700;
                fadeInMoving(partCollection.currentEntry, -1);
                fadeOutMoving(lastEntry, -1);
            }

            if (buildTower.head) {
                if (buildTower.head.rotation) {
                    headRotation = buildTower.head.rotation;
                }

                buildTower.head.remove();
                buildTower.shaft.remove();
                buildTower.base.remove();
            }

            if (towerButton) {
                posX = towerButton.posX+5;
                posY = towerButton.posY+5;
            }

            buildTower.initTower(posX, posY, RSTools.createObject(pub.Heads.currentEntry), RSTools.createObject(pub.Shafts.currentEntry), RSTools.createObject(pub.Bases.currentEntry));


            if (headRotation) {
                if (pub.LaserHead.isPrototypeOf(buildTower.head)) {
                    buildTower.head.rotation = 0;
                } else {
                    buildTower.head.rotation = headRotation;
                }
            }

            towerNameText.text = buildTower.desc;
            if (towerCostText) {
                towerCostText.text = buildTower.cost + "S";
                towerCostText.draw();
            }
        }
    }
    fadeInMoving = function (_drawable, _direction) {
        var drawable = _drawable,
            direction = _direction,
            limit = 50,
            factor=3,
            fade;

        fade= function () {
            drawable.posX += direction*factor;
            drawable.alpha += 0.02*factor;
            limit -= 1*factor;

            if (limit <= 0) {
                drawable.alpha = 1;
                return true;
            }
            return false;
        };

        pub.toCall.push(fade);
    };
    fadeOutMoving = function (_drawable, _direction) {
        var drawable = _drawable,
            direction = _direction,
            limit = 50,
            factor=3,
            fade;

        fade = function () {
            drawable.posX += direction*factor;
            drawable.alpha -= 0.02*factor;
            limit -= 1*factor;

            if (limit <= 0) {
                drawable.alpha = 0;
                return true;
            }
            return false;
        };

        pub.toCall.push(fade);
    };

    initContextMenu = function () {
        pub.contextNameText = RSTools.createObject(pub.DrawableText);
        pub.contextNameText.initText(675, 405, true, "", 16, "White");


        pub.contextFiredText = RSTools.createObject(pub.DrawableText);
        pub.contextFiredText.initText(600, 430, false, "", 14, "White");

        pub.contextHitText = RSTools.createObject(pub.DrawableText);
        pub.contextHitText.initText(600, 450, false, "", 14, "White");

        pub.contextFragsText = RSTools.createObject(pub.DrawableText);
        pub.contextFragsText.initText(600, 470, false, "", 14, "White");

        pub.contextRemoveButton = RSTools.createObject(pub.TextButton);
        pub.contextRemoveButton.initButton(670, 432, 80, 25, "Scrap", function () {
            var dis;

            if (pub.selectedEntry) {
                dis = RSTools.createObject(pub.Disassemble);
                dis.init(pub.selectedEntry.base || pub.selectedEntry, 10, 10, 1,0.2,true,1,0,20);

                pub.selectedEntry.remove();
                pub.money += Math.round(pub.selectedEntry.cost / 2);
                pub.drawMoney();
                pub.SetSelectedContextEntry();

                pub.sound.swush.request();
            }
        });
        pub.contextRemoveButton.visible = false;

        pub.contextLeadButton = RSTools.createObject(pub.AngleButton);
        pub.contextLeadButton.initButton(600, 500, "Lead");
        pub.contextLeadButton.visible = false;
        
        pub.contextSpreadButton = RSTools.createObject(pub.SliderButton);
        pub.contextSpreadButton.initButton(650, 500, 0, "Spread");
        pub.contextSpreadButton.text.fillStyle = "White";
        pub.contextSpreadButton.text.size = 10;
        pub.contextSpreadButton.text.posX+=50;
        pub.contextSpreadButton.text.posY -=15;
        pub.contextSpreadButton.visible = false;
    };
    updateContextMenu = function () {
        if (pub.selectedEntry && pub.Tower.isPrototypeOf(pub.selectedEntry)) {
            pub.contextFiredText.text = "Fired: " + pub.selectedEntry.fired;
            pub.contextHitText.text = "Hit:   " + pub.selectedEntry.hit;
            pub.contextFragsText.text = "Frags: " + pub.selectedEntry.frags;
        }
        else {
            pub.contextFiredText.text = "";
            pub.contextHitText.text = "";
            pub.contextFragsText.text = "";
        }
    };
    pub.SetSelectedContextEntry = function (entry) {
        
        if (entry) {
            pub.sound.mouseDown.request();
        } else if(pub.selectedEntry) {
            pub.sound.mouseUp.request();
        }


        if (pub.selectedEntry) {
            pub.selectedEntry.selected = false;
        }
        pub.selectedEntry = entry;

        if (entry) {
            entry.selected = true;
            pub.contextNameText.text = entry.desc;

            if (pub.LaserHead.isPrototypeOf(entry.head) || pub.MortarHead.isPrototypeOf(entry.head)) {
                pub.contextLeadButton.itext = "Angle";
                pub.contextLeadButton.steps = 90;
                pub.contextLeadButton.visible = true;
                pub.contextLeadButton.knob.rotation = entry.head.rotation + 90;
                pub.contextLeadButton.onAngleChanged = function () {
                    entry.head.rotation = pub.contextLeadButton.knob.rotation - 90;

                    if (entry.head.rotation < 0) {
                        entry.head.rotation += 360;
                    }
                };
            } else if (pub.Tower.isPrototypeOf(entry)) {
                pub.contextLeadButton.itext = "Lead";
                pub.contextLeadButton.visible = true;
                pub.contextLeadButton.steps = 0;
                pub.contextLeadButton.knob.rotation = entry.head.lead;
                pub.contextLeadButton.onAngleChanged = function () {
                    entry.head.lead = pub.contextLeadButton.knob.rotation;
                };
            } else {
                pub.contextLeadButton.visible = false;
            }

            pub.contextRemoveButton.visible = true;
            pub.contextRemoveButton.text.text = "Scrap(+" + Math.round(entry.cost / 2) + ")";
            
            if (pub.BurstHead.isPrototypeOf(entry.head)) {
                pub.contextSpreadButton.visible = true;
                pub.contextSpreadButton.value = (entry.head.spread - 20) * 100 / 40;
                pub.contextSpreadButton.onValueChanged = function () {
                    entry.head.spread =20+ pub.contextSpreadButton.value * 40 / 100;
                };
            } else {
                pub.contextSpreadButton.visible = false;
            }

        } else {
            pub.contextNameText.text = "";
            pub.contextFiredText.text = "";
            pub.contextHitText.text = "";
            pub.contextFragsText.text = "";
            
            pub.contextRemoveButton.visible = false;
            pub.contextLeadButton.visible = false;
            pub.contextSpreadButton.visible = false;
        }
    };

    initGameObjects = function () {
        draw_dangerDay = RSTools.createObject(pub.Drawable);
        draw_dangerDay.initDrawable(25, 25, 0, 650, 550, 50, 1);

        draw_dangerNight = RSTools.createObject(pub.Drawable);
        draw_dangerNight.initDrawable(25, 25, 0, 600, 550, 50, 2);
        draw_dangerNight.alpha = 0;

        gate = RSTools.createObject(pub.Gate);
        gate.initGate();

        startButton = RSTools.createObject(pub.TextButton);
        startButton.initButton(585, 542, 180, 25, "Forward to Nightfall", fadeToNight);

        dayText = RSTools.createObject(pub.DrawableText);
        dayText.initText(300, 300, true, "Day", 40, "Black", 2);
        dayText.background = "White";
        dayText.backThickness = 20;
        dayText.alpha = 0;
    };

    fadeToNight = function () {
        var counter = 0,
            func;

        dayText.text = "Night " + (pub.World.currentDay + 1);
        func = function () {
            counter += 0.01;

            draw_dangerNight.alpha = counter;

            if (counter < 0.5) {
                dayText.alpha = counter * 2;
            } else {
                dayText.alpha = 2 - counter * 2;
            }

            if (counter > 1) {
                dayText.alpha = 0;
                draw_dangerNight.alpha = 1;
                startNight();
                return true;
            }
            return false;
        };

        pub.sound.night.play();

        startButton.hide();
        pub.toCall.push(func);
    };
    startNight = function () {
        var spawned = 0,
            timer = 0,
            spawn;

        spawn = function () {
            var e;
            
            if (pub.World.spawn()) {
                fadeToDay();
                return true;
            }
            return false;
        }
        
        pub.pathfinding.update();
        pub.pathfinding.calculate();

        pub.toCall.push(spawn);
    };

    fadeToDay = function () {
        var counter = 1,
            func;

        dayText.text = "Day " + (pub.World.currentDay + 1);
        func = function () {
            if (pub.enemies.length === 0) {
                counter -= 0.01;

                draw_dangerNight.alpha = counter;


                if (counter < 0.5) {
                    dayText.alpha = counter * 2;
                } else {
                    dayText.alpha = 2 - counter * 2;
                }

                if (counter < 0) {
                    dayText.alpha = 0;
                    draw_dangerNight.alpha = 0;
                    startDay();
                    startButton.show();
                    return true;
                }
            }
            return false;
        };

        pub.toCall.push(func);
    };
    startDay = function () {
        var i;

        for (i = 0; i < pub.fields.length; i++) {
            pub.fields[i].gainScore();
        }

        pub.sound.day.play();

        pub.pathfinding.update();
        pub.pathfinding.calculate();

        pub.drawMoney();

        if (pub.World.currentDay === pub.World.days.length) {
            pub.GameOver("The Defense held!");
        }
    };
    
    //World
    initWorld = function () {
        if (pub.World) {
            pub.World.build();
        }
    }

    //actually Start
    init();
    startLoop();

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));

