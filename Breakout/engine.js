var Engine = (function() {
    
    var Engine = {
        Physics : {
            intersect : function(x1,y1,x2,y2,x3,y3,x4,y4,dir) {
                // http://cs.swan.ac.uk/~cssimon/line_intersection.html
                var denominator = (x4-x3)*(y1-y2) - (x1-x2)*(y4-y3),
                    ta, tb, x, y;
                //var ta = (y3-y4)*(x1-x3) + (x4-x3)*(y1-y3);
                //var tb = (y1-y2)*(x1-x3) + (x2-x1)*(y1-y3);
                
                if (denominator !== 0) { // not parallel lines
                    var ta = (y3-y4)*(x1-x3) + (x4-x3)*(y1-y3);
                    if (ta >= 0 && ta <= 1) {
                        tb = (y1-y2)*(x1-x3) + (x2-x1)*(y1-y3);
                        if (tb >= 0 && tb <= 1) {
                            x = x1 - (ta * (x2-x1));
                            y = y1 - (tb * (y2-y1));
                            // return position and direction
                            return {x:x, y:y, dir:dir};
                        }
                    }
                }
                // else return null
                return null;
            },
            ballIntercept: function(ball, rect, nx, ny) {
                var collision,
                    surfaceLeft = rect.left - ball.radius,
                    surfaceRight = rect.right + ball.radius,
                    surfaceTop = rect.top - ball.radius,
                    surfaceBottom = rect.bottom + ball.radius,
                    ballNext = {
                        x : ball.x + nx,
                        y : ball.y + ny
                    };

                // if ball is moving left test if it hits the right edge of the rectangle
                if (nx < 0) {
                    collision = Engine.Physics.intersect(ball.x, ball.y, ballNext.x, ballNext.y, surfaceRight, surfaceTop, surfaceRight, surfaceBottom, 'right');
                }
                else if (nx > 0) {
                    collision = Engine.Physics.intersect(ball.x, ball.y, ballNext.x, ballNext.y, surfaceLeft, surfaceTop, surfaceLeft, surfaceBottom, 'left');
                }
                // if no collision on the left or right side, check the top and bottom
                if (!collision) {
                    if (ny < 0) {
                        collision = Engine.Physics.intersect(ball.x, ball.y, ballNext.x, ballNext.y, surfaceLeft, surfaceBottom, surfaceRight, surfaceBottom, 'bottom');
                    }
                    else if (ny > 0) {
                        collision = Engine.Physics.intersect(ball.x, ball.y, ballNext.x, ballNext.y,  surfaceLeft, surfaceTop, surfaceRight, surfaceTop, 'top');
                    }
                }
                return collision;
            }
        }
    };

    return Engine;

})();