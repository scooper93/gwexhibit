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
  res.sendFile(__dirname + '/public/rs.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});
// app.use('/bower', express.static(__dirname + '/bower_components'));
app.use('/bower', express.static(path.join(__dirname, '/bower_components')))
// Other server globals 
var tempData;
var ports=[]; 
var dt = 1/1000;

// for speed we're going to pre-aloacate all the signals as its should be easier. 

var tmax =4; // We're specifying this in MS. 
var t = new Array(tmax)
var cw_val = new Array(tmax);
var burst_val = new Array(tmax);
var lowm_val =  new Array(tmax);
var highm_val = new Array(tmax); 
// Caculating the time vector 

for (var i =0;i < tmax;i++) {
	t[i] = i/1000; // This is now a time vector to run all the signals from and will be calculated once on startup.  
}

// calculating the CW  

for(var i = 0; i < tmax; i++) {
	cw_val[i] = 127+ 100*(Math.sin(t[i]*Math.pi/50));
}

// now we'll calculate values for the burst values. 

for (var i = 0; i< tmax; i++) {
	// burst1 = 128+0.04*exp(8*t(1,1:start1));
	// burst2 = 128+247.*exp(-1.5.*t(1,start1+1:end)).*sin(2*pi*t(1,start1+1:end)+2*t(1,start1+1:end).^2);
	// burst = [burst1 burst2];
	var burst1;
	var burst2;
	if (i < tmax/4) {
		burst1 = 128+0.04*Math.exp(8*i); // The ring up
	}
	if (i>tmax/4) {
		burst2 = 128+247*Math.exp(-1.5*i)*Math.sin(2*pi*i+2*i*i); // The ringdown
	}
	var burst = burst1.concat(burst2); // adding these together. 
}


// the low mass chirp

for (var i =0; i< tmax; i++ ) {
	lowm_val[i] = 128+10*Math.exp(0.2*i)*sin(2*pi*(i+0.6*i*i)/4);
	// 128+10.*exp(0.2*t).*sin(2*pi*(t+0.6*t.*t)/4)
}

// the high mass chirp
for (var i= 0; i<tmax; i++ ) {
	highm_val[i] = 128+20*Math.exp(0.5*i).*sin(2*pi*(i+0.3*i*i)/4);
	// highm_val = 128+20*exp(0.5*t).*sin(2*pi*(t+0.3.*t.*t)/4);

}


// For the pi   
// var ports = [
// 	{id: 'input', port: "/dev/ttyACM1"}, // need to add the USB port for this arduino
// 	{id: 'output', port: "/dev/ttyACM0"} // need to add this arduinos USB port
// ];

 // for Sam's mac
var ports = [
	{id: "button", port: "/dev/cu.usbmodem1D1121"}, // need to add the USB port for this arduino  Boards[0] access by this.byId("Board ID")
	{id: "piezo", port: "/dev/cu.usbmodem1D11521"} // need to add this arduinos USB port Boards[1] 
];
// var ports = [
// 	{id: "button", port: ""}, // need to add the USB port for this arduino  Boards[0] access by this.byId("Board ID")
// 	{id: "piezo", port: ""} // need to add this arduinos USB port Boards[1] 
// ];	
// Now refer to the arduinos as this.byId("input") (Buttons) and this.byId("output") (Piezo) this should be all inside the boards.ready function

function sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
      }
    }

// This is needed for the RoyalS exhibit - Socket io stuff, dealing with connections, button Control and sending back video lengths

// For the signals need to use the following functions, each need a linear spacing - note syntax will not the the same as matalb syntax (copied below)
// Chirp 1: y1= exp(t).*sin(2*pi.*(1.*t+0.5*1.*t.^2));
// Chirp 2 Higher F: y1= exp(t).*sin(2*pi.*(1.*t+0.5*2.*t.^2));
// Continuous Wave: Math.Sin(2*pi*1*t)]
// Attempt at a burst y2 = 10*exp(-2*(t+pi/6)).*sin(1.*(t+pi/6)-20.*(t+pi/6).^2)

// // Need to decide how we're going to do the sleep / clock function when displaying chirps as they don't need to be cut off.
var PDdata;
var boards;
var inuse=false;
var signalState='none';	
io.on('connection', function(socket){
	// arduino control 
	sleep(1000);
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

	socket.on("disconnect", function(){
		console.log("got Disconnect")
		boards.close;
		// boards = null;
		// delete boards;
	});
});
var boards = new five.Boards(ports);
	boards.on("ready", function(){
	// Boards = new five.Boards(ports).on("ready", function(Boards){ // multiple boards, make sure the ports are specified correclty
		console.log('boards Ready');
		boards.reset;
		// Setting up the default state of returnable items
	 	// Setup the piezo ports
		this.byId("piezo").pinMode(5,five.Pin.Analog);  //Here we setup the port that will read the data
		this.byId("piezo").analogRead(5,function(data){ // Read data aas fast as we can and set it to a global (could be nicer )
			// We can use a set interval command here, BUT we probably want to let the client decide how fast to get data
			// rather than the other way around 
			// PDdata=data;
		});
		this.byId("piezo").pinMode(11,five.Pin.PWM);
		this.byId("button").pinMode(11,five.Pin.PWM);
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
			io.emit('resSignalState',"CW")
		})
		button2.on("close", function(){
			led3.off(); // For debugging
			activatePiezo("Burst");
			io.emit('resSignalState',"Burst")
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
			pin: 9,
			board: this.byId("piezo")
		});

		var led2 = new five.Led({
			pin: 10, 
			board: this.byId("button")
		})
		// for board identification piezo is solid on button is pulsing

		led.on();
		led2.pulse();
		// Socket io conncetion stuff - so we can pass information back and forward
		function activatePiezo(buttonID) {
			// this function is going to handle all the piezo driving 
			if(inuse==false) {
				inuse=true;
				// will need to use digital write for some of these functions and need to send information about what signal is being sent.
				// for all of these we only have 255 integers of dynamic range with this, so we'll have to be smart with our functions
				switch(buttonID){
					case "CW":
						// console.log("CW");
						io.emit('resSignalState',"Continuous Wave");
						var t=0;
						// This will write a new value to the piezo every milisecond, creating the illusion of sine wave
						// Note that this can be changed, but needs to change faster than humans can notice this.

						var cwint = setInterval(function(){
							// var cwval = 4*Math.round(128+(128/18)*Math.sin(2*Math.PI*0.01*t));
							// var d= new Date();
						 //    var cwval =  Math.round(127+127 * Math.sin( (d.getTime() % 2000 ) / ( 1000*40 / Math.PI ) ));
							// console.log(cwval)
							boards.byId("piezo").analogWrite(11,cw_val[t]);
							io.emit("resGraphData",cw_val[t]);
							t=t+1;
							if(t>=tmax){
								clearInterval(cwint);
								boards.byId("piezo").wait(500, function(){
									inuse=false;
									t=0;
									io.emit('resSignalState',"Interferometer Signal")
								})
							}
						},dt); // we'll now send something every 10 milliseconds and loop



						break;

					case "Burst":
					// console.log("burst")
						io.emit('resSignalState',"Burst")
						var t =0;						
						var burstint = setInterval(function(){
							// var burstval = 128+128*Math.exp(-0.5*(t))*Math.sin(1*(t)-20*t*t);
							boards.byId("piezo").analogWrite(11,burst_val[t]);
							console.log(t);
							io.emit("resGraphData",burst_val[t]);
							t=t+dt;
							if (t>=tmax) {
								clearInterval(burstint)
								boards.byId("piezo").wait(500,function(){
									inuse=false;
									io.emit('resSignalState',"Interferometer Signal")
									t=0;
								})
							}
						},dt);
						// Original matlab function
						// 10*exp(-2*(t+pi/6)).*sin(1.*(t+pi/6)-20.*(t+pi/6).^2)
						break;

					case "Lowm":
						var t=0;
						var lowmint = setInterval(function(){
							io.emit('resSignalState',"Low Mass Black Holes")
							// var lowmval = 128+24*Math.exp(0.4*t)*Math.sin(2*Math.PI*(t+5*Math.pow(t,2))/40);
							boards.byId("piezo").analogWrite(11,lowm_val)
								// y1= exp(t).*sin(2*pi.*(1.*t+0.5*2.*t.^2));
							io.emit("resGraphData",lowm_val[t]);
							t=t+dt;
							if (t>=tmax) {
								clearInterval(lowmint)
								boards.byId("piezo").wait(500, function(){
								//wait for 0.5 seconds
								inuse=false;
								t=0;
								io.emit('resSignalState',"Interferometer Signal")
								})
							}
						},dt);
						break;
					case "Highm":
						t=0;
						var highmint = setInterval(function(){
							io.emit('resSignalState',"High Mass Black Holes")
							// var highmval = 128+24*Math.exp(0.4*t)*Math.sin(2*Math.PI*(t+0.5*Math.pow(t,2))/40);
							boards.byId("piezo").analogWrite(11,highm_val[t]);
							io.emit("resGraphData",highm_val[t]);
							t=t+dt;
							if (t>=tmax){
								clearInterval(highmint);
								boards.byId("piezo").wait(500,function(){
									inuse=false;
									t=0;
								})
							}
						},dt)
						// y1= exp(t).*sin(2*pi.*(1.*t+0.5*1.*t.^2));
						break;
					default:
						console.log("No valid buttonID detected");
						break;
				}
			}

		}
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
// app.use("/bower", express.static(__dirname + "/bower_components"));
console.log('Waiting for connection');
