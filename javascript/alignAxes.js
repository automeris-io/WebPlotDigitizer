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

