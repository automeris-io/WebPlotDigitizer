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
      popup.show('colorPickerFG');
    } else if(cmode === 'bg') {
       popup.show('colorPickerBG');
    }
}

/**
 * Initiate color picking on canvas.
 */
function pickColor() {
	//colorPickerMode = cmode;
	canvasMouseEvents.removeAll();
	canvasMouseEvents.add('click',colorPicker,true);
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
				
		canvasMouseEvents.remove('click',colorPicker,true);
		
		if(colorPickerMode === 'fg') {
			assignColor('fg',PickedColor);
			
			redEl = document.getElementById('color_red_fg');
			greenEl = document.getElementById('color_green_fg');
			blueEl = document.getElementById('color_blue_fg');
			popup.show('colorPickerFG');

		} else if (colorPickerMode === 'bg') {

		  	assignColor('bg',PickedColor);
			
			redEl = document.getElementById('color_red_bg');
			greenEl = document.getElementById('color_green_bg');
			blueEl = document.getElementById('color_blue_bg');
			popup.show('colorPickerBG');
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

	canvasMouseEvents.removeAll();
	canvasMouseEvents.add('mousedown',boxPaintMousedown,true);
	canvasMouseEvents.add('mouseup',boxPaintMouseup,true);
	canvasMouseEvents.add('mousemove',boxPaintMousedrag,true);

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

	canvasMouseEvents.removeAll();
	toolbar.show('paintToolbar');
	canvasMouseEvents.add('mousedown',penPaintMousedown,true);
	canvasMouseEvents.add('mouseup',penPaintMouseup,true);
	canvasMouseEvents.add('mousemove',penPaintMousedrag,true);
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

	canvasMouseEvents.removeAll();
	toolbar.show('paintToolbar');
	canvasMouseEvents.add('mousedown',eraserMousedown,true);
	canvasMouseEvents.add('mouseup',eraserMouseup,true);
	canvasMouseEvents.add('mousemove',eraserMousedrag,true);
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
  setTimeout("updateTestWindow();popup.show('testImageWindow');",100);
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
  
    popup.close("testImageWindow");
    
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
