// App.js - this should be used if you have an arduino connected.

// Sets up packages to be used in this
var express= require('express')
var app = express();
var server =require('http').createServer(app)
var path=require('path')
var five= require('johnny-five')
var $ = require('jquery')
var fs = require('fs');
var io= require('socket.io').listen(server)
// Serves the webpages required
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
    res.sendFile(__dirname + '/public/content.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});


io.on('connection', function(socket){
	console.log("Connected")
	socket.on('indexNavReq', function(msg){
		// Index has asked content to change
		io.emit('indexNavReq',msg)
	})
	socket.on("contentNavRes", function(msg){
		// Content has agreed to change page
		io.emit('contentNavRes',msg);
	})
	socket.on('indexPageChange', function(msg){
		//
		io.emit('pageRequestFromContent',msg)
	})
	socket.on('contentNavReq', function(msg){
		io.emit('contentNavReq',msg)
	});
	socket.on('quizUpdateReq',function(msg){
		io.emit('quizUpdateReq',msg);
	})
});


// Starts the server listening on a port 
server.listen(3000);
// when the server has conencted ensure that the timout is longer than thinktank day
server.on('connection', function(socket) {
  socket.setTimeout( 7* 24 * 60 * 60 * 1000);  // This seems to be set for a long time 
});
console.log('Server available at http://localhost:3000');
// sets up some shortcuts to use to access public and reveal.js if needed
//may not be required.
app.use(express.static(__dirname + "/public/"));
app.use(express.static(__dirname + "/node_modules/"));
app.use("/node", express.static(__dirname + "/node_modules"));
console.log('Waiting for connection');
