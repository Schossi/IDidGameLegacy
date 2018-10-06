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


    pub.WorkerCount = 0;

    pub.Agent = RSTools.createObject(pub.DrawableRect);
    pub.Agent.initAgent = function (_gameContext,_x,_y,_building) {
        this.map = _gameContext.TileMap;

        this.num = pub.WorkerCount;
        pub.WorkerCount += 1;

        this.x = _x;
        this.y = _y;

        this.building = _building;

        this.targetX=0;
        this.targetY=0;

        this.speed=20;
        this.counter = 0;
        this.step = 0;

        this.resourceQuantity = 0;
        this.resourceType = 0;
        this.target = false;
        this.mode = 0;

        this.busy = false;

        this.route = false;
        this.resource = false;
        this.return = false;

        this.initRect(_gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, "Red", 2);

        this.gameContext.toUpdate.push(this);
    };
    pub.Agent.update = function () {
        if (this.route) {
            if (this.counter === this.speed) {

                if (this.return) {
                    this.step -= 1;
                } else {
                    this.step += 1;
                }

                if (this.return && this.step === -1) {
                    this.route = false;
                    this.return = false;
                    this.step = 0;
                    this.counter = 0;
                    this.busy = false;

                    if (this.mode < pub.AgentMode.TransferToTarget) {
                        this.building.resources[this.resourceType] += this.resourceQuantity;
                    }

                    return;
                } else if (this.route[this.step] == undefined) {
                    if (this.mode === pub.AgentMode.GetResource) {
                        this.resourceQuantity = this.target.use();
                        this.resourceType = this.target.resourceType;
                    } else if (this.mode === pub.AgentMode.TransferFromTarget) {
                        this.target.resources[this.resourceType] -= this.resourceQuantity;
                    } else if (this.mode === pub.AgentMode.TransferToTarget) {
                        this.target.resources[this.resourceType] += this.resourceQuantity;
                    }

                    this.return = true;

                    return;
                }

                this.counter = 0;
                this.posX = (this.route[this.step].tileX) * this.map.tileSize;
                this.posY = (this.route[this.step].tileY) * this.map.tileSize;                
            }

            this.counter += 1;
        }
    };
    pub.Agent.getResource = function (_resource, _maxDistance) {
        this.target = _resource;
        this.route = this.map.getRoute(this.x, this.y, _resource.x, _resource.y, this.x - _maxDistance, this.y - _maxDistance, _maxDistance);

        if (this.route) {
            this.mode = pub.AgentMode.GetResource;
            this.busy = true;
            return true;
        }
    };
    pub.Agent.transferResource = function (_route,_target,_resourceType,_resourceQuantity,_bring) {
        this.route = _route;
        this.target = _target;
        this.resourceType = _resourceType;
        this.resourceQuantity = _resourceQuantity;

        if (this.route) {
            if (_bring) {
                this.mode = pub.AgentMode.TransferToTarget;
                this.building.resources[this.resourceType] -= this.resourceQuantity;
            } else {
                this.mode = pub.AgentMode.TransferFromTarget;
            }
            this.busy = true;
            return true;
        }
    };

    pub.AgentMode = {
        GetResource: 0,
        TransferFromTarget: 1,
        TransferToTarget: 2
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));