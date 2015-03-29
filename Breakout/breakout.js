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

var Breakout = (function() {
    'use strict';

    

    
    var Breakout = {
        Defaults : {

        },
        Court : {

        },
        Ball : {
            // want multiple balls at once
        },
        Paddle : {

        }
    };

    Breakout.prototype = {
        initialise : function() {
            
        }
    }

    return Breakout;
})();


var Ball = (function() {

    // Ball constructor
    var ball = function(options, callback) {
        // init the ball
        this.callback = callback;
        this.settings = extend(true, {}, this.defaults, options);
        this.init();
    }

    ball.defaults = {
        size : 10,
        speed : 10,
        color : 'red'
    };

    ball.prototype = {
        init : function() {
            // extend over the defaults
        },
        update : function() {

        }
    };

    return ball;
})();

var Paddle = (function() {

    var paddle = function(options, callback) {
        // init the paddle
        this.callback = callback;
        this.settings = extend(true, {}, this.defaults, options);
        this.init();
    }

    paddle.defaults = {

    };

    paddle.prototype = {
        init : function() {

        },
        launch : function() {

        },
        update : function() {

        }
    };

})();

var Court = (function() {

    var court = function(options, callback) {
        // init the court
        this.callback = callback;
        this.settings = extend(true, {}, this.defaults, options);
        this.init();
    }

    court.defaults = {

    };

    court.prototype = {
        init : function() {

        },
        load : function() {

        },
        update : function() {

        }
    };

})();