// App.js - this should be used if you have an arduino connected.

// Sets up packages to be used in this
var express= require('express')
var app = express();
var server =require('http').createServer(app)
var path=require('path')
var five= require('johnny-five')
var $ = require('jquery')
var compression = require('compression');
// Serves the webpages required
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/rs.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});
app.use(compression());
// now we set the number of steps for each thing
// For the pi   
 var ports = [
 	{id: 'button', port: "/dev/ttyACM0"}, // need to add the USB port for this arduino
 ];

 // for Sam's mac
//var ports = [
//	{id: "button", port: "/dev/cu.usbmodem1D1121"}, // need to add the USB port for this arduino  Boards[0] access by this.byId("Board ID")
//	{id: "piezo", port: "/dev/cu.usbmodem1D11521"} // need to add this arduinos USB port Boards[1] 
//];


// This is needed for the RoyalS exhibit - Socket io stuff, dealing with connections, button Control and sending back video lengths

// // Need to decide how we're going to do the sleep / clock function when displaying chirps as they don't need to be cut off.

var boards;	

var boards = new five.Boards(ports);
	boards.on("ready", function(){
	// Boards = new five.Boards(ports).on("ready", function(Boards){ // multiple boards, make sure the ports are specified correclty
		console.log('boards Ready');
		boards.reset;
		// Setting up the default state of returnable items
	 	// Setup the piezo ports
		
		this.byId("button").pinMode(11,five.Pin.PWM);
		// Button ports
		
		// For the LED's
		// First the white LED
		
		var greenLED = new five.Led({
			// green led for the CW
			pin:11,
			board: this.byId("button")
		});
		// for the white LED lowm chirp
 		var blueLED = new five.Led({
			// burst
			pin: 9,
			board: this.byId("button")
		});
		// for the blue LED highm chirp
		var whiteLED = new five.Led({
			pin: 10, 
			board: this.byId("button")
		})
		// for the yellow LED burst
		var yellowLED = new five.Led({
			pin: 6,
			board: this.byId("button")
		})
		
		// Defining our buttons now as johnny-five switches
		var button1 = new five.Switch({
			// yellow burst wave
			pin:2,
			board: this.byId("button")
		})

		var button2 = new five.Switch({
			// blue highm chirp
			pin:3, 
			board: this.byId("button")
		});

		var button3 = new five.Switch({
			// white lowm chirp
			pin:4,
			board: this.byId("button")
		});

		var button4 = new five.Switch({
			// green continuous wave
			pin: 5,
			board: this.byId("button")
		});

		function pulseLED() {
			var puslseLength =3000;
			whiteLED.pulse(puslseLength);
			yellowLED.pulse(puslseLength);
			greenLED.pulse(puslseLength);
			blueLED.pulse(puslseLength);
		}

		function stopLED() {
			whiteLED.stop();
			yellowLED.stop();
			greenLED.stop();
			blueLED.stop();
			whiteLED.off();
			yellowLED.off();
			greenLED.off();
			blueLED.off();
		}
		// close functions determine what we'll do here. 
		// Checklist of what we need to do - need to send a message to the client, set an inuse flag and drive a piezo over 3 seconds
		button1.on("open",function(){
			if (inuse==false) {
				pulseLED();

			}
		});
		button1.on("close", function(board){
			var puslseLength =3000;
			stopLED() // for debugging
			whiteLED.pulse(pulseLength);
		});
		button2.on("close", function(){
			var puslseLength =3000;
			stopLED();
			greenLED.pulse(pulseLength);
		});
		button3.on("close", function(){
			stopLED();
			var puslseLength =3000;
			yellowLED.pulse(pulseLenght);
		});

		button4.on("close", function(){
			stopLED();
			var puslseLength =3000;
			blueLED.pulse(pulseLength);
		});

		function resetLED() {
			stopLED();
		}

	//	// for board identification piezo is solid on button is pulsing
	resetLED();

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
// app.use("/bower", express.static(__dirname + "/bower_components"));
console.log('Waiting for connection');
