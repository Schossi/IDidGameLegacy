var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
    var soundEffect, musicTrack;


    pub.sound = function () { };
    pub.sound.load = function (_format) {
        this.sounds = [];
        this.laser = new soundEffect("laser", _format, 0.2);
        this.sounds.push(this.laser);
        this.fire = new soundEffect("fire", _format, 0.2);
        this.sounds.push(this.fire);
        this.mouseDown = new soundEffect("WoodHigh", _format, 0.05);
        this.sounds.push(this.mouseDown);
        this.mouseUp = new soundEffect("WoodLow", _format, 0.05);
        this.sounds.push(this.mouseUp);
        this.dndUp = new soundEffect("BassLow", _format, 0.8);
        this.sounds.push(this.dndUp);
        this.dndDown = new soundEffect("BassHigh", _format, 0.8);
        this.sounds.push(this.dndDown);
        this.build = new soundEffect("HiHat", _format, 0.2);
        this.sounds.push(this.build);
        this.swush = new soundEffect("Swush", _format, 0.2);
        this.sounds.push(this.swush);
        this.coin = new soundEffect("Coin", _format, 0.05);
        this.sounds.push(this.coin);

        this.tracks = [];
        this.night = new musicTrack("TDNight1", _format,1);
        this.tracks.push(this.night);
        this.day = new musicTrack("TDDay1", _format, 0.5);
        this.tracks.push(this.day);

        this.currentTrack = undefined;

        this.effectVolume = 50;
        this.musicVolume = 50;
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

    soundEffect = function (_name, _format,_baseVolume) {
        this.eff = new Audio();
        this.eff.src = "Effects/" + _name + _format;
        this.playedOnce = false;
        this.requested = false;

        this.baseVolume = _baseVolume;
    };
    soundEffect.prototype.play = function () {
        if (this.requested && (!this.playedOnce || this.eff.ended)) {
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
}(IDIDGAME_TowerDefense || {}, undefined));