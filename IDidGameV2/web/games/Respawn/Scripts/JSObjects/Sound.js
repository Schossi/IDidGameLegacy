﻿var IDIDGAME_Respawn = (function (pub, undefined) {
    "use strict";
    var soundEffect, musicTrack;


    pub.sound = function () { };
    pub.sound.load = function (_format) {
        var i;

        this.sounds = [];

        //GENERIC
        this.laser = new soundEffect("laser", _format, 0.5);
        this.sounds.push(this.laser);
        this.fire = new soundEffect("fire", _format, 0.5);
        this.sounds.push(this.fire);
        this.mouseDown = new soundEffect("WoodHigh", _format, 0.05);
        this.sounds.push(this.mouseDown);
        this.mouseUp = new soundEffect("WoodLow", _format, 0.05);
        this.sounds.push(this.mouseUp);
        this.dndUp = new soundEffect("BassLow", _format, 0.8);
        this.sounds.push(this.dndUp);
        this.dndDown = new soundEffect("BassHigh", _format, 0.8);
        this.sounds.push(this.dndDown);

        //SHIP
        this.sLiftOff = new soundEffect("sLiftOff", _format, 0.3);
        this.sounds.push(this.sLiftOff);
        this.sEngine = new soundEffect("sEngine", _format, 0.7);
        this.sEngine.eff.loop = true;
        this.sounds.push(this.sEngine);
        this.sHit = new soundEffect("sHit", _format, 0.5);
        this.sounds.push(this.sHit);
        this.sShoot = new soundEffect("sShoot", _format, 0.1);
        this.sounds.push(this.sShoot);

        //ENEMIES
        this.eLaser = new soundEffect("eLaser", _format, 0.5);
        this.eLaser.eff.loop = true;
        this.sounds.push(this.eLaser);
        this.eExplosion = new soundEffect("eExplosion", _format, 0.5);
        this.sounds.push(this.eExplosion);
        this.eShoot = new soundEffect("eShoot", _format, 0.15);
        this.sounds.push(this.eShoot);
        this.tracks = [];
        this.mChill = new musicTrack("SpaceChill", _format, 1);
        this.tracks.push(this.mChill);
        this.mAggressive = new musicTrack("SpaceAggressive", _format, 0.8);
        this.tracks.push(this.mAggressive);

        this.currentTrack = undefined;

        this.effectVolume = 50;
        this.musicVolume = 50;

        pub.totalMedia += this.tracks.length;
        pub.totalMedia += this.sounds.length;

        for (i = 0; i < this.sounds.length; i++) {
            this.sounds[i].eff.addEventListener("loadeddata", pub.soundLoaded);
        }
        for (i = 0; i < this.tracks.length; i++) {
            this.tracks[i].eff.addEventListener("loadeddata", pub.soundLoaded);
        }
    };
    pub.sound.setEffectVolume = function (_volume) {
        var i;
        pub.sound.effectVolume = _volume;
        for (i = 0; i < pub.sound.sounds.length; i++) {
            pub.sound.sounds[i].eff.volume = (_volume/100)* pub.sound.sounds[i].baseVolume;
        }
    };
    pub.sound.setMusicVolume = function (_volume) {
        var i;
        pub.sound.musicVolume = _volume;
        for (i = 0; i < pub.sound.tracks.length; i++) {
            pub.sound.tracks[i].setMasterVolume(_volume);
        }
    };
    pub.sound.play = function () {
        var i;
        for (i = 0; i < this.sounds.length; i++) {
            this.sounds[i].play();
        }
    };

    pub.soundLoaded = function () {
        pub.loadedMedia += 1;
    }

    soundEffect = function (_name, _format,_baseVolume) {
        this.eff = new Audio();
        this.eff.src = "Effects/" + _name + _format;
        this.playedOnce = false;
        this.requested = false;

        this.baseVolume = _baseVolume;
    };
    soundEffect.prototype.play = function () {
        if (this.requested && (!this.playedOnce || this.eff.ended || this.eff.paused)) {
            this.eff.play();

            this.requested = false;
            this.playedOnce = true;
        }
    };
    soundEffect.prototype.request = function () {
        this.requested = true;
    };

    musicTrack = function (_name, _format, _baseVolume) {
        this.eff = new Audio();
        this.eff.src = "Music/" + _name + _format;
        this.eff.loop = true;
        this.masterVolume=100;
        this.baseVolume = _baseVolume;
        this.fadeVolume = 0;
        
    };
    musicTrack.prototype.setMasterVolume = function (_volume) {
        this.masterVolume = _volume;
        this.eff.volume = (this.masterVolume / 100) * this.baseVolume * this.fadeVolume;
    };
    musicTrack.prototype.setFadeVolume = function (_volume) {
        if (_volume > 1) {
            this.fadeVolume = 1;
        } else if (_volume < 0) {
            this.fadeVolume = 0;
        } else {
            this.fadeVolume = _volume;
        }

        this.eff.volume = (this.masterVolume / 100) * this.baseVolume * this.fadeVolume;
    };
    musicTrack.prototype.play = function () {
        if (pub.sound.currentTrack === this) {
            return;
        }

        if (pub.sound.currentTrack) {
            pub.toCall.push(function () {
                var track = pub.sound.currentTrack;

                return function () {
                    track.setFadeVolume(track.fadeVolume - 0.02);
                    if (track.fadeVolume <= 0) {
                        track.eff.pause();
                        return true;
                    }
                    return false;
                };
            }());
        }
        pub.sound.currentTrack = this;
        if (pub.sound.currentTrack) {
            this.eff.play();

            pub.toCall.push(function () {
                var track = pub.sound.currentTrack;

                return function () {
                    track.setFadeVolume(track.fadeVolume + 0.02);
                    if (track.fadeVolume >= 1) {
                        return true;
                    }
                    return false;
                };
            }());
        }
    };

    return pub;
}(IDIDGAME_Respawn || {}, undefined));