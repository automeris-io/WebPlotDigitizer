/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Zoomed-in view */
var zoomView = (function() {
    var zCanvas, 
        zctx,
        tempCanvas,
        tctx,
        zoom_dx = 20,
        zoom_dy = 20,
        zWindowWidth = 200,
        zWindowHeight = 200,
        mPosn,
        extendedCrosshair = false,
        pix = [],
        zoomTimeout;

    pix[0] = new Array();

    function init() {

        zCanvas = document.getElementById('zoomCanvas');
    	zctx = zCanvas.getContext('2d');
	    tempCanvas = document.createElement('canvas');
        tctx = tempCanvas.getContext('2d');
        tempCanvas.width = zoom_dx;
        tempCanvas.height = zoom_dy;

        mPosn = document.getElementById('mousePosition');

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

    function updateZoomEventHandler(ev) {
	    clearTimeout(zoomTimeout);
	    zoomTimeout = setTimeout(updateZoom(ev), 5);
    }

    function updateZoom(ev) {

        var posn = getPosition(ev);
        var xpos = posn.x;
        var ypos = posn.y;
        var dx = zoom_dx;
        var dy = zoom_dy;
        
        if (axesPicked != 1) {
            mPosn.innerHTML = xpos + ', ' + ypos;
        } else if(axesPicked == 1) {
            pix[0][0] = parseFloat(xpos);
            pix[0][1] = parseFloat(ypos);
            var rpix = pixelToData(pix, 1, plotType);
        
            if (plotType === 'image') {
                mPosn.innerHTML = rpix[0][0] + ', ' + rpix[0][1];
            } else {
                if(plotType === 'XY') {
                    if(axesAlignmentData[6] === true) {
                        mPosn.innerHTML = dateConverter.formatDate(dateConverter.fromJD(rpix[0][0]), axesAlignmentData[8]);
                    } else {
                        mPosn.innerHTML = parseFloat(rpix[0][0]).toExponential(4);
                    }

                    if(axesAlignmentData[7] === true) {
                        mPosn.innerHTML += ', ' + dateConverter.formatDate(dateConverter.fromJD(rpix[0][1]), axesAlignmentData[9]);
                    } else {
                        mPosn.innerHTML += ', ' + parseFloat(rpix[0][1]).toExponential(4);
                    }
                } else {
                    mPosn.innerHTML = parseFloat(rpix[0][0]).toExponential(4) + ', ' + parseFloat(rpix[0][1]).toExponential(4);
                }
                if (plotType === 'ternary') {
                    mPosn.innerHTML += ', ' + parseFloat(rpix[0][2]).toExponential(4);
                }
            }
        }
        
        if (extendedCrosshair === true) {
            hoverCanvas.width = hoverCanvas.width;
            hoverCtx.strokeStyle = "rgba(0,0,0, 0.5)";
            hoverCtx.beginPath();
            hoverCtx.moveTo(xpos, 0);
            hoverCtx.lineTo(xpos, canvasHeight);
            hoverCtx.moveTo(0, ypos);
            hoverCtx.lineTo(canvasWidth, ypos);
            hoverCtx.stroke();
        }

        
        if((xpos-dx/2) >= 0 && (ypos-dy/2) >= 0 && (xpos+dx/2) <= canvasWidth && (ypos+dy/2) <= canvasHeight) {
            var zoomImage = ctx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);
            var dataLayerImage = dataCtx.getImageData(xpos-dx/2,ypos-dy/2,dx,dy);

            // merge data from the two layers.
            for (var zi = 0; zi < dataLayerImage.data.length; zi+=4) {
                if ((dataLayerImage.data[zi]+dataLayerImage.data[zi+1]+dataLayerImage.data[zi+2]+dataLayerImage.data[zi+3])!=0) {
                    zoomImage.data[zi] = dataLayerImage.data[zi];
                    zoomImage.data[zi+1] = dataLayerImage.data[zi+1];        
                    zoomImage.data[zi+2] = dataLayerImage.data[zi+2];        
                }
            }
            
            tctx.clearRect(0,0,zoom_dx,zoom_dy);
            tctx.putImageData(zoomImage,0,0);

            // Draw directly from canvas. 
            // Creating a new image here caused a memory leak!
            zctx.drawImage(tempCanvas, 0, 0, zWindowWidth, zWindowHeight);
        }
    }
    
    // Doesn't belong in zoom-view, to be moved out later!
    function toggleCrosshair(ev) {
        if (ev.keyCode === 220) {
            ev.preventDefault();
            extendedCrosshair = !(extendedCrosshair);
            hoverCanvas.width = hoverCanvas.width;
        }
    }


    return {
        initZoom: init,
        updateZoomEventHandler: updateZoomEventHandler,
        updateZoom: updateZoom,
        toggleCrosshair: toggleCrosshair,
        zoom_dx: zoom_dx,
        zoom_dy: zoom_dy,
        mPosn: mPosn
    };
})();

