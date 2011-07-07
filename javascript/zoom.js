/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.5

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
 * @version 2.5
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
	var zCrossHair = document.getElementById("zoomCrossHair");
	var zchCtx = zCrossHair.getContext("2d");
    zchCtx.strokeStyle = "rgb(0,0,0)";
	zchCtx.beginPath();
	zchCtx.moveTo(zWindowWidth/2, 0);
	zchCtx.lineTo(zWindowWidth/2, zWindowHeight);
	zchCtx.moveTo(0, zWindowHeight/2);
	zchCtx.lineTo(zWindowWidth, zWindowHeight/2);
	zchCtx.stroke();
	
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
        hoverCanvas.width = hoverCanvas.width;
	    hoverCtx.strokeStyle = "rgba(0,0,0, 0.5)";
	    hoverCtx.beginPath();
	    hoverCtx.moveTo(xpos, 0);
	    hoverCtx.lineTo(xpos, canvasHeight);
	    hoverCtx.moveTo(0, ypos);
	    hoverCtx.lineTo(canvasWidth, ypos);
	    hoverCtx.stroke();
	}

    
	if((xpos-dx/2) >= 0 && (ypos-dy/2) >= 0 && (xpos+dx/2) <= canvasWidth && (ypos+dy/2) <= canvasHeight)
	{
		var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);
	    var dataLayerImage = dataCtx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);

        // merge data from the two layers.
        for (var zi = 0; zi < dataLayerImage.data.length; zi+=4)
        {
            if ((dataLayerImage.data[zi]+dataLayerImage.data[zi+1]+dataLayerImage.data[zi+2]+dataLayerImage.data[zi+3])!=0)
            {
                zoomImage.data[zi] = dataLayerImage.data[zi];
                zoomImage.data[zi+1] = dataLayerImage.data[zi+1];        
                zoomImage.data[zi+2] = dataLayerImage.data[zi+2];        
            }
        }
        
		tctx.putImageData(zoomImage,0,0);
		
		var imgdata = tempCanvas.toDataURL();
		var zImage = new Image();
		zImage.onload = function() 
			{ 
				zctx.drawImage(zImage,0,0,parseInt(zWindowWidth),parseInt(zWindowHeight)); 
			}
		zImage.src = imgdata;

	}
	
}

function toggleCrosshair(ev)
{
    if (ev.keyCode == 220)
    {
        ev.preventDefault();
        extendedCrosshair = !(extendedCrosshair);
        hoverCanvas.width = hoverCanvas.width;
    }
    return;
}

