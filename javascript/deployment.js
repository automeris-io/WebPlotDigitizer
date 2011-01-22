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

/* This file contains axes alignment functions */

var axesPicked; // axes picked?

var xmin;
var xmax;
var ymin;
var ymax;
var xlog;
var ylog;

var axesN; // number of axes points picked
var axesNmax; // total points needed to align axes.
var xyAxes; // axes data

var plotType; // Options: 'XY', 'bar', 'polar', 'ternary'



function setAxes(ax_mode) 
{

	plotType = ax_mode;
	clearSidebar();
	removeAllMouseEvents();
	addMouseEvent('click',pickCorners,true);
	axesN = 0;
	xyAxes = [];

	if ((plotType == 'XY')||(plotType == 'bar'))
	{
		axesNmax = 4;
		showPopup('xyAxesInfo');
	}
	else if (plotType == 'polar')
	{
		axesNmax = 4;
		showPopup('polarAxesInfo');
	}
	else if (plotType == 'ternary')
	{
		axesNmax = 3;
		showPopup('ternaryAxesInfo');
	}
}

function pickCorners(ev)
{
	if (axesN < axesNmax)
	{
		xi = ev.layerX;
		yi = ev.layerY;
		xyAxes[axesN] = new Array();
		xyAxes[axesN][0] = parseFloat(xi);
		xyAxes[axesN][1] = parseFloat(yi);
		axesN = axesN + 1;	

		ctx.beginPath();
		ctx.fillStyle = "rgb(0,0,200)";
		ctx.arc(xi,yi,3,0,2.0*Math.PI,true);
		ctx.fill();
		
		updateZoom(ev);

		if (axesN == axesNmax)
		{
				axesPicked = 1;
				
				removeMouseEvent('click',pickCorners,true);
				
				if (plotType == 'XY')
				{
					showPopup('xyRangeForm');
				}
				else if (plotType == 'polar')
				{
				}
				else if (plotType == 'ternary')
				{
				}

				redrawCanvas();
		}
	}
	
}


function setXYRange() // set the X-Y data range.
{
	var xminEl = document.getElementById('xmin');
	var xmaxEl = document.getElementById('xmax');
	var yminEl = document.getElementById('ymin');
	var ymaxEl = document.getElementById('ymax');
    // var xlogEl = document.getElementById('xlog');
	// var ylogEl = document.getElementById('ylog');
	
	xmin = parseFloat(xminEl.value);
	xmax = parseFloat(xmaxEl.value);
	ymin = parseFloat(yminEl.value);
	ymax = parseFloat(ymaxEl.value);
    //  xlog = xlogEl.checked;
	//  ylog = ylogEl.checked;
	//
	closePopup('xyRangeForm');
}

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

/* This file contains autodetections functions */

/* Autodetection variables */
var fg_color = [0,0,0];
var bg_color = [255,255,255];
var colorPickerMode = 'fg';

var boxCoordinates = [0,0,1,1];
var drawingBox = false;
var drawingPen = false;
var drawingEraser = false;

function pickColor(cmode)
{
	colorPickerMode = cmode;
	removeAllMouseEvents();
	addMouseEvent('click',colorPicker,true);
}

function colorPicker(ev)
{
	xi = ev.layerX;
	yi = ev.layerY;
	
	iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);
	if ((xi < currentImageWidth+cx0) && (yi < currentImageHeight+cy0) && (xi > cx0) && (yi > cy0))
	{
		ii = xi - cx0;
		jj = yi - cy0;

		var index = jj*4*currentImageWidth + ii*4;
		var PickedColor = [iData.data[index], iData.data[index+1], iData.data[index+2]];
		alert(PickedColor);
		canvas.removeEventListener('click',colorPicker,true);
		if(colorPickerMode == 'fg')
		{
			fg_color = PickedColor;
			var fgbtn = document.getElementById('autoFGBtn');
			fgbtn.style.borderColor = "rgb(" + fg_color[0] +"," + fg_color[1] +"," + fg_color[2] +")";
		}
		else if (colorPickerMode == 'bg')
		{
			bg_color = PickedColor;
			var bgbtn = document.getElementById('autoBGBtn');
			bgbtn.style.borderColor = "rgb(" + bg_color[0] +"," + bg_color[1] +"," + bg_color[2] +")";
		}
	}	
}

function boxPaint()
{
	removeAllMouseEvents();
	addMouseEvent('mousedown',boxPaintMousedown,true);
	addMouseEvent('mouseup',boxPaintMouseup,true);
	addMouseEvent('mousemove',boxPaintMousedrag,true);

}

function boxPaintMousedown(ev)
{
	boxCoordinates[0] = parseInt(ev.layerX);
	boxCoordinates[1] = parseInt(ev.layerY);
	drawingBox = true;
}

function boxPaintMouseup(ev)
{
	boxCoordinates[2] = parseInt(ev.layerX);
	boxCoordinates[3] = parseInt(ev.layerY);

	putCanvasData(markedScreen);

	ctx.fillStyle = "rgba(255,255,0,1)";
	ctx.fillRect(boxCoordinates[0], boxCoordinates[1], boxCoordinates[2]-boxCoordinates[0], boxCoordinates[3]-boxCoordinates[1]);
	markedScreen = getCanvasData();

	drawingBox = false;
}

function boxPaintMousedrag(ev)
{
	if(drawingBox == true)
	{
		xt = parseInt(ev.layerX);
		yt = parseInt(ev.layerY);
		
		putCanvasData(markedScreen);
		ctx.strokeStyle = "rgb(0,0,0)";
		ctx.strokeRect(boxCoordinates[0], boxCoordinates[1], xt-boxCoordinates[0], yt-boxCoordinates[1]);
	}
}

function penPaint()
{
	removeAllMouseEvents();
	showToolbar('paintToolbar');
	addMouseEvent('mousedown',penPaintMousedown,true);
	addMouseEvent('mouseup',penPaintMouseup,true);
	addMouseEvent('mousemove',penPaintMousedrag,true);

}

function penPaintMousedown(ev)
{
	if (drawingPen == false)
	{
	    xt = parseInt(ev.layerX);
	    yt = parseInt(ev.layerY);
	    drawingPen = true;
	    ctx.strokeStyle = "rgba(255,255,0,1)";
	    
	    thkRange = document.getElementById('paintThickness');
	    
	    ctx.lineWidth = parseInt(thkRange.value);
	    ctx.beginPath();
	    ctx.moveTo(xt,yt);
	}
}

function penPaintMouseup(ev)
{
    ctx.closePath();
    ctx.lineWidth = 1;
    drawingPen = false;
    markedScreen = getCanvasData();
}

function penPaintMousedrag(ev)
{
    if(drawingPen == true)
    {
	xt = parseInt(ev.layerX);
	yt = parseInt(ev.layerY);
	ctx.strokeStyle = "rgba(255,255,0,1)";
	ctx.lineTo(xt,yt);
	ctx.stroke();
    }
}


function eraser()
{
	removeAllMouseEvents();
	showToolbar('paintToolbar');
	addMouseEvent('mousedown',eraserMousedown,true);
	addMouseEvent('mouseup',eraserMouseup,true);
	addMouseEvent('mousemove',eraserMousedrag,true);
	instantScreen = markedScreen;
}

function eraserMousedown(ev)
{
    if(drawingEraser == false)
    {
	xt = parseInt(ev.layerX);
	yt = parseInt(ev.layerY);
	drawingEraser = true;
	ctx.strokeStyle = "rgba(255,0,255,1)";
	
	thkRange = document.getElementById('paintThickness');
	
	ctx.lineWidth = parseInt(thkRange.value);
	ctx.beginPath();
	ctx.moveTo(xt,yt);
    }
}

function eraserMouseup(ev)
{
    ctx.closePath();
    ctx.lineWidth = 1;
    drawingEraser = false;
    processingNote(true);
    
    instantScreen = getCanvasData();
    var diffM = findDifference(instantScreen, markedScreen);
    markedScreen = copyUsingDifference(markedScreen, currentScreen, diffM);
    putCanvasData(markedScreen);
    
    processingNote(false);
}

function eraserMousedrag(ev)
{
    if(drawingEraser == true)
    {
	xt = parseInt(ev.layerX);
	yt = parseInt(ev.layerY);
	ctx.strokeStyle = "rgba(255,0,255,1)";
	ctx.lineTo(xt,yt);
	ctx.stroke();
    }
}



function autodetectCurves()
{
}

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

/* This file contains function to generate CSV */

function saveData() // generate the .CSV file
{
		// check if everything was specified
		// transform to proper numbers
		// save data as CSV.
		if(axesPicked ==1 && pointsPicked >= 1) 
		{
			showPopup('csvWindow');
			tarea = document.getElementById('tarea');
			tarea.value = '';
			
			// :TODO: Move data transformation to pickPoints() function so that it's done on the fly.
			
			x1 = xyAxes[1][0] - xyAxes[0][0];
			y1 = -(xyAxes[1][1] - xyAxes[0][1]) ;

			x3 = xyAxes[3][0] - xyAxes[0][0];
			y3 = -(xyAxes[3][1] - xyAxes[0][1]);

			xm = xmax - xmin;
			ym = ymax - ymin;
			
			det = x1*y3 - y1*x3;

			x0 = xmin;
			y0 = ymin;

			for(ii = 0; ii<pointsPicked; ii++)
			{
					xr = xyData[ii][0] - xyAxes[0][0];
					yr = - (xyData[ii][1] - xyAxes[0][1]);
					// find the transform
					xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
					yf = (y3*ym*xr - x3*ym*yr)/det + y0;

					tarea.value = tarea.value + xf + ',' + yf + '\n';
			}
		}
}



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

/* This file contains functions to handle image editing functions */


var cropStatus = 0;
var cropCoordinates = [0,0,0,0];


function hflip()
{
	processingNote(true);

	var iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);

	for (var rowi = 0; rowi < currentImageHeight; rowi++)
	{
		for(var coli = 0; coli < currentImageWidth/2; coli++)
		{
			var index = rowi*4*currentImageWidth + coli*4;
			var mindex = (rowi+1)*4*currentImageWidth - (coli+1)*4;
			for(var p = 0; p < 4; p++)
			{
				var tt = iData.data[index + p];
				iData.data[index + p] = iData.data[mindex + p];
				iData.data[mindex + p] = tt;
			}
		}
	}
	
	ctx.putImageData(iData,cx0,cy0);
	saveCanvasImage();

	processingNote(false);
}

function vflip()
{
	processingNote(true);

	var iData = ctx.getImageData(cx0,cy0,currentImageWidth,currentImageHeight);

	for (var coli = 0; coli < currentImageWidth; coli++)
	{
		for(var rowi = 0; rowi < currentImageHeight/2; rowi++)
		{
			var index = rowi*4*currentImageWidth + coli*4;
			var mindex = (currentImageHeight - (rowi+2))*4*currentImageWidth + coli*4;
			for(var p = 0; p < 4; p++)
			{
				var tt = iData.data[index + p];
				iData.data[index + p] = iData.data[mindex + p];
				iData.data[mindex + p] = tt;
			}
		}
	}
	
	ctx.putImageData(iData,cx0,cy0);
	saveCanvasImage();

	processingNote(false);
}

function cropPlot() // crop image
{
	redrawCanvas();
	removeAllMouseEvents();
	addMouseEvent('mousedown',cropMousedown,true);
	addMouseEvent('mouseup',cropMouseup,true);
	addMouseEvent('mousemove',cropMousemove,true);
}

function cropMousedown(ev)
{
	cropCoordinates[0] = parseInt(ev.layerX);
	cropCoordinates[1] = parseInt(ev.layerY);
	cropStatus = 1;
}

function cropMouseup(ev)
{
      cropCoordinates[2] = parseInt(ev.layerX);
      cropCoordinates[3] = parseInt(ev.layerY);
      cropStatus = 0;
      
      redrawCanvas();
      
      cropWidth = cropCoordinates[2]-cropCoordinates[0];
      cropHeight = cropCoordinates[3]-cropCoordinates[1];
      if ((cropWidth > 0) && (cropHeight > 0))
      {
		var tcan = document.createElement('canvas');
		var tcontext = tcan.getContext('2d');
		
		tcan.width = cropWidth;
		tcan.height = cropHeight;
		
		var cropImageData = ctx.getImageData(cropCoordinates[0],cropCoordinates[1],cropWidth,cropHeight);  
		
		tcontext.putImageData(cropImageData,0,0);
		cropSrc = tcan.toDataURL();
		cropImg = new Image();
		cropImg.src = cropSrc;
		cropImg.onload = function() { loadImage(cropImg); }
      }
      
}

function cropMousemove(ev)
{
      // this paints a rectangle as the mouse moves
      if(cropStatus == 1)
      {
		redrawCanvas();
		ctx.strokeStyle = "rgb(0,0,0)";
		ctx.strokeRect(cropCoordinates[0],cropCoordinates[1],parseInt(ev.layerX)-cropCoordinates[0],parseInt(ev.layerY)-cropCoordinates[1]);
      }
}

function restoreOriginalImage()
{
	loadImage(originalImage);
}

function rotateCanvas() // Rotate by a specified amount.
{
}

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

/* This file contains image processing functions */


/* Finds differences between two sets of ImageData and returns a difference matrix
 * The difference matrix is zero for similar pixels, but 1 where pixels don't match
 * 
 * The height and width of the data is assumed to be that of the canvas.
 */
function findDifference(d1,d2)
{
    var dw = canvasWidth;
    var dh = canvasHeight;
    var diff = new Array();
    
    for (var rowi = 0; rowi < dh; rowi++)
    {
	diff[rowi] = new Array();
	for(var coli = 0; coli < dw; coli++)
	{
	    var index = rowi*4*dw + coli*4;
	    diff[rowi][coli] = false;
	    
	    for(var p = 0; p < 4; p++)
	    {
		if (d1.data[index+p] != d2.data[index+p])
		{
		    diff[rowi][coli] = true;
		}
	    }
	    
	}
    }
    
    return diff;
}

/* Copies pixels based on the difference matrix. */
function copyUsingDifference(copyTo, copyFrom, diff)
{
    var dw = canvasWidth;
    var dh = canvasHeight;
    
    for (var rowi = 0; rowi < dh; rowi++)
    {
	for(var coli = 0; coli < dw; coli++)
	{
	    var index = rowi*4*dw + coli*4;
		    
	    if (diff[rowi][coli] == true)
	   	for(var p = 0; p < 4; p++)
		    copyTo.data[index+p] = copyFrom.data[index+p];
		       
	}
    }
    
    return copyTo;
}

// create BW image based on the colors specified.
function colorSelect(imgd, mode, colorRGB, tol)
{
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi; rowi < dh; rowi++)
    {
	seldata[rowi] = new Array();
	for(var coli; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    ir = imgd.data[index];
	    ig = imgd.data[index+1];
	    ib = imgd.data[index+2];
	    
	    dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib+bluev)*(ib+bluev));
	    
	    seldata[rowi][coli] = false;
	    
	    if (mode == 'fg')
	    {
		if (dist <= tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	    else if (mode == 'bg')
	    {
		if (dist > tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	}
    }
    
    return seldata;
}

// create BW image based on the colors but only in valid region of difference matrix.
function colorSelectDiff(imgd, mode, colorRGB, tol, diff)
{
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi; rowi < dh; rowi++)
    {
	seldata[rowi] = new Array();
	for(var coli; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    ir = imgd.data[index];
	    ig = imgd.data[index+1];
	    ib = imgd.data[index+2];
	    
	    dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib+bluev)*(ib+bluev));
	    
	    seldata[rowi][coli] = false;
	    
	    if ((mode == 'fg') && (diff[rowi][coli] == 1))
	    {
		if (dist <= tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	    else if ((mode == 'bg') && (diff[rowi][coli] == 1))
	    {
		if (dist > tol)
		{
		    seldata[rowi][coli] = true;
		}
	    }
	}
    }
    
    return seldata;
}

function binaryToImageData(bwdata,imgd)
{
    dw = canvasWidth;
    dh = canvasHeight;
         
    for(var rowi = 0; rowi < dh; rowi++)
    {
	for(var coli = 0; coli < dw; coli++)
	{
	    index = rowi*4*dw + coli*4;
	    if (bwdata[rowi][coli] == true)
	    {
		imgd.data[index] = 255; imgd.data[index+1] = 255; imgd.data[index+2] = 255; imgd.data[index+3] = 1;
	    }
	    else
	    {
		imgd.data[index] = 0; imgd.data[index+1] = 0; imgd.data[index+2] = 0; imgd.data[index+3] = 1;
	    }
	}
    }
    
    return imgd;
}

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

/* This file contains manual data collection functions */

/* Selected Data Variables */
var xyData; // Raw data
var pointsPicked; // number of data points picked.

function acquireData()
{
	if(axesPicked == 0)
	{
		showPopup('alignAxes');
	}
	else
	{
		showSidebar('manualMode');
		markedScreen = getCanvasData();
		removeAllMouseEvents();
	}
}

function pickPoints() // select data points.
{
	if (axesPicked == 0)
	{
		alert('Define the axes first!');
	}
	else
	{
		removeAllMouseEvents();
		addMouseEvent('click',clickPoints,true);
		pointsPicked = 0;
		xyData = [];
		pointsStatus(pointsPicked);
		redrawCanvas();
		showSidebar('manualMode');
	}
}

function clickPoints(ev)
{
	xi = ev.layerX;
	yi = ev.layerY;
	xyData[pointsPicked] = new Array();
	xyData[pointsPicked][0] = parseFloat(xi);
	xyData[pointsPicked][1] = parseFloat(yi);
	pointsPicked = pointsPicked + 1;	

	ctx.beginPath();
	ctx.fillStyle = "rgb(200,0,0)";
	ctx.arc(xi,yi,3,0,2.0*Math.PI,true);
	ctx.fill();

	pointsStatus(pointsPicked);
	updateZoom(ev);

}


function clearPoints() // clear all markings.
{
	pointsPicked = 0;
	pointsStatus(pointsPicked);
	redrawCanvas();
	removeAllMouseEvents();
}

function undoPointSelection()
{
	if (pointsPicked >= 1)
	{
		pointsPicked = pointsPicked - 1;
		pointsStatus(pointsPicked);
		
		redrawCanvas();

		for(ii = 0; ii < pointsPicked; ii++)
		{
			xi = xyData[ii][0];	
			yi = xyData[ii][1];

			ctx.beginPath();
			ctx.fillStyle = "rgb(200,0,0)";
			ctx.arc(xi,yi,3,0,2.0*Math.PI,true);
			ctx.fill();
		}

	}
}

function pointsStatus(pn) // displays the number of points picked.
{
	var points = document.getElementById('pointsStatus');
	points.innerHTML = pn;
}

function deleteSpecificPoint()
{
	removeAllMouseEvents();
	addMouseEvent('click',deleteSpecificPointHandler,true);
}

function deleteSpecificPointHandler(ev)
{
	xi = parseFloat(ev.layerX);
	yi = parseFloat(ev.layerY);
	
	var minDistance = 10.0;
	var foundPoint = 0;
	var foundIndex = 0;

	for (var ii = 0; ii < pointsPicked; ii ++)
	{
		var xd = parseFloat(xyData[ii][0]);
		var yd = parseFloat(xyData[ii][1]);
		var distance = Math.sqrt((xd-xi)*(xd-xi) + (yd-yi)*(yd-yi));

		if (distance < minDistance)
		{
			foundPoint = 1;
			foundIndex = ii;
		}
	}

	if (foundPoint == 1)
	{
		xyData.splice(foundIndex,1);

		pointsPicked = pointsPicked - 1;
		pointsStatus(pointsPicked);
			
		redrawCanvas();

		for(ii = 0; ii < pointsPicked; ii++)
		{
			xp = xyData[ii][0];	
			yp = xyData[ii][1];
			ctx.beginPath();
			ctx.fillStyle = "rgb(200,0,0)";
			ctx.arc(xp,yp,3,0,2.0*Math.PI,true);
			ctx.fill();
		}
	}

	updateZoom(ev);

}
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

/* This file contains math functions */

function matrixInverse22(A) // Inverse of a 2x2 matrix
{
  a11 = parseFloat(A[0][0]);
  a12 = parseFloat(A[0][1]);
  a21 = parseFloat(A[1][0]);
  a22 = parseFloat(A[1][1]);
  
  var Ai = new Array();
  Ai[0] = new Array();
  Ai[0][0] = 0.0; Ai[0][1] = 0.0; Ai[1][0] = 0.0; Ai[1][1] = 0.0; 
  
  det = a11*a22 - a12*a21;
  
  if (det != 0)
  {
    Ai[0][0] = a22/det;
    Ai[0][1] = -a12/det;
    Ai[1][0] = -a21/det;
    Ai[1][1] = a22/det;
  }
  
  return Ai;
}

function multiplyAB(A,r1,c1,B,r2,c2) // Multiply two matrices
{
  var P = new Array();
  
  var sumrow = 0;
  
  if(c1 == r2)
  {
    for (var ii = 0; ii < r1; ii++)
    {
      P[ii] = new Array();
      for(var jj = 0; jj < c2; jj++)
      {
	 P[ii][jj] = 0.0;
	 for(var kk = 0; kk < c1; kk++)
	 {
	    P[ii][jj] = P[ii][jj] + parseFloat(A[ii][kk])*parseFloat(B[kk][jj]); // P_ij = A_ik.B_kj in index notation.
	 }
      }
    }
  }
  
  return P;
}

// :TODO: Array and Vector multiplication functions.

function sortMatrix(A,sc) // sort matrix A by column sc
{
}

function pixelToData(pxData)
{
}

function dataToPixel(pdata)
{
}
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


/**
 * @fileoverview This file contains the mouse event handling methods.
 * @version 2.0
 * @author Ankit Rohatgi
 */

/**
 * List of mouse event types.
 */
var mouseEventType = new Array();

/**
 * List of mouse event functions.
 */
var mouseEventFunction = new Array();

/**
 * To capture or not.
 */
var mouseEventCapture = new Array();

/**
 * Total number of active mouse events.
 */
var mouseEvents = 0;


/**
 * Add a mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function addMouseEvent(mouseEv, functionName, tf)
{
	var eventExists = false;
	for(var ii = 0; ii < mouseEvents; ii++)
	{
		if ((mouseEv == mouseEventType[ii]) && (functionName == mouseEventFunction[ii]) && (tf == mouseEventCapture[ii]))
		eventExists = true;
	}

	if(eventExists == false)
	{
		canvas.addEventListener(mouseEv, functionName, tf);
		mouseEventType[mouseEvents] = mouseEv;
		mouseEventFunction[mouseEvents] = functionName;
		mouseEventCapture[mouseEvents] = tf;
		mouseEvents = mouseEvents + 1;
	}
}

/**
 * Clear the entire list of active mouse events.
 */
function removeAllMouseEvents()
{
	if(mouseEvents > 0)
	{
		for (var kk = 0; kk < mouseEvents; kk++)
		{
			canvas.removeEventListener(mouseEventType[kk],mouseEventFunction[kk],mouseEventCapture[kk]);
		}
		mouseEvents = 0;
		mouseEventType = [];
		moueEventFunction = [];
		mouseEventCapture = [];
	}
	clearToolbar();
}

/**
 * Remove a particular mouse event.
 * @param {String} mouseEv Type of mouse event.
 * @param {function} functionName Name of the method associated 
 * @param {boolean} tf Capture value.
 */
function removeMouseEvent(mouseEv, functionName, tf)
{
	var eventExists = false;
	var eventIndex = 0;

	for(var ii = 0; ii < mouseEvents; ii++)
	{
		if ((mouseEv == mouseEventType[ii]) && (functionName == mouseEventFunction[ii]) && (tf == mouseEventCapture[ii]))
		{
			eventExists = true;
			eventIndex = ii;
		}
	}
	if(eventExists == true)
	{
		canvas.removeEventListener(mouseEv, functionName, tf);
		mouseEvents = mouseEvents - 1;
		mouseEventType.splice(eventIndex,1);
		mouseEventFunction.splice(eventIndex,1);
		mouseEventCapture.splice(eventIndex,1);
	}
}


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

/**
 * @fileoverview Methods to handle popup windows.
 * @version 2.0
 * @author Ankit Rohatgi
 */

/**
 * Display a popup window.
 * @param {String} popupid ID of the DIV element containing the popup block.
 */
function showPopup(popupid)
{
	// Dim lights :)
	var shadowDiv = document.getElementById('shadow');
	shadowDiv.style.visibility = "visible";

	var pWindow = document.getElementById(popupid);
	var screenWidth = parseInt(window.innerWidth);
	var screenHeight = parseInt(window.innerHeight);
	var pWidth = parseInt(pWindow.offsetWidth);
	var pHeight = parseInt(pWindow.offsetHeight);
	var xPos = (screenWidth - pWidth)/2;
	var yPos = (screenHeight - pHeight)/2;
	pWindow.style.left = xPos + 'px';
	pWindow.style.top = yPos + 'px';
	pWindow.style.visibility = "visible";
}

/**
 * Hide a popup window.
 * @param {String} popupid ID of the DIV element containing the popup block.
 */
function closePopup(popupid)
{
	var shadowDiv = document.getElementById('shadow');
	shadowDiv.style.visibility = "hidden";

	var pWindow = document.getElementById(popupid);
	pWindow.style.visibility = "hidden";

}

/**
 * Show a 'processing' note on the top right corner.
 * @param {boolean} pmode set to 'true' to diplay, 'false' to hide.
 */
function processingNote(pmode)
{
	var pelem = document.getElementById('wait');

	if(pmode == true)
	{
		pelem.style.visibility = 'visible';
	}
	else
	{
		pelem.style.visibility = 'hidden';
	}

}
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


/* This file contains functions to handle sidebars */

var sidebarList = ['editImageToolbar','manualMode','autoMode']; 

function showSidebar(sbid) // Shows a specific sidebar
{
	clearSidebar();
	var sb = document.getElementById(sbid);
	sb.style.visibility = "visible";
}

function clearSidebar() // Clears all open sidebars
{
      for (ii = 0; ii < sidebarList.length; ii ++)
      {
	  var sbv = document.getElementById(sidebarList[ii]);
	  sbv.style.visibility="hidden";
      }
	
}
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

/* This file contains functions to handle toolbars */

var toolbarList = ['paintToolbar','colorPickerToolbar']; 

function showToolbar(sbid) // Shows a specific sidebar
{
	clearToolbar();
	var sb = document.getElementById(sbid);
	sb.style.visibility = "visible";
}

function clearToolbar() // Clears all open sidebars
{
      for (ii = 0; ii < toolbarList.length; ii ++)
      {
	  var sbv = document.getElementById(toolbarList[ii]);
	  sbv.style.visibility="hidden";
      }
	
}
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

/* This file contains zoom window handling functions */

/* Zoomed-in view variables */
var zCanvas; 
var zctx;
var tempCanvas;
var tctx;
var zoom_dx = 20;
var zoom_dy = 20;
var zWindowWidth = 200;
var zWindowHeight = 200;


function updateZoom(ev)
{
	xpos = ev.layerX;
	ypos = ev.layerY;
	
	dx = zoom_dx;
	dy = zoom_dy;
    

	if((xpos-dx/2) >= 0 && (ypos-dy/2) >= 0 && (xpos+dx/2) <= canvasWidth && (ypos+dy/2) <= canvasHeight)
	{
		var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);
	
		tctx.putImageData(zoomImage,0,0);
		var imgdata = tempCanvas.toDataURL();
		var zImage = new Image();
		zImage.onload = function() 
			{ 
				zctx.drawImage(zImage,0,0,zWindowWidth,zWindowHeight); 
				zctx.beginPath();
				zctx.moveTo(zWindowWidth/2, 0);
				zctx.lineTo(zWindowWidth/2, zWindowHeight);
				zctx.moveTo(0, zWindowHeight/2);
				zctx.lineTo(zWindowWidth, zWindowHeight/2);
				zctx.stroke();

			}
		zImage.src = imgdata;
	}
}

