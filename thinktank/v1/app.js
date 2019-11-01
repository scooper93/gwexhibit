// App.js - this should be used if you have an arduino connected.

// Sets up packages to be used in this
var express= require('express')
var app = express();
var server =require('http').createServer(app)
var path=require('path')
var five= require('johnny-five')
var $ = require('jquery')
var fs = require('fs');
var io= require('socket.io')(server)
var routes= require('./routes/')
// Serves the webpages required
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/Projector2.html');
  res.sendFile(__dirname + '/public/Control4.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});
//Sets up the arduino board
var board = new five.Board();
//Incase we need to sleep

function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }
// Socket io stuff, dealing with connections, button Control and sending back video lengths
// At some poing this should be changed to not use global emit events and stick to individual namespaces
// allowing multiple connectiosn to the same webserver.

// we setup the board first and create our instances of the led, and a variable to check wheter the pin is inuse
board.on("ready", function(){
	console.log('board Ready');
	led=new five.Led(11);
	var inuse= false;

	io.on('connection', function(socket){
		// page requesting 
		socket.on('PageRequest', function(msg){
			//console.log('Broadcasting command:' + msg);
			io.emit('PageRequest', msg);
		});
		// Button control 

		socket.on('ButtonControl', function(msg){
		//	console.log('Broadcasting Client Commands:' + msg);
			io.emit('ButtonControl',msg);
		});
		// sending video length
		socket.on('VideoLength', function(msg){
			io.emit('VideoLength', msg);
		});
		// arduino control 
		socket.on('arduinoControl',function(msg){
			// console.log(inuse+'outofloop');
			// checks if we're currently sending a message to the PZT
			console.log('I have been summoned')
			if (inuse==false){
				inuse=true;
				// console.log(inuse + 'inloop');
			// Uses the Led module in johnny-five
			// syntax is led.pulse(number of miliseconds per pulse)
				led.pulse(1000);
				// we then wait for so many miliseconds before we stop the piezo movement.
				board.wait(5000, function() {
		   			 // stop() terminates the interval
		    		// off() shuts the led off
		   			led.stop().off();
		   			inuse=false; // Freeing up the PZT to be controlled again.
	 		 });
			}
			// This tries to keep the arduino section alive, as it apears to fail after a unknown time.
			board.wait(1800000, function() {
				inuse=true
				led.pulse(1000);
				console.log('arduino timeout triggered');
				board.wait(3000,function() {
					led.stop().off();
					inuse=false;
				})
			})
		});
		socket.on('reqVideoState', function(){
			console.log('requesting video state');
			io.emit('reqVideoState');
		});
		socket.on('resVideoState', function(msg){
			console.log(msg);
			io.emit('resVideoState',msg);
		});
	});
});

// Starts the server listening on a port 
server.listen(3000);
// when the server has conencted ensure that the timout is longer than thinktank day
server.on('connection', function(socket) {
  socket.setTimeout( 7* 24 * 60 * 60 * 1000); 
});
console.log('Server available at http://localhost:3000');
// sets up some shortcuts to use to access public and reveal.js if needed
//may not be required.
app.use(express.static(__dirname + "/public"));
app.use("/reveal", express.static(__dirname + "/bower_components/reveal.js"));
console.log('Waiting for connection');
