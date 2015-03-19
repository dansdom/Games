// Dan's attempt at Tetris...
(function() {
    'use strict';

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

    // define game constants
    var canvas = document.getElementById('tetris'),
        ctx = canvas.getContext('2d'),
        court, // object to hold the dropped blocks
        courtWidth = 12,
        courtHeight = 20,
        blockWidth = canvas.width / courtWidth,
        blockHeight = canvas.height / courtHeight,
        keys = {
            esc : 27,
            space : 32,
            left : 37,
            up : 38,
            right : 39,
            down : 40  
        };


    //console.log(blockWidth);
    //console.log(blockHeight);

    /*
    *   Tetromones
    *   e.g. console.log(parseInt('1000', 2).toString(16)) = 8 == 0x8;
    *   
    *   I:  0010 = 0x2 << 3 == 0x2000;  0000 = 0x0 << 3 == 0x0000;  0010 = 0x2 << 3 == 0x2000;  0000 = 0x0 << 3 == 0x0000;
    *       0010 = 0x2 << 2 == 0x0200;  1111 = 0xf << 2 == 0xf000;  0010 = 0x2 << 2 == 0x0200;  1111 = 0xf << 2 == 0xf000;
    *       0010 = 0x2 << 1 == 0x0020;  0000 = 0x0 << 1 == 0x0000;  0010 = 0x2 << 1 == 0x0020;  0000 = 0x0 << 1 == 0x0000;
    *       0010 = 0x2 << 0 == 0x0002;  0000 = 0x0 << 0 == 0x0000;  0010 = 0x2 << 0 == 0x0002;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x2222                      0xf000                      0x2222                      0xf000
    *
    *   J:  0010 = 0x2 << 3 == 0x2000;  1000 = 0x8 << 3 == 0x8000;  0110 = 0x6 << 3 == 0x6000;  1110 = 0x8 << 3 == 0x8000;
    *       0010 = 0x2 << 2 == 0x0200;  1110 = 0xe << 2 == 0x0e00;  0100 = 0x4 << 2 == 0x0400;  0010 = 0x2 << 2 == 0x0200;
    *       0110 = 0x6 << 1 == 0x0060;  0000 = 0x0 << 1 == 0x0000;  0100 = 0x4 << 1 == 0x0040;  0000 = 0x0 << 1 == 0x0000;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x2260                      0x8e00                      0x6440                      0x8200
    *
    *   L:  0100 = 0x4 << 3 == 0x4000;  1110 = 0xe << 3 == 0xe000;  0110 = 0x6 << 3 == 0x6000;  0010 = 0x2 << 3 == 0x2000;
    *       0100 = 0x4 << 2 == 0x0400;  1000 = 0x8 << 2 == 0x0800;  0010 = 0x2 << 2 == 0x0200;  1110 = 0xe << 2 == 0x0e00;
    *       0110 = 0x6 << 1 == 0x0060;  0000 = 0x0 << 1 == 0x0000;  0010 = 0x2 << 1 == 0x0020;  0000 = 0x0 << 1 == 0x0000;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x4460                      0xe800                      0x6220                      0x2e00
    *
    *   O:  0000 = 0x0 << 3 == 0x0000;  0000 = 0x0 << 3 == 0x0000;  0000 = 0x0 << 3 == 0x0000;  0000 = 0x0 << 3 == 0x0000;
    *       0110 = 0x6 << 2 == 0x0600;  0110 = 0x6 << 2 == 0x0600;  0110 = 0x6 << 2 == 0x0600;  0110 = 0x6 << 2 == 0x0600;
    *       0110 = 0x6 << 1 == 0x0060;  0110 = 0x6 << 1 == 0x0060;  0110 = 0x6 << 1 == 0x0060;  0110 = 0x6 << 1 == 0x0060;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x0660                      0x0660                      0x0660                      0x0660
    *
    *   S:  0110 = 0x6 << 3 == 0x6000;  0100 = 0x4 << 3 == 0x4000;  0110 = 0x6 << 3 == 0x6000;  0100 = 0x4 << 3 == 0x4000;
    *       1100 = 0xc << 2 == 0x0c00;  0110 = 0x6 << 2 == 0x0600;  1100 = 0xc << 2 == 0x0c00;  0110 = 0x6 << 2 == 0x0600;
    *       0000 = 0x0 << 1 == 0x0000;  0010 = 0x2 << 1 == 0x0020;  0000 = 0x0 << 1 == 0x0000;  0010 = 0x2 << 1 == 0x0020;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x6c00                      0x4620                      0x6c00                      0x4620
    *
    *   T:  1110 = 0xe << 3 == 0xe000;  0010 = 0x2 << 3 == 0x2000;  0000 = 0x0 << 3 == 0x0000;  1000 = 0x8 << 3 == 0x8000;
    *       0100 = 0x4 << 2 == 0x0400;  0110 = 0x6 << 2 == 0x0600;  0100 = 0x4 << 2 == 0x0400;  1100 = 0xc << 2 == 0x0c00;
    *       0000 = 0x0 << 1 == 0x0000;  0010 = 0x2 << 1 == 0x0020;  1110 = 0xe << 1 == 0x00e0;  1000 = 0x8 << 1 == 0x0080;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0xe400                      0x2620                      0x04e0                      0x8c80
    *
    *   Z:  1100 = 0xc << 3 == 0xc000;  0010 = 0x2 << 3 == 0x2000;  0000 = 0x0 << 3 == 0x0000;  0100 = 0x4 << 3 == 0x4000;
    *       0110 = 0x6 << 2 == 0x0600;  0110 = 0x6 << 2 == 0x0600;  1100 = 0xc << 2 == 0x0c00;  1100 = 0xc << 2 == 0x0c00;
    *       0000 = 0x0 << 1 == 0x0000;  0100 = 0x4 << 1 == 0x0040;  0110 = 0x6 << 1 == 0x0060;  1000 = 0x8 << 1 == 0x0080;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0xc600                      0x2640                      0x0c60                      0x4c80                   
    *
    */

    // define the tetrominoes
    var tetrominoes = {
        I : { states : [0x2222, 0xf000, 0x2222, 0xf000], color: 'pink'},
        J : { states : [0x2260, 0x8e00, 0x6440, 0x8200], color: 'green'},
        L : { states : [0x4460, 0xe800, 0x6220, 0x2e00], color: 'teal'},
        O : { states : [0x0660, 0x0660, 0x0660, 0x0660], color: 'blue'},
        S : { states : [0x6c00, 0x4620, 0x6c00, 0x4620], color: 'red'},
        T : { states : [0xe400, 0x2620, 0x04e0, 0x8c80], color: 'orange'},
        Z : { states : [0xc600, 0x2640, 0x0c60, 0x4c80], color: 'yellow'}
    };

    // define game variables
    var board, // 2 dimensional array holding positioned blocks
        tetrominoBag = [], // pieces to play
        currentTime, // timestamp of the current frame
        lastTime, // timestamp of the last frame
        currentPiece,
        nextPiece, 
        speed, // speed of the pieces
        flags = {
            court : 'invalid',
            next : 'invalid',
            score : 'invalid'
        };

    court = [
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,tetrominoes.T,tetrominoes.Z,tetrominoes.S,tetrominoes.O,0,0,0,0,0,0],
        [tetrominoes.J,tetrominoes.Z,tetrominoes.T,tetrominoes.T,tetrominoes.T,tetrominoes.O,tetrominoes.O,tetrominoes.T,tetrominoes.T,tetrominoes.L,tetrominoes.J,tetrominoes.T],
        [0,tetrominoes.T,0,tetrominoes.Z,tetrominoes.S,tetrominoes.O,0,0,0,0,0,0],
        [tetrominoes.J,tetrominoes.Z,tetrominoes.T,tetrominoes.T,tetrominoes.T,tetrominoes.O,tetrominoes.O,tetrominoes.S,tetrominoes.S,tetrominoes.L,tetrominoes.J,tetrominoes.J],
        [tetrominoes.J,tetrominoes.Z,tetrominoes.T,tetrominoes.T,tetrominoes.T,tetrominoes.O,tetrominoes.O,tetrominoes.S,tetrominoes.S,tetrominoes.L,tetrominoes.J,tetrominoes.J]
    ];


    // helper functions
    function getRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }

    // game loop
    function run() {

        //addEvents();

        function frame() {
            

            requestAnimationFrame(frame, canvas);
        }

        frame();

    }



    function isOccupied(x, y, block, states) {
        blockPartsEach(block, x, y, states, function(blockX, blockY) {
            //console.log('blockX:'+blockX+', blockY:'+blockY);
            // check that it is in the court
            if (blockX < 0 || blockX >= courtWidth) {
                console.log('block is poutside the width bounds');
            }
            if (blockY < 0 || blockY >= courtHeight) {
                console.log('block is outside the height bounds');
            }
            //console.log(court[blockY][blockX]);
            // check that it is not colliding with any court pieces
            if (court[blockY]) {
                if (court[blockY][blockX]) {
                    console.log('court is occupied');
                }
            }

        });
    }

    function clearLines() {
        var completed = [],
            items,
            i, j;

        for (i = 0; i < court.length; i++) {
            items = 0;
            for (j = 0; j < court[i].length; j++) {
                if (court[i][j]) {
                    items++;
                }
            }
            if (items === courtWidth) {
                console.log('removing row: ' + i);
                completed.push(i);
            }
        }
        completed.reverse();
        console.log(completed);
        // add the score for completed lines
        if (completed.length > 0) {
            var score = 100*Math.pow(2, completed.length);
            console.log(score);
        }
        // remove the completed lines from the board
        for (i = 0; i < completed.length; i++) {
            court.splice(completed[i], 1);
        }
        // add new empty lines to the top of the board
        for (i = 0; i < completed.length; i++) {
            court.unshift([]);
        }
        //console.log(court);

    }

    // add fallen block to the board
    function addToBoard(block, x, y, states) {
        blockPartsEach(block, x, y, states, function(x, y) {
            court[y] = court[y] || [];
            court[y][x] = block;
        });
        //console.log(court);
    }

    // get a random tetromino to add to the board
    function getRandomPiece() {
        var t = tetrominoes,
            randomIndex,
            piece;

        if (tetrominoBag.length === 0) {
            tetrominoBag = [t.I,t.I,t.I,t.I,t.J,t.J,t.J,t.J,t.L,t.L,t.L,t.L,t.O,t.O,t.O,t.O,t.S,t.S,t.S,t.S,t.T,t.T,t.T,t.T,t.Z,t.Z,t.Z,t.Z,];
        }
        // grab a random piece out of the bag
        randomIndex = getRandom(0, tetrominoBag.length);
        piece = tetrominoBag[randomIndex];
        tetrominoBag.splice(randomIndex, 1);
        return {type : piece, state : 0, x : Math.round(getRandom(0, courtWidth-2)), y : 0};
    }

    function blockPartsEach(block, x, y, states, fn) {
        var blockValue = block.states[states],
            column = 0,
            row = 0;

        //console.log(block);
        //console.log(states);
        //console.log('block binary: '+blockValue.toString(2));
        // check each value of the block
        for (var i = 0x8000; i > 0; i = i >> 1) {
            //console.log(i);
            //console.log(i.toString(2));
            if (i & blockValue) {
                fn(x + column, y + row);
            }
            column++;
            if (column > 3) {
                column = 0;
                row++;
            }
        }
    }

    /**********************
     *  Drawing functions *
     **********************/
    function draw() {
        drawCourt();
    }

    function drawBlock(block, x, y, states, ctx) {
        blockPartsEach(block, x, y, states, function(x, y) {
            drawSquare(x, y, block.color, ctx);
        });
    }

    function drawSquare(x, y, color) {
        //console.log('x:'+x+', y: '+y);
        ctx.fillStyle = color;
        ctx.fillRect(x*blockWidth, y*blockHeight, blockWidth, blockHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x*blockWidth, y*blockHeight, blockWidth, blockHeight);
    }

    function drawCourt() {
        var i, j;
        if (flags.court === 'invalid') {
            ctx.clearRect(0,0,canvas.width,canvas.height);
        }
        for (i = 0; i < courtWidth; i++) {
            for (j = 0; j < courtHeight; j++) {
                if (court[j][i]) {
                    drawSquare(i, j, court[j][i].color);
                }
            }
        } 
    }




    // draw a dummy court
    drawCourt();
    // draw a dummy block
    currentPiece = getRandomPiece();
    drawBlock(currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.state, ctx);
    // test dumy block against dummy court
    isOccupied(currentPiece.x, currentPiece.y, currentPiece.type, currentPiece.state);
    //addToBoard(currentPiece.type, 0, 0, 0);

    clearLines();

    alert('redraw court');
    drawCourt();
    currentPiece.state++;
    drawBlock(currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.state, ctx);


    // move the currnet piece left 1
    console.log(currentPiece);
    

})();