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

    pub.Building = RSTools.createObject(pub.DrawableRect);
    pub.Building.initBuilding = function (_gameContext, _x, _y, _entryX, _entryY, _wdith, _height,_type) {
        var i, j;

        this.name = "Building";

        this.type = _type;

        this.map = _gameContext.TileMap;

        this.resourceCount = 0;
        this.resources = [];

        this.x = _x;
        this.y = _y;

        this.entryX = _entryX;
        this.entryY = _entryY;

        this.width = _wdith;
        this.height = _height;

        this.drawBit = false;
        this.map.setStructure(this.x, this.y, this, this.width, this.height);

        _gameContext.suppressAdding = true;
        this.initRect(this.map.gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize * this.width, this.map.tileSize * this.height, "Orange", 1);
        _gameContext.suppressAdding = false;

        this.gameContext.onMouseDown.push(this);
    };
    pub.Building.getSize = function () {
        return { width: 2, height: 2, entryX: 0, entryY: 2 };
    };
    pub.Building.onMouseDown = function (e) {
        this.gameContext.selectedObject = this;
    };

    pub.Mason = RSTools.createObject(pub.Building);
    pub.Mason.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, pub.StructureType.Mason);

        this.name = "Mason";

        this.resources[pub.ResourceType.Stone] = 0;

        this.worker = RSTools.createObject(pub.Agent);
        this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);

        this.gameContext.toUpdate.push(this);
    };
    pub.Mason.update = function () {
        var resource, result;

        if (!this.worker.busy) {
            if (this.resources[pub.ResourceType.Stone] >= 5 && this.gameContext.TileMap.structures[this.entryX][this.entryY] && this.gameContext.TileMap.structures[this.entryX][this.entryY].type == pub.StructureType.Street) {
                result = this.map.getNearestBuildingResource(pub.StructureType.Base, this.entryX, this.entryY, 20);
                if (result) {
                    this.worker.transferResource(result.route, result.target, pub.ResourceType.Stone, 5, true);
                }
            } else {
                resource = this.map.getNearestResource(pub.StructureType.Stone, this.entryX, this.entryY, 10);
                if (resource) {
                    this.worker.getResource(resource, 10);
                }
            }
        }
    };



    pub.Woodman = RSTools.createObject(pub.Building);
    pub.Woodman.init = function (_gameContext,_x,_y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2, pub.StructureType.Woodman);
        
        this.name = "Woodsman";

        this.resources[pub.ResourceType.Wood] = 0;

        this.worker = RSTools.createObject(pub.Agent);
        this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);

        this.gameContext.toUpdate.push(this);
    };
    pub.Woodman.update = function () {
        var resource, result;

        if (!this.worker.busy) {
            if (this.resources[pub.ResourceType.Wood] >= 5 && this.gameContext.TileMap.structures[this.entryX][this.entryY] && this.gameContext.TileMap.structures[this.entryX][this.entryY].type == pub.StructureType.Street) {
                result = this.map.getNearestBuildingResource(pub.StructureType.Sawmill, this.entryX, this.entryY, 20);
                if (result) {
                    this.worker.transferResource(result.route, result.target, pub.ResourceType.Wood, 5, true);
                }
            } else {
                resource = this.map.getNearestResource(pub.StructureType.Tree, this.entryX, this.entryY, 10);
                if (resource) {
                    this.worker.getResource(resource, 10);
                }
            }
        }
    };

    pub.Sawmill = RSTools.createObject(pub.Building);
    pub.Sawmill.init = function (_gameContext, _x, _y) {
        this.initBuilding(_gameContext, _x, _y, _x, _y + 2, 2, 2,pub.StructureType.Sawmill);

        this.name = "Sawmill";

        this.resources[pub.ResourceType.Wood] = 0;
        this.resources[pub.ResourceType.Planks] = 0;

        this.worker = RSTools.createObject(pub.Agent);
        this.worker.initAgent(_gameContext, this.entryX, this.entryY, this);

        this.counter = 0;

        this.gameContext.toUpdate.push(this);
    };
    pub.Sawmill.update = function () {
        var result;

        this.fillStyle = "Orange";
        if (!this.worker.busy) {
            if (this.resources[pub.ResourceType.Planks] >= 10) {
                result = this.map.getNearestBuildingResource(pub.StructureType.Base, this.entryX, this.entryY, 20);
                if (result) {
                    this.worker.transferResource(result.route, result.target, pub.ResourceType.Planks, 10, true);
                }
            }
            else if (this.resources[pub.ResourceType.Wood] > 0) {
                if (this.counter == 30) {
                    this.resources[pub.ResourceType.Wood] -= 1;
                    this.resources[pub.ResourceType.Planks] += 1;
                    this.counter = 0;
                }
                else {
                    this.counter += 1;
                    this.fillStyle = "Yellow";
                }
            }
        }
    };


    pub.Base = RSTools.createObject(pub.Building);
    pub.Base.init = function (_gameContext, _x, _y) {
        var i;

        this.initBuilding(_gameContext, _x, _y, _x+1, _y + 3, 3, 3, pub.StructureType.Base);

        this.name = "Base";

        this.resources[pub.ResourceType.Wood] = 0;
        this.resources[pub.ResourceType.Planks] = 0;
        this.resources[pub.ResourceType.Stone] = 0;
        
        this.gameContext.toUpdate.push(this);
    };
    pub.Base.getSize = function () {
        return { width: 3, height: 3, entryX: 1, entryY: 3 };
    };
    pub.Base.update = function () {

    };


    pub.Resource = RSTools.createObject(pub.DrawableRect);
    pub.Resource.init = function (_gameContext, _x, _y, _type) {
        this.map = _gameContext.TileMap;

        this.x = _x;
        this.y = _y;

        this.type = _type;

        this.counter = 0;

        this.resourceCount = 0;

        switch (this.type) {
            case pub.StructureType.Tree:
                this.color = "Darkgreen";
                this.resourceType = pub.ResourceType.Wood;
                break;
            case pub.StructureType.Stone:
                this.color = "Gray";
                this.resourceCount = 10;
                this.resourceType = pub.ResourceType.Stone;
                break;
        }

        this.map.setStructure(this.x, this.y, this);

        _gameContext.suppressAdding = true;
        this.initRect(_gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, this.color, 1);
        _gameContext.suppressAdding = false;

        this.gameContext.MiniMap.drawOn(this.x, this.y, 1, 1, this.color);
        this.gameContext.toUpdate.push(this);
    };
    pub.Resource.use = function () {
        switch (this.type) {
            case pub.StructureType.Tree:
                this.fillStyle = "Yellow";
                this.type = pub.StructureType.Sapling;
                return 1;
            case pub.StructureType.Stone:
                this.resourceCount -= 1;
                return 1;
        }
    };
    pub.Resource.update = function () {
        switch (this.type) {
            case pub.StructureType.Sapling:
                if (this.counter === 500) {
                    this.counter = 0;
                    this.type = pub.StructureType.Tree;
                    this.fillStyle = "Darkgreen";
                }
                this.counter += 1;
                break;
        }
    };


    pub.Street = RSTools.createObject(pub.DrawableRect);
    pub.Street.init = function (_gameContext, _x, _y) {
        this.map = _gameContext.TileMap;

        this.x = _x;
        this.y = _y;

        this.tileX = this.x;
        this.tileY = this.y;

        this.type = pub.StructureType.Street;

        this.pathParent = undefined;

        this.counter = 0;
        
        this.map.setStructure(this.x, this.y, this);

        _gameContext.suppressAdding = true;
        this.initRect(_gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "Darkgray", 0);
        _gameContext.suppressAdding = false;
        
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
            }
        }
    };
    pub.Street.buildRoute = function (route) {
        if (this.pathParent) {
            this.pathParent.buildRoute(route);
        }

        route.push(this);
    }
    Object.defineProperty(pub.Street, "entrances", {
        get: function () {
            return this.map.terrain[this.x][this.y].entrances;
        }
    });

    pub.StructureType = {
        Base: 1,
        Woodman: 10,
        Sawmill: 11,
        Mason: 15,
        Street: 50,
        Tree: 100,
        Sapling: 101,
        Stone: 110
    };
    pub.ResourceType = {
        Wood: 1,
        Planks: 2,
        Stone:5
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));