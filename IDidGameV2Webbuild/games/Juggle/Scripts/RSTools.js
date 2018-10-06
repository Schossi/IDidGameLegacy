var RSTools = function (pub) {
    "use strict";

    pub.createObject = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };

    pub.toRadian = function (num) {
        

        return num * Math.PI / 180;
    };
    pub.toDegrees = function (num) {
        return num / Math.PI * 180;
    };

    pub.getDistance = function (x1, y1, x2, y2) {
        var a2 = x1 - x2;
        var b2 = y1 - y2;
        a2 *= a2;
        b2 *= b2;

        return Math.sqrt(a2 + b2);
    };

    pub.vectorToAngle = function (x1, y1, x2, y2) {
        var res = RSTools.toDegrees(Math.atan2(y1 - y2, x1 - x2));

        return res;
    };
    pub.angleToVector = function (angle) {
        var _x,
            _y;

        _x = Math.cos(pub.toRadian(angle));
        _y = Math.sin(pub.toRadian(angle));

        return { x: _x, y: _y };

    };

    pub.removeFromArray = function (arr, item) {
        var i = arr.indexOf(item);
        if (i != -1) {
            arr.splice(i, 1);
        }
    };

    pub.intersects = function (obj1,obj2) {
        if (obj1.posX + obj1.width < obj2.posX) {//Left Off
            return false;
        }
        if (obj1.posX > obj2.posX + obj2.width) {//Right Off
            return false;
        }
        if (obj1.posY + obj1.height < obj2.posY) {//Over
            return false;
        }
        if (obj1.posY > obj2.posY + obj2.height) {//Under
            return false;
        }
        return true;
    };
    pub.intersectsSpecial = function (bullet, ship) {
        if (bullet.posX + bullet.width < ship.posX) {//Left Off
            return false;
        }
        if (bullet.posX > ship.posX + ship.width) {//Right Off
            return false;
        }
        if (bullet.posY + bullet.height < ship.posY) {//Over
            return false;
        }
        if (bullet.posY > ship.posY + ship.height) {//Under
            return false;
        }
        return true;
    };
    pub.intersectsPR = function (point, rect) {
        if (point.centerX < rect.posX) {//Left Off
            return false;
        }
        if (point.centerX > rect.posX + rect.width) {//Right Off
            return false;
        }
        if (point.centerY < rect.posY) {//Over
            return false;
        }
        if (point.centerY > rect.posY + rect.height) {//Under
            return false;
        }
        return true;
    }
    
    pub.formatDuration = function (_numDuration) {
        var millisec_num = parseInt(_numDuration, 10); // don't forget the second param
        var sec_num = millisec_num / 1000;
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        var time = hours + ':' + minutes + ':' + seconds;
        return time;
    }

    pub.flipCollection = function () {
        this.arr = [];
        this.icurrent = 0;

        for (var i = 0; i < arguments.length; i++) {
            this.arr.push(arguments[i]);
        }
    };
    pub.flipCollection.prototype.applyToAll = function (_function) {
        for (var i = 0; i < this.arr.length; i++) {
            _function.apply(this.arr[i], Array.prototype.slice.apply(arguments, [1]));
        }
    };
    Object.defineProperty(pub.flipCollection.prototype, "current", {
        get: function () { return this.icurrent; },
        set: function (value) {
            this.icurrent = value;

            if (this.icurrent < 0) {
                this.icurrent = this.arr.length - 1;
            } else if (this.icurrent > this.arr.length - 1) {
                this.icurrent = 0;
            }
        }
    });
    Object.defineProperty(pub.flipCollection.prototype, "currentEntry", {
        get: function () { return this.arr[this.current] }
    });


    pub.getKeyName = function (_keyCode) {
        var key

        for (key in pub.Keys) {
            if (pub.Keys[key] === _keyCode) {
                return key;
            }
        }
        return "";
    };

    pub.Keys = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,     
        PAGE_DOWN: 34,  
        END: 35,         
        HOME: 36,      
        ARR_LEFT: 37,       
        ARR_UP: 38,         
        ARR_RIGHT: 39,     
        ARR_DOWN: 40,       
        PRINT_SCREEN: 44,
        INSERT: 45,     
        DELETE: 46,     
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUMLOCK: 144,
        SCROLL_LOCK: 145,

    };

    return pub;
}(RSTools || {});