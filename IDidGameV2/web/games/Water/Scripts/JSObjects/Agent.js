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
    var getAgentColor;

    getAgentColor = function () {
        var colors = [];

        colors.push({ r: 1, g: 0, b: 0 });
        colors.push({ r: 0, g: 1, b: 0 });
        colors.push({ r: 0, g: 0, b: 1 });

        return colors[Math.floor(Math.random() * colors.length)];
    }

    pub.WorkerCount = 0;

    pub.unemployedAgents = [];

    pub.Agent = function () { };
    pub.Agent.initAgent = function (_gameContext,_x,_y,_building) {

        this.gameContext = _gameContext;
        this.map = this.gameContext.TileMap;
        this.map.agents.push(this);

        this.num = pub.WorkerCount;
        pub.WorkerCount += 1;

        this.gender = Math.floor(Math.random() * 2);
        this.color = getAgentColor();

        this.x = _x;
        this.y = _y;

        this.offX = Math.random() * 0.3 - 0.15;
        this.offY = Math.random() * 0.3 - 0.15;

        this.posX = _x;
        this.posY = _y - 1;

        this.spriteX = 0;
        this.spriteY = 0;

        this.outfit = pub.AgentOutfit.Casual;

        this.building = _building;
        this.work = false;

        this.workRoute = false;
        this.homeRoute = false;

        pub.unemployedAgents.push(this);

        this.targetX=0;
        this.targetY=0;

        this.speed=20;
        this.counter = 0;
        this.step = 0;

        this.walkCounter = 0;
        this.stepSkipped = false;

        this.resourceQuantity = 0;
        this.resourceType = 0;
        
        this.target = false;
        this.mode = 0;

        this.plantClass = false;
        this.plantType = false;

        this.busy = false;
        this.visible = false;

        this.route = false;
        this.resource = false;

        this.resources = RSTools.createObject(pub.ResArray);
        this.resources.init();
        
        this.state = pub.AgentState.idle;
        this.routineState = pub.AgentRoutineState.Home;
        this.overtime = 0;

        //this.initRect(_gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "Red", 2);

        this.gameContext.toUpdate.push(this);
    };
    pub.Agent.update = function () {
        var struc;

        switch (this.state) {
            case pub.AgentState.idle:
                this.busy = false;
                this.routine();
                break;
            case pub.AgentState.start:

                console.log("Worker" + this.num + ":" + this.mode);

                this.doWalkAnim();

                this.posY += this.map.tileSize / this.speed;

                if (this.visible == false && this.counter > this.speed / 2) {
                    this.visible = true;
                }

                if (this.counter === this.speed) {
                    this.counter = 0;
                    this.state = pub.AgentState.walk;
                    this.setSubStep(1);
                }
                
                this.counter += 1;
                break;
            case pub.AgentState.walk:
                if (this.route) {
                    if (this.walkRoute(false)) {
                        this.state = pub.AgentState.work;
                    }
                } else {
                    this.state = pub.AgentState.work;
                }
                break;
            case pub.AgentState.work:
                if (this.counter === 100) {
                    this.counter = 0;
                    this.state = pub.AgentState.finishWork;
                }
                this.counter += 1;
                break;
            case pub.AgentState.finishWork:

                this.state = pub.AgentState.walkBack;

                if (this.mode === pub.AgentMode.GetResource) {
                    this.resourceType = this.target.resourceType;
                    this.resourceQuantity = this.target.use();
                } else if (this.mode === pub.AgentMode.TransferFromTarget) {
                    this.target.resources.subtract(this.resources);
                    this.target.resources.unreserve(this.resources);
                } else if (this.mode === pub.AgentMode.TransferToTarget) {
                    this.target.resources.add(this.resources);
                } else if (this.mode === pub.AgentMode.Build) {
                    this.target.built = true;
                } else if (this.mode === pub.AgentMode.Plant) {
                    struc = RSTools.createObject(this.plantClass);
                    struc.init(this.gameContext,this.x,this.y,this.plantType);
                } else if (this.mode === pub.AgentMode.GoHome || this.mode === pub.AgentMode.GoWork) {
                    if (this.mode === pub.AgentMode.GoHome) {
                        this.routineState = pub.AgentRoutineState.Home;
                        this.state = pub.AgentState.finish;
                    } else if (this.mode === pub.AgentMode.GoWork) {
                        this.routineState = pub.AgentRoutineState.Work;
                        this.state = pub.AgentState.finish;
                    }

                    if (this.building === this.work) {
                        this.state = pub.AgentState.done;
                    }
                }

                break;
            case pub.AgentState.walkBack:
                if (this.route) {
                    if (this.walkRoute(true)) {
                        this.state = pub.AgentState.finish;
                    }
                } else {
                    this.state = pub.AgentState.finish;
                }
                break;
            case pub.AgentState.finish:

                this.doWalkAnim();

                this.posY -= this.map.tileSize / this.speed;

                if (this.visible && this.counter > this.speed / 2) {
                    this.visible = false;
                }

                if (this.counter === this.speed) {
                    this.counter = 0;
                    this.state = pub.AgentState.done;
                    this.setSubStep(1);
                }

                this.counter += 1;

                break;
            case pub.AgentState.done:

                this.route = false;
                this.step = 0;
                this.counter = 0;
                this.state = pub.AgentState.idle;

                if (this.mode < pub.AgentMode.TransferToTarget) {
                    this.work.resources[this.resourceType] += this.resourceQuantity;
                }

                if (this.mode === pub.AgentMode.GoWork) {
                    this.work.workerIn(this);
                }

                break;
        }
    };
    pub.Agent.routine = function () {
        if (this.routineState === pub.AgentRoutineState.Home) {
            if (this.work && (this.gameContext.daytime === pub.Daytime.Morning || this.gameContext.daytime === pub.Daytime.Day)) {
                this.busy = true;
                if (this.overtime <= 0) {
                    this.goWork();
                    this.overtime = Math.random() * 100;
                } else {
                    this.overtime -= 1;
                }
            }
        } else if (this.routineState === pub.AgentRoutineState.Work) {
            if (this.gameContext.daytime === pub.Daytime.Evening || this.gameContext.daytime === pub.Daytime.Night) {
                this.busy = true;
                if (this.overtime <= 0) {
                    this.goHome();
                    this.work.workerOut(this);
                    this.overtime = Math.random() * 50;
                } else {
                    this.overtime -= 1;
                }
            }
        }
    };
    pub.Agent.doWalkAnim = function () {

        if (this.walkCounter === 10) {
            if (this.spriteY === 0) {
                this.spriteY = 1;
            } else {
                this.spriteY = 0;
            }
            this.walkCounter = 0;
        }
        this.walkCounter += 1;
    };
    pub.Agent.walkRoute = function (_return) {
        var nextStep;

        this.doWalkAnim();

        if (this.counter === this.speed) {

            this.counter = 0;

            if (_return) {
                this.step -= 1;
                nextStep = this.step - 1;
            } else {
                this.step += 1;
                nextStep = this.step + 1;
            }

            if (_return && this.step === -1) {                
                return true;
            } else if (this.route[this.step] == undefined) {                
                return true;
            }


            this.x = (this.route[this.step].tileX);
            this.y = (this.route[this.step].tileY);

            this.posX = this.x * this.map.tileSize;
            this.posY = this.y * this.map.tileSize;

            this.setSubStep(nextStep);
        }

        this.counter += 1;

        if (this.xStep) {
            this.posX += this.xStep;
        }
        if (this.yStep) {
            this.posY += this.yStep;
        }
    };
    pub.Agent.setSubStep = function (nextStep) {
        var nextX, nextY;

        this.xStep = 0;
        this.yStep = 0;

        if (this.route[nextStep]) {

            nextX = (this.route[nextStep].tileX);
            nextY = (this.route[nextStep].tileY);

            if (this.y < nextY) {//down
                this.spriteX = 0;
                this.yStep = this.map.tileSize / this.speed;
            } else if (this.x < nextX) {//right
                this.spriteX = 1;
                this.xStep = this.map.tileSize / this.speed;
            } else if (this.x > nextX) {//left
                this.spriteX = 2;
                this.xStep = -this.map.tileSize / this.speed;
            } else if (this.y > nextY) {//up
                this.spriteX = 3;
                this.yStep = -this.map.tileSize / this.speed;
            }
        }
    };
    pub.Agent.getResource = function (_resource, _maxDistance) {
        this.target = _resource;
        this.route = this.map.getRoute(this.x, this.y, _resource.x, _resource.y, this.x - _maxDistance, this.y - _maxDistance, _maxDistance);

        if (this.route) {
            this.target.reserve();
            this.mode = pub.AgentMode.GetResource;
            this.state = pub.AgentState.start;
            this.busy = true;
            return true;
        }
        return false;
    };
    pub.Agent.transferResource = function (_route,_target,_resourceType,_resourceQuantity,_bring) {
        this.route = _route;
        this.target = _target;
        this.resourceType = _resourceType;
        this.resourceQuantity = _resourceQuantity;

        if (this.route) {

            this.resources.init();
            this.resources[this.resourceType] = this.resourceQuantity;

            if (_bring) {
                this.mode = pub.AgentMode.TransferToTarget;
                this.work.resources.subtract(this.resources);
            } else {
                this.mode = pub.AgentMode.TransferFromTarget;
                this.target.resources.reserve(this.resources);
            }

            this.state = pub.AgentState.start;
            this.busy = true;
            return true;
        }
    };
    pub.Agent.build = function (_route, _target) {
        this.route = _route;
        this.target = _target;

        this.mode = pub.AgentMode.Build;
        this.state = pub.AgentState.start;
        this.busy = true;
        return true;
    };
    pub.Agent.plant = function (_x,_y, _class,_type,_maxDistance) {
        this.route = this.map.getRoute(this.x, this.y, _x, _y, this.x - _maxDistance, this.y - _maxDistance, _maxDistance);

        if (this.route) {
            this.plantClass = _class;
            this.plantType = _type;

            this.mode = pub.AgentMode.Plant;
            this.state = pub.AgentState.start;
            this.busy = true;
            return true;
        }
        return false;
    };
    pub.Agent.goWork = function () {
        this.route = this.workRoute;
        this.target = this.work;

        this.mode = pub.AgentMode.GoWork;
        this.state = pub.AgentState.start;
        this.busy = true;

        if (this.building === this.work) {
            this.state = pub.AgentState.finishWork;
        }

        return true;
    };
    pub.Agent.goHome = function () {
        this.route = this.homeRoute;
        this.target = this.building;

        this.mode = pub.AgentMode.GoHome;
        this.state = pub.AgentState.start;
        this.busy = true;
        
        if (this.building === this.work) {
            this.state = pub.AgentState.finishWork;
        }

        return true;
    };
    pub.Agent.employ = function (_structure) {
        var i, allEmployed = true;

        _structure.worker = this;
        this.work = _structure;

        this.workRoute = this.map.getStreetRoute(this.building.entryX, this.building.entryY, this.work, 20).route;
        this.homeRoute = this.map.getStreetRoute(this.work.entryX, this.work.entryY, this.building, 20).route;

        RSTools.removeFromArray(pub.unemployedAgents, this);

        if (this.building.resources[pub.ResourceType.Worker] > 0) {
            for (i = 0; i < this.building.workers.length; i++) {
                if (this.building.workers[i].work === false) {
                    allEmployed = false;
                    break;
                }
            }

            if (allEmployed) {
                this.building.resources[pub.ResourceType.Worker] = 0;
            }
        }
    };

    pub.AgentOutfit = {
        Woodsman: 0,
        Casual: 2,
        Farmer: 4
    };

    pub.AgentMode = {
        GetResource: 0,
        TransferFromTarget: 1,
        TransferToTarget: 2,
        Build: 3,
        Plant: 4,
        GoWork: 5,
        GoHome: 6
    };

    pub.AgentRoutineState = {
        Home: 0,
        Work: 10
    };

    pub.AgentState = {
        idle: 0,
        start: 10,
        walk: 20,
        work: 30,
        finishWork:35,
        walkBack: 40,
        finish: 50,
        done: 60
    };

    pub.AgentGender = {
        male: 0,
        female: 1
    };
    
    return pub;
}(IDIDGAME_Water || {}, undefined));