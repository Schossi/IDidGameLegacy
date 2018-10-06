/// <reference path="../Main.js" />
/// <reference path="../Box2dWeb-2.1.a.3.js" />
/// <reference path="../RSTools.js" />
/// <reference path="../Main.js" />
/// <reference path="GameContext.js" />
/// <reference path="Effects.js" />
/// <reference path="Prototypes.js" />
/// <reference path="Sound.js" />
/// <reference path="FireUtils.js" />
/// <reference path="Fire.js" />
/// <reference path="UI.js" />


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

    pub.currentGameState = 0;
    pub.GameState = {
        Init: 0,
        Menu: 10,
        ToGame: 20,
        Game: 30,
        GameEnd: 35,
        FromGame: 40
    };


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
            this.drawingContext.fillStyle = "#0080FF";
            this.drawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
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

        for (i = this.toUpdate.length-1; i >=0; i--) {
            if (this.toUpdate[i].update()) {
                this.toUpdate.splice(i, 1);
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

        if (this.contextKeyDown) {
            this.contextKeyDown(e);
        }

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

        pub.GameContext.init.apply(this, [_drawingContext]);
        
        this.offsetX = 0;
        this.offsetY = 1000;

        this.drawOver = true;

        this.borderSize = 20;

        this.rumbleCounter = 0;

        this.counter = 0;
        
        this.inputBox = false;

        this.blinkText = RSTools.createObject(pub.DrawableText);
        this.blinkText.initText(this, 400, 400, true, "Press ENTER to continue",18,"White",16);
        this.blinkText.alpha = 0;

        this.blinkCounter = 0;

        pub.fire = undefined;

        //pub.canvas_main.width = (pub.width + 2) * pub.blockSize;
        //pub.canvas_main.height = (pub.height + 3) * pub.blockSize;
        //pub.canvas_overlay.height = pub.canvas_main.height;
        
        this.setGameState(pub.GameState.Init);
    };
    pub.MainContext.work = function () {
        var i;
         
        switch (pub.currentGameState) {
            case pub.GameState.Init:
                this.setGameState(pub.GameState.Menu);
                break;
            case pub.GameState.Menu:

                break;
            case pub.GameState.ToGame:
                this.counter += 1;
                this.offsetY-=10;

                if (this.counter == 100) {
                    this.setGameState(pub.GameState.Game);
                }
                break;
            case pub.GameState.Game:
                if (this.rumbleCounter) {
                    this.rumbleCounter -= 1;

                    this.drawingContext.globalAlpha = this.rumbleCounter * 0.1;
                    this.drawingContext.fillStyle="Yellow";
                    this.drawingContext.fillRect(0, 0, 800, 600);
                    this.drawingContext.globalAlpha = 1;

                    if (this.rumbleCounter === 0) {
                        this.offsetX = 0;
                        this.offsetY = 0;
                    } else {
                        this.offsetX += Math.random() * 10 - 5;
                        this.offsetY += Math.random() * 10 - 5;
                    }
                }
                break;
            case pub.GameState.GameEnd:
                this.counter += 1;
                
                this.blinkCounter += 1;

                if (this.blinkCounter >= 30) {
                    this.blinkCounter = 0;

                    if (this.blinkText.alpha > 0) {
                        this.blinkText.alpha = 0;
                    } else {
                        this.blinkText.alpha = 1;
                    }
                }

                break;
            case pub.GameState.FromGame:
                this.counter += 1;
                this.offsetY += 10;

                if (this.counter == 100) {
                    this.setGameState(pub.GameState.Menu);
                }
                break;
        }

        pub.GameContext.work.apply(this, []);
    };
    pub.MainContext.setGameState = function (_state) {
        var i, obj;

        pub.currentGameState = _state;
        this.counter = 0;

        switch (pub.currentGameState) {
            case pub.GameState.Init:

                break;
            case pub.GameState.Menu:

                break;
            case pub.GameState.ToGame:
                pub.GameContext.init.apply(this, [this.drawingContext]);
                pub.fire = RSTools.createObject(pub.Grid);
                pub.fire.initGrid(this);
                this.offsetY = 1000;
                break;
            case pub.GameState.Game:
                this.offsetY = 0;
                break;
            case pub.GameState.GameEnd:

                obj = RSTools.createObject(pub.DrawableRect);
                obj.initRect(this, 0, 100, 800, 400, "#848484", 15);
                obj.alpha = 0.5;

                obj = RSTools.createObject(pub.DrawableText);
                obj.initText(this, 400, 150, true, "Game Over", 50, "White", 16);
                
                this.blinkText.addToContext();

                pub.trySubmitScore("SCORE",pub.fire.score);

                i = pub.Highscore.getHighscorePosition(pub.fire.score);
                if (i >= 0) {
                    obj = RSTools.createObject(pub.DrawableText);
                    obj.initText(this, 400, 200, true, "Insert name to enter Highscore!", 18, "White", 16);


                    this.inputBox = RSTools.createObject(pub.Textbox);
                    this.inputBox.initTextbox(this, 310, 300, 30, 10);
                } else {
                    this.inputBox = false;
                }

                pub.SkyContext.refreshHighScores();
                break;
            case pub.GameState.FromGame:

                this.blinkText.alpha = 0;

                if (this.inputBox && this.inputBox.text.length>0) {
                    pub.Highscore.setScore(pub.fire.score, this.inputBox.text);
                }

                break;
        }
    }
    pub.MainContext.contextKeyDown = function (_args) {
        if (pub.currentGameState === pub.GameState.Menu) {
            this.setGameState(pub.GameState.ToGame);
        } else if (pub.currentGameState === pub.GameState.GameEnd && _args.keyCode === RSTools.Keys.ENTER && this.counter > 100) {
            this.setGameState(pub.GameState.FromGame);
        }
    };
    
    pub.UIContext = RSTools.createObject(pub.GameContext);
    pub.UIContext.init = function (_drawingContext) {

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.drawOver = true;

        this.borderSize = 20;

        this.main = RSTools.createObject(pub.UI);
        this.main.initUI(this);
    };
    pub.UIContext.work = function () {
        this.offsetY = pub.MainContext.offsetY;
        pub.GameContext.work.apply(this, []);
    };

    pub.BackContext = RSTools.createObject(pub.GameContext);
    pub.BackContext.init = function (_drawingContext) {
        var i, j, back;

        this.actualDrawingContext = _drawingContext;
        this.bufferCanvas=document.createElement('canvas');
        this.bufferCanvas.width = 800;
        this.bufferCanvas.height = 600;
        this.bufferDrawingContext=this.bufferCanvas.getContext("2d");
        
        pub.GameContext.init.apply(this, [this.bufferDrawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 0.5;

        this.drawOver = true;

        //off X:0 Y:350

        back = RSTools.createObject(pub.RepeatingDrawable);
        back.randTile = 5;
        back.init(this, -50, 0, 400, 100, 300, 50, 7, 16, 0, 250, 35, 50, 300, true);

        pub.GameContext.work.apply(this, []);

        this.toDraw = [];
        this.toCommit = [];
    };
    pub.BackContext.work = function () {
        this.offsetY = pub.MainContext.offsetY / 3;
        //pub.GameContext.work.apply(this, []);
        
        this.actualDrawingContext.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.actualDrawingContext.fillStyle = "#0080FF";
        this.actualDrawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);

        this.actualDrawingContext.drawImage(this.bufferCanvas, 0, 350 * this.zoom + this.offsetY);
        
        this.actualDrawingContext.globalAlpha = 0.3;
        this.actualDrawingContext.fillStyle = "White";
        this.actualDrawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.actualDrawingContext.globalAlpha = 1;
    };

    pub.BackContext2 = RSTools.createObject(pub.GameContext);
    pub.BackContext2.init = function (_drawingContext) {
        var i, j, back;

        this.actualDrawingContext = _drawingContext;
        this.bufferCanvas = document.createElement('canvas');
        this.bufferCanvas.width = 800;
        this.bufferCanvas.height = 600;
        this.bufferDrawingContext = this.bufferCanvas.getContext("2d");

        pub.GameContext.init.apply(this, [this.bufferDrawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 0.8;

        this.drawOver = true;

        //off X:0 Y:300

        back = RSTools.createObject(pub.RepeatingDrawable);
        back.randTile = 5;
        back.init(this, -50, 0, 400, 100, 300, 50, 2, 14, 0, 250, 35, 50, 300, true);

        pub.GameContext.work.apply(this, []);

        this.toDraw = [];
        this.toCommit = [];
    };
    pub.BackContext2.work = function () {
        this.offsetY = pub.MainContext.offsetY / 2;
        //pub.GameContext.work.apply(this, []);
        
        this.actualDrawingContext.drawImage(this.bufferCanvas, 0, 300 * this.zoom + this.offsetY);

        this.actualDrawingContext.globalAlpha = 0.3;
        this.actualDrawingContext.fillStyle = "White";
        this.actualDrawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.actualDrawingContext.globalAlpha = 1;
    };

    pub.BackContext3 = RSTools.createObject(pub.GameContext);
    pub.BackContext3.init = function (_drawingContext) {
        var i, j, back;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 0.9;

        this.drawOver = true;

        back = RSTools.createObject(pub.RepeatingDrawable);
        back.randTile = 5;
        back.init(this, 400, 380, 400, 100, 300, 50, 1, 10, 0, 250, 35, 50, 300, true);
    };
    pub.BackContext3.work = function () {
        this.offsetY = pub.MainContext.offsetY / 1.5;
        pub.GameContext.work.apply(this, []);

        this.drawingContext.globalAlpha = 0.3;
        this.drawingContext.fillStyle = "White";
        this.drawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.drawingContext.globalAlpha = 1;
    };

    /*pub.BackContext2 = RSTools.createObject(pub.GameContext); ORIGINAL DRAWING EVERY FRAME
    pub.BackContext2.init = function (_drawingContext) {
        var i, j, back;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 0.8;

        this.drawOver = true;

        back = RSTools.createObject(pub.RepeatingDrawable);
        back.randTile = 5;
        back.init(this, -50, 300, 400, 100, 300, 50, 2, 14, 0, 250, 35, 50, 300, true);
    };
    pub.BackContext2.work = function () {
        this.offsetY = pub.MainContext.offsetY / 2;
        pub.GameContext.work.apply(this, []);

        this.drawingContext.globalAlpha = 0.3;
        this.drawingContext.fillStyle = "White";
        this.drawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.drawingContext.globalAlpha = 1;
    };

    pub.BackContext3 = RSTools.createObject(pub.GameContext);
    pub.BackContext3.init = function (_drawingContext) {
        var i, j, back;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.zoom = 0.9;

        this.drawOver = true;

        back = RSTools.createObject(pub.RepeatingDrawable);
        back.randTile = 5;
        back.init(this, 400, 380, 400, 100, 300, 50, 1, 10, 0, 250, 35, 50, 300, true);
    };
    pub.BackContext3.work = function () {
        this.offsetY = pub.MainContext.offsetY / 1.5;
        pub.GameContext.work.apply(this, []);

        this.drawingContext.globalAlpha = 0.3;
        this.drawingContext.fillStyle = "White";
        this.drawingContext.fillRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        this.drawingContext.globalAlpha = 1;
    };*/

    pub.SkyContext = RSTools.createObject(pub.GameContext);
    pub.SkyContext.init = function (_drawingContext) {

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.drawOver = true;

        this.offsetX = 0;
        this.offsetY = 0;

        this.clouds = RSTools.createObject(pub.CloudSpawner);
        this.clouds.initSpawner(this, 10);

        this.title = RSTools.createObject(pub.Drawable);
        this.title.initDrawable(this, 125, 50, 150, 30, 550, 60, 10);

        this.controls = RSTools.createObject(pub.Drawable);
        this.controls.initDrawable(this, 600, 230, 800, 100, 200, 250, 10);

        this.blinkText = RSTools.createObject(pub.DrawableText);
        this.blinkText.initText(this, 400, 150, true, "Press key to start game!", 36, "White", 16);
        
        this.blinkCounter=0;

        this.initHighScores();
        this.refreshHighScores();
    };
    pub.SkyContext.initHighScores = function () {
        var i,
            text;

        this.highNameTexts = [];
        this.highScoreTexts = [];

        for (i = 0; i < 10; i++) {
            text = RSTools.createObject(pub.DrawableText);
            text.initText(this, 20, 250 + 25 * i, false, "", 16, "White", 20);
            this.highNameTexts.push(text);

            text = RSTools.createObject(pub.DrawableText);
            text.initText(this, 160, 250 + 25 * i, false, "", 16, "White", 20);
            this.highScoreTexts.push(text);
        }
    };
    pub.SkyContext.refreshHighScores = function () {
        var i;

        if (this.highNameTexts) {
            for (i = 0; i < 10; i++) {
                this.highNameTexts[i].text = (i + 1) + " " + pub.Highscore.scores[i].name;
                this.highScoreTexts[i].text = pub.Highscore.scores[i].score;
            }
        }

    };
    pub.SkyContext.work = function () {
        this.offsetY = pub.MainContext.offsetY - 1000;

        if (pub.currentGameState === pub.GameState.Menu) {

            this.blinkCounter += 1;

            if (this.blinkCounter >= 30) {
                this.blinkCounter = 0;

                if (this.blinkText.alpha > 0) {
                    this.blinkText.alpha = 0;
                } else {
                    this.blinkText.alpha = 1;
                }
            }

        } else {
            this.blinkText.alpha = 0;
        }

        pub.GameContext.work.apply(this, []);
    };

    pub.SoundSliderContext = RSTools.createObject(pub.GameContext);
    pub.SoundSliderContext.init = function (_drawingContext) {

        this.drawOver = true;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.offsetX = 0;
        this.offsetY = 0;

        this.volumeEffectSlider = RSTools.createObject(pub.SliderButton);
        this.volumeEffectSlider.initButton(this, 700, 560, pub.sound.effectVolume, "Effects", pub.sound.setEffectVolume);
        //this.volumeMusicSlider = RSTools.createObject(pub.SliderButton);
        //this.volumeMusicSlider.initButton(this, 700, 580, pub.sound.musicVolume, "Music", pub.sound.setMusicVolume);

    };

    pub.MenuContext = RSTools.createObject(pub.GameContext);
    pub.MenuContext.init = function (_drawingContext) {
        var i, j,level, item;

        this.items = [];

        pub.GameContext.init.apply(this, [_drawingContext]);

    }


    return pub;
}(IDIDGAME_Water || {}, undefined));