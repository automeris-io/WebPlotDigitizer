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

	browserInfo.checkBrowser();
    layoutManager.initialLayout();
    graphicsWidget.loadImageFromURL('start.png');
	
    zoomView.initZoom();

	// testing area for autodetection
	testImgCanvas = document.getElementById('testImg');
	testImgCanvas.width = canvasWidth/2;
	testImgCanvas.height = canvasHeight/2;
	testImgContext = testImgCanvas.getContext('2d');
		

	// Set defaults everywhere.
	setDefaultState();
	
	displayParameters();

    document.getElementById('loadingCurtain').style.display = 'none';
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


