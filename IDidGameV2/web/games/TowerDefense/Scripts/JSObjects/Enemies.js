var IDIDGAME_TowerDefense = (function (pub, undefined) {
    "use strict";
   
    pub.Enemy = RSTools.createObject(pub.Drawable);
    pub.Enemy.initEnemy = function (_difficulty) {
        this.difficulty = _difficulty || 0;

        this.initDrawable(290, 0, 200 * _difficulty, 50, 20, 20);
        this.speed = 1;
        this.health = 50 * (this.difficulty + 1);
        this.damage = 2;

        this.freezeFrames = 0;
        this.freezeSlow = 100;

        this.rotation = 0;
        
        this.routeOffsetX = Math.random() * 30 - 15;
        this.routeOffsetY = Math.random() * 30 - 15;
        this.posX += this.routeOffsetX;

        this.routePos = 0;
        //this.routeStep = 0;
        //this.routeXFactor = 0;
        //this.routeYFactor = 1;
        this.sinceLastNode = -65;

        pub.toUpdate.push(this);
        pub.enemies.push(this);

        this.healthBar = RSTools.createObject(pub.Bar);
        this.healthBar.initBar(22, 0, 3, 20, this.health, 0, this, "V");

        this.effectCircle = RSTools.createObject(pub.DrawableCircle);
        this.effectCircle.initCircle(0, 0, this.width / 2+1, "LightSkyBlue");
        this.effectCircle.drawParent = this;
        this.effectCircle.alpha = 0.3;
        this.effectCircle.remove();
    };
    pub.Enemy.update = function () {
        var routeStep,
            lastStepMod = 0,
            remainder,
            step1, step2,
            routeX, routeY;

        if (this.freezeFrames <= 0) {
            this.freezeSlow = 100;
            this.effectCircle.remove();
        } else{
            this.freezeFrames -= 1;
            this.effectCircle.add();
        }
        
        this.rotation += 3;

        this.healthBar.value = this.health;

        this.routePos += this.speed / this.freezeSlow * 100;

        if (this.routePos < 100) {
            this.posY = this.routePos - 10 + this.routeOffsetY;

            return;
        }

        routeStep = (this.routePos - 100) / 50;
        routeStep = Math.floor(routeStep);
        remainder = (this.routePos - 100) % 50;

        if (routeStep === pub.pathfinding.route.length) {
            routeStep -= 1;
            lastStepMod = 1;
        }

        this.posX = pub.pathfinding.route[routeStep].x * 50 + 50 - this.width / 2;
        this.posY = (pub.pathfinding.route[routeStep].y + lastStepMod) * 50 + 100 + 25 - this.height / 2;

        if ((routeStep === 0 && remainder<=25)|| (routeStep===pub.pathfinding.route.length-1 && remainder>=25)){
            if (remainder < 25) {
                this.posY -= 25 - remainder;
            } else {
                this.posY += remainder - 25;
            }
        }else{
            if (remainder < 25) {
                step1 = pub.pathfinding.route[routeStep - 1];
                step2 = pub.pathfinding.route[routeStep];
            } else {
                step2 = pub.pathfinding.route[routeStep];
                step1 = pub.pathfinding.route[routeStep+1];
            }

            routeX = step1.x - step2.x;
            routeY = step1.y - step2.y;
            
            if (remainder < 25) {
                remainder = 25 - remainder;
            } else {
                remainder = remainder - 25;
            }

            this.posX += remainder * routeX;
            this.posY += remainder * routeY;
        }
        
        this.posX += this.routeOffsetX;
        this.posY += this.routeOffsetY;
    }
    pub.Enemy.hit=function(opposition){
        if (opposition.damage) {
            this.health -= opposition.damage;

            if (this.health <= 0) {
                opposition.parent.tower.frags += 1;
                this.die();
            }
        }
    }
    pub.Enemy.die = function () {
        var dieing,
            dieCounter = 0,
            that = this,
            diss;

        diss = RSTools.createObject(pub.Disassemble);
        diss.init(this, 3, 3);

        RSTools.removeFromArray(pub.toUpdate, this);
        RSTools.removeFromArray(pub.enemies, this);
        this.healthBar.remove();
        this.effectCircle.remove();
        this.remove();

        /*dieing = function () {
            dieCounter++;
            that.alpha -= 0.1;
            if (dieCounter >= 10) {
                that.remove();
                return true;
            }
            return false;
        }

        pub.toCall.push(dieing);*/
    }

    pub.EnemySprinter = RSTools.createObject(pub.Enemy);
    pub.EnemySprinter.initEnemy = function (_difficulty) {
        this.resting = false;
        this.restingCounter = 0;

        pub.Enemy.initEnemy.apply(this, [_difficulty]);

        this.ispeed = this.speed;
    };
    pub.EnemySprinter.update = function () {
        var pX = this.posX,
            pY = this.posY;

        if (this.restingCounter === 0 || this.restingCounter === 20) {
            this.resting = !this.resting;
        }
           
        if (this.resting === true) {
            this.spriteX = 20 + 200 * this.difficulty;
            this.restingCounter += 1;
            this.speed = this.ispeed / 2;
        } else {
            this.spriteX = 40 + 200 * this.difficulty;
            this.restingCounter -= 1;
            this.speed = this.ispeed * 2;
        }


        pub.Enemy.update.apply(this);

        if (pX < this.posX) {
            this.rotation = 270;
        } else if (pX > this.posX) {
            this.rotation = 90;
        } else if (pY > this.posY) {
            this.rotation = 180;
        } else {
            this.rotation = 0;
        }
    }

    pub.EnemyWinder = RSTools.createObject(pub.Enemy);
    pub.EnemyWinder.initEnemy = function (_difficulty) {
        this.winding = false;
        this.restingCounter = 0;

        pub.Enemy.initEnemy.apply(this, [_difficulty]);

        this.windDirection = 1;
        if (Math.random > 0.5) {
            this.windDirection = -1;
        }
        this.windRotation = 0;

        this.spriteX = 60 + 200 * this.difficulty;
        this.ispeed = this.speed;
    };
    pub.EnemyWinder.update = function () {
        
        if (this.winding) {
            this.speed -= this.ispeed / 10;
            this.windRotation = 180 * this.speed / this.ispeed;

            if (this.speed < -this.ispeed) {
                this.winding = false;
                this.speed = 0;
            }
        } else {
            this.speed += this.ispeed / 10;
            this.windRotation = 180 - (180 * this.speed / (this.ispeed * 4));

            if (this.speed > this.ispeed * 4) {
                this.winding = true;
                this.speed = 0;
            }
        }

        pub.Enemy.update.apply(this);

        this.rotation = this.windRotation * this.windDirection;
    }

    pub.Bar = function(){
    };
    pub.Bar.initBar=function(_posX, _posY, _width, _height, _maxValue,_borderSize,_drawParent,_orientation) {
        this.iposX = _posX;
        this.iposY = _posY;
        this.posX = _posX;
        this.posY = _posY;
        this.width = _width;
        this.height = _height;
        this.maxValue = _maxValue;
        this.value = _maxValue;

        this.drawParent = _drawParent;
        this.borderSize = _borderSize;

        this.orientation =_orientation || 'H';

        this.inactiveColor = 'red';
        this.activeColor = 'blue';
        this.borderColor = 'white';

        this.changeBit = false;

        pub.toDraw.push(this);
        pub.toCommit.push(this);
    };
    pub.Bar.commitPosition = function (_changeBit) {
        if (this.changeBit === _changeBit) {
            return;
        }

        this.changeBit = _changeBit;

        if (this.drawParent) {
            this.drawParent.commitPosition(_changeBit);

            this.posX = this.drawParent.posX + this.iposX;
            this.posY = this.drawParent.posY + this.iposY;
        }
    };
    pub.Bar.draw = function () {

        pub.contextMain.globalAlpha = 0.5;

        pub.contextMain.fillStyle = this.inactiveColor;
        pub.contextMain.fillRect(this.posX, this.posY, this.width, this.height);
        pub.contextMain.fillStyle = this.activeColor;

        if (this.orientation === "H") {
            pub.contextMain.fillRect(this.posX, this.posY, this.width * this.value / this.maxValue, this.height);
        } else {
            pub.contextMain.fillRect(this.posX, this.posY, this.width, this.height * this.value / this.maxValue);
        }

        if (this.borderSize) {

            pub.contextMain.strokeStyle = this.borderColor;
            pub.contextMain.lineWidth = this.borderSize;
            pub.contextMain.strokeRect(this.posX , this.posY , this.width, this.height);
        }

        pub.contextMain.globalAlpha = 1;
    };
    pub.Bar.remove = function () {
        RSTools.removeFromArray(pub.toDraw, this);
        RSTools.removeFromArray(pub.toCommit, this);
    }

    pub.AStartGrid = function (_sizeX, _sizeY, _startX, _startY, _endX, _endY) {
        this.grid;

        this.sizeX = _sizeX;
        this.sizeY = _sizeY;

        this.startX = _startX;
        this.startY = _startY;

        this.endX = _endX;
        this.endY = _endY;

        this.endNode = undefined;
        this.pathPossible = false;

        this.route;

        this.build();

    }
    pub.AStartGrid.prototype.build = function () {
        var i, j;

        this.grid = [];

        pub.contextForeground.fillStyle = "White";

        for (i = 0; i < this.sizeX; i++) {
            this.grid[i] = [];
            for (j = 0; j < this.sizeY; j++) {
                this.grid[i][j] = new pub.AStarNode(i, j, this);

                //pub.contextForeground.fillText(this.grid[i][j].hValue, 35 + i * 50, 110 + j * 50);
            }
        }

        this.update();
    };
    pub.AStartGrid.prototype.update = function () {
        var i, j;

        if (pub.enemies.length > 0) {
            return;
        }

        for (i = 0; i < this.sizeX; i++) {
            for (j = 0; j < this.sizeY; j++) {
                this.grid[i][j].occupied = pub.Level[i][j] !== undefined;
                if (this.grid[i][j].occupied && pub.Field.isPrototypeOf(pub.Level[i][j])) {
                    this.grid[i][j].occupied = false;
                }
                this.grid[i][j].parent=undefined;
            }
        }
    }
    pub.AStartGrid.prototype.calculate = function () {
        var open = [],
            closed = [],
            i,
            j = 0,
            started =new Date().getTime();

        if (pub.enemies.length > 0) {
            return;
        }
        //pub.contextForeground.clearRect(25, 100, 550, 400);

        if (this.grid[this.startX][this.startY].occupied) {
            this.pathPossible = false;
            return;
        }


        if (this.grid[this.endX][this.endY].occupied) {
            this.pathPossible = false;
            return;
        }

        this.pathPossible = false;
        open.push(this.grid[this.startX][this.startY]);

        while (open.length>0) {
            for (i = 0; i < open.length; i++) {
                if (open[i].end) {
                    this.pathPossible = true;
                    break;
                }
            }

            if (this.pathPossible) {
                break;
            }

            open.sort(function (a, b) { return a.fValue - b.fValue });

            closed.push(open[0]);
            open= open.concat(open[0].getChildren(closed));
            open.splice(0, 1);

            j = j + 1;
        }

        this.route = [];
        this.endNode.buildRoute(this.route);

        pub.info = "steps:" + j.toString() + " time:" + (new Date().getTime() - started).toString();
    };
    pub.AStartGrid.prototype.paint = function () {
        if (this.pathPossible) {
            pub.contextMain.strokeStyle = "#474747";
            pub.contextMain.globalAlpha = 0.5;
            pub.contextMain.beginPath();
            this.endNode.paint();
            pub.contextMain.lineTo(300, 0);
            pub.contextMain.stroke();
            pub.contextMain.globalAlpha = 1;
        }
    };
    pub.AStartGrid.prototype.isOnRoute = function (x, y) {
        var i;

        for (i = 0; i < this.route.length; i++) {
            if (this.route[i].x === x && this.route[i].y === y) {
                return true;
            }
        }

        return false;
    }

    pub.AStarNode = function (_x, _y, _grid) {
        this.x = _x;
        this.y = _y;
        this.grid = _grid;
        this.occupied = false;
        this.end = this.x === this.grid.endX && this.y === this.grid.endY;
        if (this.end) {
            this.grid.endNode = this;
        }

        this.hValue = (Math.abs(this.x - this.grid.endX) + Math.abs(this.y - this.grid.endY)) * 10;
        this.gValue = 0;
    };
    pub.AStarNode.prototype.setParent = function (_parent) {
        this.parent = _parent;

        this.gValue = this.parent.gValue + 10;


        //pub.contextForeground.fillText(this.gValue, 45 + this.x * 50, 120 + this.y * 50);
    }
    Object.defineProperty(pub.AStarNode.prototype, "fValue", {
        get: function () { return this.hValue + this.gValue;}
    });
    pub.AStarNode.prototype.getChildren = function (closed) {
        this.children = [];

        this.tryAddChild(this.x - 1, this.y, this.children,closed);
        this.tryAddChild(this.x, this.y - 1, this.children,closed);
        this.tryAddChild(this.x + 1, this.y, this.children,closed);
        this.tryAddChild(this.x, this.y + 1, this.children,closed);

        return this.children;
    };
    pub.AStarNode.prototype.tryAddChild = function (x, y, children,closed) {
        var node;

        if (x < 0 || y < 0) {
            return;
        }

        if (x >= this.grid.sizeX || y >= this.grid.sizeY) {
            return;
        }

        node =this.grid.grid[x][y];

        if (node.occupied) {
            return;
        }

        if (closed.indexOf(node) >= 0) {
            return;
        }

        if (node.parent) {
            if (node.fValue > this.fValue + 10) {
                return;
            } else {
                node.setParent(this);
                return;
            }
        }

        node.setParent(this);
        children.push(node);
    }
    pub.AStarNode.prototype.paint = function (child) {
        var fromX, fromY,
            toX, toY,
            myX, myY,
            radius = 10;

        if (child) {
            fromX = child.x*50;
            fromY = child.y*50;
        } else {
            fromX = this.x * 50;
            fromY = this.y * 50 + 25;
        }

        if (this.parent) {
            toX = this.parent.x*50;
            toY = this.parent.y*50;
        } else {
            toX = this.x*50;
            toY = this.y*50 -100;
        }

        fromX += 50;
        fromY += 125;
        myX = this.x * 50 + 50;
        myY = this.y * 50 + 125;
        toX+=50;
        toY += 125;

        if (!child) {
            pub.contextMain.moveTo(fromX, fromY);
        }

        pub.contextMain.lineWidth = 5;
        pub.contextMain.arcTo(myX, myY, toX, toY, radius);
        
        if (this.parent) {
            this.parent.paint(this);
        }
    }
    pub.AStarNode.prototype.buildRoute = function (route) {
        if (this.parent) {
            this.parent.buildRoute(route);
        }

        route.push(this);
    }

    pub.LeftRoute;
    pub.getLeftRoute = function () {
        var i;

        pub.LeftRoute = [];

        this.visited = [];
        this.stepCount = 0;
        this.steps = [];
        this.xPos = 5;
        this.yPos = 0;
        this.xTarget = 5;
        this.yTarget = 7;

        this.finished = false;

        this.getScore = function (x, y) {
            var stepsScoreG, distanceScoreH;
            
            if (x === 5 && y === 7) {
                this.finished = true;
                pub.LeftRoute.push({ x: x, y: y });
                return false;
            }
            
            if (this.visited.indexOf(x * 1000 + y) >= 0) {
                return false;
            }

            if (x < 0 || y < 0) {
                return false;
            } else if (x >= 11 || y > 7) {
                return false;
            }

            if (pub.Level[x][y]) {
                return false;
            }
            
            stepsScoreG = this.steps.length;
            distanceScoreH = this.yTarget - y + Math.abs(x - this.xTarget);

            return stepsScoreG+distanceScoreH;
        };
        this.nextStep = function (x, y) {
            var i,
                score,
                scores = [];

            pub.LeftRoute.push({ x: x, y: y });
            this.visited.push(x * 1000 + y);

            this.xPos = x;
            this.yPos = y;

            console.log("x:" + this.xPos + " y:" + this.yPos);

            score = this.getScore(x - 1, y);
            if (score) {
                scores.push({ score: score, x: x - 1, y: y });
            }

            score = this.getScore(x, y + 1);
            if (score) {
                scores.push({ score: score, x: x, y: y + 1 });
            }

            score = this.getScore(x + 1, y);
            if (score) {
                scores.push({ score: score, x: x + 1, y: y });
            }

            score = this.getScore(x, y - 1);
            if (score) {
                scores.push({ score: score, x: x, y: y - 1 });
            }

            scores.sort(function (a, b) { return a.score - b.score });

            for (i = 0; i < scores.length; i++) {
                if (this.finished) {
                    return;
                }

                this.nextStep(scores[i].x, scores[i].y);
            }

            if (this.finished) {
                return;
            }

            pub.LeftRoute.splice(this.Route.length - 1, 1);
            this.visited.splice(this.visited.length - 1, 1);
        };

        this.nextStep(this.xPos, this.yPos);

        pub.contextMain.fillStyle = "Red";
        pub.contextMain.globalAlpha = 0.5;
        for (i = 0; i < pub.Route.length; i++) {
            pub.contextMain.fillRect(25 + (pub.Route[i].x) * 50, 100 + (pub.Route[i].y) * 50, 50, 50);
        }
        pub.contextMain.globalAlpha = 1;
    }

    return pub;
}(IDIDGAME_TowerDefense || {}, undefined));