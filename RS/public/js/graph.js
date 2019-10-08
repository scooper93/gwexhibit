class Plot {

	constructor() {
		this.drawing = false;
		this.dataLength = 500;
		this.timeData = new Array(this.dataLength);
		this.graphData = new Array(this.dataLength).fill(200);
		this.lineColour;
		this.lineWidth;
		this.textColour;
		this.ctx;
		this.plotOptions;
		this.dataOptions;
		this.dataMax =1000;
		this.dataMin =0;
		this.setDefaults()
		// Genericc Program options are defined here
	};
	// Horizontal Grid lines go R-L
	setDefaults(lineColour,lineWidth,fontColour,fontOption,dataOptions,plotOptions) {
		this.lineColour = {
			xaxis:"rgba(0,0,0,0.8)",
			yaxis: "rgba(0,0,0,0.8)",
			xaxis:"rgba(0,0,0,0.8)",
			yaxis: "rgba(0,0,0,0.8)",
			xgrid:"rgba(0,0,0,0.3)",
			ygrid:"rgba(0,0,0,0.3)",
			point:"rgba(255,0,0,1)"
		},
		this.lineWidth = {
			xaxis: 2,
			yaxis: 2,
			xgrid: 1,
			ygrid: 1,
			xtick: 2,
			ytick: 2,
			point: 2
		},
		this.fontColour = {
			xlabel: "rgba(0,0,0,1)",
			ylabel: "rbga(0,0,0,1)",
			title: "rgba(0,0,0,1)",
			ytick: "rgba(0,0,0,1)",
			xtick: "rgba(0,0,0,1)"
		},
		this.fontSize = {
			xlabel: 30,
			ylabel: 30,
			title: 40,
			xTick: 15,
			yTick: 15
		},
		this.fontType = {
			xlabel: "Arial",
			ylabel: "Arial",
			title: "Arial",
			yTick: "Arial",
			xTick: "Arial"
		},
		this.fontOption = {
			xlabel: this.fontSize.xlabel.toString().concat("px"," ",this.fontType.xlabel),
			ylabel: this.fontSize.ylabel.toString().concat("px"," ",this.fontType.ylabel),
			title: this.fontSize.title.toString().concat("px"," ",this.fontType.title),
			xlabelAlign: "center",
			ylabelAlign: "center",
			titleAlign: "center",
			yTickText: this.fontSize.yTick.toString().concat("px"," ",this.fontType.yTick),
			xTickText: this.fontSize.xTick.toString().concat("px"," ",this.fontType.xTick),
			xTickTextAlign: "center",
			yTickTextAlign: "right"
		},
		this.dataOptions = {
			xlabel: "Data Point Number",
			ylabel: "Amplitude",
			title: "Graph Title"
		},
		this.plotOptions = {
			vertGridLines: true,
			horGridLines: true,
			drawXTickText: true,
			drawYTickText: true,
			numVertGridLines: 10,
			numHorGridLines: 10,
			xtickLength: 10,
			ytickLength: 10,
			dashXLine: false,
			dashYLine: false

		};
	}
	initialisePlot() {
		this.graphCanvas = document.getElementById("realtime_graph");
		this.ctx = this.graphCanvas.getContext('2d')

        this.graphContainerWidth = $("#graph_container").width();
        this.graphContainerHeight = $("#graph_container").height();

        this.ctx.canvas.width = this.graphContainerWidth;
        this.ctx.canvas.height = this.graphContainerHeight;

        // Now we'll set the current canvas size to the size of its container 
        // This should allow better scaling, if we need I can tie it to an event handler too. 

		this.canvasWidth = $("#realtime_graph").width();
		this.canvasHeight = $("#realtime_graph").height();
		
		// Defining some margins and boundaries for scaling, we have to do this after the canvas has been defined otherwise bad things will happen. 
		this.margin = {
    		top : 2*this.fontSize.title,
    		bottom: this.fontSize.xlabel + this.plotOptions.xtickLength + 2*this.fontSize.xTick,
    		// bottom : (this.canvasWidth/this.canvasHeight)*this.fontSize.xlabel, // I know what your thinking, but shush. 
    		right : 2*this.fontSize.ylabel,
    		left : 2*this.fontSize.ylabel + this.plotOptions.ytickLength
		};

		this.bounds = {
			top: this.margin.top,
			bottom: this.canvasHeight - this.margin.bottom,
			right: this.canvasWidth - this.margin.right,
			left: this.margin.left
		};
		// Now we'll set the ranges
		this.bounds.xRange = this.bounds.right - this.bounds.left;
		this.bounds.yRange = this.bounds.bottom - this.bounds.top;
		// The graph heights
		this.bounds.graphHeight = this.bounds.yRange ;
		this.bounds.graphWidth = this.bounds.xRange ;

		// Scaling
		this.xscale = this.bounds.graphWidth / this.dataLength;
		this.dx = this.bounds.xRange / this.dataLength;
		this.dy = this.bounds.yRange / (this.dataMax - this.dataMin)

		// Grid spacing 
		this.vertGridSpacing = this.bounds.graphWidth / this.plotOptions.numVertGridLines;
		this.horGridSpacing = this.bounds.graphHeight / this.plotOptions.numHorGridLines;

		// Create new array to store the strings for the tick mark text

		this.yTickStringText = new Array(this.plotOptions.numVertGridLines);
		this.xTickStringText = new Array(this.plotOptions.numHorGridLines);
		
		this.drawTickMarks();
		this.scaleXData();
		this.drawText();
		this.calculateTickText();

		if (this.plotOptions.drawXTickText == true) {
			this.drawXTickText();
		}
		if (this.plotOptions.drawYTickText == true) {
			this.drawYTickText();
		}
		this.DrawAxes();
	}
	// set this by running plot.backgroundColour= "c#olour_value"
	backgroundColour(background_colour) {
		document.body.style.backgroundColor = background_colour;
	}


	// set this in the code by doing plot.lineColour.xaxis="rgba(red,green,blue,opacity)"
	plotData(newData){
		if (this.drawing==false) {
			this.drawing=true;
			for (var i=0;i<newData.length;i++){
				this.shiftData(this.scaleYData(newData[i]));
			}
			
			// We'll now clear the data points canvas so we can redraw it

			this.ctx.clearRect(this.bounds.left-this.lineWidth.yaxis,this.bounds.top-this.lineWidth.xaxis-this.lineWidth.point,this.bounds.right,this.bounds.bottom-this.bounds.top+this.lineWidth.xaxis+this.lineWidth.point);
			// this.ctx.clearRect(this.offsetX+1,0,this.bounds.graphWidth-1,this.bounds.graphHeight-this.offsetY);
			this.DrawAxes();
			// this.drawTickMarks();
			// this.drawText();

			// Now we check whether we want vertical and horizontal gridlines
			if (this.plotOptions.vertGridLines == true) {
				this.DrawVerticalGridLines();
			}
			if (this.plotOptions.horGridLines == true) {
				this.DrawHorizontalGridLines();
			}

			// Beginning of frame drawing
			this.ctx.beginPath();

			this.ctx.moveTo(this.timeData[0],this.graphData[0])
			for (var i = 1; i < this.dataLength; i++){ 
				this.ctx.lineTo(this.timeData[i],this.graphData[i]);
				this.ctx.moveTo(this.timeData[i],this.graphData[i]);
			}
			// now we'll set the point style before we draw 
			this.ctx.strokeStyle = this.lineColour.point;
			this.ctx.lineWidth = this.lineWidth.point;
			this.ctx.closePath();
			this.ctx.stroke();

			// end of frame drawing
			if (i<=this.dataLength){
				this.drawing = false;
				this.inuse = false;
			}
	// console.log("Wait, we're currently drawing something")
		}
		if (this.drawing == true) {
			console.log("drawing too fast")
		}

	}

	DrawAxes(){
		// we'll draw the initial lines for the axes here
		// Drawing the vertical axis first
		this.ctx.beginPath();
		this.ctx.moveTo(this.bounds.left,this.bounds.top);
		this.ctx.lineTo(this.bounds.left,this.bounds.bottom);
		this.ctx.strokeStyle = this.lineColour.yaxis;
		this.ctx.lineWidth = this.lineWidth.yaxis;
		this.ctx.stroke();
		this.ctx.closePath()


		// now we'll draw the horizontal axis 
		this.ctx.beginPath();
		this.ctx.moveTo(this.bounds.left,this.bounds.bottom+this.lineWidth.xaxis);
		this.ctx.lineTo(this.bounds.right,this.bounds.bottom+this.lineWidth.xaxis);
		this.ctx.strokeStyle = this.lineColour.xaxis;
		this.ctx.lineWidth = this.lineWidth.xaxis;
		this.ctx.stroke();
		this.ctx.closePath();
		// Now should we add some markers every n points? This should be specified in the constructor as a default
	}

	drawTickMarks() {
		for (var i=0; i<this.plotOptions.numHorGridLines+1; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left-this.plotOptions.ytickLength,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineTo(this.bounds.left+this.lineWidth.ytick/2,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineWidth =  this.lineWidth.ytick
			this.ctx.strokeStyle = this.lineColour.ytick;
			this.ctx.stroke();
			this.ctx.closePath();
			i=i+1;
		}

		for (var i = 0 ; i<this.plotOptions.numVertGridLines+1; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.bottom-this.lineWidth.xtick/2);
			this.ctx.lineTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.bottom+this.plotOptions.xtickLength);
			this.ctx.strokeStyle = this.lineColour.xtick;
			this.ctx.lineWidth = this.lineWidth.xtick;
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	drawText() {
		// Draw the xlabel
		this.ctx.font = this.fontOption.xlabel; 
		this.ctx.fillStyle = this.fontColour.xlabel;
		this.ctx.textAlign = this.fontOption.xlabelAlign;
		this.ctx.fillText(this.dataOptions.xlabel, this.bounds.graphWidth/2+this.bounds.left, this.bounds.bottom + this.margin.bottom/2 + 2*this.fontSize.xTick);
		
		// Draws the title

		this.ctx.font = this.fontOption.title;
		this.ctx.fillStyle = this.fontColour.title;
		this.ctx.textAlign = this.fontOption.titleAlign;
		this.ctx.fillText(this.dataOptions.title, this.bounds.graphWidth/2+this.bounds.left, this.bounds.top - this.margin.top/2);

		// now we'll draw the rotated y axis. 

		this.ctx.save();
		this.ctx.translate(this.canvasWidth - 1,0);
		this.ctx.rotate(3*Math.PI/2);
		this.ctx.font = this.fontOption.ylabel;
		this.ctx.fillStyle = this.fontColour.ylabel;
		this.ctx.textAlign = this.fontOption.ylabelAlign;
		this.ctx.direction = "rtl"
		this.ctx.fillText(this.dataOptions.ylabel, -this.bounds.graphHeight/2 -this.margin.top,-this.bounds.right - this.margin.left/2);
		this.ctx.restore();
	}

	calculateTickText() {
		// Now we'll take the max and min and then create tick labels and create strings (should be called at initialisation stage)

		this.yDataRange = this.dataMax - this.dataMin;
		this.xDataRange = this.dataLength;

		// calculate Spacing
		this.yTickSpacing = this.yDataRange/ this.plotOptions.numHorGridLines;
		this.xTickSpacing = this.xDataRange / this.plotOptions.numVertGridLines;

		for (var i = this.plotOptions.numHorGridLines; i>-1;i--) {
			this.yTickStringText[i] = Math.round(this.dataMin + this.yTickSpacing*i).toString();
		}

		for (var j = this.plotOptions.numVertGridLines+1; j>-1;j--) {
			this.xTickStringText[j] =(this.xTickSpacing*j).toString();
		}

	}


	drawXTickText() {
		// we'll now draw the text for each of the tick marks on the axes  

		// Setup font styling for drawing for text on X ticks
		this.ctx.font = this.fontOption.xTickText;
		this.ctx.fillStyle = this.fontColour.xtick;
		this.ctx.textAlign = this.fontOption.xTickTextAlign;

		for (var i = 0; i<this.plotOptions.numVertGridLines+1;i++) {
			this.ctx.fillText(this.xTickStringText[i], this.bounds.left+i*this.vertGridSpacing, this.bounds.bottom +this.fontSize.yTick+this.plotOptions.xtickLength);
		} 
	}

	drawYTickText() {
		// Setup Font styling for drawing for text on Y ticks..
		this.ctx.font = this.fontOption.yTickText;
		this.ctx.fillStyle = this.fontColour.ytick;
		this.ctx.textAlign = this.fontOption.yTickTextAlign;
		this.ctx.textBaseline="middle"; 
		for (var i = 0; i<this.plotOptions.numHorGridLines+1;i++) {
			this.ctx.fillText(this.yTickStringText[i],this.bounds.left-1.5*this.plotOptions.ytickLength,this.bounds.bottom - this.horGridSpacing*i)
			i=i+0;
		}
	}

	DrawVerticalGridLines() {
		// Here we'll draw some gridlines for the vertical and horizontal directions and have the number user specifiable
		// first we'll draw the Vertical gridlines
			for (var i = 0 ; i<this.plotOptions.numVertGridLines; i++) {
				this.ctx.beginPath();
				this.ctx.moveTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.bottom);
				this.ctx.lineTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.top);
				this.ctx.strokeStyle = this.lineColour.ygrid;
				this.ctx.lineWidth = this.lineWidth.ygrid
				this.ctx.stroke();
				this.ctx.closePath();
			}
		// if (this.dashHorLine == true) {

		// 	for (var i = 0 ; i < this.plotOptions.numVertGridLines; i++) {
		// 		this.ctx.beginPath();
		// 		for (var j =0 ; j<this.plotOptions.numVertGridLines ; j++) {

		// 		}
		// 	}
		// }
	}
	DrawHorizontalGridLines() {
		// now we'll draw the Horizontal gridlines
		for (var i=0; i<this.plotOptions.numHorGridLines; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineTo(this.bounds.right,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineWidth =  this.lineWidth.xgrid
			this.ctx.strokeStyle = this.lineColour.xgrid;
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	scaleXData() {
		// This should scale the x Data array to fit the points on the canvas.
		// for (var j = 0;j<timeData.length;j++){
  //    		timeData[j] = offsetx+(xscale*j);
  //   	}
 
		for (var j = 0; j < this.dataLength;j++){
             // this.timeData[j] = this.offsetX + ( this.bounds.graphWidth - ( this.xscale * j ) );
             this.timeData[j] = this.bounds.left+this.lineWidth.yaxis/2 + ( this.bounds.graphWidth - ( this.dx*j))
        }
	}	
	scaleYData(newData) {
		// I'm going to write this in hardcoded for the meanwhile to get something working, then I'll start with the adaptive scaling. 
		// THe max value will be the offsety  and the minimum will be the offset y + the graph's height
		// var tempgraphData = this.bounds.graphHeight*(this.dataMax-newData)/(this.dataMax-this.dataMin)
		var tempgraphData = this.bounds.top-this.lineWidth.xaxis/2 + ((this.dataMax) -newData)*this.dy;
		return tempgraphData;
	}

	shiftData(tempgraphData){
	    this.graphData.unshift(tempgraphData);
	    this.graphData.pop();

	}
}
