/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Version 2.0

	Copyright 2010 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
 * @fileoverview This is the main entry point
 * @version 2.0
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */


/**
 * This is the entry point and is executed when the page is loaded.
 */

function init() // This is run when the page loads.
{
	canvas = document.getElementById('mainCanvas');
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
	canvas.height = canvasHeight;
	canvas.width = canvasWidth;

	// Needed to fix the zoom problem.
	cheight = canvasHeight - zoom_dy;
	cwidth = canvasWidth - zoom_dx;

	caspectratio = cheight/cwidth;

	ctx = canvas.getContext('2d');

	// Set canvas default state
	img = new Image();
	img.onload = function() { loadImage(img); originalImage = img; }
	img.src = "start.png";
	
	// specify mouseover function
	//canvas.addEventListener('click',clickHandler,false);
	canvas.addEventListener('mousemove',updateZoom,false);

	// Image dropping capabilities
	canvas.addEventListener('dragover',function(event) {event.preventDefault();}, true);
	canvas.addEventListener("drop",function(event) {event.preventDefault(); dropHandler(event);},true);
	
	// Set defaults everywhere.
	setDefaultState();
	
	originalScreen = getCanvasData();
	activeScreen = originalScreen;

}


/**
 * Reset canvas and zoom window to initial state.
 */
function setDefaultState()
{
	axesPicked = 0;
	
	// :TODO: Move all this to zoomInit() or something
	zctx.beginPath();
	zctx.moveTo(zWindowWidth/2, 0);
	zctx.lineTo(zWindowWidth/2, zWindowHeight);
	zctx.moveTo(0, zWindowHeight/2);
	zctx.lineTo(zWindowWidth, zWindowHeight/2);
	zctx.stroke();
}


