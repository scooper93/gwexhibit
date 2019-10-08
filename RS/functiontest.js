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
	{id: "INPUT", port: "/dev/cu.usbmodem1A1241"}, // need to add the USB port for this arduino  this[0] access by this.byId("Board ID")
	{id: "OUTPUT", port: "/dev/cu.usbmodem1A1231"} // need to add this arduinos USB port this[1] 
];	


function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }

io.on("connection", function(){
	var boards = new five.Boards(ports).on("ready", function(){ // multiple boards, make sure the ports are specified correclty
		var led = new five.Led({
			pin: 10,
			board: boards[1]
		});
		var led2 = new five.Led({
			pin:10,
			board: boards.byId("INPUT")
		});
		led.on();
		led2.on();

		var button1 = new five.Switch({
			pin:2,
			board: boards.byId("INPUT")
		})
		
		button1.on("open",function(){
			led.on();
		})
		
		button1.on("close", function(board){
			led.off(); // for debugging
			stopLed("string")
		})

		function stopLed(variable){
			if (variable == "string") {
				led2.off();
			}
		}
	});
})
	

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
