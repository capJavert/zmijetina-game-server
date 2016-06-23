var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html'),
	positions = {};
	food = {};
	games = {};

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
	
	socket.on("fromOtherSidee", function(data){
		var newData = data.split(":");
		 
		console.log("gid: ", newData[0]); 
		console.log("pnum: ", newData[1]); 
		 
		if(typeof games[newData[0]]=="undefined") {
			games[newData[0]] = parseInt(newData[1]);
		}
		
		games[newData[0]]--;
		console.log("Until start: ", games[newData[0]]);
		io.emit("timer", games[newData[0]]);
		
		if(games[newData[0]]==0) {
			delete games[newData[0]];
		}
	});
	
    socket.on("position", function(data) {
        var newData = JSON.parse(data);
//		positions[newData.gameId] = {};

		if(typeof positions[newData.gameId]=="undefined") {
			positions[newData.gameId] = {};
		}

		positions[newData.gameId][socket.id] = newData;
		var jsonData = JSON.stringify(positions[newData.gameId]);
		console.log("Position received:", jsonData+"\n\n\n====");
		
		io.emit("positions", jsonData)
	});
	
	socket.on("food", function(data) {
		var newData = JSON.parse(data);
        food[newData.gameId] = newData;  
		var jsonData = JSON.stringify(food[newData.gameId]);
//		console.log("Food received:", jsonData);
		
		io.emit("food", jsonData);
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
