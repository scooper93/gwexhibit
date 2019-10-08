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
  res.sendFile(__dirname + '/public/rs_test.html');
  // res.sendFile(_dirname+'/public/graph_test.html');
  // res.sendFile(__dirname+ '/public/diagnostics.html');
});
// app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/bower', express.static(__dirname + '/bower_components'));
// Other server globals 
var tempData;

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
    	break;
	}
  }
}
var t1=0;
var t2=0;
var t3=0;
var t4=0;
var PDdata;
var boards;
var inuse=false;
var signalState='none';	
io.on('connection', function(socket){
	// arduino control 
	console.log("connected")

	socket.on('reqExhibitState', function(msg){
		// Just need to return the state of the exhibit
		console.log(inuse)
		io.emit('resExhibitState',inuse); // this replies true or false
	});
	socket.on('reqSignalState', function(msg){
		// Just need to return the state of the signal
		io.emit('resSignalState', signal)
	});

	socket.on('reqGraphData', function(msg){
		// Just emit the latest graph data, and let the client decide how fast, as we're opperating at max data rate here
	switch (msg) {
	    case "cw":
	      // statements_1
	        var cwval = Math.round(511+512*Math.sin(2*Math.PI*0.01*t1));
	        t1=t1+0.01;
	        io.emit('resGraphData',cwval);
	        console.log(cwval)
	        if(t1>=3){
	          t1=0;
	      	}
	      break;
	    case "burst":
		  	var burstval = Math.round(511+512*Math.exp(-0.5*(t2))*Math.sin(1*(t2)-20*Math.pow(t2,2)));
	        t2=t2+0.01;
	        io.emit('resGraphData',burstval);
	        if(t2>=3){
	          t2=0;
	        }
	      break;
	    case "lowm":
			var lowmval = Math.round(511+(512/48)*Math.exp(t3)*Math.sin(2*Math.PI*(t3+Math.pow(t3,2))));
	        io.emit('resGraphData',lowmval);
	        t3=t3+0.01;
	        if(t3>=3){
	          t3=0;
	        }
	      break;
	    case "highm":
			var highmval = Math.round(511+(512/48)*Math.exp(t4)*Math.sin(2*Math.PI*(t4+Math.pow(t,2))));
	        t4=t4+0.01;
	        io.emit('resGraphData',highmval);
	        if(t4>=3){
	        	t4=0;
	        }
	      break;
	    case "nosignal":
	      d= new Date().getTime()
	      PDdata = Math.round(511+512*Math.sin(d));
	      io.emit('resGraphData',PDdata);
	      break;
	    default:
	      // statements_def
	      break;
  }





		io.emit('resGraphData', PDdata);

	});	
	socket.on('emitSingal', function(msg){
		switch (msg) {
			case "cw":
				
				break;
			case "burst":

				break;
			case "lowm":

				break;
			
			case "highm":

				break;
			default:
				// statements_def
				break;
		}
	})
	socket.on("disconnect", function(){
		console.log("got Disconnect")
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
// app.use("/bower", express.static(__dirname + "/bower_components"));
console.log('Waiting for connection');
