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

function pointsStatus(pn) // displays the number of points picked.
{
	var points = document.getElementById('pointsStatus');
	points.innerHTML = pn;
}
