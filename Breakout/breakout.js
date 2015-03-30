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
        levelData : {},
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
            this.Court = new Game.Court({
                level : opts.level,
                levelData : opts.levelData 
            });
            // initialise paddle
            this.Paddle = new Game.Paddle();
            // get a ball
            this.Ball = new Game.Ball();
            
            // start the game engine
            this.Runner = new Game.Engine.Runner();
            this.Runner.init();
            console.log('init engine');
            

            if (typeof this.callback === 'function') {
                this.callback.call();
            }
        },
        getLevelData : function() {

        },
        draw : function() {
            this.Court.draw(ctx);
            this.Paddle.draw(ctx);
            // if more than one ball, then loop through
            this.Ball.draw(ctx);
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

    var ball = function(options, callback) {
        // init the ball
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        this.init();
    }

    ball.prototype = {
        init : function() {
            // extend over the defaults
        },
        update : function() {

        },
        draw : function(ctx) {

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

    var paddle = function(options, callback) {
        // init the paddle
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
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

    var court = function(options, callback) {
        // init the court
        this.callback = callback;
        this.settings = extend(true, {}, defaults, options);
        this.init();
    }

    court.prototype = {
        init : function() {
            console.log('making new court');
        },
        load : function() {

        },
        update : function() {
            // do update stuff

            // then draw
            this.draw();
        },
        draw : function(ctx) {

        }
    };

    return court;
})();