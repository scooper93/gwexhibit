
// function startUp() {
// 	plot = new Plot();
// 	// plot.initialisePlot();
// 	setupPlot(plot);
// 	createData(t);
// 	setInterval(function(){
// 		createData(t);
// 		t=t+0.005;
//     },Math.round(1000/drawingSpeed))
// }
function createData() {
    var minval = 0;
    var maxval = 2 * Math.PI;
    var npts = 100;
    var data = [];
    var d=new Date();
    var phase = 2 * Math.PI;
    var val =Math.round(511+1*Math.exp(2*(t))*Math.sin(1*(t)-20*Math.pow(t,2)))
    if (t>3){
    	val = Math.round(500+500 * Math.sin( (d.getTime() % 2000 ) / ( 200 / Math.PI ) ));
    }
    // var val = Math.round(1024 * Math.abs(Math.sin( (d.getTime() % 2000 ) / ( 500 / Math.PI ) )));
    tempArray[l] = val;
    l=l+1;
    if (l==pointsPerDraw) {
    	plot.plotData(tempArray);
    	l=0;
    }

    }