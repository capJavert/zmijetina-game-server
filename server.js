var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html'),
	positions = {};
	food = {};

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
    //socket.emit("answer");
	socket.emit("hello", socket.id);
	
    socket.on("position", function(data) {
        var newData = JSON.parse(data);
		positions[newData.gameId] = {};
		positions[newData.gameId][socket.id] = newData;
		var jsonData = JSON.stringify(positions[newData.gameId]);
		console.log("Position received:", jsonData);
		
		socket.emit("positions", jsonData);
    });
	
	socket.on("food", function(data) {
		var newData = JSON.parse(data);
        food[newData.gameId] = newData;  
		var jsonData = JSON.stringify(food[newData.gameId]);
		console.log("Food received:", jsonData);
		
		socket.emit("food", jsonData);
    });

	socket.on("dead", function(data) {
		var newData = JSON.parse(data);
		delete positions[newData.gameId][socket.id];
		
		console.log("Client player dead");
	});
	
    socket.on("disconnect", function() {
        console.log("Client disconnected");
    });
});

app.listen(3000);
console.log("Listening on port 3000");
