var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var socket = io.connect('http://localhost:4000');

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
};

//create te container that will hold the bouncing ball.
var container = {
    x: 0,
    y: 0,
    width: 500,
    height: 300
};
//create the circle that will be animated
var circle = {
    x: getRandomInt(500-1) + 1,
    y: getRandomInt(300-1) + 1,
    r: 10,
    vx: 5,
    vy: 5,
    color: getRandomInt(360)
};

function drawContainer() {
    context.fillStyle = "#000000";
    context.fillRect(container.x, container.y, container.width, container.height);
}

function drawCircle(circle) {
    context.fillStyle = 'hsl(' + circle.color + ', 100%, 50%)';
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);
    context.closePath();
    context.fill()
}

function animate() {
    // draw the container
    drawContainer();

    // draw the circle
    drawCircle(circle);

    // time to animate our circle ladies and gentlemen
    // emit "collide" event when the ball collides with the right or left side of container
    if ((circle.x - circle.r < container.x && circle.x + circle.r - circle.vx > container.x)
        || (circle.x + circle.r > container.x + container.width && circle.x - circle.r - circle.vx < container.x + container.width)) {
        socket.emit("collide", circle);
    }

    // stop the ball when it out of container
    if (circle.x + circle.r < container.x
        || circle.x - circle.r > container.x + container.width) {
        return;
    }

    // reverse the direction if the coordinate are beyond the canvas dimensions
    if (circle.y + circle.r + circle.vy > container.y + container.height || circle.y - circle.r + circle.vy < container.y) {
        circle.vy = -circle.vy;
    }

    // move the circle
    circle.x += circle.vx;
    circle.y += circle.vy;

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// receive the ball from another container
socket.on('handle', function (data) {
    // if the ball move from left to right
    if (data.x > 0) {
        // change the coordinate
        data.x -= container.width;
        // when the ball completely out of the previous container
        if (data.x - data.r >= container.x) {
            circle = data;
            requestAnimationFrame(animate);
        }
        else {
            drawContainer();
            drawCircle(data);
        }
    }
    // if the ball move from right to left
    else {
        data.x += container.width;
        if (data.x + data.r <= container.x + container.width) {
            circle = data;
            requestAnimationFrame(animate);
        }
        else {
            drawContainer();
            drawCircle(data);
        }
    }

});