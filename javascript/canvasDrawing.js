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
	
	imageDimensions[0] = 0;		// x_min
	imageDimensions[1] = 0;		// y_min
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

	newImage = new Image();
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
 * Loads a file that was dropped or loaded
 */
function fileLoader(fileInfo) {
    if(fileInfo.type.match("image.*")) {// only load images
		var droppedFile = new FileReader();
		droppedFile.onload = function() {
			var imageInfo = droppedFile.result;
			var newimg = new Image();
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

