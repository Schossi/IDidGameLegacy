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


var IDIDGAME_Water = (function (pub, undefined) {
    "use strict";
    var transformMouse = function (e,context) {
        var xPos = (e.pageX - pub.canvas_main.offsetLeft - context.offsetX) / context.zoom,
            yPos = (e.pageY - pub.canvas_main.offsetTop - context.offsetY) / context.zoom,
            absXPos = e.pageX - pub.canvas_main.offsetLeft,
            absYPos= e.pageY - pub.canvas_main.offsetTop;

        return { x: xPos, y: yPos, ax: absXPos, ay: absYPos };
    };

    pub.maxZoom = 2;
    pub.minZoom = 0.5;

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

        for (i = 0; i < this.toUpdate.length; i++) {
            this.toUpdate[i].update();
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
        this.zoom =Math.max(Math.min(pub.maxZoom, this.zoom+ e.wheelDelta / 1000),pub.minZoom);
    };
    pub.GameContext.mouseMove = function (e) {
        var i,
            mouse = transformMouse(e,this),
            mouseObj;

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
                    this.onMouseDown[i].onMouseDown(e.button);
                    break;
                }
            } else {
                if (RSTools.intersects(this.onMouseDown[i], mouseObj)) {
                    this.onMouseDown[i].onMouseDown(e.button);
                    break;
                }
            }
        }
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
                        this.onMouseUp[i].onMouseUp();
                        break;
                    }
                } else {
                    if (RSTools.intersects(this.onMouseUp[i], mouseObj)) {
                        this.onMouseUp[i].onMouseUp();
                        break;
                    }
                }
            }
        }
    };
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
        var i, draw;

        pub.GameContext.init.apply(this, [_drawingContext]);
        
        this.offsetX = 0;
        this.offsetY = 0;

        this.borderSize = 20;
                
        this.MiniMap = false;

        
        this.TileMap = RSTools.createObject(pub.Map);
        this.TileMap.initMap(this);

        this.sideMenu = RSTools.createObject(pub.SideMenu);
        this.sideMenu.initMenu(this);

        this.TileMap.initTerrain();

        /*this.wood = RSTools.createObject(pub.Woodman);
        this.wood.init(this, 0, 0);

        this.saw = RSTools.createObject(pub.Sawmill);
        this.saw.init(this, -1, -3);

        this.base = RSTools.createObject(pub.Base);
        this.base.init(this, -5, -1);

        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, 10, 10, pub.StructureType.Tree);
        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, 4, 4, pub.StructureType.Tree);
        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, 6, 6, pub.StructureType.Tree);

        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, -5, -4, pub.StructureType.Tree);
        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, 2, 8, pub.StructureType.Tree);
        this.tree = RSTools.createObject(pub.Resource);
        this.tree.init(this, 6, 3, pub.StructureType.Tree);


        this.stone = RSTools.createObject(pub.Resource);
        this.stone.init(this,5, 8, pub.StructureType.Stone);
        this.stone = RSTools.createObject(pub.Resource);
        this.stone.init(this,8, 5, pub.StructureType.Stone);
        this.stone = RSTools.createObject(pub.Resource);
        this.stone.init(this,5, 3, pub.StructureType.Stone);
        this.stone = RSTools.createObject(pub.Resource);
        this.stone.init(this,4, 3, pub.StructureType.Stone);


        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, 0, 2);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -1, 2);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -2, 2);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -2, 1);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -2, 0);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -2, -1);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -1, -1);

        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -3, 2);
        this.street = RSTools.createObject(pub.Street);
        this.street.init(this, -4, 2);
        */

        this.onMouseDownAction.push(this.mouseDownAction);
        this.onMouseMoveAction.push(this.mouseMoveAction);
        this.onMouseUpAction.push(this.mouseUpAction);

        this.selectedObject = undefined;

        this.dragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragMouseX = 0;
        this.dragMouseY = 0;

        /*
        this.testCircle = RSTools.createObject(pub.DrawableBoxCircle);
        this.testCircle.initCircle(this, 100, 100, 10, "RED", 0);
        this.testCircle.initBoxCircle();
        */
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
            pub.MainContext.offsetX = pub.MainContext.dragStartX - (pub.MainContext.dragMouseX - pub.absMouseX);
            pub.MainContext.offsetY = pub.MainContext.dragStartY - (pub.MainContext.dragMouseY - pub.absMouseY);
        }
    };
    pub.MainContext.mouseUpAction = function (_button) {
        if (_button === 1) {
            pub.MainContext.dragging = false;
        }
    };
    pub.MainContext.work = function () {
        var i,
            ballCounter = 0,
            nextStep,
            now,
            score;
                
        pub.GameContext.work.apply(this, []);
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
        var i, j,level, item;

        this.items = [];

        pub.GameContext.init.apply(this, [_drawingContext]);

    }


    return pub;
}(IDIDGAME_Water || {}, undefined));