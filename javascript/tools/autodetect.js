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

var wpd = wpd || {};

wpd.autoDetect = (function () {
    return {
    };
})();


wpd.colorPicker = (function () {
    var fg_color = [0,0,0],
        bg_color = [255,255,255],
        colorPickerMode = 'fg';

    function startFGPicker() {
        document.getElementById('color_red_fg').value = fg_color[0];
	    document.getElementById('color_green_fg').value = fg_color[1];
		document.getElementById('color_blue_fg') = fg_color[2];
        wpd.popup.show('colorPickerFG');
    }

    function startBGPicker() {
        document.getElementById('color_red_bg').value = bg_color[0];
	    document.getElementById('color_green_bg').value = bg_color[1];
		document.getElementById('color_blue_bg') = bg_color[2];
        wpd.popup.show('colorPickerBG');
    }

    function pickFGColor(mode) {
        wpd.popup.close('colorPickerFG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                fg_color = col;
                wpd.graphicsWidget.removeTool();
                startFGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function pickBGColor(mode) {
        wpd.popup.close('colorPickerBG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                fg_color = col;
                wpd.graphicsWidget.removeTool();
                startBGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function setFGColor() {
        fg_color[0] = parseInt(document.getElementById('color_red_fg').value, 10);
	    fg_color[1] = parseInt(document.getElementById('color_green_fg').value, 10);
		fg_color[2] = parseInt(document.getElementById('color_blue_fg').value, 10);
        wpd.popup.close('colorPickerFG');
    }

    function setBGColor() {
        bg_color[0] = parseInt(document.getElementById('color_red_bg').value, 10);
	    bg_color[1] = parseInt(document.getElementById('color_green_bg').value, 10);
		bg_color[2] = parseInt(document.getElementById('color_blue_bg').value, 10);
        wpd.popup.close('colorPickerBG');
    }
    
    function getFGColor() {
        return fg_color;
    }

    function getBGColor() {
        return bg_color;
    }

    return {
        startFGPicker: startFGPicker,
        startBGPicker: startBGPicker,

        pickFGColor: pickFGColor,
        pickBFColor: pickBGColor,

        setFGColor: setFGColor,
        setBFColor: setBGColor,

        getFGColor: getFGColor,
        getBGColor: getBGColor
    };
})();

wpd.ColorPickerTool = (function () {
    var ctx = wpd.graphicsWidget.getAllContexts();

    var Tool = function () {
        this.onMouseClick = function(ev, pos, imagePos) {
            var pixData = ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
            onComplete([pixData.data[0], pixData.data[1], pixData.data[2]]);
        };
        this.onComplete = function(col) {};
    };
    return Tool;
})();

wpd.dataMask = (function () {
})();

wpd.BoxMaskTool = (function () {
})();

wpd.PenMaskTool = (function () {
})();

wpd.EraseMaskTool = (function () {
})();



var testImgCanvas;
var testImgContext;

var boxCoordinates = [0,0,1,1];
var drawingBox = false;
var drawingPen = false;
var drawingEraser = false;

var binaryData;


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
	wpd.toolbar.show('paintToolbar');
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
	wpd.toolbar.show('paintToolbar');
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
  setTimeout("updateTestWindow();wpd.popup.show('testImageWindow');",100);
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
  
    wpd.popup.close("testImageWindow");
    
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
