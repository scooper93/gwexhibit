// some tasty tasty globals!

var questionAnswered = new Array(5).fill(0);
  

  // Setting event listeners
  $(document).ready(function() {

    $('#sub1').click(function(){
      // Home or subpage 1
      animationClick('#sub1','rubberBand');
      pageNav(0);
    });
    $('#sub2').click(function(){
      // IFO or subpage 2
      animationClick('#sub2','rubberBand');
      pageNav(1);
    });
    $('#sub3').click(function(){
      // Gravity or subpage 3
      animationClick('#sub3','rubberBand');
      pageNav(2);
    });
    $('#sub4').click(function(){
      // Detecting GW or subpage 4
      animationClick('#sub4','rubberBand');
      pageNav(3);
    });
    $('#sub5').click(function(){
      // WHWS or subpage 5
      animationClick('#sub5','rubberBand');
      pageNav(4);
    });
    $('#sub6').click(function(){
      // Quiz or subpage 6
      animationClick('#sub6','rubberBand');
      pageNav(5);
    });
    $('#sub7').click(function(){
      // learn more or back button
      animationClick('#sub7','rubberBand');
      pageNav(6);
    });

});
  animationClick('#sub1','rubberBand');
  animationClick('#sub2','rubberBand');
  animationClick('#sub3','rubberBand');
  animationClick('#sub4','rubberBand');
  animationClick('#sub5','rubberBand');
  animationClick('#sub6','rubberBand');
  animationClick('#sub7','rubberBand');


resizeMenuFont = function() {
  var minFontSize =4;
  $("sub1").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub2").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub3").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub4").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub5").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub6").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
  $("sub7").textfill({
    minFontPixels:minFontSize,
    innerTag:'H2'
  })
}

  // For setting the sizes of each of the elements dynamically when the page loads.
  var windowHeight = $(window).height();
  var windowWidth = $(window).width();
  var margins = [4,4,6,4]; // Top,right,bottom,left in % of screen 
  var contentHeight = $('.contentContainer').height();
  var contentWidth = $('.contentContainer').width();
  var subContentContainerList =document.getElementsByClassName("secondaryNav");
  document.getElementById("mainContent").height = windowHeight- windowHeight*(margins[0]+margins[2])/100+2*subContentContainerList.length;
  document.getElementById("mainContent").width = contentWidth;

  $(".contentContainer").height(Math.floor(windowHeight));
  $(".secondaryNav").height(Math.floor((windowHeight-windowHeight*(margins[0]+margins[2])/100)/subContentContainerList.length)); // Setting the LHS nav bars to be the same height
  $(".pageTitle").height(Math.floor((windowHeight-windowHeight*(margins[0]+margins[2])/100)/subContentContainerList.length))
  
$(document).ready(function() {
  setupPage();

})
  var setupPage = function() {
    resetNavColour();
    changeNavColour(0,0);
    resizeMenuFont();
  }


  // Defining some page strings
var navStrings = [
  ["Home","The Detector","Gravity","Detecting Gravitational Waves","What have we seen?","Quiz","Learn More!"], // Home Strings
  ["Detecting Gravitational Waves","Model Detector","Stretch and Squash","LIGO","Virgo","University of Birmingham","Back"], // Detector Strings
  ["Gravity","Einstein's Gravity","Massive Stars","Neutron Stars","Black Holes","Gravitational Waves","Back"], // Gravity Strings
  ["Initial Discovery","What did we see?","Black hole mergers","What did we learn?","What can we see?","What's next?","Back"], // Detecting GW's Strings
  ["Initial discovery","Detection Timeline","More discoveries","Binary neutron stars","Gravity and light","What's next?","Back"], // What have We seen strings
  ["Question 1","Question 2","Question 3","Question 4","Question 5","Finish Quiz","Back"], // Question Strings
  ["Question 1","Question 2","Question 3","Question 4","Question 5","Finish Quiz","Back"], // Answer Strings
  ["Question 1","Question 2","Question 3","Question 4","Question 5","Finish Quiz","Back"] // Finish Quiz Strings (bodge ahoy!)
];
  // Resetting the navigation pages.
  resetNavColour = function() {
    for (i=0;i<subContentContainerList.length;i++)
      document.getElementsByClassName('secondaryNav')[i].style.backgroundColor = 'rgba(' + 35+ ',' + 163 + ',' + 143 + ',' + 255 + ')';
  }
  socket.on('quizUpdateReq', function(msg){
    questionAnswered = msg;
    console.log('One')
    // Activated when the user selects a quiz option
  })
  socket.on('contentNavRes',function(msg){
    var h= msg.h;
    var v = msg.v;
    resetNavColour();
    changeNavColour(h,v);
    changeAllTitles(h,v);
    console.log(h,v);
    console.log('Two')
    // activated when the user selects either a next button or a link on the index. 
  })

  socket.on('pageRequestFromContent',function(msg){
    var h= msg.h;
    var v = msg.v;
    resetNavColour();
    changeNavColour(h,v);
    changeAllTitles(h,v);
    console.log('Three')
  });

  socket.on('contentNavReq', function(msg){
    var h= msg.h;
    var v = msg.v;
    animateNav();
    resetNavColour();
    changeNavColour(h,v);
    changeAllTitles(h,v);
    console.log('Four')
  })

  socket.on('contentUpdateRes'), function(msg) {
    // Used for updating the quiz pages and locking them. 
  }

var animateNav = function() {
  element = $('.subTitle');
  element.addClass('animated ' + 'fadeInLeft');
      window.setTimeout( function(){
          element.removeClass('animated ' + 'fadeInLeft');
      }, 2000);
}

changeNavColour = function(h,v) {

  document.getElementsByClassName("secondaryNav")[v].style.backgroundColor = 'rgb(' + 0+ ',' + 181 + ',' + 45 + ')'; 
}

var changeSingleTitle = function(h,v){
  document.getElementsByClassName("subTitle")[v].innerHTML = navStrings[h][v];
}

var changeAllTitles = function(h,v){
  for (var i=0;i<subContentContainerList.length;i++){
      document.getElementsByClassName("subTitle")[i].innerHTML = navStrings[h][i];
  }
  if (h!=0) {
    document.getElementsByClassName("secondaryNav")[6].style.background = 'rgb(' + 0+ ',' + 87 + ',' + 22 + ')';
  }
}


pageNav = function (curPage) {
    // This page nav is only needed because of the touch controls. There might be a better way of doing this. 
    resetNavColour(); 
    index= getCurrentPage();
    var h=index.h;
    var oldV= index.v;
    index.v = curPage;
    if (h!=0 && curPage==6){
        h=0;
        index.h=0;
        index.v=0;
        animateNav();
    }
    if (h==0 && curPage==5) {
      socket.emit('quizFinish',0);
    }
    else if (h==6) {
      // We're dealing with the quiz, which means its special case time. 
      console.log(h,oldV)
      index.h=5;
      if (oldV<=5) {
          index.v=oldV+1;  
      }
      if (oldV==5 && h==6) {
          // Need to finish the quiz
          index.h=7;
          index.v=0;
      }

    }
    // To allow the user to quit the quiz at any stage during the quiz 
    if ((h==5 || h==6) && curPage==5) {
        index.h=7;
        index.v=0;
        msg=0;
        socket.emit('quizFinish',msg)
    }

    if (h==7) {
      if (questionAnswered[curPage]==1 || questionAnswered[curPage]==2) {
          index.h=6;
          index.v=curPage;
      }
      else if (questionAnswered[curPage]==0){
          index.h=5;
          index.v=curPage;
      }
      else if (curPage==5) {
          index.v=0;
          index.h=0;
      }
      else if (curPage==6){
        index.h=0;
        index.v-0;
        questionAnswered=[0,0,0,0,0];
      }
      else if (curPage==7) {
          index.h=0;
          index.v=0;
          questionAnswered=[0,0,0,0,0];
      }
    }

    socket.emit('indexNavReq',index); // Fires as we need to change the page.
    changeAllTitles(h,6);
    resizeMenuFont();

}

getCurrentPage = function() {

  return document.getElementById('mainContent').contentWindow.Reveal.getIndices();

}
// Adding the animations for page changing. 
function animationClick(element, animation){
  element = $(element);
  element.click(
    function() {
      element.addClass('animated ' + animation);
      //wait for animation to finish before removing classes
      window.setTimeout( function(){
          element.removeClass('animated ' + animation);
      }, 2000);
    }
  );
};