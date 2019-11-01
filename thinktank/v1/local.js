var express= require('express')

// var http =require('http')
var app = express();
var server =require('http').createServer(app)
var path=require('path')
// var five= require('johnny-five')
var $ = require('jquery')
var fs = require('fs');
var io= require('socket.io')(server)
var routes= require('./routes/')
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/Projector2.html');
  res.sendFile(__dirname + '/public/Control4.html');
});

function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }

io.on('connection', function(socket, piezo){
	console.log('User Connected');
	socket.on('PageRequest', function(msg){
		io.emit('PageRequest', msg);
	});
	socket.on('ButtonControl', function(msg){
		console.log('Broadcasting Client Commands:' + msg);
		io.emit('ButtonControl',msg);
	});
	socket.on('VideoLength', function(msg){
		io.emit('VideoLength', msg);
	});
	socket.on('arduinoControl',function(msg){
		console.log('Arduino command'+msg);
	});
	socket.on('reqVideoState', function(){
		console.log('requesting video state');
		io.emit('reqVideoState');
	})
	socket.on('resVideoState', function(msg){
		console.log(msg);
		io.emit('resVideoState',msg);
	})
});

server.listen(3000);
server.on('connection', function(socket) {
  socket.setTimeout( 10 * 60 * 60 * 1000); 
});
// var Arduino= require('Public/js/arduino.js')
//var ease =require('ease-component')
console.log('Server available at http://localhost:3000');

app.use(express.static(__dirname + "/public"));
app.use("/reveal", express.static(__dirname + "/bower_components/reveal.js"));
// app.use("/node", express.static(__dirname + "/node_modules"));
// app.use("/socket.io", express.static(__dirname + "/node_modules/socket.io"));

console.log('Waiting for connection');
