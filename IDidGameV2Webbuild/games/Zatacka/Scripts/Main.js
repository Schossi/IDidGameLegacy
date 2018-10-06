/// <reference path="_references.js" />

var IDIDGAME_Loop = (function (pub, undefined) {
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

        pub.mouseX = e.pageX - pub.canvas_main.offsetLeft;
        pub.mouseY = e.pageY - pub.canvas_main.offsetTop;


        pub.currentGameContext.mouseMove(e);
        pub.SoundSliderContext.mouseMove(e);

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
        pub.canvas_overlay.addEventListener('contextmenu', pub.contextMenu);

        

        pub.toCall = [];

        pub.MainContext.init(pub.contextMain);
        pub.SoundSliderContext.init(pub.contextOverlay);
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
        pub.spriteMain.src = "Images/LoopMain.png";
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

    //API LOADED        bool
    //GameOver          bool
    //Score Total       int
    //Score Pilot1-5    int
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

    //actually Start
    init();
    startLoop();

    return pub;
}(IDIDGAME_Loop || {}, undefined));

