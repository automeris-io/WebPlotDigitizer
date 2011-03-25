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
 * @fileoverview  Axes alignment functions.
 * @version 2.1
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */


/** Have the axes been picked? true/false. */
var axesPicked; // axes picked?

/** Number of axes points picked. */
var axesN; 

/** Total number of axes points needed to align. */
var axesNmax;

/** XY-Axes data. */
var xyAxes;

/** Axes alignment data */
var axesAlignmentData = [];

/** Plot type. Options: 'XY', 'bar', 'polar', 'ternary' or 'map' */
var plotType; 

/**
 * Start the alignment process here. Called from the Plot Type option popup.
 */ 
function initiatePlotAlignment()
{
  xyEl = document.getElementById('r_xy');
  polarEl = document.getElementById('r_polar');
  ternaryEl = document.getElementById('r_ternary');
  mapEl = document.getElementById('r_map');
  
  closePopup('axesList');
  
  if (xyEl.checked == true)
    setAxes('XY');
  else if(polarEl.checked == true)
    setAxes('polar');
  else if(ternaryEl.checked == true)
    setAxes('ternary');
  else if(mapEl.checked == true)
    setAxes('map');
}

/**
 * Entry point for Axes alignment. 
 * @param {String} ax_mode Plot Type. Options: 'XY', 'bar', 'polar', 'ternary'
 */
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
		axesNmax = 3;
		showPopup('polarAxesInfo');
	}
	else if (plotType == 'ternary')
	{
		axesNmax = 3;
		showPopup('ternaryAxesInfo');
	}
	else if (plotType == 'map')
	{
		axesNmax = 2;
		showPopup('mapAxesInfo');
	}
}

/**
 * Handles mouseclick in axis alignment mode. Axes point are defined using this.
 * @param {Event} ev Mouse event.
 */
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
					showPopup('xyAlignment');
				}
				else if (plotType == 'polar')
				{
					showPopup('polarAlignment');
				}
				else if (plotType == 'ternary')
				{
					showPopup('ternaryAlignment');
				}
				else if (plotType == 'map')
				{
					showPopup('mapAlignment');
				}

				redrawCanvas();
		}
	}
	
}


/**
 * Store the alignment data.
 */
function alignAxes()
{
    if (plotType == 'XY')
    {
	var xminEl = document.getElementById('xmin');
	var xmaxEl = document.getElementById('xmax');
	var yminEl = document.getElementById('ymin');
	var ymaxEl = document.getElementById('ymax');
    
	axesAlignmentData[0] = parseFloat(xminEl.value);
	axesAlignmentData[1] = parseFloat(xmaxEl.value);
	axesAlignmentData[2] = parseFloat(yminEl.value);
	axesAlignmentData[3] = parseFloat(ymaxEl.value);
	
	closePopup('xyAlignment');
    }
    else if (plotType == 'polar')
    {
	var r1El = document.getElementById('rpoint1');
	var theta1El = document.getElementById('thetapoint1');
	var r2El = document.getElementById('rpoint2');
	var theta2El = document.getElementById('thetapoint2');
	
	var degreesEl = document.getElementById('degrees');
	var radiansEl = document.getElementById('radians');
	var orientationEl = document.getElementById('clockwise');
	
	axesAlignmentData[0] = parseFloat(r1El.value);
	axesAlignmentData[1] = parseFloat(theta1El.value);
	axesAlignmentData[2] = parseFloat(r2El.value);
	axesAlignmentData[3] = parseFloat(theta2El.value);
	
	if (degreesEl.checked == true)
	    axesAlignmentData[4] = 1;
	else
	    axesAlignmentData[4] = 0;
	
	if (orientationEl.checked == true)
	    axesAlignmentData[5] = 1;
	else
	    axesAlignmentData[5] = 0;
	
	
	closePopup('polarAlignment');
    }
    else if (plotType == 'ternary')
    {
	var range1El = document.getElementById('range0to1');
	var range100El = document.getElementById('range0to100');
	var ternaryNormalEl = document.getElementById('ternarynormal');
	
	if (range100El.checked == true)
	  axesAlignmentData[0] = true;
	else
	  axesAlignmentData[0] = false;
	
	if (ternaryNormalEl.checked == true)
	  axesAlignmentData[1] = true;
	else
	  axesAlignmentData[1] = false;
		
	closePopup('ternaryAlignment');
    }
    else if (plotType == 'map')
    {
	var scaleLength = document.getElementById('scaleLength');
	
	axesAlignmentData[0] = parseFloat(scaleLength.value);
	
	closePopup('mapAlignment');
    }
    
}
