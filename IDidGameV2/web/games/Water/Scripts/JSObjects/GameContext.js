/// <reference path="Effects.js" />
/// <reference path="Prototypes.js" />
/// <reference path="Sound.js" />
/// <reference path="UI.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../RSTools.js" />
/// <reference path="Building.js" />
/// <reference path="Agent.js" />
/// <reference path="Balls.js" />
/// <reference path="Hands.js" />
/// <reference path="Map.js" />
/// <reference path="GameContext.js" />
/// <reference path="../Main.js" />
/// <reference path="../RSWebGL.js" />


var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    var transformMouse = function (e,context) {
        var xPos = (e.pageX - pub.canvas_main.offsetLeft - context.offsetX) / context.zoom,
            yPos = (e.pageY - pub.canvas_main.offsetTop - context.offsetY) / context.zoom,
            absXPos = e.pageX - pub.canvas_main.offsetLeft,
            absYPos= e.pageY - pub.canvas_main.offsetTop;

        return { x: xPos, y: yPos, ax: absXPos, ay: absYPos };
    };

    pub.maxZoom = 8;
    pub.minZoom = 0.2;

    pub.GameContext = function () { };
    pub.GameContext.init = function (_drawingContext) {
        this.toDraw = [];
        this.toDrawUI = [];
        this.toCommit = [];
        this.toUpdate = [];
        this.toCall = [];
        
        this.suppressAdding = false;

        this.onMouseDownAction = [];
        this.onMouseUpAction = [];
        this.onMouseMoveAction = [];

        this.onMouseDown = [];
        this.onMouseUp = [];
        this.onMouseEnter = [];
        this.onMouseLeave = [];

        this.onKeyChange = [];
        this.onKeyDown = [];

        this.drawingContext = _drawingContext;
        
        this.changeBit = false;

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 1;
        this.desiredzoom = 1;
    };
    pub.boxscale = 50;
    pub.GameContext.initBox = function () {
        var b2Vec2 = Box2D.Common.Math.b2Vec2
           , b2AABB = Box2D.Collision.b2AABB
           , b2BodyDef = Box2D.Dynamics.b2BodyDef
           , b2Body = Box2D.Dynamics.b2Body
           , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
           , b2Fixture = Box2D.Dynamics.b2Fixture
           , b2World = Box2D.Dynamics.b2World
           , b2MassData = Box2D.Collision.Shapes.b2MassData
           , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
           , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
           , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
           , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
           , destroyList
        ;
        var world = new b2World(
              new b2Vec2(0,9.81)    //gravity
           , true                 //allow sleep
        );
        this.BoxWorld = world;
        this.BoxDestroyList = [];
        destroyList = this.BoxDestroyList;

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;
        var bodyDef = new b2BodyDef;

        //create ground
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;

        fixDef.shape.SetAsBox(20, 2);

        bodyDef.position.Set(10, 600 / pub.boxscale + 2);
        this.boxBottomBorder = world.CreateBody(bodyDef);
        this.boxBottomBorder.CreateFixture(fixDef);

        bodyDef.position.Set(10, -2);
        this.boxTopBorder=world.CreateBody(bodyDef);
        this.boxTopBorder.CreateFixture(fixDef);

        fixDef.shape.SetAsBox(2, 14);

        bodyDef.position.Set(-2, 13);
        this.boxLeftBorder= world.CreateBody(bodyDef);
        this.boxLeftBorder.CreateFixture(fixDef);

        bodyDef.position.Set(600 / pub.boxscale + 2, 13);
        this.boxRightBorder= world.CreateBody(bodyDef);
        this.boxRightBorder.CreateFixture(fixDef);
        
        //create some objects
        /*
        bodyDef.type = b2Body.b2_dynamicBody;
        for (var i = 0; i < 1; ++i) {
            if (Math.random() > 0.5) {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(
                      Math.random() + 0.1 //half width
                   , Math.random() + 0.1 //half height
                );
            } else {
                fixDef.shape = new b2CircleShape(
                   Math.random() + 0.1 //radius
                );
            }
            bodyDef.position.x = Math.random() * 10;
            bodyDef.position.y = Math.random() * 10;
            world.CreateBody(bodyDef).CreateFixture(fixDef);
        }
        */

        /*bodyDef.type = b2Body.b2_staticBody;        
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(1,1);
        bodyDef.position.x = 1;
        bodyDef.position.y = 1;
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        */

        pub.drawBox = false;

        if (pub.drawBox) {
            //setup debug draw
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(this.drawingContext);
            debugDraw.SetDrawScale(pub.boxscale);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
        }

        this.listener = new Box2D.Dynamics.b2ContactListener();
        this.listener.BeginContact = function (contact, impulse) {
            var bodyA = contact.m_fixtureA.m_body,
                bodyB = contact.m_fixtureB.m_body;

            if (bodyA.tag && bodyA.tag.Hit) {
                bodyA.tag.Hit(bodyB, contact, impulse, true)
            }
            if (bodyB.tag && bodyB.tag.Hit) {
                bodyB.tag.Hit(bodyA, contact, impulse, false)
            }
        };
        world.SetContactListener(this.listener);
        
        this.toCall.push(update);// window.setInterval(update, 1000 / 60);

        //mouse

        var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
        var canvasPosition = getElementPosition(pub.canvas_main);

        document.addEventListener("mousedown", function (e) {
            handleMouseMove(e);

            /*bodyDef.type = b2Body.b2_dynamicBody;
            if (e.button === 2) {
                fixDef.shape = new b2PolygonShape;
                fixDef.shape.SetAsBox(1, 1);
            } else {
                fixDef.shape = new b2CircleShape(
                   Math.random() + 0.1 //radius
                );
            }
            bodyDef.position.x = mouseX;
            bodyDef.position.y = mouseY;
            bodyDef.angle = RSTools.toRadian(45);
            world.CreateBody(bodyDef).CreateFixture(fixDef);*/
            
            isMouseDown = true;
            handleMouseMove(e);
            document.addEventListener("mousemove", handleMouseMove, true);
        }, true);

        document.addEventListener("mouseup", function () {
            document.removeEventListener("mousemove", handleMouseMove, true);
            isMouseDown = false;
            mouseX = undefined;
            mouseY = undefined;
        }, true);

        function handleMouseMove(e) {
            mouseX = (e.clientX - canvasPosition.x) / pub.boxscale;
            mouseY = (e.clientY - canvasPosition.y) / pub.boxscale;
        };

        function getBodyAtMouse() {
            mousePVec = new b2Vec2(mouseX, mouseY);
            var aabb = new b2AABB();
            aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
            aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

            // Query the world for overlapping shapes.

            selectedBody = null;
            world.QueryAABB(getBodyCB, aabb);
            return selectedBody;
        }

        function getBodyCB(fixture) {
            if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
                if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    selectedBody = fixture.GetBody();
                    return false;
                }
            }
            return true;
        }

        //update

        function update() {

            if (isMouseDown && (!mouseJoint)) {
                var body = getBodyAtMouse();
                if (body) {
                    var md = new b2MouseJointDef();
                    md.bodyA = world.GetGroundBody();
                    md.bodyB = body;
                    md.target.Set(mouseX, mouseY);
                    md.collideConnected = true;
                    md.maxForce = 300.0 * body.GetMass();
                    mouseJoint = world.CreateJoint(md);
                    body.SetAwake(true);
                }
            }

            if (mouseJoint) {
                if (isMouseDown) {
                    mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
                } else {
                    world.DestroyJoint(mouseJoint);
                    mouseJoint = null;
                }
            }

            world.Step(1 / 60, 10, 10);
            
            for (var i in destroyList) {
                if (destroyList[i].tag && destroyList[i].tag.remove) {
                    destroyList[i].tag.remove();
                }
                world.DestroyBody(destroyList[i]);
            }
            // Reset the array
            destroyList.length = 0;

            if (pub.drawBox) {
                world.DrawDebugData();
            }

            world.ClearForces();
        };

        //helpers

        //http://js-tut.aardon.de/js-tut/tutorial/position.html
        function getElementPosition(element) {
            var elem = element, tagname = "", x = 0, y = 0;

            while ((typeof (elem) == "object") && (typeof (elem.tagName) != "undefined")) {
                y += elem.offsetTop;
                x += elem.offsetLeft;
                tagname = elem.tagName.toUpperCase();

                if (tagname == "BODY")
                    elem = 0;

                if (typeof (elem) == "object") {
                    if (typeof (elem.offsetParent) == "object")
                        elem = elem.offsetParent;
                }
            }

            return { x: x, y: y };
        }
    };
    pub.GameContext.work = function () {
        var i;

        if (!this.drawOver) {
            this.drawingContext.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        }

        for (i = this.toCall.length - 1; i >= 0 ; i--) {
            if (this.toCall[i]()) {
                this.toCall.splice(i, 1);
            }
        }

        for (i = 0; i < this.toCommit.length; i++) {
            this.toCommit[i].commitPosition(this.changeBit);
        }
        
        this.transform();

        if (this.TileMap) {
            this.TileMap.draw();
        }

        for (i = this.toDraw.length-1; i >= 0; i--) {
            if (this.toDraw[i].draw()) {
                this.toDraw.splice(i, 1);
            }
        }

        this.untransform();

        for (i = this.toDrawUI.length - 1; i >= 0; i--) {
            if (this.toDrawUI[i].draw()) {
                this.toDrawUI.splice(i, 1);
            }
        }

        for (i = this.toUpdate.length-1; i >=0 ; i--) {
            if(this.toUpdate[i].update()){
                this.toUpdate.splice(i,1);
            }
        }

        this.changeBit = !this.changeBit;
    };
    pub.GameContext.transform = function () {

        if (this.offsetX || this.offsetY) {
            this.drawingContext.translate(this.offsetX, this.offsetY);
        }

        if (this.zoom) {
            this.drawingContext.scale(this.zoom, this.zoom);
        }

    }
    pub.GameContext.untransform = function () {

        if (this.zoom) {
            this.drawingContext.scale(1 / this.zoom, 1 / this.zoom);
        }

        if (this.offsetX || this.offsetY) {
            this.drawingContext.translate(-this.offsetX, -this.offsetY);
        }

    }
    pub.GameContext.addToDraw = function (_entry, _zIndex) {
        var index = _zIndex || _entry.zIndex,
            i=0;

        if (this.suppressAdding) {
            return;
        }


        if (index >= 10000) {
            while (this.toDrawUI[i] && this.toDrawUI[i].zIndex > index) { i += 1; }
            this.toDrawUI.splice(i, 0, _entry);
        } else {
            while (this.toDraw[i] && this.toDraw[i].zIndex > index) { i += 1; }
            this.toDraw.splice(i, 0, _entry);
        }

    };
    pub.GameContext.mouseWheel = function (e) {
        this.desiredzoom =Math.max(Math.min(pub.maxZoom, this.desiredzoom+ e.wheelDelta / 1000),pub.minZoom);
    };
    pub.GameContext.mouseMove = function (e) {
        var i,
            mouse = transformMouse(e, this),
            mouseObj, tilesize = 60, x, y;

        pub.absMouseX = mouse.ax;
        pub.absMouseY = mouse.ay;

        pub.mouseX = mouse.x;
        pub.mouseY = mouse.y;

        for (i = this.onMouseMoveAction.length - 1; i >= 0; i--) {
            if (this.onMouseMoveAction[i]() === true) {
                this.onMouseMoveAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: mouse.x,
            posY: mouse.y,
            width: 1,
            height: 1
        };

        for (i = 0; i < this.onMouseEnter.length; i++) {
            if (this.onMouseLeave.indexOf(this.onMouseEnter[i])===-1 && RSTools.intersects(this.onMouseEnter[i], mouseObj)) {
                this.onMouseEnter[i].onMouseEnter();
                this.onMouseLeave.push(this.onMouseEnter[i]);
                break;
            }
        }

        for (i = this.onMouseLeave.length - 1; i >= 0 ; i--) {
            if (!RSTools.intersects(this.onMouseLeave[i], mouseObj)) {
                this.onMouseLeave[i].onMouseLeave();
                this.onMouseLeave.splice(i, 1);
                break;
            }
        }


        x = Math.floor(pub.mouseX / tilesize);
        y = Math.floor(pub.mouseY / tilesize);

        return { tX: x, tY: y };

    };
    pub.GameContext.mouseDown = function (e) {
        var mouse = transformMouse(e,this),
            i,
            mouseObj, mouseObjUI;

        for (i = this.onMouseDownAction.length - 1; i >= 0; i--) {
            if (this.onMouseDownAction[i](e.button) === true) {
                this.onMouseDownAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: mouse.x,
            posY: mouse.y,
            width: 1,
            height: 1
        };
        mouseObjUI = {
            posX: mouse.ax,
            posY: mouse.ay,
            width: 1,
            height: 1
        };

        for (i = 0; i < this.onMouseDown.length; i++) {
            if (this.onMouseDown[i].uiElement) {
                if (RSTools.intersects(this.onMouseDown[i], mouseObjUI)) {
                    if (this.onMouseDown[i].onMouseDown(e.button)) {
                        break;
                    }
                }
            } else {
                if (RSTools.intersects(this.onMouseDown[i], mouseObj)) {
                    if (this.onMouseDown[i].onMouseDown(e.button)) {
                        break;
                    }
                }
            }
        }

        e.preventDefault();
        return false;
    };
    pub.GameContext.mouseUp = function (e) {
        var i,
            mouse = transformMouse(e,this),
             mouseObj, mouseObjUI;

        mouseObj = {
            posX: mouse.x,
            posY: mouse.y,
            width: 1,
            height: 1
        };
        mouseObjUI = {
            posX: mouse.ax,
            posY: mouse.ay,
            width: 1,
            height: 1
        };

        if (this.onMouseUpAction) {
            for (i = this.onMouseUpAction.length - 1; i >= 0; i--) {
                if (this.onMouseUpAction[i](e.button) === true) {
                    this.onMouseUpAction.splice(i, 1);
                }
            }
        }

        if (this.onMouseUp) {
            for (i = 0; i < this.onMouseUp.length; i++) {
                if (this.onMouseUp[i].uiElement) {
                    if (RSTools.intersects(this.onMouseUp[i], mouseObjUI)) {
                        if (this.onMouseUp[i].onMouseUp()) {
                            break;
                        }
                    }
                } else {
                    if (RSTools.intersects(this.onMouseUp[i], mouseObj)) {
                        if (this.onMouseUp[i].onMouseUp()) {
                            break;
                        }
                    }
                }
            }
        }
    };
    pub.GameContext.mouseOut = function (e) { };
    pub.GameContext.key_down = function (e) {
        var key_id = e.keyCode,
            i,
            ball;

        for (i = 0; i < this.onKeyChange.length; i++) {
            if (this.onKeyChange[i].key === key_id) {
                this.onKeyChange[i].action(true);
            }
        }

        for (i = 0; i < this.onKeyDown.length; i++) {
            this.onKeyDown[i].onKeyDown(e);
        }

        /*if (key_id == RSTools.Keys.Q) {
            ball = RSTools.createObject(pub.Ball);
            ball.initBall(this, 250, 550, 10, 0.2, -1.5);
        } else if (key_id == RSTools.Keys.E) {
            ball = RSTools.createObject(pub.Ball);
            ball.initBall(this, 350, 550, 10, -0.2, -1.5);
        }*/

        e.preventDefault();
        return false;
    };
    pub.GameContext.key_up = function (e) {
        var key_id = e.keyCode,
            i;

        for (i = 0; i < this.onKeyChange.length; i++) {
            if (this.onKeyChange[i].key === key_id) {
                this.onKeyChange[i].action(false);
            }
        }

        //e.preventDefault();
    };
    pub.GameContext.getCenter = function () {
        var posX, posY;

        posX = this.offsetX + 300;
        posY = this.offsetY + 300;

        return { x: posX, y: posY };
    };

    pub.MainContext = RSTools.createObject(pub.GameContext);
    pub.MainContext.init = function (_drawingContext,_level) {
        var i, draw, basePos;

        pub.GameContext.init.apply(this, [_drawingContext]);
        
        this.arr1 = RSTools.createObject(pub.ResArray);
        this.arr1.init();
        this.arr2 = RSTools.createObject(pub.ResArray);
        this.arr2.init();
        this.arr2[pub.ResourceType.Fish] = 2;
        this.arr1.add(this.arr2).add(this.arr2);

        this.offsetX = 0;
        this.offsetY = 0;

        this.desiredOffsetX = 0;
        this.desiredOffsetY = 0;

        this.borderSize = 20;
                
        this.MiniMap = false;
                
        this.TileMap = RSTools.createObject(pub.Map);
        this.TileMap.initMap(this);

        this.sideMenu = RSTools.createObject(pub.SideMenu);
        this.sideMenu.initMenu(this);

        this.TileMap.initTerrain();
        basePos = this.TileMap.initFirstBase();

        this.offsetX = (-basePos.x+4.5)*60;
        this.offsetY = (-basePos.y+3)*60;

        this.onMouseDownAction.push(this.mouseDownAction);
        this.onMouseMoveAction.push(this.mouseMoveAction);
        this.onMouseUpAction.push(this.mouseUpAction);

        this.selectedObject = undefined;

        this.dragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragMouseX = 0;
        this.dragMouseY = 0;


        this.centerPos = { x: 0, y: 0 };
        this.offsetRealPos = { x: 0, y: 0 };

        this.time = 0;
        this.daytime = pub.Daytime.Morning;

        this.daySpeedFactor = 4;
        this.dayMax = 1000 * this.daySpeedFactor;
        this.dayMorningEnd = (100) * 2;
        this.dayMorningMid = (100) * 1;
        this.dayDayEnd = (100) * 6;
        this.dayEveningEnd = (100) * 8;
        this.dayEveningMid = (100) * 7;
        this.dayEveningDuration = this.dayEveningEnd - this.dayDayEnd;

        if (false) {
            this.marker = RSTools.createObject(pub.DrawableRect);
            this.marker.initRect(this, 0, 0, 60, 60, "Red", 100);

            this.zero = RSTools.createObject(pub.DrawableRect);
            this.zero.initRect(this, 0, 0, 60, 60, "Blue", 100);

            this.offsetReal = RSTools.createObject(pub.DrawableRect);
            this.offsetReal.initRect(this, 0, 0, 60, 60, "Yellow", 100);

            this.center = RSTools.createObject(pub.DrawableRect);
            this.center.initRect(this, 0, 0, 60, 60, "Purple", 100);
        }
    };
    pub.MainContext.mouseDownAction = function (_button) {
        if (_button === 1) {
            pub.MainContext.dragging = true;
            pub.MainContext.dragStartX = pub.MainContext.offsetX;
            pub.MainContext.dragStartY = pub.MainContext.offsetY;
            pub.MainContext.dragMouseX = pub.absMouseX;
            pub.MainContext.dragMouseY = pub.absMouseY;
        }
    };
    pub.MainContext.mouseMoveAction = function () {
        if (pub.MainContext.dragging) {
            pub.MainContext.desiredOffsetX = pub.MainContext.dragStartX - (pub.MainContext.dragMouseX - pub.absMouseX);
            pub.MainContext.desiredOffsetY = pub.MainContext.dragStartY - (pub.MainContext.dragMouseY - pub.absMouseY);
        }
    };
    pub.MainContext.mouseUpAction = function (_button) {
        if (_button === 1) {
            pub.MainContext.dragging = false;
        }
    };
    pub.MainContext.work = function () {
        
        this.calcPositions();
        this.workTime();
        this.drawWebGL();
        
        pub.GameContext.work.apply(this, []);
    };
    pub.MainContext.calcPositions = function () {
        var temp, centX, centY;

        //pub.status = this.offsetX + "|" + this.offsetY;

        if (this.desiredOffsetX) {
            this.offsetX = this.desiredOffsetX;
            this.offsetY = this.desiredOffsetY;

            this.desiredOffsetX = false;
            this.desiredOffsetY = false;
        }

        if (this.zoom) {
            temp = (this.desiredzoom - this.zoom) / 5;

            centX = -this.offsetX / this.zoom + 300 / this.zoom;
            centY = -this.offsetY / this.zoom + 300 / this.zoom;

            this.zoom += temp;

            this.offsetX = 300 - (centX * this.zoom);
            this.offsetY = 300 - (centY * this.zoom);
        }

        this.offsetRealPos.x = -this.offsetX / this.zoom;
        this.offsetRealPos.y = -this.offsetY / this.zoom;

        this.centerPos.x = this.offsetRealPos.x + 300 / this.zoom;
        this.centerPos.y = this.offsetRealPos.y + 300 / this.zoom;

        if (this.marker) {
            this.marker.posX = -this.offsetX;
            this.marker.posY = -this.offsetY;

            this.offsetReal.posX = this.offsetRealPos.x;
            this.offsetReal.posY = this.offsetRealPos.y;

            this.center.posX = this.centerPos.x;
            this.center.posY = this.centerPos.y;
        }
    };
    pub.MainContext.workTime = function () {
        var r = 1,
            g = 1,
            b = 1,
            time;

        this.time += 1;
        if (this.time === this.dayMax) {
            this.time = 0;
        }

        time = this.time / this.daySpeedFactor;

        if (time < this.dayMorningEnd) {//morning
            this.daytime = pub.Daytime.Morning;
            if (time < this.dayMorningMid) {
                r = 0.5;
                g = 0.5;
                b = 0.5 + time / this.dayMorningEnd;
            } else {
                r = 0.5 + (time - this.dayMorningMid) / this.dayMorningEnd;
                g = r;
            }
        } else if (time < this.dayDayEnd) {//day
            this.daytime = pub.Daytime.Day;
        } else if (time < this.dayEveningEnd) {//evening
            this.daytime = pub.Daytime.Evening;
            if (time < this.dayEveningMid) {
                b = 1 - (time - this.dayDayEnd) / this.dayEveningDuration;
                g = b;
            } else {
                b = 0.5;
                g = 0.5;
                r = 1 - (time - this.dayEveningMid) / this.dayEveningDuration;
            }
        } else {//night
            this.daytime = pub.Daytime.Night;
            r = 0.5;
            g = 0.5;
            b = 0.5;
        }

        pub.status = this.time + "|" + r + "|" + g + "|" + b

        RSWebGL.setMultiply(r, g, b);
    };
    pub.MainContext.drawWebGL = function () {

        RSWebGL.scale.x = (this.zoom / 8 * 5.12);
        RSWebGL.scale.y = (this.zoom / 6 * 5.12);
        RSWebGL.transform.x = this.offsetX / 400 - 1;
        RSWebGL.transform.y = this.offsetY / 300 - 1;

        RSWebGL.clear();
        RSWebGL.setUniforms();
        pub.terrainSheet.draw();
        pub.structureSheet.draw();

        RSWebGL.scale.x = (this.zoom / 8 * (10.24));
        RSWebGL.scale.y = (this.zoom / 6 * (10.24));
        RSWebGL.setUniforms();
        pub.buildingSheet.draw();

        RSWebGL.scale.x = (this.zoom / 8 * 5.12);
        RSWebGL.scale.y = (this.zoom / 6 * 5.12);
        RSWebGL.setUniforms();
        RSWebGL.setSwap(1, 0, 0);
        pub.agentSheet.draw();

    }
    pub.GameContext.mouseOut = function (e) {
        pub.MainContext.dragging = false;
    };

    pub.SoundSliderContext = RSTools.createObject(pub.GameContext);
    pub.SoundSliderContext.init = function (_drawingContext) {

        this.drawOver = true;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        //this.volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        //this.volumeEffectSlider.initButton(this, 535, 580, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume);
        //this.volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        //this.volumeMusicSlider.initButton(this, 680, 580, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume);

    };

    pub.MenuContext = RSTools.createObject(pub.GameContext);
    pub.MenuContext.init = function (_drawingContext) {
        var i, j, level, item;

        this.items = [];

        pub.GameContext.init.apply(this, [_drawingContext]);

    };


    pub.Daytime = {
        Morning: 10,
        Day: 20,
        Evening: 30,
        Night: 40
    };

    return pub;
}(IDIDGAME_Water || {}, undefined));