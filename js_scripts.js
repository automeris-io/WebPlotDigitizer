/*
	WebPlotDigitizer

	Copyright 2010 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var canvas;
var pointsPicked;
var ctx;
var cmode;
var xyData;

var zCanvas;
var zctx;
var tempCanvas;
var tctx;
var zoom_dx = 20;
var zoom_dy = 20;
var zWindowWidth = 200;
var zWindowHeight = 200;

var axesPicked;
var axesN;
var xyAxes;
var rangePicked;

var cwidth;
var cheight;
var caspectratio;

var currentImage;
var currentImageHeight;
var currentImageWidth;

var oriImage;
var oriHeight;
var oriWidth;

var xmin;
var xmax;
var ymin;
var ymax;
var xlog;
var ylog;


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
	// Set canvas dimensions
	cwidth = canvasDiv.offsetWidth;
	cheight = canvasDiv.offsetHeight;
	canvas.height = cheight;
	canvas.width = cwidth;
	caspectratio = cheight/cwidth;

	ctx = canvas.getContext('2d');

	// Set canvas default state
	img = new Image();
	img.onload = function() { 
				var sheight = img.height;
				var swidth = img.width;
				var newHeight = sheight;
				var newWidth = swidth;
				if ((sheight > cheight) || (swidth < cwidth)) 
				{
						var iar = sheight/swidth;
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
				}
				currentImage = img;
				currentImageHeight = newHeight;
				currentImageWidth = newWidth;

				oriImage = img;
				oriHeight = newHeight;
				oriWidth = newWidth;

				ctx.drawImage(img,0,0,newWidth,newHeight); 
			}
	img.src = "start.png";
	
	// specify mouseover function
	canvas.addEventListener('mousedown',clickHandler,false);
	canvas.addEventListener('mousemove',mouseOverHandler,false);

	// Image dropping capabilities
	canvas.addEventListener('dragover',function(event) {event.preventDefault();}, true);
	canvas.addEventListener("drop",function(event) {event.preventDefault(); dropHandler(event);},true);
	
	// Set defaults everywhere.
	toolTip('Drag plot image below.');
	setDefaultState();
}

function setDefaultState()
{
		cmode = 0;
		axesPicked = 0;
		rangePicked = 0;
		axesStatus(0);
		var pointsWin = document.getElementById('pointsWindow');
		pointsWin.style.visibility = 'hidden';
}

function showPopup(popupid)
{
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

		var pWindow = document.getElementById(popupid);
		pWindow.style.visibility = "hidden";

}

function toolTip(tn) // changes the tooltip text.
{
		var toolTip = document.getElementById('toolTip');
		toolTip.innerHTML = tn;
}

function pointsStatus(pn) // displays the number of points picked.
{
		var points = document.getElementById('pointsStatus');
		points.innerHTML = pn;
}

function axesStatus(st) // displays whether axes have been defined.
{
		var axes = document.getElementById('axesStatus');
		if(st == 0)
		{
				axes.innerHTML = "<font color='red'>UNDEFINED</font>";
		}
		else if(st == 1)
		{
				axes.innerHTML = "<font color='green'>DEFINED</font>";
		}
}

function cropPlot() // crop image
{
		cmode = 1;
		alert('This is not implemented yet.');
}


function originalPlot() // recover the original image.
{
		ctx.drawImage(oriImage,0,0,oriWidth,oriHeight);
}

function setAxes() // specify 4 corners and data range.
{
		cmode = 2;

		axesN = 0;
		if (xyAxes instanceof Array)
			xyAxes = [];
		else
		    xyAxes = new Array();

		showPopup('axesInfo');
}

function pickCorners(ev)
{
		if (axesN < 4)
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

			if (axesN == 4)
			{
					axesPicked = 1;
					ctx.drawImage(currentImage, 0, 0, currentImageWidth, currentImageHeight);
					if (rangePicked == 1)
							axesStatus(1);
					showPopup('xyRangeForm');
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
    //	xlog = xlogEl.checked;
	//  ylog = ylogEl.checked;
	
	rangePicked = 1;
	if (axesPicked == 1)
		axesStatus(1);
	closePopup('xyRangeForm');
}

function pickPoints() // select data points.
{
		cmode = 3;

		pointsPicked = 0;

		if (xyData instanceof Array)
			    xyData = [];
		else
				xyData = new Array();

		ctx.drawImage(currentImage, 0, 0, currentImageWidth, currentImageHeight);
		var pointsWin = document.getElementById('pointsWindow');
		pointsWin.style.visibility="visible";
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

}

function clearPoints() // clear all markings.
{
		pointsPicked = 0;
		if (xyData instanceof Array)
			xyData = [];
		ctx.drawImage(currentImage,0,0,currentImageWidth,currentImageHeight);
		pointsStatus(pointsPicked);
		var pointsWin = document.getElementById('pointsWindow');
		pointsWin.style.visibility = 'hidden';
}

function undoPointSelection()
{
		if (pointsPicked >= 1)
		{
				pointsPicked = pointsPicked - 1;
				pointsStatus(pointsPicked);
				ctx.drawImage(currentImage,0,0,currentImageWidth,currentImageHeight);
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

function closeCSV()
{
		closePopup('csvWindow');
}

function saveData() // generate the .CSV file
{
		// check if everything was specified
		// transform to proper numbers
		// save data as CSV.
		if(rangePicked == 1 && axesPicked ==1 && pointsPicked >= 1) 
		{
			showPopup('csvWindow');
			tarea = document.getElementById('tarea');
			tarea.value = '';

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

function clickHandler(ev)
{
		switch(cmode)
		{
				case 0: // default mode
					//alert('default mode');
					break;
				case 1: // crop mode
					break;
				case 2: // set axes
					pickCorners(ev);
					break;
				case 3: // select points
					clickPoints(ev);
					break;
				default: // don't know where I am.
		}
		
}
function mouseOverHandler(ev)
{
	xpos = ev.layerX;
	ypos = ev.layerY;
	
	dx = zoom_dx;
	dy = zoom_dy;
    
	if((xpos-dx/2)>0 && (ypos-dy/2)>0 && (xpos+dx/2)<cwidth && (ypos+dy/2)<cheight)
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
function dropHandler(ev)
{
	allDrop = ev.dataTransfer.files;
	if (allDrop.length == 1) // also check if it's a valid image
	{
		var droppedFile = new FileReader();
		droppedFile.onload = function() {
				var imageInfo = droppedFile.result;
				var newimg = new Image();
				newimg.onload = function() {
							var sheight = newimg.height;
							var swidth = newimg.width;
							var newHeight = sheight;
							var newWidth = swidth;
							if ((sheight > cheight) || (swidth < cwidth)) 
							{
								var iar = sheight/swidth;
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
							}
							currentImage = newimg;
							currentImageHeight = newHeight;
							currentImageWidth = newWidth;

							oriImage = newimg;
							oriHeight = newHeight;
							oriWidth = newWidth;

			     			ctx.drawImage(newimg,0,0,newWidth,newHeight);
						}
				newimg.src = imageInfo;
		}
		droppedFile.readAsDataURL(allDrop[0]);
	}
}
