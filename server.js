var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('Listening for requests on port 4000...');
});

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // handle 'collide' event
    socket.on('collide', function (data) {
        // send to all clients except sender
        socket.broadcast.emit('handle', data);
    })

});
