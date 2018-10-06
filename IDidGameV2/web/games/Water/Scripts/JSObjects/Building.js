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

    pub.spawnWorkers = false;

    pub.BuildingCount = 0;

    pub.Building = function () { };
    pub.Building.initBuilding = function (_gameContext, _x, _y, _entryX, _entryY, _width, _height,_type) {
        var i, j;

        this.gameContext = _gameContext;

        this.num = pub.BuildingCount;
        pub.BuildingCount += 1;

        this.description = "Building";

        this.type = _type;

        this.manned = 0;

        this.spriteX = 0;
        this.spriteY = 0;

        this.drawOffsetX = 0;
        this.drawOffsetY = 0;

        this.revealed = true;

        this.spriteWidth = _width;
        this.spriteHeight = _height;

        switch (this.type) {
            case pub.StructureType.Base:
                this.spriteX = 0;
                break;
            case pub.StructureType.House:
                this.spriteX = 12;
                break;
            case pub.StructureType.Watchtower:
                this.spriteX = 11;
                break;
            case pub.StructureType.Woodman:
                this.spriteX = 3;
                break;
            case pub.StructureType.Sawmill:
                this.spriteX = 5;
                break;
            case pub.StructureType.Mason:
                this.spriteX = 7;
                break;
            case pub.StructureType.PigFarm:
                this.spriteX = 9;
                this.spriteY = 2;
                break;
            case pub.StructureType.MilkFarm:
                this.spriteX = 9;
                this.spriteY = 0;
                break;
            case pub.StructureType.WheatFarm:
                this.spriteX = 9;
                this.spriteY = 4;
                break;
            case pub.StructureType.Well:
                this.spriteY = 8;
                break;
            case pub.StructureType.Mill:
                this.spriteY = 8;
                this.spriteX = 1;
                break;
            case pub.StructureType.Baker:
                this.spriteY = 8;
                this.spriteX = 3;
                break;
        }

        this.map = _gameContext.TileMap;

        this.resourceCount = 0;

        this.resources = RSTools.createObject(pub.ResArray);
        this.resources.init();

        this.closedResources = [];
        this.relevantResources = [];

        this.toHarvest = [];
        
        this.x = _x;
        this.y = _y;

        this.posX = this.x * this.map.tileSize;
        this.posY = this.y * this.map.tileSize;

        this.entryX = _entryX;
        this.entryY = _entryY;

        this.width = _width * this.map.tileSize;
        this.height = _height * this.map.tileSize;

        this.drawBit = false;
        this.map.setStructure(this.x, this.y, this, _width, _height);

        this.gameContext.toUpdate.push(this);
        this.gameContext.onMouseDown.push(this);
    };
    pub.Building.update = function () {
        var ret, i, loopWorker;

        if (this.doUpdate) {
            this.doUpdate();
        }

        if (this.worker === false && pub.unemployedAgents.length>0) {
            ret=this.map.getNearestBuildingResource(pub.StructureType.Base, this.entryX, this.entryY, 20, pub.ResourceType.Worker, 1);
            if (ret == false) {
                ret = this.map.getNearestBuildingResource(pub.StructureType.House, this.entryX, this.entryY, 20, pub.ResourceType.Worker, 1);
            }

            if (ret) {
                for (var i = 0; i < ret.target.workers.length; i++) {
                    loopWorker = ret.target.workers[i];
                    if (loopWorker.work === false) {
                        loopWorker.employ(this);
                        break;
                    }
                }
            }
        }
    };
    pub.Building.getSize = function () {
        return { width: 2, height: 2, entryX: 0, entryY: 2 };
    };
    pub.Building.onMouseDown = function (e) {
        this.gameContext.selectedObject = this;
    };
    pub.Building.harvestResource = function (_worker, _resourceType) {
        var resource;

        if (this.manned && _worker && !_worker.busy) {
            resource = this.map.getNearestResource(_resourceType, this.entryX, this.entryY, 10, this.closedResources);
            if (resource === false && _resourceType == pub.ResourceType.Stone) {
                resource = this.map.getNearestResource(_resourceType, this.entryX, this.entryY, 10, this.closedResources, 2);
            }

            if (resource) {
                if (_worker.getResource(resource, 10) === false) {
                    this.closedResources.push(resource);
                    return false;
                }
                resource.reserved = true;
                return true;
            } 
        }
    };
    pub.Building.giveResource = function (_worker, _resourceType,_structureType,_quantity) {
        var result;

        if (this.manned && _worker && !_worker.busy) {
            if (this.gameContext.TileMap.structures[this.entryX][this.entryY] && this.gameContext.TileMap.structures[this.entryX][this.entryY].type == pub.StructureType.Street) {
                result = this.map.getNearestBuildingResource(_structureType, this.entryX, this.entryY, 20);
                if (result) {                                   
                    _worker.transferResource(result.route, result.target, _resourceType, _quantity, true);
                    return true;
                }
            }
        }
        return false;
    };
    pub.Building.getResource = function (_worker, _resourceType, _quantity) {
        return this.getResourceFromSpecific(false, _worker, _resourceType, _quantity);
    };
    pub.Building.getResourceFromSpecific = function (_type,_worker, _resourceType, _quantity) {
        var result;

        if (this.manned && _worker && !_worker.busy) {
            if (this.gameContext.TileMap.structures[this.entryX][this.entryY] && this.gameContext.TileMap.structures[this.entryX][this.entryY].type == pub.StructureType.Street) {
                result = this.map.getNearestBuildingResource(_type, this.entryX, this.entryY, 20, _resourceType, 1);
                if (result) {
                    _worker.transferResource(result.route, result.target, _resourceType, _quantity, false);
                    return true;
                }
            }
        }
        return false;
    };
    pub.Building.workerIn = function (_worker) {
        this.manned += 1;

        _worker.outfit = pub.AgentOutfit.Woodsman;


        switch (this.type) {
            case pub.StructureType.Base:
                break;
            case pub.StructureType.House:
                break;
            case pub.StructureType.Watchtower:
                break;
            case pub.StructureType.Woodman:
                break;
            case pub.StructureType.Sawmill:
                break;
            case pub.StructureType.Mason:
                break;
            case pub.StructureType.PigFarm:
                _worker.outfit = pub.AgentOutfit.Farmer;
                break;
            case pub.StructureType.MilkFarm:
                _worker.outfit = pub.AgentOutfit.Farmer;
                break;
            case pub.StructureType.WheatFarm:
                _worker.outfit = pub.AgentOutfit.Farmer;
                break;
            case pub.StructureType.Well:
                break;
            case pub.StructureType.Mill:
                break;
            case pub.StructureType.Baker:
                break;
        }

    };
    pub.Building.workerOut = function (_worker) {
        this.manned -= 1;

        _worker.outfit=pub.AgentOutfit.Casual;
    };

    pub.House = RSTools.createObject(pub.Building);
    pub.House.init = function (_gameContext, _x, _y) {
        var w;

        this.initBuilding(_gameContext, _x, _y, _x+1, _y + 2, 2, 2, pub.StructureType.House);

        this.description = "House";

        this.relevantResources.push(pub.ResourceType.Bread);
        this.relevantResources.push(pub.ResourceType.Fish);
        
        this.resources[pub.ResourceType.Worker] = 1;

        this.workers = [];
        for (i = 0; i < 2; i++) {
            w = RSTools.createObject(pub.Agent);
            w.initAgent(_gameContext, this.entryX, this.entryY, this);
            this.workers.push(w);
        }
    };

    pub.Mason = RSTools.createObject(pub.Building);
    pub.Mason.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, pub.StructureType.Mason);

        this.description = "Mason";

        this.relevantResources.push(pub.ResourceType.Stone);

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }
    };
    pub.Mason.doUpdate = function () {
        var resource, result;

        if (this.manned) {
            if (this.resources[pub.ResourceType.Stone] >= 3) {
                this.giveResource(this.worker, pub.ResourceType.Stone, pub.StructureType.Base, 3);
            }

            this.harvestResource(this.worker, pub.ResourceType.Stone);
        }
    };



    pub.Woodman = RSTools.createObject(pub.Building);
    pub.Woodman.init = function (_gameContext,_x,_y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, pub.StructureType.Woodman);
        
        this.description = "Woodsman";

        this.relevantResources.push(pub.ResourceType.Wood);

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }
    };
    pub.Woodman.doUpdate = function () {
        if (this.manned) {
            if (this.resources[pub.ResourceType.Wood] >= 5) {
                this.giveResource(this.worker, pub.ResourceType.Wood, pub.StructureType.Sawmill, 5);
            }

            this.harvestResource(this.worker, pub.ResourceType.Wood);
        }
    };

    pub.Sawmill = RSTools.createObject(pub.Building);
    pub.Sawmill.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2,pub.StructureType.Sawmill);

        this.description = "Sawmill";

        this.relevantResources.push(pub.ResourceType.Wood);
        this.relevantResources.push(pub.ResourceType.Planks);

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }

        this.counter = 0;
        this.subCounter=0;
    };
    pub.Sawmill.doUpdate = function () {
        var result;

        if (this.manned) {
            if (this.resources[pub.ResourceType.Planks] >= 10) {
                this.giveResource(this.worker, pub.ResourceType.Planks, pub.StructureType.Base, 10);
            }

            if (!this.worker.busy) {
                if (this.resources[pub.ResourceType.Wood] > 0) {
                    if (this.counter == 30) {
                        this.resources[pub.ResourceType.Wood] -= 1;
                        this.resources[pub.ResourceType.Planks] += 1;
                        this.counter = 0;
                    }
                    else {
                        this.counter += 1;
                    }
                }
            }
        }
    };

    pub.Farm = RSTools.createObject(pub.Building);
    pub.Farm.init = function (_gameContext, _x, _y,_type) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, _type);

        this.description = "Farm";

        switch (_type) {
            case pub.StructureType.WheatFarm:
                this.relevantResources.push(pub.ResourceType.Wheat);
                break;
            case pub.StructureType.MilkFarm:
                this.relevantResources.push(pub.ResourceType.Wheat);
                this.relevantResources.push(pub.ResourceType.Water);
                this.relevantResources.push(pub.ResourceType.Milk);
                break;
            case pub.StructureType.PigFarm:
                this.relevantResources.push(pub.ResourceType.Wheat);
                this.relevantResources.push(pub.ResourceType.Water);
                this.relevantResources.push(pub.ResourceType.Pig);
                break;
        }

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }

        this.counter = 0;
        this.subCounter = 0;

        this.distance = 2;
    };
    pub.Farm.doUpdate = function () {
        var i, j, result, loopObj;
              
        switch (this.type) {
            case pub.StructureType.WheatFarm:

                break;
            case pub.StructureType.PigFarm:

                if (this.resources[pub.ResourceType.Water] === 0) {
                    
                } else if (this.resources[pub.ResourceType.Wheat] > 0) {
                    this.counter += 1;
                    this.subCounter += 1;

                    if (this.subCounter === 150) {
                        this.resources[pub.ResourceType.Water] -= 1;
                        this.resources[pub.ResourceType.Wheat] -= 1;
                        this.subCounter = 0;
                    }
                    if (this.counter === 1000) {
                        this.resources[pub.ResourceType.Pig] += 1;
                    }
                }

                break;
            case pub.StructureType.MilkFarm:

                if (this.resources[pub.ResourceType.Water] === 0) {
                    
                } else if (this.resources[pub.ResourceType.Wheat] > 0) {
                    this.counter += 1;
                    this.subCounter += 1;

                    if (this.subCounter === 100) {
                        this.resources[pub.ResourceType.Water] -= 1;
                        this.resources[pub.ResourceType.Wheat] -= 1;
                        this.subCounter = 0;
                    }
                    if (this.counter === 400) {
                        this.resources[pub.ResourceType.Milk] += 5;
                    }
                }
                
                break;
        }


        if(this.manned){
            if (!this.worker.busy) {
                switch (this.type) {
                    case pub.StructureType.WheatFarm:

                        if (this.resources[pub.ResourceType.Wheat] > 10) {
                            if (this.giveResource(this.worker, pub.ResourceType.Wheat, pub.StructureType.Mill, 10)) {
                                return;
                            }
                            if (this.giveResource(this.worker, pub.ResourceType.Wheat, pub.StructureType.Base, 10)) {
                                return;
                            }
                        }

                        break;
                    case pub.StructureType.PigFarm:
                        
                        if (this.resources[pub.ResourceType.Water] === 0) {
                            if (this.getResourceFromSpecific(pub.StructureType.Well,this.worker, pub.ResourceType.Water, 5)) {
                                return;
                            }
                        } 

                        if (this.resources[pub.ResourceType.Pig] > 0) {
                            if (this.giveResource(this.worker, pub.ResourceType.Pig, pub.StructureType.Base, 1)) {
                                return;
                            }
                        }

                        break;
                    case pub.StructureType.MilkFarm:

                        if (this.resources[pub.ResourceType.Water] === 0) {
                            if (this.getResourceFromSpecific(pub.StructureType.Well, this.worker, pub.ResourceType.Water, 5)) {
                                return;
                            }
                        }

                        if (this.resources[pub.ResourceType.Milk] > 0) {
                            if (this.giveResource(this.worker, pub.ResourceType.Milk, pub.StructureType.Base, this.resources[pub.ResourceType.Milk])) {
                                return;
                            }
                        }

                        break;
                }

                if (this.harvestResource(this.worker, pub.ResourceType.Wheat)) {
                    return;
                }

                for (i = this.x - this.distance; i < this.x + this.distance + 2; i++) {
                    for (j = this.y - this.distance; j < this.y + this.distance; j++) {
                        if (this.map.structures[i][j]) {

                        } else {
                            loopObj = this.map.terrain[i][j];
                            if (loopObj.revealed && loopObj.type == pub.TerrainType.Grass) {
                                if (this.worker.plant(i, j, pub.Resource, pub.StructureType.Field, 8)) {
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    pub.Mill = RSTools.createObject(pub.Building);
    pub.Mill.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, pub.StructureType.Mill);

        this.description = "Mill";

        this.relevantResources.push(pub.ResourceType.Wheat);
        this.relevantResources.push(pub.ResourceType.Flour);

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }

        this.counter = 0;
        
        this.drawOffsetY = -1;
        this.spriteHeight = 3;
    };
    pub.Mill.doUpdate = function () {
        var i, j, result;

        if (this.manned) {
            if (!this.worker.busy) {
                if (this.resources[pub.ResourceType.Wheat]) {
                    this.counter += 1;

                    if (this.counter == 100) {
                        this.resources[pub.ResourceType.Wheat] -= 1;
                        this.resources[pub.ResourceType.Flour] += 1;
                        this.counter = 0;
                    }

                    if (this.resources[pub.ResourceType.Flour] >= 10) {
                        if (this.giveResource(this.worker, pub.ResourceType.Flour, pub.StructureType.Baker, 10)) {
                            return;
                        }
                        if (this.giveResource(this.worker, pub.ResourceType.Flour, pub.StructureType.Base, 10)) {
                            return;
                        }
                    }

                    if (this.resources[pub.ResourceType.Wheat] == 0) {
                        this.getResource(this.worker, pub.ResourceType.Wheat, 5);
                    }
                }
            }
        }
    }


    pub.Bakery = RSTools.createObject(pub.Building);
    pub.Bakery.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x + 1, _y + 2, 2, 2, pub.StructureType.Baker);

        this.description = "Bakery";

        this.relevantResources.push(pub.ResourceType.Flour);
        this.relevantResources.push(pub.ResourceType.Water);
        this.relevantResources.push(pub.ResourceType.Bread);

        this.worker = false;
        if (pub.spawnWorkers) {
            this.worker = RSTools.createObject(pub.Agent);
            this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        }

        this.counter = 0;

        this.drawOffsetY = -1;
        this.spriteHeight = 3;
    };
    pub.Bakery.doUpdate = function () {
        var i, j, result;

        if (this.manned) {
            if (!this.worker.busy) {
                if (this.resources[pub.ResourceType.Flour] && this.resources[pub.ResourceType.Water]) {
                    this.counter += 1;

                    if (this.counter == 100) {
                        this.resources[pub.ResourceType.Water] -= 1;
                        this.resources[pub.ResourceType.Flour] -= 1;
                        this.resources[pub.ResourceType.Bread] += 1;
                        this.counter = 0;
                    }
                }
                else {
                    if (this.resources[pub.ResourceType.Bread] >= 10) {
                        if (this.giveResource(this.worker, pub.ResourceType.Bread, pub.StructureType.Base, 10)) {
                            return;
                        }
                    }

                    if (this.resources[pub.ResourceType.Flour] == 0) {
                        this.getResource(this.worker, pub.ResourceType.Flour, 5);
                    }

                    if (this.resources[pub.ResourceType.Water] == 0) {
                        this.getResource(this.worker, pub.ResourceType.Water, 5);
                    }
                }
            }
        }
    }
    pub.Bakery.getSize = function () {
        return { width: 2, height: 2, entryX: 1, entryY: 2 };
    };

    pub.Well = RSTools.createObject(pub.Building);
    pub.Well.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y+1 , 1, 1, pub.StructureType.Well);

        this.description = "Well";

        this.relevantResources.push(pub.ResourceType.Water);

        this.resources[pub.ResourceType.Water] = 999;

    };
    pub.Well.getSize = function () {
        return { width: 1, height: 1, entryX: 0, entryY: 1 };
    };

    pub.Base = RSTools.createObject(pub.Building);
    pub.Base.init = function (_gameContext, _x, _y) {
        var i,w;

        _gameContext.TileMap.revealCircle(_x + 1, _y + 1, 24);

        this.initBuilding(_gameContext, _x, _y, _x + 1, _y + 3, 3, 3, pub.StructureType.Base);

        this.description = "Base";

        this.resources[pub.ResourceType.Worker] = 1;
        
        this.relevantResources.push(pub.ResourceType.Planks);
        this.relevantResources.push(pub.ResourceType.Stone);
        this.relevantResources.push(pub.ResourceType.Gold);
        this.relevantResources.push(pub.ResourceType.Bread);
        this.relevantResources.push(pub.ResourceType.Fish);
        this.relevantResources.push(pub.ResourceType.Pig);
        this.relevantResources.push(pub.ResourceType.Milk);

        this.worker = RSTools.createObject(pub.Agent);
        this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);
        this.worker.work = this;
        RSTools.removeFromArray(pub.unemployedAgents, this);

        this.workers = [];
        for (i = 0; i < 5; i++) {
            w = RSTools.createObject(pub.Agent);
            w.initAgent(_gameContext, this.entryX, this.entryY, this);
            this.workers.push(w);
        }
    };
    pub.Base.getSize = function () {
        return { width: 3, height: 3, entryX: 1, entryY: 3 };
    };
    pub.Base.doUpdate = function () {

    };

    pub.Watchtower = RSTools.createObject(pub.Building);
    pub.Watchtower.init= function (_gameContext, _x, _y) {
        var i;

        this.worker = false;
        this.circleRevealed = false;

        this.initBuilding(_gameContext, _x, _y, _x, _y + 1, 1, 1, pub.StructureType.Watchtower);
        this.drawOffsetY = -1;
        this.spriteHeight = 2;

        this.description = "Watchtower";
    };
    pub.Watchtower.workerIn = function () {
        
        this.manned += 1;

        if (this.circleRevealed === false) {
            this.gameContext.TileMap.revealCircle(this.x + 1, this.y+ 1, 15);
            this.circleRevealed = true;
        }
    };
    pub.Watchtower.getSize = function () {
        return { width: 1, height: 1, entryX: 0, entryY: 1 };
    }

    pub.Resource = function () { };
    pub.Resource.init = function (_gameContext, _x, _y, _type) {

        this.gameContext = _gameContext;
        this.map = _gameContext.TileMap;

        this.tile=this.map.terrain[_x][_y];

        this.x = _x;
        this.y = _y;

        this.type = _type;

        this.counter = 0;
        this.growDuration = 0;

        //this.resources = RSTools.createObject(pub.ResArray);
        //this.resources.init();

        this.resourceCount = 0;
        
        this.spriteX = 0;
        this.spriteY = 0;

        this.drawOffsetX = 0;
        this.drawOffsetY = 0;

        this.spriteWidth = 1;
        this.spriteHeight = 1;

        this.priority = 1;

        this.revealed = false;

        this.reserveCount = 0;

        this.spriteCounter = 0;
        this.spriteSpeed = Math.round(Math.random() * 100);
        this.spriteQuantity = 0;
        
        switch (this.type) {
            case pub.StructureType.Tree:
                this.color = "Darkgreen";
                this.resourceType = pub.ResourceType.Wood;
                this.resourceCount = 3;
                this.spriteX = 1;
                break;
            case pub.StructureType.Stone:
                this.spriteX = 3;
                this.color = "Gray";
                this.resourceCount = 10;
                this.resourceType = pub.ResourceType.Stone;
                break;
            case pub.StructureType.Fish:
                this.spriteX = 4;
                this.color = "Darkblue";
                this.resourceCount = 20;
                this.resourceType = pub.ResourceType.Fish;
                this.spriteQuantity = 2;
                break;
            case pub.StructureType.BuildingFrame:
                this.spriteX = 5;
                this.color = "Brown";
                this.resourceCount = 1;
                this.resourceType = 0;
                this.revealed = true;
                break;
            case pub.StructureType.Field:
                this.spriteX = 2;
                this.color = "Brown";
                this.resourceCount = 0;
                this.resourceType = 0;
                this.revealed = true;
                this.growDuration = 5000 + Math.random() * 5000;
                break;
        }
        
        this.map.setStructure(this.x, this.y, this);

        this.gameContext.toUpdate.push(this);
    };
    pub.Resource.reveal = function () {
        this.revealed = true;
        this.gameContext.MiniMap.drawOn(this.x, this.y, 1, 1, this.color);
    };
    pub.Resource.reserve = function () {
        this.reserveCount += 1;
        this.resourceCount -= 1;
    };
    pub.Resource.use = function () {
        var chance, count = 0;

        switch (this.type) {
            case pub.StructureType.FieldGrown:

                this.fillStyle = "Brown";
                this.type = pub.StructureType.Field;
                this.resourceType = false;
                this.spriteY = 0;
                this.drawOffsetY = 0;
                this.spriteHeight = 1;

                this.growDuration = 7500 + Math.random() * 5000;

                count = 1;
                break;
            case pub.StructureType.Stone:

                if (this.resourceCount === 0) {
                    this.tile.occupied = false;
                    this.priority = 2;

                    this.resourceCount = 100;

                    if (this.tile.type === pub.TerrainType.Moutain) {
                        chance = 25;
                    } else {
                        chance = 5;
                    }

                    if (Math.random() * 100 < chance) {
                        this.type == pub.StructureType.GoldMine;
                        this.spriteY = 2;
                    } else {
                        this.type = pub.StructureType.StoneMine;
                        this.spriteY = 1;
                    }
                }
                count = 1;
                break;
            default:
                count = 1;
                break;
        }

        if(this.reserveCount>0 && count>0){
            this.reserveCount -= count;
        } else if(this.resourceCount>0) {
            this.resourceCount -= count;
        } else {
            count = 0;
        }

        switch (this.type) {
            case pub.StructureType.Tree:
                if (this.resourceCount === 0) {
                    this.fillStyle = "Yellow";
                    this.type = pub.StructureType.Sapling;
                    this.spriteY = 1;
                }
                break;
            case pub.StructureType.Stone:
                if (this.resourceCount === 0) {
                    this.tile.occupied = false;
                    this.priority = 2;

                    this.resourceCount = 100;

                    if (this.tile.type === pub.TerrainType.Moutain) {
                        chance = 25;
                    } else {
                        chance = 5;
                    }

                    if (Math.random() * 100 < chance) {
                        this.type == pub.StructureType.GoldMine;
                        this.spriteY = 2;
                    } else {
                        this.type = pub.StructureType.StoneMine;
                        this.spriteY = 1;
                    }
                }
                break;
            default:
                break;
        }

        return count;
    };
    pub.Resource.update = function () {
        switch (this.type) {
            case pub.StructureType.Sapling:
                if (this.counter === 10000) {
                    this.counter = 0;
                    this.resourceCount = 3;
                    this.type = pub.StructureType.Tree;
                    this.fillStyle = "Darkgreen";
                    this.spriteY = 0;
                }
                this.counter += 1;
                break;
            case pub.StructureType.Field:
                
                if (this.counter >= this.growDuration) {
                    this.counter = 0;
                    this.resourceCount = 1;
                    this.resourceType = pub.ResourceType.Wheat;
                    this.type = pub.StructureType.FieldGrown;
                    this.spriteHeight = 1.5;
                    this.drawOffsetY = -0.5;
                    this.spriteY = 2.5;
                }else if(this.counter>=this.growDuration/4){
                    this.spriteHeight = 1.5;
                    this.drawOffsetY = -0.5;
                    this.spriteY = 1;
                }

                if (this.gameContext.daytime != pub.Daytime.Night) {
                    this.counter += 1;
                }

                break;
        }
    };


    pub.Street = function () { };
    pub.Street.init = function (_gameContext, _x, _y) {
        this.gameContext = _gameContext;
        this.map = _gameContext.TileMap;

        this.x = _x;
        this.y = _y;

        this.tileX = this.x;
        this.tileY = this.y;

        this.spriteX = 0;
        this.spriteY = 0;

        this.type = pub.StructureType.Street;

        this.pathParent = undefined;

        this.counter = 0;
        this.revealed = true;
        
        this.map.setStructure(this.x, this.y, this);

        /*_gameContext.suppressAdding = true;
        this.initRect(_gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "Darkgray", 0);
        _gameContext.suppressAdding = false;*/
        
        this.directions = [];
        this.adjacentStreets = [];
        this.setAdjecentStreets();
    };
    pub.Street.setAdjecentStreets = function () {
        var street,
            possibleStreets = [], streets = [],
            i;

        street = this.map.structures[this.x + 1][this.y];
        possibleStreets.push(street);
        street = this.map.structures[this.x][this.y + 1];
        possibleStreets.push(street);
        street = this.map.structures[this.x - 1][this.y];
        possibleStreets.push(street);
        street = this.map.structures[this.x][this.y - 1];
        possibleStreets.push(street);
        
        for (i = 0; i < 4; i++) {
            if (possibleStreets[i] && possibleStreets[i].type === pub.StructureType.Street) {
                this.adjacentStreets.push(possibleStreets[i]);
                possibleStreets[i].adjacentStreets.push(this);
                possibleStreets[i].setDirections();
            }
        }

        this.setDirections();
    };
    pub.Street.setDirections = function () {
        var street,
            i;


        this.directions = [];

        street = this.map.structures[this.x][this.y - 1];
        if (street && street.type === pub.StructureType.Street) {
            this.directions.push(0)
        }else if(this.map.terrain[this.x][this.y].entrances.length>0){
            this.directions.push(0)
        }
        street = this.map.structures[this.x + 1][this.y];
        if (street && street.type === pub.StructureType.Street) {
            this.directions.push(1)
        }
        street = this.map.structures[this.x][this.y + 1];
        if (street && street.type === pub.StructureType.Street) {
            this.directions.push(2)
        }
        street = this.map.structures[this.x - 1][this.y];
        if (street && street.type === pub.StructureType.Street) {
            this.directions.push(3)
        }

        if (this.directions.length === 0) {
            this.directions.push(4);
        }

    };
    pub.Street.buildRoute = function (route) {
        if (this.pathParent) {
            this.pathParent.buildRoute(route);
        }

        route.push(this);
    }
    pub.Street.getSize = function () {
        return { width: 1, height: 1, entryX: false, entryY: false };
    };
    Object.defineProperty(pub.Street, "entrances", {
        get: function () {
            return this.map.terrain[this.x][this.y].entrances;
        }
    });


    pub.BuildContract = function () { };
    pub.BuildContract.init = function (_gameContext, _classToBuild, _x, _y,_tag) {

        this.gameContext = _gameContext;
        this.class = _classToBuild;
        this.x = _x;
        this.y = _y;
        this.tag = _tag;

        this.map = _gameContext.TileMap;

        this.state = pub.BuildState.CheckStreet;
        this.size = this.class.getSize();

        this.route = false;
        this.street = false;

        this.initFrames();

        this.gameContext.toUpdate.push(this);
    };
    pub.BuildContract.initFrames = function () {
        var i, j, frame;

        this.frames = [];

        for (i = 0; i < this.size.width; i++) {
            for (j = 0; j < this.size.height; j++) {
                frame = RSTools.createObject(pub.Resource);
                frame.init(this.gameContext, this.x + i, this.y + j, pub.StructureType.BuildingFrame);
            }
        }
    };
    pub.BuildContract.update = function () {
        var x, y,
            struc, route;


        x = this.x + this.size.entryX;
        y = this.y + this.size.entryY;

        switch (this.state) {
            case pub.BuildState.CheckStreet:

                this.street=this.map.structures[x][y];
                if (this.street && this.street.type===pub.StructureType.Street) {
                    
                } else {
                    this.street = RSTools.createObject(pub.Street);
                    this.street.init(this.gameContext, x, y);
                }


                this.state = pub.BuildState.SearchBase;

                break;
            case pub.BuildState.SearchBase:

                route = this.map.getNearestBuildingResource(pub.StructureType.Base, x, y, 30);

                if (route) {
                    this.route = route;
                    this.route.route.reverse();
                    this.state = pub.BuildState.RequestBuild;
                }

                break;
            case pub.BuildState.RequestBuild:

                if (this.route.target.worker.busy === false) {
                    this.route.target.worker.build(this.route.route, this);
                    this.state = pub.BuildState.WaitForCompletion;
                }


                break;
            case pub.BuildState.WaitForCompletion:

                if (this.built) {
                    this.state = pub.BuildState.Build;
                }

                break;
            case pub.BuildState.Build:

                struc = RSTools.createObject(this.class);
                struc.init(this.gameContext, this.x, this.y, this.tag);

                this.street.setDirections();

                return true;
                break;
        }
    };

    pub.ResArray = RSTools.createObject([]);
    pub.ResArray.init = function (_res) {
        var prop;

        for (var prop in pub.ResourceType) {
            this[pub.ResourceType[prop]] = 0;
        }

        if (!_res) {
            this.reserved = RSTools.createObject(pub.ResArray);
            this.reserved.init(true);
        }
    };
    pub.ResArray.add = function (_resArray) {
        var prop;

        for (var prop in pub.ResourceType) {
            this[pub.ResourceType[prop]] += _resArray[pub.ResourceType[prop]];
        }

        return this;
    };
    pub.ResArray.subtract = function (_resArray) {
        var prop;

        for (var prop in pub.ResourceType) {
            this[pub.ResourceType[prop]] -= _resArray[pub.ResourceType[prop]];
        }

        return this;
    };
    pub.ResArray.reserve = function (_resArray) {
        this.reserved.add(_resArray);
    };
    pub.ResArray.unreserve = function (_resArray) {
        this.reserved.subtract(_resArray);
    };
    pub.ResArray.available = function (_resArray) {
        var prop;

        for (var prop in pub.ResourceType) {
            if (this[pub.ResourceType[prop]] - this.reserved[pub.ResourceType[prop]] < _resArray[pub.ResourceType[prop]]) {
                return false;
            }
        }

        return true;
    };

    pub.BuildState = {
        CheckStreet: 10,
        SearchBase:15,
        RequestBuild: 20,
        WaitForCompletion: 30,
        Build: 40,
        Finish: 50
    };

    pub.StructureType = {
        Base: 1,
        House:2,
        Watchtower: 5,

        Woodman: 10,
        Sawmill: 11,
        Mason: 15,

        PigFarm: 20,
        MilkFarm: 21,
        WheatFarm: 22,

        Mill:30,
        Baker:31,
        Well: 32,

        Street: 50,
        BuildingFrame: 51,

        Tree: 100,
        Sapling: 101,
        Stone: 110,
        StoneMine: 111,
        GoldMine: 112,

        Fish: 120,
        Field: 130,
        FieldGrown: 131
    };
    pub.ResourceType = {
        Wood: 1,
        Planks: 2,
        Stone: 5,
        Gold: 6,
        Fish: 10,
        Bread: 11,
        Wheat: 20,
        Pig: 21,
        Milk: 22,
        Water: 30,
        Flour: 31,
        Worker:50
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));