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

    return pub;
}(RSTools || {});