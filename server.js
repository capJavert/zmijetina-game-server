var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/update', function(req, res){
  res.send("it works! :3000");
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
