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
        ctx = canvas.getContext('2d'), // court canvas context
        nextCanvas = document.getElementById('next-piece'),
        nctx = nextCanvas.getContext('2d'), // next piece canvas context
        previousTime, // time of the last game frame
        currentTime, // time of this game frame
        court = [], // object to hold the dropped blocks
        courtWidth = 12,
        courtHeight = 20,
        blockWidth = canvas.width / courtWidth,
        blockHeight = canvas.height / courtHeight,
        minSpeed = 0.04, // fasted speed on the board
        maxSpeed = 1, // slowest speed on the board 
        levelIncrement = 0.05, // amount the pieces speed up every level
        keys = {
            esc : 27, // quit button
            space : 32, // drop button
            left : 37,
            up : 38, // rotate clockwise
            right : 39,
            down : 40, // rotate anti-clockwise
            enter : 13, // play/pause button
            q : 81 // quit button - reset board
        },
        stats;

    // initialise stats if script is included
    if (typeof Stats == 'function') {
        stats = new Stats();
    }

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
    *   J:  0010 = 0x2 << 3 == 0x2000;  1000 = 0x8 << 3 == 0x8000;  0110 = 0x6 << 3 == 0x6000;  1110 = 0xe << 3 == 0xe000;
    *       0010 = 0x2 << 2 == 0x0200;  1110 = 0xe << 2 == 0x0e00;  0100 = 0x4 << 2 == 0x0400;  0010 = 0x2 << 2 == 0x0200;
    *       0110 = 0x6 << 1 == 0x0060;  0000 = 0x0 << 1 == 0x0000;  0100 = 0x4 << 1 == 0x0040;  0000 = 0x0 << 1 == 0x0000;
    *       0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;  0000 = 0x0 << 0 == 0x0000;
    *                          ------                      ------                      ------                      ------
    *                          0x2260                      0x8e00                      0x6440                      0xe200
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
        J : { states : [0x2260, 0x8e00, 0x6440, 0xe200], color: 'green'},
        L : { states : [0x4460, 0xe800, 0x6220, 0x2e00], color: 'teal'},
        O : { states : [0x0660, 0x0660, 0x0660, 0x0660], color: 'blue'},
        S : { states : [0x6c00, 0x4620, 0x6c00, 0x4620], color: 'red'},
        T : { states : [0xe400, 0x2620, 0x04e0, 0x8c80], color: 'orange'},
        Z : { states : [0xc600, 0x2640, 0x0c60, 0x4c80], color: 'yellow'}
    };

    // define game variables
    var board, // 2 dimensional array holding positioned blocks
        tetrominoBag = [], // pieces to play
        isPlaying = false, // game play state
        currentTime, // timestamp of the current frame
        previousTime, // timestamp of the last frame
        dropTime = maxSpeed,  // time to move piece down one level
        currentPiece,
        nextPiece, 
        gameClock = 0, // hold time for game
        scoreCard = { // hold the player score
            points : 0,
            lines : 0,
            level : 0
        },
        speed, // speed of the pieces
        redraw = { // what parts of the game need to be re-rendered
            court : true,
            score : true,
            next : true
        },
        gameOver = true, // game over flag
        dropTimer,  // drop sequence timer
        isDropping = false; // drop sequence flag


    // helper functions
    function getRandom(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }

    // game loop
    function run() {

        document.getElementById('help').innerHTML = 'press enter to start';
        removeEvents();
        addEvents();
        showStats();
        previousTime = currentTime = new Date().getTime();

        function frame() {
            currentTime = new Date().getTime();
            //console.log(currentTime);
            updateClock(Math.min(1, (currentTime - previousTime) / 1000));
            draw();
            previousTime = currentTime;
            if (stats) {
                stats.update();
            }
            requestAnimationFrame(frame, canvas);
        }

        currentPiece = getRandomPiece();
        nextPiece = getRandomPiece();
        draw();
        frame();
    }

    function showStats() {
        if (stats) {
            stats.domElement.id = 'stats';
            document.getElementById('stats-holder').appendChild(stats.domElement);
            stats.setMode(0);
        }
    }

    function startGame() {
        if (gameOver) {
            document.getElementById('help').innerHTML = 'GAME OVER';
            gameOver = false;
            // remove stats container
            document.getElementById('stats').remove();
            reset();
        } else { // resume current game
            // remove the help text
            document.getElementById('help').innerHTML = 'press enter to start';
            isPlaying = true;
        }
    }

    function reset() {
        isPlaying = true;
        scoreCard = {
            points : 0,
            lines : 0,
            level : 0
        };
        redraw = {
            court : true,
            score : true,
            next : true
        };
        gameClock = 0;
        speed = maxSpeed; // reset game speed 
        court = [];
        run();
    }

    function quitGame() {
        isPlaying = false;
        gameOver = true;
        document.getElementById('help').innerHTML = 'Press enter to start';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        document.getElementById('score').innerHTML = '0';
        document.getElementById('lines').innerHTML = '0';
        document.getElementById('level').innerHTML = '0';
    }

    function updateClock(time) {
        //console.log(time);
        if (isPlaying) {
            gameClock = gameClock + time;
            if (gameClock > dropTime) {
                gameClock = gameClock - dropTime;
                move('down');
            }
        } else {
            // set game clock to zero until game is un-paused
            // will need to check this
            gameClock = 0;
        }
    }

    function addEvents() {
        document.addEventListener('keydown', keydown, false);
    }

    function removeEvents() {
        document.removeEventListener('keydown', keydown);
    }

    function keydown(e) {
        var handled = false;
        switch (e.keyCode) {
            case keys.enter :
                if (!isPlaying) {
                    startGame();
                    document.getElementById('help').innerHTML = 'Press esc to pause';
                }
                handled = true;
                break;
            case keys.esc :
                isPlaying = false;
                document.getElementById('help').innerHTML = 'Press enter to start';
                handled = true;
                break;
            case keys.up :
                // rotate object clockwise
                rotate('clockwise');
                handled = true;
                break;
            case keys.down :
                // rotate object anti clockwise
                rotate('anticlockwise');
                handled = true;
                break;
            case keys.left :
                // move piece left
                move('left');
                handled = true;
                break;
            case keys.right : 
                // move piece right
                move('right');
                handled = true;
                break;
            case keys.space :
                isDropping = true;
                drop();
                handled = true;
                break;
            case keys.q :
                quitGame();
                handled = true;
                break
                
        }
        if (handled) {
            e.preventDefault();
        }
    }

    function isOccupied(x, y, block, state) {
        var occupied = false;
        blockPartsEach(block, x, y, state, function(blockX, blockY) {
            //console.log('blockX:'+blockX+', blockY:'+blockY);
            // check that it is in the court
            if (blockX < 0 || blockX >= courtWidth) {
                //console.log('block is outside the width bounds');
                occupied = true;
            }
            if (blockY < 0 || blockY >= courtHeight) {
                //console.log('block is outside the height bounds');
                occupied = true;
            }
            //console.log(court[blockY][blockX]);
            // check that it is not colliding with any court pieces
            if (court[blockY]) {
                if (court[blockY][blockX]) {
                    //console.log('court is occupied');
                    occupied = true;
                }
            }
        });
        return occupied;
    }

    function move(dir) {
        // check that the block can go there
        var newPosition = {
            x : currentPiece.x, 
            y : currentPiece.y
        };
        switch (dir) {
            case 'left' : 
                newPosition.x--;
                break;
            case 'right' :
                newPosition.x++;
                break;
            case 'down' :
                newPosition.y++;
                break;
        }
        //console.log(isOccupied(newPosition.x, newPosition.y, currentPiece.type, currentPiece.state));
        if (!isOccupied(newPosition.x, newPosition.y, currentPiece.type, currentPiece.state)) {
            //console.log('the new position is free');
            currentPiece.x = newPosition.x;
            currentPiece.y = newPosition.y;
            redraw.court = true;
        } else {
            // if this movement is down, then add the piece to the board
            if (dir === 'down') {
                addToBoard(currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.state);
                // clear the drop state
                isDropping = false;
            }
        }
    }

    function rotate(dir) {
        var newPosition = currentPiece.state;
        switch (dir) {
            case 'clockwise' :
                newPosition++;
                break;
            case 'anticlockwise' :
                newPosition--;
                break;
        }
        if (newPosition < 0) {
            newPosition = 3;
        }
        if (newPosition > 3) {
            newPosition = 0
        }

        if (!isOccupied(currentPiece.x, currentPiece.y, currentPiece.type, newPosition)) {
            currentPiece.state = newPosition;
            redraw.court = true;
        } else {
            //console.log('cant rotate to that position');
        }
    }

    function getNextPiece() {
        redraw.court = true;
        redraw.next = true;
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        clearLines();
        draw();
        // need to test that the next piece will fit onto the board
        if (isOccupied(nextPiece.x, nextPiece.y, nextPiece.type, nextPiece.state)) {
            // game over
            isPlaying = false;
            gameOver = true;
            document.getElementById('help').innerHTML = 'GAME OVER';
        }

    }

    function drop() {
        // set a loop of dropping behaviour until the piece hits the bottom, and then kill it
        dropTimer = setTimeout(function() {
            if (isDropping) {
                move('down');
                drop();
            }
        }, 15);
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
                //console.log('removing row: ' + i);
                completed.push(i);
            }
        }
        completed.reverse();
        //console.log(completed);
        // add the score for completed lines
        if (completed.length > 0) {
            scoreCard.points += 100*Math.pow(2, completed.length);
            scoreCard.lines++;
            scoreCard.level = Math.floor(scoreCard.lines / 10);
            redraw.score = true;
            // calculate the drop time
            dropTime = maxSpeed - (levelIncrement * scoreCard.level);

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
    function addToBoard(block, x, y, state) {
        blockPartsEach(block, x, y, state, function(x, y) {
            court[y] = court[y] || [];
            court[y][x] = block;
        });
        // get the next piece
        getNextPiece();
    }

    // get a random tetromino to add to the board
    function getRandomPiece() {
        var t = tetrominoes,
            randomIndex,
            piece;

        if (tetrominoBag.length === 0) {
            tetrominoBag = [t.I,t.I,t.I,t.I,t.J,t.J,t.J,t.J,t.L,t.L,t.L,t.L,t.O,t.O,t.O,t.O,t.S,t.S,t.S,t.S,t.T,t.T,t.T,t.T,t.Z,t.Z,t.Z,t.Z];
        }
        // grab a random piece out of the bag
        randomIndex = getRandom(0, tetrominoBag.length);
        piece = tetrominoBag[randomIndex];
        tetrominoBag.splice(randomIndex, 1);
        return {type : piece, state : 0, x : Math.round(getRandom(0, courtWidth-2)), y : 0};
    }

    function blockPartsEach(block, x, y, state, fn) {
        var blockValue = block.states[state],
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
        if (isPlaying) {
            drawCourt();
            drawBlock(currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.state, ctx);
            drawNextPiece();
            drawScore();
        }
    }

    function drawBlock(block, x, y, state, ctx) {
        blockPartsEach(block, x, y, state, function(x, y) {
            drawSquare(x, y, block.color, ctx);
        });
    }

    function drawSquare(x, y, color, ctx) {
        //console.log('x:'+x+', y: '+y);
        ctx.fillStyle = color;
        ctx.fillRect(x*blockWidth, y*blockHeight, blockWidth, blockHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x*blockWidth, y*blockHeight, blockWidth, blockHeight);
    }

    function drawCourt() {
        var i, j;
        if (redraw.court) {
            // if playing then clear the court
            if (isPlaying) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        
            for (i = 0; i < courtWidth; i++) {
                court[i] = court[i] || [];
                for (j = 0; j < courtHeight; j++) {
                    court[j] = court[j] || [];
                    if (court[j][i]) {
                        drawSquare(i, j, court[j][i].color, ctx);
                    }
                }
            } 
        }
    }

    function drawNextPiece() {
        if (isPlaying && redraw.next) {
            nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
            drawBlock(nextPiece.type, 0, 0, 0, nctx);
            redraw.next = false;
        }
    }

    function drawScore() {
        if (isPlaying && redraw.score) {
            document.getElementById('score').innerHTML = scoreCard.points;
            document.getElementById('lines').innerHTML = scoreCard.lines;
            document.getElementById('level').innerHTML = scoreCard.level;
        }
    }

    run();
    

})();