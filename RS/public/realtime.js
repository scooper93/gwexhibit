class plot (){
	constructor {

	}
}

class axes() {
	constructor{
		graphCanvas = document.getElementById("graphy");
		gtx = graphCanvas.getContext('2d');
		canvasWidth = $("graphy").width();
		canvasHeight =$("graphy").height();
		xOffset = Math.round(canvasWidth/10);
		yOffset = Math.round(canvasHeight/10);

		graphWidth = canvasWidth-2*xOffset;
		graphHeight = canvasHeight-2*yOffset;

		xScale = graphWidth/dataLength;
		dataLenth = data.length();
		yScale = graphHeight/1024; // This is just going to the the maximum value that we're going to get from the PD (will make a function to change this variable)

	}
}