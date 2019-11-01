// Declaring some bad globals, these can be replaced with some thinking. 

// These are the maximum number of pages in the reveal grid, if you add more pages then make sure to change these variables. 
var maxV = 5;
var maxH = 5;
var score = 0;
var questionAnswered = new Array(5).fill(0);
var Locked = false;
var t =0; // time that the video has left to play.
lastVid = [];
socket.on('vidControl',function(msg){
	if(msg=='Unlocked'){
		Locked=false;
		// console.log('Control Panel is Unlocked');
		sleep(2000);
		// since that we've just got the unlocked message we now need to move back home once the video has played.
		// controller('Home')
	}
	// if the message is locked then we need to set Locked=true so we can't move while the video is playing.
		else if(msg == 'Locked') {
		Locked=true;
	}
})

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
    break;
    }
  }
}

socket.on('quizFinish',function(msg){
	// ONLY triggers if we finish the quiz
	score =0;
	questionAnswered=[0,0,0,0,0];
	getEinstein(score);
})

socket.on('indexNavReq', function(msg){
    var h=msg.h;
    var v = msg.v;
    var pageIndex;
    console.log('hello',h,v)
    if ((h==6 || h==5) && questionAnswered[v]!=0)  {
    	pageIndex = getPageLocation(6,v);
    	// User has answered something, so they can't re-answer the same question
    	
    }
    if ((h==6 || h==5) && questionAnswered[v]==0) {
    	pageIndex = getPageLocation(h,v);
    	// User hasnt answered something so they can answer the question
   		
    }
    if ( h<5) {
	   pageIndex=getPageLocation(h,v);  	
	   // Regular page navigation
	   console.log('test')
  		
    }
    if (h==7) {
    	pageIndex=getPageLocation(7,5);
    	getEinstein(score);
    	h=7;
    	v=5;
    	msg.h=h;
    	msg.v=v;
    }
    document.location.href=pageIndex;
    socket.emit('contentNavRes',msg)
    // if (h!=0 && h!==6 && h!==7) {
    // 	initializeClock(lastVid,t,v);
    // }
    
})
// For showing video length
socket.on('videoInfo', function(msg){
	duration=msg;
	// We set a deadline for the video to finish and pass this to the clock element.
	var deadline = new Date(Date.parse(new Date()) + duration*1000);
	initializeClock(deadline);
});

function initializeClock(endtime) {
	// We now need to update the clock and update the HTML on all classes that match our minutes and seconds
	function updateClock() {
		t = getTimeRemaining(endtime);
		for (i=0;i<23;i++) {
			$(".minutes")[i].innerHTML= ('0'+t.minutes).slice(-2);
			$(".seconds")[i].innerHTML= ('0'+t.seconds).slice(-2);
		}
		if (t.total <= 0) {
			clearInterval(timeinterval);
			for (i=0;i<23;i++) {
				$(".minutes")[i].innerHTML= ('00');
				$(".seconds")[i].innerHTML= ('00');	
			}
			Locked=false;
		}
	}
	// This ensures that we loop and always update the clock if the timer hasn't reached zero.
	updateClock();
	// means the clock only updates every second
	var timeinterval = setInterval(updateClock, 1000);
}

// Has the video finished? this passes in the endtime of the video and then works out based on the current date have we finished or not and returns both the total time, minutes and seconds for passing to the clock
function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  return {
    'total': t,
    'minutes': minutes,
    'seconds': seconds
  };
}

// Setting up the event listener for the touch navigation for the enter buttons
$(document).ready(function() {

	$('.enterButton').click(function(){
		var index= getCurrentPage();
		var h= index.h;
		var v = index.v;
		var pageIndex =getPageLocation(v,0);
		finishQuiz();
		document.location.href=pageIndex;
		var msg = {h:v,
				     v:0}
		socket.emit('contentNavReq',msg);
		if (Locked==false) {
			socket.emit('pageRequest',msg)
		}
	});

})

// Setting up the event listener for the home button press.
$(document).ready(function() {

	$('#backHomeImage').click(function(){
		var pageIndex =getPageLocation(0,0);
		finishQuiz();
		document.location.href=pageIndex;
		var msg = {h:0,
				     v:0}
		socket.emit('contentNavReq',msg);
		if (Locked==false) {
			socket.emit('pageRequest',msg)
		}
	});

})

// Setting up the event listeners for the home page buttons
$(document).ready(function() {
		$('#home_detector').click(function(){
			var pageIndex =getPageLocation(0,1);
			document.location.href=pageIndex;
			var msg = {h:0,
					     v:1}
			socket.emit('indexNavReq',msg);
			if (Locked==false) {
				socket.emit('pageRequest',msg)
			}
		});
		$('#home_detecting').click(function(){
			var pageIndex =getPageLocation(0,3);
			document.location.href=pageIndex;
			var msg = {h:0,
					     v:3}
			socket.emit('indexNavReq',msg);
			if (Locked==false) {
				socket.emit('pageRequest',msg)
			}
		});
		$('#home_gravity').click(function(){
			var pageIndex =getPageLocation(0,2);
			document.location.href=pageIndex;
			var msg = {h:0,
					     v:2}
			socket.emit('indexNavReq',msg);
			if (Locked==false) {
				socket.emit('pageRequest',msg)
			}
		});
		$('#home_detections').click(function(){
			var pageIndex =getPageLocation(0,4);
			document.location.href=pageIndex;
			var msg = {h:0,
					     v:4}
			socket.emit('indexNavReq',msg);
			if (Locked==false) {
				socket.emit('pageRequest',msg)
			}
		});
})

// Setting up event listner for previous button press.


$(document).ready(function(){
	$('.prev').click(function(){
		var index = getCurrentPage();
		var h = index.h;
		var v = index.v;
		// Handling page underflow.
		if (v==0) {
			var pageIndex=getPageLocation(h,maxV);
			v=maxV;
		}
		else {
			var pageIndex= getPageLocation(h,v-1);
			v=v-1;

		}
		document.location.href =pageIndex;
	    var msg = {h:h,
	  		     v:v}
	    socket.emit('indexNavReq',msg);
	})
})

// Setting up event listner for next button press
// There is definately a better way of doing this, we need a better way of doing this. 
$(document).ready(function(){
	$('.next').click(function(){
		var index = getCurrentPage();
		var h = index.h;
		var v = index.v;
		// Handling page overflow.
		var pageIndex;
		console.log(h,v)

		// We're on the content pages here
		if (h<5) {
			if (v!=maxV ) {
				v=v+1;
				pageIndex= getPageLocation(h,v);
			}
			else if (v==maxV) {
				v=0;
				pageIndex = getPageLocation(h,0);
			}

		}
		// now for the questions
		else if (h==5){
			if (v<=maxV && questionAnswered[v]==0){
				v=v;
				h=6;
				pageIndex=getPageLocation(h,v);
				console.log('Hello')
			}
			else if (v<=maxV && questionAnswered[v]!=0){
				v=v;
				h=6;
				pageIndex=getPageLocation(6,v);
			}
		}
		else if (h==6) {
			// We're doing the answers now
			if (v<maxV){
				// We're not on the last answer yet
				h=5;
				v=v+1;
				pageIndex=getPageLocation(h,v);
			}
			if (v==maxV){
				console.log('hello')
				v=5;
				h=7;
				pageIndex=getPageLocation(h,v);
				getEinstein(score)
			}
		}
		document.location.href = pageIndex;
	    var msg = {h:h,
	  		     v:v};
	    socket.emit('contentNavRes',msg);
	})


});

var resizeImages = function() {
	$(document).ready(function(){
		$(".topicHeader").css("width", "100%");
	});
}



// Returns a string pageIndex that allows page changes depending on the passed through page indicies
var getPageLocation= function(h,v) {
      var Hor=h.toString();
      var Ver=v.toString();
      var pageIndex="#/"+Hor+"/"+Ver;
      return pageIndex;
}
// Function will look at the current page that we've just switched to and emit a message so the index page can change accordingly.
// Appears to be unused
var changeControlPage = function(pageIndex){
	document.location.href=pageIndex;
	resizeImages();
	var newIndex =getCurrentPage();
	socket.emit('indexPageChange',newIndex)

}


var getCurrentPage = function() {

  return Reveal.getIndices();

}

function finishQuiz() {
	// score =0;
	questionAnswered=[0,0,0,0,0];
	getEinstein(score);
}
// Event listner for the quiz
$(document).ready(function() {

	$('.option').click(function() {
		var tempAnswer=$(this).data('val');
		

		index = getCurrentPage();
		var h = index.h;
		var v = index.v;
		pageIndex= getPageLocation(h+1,v);

		document.location.href=pageIndex;
		if (tempAnswer == 'correct' && questionAnswered[v]==0) {
			questionAnswered[v]=1; 	// This marks the question as finished and encodes the state and marks it as correct 
			score=score+1;
		}
		if (tempAnswer=='incorrect' && questionAnswered[v]==0) {
			questionAnswered[v]=2; 	// This marks the question as finished and encodes the state and marks it as incorrect
		}
		socket.emit('quizUpdateReq',questionAnswered);
		quizLocker(h,v);
		console.log('score',score)
	})
	
		
})
// Determines what text to display
var quizLocker = function(h,v) {
	switch(questionAnswered[v]){
		case 1:
			// Correct answer
			$(".incorrectText").text("Correct!");
			break;

		case 2:
			// Wrong answer
			$(".incorrectText").text('Not quite...');
			break;

	}
}

var getEinstein = function(score) {
	console.log('score is',score)
	switch(score) {
		case 0:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-0-5.png");
			break;
		case 1:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-1-5.png");
			break;
		case 2:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-2-5.png")
			break;
		case 3:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-3-5.png")
			break;
		case 4:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-4-5.png")
			break;
		case 5:
			$("#finishQuizImage").attr('src',"/media/images/Einstein-5-5.png")
			break;

	}
	score=0;
	questionAnswered=[0,0,0,0,0];
	socket.emit('quizUpdateReq',[0,0,0,0,0]); 	// Resetting this variable on the index page if its needed.
}
