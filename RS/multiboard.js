var express= require('express')
var app = express();
var server =require('http').createServer(app)
var path=require('path')
var five= require('johnny-five')
var $ = require('jquery')
var fs = require('fs');
var io= require('socket.io')(server)

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/rs.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});

// var inputBoard = new five.Board({port:"/dev/cu.usbmodem1D1141"});
// var outputBoard = new five.Board({port:"dev/cu.usbmodem1D1131"});

var ports = [
	{id: "INPUT", port: "/dev/cu.usbmodem1D1141"}, // need to add the USB port for this arduino  this[0] access by this.byId("Board ID")
	{id: "OUTPUT", port: "/dev/cu.usbmodem1D1131"} // need to add this arduinos USB port this[1] 
];	


function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }
new five.Boards(ports).on("ready", function(){ // multiple boards, make sure the ports are specified correclty
	var led = new five.Led({
		pin: 11,
		board: this[0]
	});
	var led2 = new five.Led({
		pin:11,
		board: this.byId("OUTPUT")
	});
	led.on();
	led2.pulse(2000);
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
app.use(express.static(__dirname + "/public"));
app.use("/bower", express.static(__dirname + "/bower_components"));
console.log('Waiting for connection');
