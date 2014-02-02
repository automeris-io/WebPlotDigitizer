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

document.addEventListener("DOMContentLoaded", initApp, true);

/**
 * This is the entry point and is executed when the page is loaded.
 */
function initApp() {// This is run when the page loads.

	checkBrowser();
	
	mainCanvas = document.getElementById('mainCanvas');
	dataCanvas = document.getElementById('dataCanvas');
	drawCanvas = document.getElementById('drawCanvas');
	hoverCanvas = document.getElementById('hoverCanvas');
	topCanvas = document.getElementById('topCanvas');
	
	var canvasDiv = document.getElementById('canvasDiv');
	

	// Position to paste new plots at
	cx0 = zoomView.zoom_dx/2;
	cy0 = zoomView.zoom_dy/2;

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
	cheight = canvasHeight - zoomView.zoom_dy;
	cwidth = canvasWidth - zoomView.zoom_dx;

	caspectratio = cheight/cwidth;

	ctx = mainCanvas.getContext('2d');
	dataCtx = dataCanvas.getContext('2d');
	drawCtx = drawCanvas.getContext('2d');
	hoverCtx = hoverCanvas.getContext('2d');
	topCtx = topCanvas.getContext('2d');
	
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
	topCanvas.addEventListener('mousemove', zoomView.updateZoomEventHandler, false);
	
	// Add support for extended crosshair
    document.body.addEventListener('keydown', zoomView.toggleCrosshair, false);

	// Image dropping capabilities
	topCanvas.addEventListener('dragover',function(event) {event.preventDefault();}, true);
	topCanvas.addEventListener("drop",function(event) {event.preventDefault(); dropHandler(event);}, true);

	// Paste image from clipboard
	window.addEventListener('paste', function(event) {pasteHandler(event);}, false);
	
	// Set defaults everywhere.
	setDefaultState();
	
	zoomView.initZoom();
	
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
	sidebar.clear();
}

function checkBrowser() {
  if(!window.FileReader) {
    alert('\tWARNING!\nYou are using an unsupported browser. Please use Google Chrome 6+ or Firefox 3.6+.\n Sorry for the inconvenience.');
  }
}


