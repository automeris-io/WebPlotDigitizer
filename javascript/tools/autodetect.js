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
wpd.autoExtractSettings = (function () {

    function selectAlgo() {
        wpd.popup.close('auto-extract-algo-popup');
        wpd.sidebar.show('auto-extraction-sidebar');
        wpd.colorPicker.init();
    }

    function cancel() {
        wpd.popup.close('auto-extract-algo-popup');
    }

    function showWindow () {
        wpd.dataMask.grabMask(true);
        wpd.popup.show('auto-extract-algo-popup');
    }
  
    return {
        showWindow: showWindow,
        selectAlgo: selectAlgo,
        cancel: cancel
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
