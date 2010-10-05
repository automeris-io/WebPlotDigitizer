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
var originalCanvas; // canvas in clean state.
var currentImageHeight; 
var currentImageWidth;
var cImageData; // data from getImageData
var ctx; 

/* Zoomed-in view variables */
var zCanvas; 
var zctx;
var tempCanvas;
var tctx;
var zoom_dx = 20;
var zoom_dy = 20;
var zWindowWidth = 200;
var zWindowHeight = 200;

/* State of the system */
var axesPicked; // axes picked?

/* Selected Data Variables */
var xyData; // Raw data
var pointsPicked; // number of data points picked.

var axesN; // number of axes points picked
var axesNmax; // total points needed to align axes.
var xyAxes; // axes data

var xmin;
var xmax;
var ymin;
var ymax;
var xlog;
var ylog;

/* UI variables */
var sidebarList = ['editImageToolbar','manualMode','autoMode']; 
var plotType; // Options: 'XY', 'bar', 'polar', 'ternary'

var cropStatus = 0;
var cropCoordinates = [0,0,0,0];

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
	img.onload = function() { loadImage(img); }
	img.src = "start.png";
	
	// specify mouseover function
	//canvas.addEventListener('click',clickHandler,false);
	canvas.addEventListener('mousemove',updateZoom,false);

	// Image dropping capabilities
	canvas.addEventListener('dragover',function(event) {event.preventDefault();}, true);
	canvas.addEventListener("drop",function(event) {event.preventDefault(); dropHandler(event);},true);
	
	// Set defaults everywhere.
	setDefaultState();
}

function setDefaultState()
{
	axesPicked = 0;
	zctx.beginPath();
	zctx.moveTo(zWindowWidth/2, 0);
	zctx.lineTo(zWindowWidth/2, zWindowHeight);
	zctx.moveTo(0, zWindowHeight/2);
	zctx.lineTo(zWindowWidth, zWindowHeight/2);
	zctx.stroke();
}

function loadImage(imgel)
{
	var sheight = imgel.height;
	var swidth = imgel.width;
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
	currentImageHeight = newHeight;
	currentImageWidth = newWidth;
			
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.drawImage(imgel,cx0,cy0,newWidth,newHeight); 

        originalCanvas = canvas;
}

function reloadPlot()
{
	canvas.width = canvas.width; // resets canvas.
	ctx.drawImage(currentImage, cx0, cy0, currentImageWidth, currentImageHeight); // redraw image.
}

function redrawCanvas()
{
	// Figure out a faster way to do this.
	reloadPlot();
}

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

function closePopup(popupid)
{
	var shadowDiv = document.getElementById('shadow');
	shadowDiv.style.visibility = "hidden";

	var pWindow = document.getElementById(popupid);
	pWindow.style.visibility = "hidden";

}

function showToolbar(tbid)
{
	var tb = document.getElementById(tbid);
	tb.style.visibility = "visible";
}

function closeToolbar(tbid)
{
	var tb = document.getElementById(tbid);
	tb.style.visibility = "hidden";
    
}

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

function pointsStatus(pn) // displays the number of points picked.
{
	var points = document.getElementById('pointsStatus');
	points.innerHTML = pn;
}


function cropPlot() // crop image
{
	redrawCanvas();
	canvas.addEventListener('mousedown',cropMousedown,true);
	canvas.addEventListener('mouseup',cropMouseup,true);
	canvas.addEventListener('mousemove',cropMousemove,true);
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
      
      canvas.removeEventListener('mousedown',cropMousedown,true);
      canvas.removeEventListener('mouseup',cropMouseup,true);
      canvas.removeEventListener('mousemove',cropMousemove,true);
      
      redrawCanvas();
      
      cropWidth = cropCoordinates[2]-cropCoordinates[0];
      cropHeight = cropCoordinates[3]-cropCoordinates[1];
      if ((cropWidth > 0) && (cropHeight > 0))
      {
	var tcan = document.createElement('canvas');
	var tcontext = tcan.getContext('2d');
	
	tcan.width = cropWidth;
	tcan.height = cropHeight;
	
	try
	{
		try { var cropImageData = ctx.getImageData(cropCoordinates[0],cropCoordinates[1],cropWidth,cropHeight); } 
		catch(e) 
		{   	
		    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		    var cropImageData = ctx.getImageData(cropCoordinates[0],cropCoordinates[1],cropWidth,cropHeight);
		}
	}
	catch(e) { throw new Error("Unable to access image data: " + e); }
	
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

function setAxes(ax_mode) // specify 4 corners and data range. :TODO: accept plotType as a parameter
{

	plotType = ax_mode;
	clearClickEvents();
	canvas.addEventListener('click',pickCorners,true);
	axesN = 0;
	xyAxes = [];

	if ((plotType == 'XY')||(plotType == 'bar'))
	{
		axesNmax = 4;
		showPopup('axesInfo');
	}
	else if (plotType == 'polar')
	{
		axesNmax = 4;
	}
	else if (plotType == 'ternary')
	{
		axesNmax = 3;
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
				
				canvas.removeEventListener('click',pickCorners,true);
				
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

function finishAxesAlignment()
{
      canvas.removeEventListener('click',pickCorners,true);
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

function pickPoints() // select data points.
{
	if (axesPicked == 0)
	{
		alert('Define the axes first!');
	}
	else
	{
		clearClickEvents();
		canvas.addEventListener('click',clickPoints,true);
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

function finishDataCollection()
{
      canvas.removeEventListener('click',clickPoints,true);
}

function clearClickEvents()
{
      finishDataCollection();
      finishAxesAlignment();
}

function clearPoints() // clear all markings.
{
	pointsPicked = 0;
	if (xyData instanceof Array)
		xyData = [];
	redrawCanvas();
	clearSidebar();
	finishDataCollection();
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

function updateZoom(ev)
{
	xpos = ev.layerX;
	ypos = ev.layerY;
	
	dx = zoom_dx;
	dy = zoom_dy;
    

	if((xpos-dx/2) >= 0 && (ypos-dy/2) >= 0 && (xpos+dx/2) <= canvasWidth && (ypos+dy/2) <= canvasHeight)
	{
		try
		{
			try
			{
					var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);
			} 
			catch(e)
			{
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
					var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);


			}
		}
		catch(e)
		{
			throw new Error("Unable to access image data: " + e);
		}

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


function dropHandler(ev)
{
	allDrop = ev.dataTransfer.files;
	if (allDrop.length == 1) // :TODO: also check if it's a valid image
	{
		var droppedFile = new FileReader();
		droppedFile.onload = function() {
			var imageInfo = droppedFile.result;
			var newimg = new Image();
			newimg.onload = function() { loadImage(newimg); }
			newimg.src = imageInfo;
		}
		droppedFile.readAsDataURL(allDrop[0]);
	}
}

/*********** Matrix operations ***********/
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
