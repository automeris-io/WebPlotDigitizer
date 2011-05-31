/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.3

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
 * @fileoverview Manage the live zoom window.
 * @version 2.3
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */


/* Zoomed-in view variables */
var zCanvas; 
var zctx;
var tempCanvas;
var tctx;
var zoom_dx = 20;
var zoom_dy = 20;
var zWindowWidth = 200;
var zWindowHeight = 200;
var mPosn;
var extendedCrosshair = false;
var pix = [];
pix[0] = new Array();

/**
 * Initialize Zoom Window
 */
function initZoom()
{
	zctx.beginPath();
	zctx.moveTo(zWindowWidth/2, 0);
	zctx.lineTo(zWindowWidth/2, zWindowHeight);
	zctx.moveTo(0, zWindowHeight/2);
	zctx.lineTo(zWindowWidth, zWindowHeight/2);
	zctx.stroke();
}

/**
 * Update view.
 */
function updateZoom(ev)
{
	xpos = ev.layerX;
	ypos = ev.layerY;
	
	dx = zoom_dx;
	dy = zoom_dy;
    
    if (axesPicked != 1)
    {
        mPosn.innerHTML = xpos + ', ' + ypos;
    }
    else if(axesPicked == 1)
    {
        pix[0][0] = parseFloat(xpos);
        pix[0][1] = parseFloat(ypos);
        var rpix = pixelToData(pix, 1, plotType);
        mPosn.innerHTML = parseFloat(rpix[0][0]).toExponential(3) + ', ' + parseFloat(rpix[0][1]).toExponential(3);
        if (plotType == 'ternary')
            mPosn.innerHTML += ', ' + parseFloat(rpix[0][2]).toExponential(3);
    }
    
  	if (extendedCrosshair == true)
	{
	    redrawCanvas();
	    ctx.strokeStyle = "rgba(0,0,0, 0.5)";
	    ctx.beginPath();
	    ctx.moveTo(xpos, 0);
	    ctx.lineTo(xpos, canvasHeight);
	    ctx.moveTo(0, ypos);
	    ctx.lineTo(canvasWidth, ypos);
	    ctx.stroke();
	}

    
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

function toggleCrosshair(ev)
{
    ev.preventDefault();
    if (ev.keyCode == 9)
    {
        //extendedCrosshair = !(extendedCrosshair);
        extendedCrosshair = false; // keep it off for now.
        redrawCanvas();
        
    }
    return;
}

