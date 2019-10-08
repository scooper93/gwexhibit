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
// Serves the webpages required
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/rs.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});
app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/bower', express.static(__dirname + '/bower_components'));
// Other server globals 
var tempData;
var ports=[]; 
// For the pi
// var ports = [
// 	{id: 'input', port: "/dev/ttyACM1"}, // need to add the USB port for this arduino
// 	{id: 'output', port: "/dev/ttyACM0"} // need to add this arduinos USB port
// ];

 // for Sam's mac
// tempBoard.on("ready", function(){
var ports = [
	{id: "button", port: "/dev/cu.usbmodem1A1241"}, // need to add the USB port for this arduino  Boards[0] access by this.byId("Board ID")
	{id: "piezo", port: "/dev/cu.usbmodem1A1231"} // need to add this arduinos USB port Boards[1] 
];	
// Now refer to the arduinos as this.byId("input") (Buttons) and this.byId("output") (Piezo) this should be all inside the boards.ready function

function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }

// Things that need implementing

// Arduino Side
	// Input arduino (button pressing)
		// Needs telling that its 
	// Output Arduino (piezo driving)
		// and to implement different signals that will be determined here
			// probably the easiest way to do this is to have a clock that sends voltages every fraction of a second
			// Need to be careful on how this interacts with the PWM on the arduino
		// Needs to read PD data and send the values quickly to the computer screen
			// Not sure if a push or get is best for this


// This is needed for the RoyalS exhibit - Socket io stuff, dealing with connections, button Control and sending back video lengths
// At some point this should be changed to not use global emit events and stick to individual namespaces
// allowing multiple connectiosn to the same webserver.

// we setup the board first and create our instances of the led, and a variable to check wheter the pin is inuse
// Need to check the documentation to see which feature of jonny-five is best to implement i.e. LED etc
// Signals 

// For the signals need to use the following functions, each need a linear spacing - note syntax will not the the same as matalb syntax (copied below)

// Chirp 1: y1= exp(t).*sin(2*pi.*(1.*t+0.5*1.*t.^2));
// Chirp 2 Higher F: y1= exp(t).*sin(2*pi.*(1.*t+0.5*2.*t.^2));
// Continuous Wave: Math.Sin(2*pi*1*t)]
// Attempt at a burst y2 = 10*exp(-2*(t+pi/6)).*sin(1.*(t+pi/6)-20.*(t+pi/6).^2)

// // Need to decide how we're going to do the sleep / clock function when displaying chirps as they don't need to be cut off.
var Boards = new five.Boards(ports);
Boards.on("ready", function(){
// Boards = new five.Boards(ports).on("ready", function(Boards){ // multiple boards, make sure the ports are specified correclty
	console.log('boards Ready');
	// Setting up the default state of returnable items
	var PDdata;
	var inuse=false;
	var signalState='none';
 	// Setup the piezo ports
	this.byId("piezo").pinMode(5,five.Pin.Analog);  //Here we setup the port that will read the data
	this.byId("piezo").analogRead(5,function(data){ // Read data aas fast as we can and set it to a global (could be nicer )
		// Use a set interval command here if we want to limit the data rate to something sensible, overwrite same variable so we always have data. 
		PDdata=data; 
	});
	this.byId("piezo").pinMode(11,five.Pin.PWM);
	this.byId("button").pinMode(10,five.Pin.PWM);
	// Button ports
	var led3 = new five.Led({
		pin:10,
		board: this.byId("piezo")
	})
	// Defining our buttons now as johnny-five switches
	var button1 = new five.Switch({
		pin:2,
		board: this.byId("button")
	})

	var button2 = new five.Switch({
		pin:3, 
		board: this.byId("button")
	});

	var button3 = new five.Switch({
		pin:4,
		board: this.byId("button")
	});

	var button4 = new five.Switch({
		pin: 5,
		board: this.byId("button")
	});
	// close functions determine what we'll do here. 
	// Checklist of what we need to do - need to send a message to the client, set an inuse flag and drive a piezo over 3 seconds
	button1.on("open",function(){
		led3.on();
	})
	button1.on("close", function(board){
		led3.off(); // for debugging
		activatePiezo("CW");
	})
	button2.on("close", function(){
		led3.off(); // For debugging
		activatePiezo("Burst");
	})
	button3.on("close", function(){
		led3.off(); // For debugging
		activatePiezo("Lowm");
	})

	button4.on("close", function(){
		led3.off(); // For debugging
		activatePiezo("Highm");
	})

	// Debugging.
	var led = new five.Led({
		pin: 11,
		board: this.byId("piezo")
	});

	var led2 = new five.Led({
		pin: 11, 
		board: this.byId("button")
	})
	// for board identification piezo is solid on button is pulsing

	led.on();
	led2.pulse();
	// Socket io conncetion stuff - so we can pass information back and forward

  	io.on('connection', function(socket){
		// arduino control 
		socket.on('reqExhibitState', function(msg){
			// Just need to return the state of the exhibit
			io.emit('resExhibitState',inuse); // this replies true or false
		});
		socket.on('reqSignalState', function(msg){
			// Just need to return the state of the signal
			io.emit('resSignalState', signal)
		});

		socket.on('reqGraphData', function(){
			// Just emit the latest graph data, and let the client decide how fast, as we're opperating at max data rate here

			io.emit('resGraphData', PDdata);
		});	
		// Here we'll need to detect whether certain pins are high-
		// Depeding on which button has been pressed. We'll need to check whether its inuse too.

		function activatePiezo(buttonID) {
			// this function is going to handle all the piezo driving 
			if(inuse==false) {
				inuse=true;
				// will need to use digital write for some of these functions and need to send information about what signal is being sent.
				// for all of these we only have 255 integers of dynamic range with this, so we'll have to be smart with our functions
				switch(buttonID){
					case "CW":
						console.log("CW");
						io.emit('resSignalState',"CW");
						var t=0;
						// This will write a new value to the piezo every milisecond, creating the illusion of sine wave
						// Note that this can be changed, but needs to change faster than humans can notice this.
						var cwint = setInterval(function(){
							var cwval = Math.round(255*Math.sin(2*Math.PI*0.01*t));
							console.log(cwval)
							Board.byId("piezo").analogWrite(11,cwval);
							t=t+1;
							},1); // we'll now send something every 10 seconds and loop
						Board.byId("piezo").wait(3000, function(){
							//wait for 3 seconds and then stop this writing
							// Need to think how many points we're going to have.
							inuse=false;
							t=0;
							clearInterval(cwint);
						});
						break;

					case "Burst":
						io.emit('resSignalState',"Burst")
						var t =0;
						var burstval = Math.round(255*Math.exp(-2*(t+Math.pi/6))*Math.sin(1*(t+Math.PI/6)-20*Math.pow(t+Math.PI/6,2)));
						console.log(burstval);
						var burstint = setInterval(function(){
							Board.byId("piezo").analogWrite(11,burstval);
						},1);
						// Original matlab function
						// 10*exp(-2*(t+pi/6)).*sin(1.*(t+pi/6)-20.*(t+pi/6).^2)
						this.byId("piezo").wait(3000, function(){
							//wait for 4 seconds
							inuse=false;
							t=0;
							clearInterval(burstint);
						})
						console.log("Burst");
						break;

					case "Lowm":
						var t=0;
						var lowmval = Math.exp(t)*Math.sin(2*Math.PI*(t+0.5*Math.pow(t,2)));
						var lowmint = setInterval(function(){
							Board.byId("piezo").analogWrite(11,lowmval)
							// y1= exp(t).*sin(2*pi.*(1.*t+0.5*2.*t.^2));
							t=t+1;
						},1);

						this.byId("piezo").wait(3000, function(){
							//wait for 4 seconds
							inuse=false;
							t=0;
							clearInterval(lowmint)
						})
						console.log("low mass");
						break;
					case "Highm":
						t=0;
						var highmval = Math.exp(t)*Math.sin(2*Math.PI*(t+1*Math.pow(t,2)));
						console.log(highmval)
						var highmint = setInterval(function(){
							Board.byId(11,highmval);
						})
						// y1= exp(t).*sin(2*pi.*(1.*t+0.5*1.*t.^2));
						this.byId("piezo").wait(4000, function(){
							//wait for 4 seconds
							inuse=false;
							t=0;
							clearInterval(highmmint);
						})
						console.log("High mass");
						break;
					default:
						console.log("No valid buttonID detected");
						break;
				}
			}

		}
	});
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
