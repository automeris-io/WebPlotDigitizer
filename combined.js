/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var loadScript;
/**
 * Loads an external JS file.
 */
function loadJS(jsfile) {

  if(jsfile != '') {
    unloadJS();
    
    loadScript=document.createElement('script');
    loadScript.setAttribute("type","text/javascript");
    loadScript.setAttribute("src", jsfile);
    loadScript.setAttribute("Id","loadedJS");
    loadScript.setAttribute("onerror","alert('Error loading file!');");
    
    if (typeof loadScript!="undefined")
      document.getElementsByTagName("head")[0].appendChild(loadScript);
    else
      alert('Error loading script!');
     
  }
}

function unloadJS() {

  var getJSelement = document.getElementById('loadedJS');
  if (getJSelement)
    getJSelement.parentNode.removeChild(getJSelement);
}

function AEObject() {
  this.getParamList = function() {};
  this.run = function() {};
}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/** Have the axes been picked? true/false. */
var axesPicked; // axes picked?

/** Number of axes points picked. */
var axesN; 

/** Total number of axes points needed to align. */
var axesNmax;

/** XY-Axes data. */
var xyAxes;

/** Axes alignment data */
var axesAlignmentData = [];

/** Plot type. Options: 'XY', 'bar', 'polar', 'ternary' or 'map' */
var plotType; 

/**
 * Start the alignment process here. Called from the Plot Type option popup.
 */ 
function initiatePlotAlignment() {
  axesPicked = 0;
  xyEl = document.getElementById('r_xy');
  polarEl = document.getElementById('r_polar');
  ternaryEl = document.getElementById('r_ternary');
  mapEl = document.getElementById('r_map');
  imageEl = document.getElementById('r_image');
  
  closePopup('axesList');
  
  if (xyEl.checked === true)
    setAxes('XY');
  else if(polarEl.checked === true)
    setAxes('polar');
  else if(ternaryEl.checked === true)
    setAxes('ternary');
  else if(mapEl.checked === true)
    setAxes('map');
  else if(imageEl.checked === true)
    setAxes('image');
}

/**
 * Entry point for Axes alignment. 
 * @param {String} ax_mode Plot Type. Options: 'XY', 'bar', 'polar', 'ternary'
 */
function setAxes(ax_mode) {

	plotType = ax_mode;
	clearSidebar();
	removeAllMouseEvents();
	addMouseEvent('click',pickCorners,true);
	axesN = 0;
	xyAxes = [];

	if ((plotType === 'XY')||(plotType === 'bar')) {
		axesNmax = 4;
		showPopup('xyAxesInfo');
	} else if (plotType === 'polar') {
		axesNmax = 3;
		showPopup('polarAxesInfo');
	} else if (plotType === 'ternary') {
		axesNmax = 3;
		showPopup('ternaryAxesInfo');
	} else if (plotType === 'map') {
		axesNmax = 2;
		showPopup('mapAxesInfo');
	} else if (plotType === 'image') {
		axesNmax = 0;
		alignAxes();
	}
}

/**
 * Handles mouseclick in axis alignment mode. Axes point are defined using this.
 * @param {Event} ev Mouse event.
 */
function pickCorners(ev) {
	if (axesN < axesNmax) {
		var posn = getPosition(ev);
		var xi = posn.x;
		var yi = posn.y;
		xyAxes[axesN] = new Array();
		xyAxes[axesN][0] = parseFloat(xi);
		xyAxes[axesN][1] = parseFloat(yi);
		axesN = axesN + 1;	

		dataCtx.beginPath();
		dataCtx.fillStyle = "rgb(0,0,200)";
		dataCtx.arc(xi,yi,3,0,2.0*Math.PI,true);
		dataCtx.fill();
		
		updateZoom(ev);

		if (axesN === axesNmax) {
				axesPicked = 1;
				
				removeMouseEvent('click',pickCorners,true);
				
				if (plotType === 'XY') {
					showPopup('xyAlignment');
				} else if (plotType === 'polar') {
					showPopup('polarAlignment');
				} else if (plotType === 'ternary') {
					showPopup('ternaryAlignment');
				} else if (plotType === 'map') {
					showPopup('mapAlignment');
				}

				dataCanvas.width = dataCanvas.width;
		}
	}
	
}


/**
 * Store the alignment data.
 */
function alignAxes() {
    if (plotType === 'XY') {
	    var xminEl = document.getElementById('xmin');
	    var xmaxEl = document.getElementById('xmax');
	    var yminEl = document.getElementById('ymin');
	    var ymaxEl = document.getElementById('ymax');
	    var xlogEl = document.getElementById('xlog');
	    var ylogEl = document.getElementById('ylog');

		var inputParser = new InputParser(),
			parsedVal,
			x1Date = false,
			y1Date = false,
			x2Date = false,
			y2Date = false;

		var raiseError = function(parsedValue) {
				if(!inputParser.isValid || parsedValue == null) {
					closePopup('xyAlignment');
					showPopup('inputError');
					return null;
				} 
				return parsedValue;
			};

		parsedVal = raiseError(inputParser.parse(xminEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[0] = parsedVal;
		if(inputParser.isDate) {
			x1Date = true;
		}

		parsedVal = raiseError(inputParser.parse(xmaxEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[1] = parsedVal;
		if(inputParser.isDate) {
			x2Date = true;
		}

		parsedVal = raiseError(inputParser.parse(yminEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[2] = parsedVal;
		if(inputParser.isDate) {
			y1Date = true;
		}

		parsedVal = raiseError(inputParser.parse(ymaxEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[3] = parsedVal;
		if(inputParser.isDate) {
			y2Date = true;
		}

	    if (xlogEl.checked === true)
	        axesAlignmentData[4] = true;
	    else
	        axesAlignmentData[4] = false;
	        
	    if (ylogEl.checked === true)
	        axesAlignmentData[5] = true;
	    else
	        axesAlignmentData[5] = false;

		// Date checks:
		if ((x1Date !== x2Date) || (y1Date !== y2Date)) {
			closePopup('xyAlignment');
			showPopup('inputError');
			return;
		}

		if(x1Date && x2Date) {
			axesAlignmentData[6] = true;
			axesAlignmentData[8] = dateConverter.getFormatString(xminEl.value);
		} else {
			axesAlignmentData[6] = false;
		}

		if(y1Date && y2Date) {
			axesAlignmentData[7] = true;
			axesAlignmentData[9] = dateConverter.getFormatString(yminEl.value);
		} else {
			axesAlignmentData[7] = false;
		}

	    closePopup('xyAlignment');
    } else if (plotType == 'polar') {
	    var r1El = document.getElementById('rpoint1');
	    var theta1El = document.getElementById('thetapoint1');
	    var r2El = document.getElementById('rpoint2');
	    var theta2El = document.getElementById('thetapoint2');
	
	    var degreesEl = document.getElementById('degrees');
	    var radiansEl = document.getElementById('radians');
	    var orientationEl = document.getElementById('clockwise');
	
	    axesAlignmentData[0] = parseFloat(r1El.value);
	    axesAlignmentData[1] = parseFloat(theta1El.value);
	    axesAlignmentData[2] = parseFloat(r2El.value);
	    axesAlignmentData[3] = parseFloat(theta2El.value);
	
	    if (degreesEl.checked === true)
	        axesAlignmentData[4] = true;
	    else
	        axesAlignmentData[4] = false;
	
	    if (orientationEl.checked === true)
	        axesAlignmentData[5] = true;
	    else
	        axesAlignmentData[5] = false;
	
	
	    closePopup('polarAlignment');

    } else if (plotType === 'ternary') {

	    var range1El = document.getElementById('range0to1');
	    var range100El = document.getElementById('range0to100');
	    var ternaryNormalEl = document.getElementById('ternarynormal');
	
	    if (range100El.checked === true)
	      axesAlignmentData[0] = true;
	    else
	      axesAlignmentData[0] = false;
	
	    if (ternaryNormalEl.checked === true)
	      axesAlignmentData[1] = true;
	    else
	      axesAlignmentData[1] = false;
		
	    closePopup('ternaryAlignment');

    } else if (plotType === 'map') {

	    var scaleLength = document.getElementById('scaleLength');
	
	    axesAlignmentData[0] = parseFloat(scaleLength.value);
	
	    closePopup('mapAlignment');

    } else if (plotType === 'image') {

	  axesPicked = 1;
	  axesAlignmentData[0] = imageDimensions[0]; // xmin
	  axesAlignmentData[1] = imageDimensions[2]; // xmax
	  axesAlignmentData[2] = imageDimensions[1]; // ymin
	  axesAlignmentData[3] = imageDimensions[3]; // ymax
    }

	if(axesPicked === 1) {
		acquireData();
	}
    
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Autodetection variables */
var fg_color = [0,0,0];
var bg_color = [255,255,255];
var colorPickerMode = 'fg';

var testImgCanvas;
var testImgContext;

var boxCoordinates = [0,0,1,1];
var drawingBox = false;
var drawingPen = false;
var drawingEraser = false;

var binaryData;

/**
 * Opens the color picker.
 * @params {String} cmode 'fg' or 'bg'
 */
function colorPickerWindow(cmode) {
    colorPickerMode = cmode;
    if(cmode === 'fg') {    
      showPopup('colorPickerFG');
    } else if(cmode === 'bg') {
       showPopup('colorPickerBG');
    }
}

/**
 * Initiate color picking on canvas.
 */
function pickColor() {
	//colorPickerMode = cmode;
	removeAllMouseEvents();
	addMouseEvent('click',colorPicker,true);
}

/**
 * Handle clicks when picking color.
 */
function colorPicker(ev) {

	var posn = getPosition(ev);
	var xi = posn.x;
	var yi = posn.y;
	
	var iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);
	if ((xi < currentImageWidth+cx0) && (yi < currentImageHeight+cy0) && (xi > cx0) && (yi > cy0)) {
		var ii = xi - cx0;
		var jj = yi - cy0;

		var index = jj*4*currentImageWidth + ii*4;
		var PickedColor = [iData.data[index], iData.data[index+1], iData.data[index+2]];
		
		var redEl = document.getElementById('color_red');
		var greenEl = document.getElementById('color_green');
		var blueEl = document.getElementById('color_blue');
				
		removeMouseEvent('click',colorPicker,true);
		
		if(colorPickerMode === 'fg') {
			assignColor('fg',PickedColor);
			
			redEl = document.getElementById('color_red_fg');
			greenEl = document.getElementById('color_green_fg');
			blueEl = document.getElementById('color_blue_fg');
			showPopup('colorPickerFG');

		} else if (colorPickerMode === 'bg') {

		  	assignColor('bg',PickedColor);
			
			redEl = document.getElementById('color_red_bg');
			greenEl = document.getElementById('color_green_bg');
			blueEl = document.getElementById('color_blue_bg');
			showPopup('colorPickerBG');
		}
		
		redEl.value = PickedColor[0];
		greenEl.value = PickedColor[1];
		blueEl.value = PickedColor[2];
	}	
}

/**
 * This function assigns the color to the global variables.
 */
function assignColor(color_mode, color_value) {

  if(color_mode === 'fg') {
    if(!color_value) {
      redEl = document.getElementById('color_red_fg');
      greenEl = document.getElementById('color_green_fg');
      blueEl = document.getElementById('color_blue_fg');
      color_value = new Array();
      color_value[0] = redEl.value;
      color_value[1] = greenEl.value;
      color_value[2] = blueEl.value;
    }
    fg_color = color_value;
    var fgbtn = document.getElementById('autoFGBtn');
    fgbtn.style.borderColor = "rgb(" + fg_color[0] +"," + fg_color[1] +"," + fg_color[2] +")";

  } else if(color_mode === 'bg') {

    if(!color_value) {
      redEl = document.getElementById('color_red_bg');
      greenEl = document.getElementById('color_green_bg');
      blueEl = document.getElementById('color_blue_bg');
      color_value = new Array();
      color_value[0] = redEl.value;
      color_value[1] = greenEl.value;
      color_value[2] = blueEl.value;
    }
    bg_color = color_value;
    var bgbtn = document.getElementById('autoBGBtn');
    bgbtn.style.borderColor = "rgb(" + bg_color[0] +"," + bg_color[1] +"," + bg_color[2] +")";
    
  }
}

/**
 * Enable Box painting on canvas.
 */ 
function boxPaint() {

	removeAllMouseEvents();
	addMouseEvent('mousedown',boxPaintMousedown,true);
	addMouseEvent('mouseup',boxPaintMouseup,true);
	addMouseEvent('mousemove',boxPaintMousedrag,true);

}

/**
 * Handle mouse clicks when painting boxes - Mouse down
 */
function boxPaintMousedown(ev) {

	var posn = getPosition(ev);

	boxCoordinates[0] = posn.x;
	boxCoordinates[1] = posn.y;
	drawingBox = true;
}

/**
 * Handle mouse clicks when painting boxes - Mouse up
 */
function boxPaintMouseup(ev) {
	
	var posn = getPosition(ev);

	boxCoordinates[2] = posn.x;
	boxCoordinates[3] = posn.y;

    hoverCanvas.width = hoverCanvas.width;
	dataCtx.fillStyle = "rgba(255,255,0,1)";
	dataCtx.fillRect(boxCoordinates[0], boxCoordinates[1], boxCoordinates[2]-boxCoordinates[0], boxCoordinates[3]-boxCoordinates[1]);

	drawingBox = false;
}

/**
 * Handle mouse clicks when painting boxes - Mouse drag
 */
function boxPaintMousedrag(ev) {

	if(drawingBox === true) {

		var posn = getPosition(ev);
		var xt = posn.x;
		var yt = posn.y;

		//putCanvasData(markedScreen);
		hoverCanvas.width = hoverCanvas.width;
		hoverCtx.strokeStyle = "rgb(0,0,0)";
		hoverCtx.strokeRect(boxCoordinates[0], boxCoordinates[1], xt-boxCoordinates[0], yt-boxCoordinates[1]);
	}
}

/**
 * Enable pen like painting on screen.
 */
function penPaint() {

	removeAllMouseEvents();
	showToolbar('paintToolbar');
	addMouseEvent('mousedown',penPaintMousedown,true);
	addMouseEvent('mouseup',penPaintMouseup,true);
	addMouseEvent('mousemove',penPaintMousedrag,true);
}

/**
 * Manage clicks when painting with pen tool - Mouse down
 */
function penPaintMousedown(ev) {

	if (drawingPen === false) {
		
		var posn = getPosition(ev);
		var xt = posn.x;
		var yt = posn.y;

	    drawingPen = true;
	    ctx.strokeStyle = "rgba(255,255,0,1)";
	    
	    thkRange = document.getElementById('paintThickness');
	    
	    dataCtx.lineWidth = parseInt(thkRange.value);
	    dataCtx.beginPath();
	    dataCtx.moveTo(xt,yt);
	}
}

/**
 * Manage clicks when painting with pen tool - Mouse up
 */
function penPaintMouseup(ev) {

    dataCtx.closePath();
    dataCtx.lineWidth = 1;
    drawingPen = false;
}

/**
 * Manage clicks when painting with pen tool - Mouse drag
 */
function penPaintMousedrag(ev) {

    if(drawingPen === true) {

		var posn = getPosition(ev);
		var xt = posn.x;
		var yt = posn.y;

	    dataCtx.strokeStyle = "rgba(255,255,0,1)";
	    dataCtx.lineTo(xt,yt);
	    dataCtx.stroke();
    }
}

/**
 * Initiate the eraser.
 */
function eraser() {

	removeAllMouseEvents();
	showToolbar('paintToolbar');
	addMouseEvent('mousedown',eraserMousedown,true);
	addMouseEvent('mouseup',eraserMouseup,true);
	addMouseEvent('mousemove',eraserMousedrag,true);
	dataCtx.globalCompositeOperation = "destination-out";
}

/**
 * Manage mouse events when erasing - Mouse down
 */
function eraserMousedown(ev) {

    if(drawingEraser === false) {

		var posn = getPosition(ev);
		var xt = posn.x;
		var yt = posn.y;

	    drawingEraser = true;
	    dataCtx.globalCompositeOperation = "destination-out";
	    dataCtx.strokeStyle = "rgba(0,0,0,1)";
	
	    thkRange = document.getElementById('paintThickness');
	
	    dataCtx.lineWidth = parseInt(thkRange.value);
	    dataCtx.beginPath();
	    dataCtx.moveTo(xt,yt);
    }
}

/**
 * Manage mouse events when erasing - Mouse up - this is slow!
 */
function eraserMouseup(ev) {

    dataCtx.closePath();
    dataCtx.lineWidth = 1;
    dataCtx.globalCompositeOperation = "source-over";
    drawingEraser = false;
}

/**
 * Manage mouse events when erasing - Mouse drag
 */
function eraserMousedrag(ev) {

    if(drawingEraser === true) {
	
		var posn = getPosition(ev);
		var xt = posn.x;
		var yt = posn.y;

	    dataCtx.globalCompositeOperation = "destination-out";
	    dataCtx.strokeStyle = "rgba(0,0,0,1)";
	    dataCtx.lineTo(xt,yt);
	    dataCtx.stroke();
    }
}

/**
 * Filter based on color and display a test image on the scan settings dialog.
 */
function updateTestWindow() {

  colorModeEl = document.getElementById('colorModeFG');
  colorDistanceEl = document.getElementById('colorDistance');
  if (colorModeEl.checked === true) {
    colmode = 'fg';
    chosenColor = fg_color;
  } else {
    colmode = 'bg';
    chosenColor = bg_color;
  }
  
  cdistance = parseInt(colorDistanceEl.value);
  
  //binaryData = selectFromMarkedRegion(colmode, chosenColor, cdistance);
  
  tempImgCanvas = document.createElement('canvas');
  tempImgCanvas.width = canvasWidth;
  tempImgCanvas.height = canvasHeight;
  
  tempImgContext = tempImgCanvas.getContext('2d');
  
  timgData = tempImgContext.getImageData(0,0,canvasWidth,canvasHeight);
  
  //timgData = currentScreen;
  
  // timgData = binaryToImageData(binaryData,timgData);

  timgData = getImageDataBasedOnSelection(timgData, colmode, chosenColor, cdistance);
  
  tempImgContext.putImageData(timgData,0,0);
  
  testImage = tempImgCanvas.toDataURL();
  
  var displayImage = document.createElement('img');
  displayImage.onload = function() {testImgContext.drawImage(displayImage,0,0,canvasWidth/2,canvasHeight/2); processingNote(false);};
  displayImage.src = testImage;
  
}

/**
 * Save the test canvas as a new image
 */
function saveTest() {
  var testImageWin = window.open();
  testImageWin.location = testImgCanvas.toDataURL();
}

/**
 * Launches the test window and initiates a color based detection.
 */
function launchTestWindow() {
  processingNote(true);
  setTimeout("updateTestWindow();showPopup('testImageWindow');",100);
}

/**
 * Select which auto extraction curve is to be triggered.
 */
function scanPlot() {
    
    autoStepEl = document.getElementById('autostepalgo');
    xStepEl = document.getElementById('xstepalgo');
    yStepEl = document.getElementById('ystepalgo');

	var colorModeEl = document.getElementById('colorModeFG');
	var colorDistanceEl = document.getElementById('colorDistance');
	var colmode;

	if (colorModeEl.checked === true) {
		colmode = 'fg';
		chosenColor = fg_color;
	} else {
		colmode = 'bg';
		chosenColor = bg_color;
	}
	
	cdistance = parseInt(colorDistanceEl.value);
  
    closePopup("testImageWindow");
    
    binaryData = selectFromMarkedRegion(colmode, chosenColor, cdistance);

    xyData = [];
    pointsPicked = 0;
  
    resetLayers();
    
    AEObject.run();
    
    pointsStatus(pointsPicked);  
    
    for(var ii = 0; ii < pointsPicked; ii++) {
      dataCtx.beginPath();
      dataCtx.fillStyle = "rgb(200,0,200)";
      dataCtx.arc(xyData[ii][0],xyData[ii][1],3,0,2.0*Math.PI,true);
      dataCtx.fill();
    }
    
}

/**
 * Display options for the selected AE algorithm.
 */
function displayParameters() {
  // Determine the chosen algorithm
  var algoSelect = document.getElementById('curvesAlgoSelect');
  var paramZone = document.getElementById('paramZone');
  var URLinput = document.getElementById('URLinput');
  
  if (algoSelect.value !== 'customAlgorithm') {

    URLinput.style.display='none';
	var algo = window[algoSelect.value];
   	AEObject = algo;
    makeParameterTable();

  }

}

function makeParameterTable() {

      if (!AEObject.getParamList) { return; }
      var paramList = AEObject.getParamList();
      var paramZone = document.getElementById('paramZone');
      paramZone.innerHTML='';

      for (var ii = 0; ii < paramList.length; ii++) {// make a list of parameters.
		paramZone.innerHTML += "<p>"+paramList[ii][0]+" ("+paramList[ii][1]+") <input type='text' value='"+paramList[ii][2]+"' size=3 id='pv"+ii+"'></p>";
      }
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Main Canvas Variables */

/** Holds the main canvas element where the original picture is displayed. */
var mainCanvas; 
/** Holds the canvas layer in which data is presented */
var dataCanvas;
/** Holds the canvas layer where drawing is done. */
var drawCanvas;
/** Holds the canvas layer where drawing while mouse is hovering is done. */
var hoverCanvas;
/** Holds the top level canvas layer. This layer handles the mouse events. */
var topCanvas;

/** X-Location of the origin where plot image is drawn. */
var cx0; 
/** Y-Location of the origin where plot image is drawn. */
var cy0;
/** Actual canvas width. */
var canvasWidth;
/** Actual canvas height. */
var canvasHeight;
/** Available canvas width. */
var cwidth;
/** Available canvas height. */
var cheight;
/** Aspect ratio of the image. */
var caspectratio;
/** Current image element. */
var currentImage; 
/** Original image element. */
var originalImage;
/** Current image height. */
var currentImageHeight; 
/** Current image width. */
var currentImageWidth;
/** canvas data from getImageData */
var currentImageData; 
/** source image dimensions with elements [x_min, y_min, x_max, y_max] **/
var imageDimensions = [];
/** Image screen dimensions **/
var onScreenDimensions = [];
// canvas layer contexts.
var ctx; 
var dataCtx;
var drawCtx;
var hoverCtx;
var topCtx;

// Different canvas states. They are all of type ImageData

var originalScreen;

// Canvas Layers
var mainScreen;
var dataScreen;
var drawScreen;
var hoverScreen;
var topScreen;

/**
 * Load an image on the main canvas.
 * @param {Image} imgel Image to load.
 */
function loadImage(imgel) {

	var sheight = parseInt(imgel.height);
	var swidth = parseInt(imgel.width);
	var iar = sheight/swidth;
	
	var newHeight = sheight;
	var newWidth = swidth;
		
	if (iar > caspectratio)	{
		newHeight = cheight;
		newWidth = cheight/iar;
	} else {
		newWidth = cwidth;
		newHeight = cwidth*iar;
	}
	
	currentImage = imgel;
	currentImageHeight = parseInt(newHeight);
	currentImageWidth = parseInt(newWidth);
			
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.drawImage(imgel,cx0,cy0,newWidth,newHeight); 
	
	currentScreen = getCanvasData();
	
	imageDimensions[0] = 1;		// x_min
	imageDimensions[1] = 1;		// y_min
	imageDimensions[2] = swidth;	// x_max
	imageDimensions[3] = sheight;	// y_max
	
	onScreenDimensions[0] = cx0;
	onScreenDimensions[1] = cy0;
	onScreenDimensions[2] = newWidth+cx0;
	onScreenDimensions[3] = newHeight+cy0;
}

/**
 * Save the current state.
 */
function saveCanvasImage() {
	var nimagedata = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);
	var tCanvas = document.createElement('canvas');
	
	tCanvas.width = currentImageWidth;
	tCanvas.height=  currentImageHeight;

	tCanvasContext = tCanvas.getContext('2d');
	tCanvasContext.putImageData(nimagedata,0,0);

	newImage = document.createElement('img');
	newImage.src = tCanvas.toDataURL();
	newImage.onload = function() { currentImage = newImage; currentScreen = getCanvasData(); };
}

/**
 * Returns getImageData from the main canvas.
 * @returns {ImageData} Current ImageData.
 */
function getCanvasData() {
	var cImgData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
	return cImgData;
}

/**
 * Load image on the main canvas
 * @param {ImageData} cImgData ImageData.
 */
function putCanvasData(cImgData) {
	mainCanvas.width = mainCanvas.width;
	ctx.putImageData(cImgData,0,0);
}

/**
 * Redraw/Reset canvas.
 */
function reloadPlot() {
	mainCanvas.width = mainCanvas.width; // resets canvas.
	ctx.drawImage(currentImage, cx0, cy0, currentImageWidth, currentImageHeight); // redraw image.
}

/**
 * Redraw/Reset canvas.
 */
function redrawCanvas() {
	mainCanvas.width = mainCanvas.width;
	putCanvasData(currentScreen);
}

/**
 * Resets all canvases except the main canvas.
 */
function resetLayers() {
    dataCanvas.width = dataCanvas.width;
    drawCanvas.width = drawCanvas.width;
    hoverCanvas.width = hoverCanvas.width;
    topCanvas.width = topCanvas.width;
}

/**
 * Create PNG in a new window
 */
function savePNG() {
  var saveImageWin = window.open();
  saveImageWin.location = mainCanvas.toDataURL();
}

/**
 * Get position of an event (usu. mouse event) relative to the top left corner of canvas 
 */
function getPosition(ev) {
	var mainCanvasPosition = mainCanvas.getBoundingClientRect();
	return {
		x: parseInt(ev.pageX - (mainCanvasPosition.left + window.pageXOffset+1), 10),
		y: parseInt(ev.pageY - (mainCanvasPosition.top + window.pageYOffset+1), 10)
	};
}

/**
 * Handle dropped file on canvas.
 */
function dropHandler(ev) {
	var allDrop = ev.dataTransfer.files;
	if (allDrop.length == 1) {
	    fileLoader(allDrop[0]);
	}
}

/**
 * Handle file pasted from clipboard on canvas. Works only in Google Chrome.
 */
function pasteHandler(ev) {
	if(ev.clipboardData !== undefined) {
		var items = ev.clipboardData.items;
		if(items !== undefined) {
			for(var i = 0; i < items.length; i++) {
				if(items[i].type.indexOf("image") !== -1) {
					var blob = items[i].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					fileLoader(blob);
				}
			}
		}
	}
}

/**
 * Loads a file that was dropped or loaded
 */
function fileLoader(fileInfo) {
    if(fileInfo.type.match("image.*")) {// only load images
		var droppedFile = new FileReader();
		droppedFile.onload = function() {
			var imageInfo = droppedFile.result;
			var newimg = document.createElement('img');
			newimg.onload = function() { loadImage(newimg); originalScreen = getCanvasData(); originalImage = newimg; setDefaultState(); };
			newimg.src = imageInfo;
		}
		droppedFile.readAsDataURL(fileInfo);
	}
}

/**
 * Load file when file is chosen
 */
function loadNewFile() {
  var fileLoadElem = document.getElementById('fileLoadBox');
  if (fileLoadElem.files.length == 1) {
    var fileInfo = fileLoadElem.files[0];
    fileLoader(fileInfo);
  }
  closePopup('loadNewImage');
}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var dataToPixelxy;

/**
 * Pixel to real coordinate.
 * @param {Array} pdata Pixel data
 * @param {Int} pn Number of data points.
 * @param {String} ptype Plot type
 */
 function pixelToData(pdata, pn, ptype) {

    if((axesPicked === 1) && (pn >= 1)) {
        var rdata = [];
        
        if (ptype === 'XY') {

		    var x1 = xyAxes[0][0];
		    var y1 = xyAxes[0][1];
		    
		    var x2 = xyAxes[1][0];
		    var y2 = xyAxes[1][1];
		    
		    var x3 = xyAxes[2][0];
		    var y3 = xyAxes[2][1];

		    var x4 = xyAxes[3][0];
		    var y4 = xyAxes[3][1];
		    
		    var xmin = axesAlignmentData[0];
		    var xmax = axesAlignmentData[1];
		    var ymin = axesAlignmentData[2];
		    var ymax = axesAlignmentData[3];
		    
		    // If x-axis is log scale
		    if (axesAlignmentData[4] === true) {
		        xmin = Math.log(xmin)/Math.log(10);
		        xmax = Math.log(xmax)/Math.log(10);
		    }
		    
		    // If y-axis is log scale
		    if (axesAlignmentData[5] === true) {
		        ymin = Math.log(ymin)/Math.log(10);
		        ymax = Math.log(ymax)/Math.log(10);
		    }

		    var xm = xmax - xmin;
		    var ym = ymax - ymin;
		    
		    var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		    var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		    
		    var Lx = xm/d12; 
		    var Ly = ym/d34;
		    
		    var thetax = taninverse(-(y2-y1), (x2-x1));
		    var thetay = taninverse(-(y4-y3), (x4-x3));
		    
		    var theta = thetay-thetax;
		    

		    for(ii = 0; ii<pn; ii++) {
		    
		        var xp = pdata[ii][0];
		        var yp = pdata[ii][1];
		        
		        var dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
		        var thetaP1 = taninverse(-(yp-y1), (xp-x1)) - thetax;
		        
		        var dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);
		        
			var xf = dx*Lx + xmin;

			var dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));				    
			var thetaP3 = thetay - taninverse(-(yp-y3), (xp-x3));

			var dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);
			
			var yf = dy*Ly + ymin;
			
			// if x-axis is log scale
			if (axesAlignmentData[4] === true)
			    xf = Math.pow(10,xf);
			    
			// if y-axis is log scale
			if (axesAlignmentData[5] === true)
			    yf = Math.pow(10,yf);

			rdata[ii] = new Array();
			rdata[ii][0] = xf;
			rdata[ii][1] = yf;
		    }

		} else if (ptype === 'image') {// same as X-Y, but returns int data and doesn't support log scale.

		    var x1 = onScreenDimensions[0];
		    var y1 = onScreenDimensions[1];
		    
		    var x2 = onScreenDimensions[2];
		    var y2 = onScreenDimensions[1];
		    
		    var x3 = onScreenDimensions[0];
		    var y3 = onScreenDimensions[1];

		    var x4 = onScreenDimensions[0];
		    var y4 = onScreenDimensions[3];
		    
		    var xmin = axesAlignmentData[0];
		    var xmax = axesAlignmentData[1];
		    var ymin = axesAlignmentData[2];
		    var ymax = axesAlignmentData[3];
		    
		    var xm = xmax - xmin;
		    var ym = ymax - ymin;

			// Correction factor to account for the fact that the on screen dimensions are for image
			// corners and do not account for image pixels.
			var cfx = 0.5*(x2 - x1)/(xm+1);
			var cfy = 0.5*(y2 - y1)/(ym+1);

			x1 = x1 + cfx;
			x2 = x2 - cfx;
			y1 = y1 + cfy;
			y2 = y2 - cfy;

		    var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		    var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		    
		    var Lx = xm/d12; 
		    var Ly = ym/d34;
		    
		    var thetax = taninverse(-(y2-y1), (x2-x1));
		    var thetay = taninverse(-(y4-y3), (x4-x3));
		    
		    var theta = thetay-thetax;
		    

		    for(ii = 0; ii<pn; ii++) {
		    
		        var xp = pdata[ii][0];
		        var yp = pdata[ii][1];
		        
		        var dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
		        var thetaP1 = taninverse(-(yp-y1), (xp-x1)) - thetax;
		        
		        var dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);
		        
			var xf = dx*Lx + xmin;

			var dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));				    
			var thetaP3 = thetay - taninverse(-(yp-y3), (xp-x3));

			var dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);
			
			var yf = dy*Ly + ymin;
			
		
			rdata[ii] = new Array();
			rdata[ii][0] = Math.round(xf);
			rdata[ii][1] = Math.round(yf);
		    }
		
		} else if (ptype === 'map') {
		    
		    var mx0 = 0.0; my0 = canvasHeight;
		    var mx1 = 0.0; my1 = 0.0;
		    var mx2 = canvasWidth; my2 = 0;
		    var mx3 = canvasWidth; my3 = canvasHeight;
		    
		    var x1 = mx1 - mx0;
		    var y1 = -(my1 - my0);
		    
		    var x3 = mx3 - mx0;
		    var y3 = -(my3 - my0);
		    		
		    var scaleSize = axesAlignmentData[0];
		    
		    var sx1 = xyAxes[0][0];
		    var sy1 = xyAxes[0][1];
		    var sx2 = xyAxes[1][0];
		    var sy2 = xyAxes[1][1];
		    
		    var scaleLength = scaleSize/Math.sqrt((sx1-sx2)*(sx1-sx2) + (sy1-sy2)*(sy1-sy2));
		    		    
		    var xmin = 0;
		    var xmax = canvasWidth*scaleLength;
		    
		    var ymin = 0;
		    var ymax = canvasHeight*scaleLength;

		    var xm = xmax - xmin;
		    var ym = ymax - ymin;
		
		    var det = x1*y3 - y1*x3;

		    var x0 = xmin;
		    var y0 = ymin;

		    for(ii = 0; ii<pn; ii++) {
			var xr = pdata[ii][0] - mx0;
			var yr = - (pdata[ii][1] - my0);
			// find the transform
			var xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
			var yf = (y3*ym*xr - x3*ym*yr)/det + y0;
			
			rdata[ii] = new Array();
			rdata[ii][0] = xf;
			rdata[ii][1] = yf;
		    }
		    
		} else if (ptype === 'polar') {
		    // Center: 0
		    var x0 = parseFloat(xyAxes[0][0]);
		    var y0 = parseFloat(xyAxes[0][1]);
		    
		    // Known Point: 1
		    var x1 = parseFloat(xyAxes[1][0]);
		    var y1 = parseFloat(xyAxes[1][1]);
		    
		    // Known Point: 2
		    var x2 = parseFloat(xyAxes[2][0]);
		    var y2 = parseFloat(xyAxes[2][1]);
		    			    
		    var r1 = parseFloat(axesAlignmentData[0]);
		    var theta1 = parseFloat(axesAlignmentData[1]); 
		    
		    var r2 = parseFloat(axesAlignmentData[2]);
		    var theta2 = parseFloat(axesAlignmentData[3]); 
		    
		    var isDegrees = axesAlignmentData[4];
		    
		    var isClockwise = axesAlignmentData[5];
		    
		    if (isDegrees === true) {// if degrees

		        theta1 = (Math.PI/180.0)*theta1;
    			theta2 = (Math.PI/180.0)*theta2;
		    }
		    			    
		    // Distance between 1 and 0.
		    var dist10 = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)); 
		    
		    // Distance between 2 and 0
		    var dist20 = Math.sqrt((x2-x0)*(x2-x0) + (y2-y0)*(y2-y0)); 
		    
		    // Radial Distance between 1 and 2.
		    var dist12 = dist20 - dist10;
		    
		    var phi0 = taninverse(-(y1-y0),x1-x0);
		    
		    var alpha0 = phi0 - theta1;
		    
		    for(ii = 0; ii<pn; ii++) {
			    var xp = pdata[ii][0];
			    var yp = pdata[ii][1];
			
		        var rp = ((r2-r1)/dist12)*(Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0))-dist10) + r1;
			
			    var thetap = taninverse(-(yp-y0),xp-x0) - alpha0;
			
			    if(isDegrees == true)
			      thetap = 180.0*thetap/Math.PI;
			      
    		    rdata[ii] = new Array();
                rdata[ii][0] = rp;
                rdata[ii][1] = thetap;
			
		    }
		    
		} else if(plotType === 'ternary') {

		    var x0 = xyAxes[0][0];
		    var y0 = xyAxes[0][1];
		    
		    var x1 = xyAxes[1][0];
		    var y1 = xyAxes[1][1];
		    
		    var x2 = xyAxes[2][0];
		    var y2 = xyAxes[2][1];
		    
		    var L = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));
		    
		    var phi0 = taninverse(-(y1-y0),x1-x0);
		    
		    var root3 = Math.sqrt(3);
		    
		    var isRange0to100 = axesAlignmentData[0];
		    var isOrientationNormal = axesAlignmentData[1];
		    		    
		    for(ii = 0; ii<pn; ii++) {

			    var xp = pdata[ii][0];
			    var yp = pdata[ii][1];
			
		        var rp = Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0));
			
			    var thetap = taninverse(-(yp-y0),xp-x0) - phi0;
			
			    var xx = (rp*Math.cos(thetap))/L;
			    var yy = (rp*Math.sin(thetap))/L;
			
			    var ap = 1.0 - xx - yy/root3;
			    var bp = xx - yy/root3;
			    var cp = 2.0*yy/root3;
			
			    if(isOrientationNormal == false) {
			      // reverse axes orientation
			      var bpt = bp;
			      bp = ap;
			      ap = cp;
			      cp = bpt;
			      				  
			    }
			
			    if (isRange0to100 == true) {
			      ap = ap*100; bp = bp*100; cp = cp*100;
			    }
    
    			rdata[ii] = new Array();
                rdata[ii][0] = ap;
                rdata[ii][1] = bp;
                rdata[ii][2] = cp;

		    }
		    
		}
		
		return rdata;

    }
    
    return 0;
 }


 function dataToPixel(xp, yp, ptype) {

	dataToPixelxy = [];

	if (ptype === 'XY') {

		var x1 = xyAxes[0][0];
		var y1 = xyAxes[0][1];
		
		var x2 = xyAxes[1][0];
		var y2 = xyAxes[1][1];
		
		var x3 = xyAxes[2][0];
		var y3 = xyAxes[2][1];

		var x4 = xyAxes[3][0];
		var y4 = xyAxes[3][1];
		
		var xmin = axesAlignmentData[0];
		var xmax = axesAlignmentData[1];
		var ymin = axesAlignmentData[2];
		var ymax = axesAlignmentData[3];
		
		// If x-axis is log scale
		if (axesAlignmentData[4] === true) {
			xmin = Math.log(xmin)/Math.log(10);
			xmax = Math.log(xmax)/Math.log(10);
		}
		
		// If y-axis is log scale
		if (axesAlignmentData[5] === true) {
			ymin = Math.log(ymin)/Math.log(10);
			ymax = Math.log(ymax)/Math.log(10);
		}

		// Get intersection point in pixels
		var xydenom = (x1 - x2)*(y3-y4) - (y1-y2)*(x3 - x4);
		var xx_pix = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/xydenom;
		var yy_pix = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/xydenom;

		// Get intersection point in actual units
		var tempPix = [];
		tempPix[0] = new Array();
		tempPix[0][0] = xx_pix;
		tempPix[0][1] = yy_pix;
		var rtnPix = pixelToData(tempPix, 1, 'XY');
		var xx = rtnPix[0][0];
		var yx = rtnPix[0][1];

		var xm = xmax - xmin;
		var ym = ymax - ymin;
		
		var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		
		var Lx = xm/d12; 
		var Ly = ym/d34;
		
		var thetax = taninverse(-(y2-y1), (x2-x1));
		var thetay = taninverse(-(y4-y3), (x4-x3));
		
		var theta = thetay-thetax;


		var xf = (xp - xmin)*Math.cos(thetax)/Lx + (yp - yx)*Math.cos(thetay)/Ly + x1;
		var yf = y3 - (xp - xx)*Math.sin(thetax)/Lx - (yp - ymin)*Math.sin(thetay)/Ly;

		dataToPixelxy[0] = xf;
		dataToPixelxy[1] = yf;

	}


	return 0;
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Global variables to store generated data. Global stuff will be removed only in 3.0 :( */

var rawCSVData,
	displayData;

/*
 * Generate CSV.
 */
 function generateCSV() {

    if((axesPicked === 1) && (pointsPicked >= 1)) {
        showPopup('csvWindow');
			
		rawCSVData = pixelToData(xyData, pointsPicked, plotType);

		var dataSortOrder = document.getElementById('dataSortOrder'),
			dataSortOption = document.getElementById('dataSortOption'),
			variableNames = document.getElementById('dataVariables');

		dataSortOption.innerHTML = '<option value="raw">Raw Output</option>';

		if( (plotType === 'XY') || (plotType === 'map') || (plotType === 'image')) {

			dataSortOption.innerHTML += '<option value="0">x</option>';
			dataSortOption.innerHTML += '<option value="1">y</option>';
			variableNames.innerHTML = 'x, y';

		} else if ( (plotType === 'ternary') ) {

			dataSortOption.innerHTML += '<option value="0">a</option>';
			dataSortOption.innerHTML += '<option value="1">b</option>';
			dataSortOption.innerHTML += '<option value="2">c</option>';
			variableNames.innerHTML = 'a, b, c';

		} else if ( (plotType === 'polar') ) {

			dataSortOption.innerHTML += '<option value="0">r</option>';
			dataSortOption.innerHTML += '<option value="1">Θ</option>';
			variableNames.innerHTML = 'r, Θ';
		}

		dataSortOption.innerHTML += '<option value="NearestNeighbor">Nearest Neighbor</option>';

		updateCSVSortingControls();

		var dateFormattingEl = document.getElementById('csvDateFormatting');
		if(plotType === 'XY') {
			if((axesAlignmentData[6] === true || axesAlignmentData[7] === true)) {
				dateFormattingEl.style.display = 'inline-block';

				var xDateFormattingEl = document.getElementById('csvDateFormattingX');
				var yDateFormattingEl = document.getElementById('csvDateFormattingY');
				var xDateFormatEl = document.getElementById('xDateFormat');
				var yDateFormatEl = document.getElementById('yDateFormat');

				if(axesAlignmentData[6]) {
					xDateFormattingEl.style.display = 'inline-block';
					xDateFormatEl.value = axesAlignmentData[8];
				} else {	
					xDateFormattingEl.style.display = 'none';
				}

				if(axesAlignmentData[7]) {
					yDateFormattingEl.style.display = 'inline-block';
					yDateFormat.value = axesAlignmentData[9];
				} else {	
					yDateFormattingEl.style.display = 'none';
				}
			} else {
				dateFormattingEl.style.display = 'none';
			}
		} else {
			dateFormattingEl.style.display = 'none';
		}
		
		generateCSVTextFromData(rawCSVData);
    }
 }

 /**
  * Select all data in text area.
  */
 function selectAllCSVData() {
 	var tarea = document.getElementById('tarea');
	tarea.focus();
	tarea.select();
 }

/**
 * Update CSV sorting controls.
 */
function updateCSVSortingControls() {
	var dataSortOption = document.getElementById('dataSortOption'),
		dataSortOrder = document.getElementById('dataSortOrder');
	
	if(dataSortOption.value === 'NearestNeighbor' || dataSortOption.value === 'raw') {
		dataSortOrder.setAttribute('disabled', true);	
	} else {
		dataSortOrder.removeAttribute('disabled');
	}

	reSortCSV();
}

/**
 * Dump data to the CSV text area
 */
function generateCSVTextFromData(retData) {

	var tarea = document.getElementById('tarea');
		tarea.value = '';

	if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			tarea.value = tarea.value + formatVariableInCSV(retData[ii][0], 'X') + ',' + formatVariableInCSV(retData[ii][1], 'Y') + '\n';
		}
	} else if((plotType === 'ternary')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			tarea.value = tarea.value + retData[ii][0] + ',' + retData[ii][1] + ',' + retData[ii][2] + '\n';
		}
	}

	displayData = retData;
}

/**
 * Format variable 
 */
function formatVariableInCSV(val, variableType) {
	if(plotType === 'XY') {
		if(variableType === 'X' && axesAlignmentData[6]) {
			var xDateFormatEl = document.getElementById('xDateFormat');
			return dateConverter.formatDate(dateConverter.fromJD(val), xDateFormatEl.value);			
		}
		if(variableType === 'Y' && axesAlignmentData[7]) {
			var yDateFormatEl = document.getElementById('yDateFormat');
			return dateConverter.formatDate(dateConverter.fromJD(val), yDateFormatEl.value);
		}
	}
	return val;
}

/**
 * Resort data
 */
function reSortCSV() {
	var dataSortOption = document.getElementById('dataSortOption'),
		dataSortOrder = document.getElementById('dataSortOrder'),
		
		isAscending = dataSortOrder.value === 'ascending',
		isRaw = dataSortOption.value == 'raw',
		isConnectivity = dataSortOption.value === 'NearestNeighbor',
		dataIndex,
		sortedData = rawCSVData.slice(0),
		plotDim = (plotType === 'ternary') ? 3 : 2;

	if(isRaw) {
		generateCSVTextFromData(sortedData);
		return;
	}

	if(!isConnectivity) {
		dataIndex = parseInt(dataSortOption.value, 10);
		if((dataIndex < 0) || (dataIndex >= 3)) return;

		sortedData.sort(function(a,b) {
			if(a[dataIndex] > b[dataIndex]) {
				return isAscending ? 1 : -1;
			} else if (a[dataIndex] < b[dataIndex]) {
				return isAscending ? -1 : 1;
			}
			return 0;			
		});

		generateCSVTextFromData(sortedData);
		return;
	}

	if(isConnectivity) {
		var mindist, compdist, minindex,
			swapVariable = [1.0, 1.0, 1.0];

		for(var ii = 0; ii < pointsPicked-1; ii++) {
			minindex = -1;

			for(var jj = ii + 1; jj < pointsPicked; jj++) {
				compdist = (sortedData[ii][0] - sortedData[jj][0])*(sortedData[ii][0] - sortedData[jj][0]) + 
							(sortedData[ii][1] - sortedData[jj][1])*(sortedData[ii][1] - sortedData[jj][1]);
				if(plotDim === 3) {
					compdist += (sortedData[ii][2] - sortedData[jj][2])*(sortedData[ii][2] - sortedData[jj][2]);
				}
				if((compdist < mindist) || (minindex === -1)) {
					mindist = compdist;
					minindex = jj;
				}
			}

			swapVariable[0] = sortedData[minindex][0];
			sortedData[minindex][0] = sortedData[ii+1][0];
			sortedData[ii+1][0] = swapVariable[0];

			swapVariable[1] = sortedData[minindex][1];
			sortedData[minindex][1] = sortedData[ii+1][1];
			sortedData[ii+1][1] = swapVariable[1];

			if(plotDim === 3) {
				swapVariable[2] = sortedData[minindex][2];
				sortedData[minindex][2] = sortedData[ii+1][2];
				sortedData[ii+1][2] = swapVariable[2];
			}
		}

		generateCSVTextFromData(sortedData);
		return;
	}

}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Parse dates and convert back and forth to Julian days */

var dateConverter = {
	
	parse: function(input) {
				if(input == null) {
					return null;
				}

				if(input.indexOf("/") === -1) {
					return null;
				}

				return this.toJD(input);
			},

	// Convert to Julian Date
	toJD: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					day,
					tempDate,
					rtnValue;

				if(dateParts.length <= 0 || dateParts.length > 3) {
					return null;
				}

				year = parseInt(dateParts[0], 10);

				month = parseInt(dateParts[1] === undefined ? 0 : dateParts[1], 10);

				date = parseInt(dateParts[2] === undefined ? 1 : dateParts[2], 10);

				if(isNaN(year) || isNaN(month) || isNaN(date)) {
					return null;
				}

				if(month > 12 || month < 1) {
					return null;
				}

				if(date > 31 || date < 1) {
					return null;
				}

				// Temporary till I figure out julian dates:
				tempDate = new Date();
				tempDate.setUTCFullYear(year);
				tempDate.setUTCMonth(month-1);
				tempDate.setUTCDate(date);
				rtnValue = parseFloat(Date.parse(tempDate));
				if(!isNaN(rtnValue)) {
					return rtnValue;
				}
				return null;
			},

	// Convert back from Julian Date
	fromJD: function(jd) {

				// Temporary till I figure out julian dates:
				jd = parseFloat(jd);
				var msInDay = 24*60*60*1000,
					roundedDate = parseInt(Math.round(jd/msInDay)*msInDay,10),
					tempDate = new Date(roundedDate);

				return tempDate;
			},

	formatDate: function(dateObject, formatString) {
				var longMonths = [
									"January", 
									"February", 
									"March", 
									"April", 
									"May", 
									"June", 
									"July", 
									"August", 
									"September",
									"October",
									"November",
									"December"
								],
					shortMonths = [
									"Jan",
									"Feb",
									"Mar",
									"Apr",
									"May",
									"Jun",
									"Jul",
									"Aug",
									"Sep",
									"Oct",
									"Nov",
									"Dec"
								];
				
				var outputString = formatString.toLowerCase();

				outputString = outputString.replace("yyyy", dateObject.getUTCFullYear());

				var twoDigitYear = dateObject.getUTCFullYear()%100;
				twoDigitYear = twoDigitYear < 10 ? '0' + twoDigitYear : twoDigitYear;

				outputString = outputString.replace("yy", twoDigitYear);

				outputString = outputString.replace("mmmm", longMonths[dateObject.getUTCMonth()]);
				outputString = outputString.replace("mmm", shortMonths[dateObject.getUTCMonth()]);
				outputString = outputString.replace("mm", (dateObject.getUTCMonth()+1));
				
				outputString = outputString.replace("dd", dateObject.getUTCDate());
				
				return outputString;
			},

	getFormatString: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					date,
					formatString = 'yyyy/mm/dd';
				
				if(dateParts.length >= 1) {
					formatString = 'yyyy';
				}

				if(dateParts.length >= 2) {
					formatString += '/mm';
				}

				if(dateParts.length === 3) {
					formatString += '/dd';
				}

				return formatString;
			}
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var cropStatus = 0;
var cropCoordinates = [0,0,0,0];

/**
 * Flip picture horizontally
 */
function hflip() {
	processingNote(true);

	var iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);

	for (var rowi = 0; rowi < currentImageHeight; rowi++) {
		for(var coli = 0; coli < currentImageWidth/2; coli++) {
			var index = rowi*4*currentImageWidth + coli*4;
			var mindex = (rowi+1)*4*currentImageWidth - (coli+1)*4;
			for(var p = 0; p < 4; p++) {
				var tt = iData.data[index + p];
				iData.data[index + p] = iData.data[mindex + p];
				iData.data[mindex + p] = tt;
			}
		}
	}
	
	ctx.putImageData(iData,cx0,cy0);
	saveCanvasImage();

	processingNote(false);
}

/**
 * Flip picture vertically
 */
function vflip() {

	processingNote(true);

	var iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);

	for (var coli = 0; coli < currentImageWidth; coli++) {

		for(var rowi = 0; rowi < currentImageHeight/2; rowi++) {

			var index = rowi*4*currentImageWidth + coli*4;
			var mindex = (currentImageHeight - (rowi+2))*4*currentImageWidth + coli*4;
			for(var p = 0; p < 4; p++) {

				var tt = iData.data[index + p];
				iData.data[index + p] = iData.data[mindex + p];
				iData.data[mindex + p] = tt;
			}
		}
	}
	
	ctx.putImageData(iData,cx0,cy0);
	saveCanvasImage();

	processingNote(false);
}

/**
 * Enable crop mode
 */
function cropPlot() {// crop image

	redrawCanvas();
	removeAllMouseEvents();
	addMouseEvent('mousedown',cropMousedown,true);
	addMouseEvent('mouseup',cropMouseup,true);
	addMouseEvent('mousemove',cropMousemove,true);
}

/**
 * Crop mode - mouse down
 */
function cropMousedown(ev) {
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

	cropCoordinates[0] = xi;
	cropCoordinates[1] = yi;
	cropStatus = 1;
}

/**
 * Crop mode - mouse up
 */
function cropMouseup(ev) {

	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      cropCoordinates[2] = xi;
      cropCoordinates[3] = yi;
      cropStatus = 0;
      
      hoverCanvas.width = hoverCanvas.width;
            
      cropWidth = cropCoordinates[2]-cropCoordinates[0];
      cropHeight = cropCoordinates[3]-cropCoordinates[1];
      if ((cropWidth > 0) && (cropHeight > 0)) {

		var tcan = document.createElement('canvas');
		var tcontext = tcan.getContext('2d');
		
		tcan.width = cropWidth;
		tcan.height = cropHeight;
		
		var cropImageData = ctx.getImageData(cropCoordinates[0],cropCoordinates[1],cropWidth,cropHeight);  
				
		tcontext.putImageData(cropImageData,0,0);
		cropSrc = tcan.toDataURL();
		cropImg = new Image();
		cropImg.src = cropSrc;
		cropImg.onload = function() { loadImage(cropImg); }
				
      }
      
}

/**
 * Crop mode - mouse move
 */
function cropMousemove(ev) {

	
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      // this paints a rectangle as the mouse moves
      if(cropStatus == 1) {
        hoverCanvas.width = hoverCanvas.width;
		hoverCtx.strokeStyle = "rgb(0,0,0)";
		hoverCtx.strokeRect(cropCoordinates[0], cropCoordinates[1], xi-cropCoordinates[0], yi-cropCoordinates[1]);
      }
}

/**
 * Restore to original image
 */
function restoreOriginalImage() {
	loadImage(originalImage);
}

/**
 * Rotate image by a certain specified angle. Not implemented yet.
 */
function rotateCanvas() {}// Rotate by a specified amount.

/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* This file contains image processing functions */

/** 
 * Finds differences between two sets of ImageData and returns a difference matrix. 'true' where unmatched, 'false' where pixels match.
 * @params {ImageData} d1 first ImageData
 * @params {ImageData} d2 second ImageData
 */
function findDifference(d1,d2) {
    var dw = canvasWidth;
    var dh = canvasHeight;
    var diff = new Array();
    
    for (var rowi = 0; rowi < dh; rowi++) {
		diff[rowi] = new Array();
		for(var coli = 0; coli < dw; coli++) {
			var index = rowi*4*dw + coli*4;
			diff[rowi][coli] = false;
			
			for(var p = 0; p < 4; p++) {
				if (d1.data[index+p] != d2.data[index+p]) {
					diff[rowi][coli] = true;
				}
			}
	    
		}
    }
    
    return diff;
}

/**
 * Copies pixels based on the difference matrix. 
 */
function copyUsingDifference(copyTo, copyFrom, diff) {
    var dw = canvasWidth;
    var dh = canvasHeight;
    
    for (var rowi = 0; rowi < dh; rowi++) {
		for(var coli = 0; coli < dw; coli++) {
			var index = rowi*4*dw + coli*4;
				
			if (diff[rowi][coli] === true)
			for(var p = 0; p < 4; p++)
				copyTo.data[index+p] = copyFrom.data[index+p];
				   
		}
    }
    
    return copyTo;
}

/** 
 * create BW image based on the colors specified.
 */
function colorSelect(imgd, mode, colorRGB, tol) {
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {
		seldata[rowi] = new Array();
		for(var coli=0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			ir = imgd.data[index];
			ig = imgd.data[index+1];
			ib = imgd.data[index+2];
			
			dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib+bluev)*(ib+bluev));
			
			seldata[rowi][coli] = false;
			
			if (mode === 'fg') {
				if (dist <= tol) {
					seldata[rowi][coli] = true;
				}

			} else if (mode === 'bg') {

				if (dist > tol) {
					seldata[rowi][coli] = true;
				}
			}
		}
    }
    
    return seldata;
}

/**
 * create BW image based on the colors but only in valid region of difference matrix.
 */
function colorSelectDiff(imgd, mode, colorRGB, tol, diff) {

    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {
		seldata[rowi] = new Array();
		for(var coli=0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			var ir = imgd.data[index];
			var ig = imgd.data[index+1];
			var ib = imgd.data[index+2];
			
			var dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev));
			
			seldata[rowi][coli] = false;
			
			if ((mode === 'fg') && (diff[rowi][coli] === 1)) {
				if (dist <= tol) {
					seldata[rowi][coli] = true;
				}
			} else if ((mode === 'bg') && (diff[rowi][coli] === 1)) {
				if (dist > tol) {
					seldata[rowi][coli] = true;
				}
			}
		}
    }
    
    return seldata;
}

/**
 * Select from marked region of interest based on color.
 */
function selectFromMarkedRegion(mode, colorRGB, tol) {

    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var markedRegion = dataCtx.getImageData(0,0,canvasWidth,canvasHeight);
    var imgd = getCanvasData();
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {

	    seldata[rowi] = new Array();
	    for(var coli=0; coli < dw; coli++) {
	        index = rowi*4*dw + coli*4;
	        
	        // marked region
	        var mr = markedRegion.data[index];
	        var mg = markedRegion.data[index+1];
	        var mb = markedRegion.data[index+2];
	        
	        // plot data
	        var ir = imgd.data[index];
	        var ig = imgd.data[index+1];
	        var ib = imgd.data[index+2];
	        
       	    seldata[rowi][coli] = false;
       	    
       	    if ((mr === 255) && (mg ===  255) && (mb === 0)) {// yellow marked region

       	        var dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev));
       	        
       	        if ((mode === 'fg') && (dist <= tol))
       	            seldata[rowi][coli] = true;
       	        else if ((mode === 'bg') && (dist > tol))
       	            seldata[rowi][coli] = true;
       	    }
	    }
	 }
	 
	 return seldata;
}

/**
 * Populate an ImageData array based on a binary data matrix.
 */
function binaryToImageData(bwdata,imgd) {
    dw = canvasWidth;
    dh = canvasHeight;
         
    for(var rowi = 0; rowi < dh; rowi++) {
		for(var coli = 0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			if (bwdata[rowi][coli] === false) {
				imgd.data[index] = 255; imgd.data[index+1] = 255; imgd.data[index+2] = 255; imgd.data[index+3] = 255;
			} else {
				imgd.data[index] = 0; imgd.data[index+1] = 0; imgd.data[index+2] = 0; imgd.data[index+3] = 255;
			}
		}
	}
    
    return imgd;
}


function getImageDataBasedOnSelection(imgdout, mode, colorRGB, tol) {
	var dw = canvasWidth,
		dh = canvasHeight,
		rowi,
		coli,
		index,
		dist,
		
		redv = colorRGB[0],
		greenv = colorRGB[1],
		bluev = colorRGB[2],
		
		markedRegion = dataCtx.getImageData(0,0,canvasWidth,canvasHeight),
		
		imgd = currentScreen,
		
		mr, mg, mb,
		ir, ig, ib,
		markPixelWhite;

	for(rowi = 0; rowi < dh; rowi++) {
		for(coli = 0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;

	        // marked region RGB
	        mr = markedRegion.data[index];
	        mg = markedRegion.data[index+1];
	        mb = markedRegion.data[index+2];
	        
	        // plot data
	        ir = imgd.data[index];
	        ig = imgd.data[index+1];
			ib = imgd.data[index+2];

			// set default to white
			markPixelWhite = true;
       	    
       	    if ((mr === 255) && (mg ===  255) && (mb === 0)) {// yellow marked region

       	        dist = (ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev);
       	        
       	        if ((mode === 'fg') && (dist <= tol*tol)) {
					markPixelWhite = false;

				} else if ((mode === 'bg') && (dist > tol*tol)) {
					markPixelWhite = false;
				}
			}

			if(markPixelWhite) {

				imgdout.data[index] = 255;
				imgdout.data[index+1] = 255;
				imgdout.data[index+2] = 255;
				imgdout.data[index+3] = 255;

			} else {
				
				imgdout.data[index] = 0;
				imgdout.data[index+1] = 0;
				imgdout.data[index+2] = 0;
				imgdout.data[index+3] = 255;
			}
		}
	}

	return imgdout;
}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* Parse user provided expressions, dates etc. */

var InputParser = function () {
	var self = this;

	self.parse = function(input) {
		
		self.isValid = false;
		self.isDate = false;

		if (input == null) {
			return null;
		}

		input = input.trim();

		if (input.indexOf("^") !== -1) {
			return null;
		}

		var parsedDate = dateConverter.parse(input);
		if(parsedDate !== null) {
			self.isValid = true;
			self.isDate = true;
			return parsedDate;
		}

		var parsedFloat = parseFloat(input);
		if(!isNaN(parsedFloat)) {
			self.isValid = true;
			return parsedFloat;
		}

		return null;
	};

	self.isValid = false;

	self.isDate = false;
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/**
 * This is the entry point and is executed when the page is loaded.
 */

function init() {// This is run when the page loads.

	checkBrowser();
	
	mainCanvas = document.getElementById('mainCanvas');
	dataCanvas = document.getElementById('dataCanvas');
	drawCanvas = document.getElementById('drawCanvas');
	hoverCanvas = document.getElementById('hoverCanvas');
	topCanvas = document.getElementById('topCanvas');
	
	var canvasDiv = document.getElementById('canvasDiv');
		
	zCanvas = document.getElementById('zoomCanvas');
	zctx = zCanvas.getContext('2d');

	tempCanvas = document.createElement('canvas');
	tctx = tempCanvas.getContext('2d');
	tempCanvas.width = zoom_dx;
	tempCanvas.height = zoom_dy;

	// Position to paste new plots at
	cx0 = zoom_dx/2;
	cy0 = zoom_dy/2;

	// Set canvas dimensions
	canvasWidth = parseFloat(canvasDiv.offsetWidth);
	canvasHeight = parseFloat(canvasDiv.offsetHeight);
	
	// resize canvas.
	mainCanvas.height = canvasHeight;
	mainCanvas.width = canvasWidth;
	
	dataCanvas.height = canvasHeight;
	dataCanvas.width = canvasWidth;

	drawCanvas.height = canvasHeight;
	drawCanvas.width = canvasWidth;
	
	hoverCanvas.height = canvasHeight;
	hoverCanvas.width = canvasWidth;

	topCanvas.height = canvasHeight;
	topCanvas.width = canvasWidth;


	// Needed to fix the zoom problem.
	cheight = canvasHeight - zoom_dy;
	cwidth = canvasWidth - zoom_dx;

	caspectratio = cheight/cwidth;

	ctx = mainCanvas.getContext('2d');
	dataCtx = dataCanvas.getContext('2d');
	drawCtx = drawCanvas.getContext('2d');
	hoverCtx = hoverCanvas.getContext('2d');
	topCtx = topCanvas.getContext('2d');
	
	// get the coordinates panel
	mPosn = document.getElementById('mousePosition');

	// Set canvas default state
	img = document.createElement('img');
	img.onload = function() { loadImage(img); originalImage = img; };
	img.src = "start.png";
	
	// testing area for autodetection
	testImgCanvas = document.getElementById('testImg');
	testImgCanvas.width = canvasWidth/2;
	testImgCanvas.height = canvasHeight/2;
	testImgContext = testImgCanvas.getContext('2d');
		
	// specify mouseover function
	//canvas.addEventListener('click',clickHandler,false);
	topCanvas.addEventListener('mousemove',updateZoom,false);
	
	// Add support for extended crosshair
    document.body.addEventListener('keydown', toggleCrosshair, false);

	// Image dropping capabilities
	topCanvas.addEventListener('dragover',function(event) {event.preventDefault();}, true);
	topCanvas.addEventListener("drop",function(event) {event.preventDefault(); dropHandler(event);}, true);

	// Paste image from clipboard
	window.addEventListener('paste', function(event) {pasteHandler(event);}, false);
	
	// Set defaults everywhere.
	setDefaultState();
	
	initZoom();
	
	originalScreen = getCanvasData();
	activeScreen = originalScreen;
	
	displayParameters();
}


/**
 * Reset canvas and zoom window to initial state.
 */
function setDefaultState() {
	axesPicked = 0;
	pointsPicked = 0;
	xyData = [];
	axesAlignmentData = [];
	clearPoints();
	clearSidebar();
}

function checkBrowser() {
  if(!window.FileReader) {
    alert('\tWARNING!\nYou are using an unsupported browser. Please use Google Chrome 6+ or Firefox 3.6+.\n Sorry for the inconvenience.');
  }
}


/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/


/* Selected Data Variables */
var xyData = new Array(); // Raw data
var pointsPicked = 0; // number of data points picked.

/**
 * Called when the 'acquire data' button is pressed. 
 */
function acquireData() {
	if(axesPicked === 0) {
		showPopup('alignAxes');
	} else {
		showSidebar('manualMode');
		removeAllMouseEvents();
	}
}

/**
 * Initiate Manual data acquisition. Enables data capture on the canvas.
 */ 
function pickPoints() {// select data points.

	if (axesPicked === 0) {
		alert('Define the axes first!');
	} else {
		removeAllMouseEvents();
		addMouseEvent('click',clickPoints,true);
		//pointsPicked = 0;
		//xyData = [];
		pointsStatus(pointsPicked);
		//redrawCanvas();
		showSidebar('manualMode');
	}
}

/**
 * Triggered by clicking on canvas, stores position in xyData global array.
 */
function clickPoints(ev) {
	var posn = getPosition(ev);
	var xi = posn.x;
	var yi = posn.y;

	xyData[pointsPicked] = new Array();
	xyData[pointsPicked][0] = parseFloat(xi);
	xyData[pointsPicked][1] = parseFloat(yi);
	pointsPicked = pointsPicked + 1;	

	dataCtx.beginPath();
	dataCtx.fillStyle = "rgb(200,0,0)";
	dataCtx.arc(xi,yi,3,0,2.0*Math.PI,true);
	dataCtx.fill();

	pointsStatus(pointsPicked);
	updateZoom(ev);

}

/**
 * Called when 'clear all' is hit. Clears data collected, redraws canvas. 
 */
function clearPoints() {// clear all markings.

	pointsPicked = 0;
	pointsStatus(pointsPicked);
    resetLayers();
	
	removeAllMouseEvents();
}

/**
 * Deletes the last point picked.
 */
function undoPointSelection() {
	if (pointsPicked >= 1) {
		pointsPicked = pointsPicked - 1;
		pointsStatus(pointsPicked);
		
        resetLayers();

		for(ii = 0; ii < pointsPicked; ii++) {
			xi = xyData[ii][0];	
			yi = xyData[ii][1];

			dataCtx.beginPath();
			dataCtx.fillStyle = "rgb(200,0,0)";
			dataCtx.arc(xi,yi,3,0,2.0*Math.PI,true);
			dataCtx.fill();
		}

	}
}

/**
 * Updates the displayed number of points on the sidebar.
 */
function pointsStatus(pn) {// displays the number of points picked.

	var points = document.getElementById('pointsStatus');
	var autoPoints = document.getElementById('autoPointsStatus');
	points.innerHTML = pn;
	autoPoints.innerHTML = pn;
}

/**
 * Delete specific point close to clicked position.
 */
function deleteSpecificPoint() {

	removeAllMouseEvents();
	addMouseEvent('click',deleteSpecificPointHandler,true);
}

/**
 * Handle clicks when in specific point deletion mode
 */
function deleteSpecificPointHandler(ev) {

	var posn = getPosition(ev);
	var xi = parseFloat(posn.x);
	var yi = parseFloat(posn.y);
	
	var minDistance = 10.0;
	var foundPoint = 0;
	var foundIndex = 0;

	for (var ii = 0; ii < pointsPicked; ii ++) {
		var xd = parseFloat(xyData[ii][0]);
		var yd = parseFloat(xyData[ii][1]);
		var distance = Math.sqrt((xd-xi)*(xd-xi) + (yd-yi)*(yd-yi));

		if (distance < minDistance) {
			foundPoint = 1;
			foundIndex = ii;
			minDistance = distance;
		}
	}

	if (foundPoint === 1) {
		xyData.splice(foundIndex,1);

		pointsPicked = pointsPicked - 1;
		pointsStatus(pointsPicked);
			
        resetLayers();

		for(ii = 0; ii < pointsPicked; ii++) {
			xp = xyData[ii][0];	
			yp = xyData[ii][1];
			dataCtx.beginPath();
			dataCtx.fillStyle = "rgb(200,0,0)";
			dataCtx.arc(xp,yp,3,0,2.0*Math.PI,true);
			dataCtx.fill();
		}
	}

	updateZoom(ev);

}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/


/** 
 * Calculate inverse tan with range between 0, 2*pi.
 */
function taninverse(y,x) {
  var inv_ans;
  if (y>0) // I & II
    inv_ans = Math.atan2(y,x);
  else if (y<=0) // III & IV
    inv_ans = Math.atan2(y,x) + 2*Math.PI;
  
  if(inv_ans >= 2*Math.PI)
    inv_ans = 0.0;
  return inv_ans;
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/


/**
 * List of mouse event types.
 */
var mouseEventType = new Array();

/**
 * List of mouse event functions.
 */
var mouseEventFunction = new Array();

/**
 * To capture or not.
 */
var mouseEventCapture = new Array();

/**
 * Total number of active mouse events.
 */
var mouseEvents = 0;


/**
 * Add a mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function addMouseEvent(mouseEv, functionName, tf) {
	var eventExists = false;
	for(var ii = 0; ii < mouseEvents; ii++)	{
		if ((mouseEv === mouseEventType[ii]) && (functionName === mouseEventFunction[ii]) && (tf === mouseEventCapture[ii]))
			eventExists = true;
	}

	if(eventExists === false) {
		topCanvas.addEventListener(mouseEv, functionName, tf);
		mouseEventType[mouseEvents] = mouseEv;
		mouseEventFunction[mouseEvents] = functionName;
		mouseEventCapture[mouseEvents] = tf;
		mouseEvents = mouseEvents + 1;
	}
}

/**
 * Clear the entire list of active mouse events.
 */
function removeAllMouseEvents() {

	if(mouseEvents > 0) {

		for (var kk = 0; kk < mouseEvents; kk++) {
			topCanvas.removeEventListener(mouseEventType[kk],mouseEventFunction[kk],mouseEventCapture[kk]);
		}
		mouseEvents = 0;
		mouseEventType = [];
		moueEventFunction = [];
		mouseEventCapture = [];
	}
	clearToolbar();
}

/**
 * Remove a particular mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function removeMouseEvent(mouseEv, functionName, tf) {

	var eventExists = false;
	var eventIndex = 0;

	for(var ii = 0; ii < mouseEvents; ii++) {
		if ((mouseEv === mouseEventType[ii]) && (functionName === mouseEventFunction[ii]) && (tf === mouseEventCapture[ii])) {
			eventExists = true;
			eventIndex = ii;
		}
	}

	if(eventExists === true) {
		topCanvas.removeEventListener(mouseEv, functionName, tf);
		mouseEvents = mouseEvents - 1;
		mouseEventType.splice(eventIndex,1);
		mouseEventFunction.splice(eventIndex,1);
		mouseEventCapture.splice(eventIndex,1);
	}
}


/*
    WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

    Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/* This file contains code to export CSV data to an external software called Plotly (http://plot.ly) */


/* Dump the contents of the global variable displayData into Plotly
*/
function exportToPlotly() {

	if(pointsPicked === 0) return;

	var formContainer = document.createElement('div'),
		formElement = document.createElement('form'),
		formData = document.createElement('input');
	
	
	formElement.setAttribute('method', 'post');
	formElement.setAttribute('action', 'https://plot.ly/external');
	formElement.setAttribute('target', '_blank');
	
	formData.setAttribute('type', "text");
	formData.setAttribute('name', "data");

	formElement.appendChild(formData);
	formContainer.appendChild(formElement);
	document.body.appendChild(formContainer);
	formContainer.style.display = 'none';


	var xDisplayData = [],
		yDisplayData = [],
		zDisplayData = [],
		jsonData = { data: [] };
	
	if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			xDisplayData[ii] = formatVariableInCSV(displayData[ii][0], 'X');
			yDisplayData[ii] = formatVariableInCSV(displayData[ii][1], 'Y');
		}
		jsonData.data[0] = {x: xDisplayData, y: yDisplayData};

	} else if((plotType === 'ternary')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			xDisplayData[ii] = displayData[ii][0];
			yDisplayData[ii] = displayData[ii][1];
			zDisplayData[ii] = displayData[ii][2];
		}
		jsonData.data[0] = {x: xDisplayData, y: yDisplayData, z: zDisplayData};
	}

	formData.setAttribute('value', JSON.stringify(jsonData));

	formElement.submit();

	document.body.removeChild(formContainer);
}

function formatVariableForPlotly(val, variableType) {
	var formatString = 'mm-dd-yyyy';

	if(plotType === 'XY') {
		if(variableType === 'X' && axesAlignmentData[6]) {
			return dateConverter.formatDate(dateConverter.fromJD(val), formatString);			
		}
		if(variableType === 'Y' && axesAlignmentData[7]) {
			return dateConverter.formatDate(dateConverter.fromJD(val), formatString);
		}
	}
	return val;
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

/**
 * Display a popup window.
 * @param {String} popupid ID of the DIV element containing the popup block.
 */
function showPopup(popupid) {
	// Dim lights :)
	var shadowDiv = document.getElementById('shadow');
	shadowDiv.style.visibility = "visible";

	var pWindow = document.getElementById(popupid);
	var screenWidth = parseInt(window.innerWidth);
	var screenHeight = parseInt(window.innerHeight);
	var pWidth = parseInt(pWindow.offsetWidth);
	var pHeight = parseInt(pWindow.offsetHeight);
	var xPos = (screenWidth - pWidth)/2;
	var yPos = (screenHeight - pHeight)/2;
	pWindow.style.left = xPos + 'px';
	pWindow.style.top = yPos + 'px';
	pWindow.style.visibility = "visible";
}

/**
 * Hide a popup window.
 * @param {String} popupid ID of the DIV element containing the popup block.
 */
function closePopup(popupid) {
	var shadowDiv = document.getElementById('shadow');
	shadowDiv.style.visibility = "hidden";

	var pWindow = document.getElementById(popupid);
	pWindow.style.visibility = "hidden";

}

/**
 * Show a 'processing' note on the top right corner.
 * @param {boolean} pmode set to 'true' to diplay, 'false' to hide.
 */
function processingNote(pmode) {
	var pelem = document.getElementById('wait');

	if(pmode === true) {
		pelem.style.visibility = 'visible';
	} else {
		pelem.style.visibility = 'hidden';
	}

}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/


var sidebarList = ['editImageToolbar','manualMode','autoMode']; 

/**
 * Show a specific sidebar
 * @param {String} sbid Sidebar ID.
 */
function showSidebar(sbid) {// Shows a specific sidebar

	clearSidebar();
	var sb = document.getElementById(sbid);
	sb.style.visibility = "visible";
}

/**
 * Hide all sidebars.
 */
function clearSidebar() {// Clears all open sidebars

      for (ii = 0; ii < sidebarList.length; ii ++) {
		  var sbv = document.getElementById(sidebarList[ii]);
		  sbv.style.visibility="hidden";
      }
	
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var toolbarList = ['paintToolbar','colorPickerToolbar']; 

/**
 * Show a specific toolbar
 * @param {String} sbid Sidebar ID.
 */
function showToolbar(sbid) {// Shows a specific sidebar
	clearToolbar();
	var sb = document.getElementById(sbid);
	sb.style.visibility = "visible";
}

/**
 * Clear the toolbar area.
 */
function clearToolbar() {// Clears all open sidebars

      for (ii = 0; ii < toolbarList.length; ii ++) {
		  var sbv = document.getElementById(toolbarList[ii]);
		  sbv.style.visibility="hidden";
      }
	
}
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/



/* Zoomed-in view variables */
var zCanvas; 
var zctx;
var tempCanvas;
var tctx;
var zoom_dx = 20;
var zoom_dy = 20;
var zWindowWidth = 200;
var zWindowHeight = 200;
var mPosn;
var extendedCrosshair = false;
var pix = [];
pix[0] = new Array();

/**
 * Initialize Zoom Window
 */
function initZoom() {
	var zCrossHair = document.getElementById("zoomCrossHair");
	var zchCtx = zCrossHair.getContext("2d");
	zchCtx.strokeStyle = "rgb(0,0,0)";
	zchCtx.beginPath();
	zchCtx.moveTo(zWindowWidth/2, 0);
	zchCtx.lineTo(zWindowWidth/2, zWindowHeight);
	zchCtx.moveTo(0, zWindowHeight/2);
	zchCtx.lineTo(zWindowWidth, zWindowHeight/2);
	zchCtx.stroke();
	
}

/**
 * Update view.
 */
function updateZoom(ev) {

	var posn = getPosition(ev);

	var xpos = posn.x;
	var ypos = posn.y;

	var dx = zoom_dx;
	var dy = zoom_dy;
    
    if (axesPicked != 1) {
        mPosn.innerHTML = xpos + ', ' + ypos;
    } else if(axesPicked == 1) {
        pix[0][0] = parseFloat(xpos);
        pix[0][1] = parseFloat(ypos);
        var rpix = pixelToData(pix, 1, plotType);
	
		if (plotType === 'image') {
		  mPosn.innerHTML = rpix[0][0] + ', ' + rpix[0][1];
		} else {
			if(plotType === 'XY') {
				if(axesAlignmentData[6] === true) {
					mPosn.innerHTML = dateConverter.formatDate(dateConverter.fromJD(rpix[0][0]), axesAlignmentData[8]);
				} else {
					mPosn.innerHTML = parseFloat(rpix[0][0]).toExponential(4);
				}

				if(axesAlignmentData[7] === true) {
					mPosn.innerHTML += ', ' + dateConverter.formatDate(dateConverter.fromJD(rpix[0][1]), axesAlignmentData[9]);
				} else {
					mPosn.innerHTML += ', ' + parseFloat(rpix[0][1]).toExponential(4);
				}
			} else {
				mPosn.innerHTML = parseFloat(rpix[0][0]).toExponential(4) + ', ' + parseFloat(rpix[0][1]).toExponential(4);
			}
			if (plotType === 'ternary') {
				mPosn.innerHTML += ', ' + parseFloat(rpix[0][2]).toExponential(4);
			}
		}
    }
    
  	if (extendedCrosshair === true) {
	    hoverCanvas.width = hoverCanvas.width;
	    hoverCtx.strokeStyle = "rgba(0,0,0, 0.5)";
	    hoverCtx.beginPath();
	    hoverCtx.moveTo(xpos, 0);
	    hoverCtx.lineTo(xpos, canvasHeight);
	    hoverCtx.moveTo(0, ypos);
	    hoverCtx.lineTo(canvasWidth, ypos);
	    hoverCtx.stroke();
	}

    
	if((xpos-dx/2) >= 0 && (ypos-dy/2) >= 0 && (xpos+dx/2) <= canvasWidth && (ypos+dy/2) <= canvasHeight) {
		var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);
	    var dataLayerImage = dataCtx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);

        // merge data from the two layers.
        for (var zi = 0; zi < dataLayerImage.data.length; zi+=4) {
            if ((dataLayerImage.data[zi]+dataLayerImage.data[zi+1]+dataLayerImage.data[zi+2]+dataLayerImage.data[zi+3])!=0) {
                zoomImage.data[zi] = dataLayerImage.data[zi];
                zoomImage.data[zi+1] = dataLayerImage.data[zi+1];        
                zoomImage.data[zi+2] = dataLayerImage.data[zi+2];        
            }
        }
        
		tctx.putImageData(zoomImage,0,0);
		
		var imgdata = tempCanvas.toDataURL();
		var zImage = document.createElement('img');
		zImage.onload = function() { 
				zctx.drawImage(zImage,0,0,parseInt(zWindowWidth),parseInt(zWindowHeight)); 
			};
		zImage.src = imgdata;

	}
	
}

function toggleCrosshair(ev) {
    if (ev.keyCode === 220) {
        ev.preventDefault();
        extendedCrosshair = !(extendedCrosshair);
        hoverCanvas.width = hoverCanvas.width;
    }
    return;
}

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var averagingWindowAlgo = {
	getParamList: function () {
			return [["ΔX","Px","5"],["ΔY","Px","5"]];
		  },

	run: function() {
			  
			  var xPoints = new Array();
			  var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  var xStepEl = document.getElementById("pv0");
			  var xStep = parseFloat(xStepEl.value);
			  var yStepEl = document.getElementById("pv1");
			  var yStep = parseFloat(yStepEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  for(var coli = 0; coli < dw; coli++) {

				blobs = -1;
				firstbloby = -2.0*yStep;
				bi = 0;
				   
				for(var rowi = 0; rowi < dh; rowi++) {
					if (binaryData[rowi][coli] === true)	{
					  if (rowi > firstbloby + yStep) {
						blobs = blobs + 1;
						bi = 1;
						blobAvg[blobs] = rowi;
						firstbloby = rowi;
					  } else {
						bi = bi + 1;
						blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
					  }
					}
				}
				
				if (blobs >= 0) {
					xi = coli;
					for (var blbi = 0; blbi <= blobs; blbi++) {
					  yi = blobAvg[blbi];
					  
					  xPoints[xPointsPicked] = new Array();
					  xPoints[xPointsPicked][0] = parseFloat(xi);
					  xPoints[xPointsPicked][1] = parseFloat(yi);
					  xPoints[xPointsPicked][2] = 1; // 1 if not filtered, 0 if processed already
					  xPointsPicked = xPointsPicked + 1;
					}
				}
				
			  }
			  
			  if (xPointsPicked === 0)
				return 0;
			  
			  for(var pi = 0; pi < xPointsPicked; pi++) {
				if(xPoints[pi][2] === 1) {// if still available
				  var inRange = 1;
				  var xxi = pi+1;
				  
				  var oldX = xPoints[pi][0];
				  var oldY = xPoints[pi][1];
				  
				  var avgX = oldX;
				  var avgY = oldY;
				  
				  var matches = 1;
				  
				  while((inRange === 1) && (xxi < xPointsPicked)) {
					var newX = xPoints[xxi][0];
					var newY = xPoints[xxi][1];
				
					if( (Math.abs(newX-oldX) <= xStep) && (Math.abs(newY-oldY) <= yStep) && (xPoints[xxi][2] === 1)) {
					  avgX = (avgX*matches + newX)/(matches+1.0);
					  avgY = (avgY*matches + newY)/(matches+1.0);
					  matches = matches + 1;
					  
					  xPoints[xxi][2] = 0;
					}

					if (newX > oldX + 2*xStep)
					  inRange = 0;
				
					xxi = xxi + 1;
				  }
				  
				  xPoints[pi][2] = 0; 
				  
				  xyData[pointsPicked] = new Array();
				  xyData[pointsPicked][0] = parseFloat(avgX);
				  xyData[pointsPicked][1] = parseFloat(avgY);
				  pointsPicked = pointsPicked + 1;	

				}
				
			  }
			  xPoints = [];	
			}
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var averagingWindowWithStepSizeAlgo = {
	getParamList: function () {
			if (plotType === 'XY') {
				return [["X_min","Units",axesAlignmentData[0].toString()],["ΔX Step","Units","0.1"],["X_max","Units",axesAlignmentData[1].toString()],["Y_min","Units",axesAlignmentData[2].toString()],["Y_max","Units",axesAlignmentData[3].toString()],["Line width","Px","30"]];
			} else {
				closePopup('testImageWindow');
				showPopup('xyAxesOnly');
				return [["X_min","Units", "0"],["ΔX Step","Units","0.1"],["X_max","Units", "0"],["Y_min","Units", "0"],["Y_max","Units", "0"],["Line width","Px","30"]];
			}
		},

	run: function () {

				// NOTE: This only works for XY Plot

				if(plotType === 'XY') {

					var xPointsPicked = 0;
					xyData = [];
					pointsPicked = 0;

			resetLayers();

			var dw = canvasWidth;
			var dh = canvasHeight;

			// Get values from UI:
			var param_xmin_el = document.getElementById("pv0");
			var param_delx_el = document.getElementById("pv1");
			var param_xmax_el = document.getElementById("pv2");
			var param_linewidth_el = document.getElementById("pv5");
			var param_ymin_el = document.getElementById("pv3");
			var param_ymax_el = document.getElementById("pv4");

			var param_xmin = parseFloat(param_xmin_el.value);
			var param_delx = parseFloat(param_delx_el.value);
			var param_xmax = parseFloat(param_xmax_el.value);
			var param_linewidth = parseFloat(param_linewidth_el.value);
			var param_ymin = parseFloat(param_ymin_el.value);
			var param_ymax = parseFloat(param_ymax_el.value);

			var blobx = [];
			var bloby = [];


			// Get corresponding pixels:
			for(var xi = param_xmin; xi <= param_xmax; xi += param_delx) {
				var xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix, r_unit_per_pix, step_pix = 1;

				dataToPixel(xi, param_ymin, 'XY');
				xmin_pix = dataToPixelxy[0];
				ymin_pix = dataToPixelxy[1];

				dataToPixel(xi, param_ymax, 'XY');
				xmax_pix = dataToPixelxy[0];
				ymax_pix = dataToPixelxy[1];

				dpix = Math.sqrt((ymax_pix-ymin_pix)*(ymax_pix-ymin_pix) + (xmax_pix-xmin_pix)*(xmax_pix-xmin_pix));

				r_unit_per_pix = (param_ymax-param_ymin)/dpix;

				var blobActive = false;
				var blobEntry = 0;
				var blobExit = 0;

				// To account for noise or if actual thickness is less than specified thickness.
				// This flag helps to set blobExit at the end of the thin part or account for noise.
				var blobExitLocked = false; 

				for(var ii = 0; ii <= dpix; ii++) {
					var yi = -ii*step_pix*r_unit_per_pix + param_ymax;
					dataToPixel(xi, yi, 'XY');

					xi_pix = dataToPixelxy[0];
					yi_pix = dataToPixelxy[1];

					if(xi_pix >= 0 && xi_pix < dw && yi_pix >=0 && yi_pix < dh)	{

						if(binaryData[parseInt(yi_pix, 10)][parseInt(xi_pix, 10)] === true)	{

							if(blobActive === false) {
								blobEntry = ii;
								blobExit = blobEntry;
								blobActive = true;
								blobExitLocked = false;
							}

							// Resume collection, it was just noise
							if(blobExitLocked === true) {
								blobExit = ii;
								blobExitLocked = false;
							}
						} else	{

							// collection ended before line thickness was hit. It could just be noise
							// or it could be the actual end.
							if(blobExitLocked === false) {
								blobExit = ii;
								blobExitLocked = true;
							}					
						}

						if(blobActive === true)	{

							if((ii > blobEntry + param_linewidth) || (ii == dpix-1)) {
								blobActive = false;

								if(blobEntry > blobExit) {
									blobExit = ii;							
								}

								var mean_ii = (blobEntry + blobExit)/2.0;
								var mean_yi = -mean_ii*step_pix*r_unit_per_pix + param_ymax;

								dataToPixel(xi, mean_yi, 'XY');
								xyData[pointsPicked] = new Array();
								xyData[pointsPicked][0] = parseFloat(dataToPixelxy[0]);
								xyData[pointsPicked][1] = parseFloat(dataToPixelxy[1]);
								pointsPicked = pointsPicked + 1;
							}
						}
					}

				}
			}
		} else {
			showPopup('xyAxesOnly');
		}
	}
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var blobDetectorAlgo = {
	getParamList: function() {
		return [["Min size","Px","0"],["Max size","Px","1000"]];
	  },
	run: function() {

			xyData = [];
			pointsPicked = 0;
			
			var minSize = document.getElementById('pv0').value;
			var maxSize = document.getElementById('pv1').value;
			
			var pixelVisited = []; // flag to determine whether a pixel was visited.
			
			// initialize to zero.
			for (var ri = 0; ri < canvasHeight; ri++) {
				pixelVisited[ri] = new Array();
				for(var ci = 0; ci < canvasWidth; ci++) {
					pixelVisited[ri][ci] = false;
				}
			}
			
			var objectCount = 0;            // number of objects.
			var objectArea = [];            // numbers of pixels in each obejct.
			var objectCentroidx = [];        // location of centroid of each object.
			var objectCentroidy = [];        // location of centroid of each object.
			var objectpx = [];          // list of pixels of each object.
			var objectpy = [];  
			var objectRange = [];    // span of the object in pixels.
			
			for (var rpi = 0; rpi < canvasHeight; rpi++) {
				for (var cpi = 0; cpi < canvasWidth; cpi++) {
					if((binaryData[rpi][cpi] === true) && (pixelVisited[rpi][cpi] === false)) {
						pixelVisited[rpi][cpi] = true;
						
						objectCount = objectCount + 1;
						objectArea[objectCount-1] = 1;
						
						objectpx[objectCount-1] = new Array();
						objectpy[objectCount-1] = new Array();
						
						objectpx[objectCount-1][0] = cpi;
						objectpy[objectCount-1][0] = rpi;
						
						objectCentroidx[objectCount-1] = cpi;
						objectCentroidy[objectCount-1] = rpi;
						
						var pxi = 1;
						var oi = 1;
						
						while (pxi <= oi) {
							ai = objectpy[objectCount-1][pxi-1];
							bi = objectpx[objectCount-1][pxi-1];
							
							for (var pp = -1; pp <= 1; pp++) {
								for (var qq = -1; qq <=1; qq++) {
									if (((ai+pp) >= 0) && ((bi+qq) >= 0) && ((ai+pp) < canvasHeight) && ((bi+qq) < canvasWidth)) {
										if ((binaryData[ai+pp][bi+qq] == true) && (pixelVisited[ai+pp][bi+qq] == false)) {
											objectArea[objectCount-1] = objectArea[objectCount-1] + 1;
											oi = objectArea[objectCount-1];
											objectpy[objectCount-1][oi-1] = ai+pp;
											objectpx[objectCount-1][oi-1] = bi+qq;
											
											objectCentroidy[objectCount-1] = (objectCentroidy[objectCount-1]*(oi-1) + (ai+pp))/oi;
											objectCentroidx[objectCount-1] = (objectCentroidx[objectCount-1]*(oi-1) + (bi+qq))/oi;
											
											pixelVisited[ai+pp][bi+qq] = true;
										}
									}
								}
							}
							
							pxi = pxi + 1;
						}
									   
						
						// Object is now fully captured. Get object range here.
						
									   
					}
					pixelVisited[rpi][cpi] = true;
				}
			}
			
			for (var obi = 0; obi < objectCount; obi++) {
				var sz = 2.0*Math.sqrt(objectArea[obi]/Math.PI);
				if ((sz>=minSize) && (sz<=maxSize)) {
					xyData[pointsPicked] = new Array();
					xyData[pointsPicked][0] = parseFloat(objectCentroidx[obi]);
					xyData[pointsPicked][1] = parseFloat(objectCentroidy[obi]);
					xyData[pointsPicked][2] = objectArea[obi];
					pointsPicked = pointsPicked + 1;
				}
			}
				 
		}
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var xStepAlgo = {

	getParamList: function () {
			return [["ΔX","Px","5"],["Line Width","Px","15"]];
		  },

	run: function() {
		  
		   var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  resetLayers();
			  
			  var xStepEl = document.getElementById("pv0");
			  var xStep = parseFloat(xStepEl.value);
			  
			  var LineThicknessEl = document.getElementById("pv1");
			  var yStep = parseFloat(LineThicknessEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  var dx = 1;
			  var coli = 0;
			  
			  while (coli < dw) {
					blobs = -1;
					firstbloby = -2.0*yStep;
					bi = 0;
			
					for(var rowi = 0; rowi < dh; rowi++) {
						if (binaryData[rowi][coli] === true) {
							dx = xStep; // First contact has been made, start moving forward with xStep now.
							
							if (rowi > firstbloby + yStep) {
								blobs = blobs + 1;
								bi = 1;
								blobAvg[blobs] = rowi;
								firstbloby = rowi;
							} else {
								bi = bi + 1;
								blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
							}
						}
						
					}
					
					if (blobs >= 0) {
						xi = coli;
						for (var blbi = 0; blbi <= blobs; blbi++) {
							  yi = blobAvg[blbi];
							  xyData[pointsPicked] = new Array();
							  xyData[pointsPicked][0] = parseFloat(xi);
							  xyData[pointsPicked][1] = parseFloat(yi);
							  pointsPicked = pointsPicked + 1;	
			 
						}
					}

					
					coli = coli + dx;
			  }
			 
		}
};

/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/
var yStepAlgo = {
	getParamList: function () {
		return [["ΔY","Px","5"],["Line Width","Px","15"]];
	  },
	  
	run: function() {
		  
		   var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  resetLayers();
					
			  var yStepEl = document.getElementById("pv0");
			  var yStep = parseFloat(yStepEl.value);
			  
			  var LineThicknessEl = document.getElementById("pv1");
			  var xStep = parseFloat(LineThicknessEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  var dy = -1;
			  var rowi = dh-1;
			  
			  while (rowi >= 0) {
					blobs = -1;
					firstblobx = -2.0*xStep;
					bi = 0;
			
					for(var coli = 0; coli < dw; coli++) {
						if (binaryData[rowi][coli] === true) {
							dy = -yStep; // First contact has been made, start moving forward with xStep now.
							
							if (coli > firstblobx + xStep) {
								blobs = blobs + 1;
								bi = 1;
								blobAvg[blobs] = coli;
								firstblobx = coli;
							} else {
								bi = bi + 1;
								blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + coli)/parseFloat(bi));
							}
						}
						
					}
					
					if (blobs >= 0) {
						yi = rowi;
						for (var blbi = 0; blbi <= blobs; blbi++) {
							  xi = blobAvg[blbi];
							  xyData[pointsPicked] = new Array();
							  xyData[pointsPicked][0] = parseFloat(xi);
							  xyData[pointsPicked][1] = parseFloat(yi);
							  pointsPicked = pointsPicked + 1;	
			 
						}
					}

					
					rowi = rowi + dy;
			  }
			 
			 
		}
};

