/// <reference path="Effects.js" />
/// <reference path="Prototypes.js" />
/// <reference path="GameContext.js" />
/// <reference path="Sound.js" />
/// <reference path="UI.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../RSTools.js" />
/// <reference path="Building.js" />
/// <reference path="Agent.js" />
/// <reference path="Balls.js" />
/// <reference path="Hands.js" />
/// <reference path="Map.js" />
/// <reference path="../Main.js" />



var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    var version = '0.0.1',

        paused = false,
        integrationLoaded = false,

        //dom
        div_gameObject,
        x,
        y,
        span_fps,
        span_status,

        //hoistedFunctions
        volumeChanged,
        volumeEffectSlider,
        volumeMusicSlider,
        loadMedia,
        backgroundLoaded,
        menuLoaded,
        mainLoaded,
        initLocalStorage,

        init,
        runLoop = false,
        loopTime,
        requestFrame,
        startLoop,
        loop;

    //parameters
    pub.scrollSpeed = 20;
    pub.bulletSize = 5;
    pub.bulletSpeed = 12;

    //INPUT
    pub.mouseMove = function (e) {

        //pub.mouseX = e.pageX - pub.canvas_main.offsetLeft;
        //pub.mouseY = e.pageY - pub.canvas_main.offsetTop;


        pub.currentGameContext.mouseMove(e);
        //pub.SoundSliderContext.mouseMove(e);

        if (x) {
            x.innerHTML = pub.mouseX;
            y.innerHTML = pub.mouseY;
        }

    };
    pub.mouseDown = function (e) {
        pub.currentGameContext.mouseDown(e);
        pub.SoundSliderContext.mouseDown(e);
    };
    pub.mouseUp = function (e) {
        pub.currentGameContext.mouseUp(e);
        pub.SoundSliderContext.mouseUp(e);
    };
    pub.mouseWheel=function(e){
        pub.currentGameContext.mouseWheel(e);
    };
    pub.key_down = function (e) {
        pub.currentGameContext.key_down(e);

        //e.preventDefault();
    };
    pub.key_up = function (e) {
        pub.currentGameContext.key_up(e);

        //e.preventDefault();
    };
    pub.contextMenu = function (e) {
        e.preventDefault();
        return false;
    };

    pub.refresh = function () {
        init();
    };

    pub.LevelPrefix = "RSJuggle.Level";

    //INIT
    init = function () {

        x = document.getElementById("x");
        y = document.getElementById("y");

        pub.info = "";

        pub.canvas_main = document.getElementById("canvas_main");
        pub.canvas_overlay = document.getElementById("canvas_overlay");

        div_gameObject = document.getElementById("div_gameObject");

        span_fps = document.getElementById("span_fps");
        span_status = document.getElementById("span_status");

        pub.contextMain = pub.canvas_main.getContext('2d');
        pub.contextOverlay = pub.canvas_overlay.getContext("2d");

        pub.loadedMedia = 0;
        pub.totalMedia = 0;
        loadMedia();

        document.addEventListener('keydown', pub.key_down, false);
        document.addEventListener('keyup', pub.key_up, false);

        pub.canvas_overlay.addEventListener('mousedown', pub.mouseDown);
        pub.canvas_overlay.addEventListener('mouseup', pub.mouseUp);
        pub.canvas_overlay.addEventListener('mousemove', pub.mouseMove);
        pub.canvas_overlay.addEventListener('mousewheel', pub.mouseWheel);
        pub.canvas_overlay.addEventListener('contextmenu', pub.contextMenu);

        

        pub.toCall = [];

        pub.MainContext.init(pub.contextMain);
        pub.SoundSliderContext.init(pub.contextMain);

        pub.currentGameContext = pub.MainContext;
        
        requestFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.moxRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
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

        pub.spriteMain = new Image();
        pub.spriteMain.onload = mainLoaded;
        pub.spriteMain.src = "Images/Juggle.png";
        pub.totalMedia += 1;
    };
    mainLoaded = function () {
        pub.loadedMedia += 1;
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

        if (span_fps) {
            loopTime = new Date().getTime() - loopTime;
            span_fps.innerHTML = Math.round(1000 / loopTime);
            loopTime = new Date().getTime();
        }

        if (pub.loadedMedia >= pub.totalMedia && pub.isIntegrationLoaded()) {
            pub.currentGameContext.work();
            pub.SoundSliderContext.work();
            pub.sound.play();

            for (i = pub.toCall.length - 1; i >= 0 ; i -= 1) {
                if (pub.toCall[i]()) {
                    pub.toCall.splice(i, 1);
                }
            }
        }
        else {
            pub.contextMain.fillStyle = "Black";
            pub.contextMain.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
            pub.contextMain.fillStyle = "#383838";
            pub.contextMain.fillRect(0, 0, pub.canvas_main.width / pub.totalMedia * pub.loadedMedia, pub.canvas_main.height);

            pub.contextMain.font = "bold 60px Arial";
            pub.contextMain.lineWidth = 2;
            pub.contextMain.textBaseline = "middle";
            pub.contextMain.fillStyle = "Red";
            pub.contextMain.fillText("Loading...", 150, 300);
            pub.contextMain.strokeStyle = "White";
            pub.contextMain.strokeText("Loading...", 150, 300);
        }

        if (runLoop) {
            requestFrame(loop);
        }
    };
    pub.clearMain = function () {
        pub.contextMain.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        pub.contextOverlay.clearRect(0, 0, pub.canvas_overlay.width, pub.canvas_overlay.height);
    };

    //Kong
    pub.isIntegrationLoaded = function () {
        if (integrationLoaded) {
            return true;
        }

        if (kongregate !== undefined && kongregate === false) {
            return false;
        }

        pub.trySubmitScore("API Loaded", 1);

        integrationLoaded = true;
        return true;
    }

    //API LOADED            bool
    //RSJuggle.Leveln [ms]  int
    //
    pub.trySubmitScore = function (_type, _score) {
        if (_score == false) {
            //debug - scores should never be falsey
            return;
        }

        if (kongregate) {
            kongregate.stats.submit(_type, _score);
        } else {
            //for future on site scoring ;)
        }
    };

    pub.localStorage = -1;
    initLocalStorage = function () {
        if (localStorage === -1) {
            try {
                localStorage = 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        }
        return true;
    }
    pub.getStoredValue = function (_key) {
        if (initLocalStorage()) {
            return localStorage.getItem(_key);
        }
    };
    pub.setStoredValue = function (_key, _value) {
        pub.trySubmitScore(_key, _value);
        if (initLocalStorage()) {
            localStorage.setItem(_key, _value);
        }
    };

    //actually Start
    init();
    startLoop();

    return pub;
}(IDIDGAME_Water || {}, undefined));

