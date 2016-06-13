var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html'),
	positions = {};

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
//setInterval(sendTime, 5000);

io.on('connection', function(socket) {
    console.log("Client connected");
    socket.emit("hello", socket.id);
    //socket.emit("answer");

    socket.on("position", function(data) {
        positions[socket.id] = JSON.parse(data);  
		var jsonData = JSON.stringify(positions);
		console.log(jsonData);
		
		socket.emit("positions", jsonData);
    });

    socket.on("disconnect", function() {
        console.log("Client disconnected");
		delete positions[socket.id];
    });
});

app.listen(3000);
console.log("Listening on port 3000");
