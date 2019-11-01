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
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});

app.use('/bower', express.static(path.join(__dirname, '/bower_components')))
var tempData;
var ports=[]; 
var stepsize = 0.005;
var dt = stepsize*1000; // in ms

// for speed we're going to pre-aloacate all the signals as its should be easier. 

// we now specify the time in seconds that each signal should last for
var tmax_cw =10; 
var tmax_burst = 6;
var tmax_lowm = 12;
var tmax_highm =4;

// now we set the number of steps for each thing

var numsteps_cw = tmax_cw/stepsize;
var numsteps_burst = tmax_burst/stepsize;
var numsteps_lowm =  tmax_lowm/stepsize;
var numsteps_highm = tmax_highm/stepsize;

var t = new Array(numsteps_cw); // this should be set to the largest signal in time
var cw_val = new Array(numsteps_cw);
var burst_val = new Array(numsteps_burst);
var lowm_val =  new Array(numsteps_lowm);
var highm_val = new Array(numsteps_highm); 
var burst1 = new Array(numsteps_burst/4);
var burst2 = new Array(3*(numsteps_burst/4));
// var j = new Array(numsteps);/
// Caculating the time vector 
for (var i =0;i < numsteps_cw;i++) {
	t[i] = i*stepsize; // This is now a time vector to run all the signals from and will be calculated once on startup.  

}

// calculating the CW  
function makeData() {
	var d1 = new Date();	
	var t1 = d1.getTime();
	for(var i = 0; i < numsteps_cw;i++) {
		cw_val[i] = Math.round(128 + 128*Math.sin(0.25*t[i]*Math.PI));
		// console.log(t[i]);
		// console.log(t[i],cw_val[i]);
	}
	// console.log(cw_val.length);
	// now we'll calculate values for the burst values. 

	for (var i = 0; i< numsteps_burst; i++) {
		// burst1 = 128+0.04*exp(8*t(1,1:start1));
		// burst2 = 128+247.*exp(-1.5.*t(1,start1+1:end)).*sin(2*pi*t(1,start1+1:end)+2*t(1,start1+1:end).^2);
		// burst = [burst1 burst2];

		if (i < numsteps_burst/6) {
			burst1[i] = Math.round(128+0.08*Math.exp(4*t[i])); // The ring up
		}
		if (i>numsteps_burst/6 && i<numsteps_burst) {
			burst2[i-numsteps_burst/4] = Math.round(128+247*Math.exp(-0.2*t[i])*Math.sin(Math.PI*t[i]+2*t[i]*t[i])/4); // The ringdown
		}
	}

	// console.log(burst_val)
	// the low mass chirp

	for (var i = 0; i< numsteps_lowm; i++ ) {
		lowm_val[i] = Math.round(128+20*Math.exp(0.2*t[i])*Math.sin(2*Math.PI*(t[i]+0.9*t[i]*t[i])/4));
		// 128+10.*exp(0.2*t).*sin(2*pi*(t+0.6*t.*t)/4)
	}

	// the high mass chirp
	for (var i=0; i<numsteps_highm; i++ ) {
		highm_val[i] = Math.round(128+30*Math.exp(0.2*t[i])*Math.sin(1*Math.PI*(t[i]+0.3*t[i]*t[i]/4)));
		// highm_val = 128+20*exp(0.5*t)*sin(2*Math.PI*(t+0.3.*t.*t)/4);

	}
	// console.log("Generated Data");
	var d2 = new Date();
	var t2 = d2.getTime();
	console.log("datagentime",(t2-t1)/1000);
}
makeData();
	burst_val = burst1.concat(burst2); // adding these together. 
// For the pi   
var ports = [
	{id: 'pdRead', port: "/dev/ttyACM1"}, // need to add the USB port for this arduino
	{id: 'pzt', port: "/dev/ttyACM0"}, // need to add this arduinos USB port
	{id: 'buttons', port: "/dev/ttyACM2"}
];

var pdData;
var boards;
var inuse=false;
var signalState='none';		

io.on('connection', function(socket){

	socket.on('reqExhibitState', function(msg){
		// Emmitting the state of the exhibit
		io.emit('resSignalState',inuse);
	});

	socket.on('reqSignalState', function(msg){
		// Just need to return the state of the signal
		io.emit('resSignalState', signal)
	});

	socket.on('reqGraphData', function(){
		// Just emit the latest graph data, and let the client decide how fast, as we're opperating at max data rate here
		io.emit('resGraphData', PDdata);
	});	

	socket.on("disconnect",function(){
		console.log("Disconnecting client")
		boards.close;
	});

	// Now for the exhibit control stuff. 

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

	socket.on('reqVideoState', function(){
		console.log('requesting video state');
		io.emit('reqVideoState');
	});
	socket.on('resVideoState', function(msg){
		console.log(msg);
		io.emit('resVideoState',msg);
	});


});

// Now need to write the boards button logic and read from a third arduino 

var boards = new five.Boards(ports);
	boards.on("ready", function(){
		console.log('Boards connected');
		// Now need to setup the ports for the various arduinos. 

		this.byId("pdRead").pinMode(4, five.Pin.Analog);
		this.byId("pdRead").analogRead(4, function(data){
			// We now read data as fast as the clock rate of the pzt arduino. 
			// This should fix the issue with graph lag.
			pdData= data; 
		})
		// Setting up the PWM functions required for the flashing buttons and the fake gravy wave signals

		this.byId("pzt").pinMode(11,five.Pin.PWM);
		this.byID("buttons").pinMode(11,five.Pin.PWM);

		// Now need to write the input button logic
		var button1 = new five.Switch({
			pin:2,
			board: this.byId("buttons");
		})

		var button2 = new five.Switch({
			pin:3, 
			board: this.byId("buttons");
		});

		var button3 = new five.Switch({
			pin:4,
			board: this.byId("buttons");
		});

		var button4 = new five.Switch({
			pin: 5,
			board: this.byId("buttons");
		});

		// Now writing the LED for the button logic

		var greenLED = new five.Led({
			// green led for the CW
			pin:11,
			board: this.byId("buttons")
		});
		// for the white LED lowm chirp
 		var blueLED = new five.Led({
			// burst
			pin: 9,
			board: this.byId("buttons")
		});
		// for the blue LED highm chirp
		var whiteLED = new five.Led({
			pin: 10, 
			board: this.byId("buttons")
		})
		// for the yellow LED burst
		var yellowLED = new five.Led({
			pin: 6,
			board: this.byId("buttons")
		})

		function pulseLED() {
			var pulseLength =3000;
			whiteLED.pulse(pulseLength);
			yellowLED.pulse(pulseLength);
			greenLED.pulse(pulseLength);
			blueLED.pulse(pulselength);
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

		// Now writing the switch logic, when a buttons pressed, it should stop the LED's and activate some signals

		button1.on("open",function(){
			if (inuse==false) {
				// pulseLED();
			}
		});
		button1.on("close", function(){
			stopLED(); // for debugging
			activatePiezo("Burst");
		});
		button2.on("close", function(){
			stopLED();
			activatePiezo("Highm");
		});
		button3.on("close", function(){
			stopLED();
			activatePiezo("Lowm");
		});

		button4.on("close", function(){
			stopLED();
			activatePiezo("CW");
		});

		function resetLED() {
			stopLED();
			pulseLED();
		};


		resetLED();

		// Now we need to write a function that controls the PZT activation. 
		function activatePiezo(buttonID) {
			// this function is going to handle all the piezo driving 
			if(inuse==false) {
				inuse=true;
				// will need to use digital write for some of these functions and need to send information about what signal is being sent.
				// for all of these we only have 255 integers of dynamic range with this, so we'll have to be smart with our functions
				stopLED();
				switch(buttonID){
					case "CW":
						// console.log("CW");
						io.emit('resSignalState',"Continuous Wave");
						var j=0;
						stopLED();
						// This will write a new value to the piezo every milisecond, creating the illusion of sine wave
						// Note that this can be changed, but needs to change faster than humans can notice this.
						greenLED.pulse(1000);
						var cwint = setInterval(function(){
							// var cwval = 4*Math.round(128+(128/18)*Math.sin(2*Math.PI*0.01*t));
							// var d= new Date();
						 //    var cwval =  Math.round(127+127 * Math.sin( (d.getTime() % 2000 ) / ( 1000*40 / Math.PI ) ));
							// console.log(cwval)
							boards.byId("pzt").analogWrite(11,cw_val[j]);
							// io.emit("resGraphData",PDdata);
							j=j+1;
							if(j>=numsteps_cw){
								clearInterval(cwint);
								boards.byId("pzt").wait(10, function(){
									inuse=false;
									j=0;
									greenLED.stop();
									greenLED.off();
									resetLED();
									io.emit('resSignalState',"Interferometer Signal");
								});
							}
						},dt); // we'll now send something every 10 milliseconds and loop



						break;

					case "Burst":
					// console.log("burst")
						var j=0;
						io.emit('resSignalState',"Burst");
						stopLED();
						yellowLED.pulse(1000);						
						var burstint = setInterval(function(){
							// var burstval = 128+128*Math.exp(-0.5*(t))*Math.sin(1*(t)-20*t*t);
							boards.byId("pzt").analogWrite(11,burst_val[j]);
							// io.emit("resGraphData",PDdata);
							j=j+1;
							if (j>=numsteps_burst) {
								clearInterval(burstint);
								boards.byId("pzt").wait(10,function(){
									inuse=false;
									yellowLED.stop();
									yellowLED.off();
									resetLED();
									io.emit('resSignalState',"Interferometer Signal");
									j=0;
								});
							}
						},dt);
						// Original matlab function
						// 10*exp(-2*(t+pi/6)).*sin(1.*(t+pi/6)-20.*(t+pi/6).^2)
						break;

					case "Lowm":
						var j=0;
						stopLED();
						io.emit('resSignalState',"Low Mass Black Holes");
						whiteLED.pulse(1000);
						var lowmint = setInterval(function(){
							// var lowmval = 128+24*Math.exp(0.4*t)*Math.sin(2*Math.PI*(t+5*Math.pow(t,2))/40);
							boards.byId("pzt").analogWrite(11,lowm_val[j]);
								// y1= exp(t).*sin(2*pi.*(1.*t+0.5*2.*t.^2));
							// io.emit("resGraphData",PDdata);
							j=j+1;
							if (j>=numsteps_lowm) {
								clearInterval(lowmint);
								boards.byId("pzt").wait(10, function(){
								//wait for 0.5 seconds
								inuse=false;
								j=0;
								whiteLED.stop();
								whiteLED.off();
								resetLED();
								io.emit('resSignalState',"Interferometer Signal");
								});
							}
						},dt);
						break;
					case "Highm":
						j=0;
						stopLED();
						blueLED.pulse(1000);
						io.emit('resSignalState',"High Mass Black Holes");
						var highmint = setInterval(function(){
							// var highmval = 128+24*Math.exp(0.4*t)*Math.sin(2*Math.PI*(t+0.5*Math.pow(t,2))/40);
							boards.byId("pzt").analogWrite(11,highm_val[j]);
							// io.emit("resGraphData",PDdata);
							j=j+1;
							if (j>=numsteps_highm){
								clearInterval(highmint);
								boards.byId("pzt").wait(10,function(){
									inuse=false;
									j=0;
									blueLED.stop();
									blueLED.off();
									resetLED();
									io.emit('resSignalState',"Interferometer Signal");
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
