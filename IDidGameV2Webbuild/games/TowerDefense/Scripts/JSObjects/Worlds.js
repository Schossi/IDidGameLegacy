var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";

    pub.GetWorlds = function () {
        var arr = [],
            w, d, wa;

        w = RSTools.createObject(pub.World);
        w.initWorld();
        w.desc = "15 Waves";

        w.fields.push({ x: 0, y: 7 });
        w.fields.push({ x: 1, y: 7 });
        w.fields.push({ x: 9, y: 7 });
        w.fields.push({ x: 10, y: 7 });

        w.fields.push({ x: 0, y: 6 });
        w.fields.push({ x: 1, y: 6 });
        w.fields.push({ x: 9, y: 6 });
        w.fields.push({ x: 10, y: 6 });

        w.walls.push({ x: 3, y: 4 });
        w.walls.push({ x: 4, y: 4 });
        w.walls.push({ x: 5, y: 4 });
        w.walls.push({ x: 6, y: 4 });
        w.walls.push({ x: 7, y: 4 });


        d = new pub.Day();//1

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 800);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//2

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//3

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 0, 1200);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//4

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 2, 1200);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 1500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 1600);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 2, 2000);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//5

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 1, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 1, 1200);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 1600);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 1, 1800);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 1, 2200);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//6

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 2, 100);
        d.waves.push(wa);

        wa = new pub.Wave(10, 10, pub.Enemy, 0, 400);
        d.waves.push(wa);

        wa = new pub.Wave(10, 10, pub.Enemy, 0, 600);
        d.waves.push(wa);

        wa = new pub.Wave(10, 10, pub.Enemy, 0, 800);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 2, 1000);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//7

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 0, 1200);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//8

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 0, 1200);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//9

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 0, 1200);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();//10

        wa = new pub.Wave(20, 10, pub.Enemy, 1, 100);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 0, 500);
        d.waves.push(wa);

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 0, 1200);
        d.waves.push(wa);

        w.days.push(d);
        arr.push(w);

        /////////////////////////////////////

        w = RSTools.createObject(pub.World);
        w.initWorld();
        w.desc = "30 Waves";

        w.fields.push({ x: 0, y: 7 });
        w.fields.push({ x: 1, y: 7 });
        w.fields.push({ x: 9, y: 7 });
        w.fields.push({ x: 10, y: 7 });

        w.fields.push({ x: 0, y: 6 });
        w.fields.push({ x: 1, y: 6 });
        w.fields.push({ x: 9, y: 6 });
        w.fields.push({ x: 10, y: 6 });

        w.walls.push({ x: 3, y: 4 });
        w.walls.push({ x: 4, y: 4 });
        w.walls.push({ x: 5, y: 4 });
        w.walls.push({ x: 6, y: 4 });
        w.walls.push({ x: 7, y: 4 });


        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 100);
        d.waves.push(wa);

        wa = new pub.Wave(40, 5, pub.Enemy, 1, 800);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 2, 100);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 1, 100);
        d.waves.push(wa);

        w.days.push(d);
        arr.push(w);

        /////////////////////////////////////

        w = RSTools.createObject(pub.World);
        w.initWorld();
        w.desc = "45 Waves";

        w.fields.push({ x: 0, y: 7 });
        w.fields.push({ x: 1, y: 7 });
        w.fields.push({ x: 9, y: 7 });
        w.fields.push({ x: 10, y: 7 });

        w.fields.push({ x: 0, y: 6 });
        w.fields.push({ x: 1, y: 6 });
        w.fields.push({ x: 9, y: 6 });
        w.fields.push({ x: 10, y: 6 });

        w.walls.push({ x: 3, y: 4 });
        w.walls.push({ x: 4, y: 4 });
        w.walls.push({ x: 5, y: 4 });
        w.walls.push({ x: 6, y: 4 });
        w.walls.push({ x: 7, y: 4 });


        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.Enemy, 0, 100);
        d.waves.push(wa);

        wa = new pub.Wave(40, 5, pub.Enemy, 1, 800);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.EnemySprinter, 2, 100);
        d.waves.push(wa);

        w.days.push(d);
        d = new pub.Day();

        wa = new pub.Wave(20, 10, pub.EnemyWinder, 1, 100);
        d.waves.push(wa);

        w.days.push(d);
        arr.push(w);


        return arr;
    };

    pub.World = function () {};
    pub.World.initWorld = function () {
        this.days = [];
        this.fields = [];
        this.walls = [];

        this.desc = "World";
        this.initMoney = 100;
        this.currentDay = 0;
    };
    pub.World.build = function () {
        var s, x, y;

        pub.money = this.initMoney;
        pub.continues = 3;

        for (var i = 0; i < this.fields.length; i++) {
            x = this.fields[i].x;
            y = this.fields[i].y;
            s = RSTools.createObject(pub.Field);
            s.initField(pub.towerMinX + x * 50, pub.towerMinY + y * 50);
            pub.Level[x][y] = s;
        }
        for (var i = 0; i < this.walls.length; i++) {
            x = this.walls[i].x;
            y = this.walls[i].y;
            s = RSTools.createObject(pub.Wall);
            s.initWall(pub.towerMinX + x * 50, pub.towerMinY + y * 50);
            s.active = true;
            s.levelX = x;
            s.levelY = y;
            pub.Level[x][y] = s;
        }
    };
    pub.World.spawn = function () {
        if (this.days[this.currentDay].spawn()) {
            this.currentDay += 1;
            return true;
        }
    };

    pub.Day = function () {
        this.waves = [];

        this.counter = 0;
    };
    pub.Day.prototype.spawn = function () {
        var loopWave,allFinished=true;

        for (var i = 0; i < this.waves.length; i++) {
            loopWave = this.waves[i];
            if (!loopWave.finished && loopWave.start <= this.counter) {
                loopWave.spawn();
            }
            if (!loopWave.finished) {
                allFinished = false;
            }
        }

        this.counter += 1;

        return allFinished;
    };

    pub.Wave = function (_interval,_quantity,_enemy,_difficulty,_start) {
        this.interval = _interval;
        this.quantity = _quantity;
        this.enemy = _enemy;
        this.difficulty = _difficulty;
        this.start = _start;
        this.finished = false;

        this.counter = -1;
    }
    pub.Wave.prototype.spawn = function () {
        var e;

        if (this.counter === -1 || this.counter === this.interval) {
            this.quantity -= 1;
            this.counter = 0;

            if (this.quantity === 0) {
                this.finished = true;
            }

            e = RSTools.createObject(this.enemy);
            e.initEnemy(this.difficulty);
        }
        this.counter += 1;
    };

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));