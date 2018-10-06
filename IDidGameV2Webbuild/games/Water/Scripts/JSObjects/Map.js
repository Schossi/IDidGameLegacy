/// <reference path="Effects.js" />
/// <reference path="GameContext.js" />
/// <reference path="Sound.js" />
/// <reference path="UI.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../Main.js" />
/// <reference path="../RSTools.js" />
/// <reference path="Balls.js" />
/// <reference path="Hands.js" />
/// <reference path="Prototypes.js" />


var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    var drawToMiniMap = false;

    pub.Map = function () { };
    pub.Map.initMap = function (_gameContext) {
        var x, y;

        this.gameContext = _gameContext;

        this.tileSize = 60;
        this.startSize = 100;
        this.chunkSize=20;

        this.drawBit = false;

        this.agents = [];

        this.structures = [];
        this.structuresByType = [];
        /*for (x = -this.startSize; x < this.startSize; x++) {
            this.structures[x] = [];
        }*/

        this.noise = RSTools.createObject(pub.SimplexNoise);
        this.noise.init();
        
        this.pathfinding = new pub.AStartGrid(40, 40, this);
    }
    pub.Map.getTile = function (_x, _y) {
        if (this.terrain[_x] && this.terrain[_x][_y]) {
            return this.terrain[_x][_y];
        }
        return false;
    };
    pub.Map.revealCircle = function (_x, _y, _radius) {
        var i, j,
            pix,
            offx, offy, offi, offj;

        for ( i = _x-_radius; i <= _x+_radius; i++) {
            for (j = _y - _radius; j <= _y + _radius; j++) {
                
                offi = i - _x;
                offj = j - _y;

                offi *= offi;
                offj *= offj;

                if (offi + offj < _radius * _radius) {
                    this.revealTile(i, j);
                }
            }
        }
    };
    pub.Map.initFirstBase = function () {
        var tile,
            base,
            street,
            clear,
            x = 0, y = 0,
            i, j;

        while (!base) {
            
            clear = true;
            for ( i = 0; i < 3; i++) {
                for (j = 0; j < 5; j++) {
                    this.revealTile(x + i, y + j);
                    tile = this.terrain[x + i][y + j];
                    tile.revealed = false;

                    if (tile.occupied || tile.type != pub.TerrainType.Grass || this.structures[x+i][y+j]) {
                        clear = false;
                        break;
                    }
                }
            }

            if (clear) {
                drawToMiniMap = true;
                base = RSTools.createObject(pub.Base);
                base.init(this.gameContext, x, y);

                street = RSTools.createObject(pub.Street);
                street.init(this.gameContext, base.entryX, base.entryY);
            }

            x += 1;
        }

        return { x: x, y: y };
    }
    pub.Map.revealTile = function (_x, _y) {
        var fromX, fromY,
            tillX, tillY;

        if (this.terrain[_x] && this.terrain[_x][_y]) {
            this.terrain[_x][_y].reveal();
        } else {
            fromX = Math.floor(_x / 20) * 20;
            fromY = Math.floor(_y / 20) * 20;
            tillX = Math.ceil((_x) / 20) * 20;
            tillY = Math.ceil((_y) / 20) * 20;
            
            this.initTerrain(fromX, fromY, tillX, tillY);

            this.terrain[_x][_y].reveal();
        }
    };
    pub.Map.initTerrain = function (_fromX,_fromY,_tillX,_tillY) {
        var x, y, tile, type, struc, noiseVal,
            fromX = _fromX || -this.chunkSize,
            fromY = _fromY || -this.chunkSize,
            tillX = _tillX || this.chunkSize,
            tillY = _tillY || this.chunkSize;
        
        if (!this.terrain) {
            this.terrain = [];
        }

        for (x = fromX; x <= tillX; x++) {
            if (!this.terrain[x]) {
                this.terrain[x] = [];
            }
            if (!this.structures[x]) {
                this.structures[x] = [];
            }

            for (y = fromY; y <= tillY; y++) {

                if (!this.terrain[x][y]) {
                    this.gameContext.suppressAdding = true;
                    noiseVal = Math.abs(this.noise.noise(x / 200, y / 200));
                    if (noiseVal < 0.1) {
                        type = pub.TerrainType.Water;
                    } else if (noiseVal > 0.7) {
                        type = pub.TerrainType.Moutain;
                    } else {
                        type = pub.TerrainType.Grass;
                    }

                    tile = RSTools.createObject(pub.Tile);
                    tile.initTile(this, x, y, type);
                    this.terrain[x][y] = tile;

                    if (type === pub.TerrainType.Grass) {
                        if (this.noise.noise(x / 5, y / 5) > 0.95 || this.noise.noise(x / 30, y / 30) > 0.6) {
                            struc = RSTools.createObject(pub.Resource);
                            struc.init(this.gameContext, x, y, pub.StructureType.Tree);
                        } else if (this.noise.noise(x / 3, y / 3) > 0.995 || this.noise.noise(x / 10, y / 10) > 0.9) {
                            struc = RSTools.createObject(pub.Resource);
                            struc.init(this.gameContext, x, y, pub.StructureType.Stone);
                        }
                    } else if (type == pub.TerrainType.Moutain) {
                        if (this.noise.noise(x / 3, y / 3) > 0.8 || this.noise.noise(x / 10, y / 10) > 0.8) {
                            struc = RSTools.createObject(pub.Resource);
                            struc.init(this.gameContext, x, y, pub.StructureType.Stone);
                        }
                    } else if (type == pub.TerrainType.Water) {
                        if (noiseVal < 0.01 && this.noise.noise(x / 3, y / 3) > 0.8) {
                            struc = RSTools.createObject(pub.Resource);
                            struc.init(this.gameContext, x, y, pub.StructureType.Fish);
                        }
                    }
                }
            }
        }
        this.gameContext.suppressAdding = false;
    };
    pub.Map.setStructure = function (_x, _y, _structure, _width, _height) {
        var i, j, set = false;

        if (_structure) {
            _structure.drawBit = false;

            if (_structure.type === pub.StructureType.Street || _structure.type=== pub.StructureType.Tree || _structure.type===pub.StructureType.Field || _structure.type===pub.StructureType.FieldGrown) {
                
            } else {
                set = true;
            }

            if (this.structuresByType.indexOf(_structure.type) === -1) {
                this.structuresByType[_structure.type] = [];
            }
            this.structuresByType[_structure.type].push(_structure);

            if (pub.Building.isPrototypeOf(_structure)) {
                this.terrain[_structure.entryX][_structure.entryY].entrances.push(_structure);
            }
        }

        if (_width && _height) {
            for (i = 0; i < _width; i++) {
                for (j = 0; j < _height; j++) {
                    this.structures[_x + i][_y + j] = _structure;
                    this.terrain[_x + i][_y + j].occupied = set;
                    this.terrain[_x + i][_y + j].draw = false;
                }
            }
            this.terrain[_x][_y].draw = true;

        } else {
            this.structures[_x][_y] = _structure;
            this.terrain[_x][_y].occupied = set;
        }

       
    };
    pub.Map.getRoute = function (_startX, _startY, _endX, _endY,_tileX,_tileY,_maxDistance) {

        this.pathfinding.update(_maxDistance * 2, _maxDistance * 2, _tileX, _tileY, _startX, _startY, _endX, _endY, false);
        this.pathfinding.calculate();

        if (this.pathfinding.pathPossible) {
            return this.pathfinding.route;
        } else {
            return false;
        }
    };
    pub.Map.getStreetRoute = function (_startX, _startY, _structure, _maxDistance) {
        return this.getNearestBuildingResource(false, _startX, _startY, _maxDistance, false, false, _structure);
    };
    pub.Map.getNearestResource = function (_type, _x, _y, _maxDistance, _closedResources, _priority) {
        var i, j,
            nearestDistance = 99999,
            currentDistance, nearest = false,
            loopStruc,
                priority = _priority || 1;

        for (i = _x - _maxDistance; i < _x + _maxDistance; i++) {
            for (j = _y - _maxDistance; j < _y + _maxDistance; j++) {
                if (this.structures[i]) {
                    loopStruc = this.structures[i][j];
                    if (loopStruc && loopStruc.resourceType == _type && loopStruc.revealed && loopStruc.resourceCount > 0 && loopStruc.priority == priority) {
                        currentDistance = Math.abs(i - _x) + Math.abs(j - _y);
                        if (currentDistance < nearestDistance) {
                            if (_closedResources.indexOf(loopStruc) < 0) {// && this.structures[i][j].reserved === false) {
                                nearest = loopStruc;
                                nearestDistance = currentDistance;
                            }
                        }
                    }
                }
            }
        }

        return nearest;
    };
    pub.Map.getNearestBuildingResource = function (_type, _x, _y, _maxDistance, _resourceType,_resourceQuantity,_structure) {
        var openStreets = [],
            nextStreets = [],
            closedStreets = [],
            startStreet,
            currentStreet,
            possibleStreet,
            endStreet,
            target,
            i, j, k,
            route = [];

        startStreet = this.structures[_x][_y];
        startStreet.pathParent = false;


        openStreets = openStreets.concat(startStreet.adjacentStreets);
        closedStreets = openStreets.slice();
        closedStreets.push(startStreet);

        for ( i = 0; i < openStreets.length; i++) {
            openStreets[i].pathParent = startStreet;
        }

        for (i = 0; i < _maxDistance; i++) {
            if (endStreet || openStreets.length===0 ) {
                break;
            }

            for (j = 0; j < openStreets.length; j++) {
                currentStreet = openStreets[j];

                if (currentStreet.entrances) {
                    for (k = 0; k < currentStreet.entrances.length; k++) {

                        if (_structure) {
                            if (currentStreet.entrances[k] === _structure) {
                                endStreet = currentStreet;
                                target = _structure;
                                break;
                            }
                        } else {
                            if (!_type || currentStreet.entrances[k].type === _type) {
                                if (!_resourceType || currentStreet.entrances[k].resources[_resourceType] >= _resourceQuantity) {
                                    endStreet = currentStreet;
                                    target = currentStreet.entrances[k];
                                    break;
                                }
                            }
                        }
                    }
                }

                if (endStreet) {
                    break;
                }

                for (k = 0; k < currentStreet.adjacentStreets.length; k++) {
                    possibleStreet = currentStreet.adjacentStreets[k];
                    if (closedStreets.indexOf(possibleStreet) === -1) {
                        nextStreets.push(possibleStreet);
                        closedStreets.push(possibleStreet);
                        possibleStreet.pathParent = currentStreet;
                    }
                }
            }

            openStreets = nextStreets.slice();
            nextStreets = [];
        }

        if (endStreet) {
            endStreet.buildRoute(route);
            return { route: route, target: target };
        }

        return false;
    };
    pub.Map.draw = function () {
        var i, j, k,
            screenX, screenY,
            screenWidth, screenHeight,
            newDrawBit = !this.drawBit,
            row,
            tile,
            structure, agent;

        screenX = Math.floor(this.gameContext.offsetRealPos.x / this.tileSize) - 3;
        screenY = Math.floor(this.gameContext.offsetRealPos.y / this.tileSize) - 3;

        screenWidth = screenX + Math.ceil((600 / this.tileSize) / this.gameContext.zoom) + 6;
        screenHeight = screenY + Math.ceil((600 / this.tileSize) / this.gameContext.zoom) + 6;



        for (i = screenX; i < screenWidth; i++) {
            row = this.terrain[i];
            if (row) {
                for (j = screenY; j < screenHeight; j++) {
                    tile = row[j];
                    if (tile && tile.revealed) {
                        pub.terrainSheet.add(i, j, tile.type - 1, 0);
                        //tile.draw();
                    }
                }
            }
        }

        for (i = screenX; i < screenWidth; i++) {
            row = this.structures[i];
            if (row) {
                for (j = screenY; j < screenHeight; j++) {
                    structure = row[j];
                    if (structure && structure.revealed && structure.drawBit === this.drawBit) {

                        if (structure.type < 50) {
                            if (this.terrain[i] && this.terrain[i][j] && this.terrain[i][j].revealed) {
                                pub.buildingSheet.add(i + structure.drawOffsetX, j + structure.drawOffsetY, structure.spriteX, structure.spriteY, structure.spriteWidth, structure.spriteHeight);
                            }
                        } else {
                            if (structure.type === pub.StructureType.Street) {
                                for (k = 0; k < structure.directions.length; k++) {
                                    pub.structureSheet.add(i, j, structure.spriteX, structure.directions[k]);
                                }
                            }
                            else {
                                if (structure.spriteQuantity) {
                                    structure.spriteCounter += 1;
                                    if (structure.spriteCounter === structure.spriteSpeed) {
                                        structure.spriteCounter = 0;
                                        structure.spriteY += 1;
                                        if (structure.spriteY == structure.spriteQuantity) {
                                            structure.spriteY = 0;
                                        }
                                    }
                                }

                                pub.structureSheet.add(i + structure.drawOffsetX, j + structure.drawOffsetY, structure.spriteX, structure.spriteY, structure.spriteWidth, structure.spriteHeight);
                            }
                        }


                        //structure.draw();
                        structure.drawBit = newDrawBit;
                    }
                }
            }
        }

        for (i = 0; i < this.agents.length; i++) {
            agent = this.agents[i];
            if (agent.visible) {
                pub.agentSheet.add(agent.posX / this.tileSize + agent.offX, agent.posY / this.tileSize - 0.2 + agent.offY, agent.spriteX+agent.gender*4, agent.spriteY + agent.outfit);
                pub.agentSheet.addSwap(agent.color.r, agent.color.g, agent.color.b);
            }
            //this.agents[i].draw();
        }

        this.drawBit = newDrawBit;
    };

    pub.Tile = function () { };
    pub.Tile.initTile = function (_map, _x, _y,_type) {
        this.x = _x;
        this.y = _y;

        this.occupied = false;
        
        this.entrances = [];

        this.map = _map;

        this.type = _type;

        this.revealed = false;

        this.color = "";
        switch (this.type) {
            case pub.TerrainType.Grass:
                this.color = "Green";
                break;
            case pub.TerrainType.Water:
                this.color = "Blue";
                break;
            case pub.TerrainType.Moutain:
                this.color = "Brown";
                break;
        }


        //this.initRect(_map.gameContext, this.x * this.map.tileSize, this.y * this.map.tileSize, this.map.tileSize, this.map.tileSize, this.color, 0);
        this.strokeStyle = "White";
    };
    pub.Tile.reveal = function () {
        var struc;

        if (this.revealed || drawToMiniMap==false) {
            return;
        }

        this.revealed = true;
        this.map.gameContext.MiniMap.drawOn(this.x, this.y, 1, 1, this.color);

        struc=this.map.structures[this.x][this.y];
        if (struc && struc.reveal) {
            struc.reveal();
        }
    }

    pub.TerrainType = {
        Grass: 1,
        Water: 2,
        Moutain: 3
    };

    pub.AStartGrid = function (_sizeX, _sizeY,_map) {
        this.grid;

        this.map = _map;

        this.sizeX = _sizeX;
        this.sizeY = _sizeY;

        this.tileX = 0;
        this.tileY = 0;

        this.startX = 0;
        this.startY = 0;

        this.endX = 0;
        this.endY = 0;

        this.endNode = undefined;
        this.pathPossible = false;

        this.route;

        this.build();
    };
    pub.AStartGrid.prototype.build = function () {
        var i, j;

        this.grid = [];
        
        for (i = 0; i < this.sizeX; i++) {
            this.grid[i] = [];
            for (j = 0; j < this.sizeY; j++) {
                this.grid[i][j] = new pub.AStarNode(i, j, this);
            }
        }

    };
    pub.AStartGrid.prototype.update = function (_sizeX, _sizeY,_tileX, _tileY, _startX, _startY, _endX, _endY,_travelWater) {
        var i, j, node, tile;

        this.sizeX = _sizeX;
        this.sizeY = _sizeY;

        this.tileX = _tileX;
        this.tileY = _tileY;

        this.startX = _startX - this.tileX;
        this.startY = _startY - this.tileY;

        this.endX = _endX - this.tileX;
        this.endY = _endY - this.tileY;

        for (i = 0; i < this.sizeX; i++) {
            for (j = 0; j < this.sizeY; j++) {
                node = this.grid[i][j];
                node.parent = undefined;
                if (this.map.terrain[i + _tileX] && this.map.terrain[i + _tileX][j + _tileY]){
                    tile = this.map.terrain[i + _tileX][j + _tileY];
                    node.occupied = tile.occupied;
                    if (_travelWater === false && tile.type === pub.TerrainType.Water) {
                        node.occupied = true;
                    }
                }
                node.refresh();
            }
        }
    }
    pub.AStartGrid.prototype.calculate = function () {
        var open = [],
            closed = [],
            i,
            j = 0,
            started = new Date().getTime(),
            endWasOccupied = false;

        //pub.contextForeground.clearRect(25, 100, 550, 400);

        if (this.grid[this.startX][this.startY].occupied) {
            this.pathPossible = false;
            this.route = false;
            return;
        }


        if (this.grid[this.endX][this.endY].occupied) {
            endWasOccupied = true;
            this.grid[this.endX][this.endY].occupied = false;
        }

        this.pathPossible = false;
        open.push(this.grid[this.startX][this.startY]);

        while (open.length > 0) {
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
            open = open.concat(open[0].getChildren(closed));
            open.splice(0, 1);

            j = j + 1;
        }

        this.route = [];
        this.endNode.buildRoute(this.route);

        if (endWasOccupied) {
            this.grid[this.endX][this.endY].occupied = true;
        }

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
        this.path = false;
    };
    pub.AStarNode.prototype.refresh = function () {
        this.end = this.x === this.grid.endX && this.y === this.grid.endY;
        if (this.end) {
            this.grid.endNode = this;
        }

        this.hValue = (Math.abs(this.x - this.grid.endX) + Math.abs(this.y - this.grid.endY)) * 10;
        this.gValue = 0;
    }
    pub.AStarNode.prototype.setParent = function (_parent) {
        this.parent = _parent;

        this.gValue = this.parent.gValue + 10;


        //pub.contextForeground.fillText(this.gValue, 45 + this.x * 50, 120 + this.y * 50);
    }
    Object.defineProperty(pub.AStarNode.prototype, "fValue", {
        get: function () { return this.hValue + this.gValue; }
    });
    pub.AStarNode.prototype.getChildren = function (closed) {
        this.children = [];

        this.tryAddChild(this.x - 1, this.y, this.children, closed);
        this.tryAddChild(this.x, this.y - 1, this.children, closed);
        this.tryAddChild(this.x + 1, this.y, this.children, closed);
        this.tryAddChild(this.x, this.y + 1, this.children, closed);

        return this.children;
    };
    pub.AStarNode.prototype.tryAddChild = function (x, y, children, closed) {
        var node;

        if (x < 0 || y < 0) {
            return;
        }

        if (x >= this.grid.sizeX || y >= this.grid.sizeY) {
            return;
        }

        node = this.grid.grid[x][y];

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
            fromX = child.x * 50;
            fromY = child.y * 50;
        } else {
            fromX = this.x * 50;
            fromY = this.y * 50 + 25;
        }

        if (this.parent) {
            toX = this.parent.x * 50;
            toY = this.parent.y * 50;
        } else {
            toX = this.x * 50;
            toY = this.y * 50 - 100;
        }

        fromX += 50;
        fromY += 125;
        myX = this.x * 50 + 50;
        myY = this.y * 50 + 125;
        toX += 50;
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

        this.tileX = this.x + this.grid.tileX;
        this.tileY = this.y + this.grid.tileY;

        route.push({ tileX: this.tileX, tileY: this.tileY });
    }


    // Ported from Stefan Gustavson's java implementation
    // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
    // Read Stefan's excellent paper for details on how this code works.
    //
    // Sean McCullough banksean@gmail.com

    /**
     * You can pass in a random number generator object if you like.
     * It is assumed to have a random() method.
     */
    pub.SimplexNoise = function () { };
    pub.SimplexNoise.init = function (r) {
        if (r == undefined) r = Math;
        this.grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                                       [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                                       [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        this.p = [];
        for (var i = 0; i < 256; i++) {
            this.p[i] = Math.floor(r.random() * 256);
        }
        // To remove the need for index wrapping, double the permutation table length 
        this.perm = [];
        for (var i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }

        // A lookup table to traverse the simplex around a given point in 4D. 
        // Details can be found where this table is used, in the 4D noise method. 
        this.simplex = [
          [0, 1, 2, 3], [0, 1, 3, 2], [0, 0, 0, 0], [0, 2, 3, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 2, 3, 0],
          [0, 2, 1, 3], [0, 0, 0, 0], [0, 3, 1, 2], [0, 3, 2, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [1, 3, 2, 0],
          [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
          [1, 2, 0, 3], [0, 0, 0, 0], [1, 3, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 3, 0, 1], [2, 3, 1, 0],
          [1, 0, 2, 3], [1, 0, 3, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 3, 1], [0, 0, 0, 0], [2, 1, 3, 0],
          [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
          [2, 0, 1, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 0, 1, 2], [3, 0, 2, 1], [0, 0, 0, 0], [3, 1, 2, 0],
          [2, 1, 0, 3], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [3, 1, 0, 2], [0, 0, 0, 0], [3, 2, 0, 1], [3, 2, 1, 0]];
    };
    pub.SimplexNoise.dot = function (g, x, y) {
        return g[0] * x + g[1] * y;
    };
    pub.SimplexNoise.noise = function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners 
        // Skew the input space to determine which simplex cell we're in 
        var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        var s = (xin + yin) * F2; // Hairy factor for 2D 
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space 
        var Y0 = j - t;
        var x0 = xin - X0; // The x,y distances from the cell origin 
        var y0 = yin - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle. 
        // Determine which simplex we are in. 
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
        if (x0 > y0) { i1 = 1; j1 = 0; } // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
        else { i1 = 0; j1 = 1; }      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
        // c = (3-sqrt(3))/6 
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners 
        var ii = i & 255;
        var jj = j & 255;
        var gi0 = this.perm[ii + this.perm[jj]] % 12;
        var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        // Calculate the contribution from the three corners 
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }
        // Add contributions from each corner to get the final noise value. 
        // The result is scaled to return values in the interval [-1,1]. 
        return 70.0 * (n0 + n1 + n2);
    };
    pub.SimplexNoise.noise3d = function (xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners 
        // Skew the input space to determine which simplex cell we're in 
        var F3 = 1.0 / 3.0;
        var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D 
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);
        var G3 = 1.0 / 6.0; // Very nice and simple unskew factor, too 
        var t = (i + j + k) * G3;
        var X0 = i - t; // Unskew the cell origin back to (x,y,z) space 
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = xin - X0; // The x,y,z distances from the cell origin 
        var y0 = yin - Y0;
        var z0 = zin - Z0;
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
        // Determine which simplex we are in. 
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
        if (x0 >= y0) {
            if (y0 >= z0)
            { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } // X Y Z order 
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; } // X Z Y order 
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; } // Z X Y order 
        }
        else { // x0<y0 
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; } // Z Y X order 
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; } // Y Z X order 
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; } // Y X Z order 
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords 
        var y2 = y0 - j2 + 2.0 * G3;
        var z2 = z0 - k2 + 2.0 * G3;
        var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords 
        var y3 = y0 - 1.0 + 3.0 * G3;
        var z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners 
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
        var gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
        var gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
        var gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
        // Calculate the contribution from the four corners 
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) n3 = 0.0;
        else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value. 
        // The result is scaled to stay just inside [-1,1] 
        return 32.0 * (n0 + n1 + n2 + n3);
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));