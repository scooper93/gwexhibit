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
		this.axisOption;
		this.dataMax =1000;
		this.dataMin =0;
		this.averageData=false;
		this.setDefaults()
		// Generic Program options are defined here
	};

	// Horizontal Grid lines go R-L
	setDefaults(lineColour,lineWidth,fontColour,fontOption,axisOption,plotOptions) {
		this.lineColour = {
			xAxis:"rgba(0,0,0,0.8)",
			yAxis: "rgba(0,0,0,0.8)",
			xGrid:"rgba(0,0,0,0.3)",
			yGrid:"rgba(0,0,0,0.3)",
			point:"rgba(255,0,0,1)"
		},
		this.lineWidth = {
			xAxis: 2,
			yAxis: 2,
			xGrid: 1,
			yGrid: 1,
			xTick: 2,
			yTick: 2,
			point: 2
		},
		this.fontColour = {
			xLabel: "rgba(0,0,0,1)",
			yLabel: "rbga(0,0,0,1)",
			title: "rgba(0,0,0,1)",
			yTick: "rgba(0,0,0,1)",
			xTick: "rgba(0,0,0,1)"
		},
		this.fontSize = {
			xLabel: 30,
			yLabel: 30,
			title: 40,
			xTick: 15,
			yTick: 15
		},
		this.fontType = {
			xLabel: "Arial",
			yLabel: "Arial",
			title: "Arial",
			yTick: "Arial",
			xTick: "Arial"
		},
		this.fontOption = {
			xLabel: this.fontSize.xLabel.toString().concat("px"," ",this.fontType.xLabel),
			yLabel: this.fontSize.yLabel.toString().concat("px"," ",this.fontType.yLabel),
			title: this.fontSize.title.toString().concat("px"," ",this.fontType.title),
			yTickText: this.fontSize.yTick.toString().concat("px"," ",this.fontType.yTick),
			xTickText: this.fontSize.xTick.toString().concat("px"," ",this.fontType.xTick),
			xTickTextAlign: "center",
			yTickTextAlign: "right"
		},
		this.axisOption = {
			xLabel: "Data Point Number",
			yLabel: "Amplitude",
			xLabelAlign: "center",
			yLabelAlign: "center",
			titleAlign: "center",
			title: "Graph Title"
		},
		this.plotOptions = {
			vertGridLines: true,
			horGridLines: true,
			drawXTickText: true,
			drawYTickText: true,
			numVertGridLines: 10,
			numHorGridLines: 10,
			xTickLength: 10,
			yTickLength: 10,
			dashXLine: false,
			dashYLine: false

		};
	}

	initialisePlot() {
		this.graphCanvas = document.getElementById("realtime_graph");
		this.ctx = this.graphCanvas.getContext('2d')

        this.el =document.getElementById("graph_container");

		this.graphCanvas.setAttribute('width', this.el.offsetWidth);
		this.graphCanvas.setAttribute('height', this.el.offsetHeight);

        this.graphContainerWidth = this.ctx.width;
		this.graphContainerHeight = this.ctx.height;

		this.canvasWidth = this.graphCanvas.width;
		this.canvasHeight = this.graphCanvas.height;
		
		// Defining some margins and boundaries for scaling, we have to do this after the canvas has been defined otherwise bad things will happen. 
		this.margin = {
    		top : 2*this.fontSize.title + 2*this.plotOptions.xTickLength,
    		bottom: 2*this.fontSize.xLabel + 2*this.fontSize.xTick,
    		// bottom : (this.canvasWidth/this.canvasHeight)*this.fontSize.xLabel, // I know what your thinking, but shush. 
    		right : 2*this.fontSize.yLabel + this.plotOptions.yTickLength,
    		left : 2*this.fontSize.yLabel + this.plotOptions.yTickLength
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

		if (this.plotOptions.drawxTickText == true) {
			this.drawxTickText();
		}
		if (this.plotOptions.drawyTickText == true) {
			this.drawyTickText();
		}
		this.DrawAxes();
	}

	// set this by running plot.backgroundColour= "c#olour_value"
	backgroundColour(background_colour) {
		document.body.style.backgroundColor = background_colour;
	}

	plotData(newData){

		if (this.averageData==true) {
			// Do something to average the data currently does sod all
			this.drawData(newData)
		};
		if (this.averageData ==false){
			this.drawData(newData);
		};

	}

	// set this in the code by doing plot.lineColour.xAxis="rgba(red,green,blue,opacity)"
	drawData(newData){
		if (this.drawing==false) {
			this.drawing=true;
			for (var i=0;i<newData.length;i++){
				this.shiftData(this.scaleYData(newData[i]));
			}
			
			// We'll now clear the data points canvas so we can redraw it

			this.ctx.clearRect(this.bounds.left-this.lineWidth.yAxis,this.bounds.top-this.lineWidth.xAxis-this.lineWidth.point,this.bounds.right,this.bounds.bottom-this.bounds.top+2*this.lineWidth.xAxis+this.lineWidth.point);
			this.DrawAxes();

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
		this.ctx.strokeStyle = this.lineColour.yAxis;
		this.ctx.lineWidth = this.lineWidth.yAxis;
		this.ctx.stroke();
		this.ctx.closePath()


		// now we'll draw the horizontal axis 
		this.ctx.beginPath();
		this.ctx.moveTo(this.bounds.left,this.bounds.bottom+this.lineWidth.xAxis);
		this.ctx.lineTo(this.bounds.right,this.bounds.bottom+this.lineWidth.xAxis);
		this.ctx.strokeStyle = this.lineColour.xAxis;
		this.ctx.lineWidth = this.lineWidth.xAxis;
		this.ctx.stroke();
		this.ctx.closePath();
		// Now should we add some markers every n points? This should be specified in the constructor as a default
	}

	drawTickMarks() {
		for (var i=0; i<this.plotOptions.numHorGridLines+1; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left-this.plotOptions.yTickLength,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineTo(this.bounds.left+this.lineWidth.yTick/2,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineWidth =  this.lineWidth.yTick
			this.ctx.strokeStyle = this.lineColour.yTick;
			this.ctx.stroke();
			this.ctx.closePath();
			i=i+1;
		}

		for (var i = 0 ; i<this.plotOptions.numVertGridLines+1; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.bottom-this.lineWidth.xTick/2);
			this.ctx.lineTo(this.bounds.left+i*this.vertGridSpacing,this.bounds.bottom+this.plotOptions.xTickLength);
			this.ctx.strokeStyle = this.lineColour.xTick;
			this.ctx.lineWidth = this.lineWidth.xTick;
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	drawText() {
		// Draw the xLabel
		this.ctx.font = this.fontOption.xLabel; 
		this.ctx.fillStyle = this.fontColour.xLabel;
		this.ctx.textAlign = this.axisOption.xLabelAlign;
		this.ctx.fillText(this.axisOption.xLabel, this.bounds.graphWidth/2+this.bounds.left, this.bounds.bottom + this.margin.bottom/2 + 2*this.fontSize.xTick);
		
		// Draws the title

		this.ctx.font = this.fontOption.title;
		this.ctx.fillStyle = this.fontColour.title;
		this.ctx.textAlign = this.fontOption.titleAlign;
		this.ctx.fillText(this.axisOption.title, this.bounds.graphWidth/2+this.bounds.left, this.bounds.top - this.margin.top/2);

		// now we'll draw the rotated y axis. 

		this.ctx.save();
		this.ctx.translate(this.canvasWidth - 1,0);
		this.ctx.rotate(3*Math.PI/2);
		this.ctx.font = this.fontOption.yLabel;
		this.ctx.fillStyle = this.fontColour.yLabel;
		this.ctx.textAlign = this.axisOption.yLabelAlign;
		this.ctx.direction = "rtl"
		this.ctx.fillText(this.axisOption.yLabel, -this.bounds.graphHeight/2 -this.margin.top,-this.bounds.right - this.margin.left/2);
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


	drawxTickText() {
		// we'll now draw the text for each of the tick marks on the axes  

		// Setup font styling for drawing for text on X ticks
		this.ctx.font = this.fontOption.xTickText;
		this.ctx.fillStyle = this.fontColour.xTick;
		this.ctx.textAlign = this.fontOption.xTickTextAlign;

		for (var i = 0; i<this.plotOptions.numVertGridLines+1;i++) {
			this.ctx.fillText(this.xTickStringText[i], this.bounds.left+i*this.vertGridSpacing, this.bounds.bottom +this.fontSize.yTick+this.plotOptions.xTickLength);
		} 
	}

	drawyTickText() {
		// Setup Font styling for drawing for text on Y ticks..
		this.ctx.font = this.fontOption.yTickText;
		this.ctx.fillStyle = this.fontColour.yTick;
		this.ctx.textAlign = this.fontOption.yTickTextAlign;
		this.ctx.textBaseline="middle"; 
		for (var i = 0; i<this.plotOptions.numHorGridLines+1;i++) {
			this.ctx.fillText(this.yTickStringText[i],this.bounds.left-1.5*this.plotOptions.yTickLength,this.bounds.bottom - this.horGridSpacing*i)
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
				this.ctx.strokeStyle = this.lineColour.yGrid;
				this.ctx.lineWidth = this.lineWidth.yGrid
				this.ctx.stroke();
				this.ctx.closePath();
			}
	}

	DrawHorizontalGridLines() {
		// now we'll draw the Horizontal gridlines
		for (var i=0; i<this.plotOptions.numHorGridLines; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(this.bounds.left,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineTo(this.bounds.right,this.bounds.top+i*this.horGridSpacing);
			this.ctx.lineWidth =  this.lineWidth.xGrid
			this.ctx.strokeStyle = this.lineColour.xGrid;
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	scaleXData() {
		// This should scale the x Data array to fit the points on the canvas.
 
		for (var j = 0; j < this.dataLength;j++){
             // this.timeData[j] = this.offsetX + ( this.bounds.graphWidth - ( this.xscale * j ) );
             this.timeData[j] = this.bounds.left+this.lineWidth.yAxis/2 + ( this.bounds.graphWidth - ( this.dx*j))
        }
	}	
	scaleYData(newData) {
		// I'm going to write this in hardcoded for the meanwhile to get something working, then I'll start with the adaptive scaling. 
		// THe max value will be the offsety  and the minimum will be the offset y + the graph's height
		// var tempgraphData = this.bounds.graphHeight*(this.dataMax-newData)/(this.dataMax-this.dataMin)
		var tempgraphData = this.bounds.top-this.lineWidth.xAxis/2 + ((this.dataMax) -newData)*this.dy;
		return tempgraphData;
	}

	shiftData(tempgraphData){
	    this.graphData.unshift(tempgraphData);
	    this.graphData.pop();

	}
}	