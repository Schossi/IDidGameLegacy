
var IDIDGAMEPEBBLE = (function (pub, undefined) {
    "use strict";

    pub.Pebble = RSTools.createObject(pub.Drawable);
    pub.Pebble.initPebble = function (_fromX, _toX, _fromY, _toY) {
        this.initDrawable(_fromX * 50, _fromY * 50, 0, 0, 50, 50);
        this.moveCounter = 0;
        this.bX = _toX;
        this.bY = _toY;
        this.fX = _fromX;
        this.fY = _fromY;
        pub.Board.set(this.bX, this.bY, this);

        pub.toUpdate.push(this);
        pub.onMouseUp.push(this);
        pub.pebbles.push(this);
    };
    pub.Pebble.update = function () {
        var i=10;

        this.moveCounter += 1;

        this.posX = (this.fX * (i - this.moveCounter) + this.bX * this.moveCounter)/i * 50;
        this.posY = (this.fY * (i - this.moveCounter) + this.bY * this.moveCounter)/i * 50;

        if (this.moveCounter === i) {
            RSTools.removeFromArray(pub.toUpdate, this);
        }
    }
    pub.Pebble.onMouseUp = function () {
        var p, i;

        for (i = 0; i < pub.ReplicationPattern.length; i++) {
            if (pub.Board.get(this.bX + pub.ReplicationPattern[i].x, this.bY + pub.ReplicationPattern[i].y)) {
                return;
            }
        }

        RSTools.removeFromArray(pub.toDraw, pub.Board.get(this.bX, this.bY));
        RSTools.removeFromArray(pub.pebbles, pub.Board.get(this.bX, this.bY));
        pub.Board.set(this.bX, this.bY, undefined);

        for (i = 0; i < pub.ReplicationPattern.length; i++) {

            p = RSTools.createObject(pub.Pebble);
            p.initPebble(this.bX, this.bX + pub.ReplicationPattern[i].x, this.bY, this.bY + pub.ReplicationPattern[i].y);

            while (this.bX + pub.ReplicationPattern[i].x + 2 > pub.gridSizeX || this.bY + pub.ReplicationPattern[i].y + 2 > pub.gridSizeY) {
                pub.expandBoard();
            }
        }

        pub.checkForWin();
    };

    pub.TemplateBoard = function(){};
    pub.TemplateBoard.init = function (_arr, _posY, _type) {
        this.arr = _arr;
        this.posY = _posY - 180;
        this.bottomY = _posY;
        this.posX = 620;
        this.width = 180;
        this.height = 180;
        this.type = _type;
        this.side = true;

        pub.onMouseUp.push(this);
        pub.toDraw.push(this);
    };
    pub.TemplateBoard.onMouseUp = function (x,y) {
        var boardX, boardY,
            i;

        boardX = Math.floor((x - 620) / 20);
        boardY = Math.floor((this.bottomY - y) / 20);

        if (boardX > 7 || boardY > 7) {
            return;
        }

        for (i = 0; i < this.arr.length; i++) {
            if (this.arr[i].x === boardX && this.arr[i].y === boardY) {
                this.arr.splice(i, 1);
                return;
            }
        }

        this.arr.push({ x: boardX, y: boardY });
    };
    pub.TemplateBoard.draw = function () {
        var i,
            spriteY = 0;

        if (this.type === 0) {
            spriteY = 50;
        }

        for (i = 0; i < this.arr.length; i++) {
            pub.contextSide.drawImage(pub.spriteMain, 0, spriteY, 50, 50, 20 + this.arr[i].x * 20, this.bottomY - 20 - this.arr[i].y * 20, 20, 20);
        }
    };

    return pub;
}(IDIDGAMEPEBBLE || {}, undefined));