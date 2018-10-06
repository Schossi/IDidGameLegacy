/// <reference path="../Main.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../RSTools.js" />
/// <reference path="GameContext.js" />
/// <reference path="Effects.js" />
/// <reference path="Prototypes.js" />
/// <reference path="Sound.js" />
/// <reference path="FireUtils.js" />
/// <reference path="UI.js" />

var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    
    //Game Specific Publics
    pub.blockSize = 20;
    pub.width = 14;
    pub.height = 27;
    pub.allowPushWood = true;
    pub.drawDebug = false;
    pub.playMoveSounds = false;
    //GSP

    pub.pxWidth=pub.width*pub.blockSize;
    pub.pxHeight=pub.height*pub.blockSize;

    var timerFunc = function () {
        if (pub.fire && pub.isActive && pub.currentGameState===pub.GameState.Game) {
            pub.fire.time += 1;
        }
        window.setTimeout(timerFunc, 1000);
    };
    timerFunc();

    pub.Grid = function () { };
    pub.Grid.initGrid = function (_gameContext) {
        var i, j,
            tempAction;

        this.gameContext = _gameContext;

        this.leftOff = (800 - pub.width * pub.blockSize) / 2;

        this.score = 0;
        this.lines = 0;
        this.time = 0;
        this.power = 0;
        this.maxPower = 10;
        this.level = 1;
        this.levelCounter = 0;
        this.maxLevelCounter = 50;
        this.levelAddend = 10;

        this.speedUpCounter = 0;

        this.queueBlowUp = false;

        this.arr = [];

        for (i = 0; i < pub.width; i++) {
            this.arr.push([]);
            for (j = 0; j < pub.height; j++) {
                this.arr[i].push(undefined);
            }
        }

        this.sets = [];

        this.fallCounter = RSTools.createObject(pub.Counter);
        this.fallCounter.initCounter(10);
        this.dropCounter = RSTools.createObject(pub.Counter);
        this.dropCounter.initCounter(20);

        this.removeCounter = RSTools.createObject(pub.Counter);
        this.removeCounter.initCounter(20);
        this.removeCounter.active = false;

        this.fireCounter = RSTools.createObject(pub.Counter);
        this.fireCounter.initCounter(30);
        this.fireCounter.active = false;
        this.fireState = 0;

        this.nextDropCounter = RSTools.createObject(pub.Counter);
        this.nextDropCounter.initCounter(5);

        this.scoreResetCounter = RSTools.createObject(pub.Counter);
        this.scoreResetCounter.initCounter(50);
        this.scoreResetCounter.active = false;
        this.addScore = 0;

        this.nextSet = RSTools.createObject(pub.Set);
        this.nextSet.initSet(this.gameContext, this);
        this.dropSet = undefined;

        this.removeBlocks = [];

        this.initBurners();
        this.initPushers();

        this.gameContext.toUpdate.push(this);

        tempAction= function (_state) {
            if (_state && pub.fire.dropSet) {
                pub.fire.dropSet.move(-1, 0);
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.ARR_LEFT, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.A, action: tempAction
        });

        tempAction = function (_state) {
            if (_state && pub.fire.dropSet) {
                pub.fire.dropSet.move(1, 0);
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.ARR_RIGHT, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.D, action: tempAction
        });

        tempAction=function (_state) {
            if (_state) {
                pub.fire.dropCounter.interval = 5;
            } else {
                pub.fire.dropCounter.interval = 20;
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.ARR_DOWN, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.S, action: tempAction
        });

        tempAction = function (_state) {
            if (_state) {
                pub.fire.dropSet.rotate();
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.ARR_UP, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.W, action: tempAction
        });

        tempAction = function (_state) {
            if (_state) {
                while (pub.fire.dropSet && pub.fire.dropSet.move(0, 1)) {

                }
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.ENTER, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.SPACE, action: tempAction
        });

        tempAction = function (_state) {
            if (_state) {
                pub.fire.ignite();
            } else {
                pub.fire.burnersOff();
            }
        };

        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.CTRL, action: tempAction
        });
        this.gameContext.onKeyChange.push({
            key: RSTools.Keys.Q, action: tempAction
        });

        this.zIndex = -10;
        this.gameContext.addToDraw(this);
    };
    pub.Grid.initPushers = function () {
        var i, pusher, hatch;

        this.pushers = [];

        for (i = 0; i < pub.height; i++) {
            pusher = RSTools.createObject(pub.Drawable);
            pusher.initDrawable(this.gameContext, pub.fire.leftOff + pub.width * pub.blockSize, (i + 2) * pub.blockSize, 7 * pub.blockSize, 0, pub.blockSize * 20, pub.blockSize, -10);
            this.pushers.push(pusher);
        }

        this.hatches = [];

        for (i = 0; i < pub.height; i++) {
            hatch = RSTools.createObject(pub.Drawable);
            hatch.initDrawable(this.gameContext, pub.fire.leftOff - pub.blockSize, (i + 2) * pub.blockSize, 3 * pub.blockSize, 2 * pub.blockSize, pub.blockSize, pub.blockSize, 10);
            this.hatches.push(hatch);
        }
    };
    pub.Grid.initBurners = function () {
        var i, burner;

        this.burners = [];

        for (i = 0; i < pub.width; i++) {
            burner = RSTools.createObject(pub.Drawable);
            burner.initDrawable(this.gameContext,pub.fire.leftOff+ i * pub.blockSize, (pub.height + 1) * pub.blockSize, 3 * pub.blockSize, 0, pub.blockSize, pub.blockSize * 2, -10);
            this.burners.push(burner);
        }
    };
    pub.Grid.burnersOn = function () {
        var i,burner;

        for (i = 0; i < this.burners.length; i++) {
            burner = this.burners[i];
            burner.spriteX = 4 * pub.blockSize;
            burner.initAnimation(pub.blockSize, 0, 1, 5);
        }
        
        pub.sound.distorted.requested = true;
    };
    pub.Grid.burnersOff = function () {
        var i, burner;

        for (i = 0; i < this.burners.length; i++) {
            burner = this.burners[i];
            burner.spriteX = 3 * pub.blockSize;
            burner.stopAnimation();
        }

        pub.sound.distorted.stop();
    };
    pub.Grid.ignite = function () {
        var i,
            block;
        
        if (this.power === this.maxPower) {

            this.power = 0;
            this.maxPower += 1;

            this.burnersOn();

            for (i = 0; i < pub.width; i++) {
                block = this.arr[i][pub.height - 1];

                if (block && !block.dropping && block.flameCounter === 0 && block.type == pub.BlockType.Wood) {
                    block.ignite();
                }
            }
        }
    };
    pub.Grid.blowUp = function () {
        var i, set;

        pub.sound.explosion.requested = true;

        this.gameContext.rumbleCounter = 5;

        for (var i = this.sets.length-1; i >= 0; i--) {
            set = this.sets[i];
            if (set.blocks.length > 0 && set.blocks[0].type === pub.BlockType.Stone) {
                set.blowUp();
            }
        }
    };
    pub.Grid.draw = function () {
        var context = this.gameContext.drawingContext,
            i, j,
            pos;

        if (pub.drawDebug) {
            for (i = 0; i < pub.height; i++) {
                for (j = 0; j < pub.width; j++) {
                    if (this.arr[j][i]) {
                        context.fillStyle = "Red";
                        context.fillRect(j * pub.blockSize, i * pub.blockSize, pub.blockSize, pub.blockSize);
                        pos = this.arr[j][i].getGridPos();
                        if (pos.x !== j || pos.y !== i) {
                            alert("damn");
                        }
                    }
                }
            }
        }
    };
    pub.Grid.addDropSet = function () {
        this.power = Math.min(this.maxPower, this.power + 1);
        this.nextDropCounter.active = true;
    };
    pub.Grid.update = function () {
        var i,
            removeRows,
            amount;

        if (this.removeCounter.active) {
            this.removeCounter.update();

            if (this.removeCounter.triggered) {
                this.removeCounter.reset();
                this.removeCounter.active = false;

                for ( i = 0; i < this.removeBlocks.length; i++) {
                    this.removeBlocks[i].remove();
                }
                this.removeBlocks = [];

                for (i = 0; i < this.pushers.length; i++) {
                    this.pushers[i].posX =this.leftOff+ pub.width * pub.blockSize;

                    this.hatches[i].spriteX = pub.blockSize * 3;
                }

            } else {
                amount = pub.width * pub.blockSize / this.removeCounter.interval;
                removeRows = [];
                for (i = 0; i < this.removeBlocks.length; i++) {
                    this.removeBlocks[i].iposX -= amount;
                    if (removeRows.indexOf(this.removeBlocks[i].getGridPos().y, 0) < 0) {
                        removeRows.push(this.removeBlocks[i].getGridPos().y)
                    }
                }

                for (i = 0; i < removeRows.length; i++) {

                    if (this.removeCounter.counter < this.removeCounter.interval/2) {
                        this.pushers[removeRows[i]].posX -= amount;
                    } else {
                        this.pushers[removeRows[i]].posX += amount;
                    }

                    this.hatches[removeRows[i]].spriteX = pub.blockSize * 4;
                }
            }

            return;
        }

        this.fallCounter.update();
        this.dropCounter.update();
        this.nextDropCounter.update();
        this.scoreResetCounter.update();
                
        if (this.nextDropCounter.triggered) {
            this.nextDropCounter.reset();
            this.nextDropCounter.active = false;

            this.dropSet = this.nextSet;
            this.dropSet.initPosition();
            this.dropSet.setAllBlocks(function () {
                this.addToGrid();
            });

            this.nextSet = RSTools.createObject(pub.Set);
            this.nextSet.initSet(this.gameContext, this);
        }

        if (this.fallCounter.triggered) {
            this.fallCounter.reset();

            for ( i = 0; i < this.sets.length; i++) {
                this.sets[i].move(0, 1);
            }
        }

        if (this.dropCounter.triggered) {
            this.dropCounter.reset();

            if (this.dropSet) {
                this.dropSet.move(0, 1);
            }
        }

        if (this.scoreResetCounter.triggered) {
            this.addScore = 0;
            this.scoreResetCounter.reset();
            this.scoreResetCounter.active = false;
            
            if (this.queueBlowUp) {
                this.queueBlowUp = false;
                this.blowUp();
            }
        }

        this.removeCounter.active= this.checkFullRows();
    };
    pub.Grid.checkFullRows = function () {
        var i, j,
            rowFull,
            anyRemoved = false,
            block;
        
        for (i = 0; i < pub.height; i++) {
            rowFull = true;
            for (j = 0; j < pub.width; j++) {
                block = this.arr[j][i];
                if (!block || block.set.dropping || (block.type !== pub.BlockType.Stone && !pub.allowPushWood)) {
                    rowFull = false;
                }
            }

            if (rowFull) {
                this.lines += 1;
                anyRemoved = true;
                for (j = 0; j < pub.width; j++) {
                    block = this.arr[j][i];
                    block.score();
                    block.borders = [1, 1, 1, 1];
                    this.removeBlocks.push(block);
                    block.removeFromLogic();
                }
            }
        }

        if (anyRemoved) {
            pub.sound.shaker.requested = true;

            for (i = 0; i < this.sets.length; i++) {
                this.sets[i].splitGroup = -1;
                this.sets[i].splitGroups = [[],[]];
            }

            for (i = 0; i < pub.height; i++) {
                for (j = 0; j < pub.width; j++) {
                    block = this.arr[j][i];
                    if (block) {
                        block.splitGroup = -1;
                    }
                }
            }

            for (i = 0; i < pub.height; i++) {
                for (j = 0; j < pub.width; j++) {
                    block = this.arr[j][i];
                    if (block && block.splitGroup < 0) {
                        //if (block.set.splitGroup<0 || block.set.splitGroup < block.splitGroup)
                        block.set.addSplitGroup();
                        block.setSplitGroup(block.set.splitGroup);
                    }
                }
            }

            for (i = 0; i < this.sets.length; i++) {
                this.sets[i].split();
            }

            for (i = 0; i < this.sets.length; i++) {
                this.sets[i].splitGroup = -1;
            }
        }

        return anyRemoved;
    };
    pub.Grid.getScore = function () {
        if (pub.currentGameState != pub.GameState.Game) {
            return 0;
        }

        this.addScore += 1;
        this.score += this.addScore;
        this.scoreResetCounter.reset();
        this.addToLevelCounter();
        return this.addScore;
    };
    pub.Grid.addToLevelCounter = function () {
        var raiseSpeed = false;

        this.levelCounter += 1;
        if (this.levelCounter === this.maxLevelCounter) {
            this.levelCounter = 0;
            this.level += 1;
            this.queueBlowUp = true;

            if (this.dropCounter.interval > 15) {
                this.dropCounter.interval -= 1;
            } else {
                this.speedUpCounter += 1;
                if (this.dropCounter.interval > 12) {
                    if (this.speedUpCounter === 2) {
                        raiseSpeed = true;
                    }
                } else if (this.dropCounter.interval > 8) {
                    if (this.speedUpCounter === 3) {
                        raiseSpeed = true;
                    }
                } else if (this.dropCounter.interval > 5) {
                    if (this.speedUpCounter === 5) {
                        raiseSpeed = true;
                    }
                }

                if (raiseSpeed) {
                    this.dropCounter.interval -= 1;
                    this.speedUpCounter = 0;
                }
            }
        }
    };
    
    pub.superABlockCounter = 0;

    pub.Set = function () { };
    pub.Set.initSet = function (_gameContext,_grid,_skipBlocks) {
        var i;

        this.burntBlocks = 0;

        this.gameContext = _gameContext;
        this.grid = _grid;
        this.blocks = [];
        
        this.splitGroup = 0;
        this.splitGroups = [[]];

        this.posX = 120;
        this.posY = 230;

        this.gridPosX = -100;
        this.gridPosY = -100;

        //this.SetPosFromGrid();

        this.counter = 0;
        this.dropping = true;
        this.moveValid = false;

        if (!_skipBlocks) {
            this.initBlocks();
        }

        this.refreshBorders();
    };
    pub.Set.initPosition = function () {
        this.gridPosX = pub.width / 2 - 1;
        this.gridPosY = -1;
        this.SetPosFromGrid();
    };
    pub.Set.initBlocks = function () {
        var type = (Math.random() > 0.4) + 5 - 5,
            shape = Math.floor(Math.random() * 7),
            assblock = Math.random() < Math.max(10, Math.min(40, pub.fire.level)) / 100,
            block;

        pub.superABlockCounter += 1;

        if (pub.superABlockCounter>=15) {
            pub.superABlockCounter = 0;

            switch (shape) {
                case 0:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 2);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 2);
                    break;
                case 1:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 2, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 2);
                    break;
                case 2:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -2, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    break;
                case 3:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    break;
                case 4:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 2);
                    break;
                case 5:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    break;
                case 6:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 2);
                    break;
            }
        }
        else if (assblock) {
            switch (shape) {
                case 0:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 2);
                    break;
                case 1:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 2, 1);
                    break;
                case 2:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -2, 1);
                    break;
                case 3:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    break;
                case 4:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    break;
                case 5:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, -1);
                    break;
                case 6:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1);
                    break;
            }
        }else{
            switch (shape) {
                case 0:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 2);
                    break;
                case 1:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1)
                    break;
                case 2:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1)
                    break;
                case 3:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0)
                    break;
                case 4:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 0)
                    break;
                case 5:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, -1, 1)
                    break;
                case 6:
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, -1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 0);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 0, 1);
                    block = RSTools.createObject(pub.Block);
                    block.initBlock(this.gameContext, this, type, 1, 1)
                    break;
            }
        }
    };
    pub.Set.addSplitGroup= function () {
        this.splitGroups.push([]);
        this.splitGroup += 1;
    };
    pub.Set.split = function () {
        var i, j,
            set,
            block,
            before,after;

        for (i = 1; i < this.splitGroups.length; i++) {
            if (this.splitGroups[i].length > 0) {
                set = RSTools.createObject(pub.Set);
                set.initSet(this.gameContext, this.grid, true);
                set.gridPosX = this.gridPosX;
                set.gridPosY = this.gridPosY;
                set.dropping = false;
                set.SetPosFromGrid();

                for (j = this.splitGroups[i].length - 1; j > -1; j--) {
                    block = this.splitGroups[i][j];

                    block.set = set;
                    block.drawParent = set;
                    block.commitPosition();

                    set.blocks.push(block);
                    before = block.getGridPos();
                    RSTools.removeFromArray(this.blocks, block);

                    after = this.splitGroups[i][j].getGridPos();

                    if (before.x !== after.x || before.y !== after.y) {
                        alert("damn");
                    }
                }

                set.refreshBorders();
                this.grid.sets.push(set);
            }
        }

        this.refreshBorders();
    };
    pub.Set.refreshBorders = function () {
        var i;

        for (i = 0; i < this.blocks.length; i++) {
            this.blocks[i].refreshBorders();
        }
    };
    pub.Set.move = function (_moveX,_moveY) {
        var i,moved;

        this.setAllBlocks(function () {
            this.removeFromGrid();
        });

        this.gridPosX += _moveX;
        this.gridPosY += _moveY;

        this.moveValid = true;
        this.setAllBlocks(function () {
            if (!this.positionValid()) {
                this.set.moveValid = false;
            }
        });


        if (_moveY === 0 && pub.playMoveSounds) {
            if (this.moveValid) {
                pub.sound.bassLow.requested = true;
            } else {
                pub.sound.bassHigh.requested = true;
            }
        }


        if (this.moveValid) {
            
            this.SetPosFromGrid();
            moved = true;
        }else{
            this.gridPosX -= _moveX;
            this.gridPosY -= _moveY;

            if (this.gridPosY <= 0 && _moveY === 1) {
                this.grid.dropSet = undefined;
                this.gameContext.setGameState(pub.GameState.GameEnd);
            } else if (this.dropping && _moveY === 1) {

                pub.sound.hat.requested = true;
                this.dropping = false;
                this.grid.sets.push(this);
                this.grid.addDropSet();
            }
            moved = false;
        }

        this.setAllBlocks(function () {
            this.addToGrid();
        });
        
        return moved;
    };
    pub.Set.rotate = function () {
        var moved;

        this.setAllBlocks(function () {
            this.removeFromGrid();
        });

        this.setAllBlocks(function () {
            this.rotate();
        });

        this.moveValid = true;
        this.setAllBlocks(function () {
            if (!this.positionValid()) {
                this.set.moveValid = false;
            }
        });
        
        if (this.moveValid) {
            moved = true;

            if (pub.playMoveSounds)
                pub.sound.bassLow.requested = true;
        } else {
            this.setAllBlocks(function () {
                this.revertPos();
            });

            moved = false;

            if (pub.playMoveSounds)
                pub.sound.bassHigh.requested = true;
        }
        
        this.setAllBlocks(function () {
            this.SetPosFromGrid();
            this.addToGrid();
        });

        this.refreshBorders();

        return moved;
    };
    pub.Set.SetPosFromGrid = function () {
        this.posX = this.grid.leftOff+ (this.gridPosX ) * pub.blockSize;
        this.posY = (this.gridPosY + 2) * pub.blockSize;
    };
    pub.Set.setAllBlocks = function (_set) {
        var i;

        for ( i = 0; i < this.blocks.length; i++) {
            _set.apply(this.blocks[i], []);
        }
    }
    pub.Set.update = function () {

    };
    pub.Set.commitPosition = function () {

    };
    pub.Set.remove = function () {
        var i;

        for (i = this.blocks.length - 1; i >= 0; i--) {
            this.blocks[i].remove();
            this.blocks[i].removeFromLogic();
        }

        RSTools.removeFromArray(this.grid.sets, this);
    };
    pub.Set.blockBurntUp = function () {
        this.burntBlocks += 1;

        pub.sound.hatLow.requested = true;

        if (this.burntBlocks === this.blocks.length) {
            this.remove();
        }
    };
    pub.Set.blowUp = function () {
        var block, set,
            i;

        for (i = this.blocks.length-1; i >= 0; i--) {
            block = this.blocks[i];

            set = RSTools.createObject(pub.Set);
            set.initSet(this.gameContext, this.grid, true);
            set.gridPosX = this.gridPosX;
            set.gridPosY = this.gridPosY;
            set.dropping = false;
            set.SetPosFromGrid();

            block.set = set;
            block.drawParent = set;
            block.commitPosition();

            set.blocks.push(block);
            set.refreshBorders();
            this.grid.sets.push(set);
        }
        
        RSTools.removeFromArray(this.grid.sets, this);
    };

    pub.Block = RSTools.createObject(pub.Drawable);
    pub.Block.initBlock = function (_gameContext, _set, _type, _posX, _posY) {
        this.initDrawable(_gameContext, _posX * pub.blockSize, _posY * pub.blockSize, _type * pub.blockSize, 0, pub.blockSize, pub.blockSize, 0);

        this.gridPosX = _posX;
        this.gridPosY = _posY;

        this.prevX = 0;
        this.prevY = 0;

        this.attached = true;

        this.flameCounter = 0;

        this.set = _set;
        this.type = _type;

        this.borders = [0, 0, 0, 0];

        this.drawParent = this.set;
        this.set.blocks.push(this);
        this.commitPosition();
    };
    pub.Block.refreshBorders = function () {
        var i,
            b;

        this.borders = [1, 1, 1, 1];

        for ( i = 0; i < this.set.blocks.length; i++) {
            b=this.set.blocks[i];
            if (b.gridPosX === this.gridPosX) {
                if (b.gridPosY === this.gridPosY - 1) {
                    this.borders[1] = 0;
                } else if (b.gridPosY === this.gridPosY + 1) {
                    this.borders[3] = 0;
                }
            } else if (b.gridPosY === this.gridPosY) {
                if (b.gridPosX === this.gridPosX - 1) {
                    this.borders[0] = 0;
                } else if (b.gridPosX === this.gridPosX + 1) {
                    this.borders[2] = 0;
                }
            }
        }
    };
    pub.Block.drawBorders = function () {
        var context = this.gameContext.drawingContext;

        context.fillStyle = "Black";
        if (this.borders[0]) {//Left
            context.fillRect(this.posX-1, this.posY, 2, this.height);
        }
        if (this.borders[1]) {//Top
            context.fillRect(this.posX, this.posY-1, this.width, 2);
        }
        if (this.borders[2]) {//Right
            context.fillRect(this.posX+this.width-1, this.posY, 2, this.height);
        }
        if (this.borders[3]) {//Bottom
            context.fillRect(this.posX, this.posY+this.height-1, this.width, 2);
        }
    };
    pub.Block.draw = function () {
        pub.Drawable.draw.apply(this, []);
        this.drawBorders();
    };
    pub.Block.removeFromLogic = function () {
        this.removeFromGrid();
        RSTools.removeFromArray(this.set.blocks, this);
        //this.set.checkSplit();
    };
    pub.Block.score = function () {
        var s = RSTools.createObject(pub.Score),
            amount=this.set.grid.getScore();

        s.initScore(this.gameContext, this.posX, this.posY, amount);
    };
    pub.Block.setSplitGroup = function (_group) {
        var cur,
            adj,
            i;
            
        this.splitGroup = _group;
        this.set.splitGroups[_group].push(this);
               
        adj =this.getAdjacent();

        for (var i = 0; i < 4; i++) {
            cur=adj[i];
            if (cur && cur.set===this.set && cur.splitGroup<0) {
                cur.setSplitGroup(_group);
                break;
            }
        }

        //if(grid.arr)

    };
    pub.Block.getAdjacent = function () {
        var grid = this.set.grid,
            left, top, right, bottom,
            pos = this.getGridPos();

        if (pos.x > 0) {
            left = grid.arr[pos.x - 1][pos.y];
        }
        if (pos.y > 0) {
            top = grid.arr[pos.x][pos.y - 1];
        }
        if (pos.x < pub.width - 1) {
            right = grid.arr[pos.x + 1][pos.y];
        }
        if (pos.y < pub.height - 1) {
            bottom = grid.arr[pos.x][pos.y + 1];
        }

        return  [left, top, right, bottom];
    };
    pub.Block.setSplitGroupBlock = function (_block) {
        if (block.set === this.set) {
            return true;
        }
        return false;
    };
    pub.Block.rotate = function () {
        this.prevX = this.gridPosX,
        this.prevY = this.gridPosY;
        
        this.gridPosY = this.prevX;
        this.gridPosX = -this.prevY;
    };
    pub.Block.revertPos = function () {
        this.gridPosX = this.prevX;
        this.gridPosY = this.prevY;
    };
    pub.Block.SetPosFromGrid = function () {
        this.iposX = this.gridPosX * pub.blockSize;
        this.iposY = this.gridPosY * pub.blockSize;
    };
    pub.Block.removeFromGrid = function () {
        var pos = this.getGridPos();

        this.set.grid.arr[pos.x][pos.y] = undefined;
    };
    pub.Block.addToGrid = function () {
        var pos = this.getGridPos();

        this.set.grid.arr[pos.x][pos.y] = this;
    };
    pub.Block.positionValid = function () {
        var pos = this.getGridPos();

        if (pos.x < 0 || pos.x >= pub.width || pos.y >= pub.height)
            return false;

        return this.set.grid.arr[pos.x][pos.y] === undefined;
    };
    pub.Block.getGridPos = function () {
        return { x: this.gridPosX + this.set.gridPosX, y: this.gridPosY + this.set.gridPosY };
    }
    pub.Block.ignite = function () {
        this.spriteY = pub.blockSize;
        this.gameContext.toUpdate.push(this);
    };
    pub.Block.update = function () {
        var adj, i, cur;

        if (this.flameCounter === 3) {//igniteNeighbors
            adj = this.getAdjacent();
                        
            for (var i = 0; i < 4; i++) {
                cur = adj[i];
                if (cur && !cur.set.dropping && cur.type === pub.BlockType.Wood && cur.flameCounter === 0) {
                    cur.ignite();
                }
            }
        } else if (this.flameCounter === 8) {//burntOut
            this.spriteY = pub.blockSize * 2;
        } else if (this.flameCounter === 10) {//readyForRemove
            this.score();
            this.set.blockBurntUp(this);
            return true;
        }

        this.flameCounter += 1;
    }

    pub.BlockType = {
        Stone: 0,
        Wood: 1
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));