// https://github.com/dansdom/extend
var extend = extend || function(){var h,g,b,e,i,c=arguments[0]||{},f=1,k=arguments.length,j=!1,d={hasOwn:Object.prototype.hasOwnProperty,class2type:{},type:function(a){return null==a?String(a):d.class2type[Object.prototype.toString.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==d.type(a)||a.nodeType||d.isWindow(a))return!1;try{if(a.constructor&&!d.hasOwn.call(a,"constructor")&&!d.hasOwn.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}for(var b in a);return void 0===b||d.hasOwn.call(a, b)},isArray:Array.isArray||function(a){return"array"===d.type(a)},isFunction:function(a){return"function"===d.type(a)},isWindow:function(a){return null!=a&&a==a.window}};"boolean"===typeof c&&(j=c,c=arguments[1]||{},f=2);"object"!==typeof c&&!d.isFunction(c)&&(c={});k===f&&(c=this,--f);for(;f<k;f++)if(null!=(h=arguments[f]))for(g in h)b=c[g],e=h[g],c!==e&&(j&&e&&(d.isPlainObject(e)||(i=d.isArray(e)))?(i?(i=!1,b=b&&d.isArray(b)?b:[]):b=b&&d.isPlainObject(b)?b:{},c[g]=extend(j,b,e)):void 0!==e&&(c[g]= e));return c};

// animation frame polyfill
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame  ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
        }
}

var Game = Game || {};
/********************************
 * Breakout instance constructor
 ********************************/
Game.Breakout = (function() {
    'use strict';

    var defaults = {
        tiles : {
            x : 48, // width
            y : 30, //height
            size : 20 // unit size
        },
        level : 1,  // current level of the game
        dataSource : 'levels.json',
        levelData : {}, // brick data
        lives : 3  // number of lives left
    };

    var breakout = function(canvasId, options, callback) {
        var breakout = this;
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        // define the element and context
        this.el = document.getElementById(canvasId);
        this.ctx = this.el.getContext('2d');

        // get the level data first, then init
        microAjax(this.settings.dataSource, function(data) {
            breakout.settings.levelData = JSON.parse(data);
            breakout.init();
        });
    };

    breakout.prototype = {
        init : function() {
            // make stuff
            var opts = this.settings;

            // load in the court
            this.Court = new Game.Court(this, {
                level : opts.level,
                levelData : opts.levelData,
                tiles : opts.tiles 
            });
            // initialise paddle
            this.Paddle = new Game.Paddle(this);
            // get a ball
            this.Ball = new Game.Ball(this);

            // draw starting state here?!?
            
            // start the game runner to manage the game loop
            this.Runner = new Game.Engine.Runner(this);
            this.Runner.init();

            if (typeof this.callback === 'function') {
                this.callback.call();
            }
        },
        getLevelData : function() {

        },
        update : function(dx) {
            // not sure what I'm doing here yet on the update functions
            // wil probably be a game state check for most
            this.Court.update(dx);
            this.Paddle.update(dx);
            // update ball position - for all current balls
            this.Ball.update(dx);
        },
        draw : function() {
            this.Court.draw(this.ctx);
            this.Paddle.draw(this.ctx);
            // if more than one ball, then loop through
            this.Ball.draw(this.ctx);
        }
    };

    return breakout;
})();


/*******************
 * Ball Constructor
 *******************/
Game.Ball = (function() {

    var defaults = {
        size : 10,
        speed : 10,
        color : 'red'
    };

    var ball = function(game, options, callback) {
        // init the ball
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        this.game = game;
        console.log(game);
        this.targets = [];  // targets that the ball can hit
        this.init();
    }

    ball.prototype = {
        init : function() {
            // just for now I'm going to set the speed and direction for testing
            this.speed = 10;
            this.x = 100;
            this.y = 100;
            this.draw(this.game.ctx);
            this.moving = true;
            console.log(Game.Engine.Physics.magnitude(4,4));
        },
        reset : function() {
            // reset ball position after death or level up
        },
        launch : function() {

        },
        setPos : function(x, y) {
            this.x = x;
            this.y = y;
        },
        update : function(dt) {
            //console.log('updating ball: '+dt);
            if (!this.moving) {
                alert('ball is no longer moving');
                return;
            }

        },
        draw : function(ctx) {
            ctx.fillStyle = this.settings.color;
            ctx.strokeStyle = this.settings.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.settings.size, 0, 2*Math.PI, true);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    };

    return ball;
})();


/*********************
 * Paddle Constructor
 *********************/
Game.Paddle = (function() {

    var defaults = {

    };

    var paddle = function(game, options, callback) {
        // init the paddle
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        this.game = game;
        this.init();
    }

    paddle.prototype = {
        init : function() {

        },
        launch : function() {

        },
        update : function() {

        },
        draw : function(ctx) {

        }
    };

    return paddle;
})();


/********************
 * Court Constructor
 ********************/
Game.Court = (function() {

    var defaults = {
        level : 0,
        levelData : {}
    };

    var court = function(game, options, callback) {
        // init the court
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        this.game = game;
        this.init();
    }

    court.prototype = {
        init : function() {
            console.log('making new court');
            // make the bricks object

            // get all the court data and shis
            this.render(this.game.ctx);
        },
        load : function() {

        },
        update : function() {
            // do update stuff

        },
        draw : function() {

        },
        render : function(ctx) {
            var opts = this.settings,
                bricks, // have stored bricks?
                i = 0;

            // draw the bricks
            

            this.padding = opts.tiles.size * 2;
            this.width = opts.tiles.size * opts.tiles.x;
            this.height = opts.tiles.size * opts.tiles.y;
            this.boundary = {};
            this.boundary.top = this.padding;
            this.boundary.left = this.padding;
            this.boundary.bottom = this.boundary.top + (opts.tiles.y * opts.tiles.size);
            this.boundary.right = this.boundary.left + (opts.tiles.x * opts.tiles.size);
            console.log(this.boundary);

            ctx.fillStyle = 'transparent',
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.boundary.left, this.boundary.top);
            ctx.lineTo(this.boundary.left, this.boundary.bottom);
            ctx.lineTo(this.boundary.right, this.boundary.bottom);
            ctx.lineTo(this.boundary.right, this.boundary.top);
            ctx.lineTo(this.boundary.left, this.boundary.top);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
    };

    return court;
})();