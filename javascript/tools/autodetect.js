/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.colorPicker = (function () {

    function startFGPicker() {
        var fg_color = wpd.appData.getPlotData().getAutoDetector().fgColor;
        document.getElementById('color_red_fg').value = fg_color[0];
	    document.getElementById('color_green_fg').value = fg_color[1];
		document.getElementById('color_blue_fg').value = fg_color[2];
        wpd.popup.show('colorPickerFG');
    }

    function startBGPicker() {
        var bg_color = wpd.appData.getPlotData().getAutoDetector().bgColor;
        document.getElementById('color_red_bg').value = bg_color[0];
	    document.getElementById('color_green_bg').value = bg_color[1];
		document.getElementById('color_blue_bg').value = bg_color[2];
        wpd.popup.show('colorPickerBG');
    }

    function pickFGColor(mode) {
        wpd.popup.close('colorPickerFG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().fgColor = col;
                wpd.graphicsWidget.removeTool();
                startFGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function pickBGColor(mode) {
        wpd.popup.close('colorPickerBG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().bgColor = col;
                wpd.graphicsWidget.removeTool();
                startBGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function setFGColor() {
        var fg_color = [];
        fg_color[0] = parseInt(document.getElementById('color_red_fg').value, 10);
	    fg_color[1] = parseInt(document.getElementById('color_green_fg').value, 10);
		fg_color[2] = parseInt(document.getElementById('color_blue_fg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().fgColor = fg_color;
        wpd.popup.close('colorPickerFG');
    }

    function setBGColor() {
        var bg_color = [];
        bg_color[0] = parseInt(document.getElementById('color_red_bg').value, 10);
	    bg_color[1] = parseInt(document.getElementById('color_green_bg').value, 10);
		bg_color[2] = parseInt(document.getElementById('color_blue_bg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().bgColor = bg_color;
        wpd.popup.close('colorPickerBG');
    }
    
    return {
        startFGPicker: startFGPicker,
        startBGPicker: startBGPicker,

        pickFGColor: pickFGColor,
        pickBGColor: pickBGColor,

        setFGColor: setFGColor,
        setBGColor: setBGColor
    };
})();

wpd.ColorPickerTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts();
        this.onMouseClick = function(ev, pos, imagePos) {
            var pixData = ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
            this.onComplete([pixData.data[0], pixData.data[1], pixData.data[2]]);
        };
        this.onComplete = function(col) {};
    };
    return Tool;
})();

wpd.dataMask = (function () {
    function grabMask() {
    }

    function markBox() {
        var tool = new wpd.BoxMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function markPen() {
        var tool = new wpd.PenMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function eraseMarks() {
        var tool = new wpd.EraseMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    return {
        grabMask: grabMask,
        markBox: markBox,
        markPen: markPen,
        eraseMarks: eraseMarks
    };
})();

wpd.BoxMaskTool = (function () {
    var Tool = function () {
        var isDrawing = false,
            topImageCorner,
            topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer,
            screen_pos,
            mouseMoveHandler = function() {
                wpd.graphicsWidget.resetHover();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
    		    ctx.hoverCtx.strokeRect(topScreenCorner.x, topScreenCorner.y, screen_pos.x - topScreenCorner.x, screen_pos.y - topScreenCorner.y);
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = pos;
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            isDrawing = false;
            wpd.graphicsWidget.resetHover();
            ctx.dataCtx.fillStyle = "rgba(255,255,0,1)";
    	    ctx.dataCtx.fillRect(topScreenCorner.x, topScreenCorner.y, pos.x-topScreenCorner.x, pos.y-topScreenCorner.y);
            ctx.oriDataCtx.fillStyle = "rgba(255,255,0,1)";
            ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y, imagePos.x - topImageCorner.x, imagePos.y - topImageCorner.y);
        };

        this.onRedraw = function() {
        };
    };
    return Tool;
})();

wpd.PenMaskTool = (function () {
    var Tool = function () {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {
                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;
            isDrawing = false;
        };

        this.onRemove = function() {
            // hide toolbar for stroke width
        };

        this.onRedraw = function() {
            // call generic data redraw method
        };
    };
    return Tool;
})();

wpd.EraseMaskTool = (function () {
    var Tool = function() {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {

	            ctx.dataCtx.globalCompositeOperation = "destination-out";
                ctx.oriDataCtx.globalCompositeOperation = "destination-out";

                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
	        ctx.dataCtx.globalCompositeOperation = "destination-out";
            ctx.oriDataCtx.globalCompositeOperation = "destination-out";

            ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;

            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";

            isDrawing = false;
        };

        this.onRemove = function() {
            // hide toolbar for stroke width
        };

        this.onRedraw = function() {
            // call generic data redraw method
        };
    };
    return Tool;
})();



wpd.detectionAlgoSettings = (function () {

    var testImgCanvas,
        testImgContext;

    function updateTestImage () {
    }

    function showSettingsWindow () {
    }

    function scan() {
    }

    return {
        updateTestImage: updateTestImage,
        showSettingsWindow: showSettingsWindow,
        scan: scan
    };

})();

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
