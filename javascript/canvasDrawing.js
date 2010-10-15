/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.0

	Copyright 2010 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* This file contains canvas drawing functions */

/* Main Canvas Variables */
var canvas; // holds the canvas element
var cx0; // x-location where plot image is drawn
var cy0; // y-location where plot image is drawn
var canvasWidth; // Actual canvas width
var canvasHeight; // Actual canvas height
var cwidth; // Available canvas width
var cheight; // Available canvas height
var caspectratio; // Aspect ratio of the image
var currentImage; // current full plot image element
var originalImage;
var currentImageHeight; 
var currentImageWidth;
var currentImageData; // data from getImageData
var ctx; 

// Different canvas states. They are all of type ImageData
var originalScreen;
var markedScreen;
var currentScreen;
var instantScreen;


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

function getCanvasData()
{
	var cImgData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
	return cImgData;
}

function putCanvasData(cImgData)
{
	canvas.width = canvas.width;
	ctx.putImageData(cImgData,0,0);
}

function reloadPlot()
{
	canvas.width = canvas.width; // resets canvas.
	ctx.drawImage(currentImage, cx0, cy0, currentImageWidth, currentImageHeight); // redraw image.
}

function redrawCanvas()
{
	canvas.width = canvas.width;
	putCanvasData(currentScreen);
}

function dropHandler(ev)
{
	allDrop = ev.dataTransfer.files;
	if (allDrop.length == 1) // :TODO: also check if it's a valid image
	{
		var droppedFile = new FileReader();
		droppedFile.onload = function() {
			var imageInfo = droppedFile.result;
			var newimg = new Image();
			newimg.onload = function() { loadImage(newimg); originalScreen = getCanvasData(); }
			newimg.src = imageInfo;
		}
		droppedFile.readAsDataURL(allDrop[0]);
	}
}

