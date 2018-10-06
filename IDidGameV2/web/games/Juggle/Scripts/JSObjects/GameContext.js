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


var IDIDGAME_Juggle = (function (pub, undefined) {
    "use strict";

    pub.GameContext = function () { };
    pub.GameContext.init = function (_drawingContext) {
        this.toDraw = [];
        this.toCommit = [];
        this.toUpdate = [];
        this.toCall = [];
        
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

        for (i = this.toDraw.length-1; i >= 0; i--) {
            if (this.toDraw[i].draw()) {
                this.toDraw.splice(i, 1);
            }
        }

        this.untransform();

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
    pub.GameContext.addToDraw = function (_entry, _zIndex) {
        var index = _zIndex || _entry.zIndex,
            i=0;

        while (this.toDraw[i] && this.toDraw[i].zIndex > index) { i += 1; }

        this.toDraw.splice(i, 0, _entry);
    };
    pub.GameContext.untransform = function () {

        if (this.zoom) {
            this.drawingContext.scale(1 / this.zoom, 1 / this.zoom);
        }

        if (this.offsetX || this.offsetY) {
            this.drawingContext.translate(-this.offsetX, -this.offsetY);
        }

    }
    pub.GameContext.mouseMove = function (e) {
        var i,
            mouseObj,
            xPos = e.pageX - pub.canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - pub.canvas_main.offsetTop-this.offsetY;

        pub.mouseX = e.pageX - pub.canvas_main.offsetLeft-this.offsetX;
        pub.mouseY = e.pageY - pub.canvas_main.offsetTop-this.offsetY;

        for (i = this.onMouseMoveAction.length - 1; i >= 0; i--) {
            if (this.onMouseMoveAction[i]() === true) {
                this.onMouseMoveAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: xPos,
            posY: yPos,
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
        var xPos = e.pageX - canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - canvas_main.offsetTop-this.offsetY,
            i,
            mouseObj;

        for (i = this.onMouseDownAction.length - 1; i >= 0; i--) {
            if (this.onMouseDownAction[i](e.button) === true) {
                this.onMouseDownAction.splice(i, 1);
            }
        }

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        };
        for (i = 0; i < this.onMouseDown.length; i++) {
            if (RSTools.intersects(this.onMouseDown[i], mouseObj)) {
                this.onMouseDown[i].onMouseDown(e.button);
                break;
            }
        }
    };
    pub.GameContext.mouseUp = function (e) {
        var i,
            xPos = e.pageX - canvas_main.offsetLeft-this.offsetX,
            yPos = e.pageY - canvas_main.offsetTop-this.offsetY,
             mouseObj;

        mouseObj = {
            posX: xPos,
            posY: yPos,
            width: 1,
            height: 1
        }

        if (this.onMouseUpAction) {
            for (i = this.onMouseUpAction.length - 1; i >= 0; i--) {
                if (this.onMouseUpAction[i]() === true) {
                    this.onMouseUpAction.splice(i, 1);
                }
            }
        }

        if (this.onMouseUp) {
            for (i = 0; i < this.onMouseUp.length; i++) {
                if (RSTools.intersects(this.onMouseUp[i], mouseObj)) {
                    this.onMouseUp[i].onMouseUp();
                    break;
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

    pub.MainContext = RSTools.createObject(pub.GameContext);
    pub.MainContext.init = function (_drawingContext,_level) {
        var i, draw;

        pub.GameContext.init.apply(this, [_drawingContext]);

        this.initBox();
        this.boxBottomBorder.tag = this;

        this.level = _level || 1;

        if (this.level === 10) {
            this.level = 1;
        }

        this.offsetX = 0;
        this.offsetY = 0;

        this.borderSize = 20;

        this.drawOver = false;

        this.hands = [];
        this.state = 0;

        this.counter = 0;

        this.levelText = RSTools.createObject(pub.DrawableText);
        this.levelText.initText(this, 300, 150, true, "Level " + this.level, 50, "Red", -10);
        this.levelText.strokeStyle = "White";
        this.levelText.alpha = 0.5;

        this.instructionText = RSTools.createObject(pub.DrawableText);
        this.instructionText.initText(this, 300, 420, true, "", 20, "Red", -10);
        this.instructionText.strokeStyle = "White";
        this.instructionText.alpha = 0;

        this.text = RSTools.createObject(pub.DrawableText);
        this.text.initText(this, 300, 50, true, "", 20, "Black", -10);
        
        this.header = RSTools.createObject(pub.Drawable);
        this.header.initDrawable(this, 0, 0, 0, 0, 450, 60, -5);
        this.header.centerX = 305;
        this.header.centerY = 360;
        this.header.alpha = 0.5;

        this.space = RSTools.createObject(pub.Drawable);
        this.space.initDrawable(this, 0, 0, 0, 290, 450, 60, -5);
        this.space.initAnimation(0, 60, 2, 20);
        this.space.centerX = 300;
        this.space.centerY = 420;

        this.space.visible = false;

        this.loadLevel(this.level);

        this.progress = RSTools.createObject(pub.RoundProgressbar);
        this.progress.initBar(this, 240, 200, this.duration);
        this.progress.visible = false;
        
        this.timeText = RSTools.createObject(pub.DrawableText);
        this.timeText.initText(this, 350, 30, false, "", 40, "Red");
        this.timeText.strokeStyle = "White";

        this.started = new Date();
        this.finished = false;

        this.keyDownFunct = function () { };
        this.keyDownFunct.onKeyDown = function (_key) {
            pub.MainContext.keyPress(_key);
        };
        this.onKeyDown.push(this.keyDownFunct);

        this.levelSelectButton = RSTools.createObject(pub.Button);
        this.levelSelectButton.initButton(pub.MainContext, 5, 5, function () {
            pub.DoFadeUnfade(pub.MainContext, function () {
                pub.MenuContext.init(pub.MainContext.drawingContext);
                pub.currentGameContext = pub.MenuContext;
            });
        });

        /*
        this.testRect = RSTools.createObject(pub.DrawableBoxRect);
        this.testRect.initRect(this, 100, 100, 10, 10, "RED", 0);
        this.testRect.initBoxRect();
        */
        /*
        this.testCircle = RSTools.createObject(pub.DrawableBoxCircle);
        this.testCircle.initCircle(this, 100, 100, 10, "RED", 0);
        this.testCircle.initBoxCircle();
        */
    };
    pub.MainContext.keyPress = function (_key) {
        var i = 1;

        if (_key.keyCode == RSTools.Keys.SPACE) {
            if (this.state === pub.GameStates.Fail) {
                pub.DoFadeUnfade(pub.MainContext, function () {
                    pub.MainContext.init(pub.MainContext.drawingContext,pub.MainContext.level);
                    pub.currentGameContext = pub.MainContext;
                });
                //this.init(this.drawingContext, this.level);
            } else if (this.state === pub.GameStates.Success) {
                pub.DoFadeUnfade(pub.MainContext, function () {
                    pub.MainContext.init(pub.MainContext.drawingContext, pub.MainContext.level+1);
                    pub.currentGameContext = pub.MainContext;
                });
                //this.init(this.drawingContext, this.level + 1);
            }
        } else if (_key.keyCode == RSTools.Keys.ENTER || _key.keyCode==RSTools.Keys.BACKSPACE) {
            pub.DoFadeUnfade(pub.MainContext, function () {
                pub.MenuContext.init(pub.MainContext.drawingContext);
                pub.currentGameContext = pub.MenuContext;
            });
        }
    };
    pub.MainContext.loadLevel = function (_level) {
        switch (_level) {
            case pub.Levels.Inside2:

                this.duration = 200;
                this.totalBalls = 5;
                
                /*  Default 2Hand Inside*/
                this.leftHand = RSTools.createObject(pub.Hand);
                this.leftHand.initHand(this, 225, 540, RSTools.Keys.Q, 1, 3);

                this.rightHand = RSTools.createObject(pub.Hand);
                this.rightHand.initHand(this, 375, 540, RSTools.Keys.E, -1, 2);

                break;
            case pub.Levels.Pass2:

                this.duration = 300;
                this.totalBalls = 3;
                
                //* 2hand Pass from right Hand*/
                this.leftHand = RSTools.createObject(pub.Hand);
                this.leftHand.initHand(this, 190, 540, RSTools.Keys.Q, 1, 3);
                this.leftHand.maxSideCounter = 0;

                this.rightHand = RSTools.createObject(pub.SideHand);
                this.rightHand.initHand(this, 450, 540, RSTools.Keys.E, -1, 0);
                break;
            case pub.Levels.Reverse2:
                this.duration = 400;
                this.totalBalls = 5;

                /*  Default 2Hand Outside*/
                this.leftHand = RSTools.createObject(pub.ReverseHand);
                this.leftHand.initHand(this, 100, 540, RSTools.Keys.Q, 1, 3);

                this.rightHand = RSTools.createObject(pub.ReverseHand);
                this.rightHand.initHand(this, 500, 540, RSTools.Keys.E, -1, 2);

                break;
            case pub.Levels.Pass3:

                this.duration = 200;
                this.totalBalls = 4;
                
                /* 3hand pass from right hand*/
                this.leftHand = RSTools.createObject(pub.Hand);
                this.leftHand.initHand(this, 225, 540, RSTools.Keys.Q, 1, 2);
                this.leftHand.maxSideCounter = 100;

                this.middleHand = RSTools.createObject(pub.Hand);
                this.middleHand.initHand(this, 375, 540, RSTools.Keys.W, -1, 1);
                this.middleHand.maxSideCounter = 0;

                this.rightHand = RSTools.createObject(pub.SideHand);
                this.rightHand.initHand(this, 490, 540, RSTools.Keys.E, -1, 1);

                break;
            case pub.Levels.DoubleColumn:

                this.duration = 400;
                this.totalBalls = 4;

                /* left and right column from alternating middle*/

                this.leftHand = RSTools.createObject(pub.Hand);
                this.leftHand.initHand(this, 150, 540, RSTools.Keys.Q, 1, 0);
                this.leftHand.maxSideCounter = 100;
                this.leftHand.xFactor = -0.4;

                this.middleHand = RSTools.createObject(pub.Hand);
                this.middleHand.initHand(this, 300, 540, RSTools.Keys.W, -1, 4);
                this.middleHand.maxSideCounter = 0;
                this.middleHand.alternate = true;
                this.middleHand.xFactor = 0.9;
                
                this.rightHand = RSTools.createObject(pub.Hand);
                this.rightHand.initHand(this, 450, 540, RSTools.Keys.E, -1, 0);
                this.rightHand.maxSideCounter = 100;
                this.rightHand.xFactor = -0.4;
                
                break;
            case pub.Levels.InsideOut3:

                this.duration = 300;
                this.totalBalls = 4;

                /* 3hand highway*/
                this.leftHand = RSTools.createObject(pub.ReverseHand);
                this.leftHand.initHand(this, 175, 540, RSTools.Keys.Q, 1, 2);
                this.leftHand.maxSideCounter = 100;
                this.leftHand.xFactor = 1.2;

                this.rightInsideHand = RSTools.createObject(pub.ReverseHand);
                this.rightInsideHand.initHand(this, 375, 540, RSTools.Keys.W, -1, 1);
                this.rightInsideHand.xFactor = 0.4;
                this.rightInsideHand.maxSideCounter = 0;

                this.rightOutsideHand = RSTools.createObject(pub.ReverseHand);
                this.rightOutsideHand.initHand(this, 490, 540, RSTools.Keys.E, -1, 1);
                this.rightOutsideHand.xFactor = 0.4;
                this.rightOutsideHand.maxSideCounter = 0;

                break;
            case pub.Levels.DoublePass:

                this.duration = 400;
                this.totalBalls = 4;

                /* 3hand pass from right hand*/
                this.leftHand = RSTools.createObject(pub.SideHand);
                this.leftHand.initHand(this, 50, 540, RSTools.Keys.Q, 1, 0);

                this.middleHand = RSTools.createObject(pub.Hand);
                this.middleHand.initHand(this, 300, 540, RSTools.Keys.W, -1, 4);
                this.middleHand.maxSideCounter = 0;
                this.middleHand.alternate = true;
                this.middleHand.xFactor = 0.9;

                this.rightHand = RSTools.createObject(pub.SideHand);
                this.rightHand.initHand(this, 550, 540, RSTools.Keys.E, -1, 0);

                break;
            case pub.Levels.InsideOut4:

                this.duration = 400;
                this.totalBalls = 5;

                /* 4hand highway*/
                this.leftHand = RSTools.createObject(pub.ReverseHand);
                this.leftHand.initHand(this, 75, 540, RSTools.Keys.Q, 1, 2);
                this.leftHand.maxSideCounter = 100;
                this.leftHand.xFactor = 1.5;

                this.rightInsideHand = RSTools.createObject(pub.ReverseHand);
                this.rightInsideHand.initHand(this, 275, 540, RSTools.Keys.W, -1, 1);
                this.rightInsideHand.xFactor = 0.4;
                this.rightInsideHand.maxSideCounter = 0;

                this.rightOutsideHand = RSTools.createObject(pub.ReverseHand);
                this.rightOutsideHand.initHand(this, 390, 540, RSTools.Keys.E, -1, 1);
                this.rightOutsideHand.xFactor = 0.4;
                this.rightOutsideHand.maxSideCounter = 0;

                this.rightOOutsideHand = RSTools.createObject(pub.ReverseHand);
                this.rightOOutsideHand.initHand(this, 505, 540, RSTools.Keys.R, -1, 1);
                this.rightOOutsideHand.xFactor = 0.4;
                this.rightOOutsideHand.maxSideCounter = 0;

                break;
            case pub.Levels.Pass4:

                this.duration = 400;
                this.totalBalls = 5;

                /* 4hand pass from both hands*/
                this.leftHand = RSTools.createObject(pub.Hand);
                this.leftHand.initHand(this, 205, 540, RSTools.Keys.W, 1, 3);
                this.leftHand.maxSideCounter = 0;

                this.rightHand = RSTools.createObject(pub.Hand);
                this.rightHand.initHand(this, 350, 540, RSTools.Keys.E, -1, 2);
                this.rightHand.maxSideCounter = 0;

                this.rightPassHand = RSTools.createObject(pub.SideHand);
                this.rightPassHand.initHand(this, 485, 540, RSTools.Keys.R, -1, 0);

                this.leftPassHand = RSTools.createObject(pub.SideHand);
                this.leftPassHand.initHand(this, 80, 540, RSTools.Keys.Q, 1, 0);
                /**/
                break;
        }
    };
    pub.MainContext.work = function () {
        var i,
            ballCounter = 0,
            nextStep,
            now,
            score;

        pub.contextOverlay.clearRect(0, 0, pub.canvas_main.width, pub.canvas_main.height);
        
        if (this.state === 0) {//THROW
            this.text.text = "THROW!";
            this.instructionText.text = "HOLD AND RELEASE KEYS";
            this.instructionText.alpha = 0.3;

            nextStep = true;
            for (i = 0; i < this.hands.length; i++) {
                if (this.hands[i].thrownBalls < this.hands[i].initBallCount) {
                    nextStep = false;
                    break;
                }
            }
            
            if (nextStep) {
                this.state = 1;

                this.instructionText.alpha = 0;

                this.started = new Date();
                this.progress.visible = true;

                this.header.spriteY = 60;
                this.header.height = 110;
            }
        } else if (this.state === 1) {//KEEP IT GOING
            this.text.text = "KEEP IT GOING! " + (this.duration - this.counter);

            now = new Date();
            this.timeText.text = RSTools.formatDuration(now - this.started);

            this.counter += 1;
            this.progress.value = this.counter;

            if (this.counter >= this.duration) {
                this.state = 2;

                this.progress.visible = false;

                this.header.spriteY = 170;
                this.header.height = 60;
            }
        } else if (this.state === 2) {//CATCH
            this.text.text = "CATCH!";
            
            this.instructionText.text = "DOUBLE TAP KEYS";
            this.instructionText.alpha = 0.3;

            now = new Date();

            if (this.finished === false) {
                this.timeText.text = RSTools.formatDuration(now - this.started);
            } else {
                this.timeText.text = RSTools.formatDuration(this.finished - this.started);
            }

            for (i = 0; i < this.hands.length; i++) {
                ballCounter += this.hands[i].caughtBalls;
            }

            if (ballCounter > 0 && this.finished === false) {
                this.finished = new Date();
            }

            if (ballCounter === this.totalBalls) {
                this.state = 100;

                score = pub.getStoredValue(pub.LevelPrefix + this.level);
                if (score===null || (this.finished - this.started) > score) {
                    pub.setStoredValue(pub.LevelPrefix + this.level, this.finished - this.started);
                }

                this.instructionText.alpha = 0;

                this.header.spriteY = 410;
                this.header.alpha = 1;
                this.space.visible = true;
            }
        } else if (this.state === 100) {//DONE IT!
            this.text.text = "NICE!";

        } else if (this.state === -1) {//DROP :(
            this.text.text = "YOU DONE FUCKED IT UP!";

            this.instructionText.alpha = 0;

            this.header.spriteY = 230;
            this.header.height = 60;
            this.header.alpha = 1;

            this.space.visible = true;
        }


        pub.GameContext.work.apply(this, []);

        this.collision();

        this.drawUI();
    };
    pub.MainContext.collision = function () {
        
    };
    pub.MainContext.drawUI = function () {
        
        /*
        pub.contextOverlay.fillStyle = "White";
        pub.contextOverlay.fillRect(0, 0, pub.canvas_main.width, this.borderSize);
        pub.contextOverlay.fillRect(0, 0, this.borderSize, pub.canvas_main.height);
        pub.contextOverlay.fillRect(pub.canvas_main.width - this.borderSize, 0, this.borderSize, pub.canvas_main.height);
        pub.contextOverlay.fillRect(0, pub.canvas_main.height - this.borderSize, pub.canvas_main.width, this.borderSize);
        */
    };
    pub.MainContext.Hit = function () {
        this.state = -1;
    };

    
    pub.Levels = {
        Inside2: 1,
        Pass2: 2,
        Reverse2: 3,
        Pass3: 4,
        DoubleColumn: 5,
        InsideOut3: 6,
        DoublePass: 7,
        InsideOut4: 8,
        Pass4: 9
    };
    pub.GameStates = {
        Throw: 0,
        KeepItGoing: 1,
        Catch: 2,
        Success: 100,
        Fail: -1
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

        this.initBox();

        level=0;
        for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
                level += 1;
                item = RSTools.createObject(pub.MenuItem);
                item.initItem(this, 75 + 175 * j, 150 + 150 * i, level);
                this.items.push(item);
            }
        }

        this.title = RSTools.createObject(pub.Drawable);
        this.title.initDrawable(this, 85, 50, 450, 290, 430, 60, 10);
    }

    return pub;
}(IDIDGAME_Juggle || {}, undefined));