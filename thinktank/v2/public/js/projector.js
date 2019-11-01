// <!-- Comment out this next bit of code if your at the thinktank or running on the pi --->

var socket = io();
socket.on('reqVideoState', function() {
	if(videoPlaying==true) {
		console.log('Video State requested');
		socket.emit('resVideoState','Play');
		// socket.emit('VideoLength', duration)
		console.log('video State Sent');
	}
});
function lockControl(elmt,msg) {
	console.log(msg);
	socket.emit('vidControl',msg);
}


	// Event listner for page requests, used to change pages
socket.on('pageRequest', function (msg) {
	console.log('Got command: ' + msg.h);
	var pageReq = msg.h;
	switch (pageReq) {
		case 0:
			displayNone();
			growWebcam();
			videoPlaying=false;
			// document.getElementsByClassName('webcam1')[0].style.display='block';
			page='Home';
			break;
		case 2:
			var vid1=document.getElementById("BHVid");
			console.log(vid1)
			displayNone();
			shrinkWebcam();
			videoPlaying=true;
			// document.getElementsByClassName('webcam1Small')[0].style.display='block';
			setVideoTime(vid1);
			page='BlackHole';
			break;
		case 1:
			var vid2=document.getElementById("IFOVID");
			displayNone();
			shrinkWebcam();
			videoPlaying=true;
			// document.getElementsByClassName('webcam1Small')[0].style.display='block';
			setVideoTime(vid2);
			page='IFO';
			break;
		case 3:
			var vid3=document.getElementById("DetVid");
			displayNone();
			shrinkWebcam();
			videoPlaying=true;
			// document.getElementsByClassName('webcam1Small')[0].style.display='block';
			setVideoTime(vid3);
			page='Detection';
			break;
		case 4: 
			// This is the page for the 4th video, corresponding to the what have we seen pages
			var vid4 = document.getElementById("whwsVid")
			displayNone();
			shrinkWebcam();
			console.log('hello')
			videoPlaying=true;
			setVideoTime(vid4);
			page='WHWS';
			break;
		case 5:
			displayNone();
			videoPlaying=false;
			document.getElementsByClassName('webcam1')[0].style.display='block';
			page='Quiz';
	}
});
// We now need to get the video time, pause it set the time to 0 and then play, otherwise everything sets on fire (not literally)
  function setVideoTime(vid) {
		console.log(vid);
		vid.pause();
		sleep(100);
		vid.currentTime=0;
		vid.play();
		vid.style.display='block';
		msg=vid.duration;
		socket.emit('videoInfo',msg);
		lockControl(vid,'Locked');
  	}
  	// Set all videos to none
  	function displayNone(){
		document.getElementById('IFOVID').style.display ='none';
		document.getElementById('BHVid').style.display ='none';
		document.getElementById('DetVid').style.display ='none';
  	}
  	// Incase we're feling sleepy and want to take a nap
  function sleep(milliseconds) {
  	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
    	if ((new Date().getTime() - start) > milliseconds){
    break;
    }
  }
}
// We now need to shrink the webcam 
function shrinkWebcam(){
	document.getElementsByClassName('webcam1')[0].style.height='30%';
	document.getElementsByClassName('webcam1')[0].style.width='30%';
	document.getElementsByClassName('webcam1')[0].style.top='20%';
	document.getElementsByClassName('webcam1')[0].style.left='9%';
	document.getElementsByClassName('webcam1')[0].style.transition='1s';
}
// Need to make the webcam grow and we can use a nice transition too. 
function growWebcam(){
	document.getElementsByClassName('webcam1')[0].style.height='50%';
	document.getElementsByClassName('webcam1')[0].style.width='50%';
	document.getElementsByClassName('webcam1')[0].style.left='13%';
	document.getElementsByClassName('webcam1')[0].style.top='16%';
	document.getElementsByClassName('webcam1')[0].style.transition='1s';
}

// Adding event listeners for detecting when vidoes have finished. 
$(document).ready(function() {
	document.getElementById('IFOVID').addEventListener('ended', vidFinish,false);
	document.getElementById('DetVid').addEventListener('ended', vidFinish,false);
	document.getElementById('BHVid').addEventListener('ended', vidFinish,false);
	document.getElementById('whwsVid').addEventListener('ended',vidFinish,false);
})

function vidFinish(e){
	displayNone();
	console.log('Vid Finished')
	growWebcam();
}

// Included for future video
// $("#IFOVID").bind('stop', function(e){
// 	console.log('Stopped');
// 	displayNone();
// 	growWebcam();
// })


// Stuff for the graphing

function setupGraph(graphy){

  graphy.plotOptions.drawXTickText= false;
  graphy.plotOptions.drawYTickText = false;
  // graphy.plotOptions.drawYTickText = false;
  // Setting  titles
  graphy.dataOptions.title = "Interferometer Signal";
  graphy.dataOptions.xlabel = "Time";
  graphy.dataOptions.ylabel = "Signal";
  // Setting font colours
  graphy.fontColour.xlabel = "rgba(234,198,122,1)";
  graphy.fontColour.ylabel = "rgba(234,198,122,1)";
  graphy.fontColour.title = "rgba(234,198,122,1)";
  graphy.fontColour.xtick = "rgba(234,198,122,1)";
  graphy.fontColour.ytick = "rgba(234,198,122,1)";
  // Setting line colours
  graphy.lineColour.yaxis = "rgba(35,50,55,1)";
  graphy.lineColour.xaxis = "rgba(35,50,55,1)";
  graphy.lineColour.xtick = "rgba(35,50,55,1)";
  graphy.lineColour.ytick = "rgba(35,50,55,1)";
  graphy.lineColour.xgrid = "rgba(35,50,55,0.5)";
  graphy.lineColour.ygrid = "rgba(35,50,55,0.5)";
  graphy.dataMax = 1100;
  graphy.dataMin= 0;


}

  // now we can set some colours and defaults by editing setting values, as we've already set the defaults.
// function drawStuff() {
//   setInterval(function(){
//     reqData();
//     },Math.round(1000/drawingSpeed))
// }
