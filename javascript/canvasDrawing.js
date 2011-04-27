/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.1

	Copyright 2011 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
 * @fileoverview Manage the main canvas.
 * @version 2.1
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */


/* Main Canvas Variables */

/** Holds the canvas element. */
var canvas; 
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
var ctx; 

// Different canvas states. They are all of type ImageData

var originalScreen;
var markedScreen;
var currentScreen;
var instantScreen;

/**
 * Load an image on the main canvas.
 * @param {Image} imgel Image to load.
 */
function loadImage(imgel)
{
	var sheight = parseInt(imgel.height);
	var swidth = parseInt(imgel.width);
	var iar = sheight/swidth;
	
	var newHeight = sheight;
	var newWidth = swidth;
		
	if (iar > caspectratio)
	{
		newHeight = cheight;
		newWidth = cheight/iar;
	}
	else
	{
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
	
}

/**
 * Save the current state.
 */
function saveCanvasImage()
{
	var nimagedata = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);
	var tCanvas = document.createElement('canvas');
	
	tCanvas.width = currentImageWidth;
	tCanvas.height=  currentImageHeight;

	tCanvasContext = tCanvas.getContext('2d');
	tCanvasContext.putImageData(nimagedata,0,0);

	newImage = new Image();
	newImage.src = tCanvas.toDataURL();
	newImage.onload = function() { currentImage = newImage; currentScreen = getCanvasData(); }
}

/**
 * Returns getImageData from the main canvas.
 * @returns {ImageData} Current ImageData.
 */
function getCanvasData()
{
	var cImgData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
	return cImgData;
}

/**
 * Load image on the main canvas
 * @param {ImageData} cImgData ImageData.
 */
function putCanvasData(cImgData)
{
	canvas.width = canvas.width;
	ctx.putImageData(cImgData,0,0);
}

/**
 * Redraw/Reset canvas.
 */
function reloadPlot()
{
	canvas.width = canvas.width; // resets canvas.
	ctx.drawImage(currentImage, cx0, cy0, currentImageWidth, currentImageHeight); // redraw image.
}

/**
 * Redraw/Reset canvas.
 */
function redrawCanvas()
{
	canvas.width = canvas.width;
	putCanvasData(currentScreen);
}

/**
 * Create PNG in a new window
 */
function savePNG()
{
  var saveImageWin = window.open();
  saveImageWin.location = canvas.toDataURL();
}

/**
 * Handle dropped file on canvas.
 */
function dropHandler(ev)
{
	allDrop = ev.dataTransfer.files;
	if (allDrop.length == 1) 
	{
		if(allDrop[0].type.match("image.*")) // only load images
		{
		    var droppedFile = new FileReader();
		    droppedFile.onload = function() {
			    var imageInfo = droppedFile.result;
			    var newimg = new Image();
			    newimg.onload = function() { loadImage(newimg); originalScreen = getCanvasData(); originalImage = newimg; setDefaultState(); }
			    newimg.src = imageInfo;
		    }
		    droppedFile.readAsDataURL(allDrop[0]);
		}
	}
}

