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

var imageOps = (function () {

    function hflip(idata, iwidth, iheight) {
        var rowi, coli, index, mindex, tval, p;
        for(rowi = 0; rowi < iheight; rowi++) {
            for(coli = 0; coli < iwidth/2; coli++) {
                index = 4*(rowi*iwidth + coli);
                mindex = 4*((rowi+1)*iwidth - (coli+1));
                for(p = 0; p < 4; p++) {
                    tval = idata.data[index + p];
                    idata.data[index + p] = idata.data[mindex + p];
                    idata.data[mindex + p] = tval;
                }
            }
        }
        return {
            imageData: idata,
            width: iwidth,
            height: iheight
        };
    }

    function vflip(idata, iwidth, iheight) {
        var rowi, coli, index, mindex, tval, p;
        for(rowi = 0; rowi < iheight/2; rowi++) {
            for(coli = 0; coli < iwidth; coli++) {
                index = 4*(rowi*iwidth + coli);
                mindex = 4*((iheight - (rowi+2))*iwidth + coli);
                for(p = 0; p < 4; p++) {
                    tval = idata.data[index + p];
                    idata.data[index + p] = idata.data[mindex + p];
                    idata.data[mindex + p] = tval;
                }
            }
        }
        return {
            imageData: idata,
            width: iwidth,
            height: iheight
        };
    }

    return {
        hflip: hflip,
        vflip: vflip
    };
})();

var cropStatus = 0;
var cropCoordinates = [0,0,0,0];

/**
 * Flip picture horizontally
 */
function hflip() {
	processingNote(true);
    graphicsWidget.runImageOp(imageOps.hflip);
	processingNote(false);
}

function vflip() {
    processingNote(true);
    graphicsWidget.runImageOp(imageOps.vflip);
    processingNote(false);
}

/**
 * Enable crop mode
 */
function cropPlot() {// crop image

	redrawCanvas();
	canvasMouseEvents.removeAll();
	canvasMouseEvents.add('mousedown',cropMousedown,true);
	canvasMouseEvents.add('mouseup',cropMouseup,true);
	canvasMouseEvents.add('mousemove',cropMousemove,true);
}

/**
 * Crop mode - mouse down
 */
function cropMousedown(ev) {
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

	cropCoordinates[0] = xi;
	cropCoordinates[1] = yi;
	cropStatus = 1;
}

/**
 * Crop mode - mouse up
 */
function cropMouseup(ev) {

	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      cropCoordinates[2] = xi;
      cropCoordinates[3] = yi;
      cropStatus = 0;
      
      hoverCanvas.width = hoverCanvas.width;
            
      cropWidth = cropCoordinates[2]-cropCoordinates[0];
      cropHeight = cropCoordinates[3]-cropCoordinates[1];
      if ((cropWidth > 0) && (cropHeight > 0)) {

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

/**
 * Crop mode - mouse move
 */
function cropMousemove(ev) {

	
	var posn = getPosition(ev),
		xi = posn.x,
		yi = posn.y;

      // this paints a rectangle as the mouse moves
      if(cropStatus == 1) {
        hoverCanvas.width = hoverCanvas.width;
		hoverCtx.strokeStyle = "rgb(0,0,0)";
		hoverCtx.strokeRect(cropCoordinates[0], cropCoordinates[1], xi-cropCoordinates[0], yi-cropCoordinates[1]);
      }
}

/**
 * Restore to original image
 */
function restoreOriginalImage() {
	loadImage(originalImage);
}

/**
 * Rotate image by a certain specified angle. Not implemented yet.
 */
function rotateCanvas() {}// Rotate by a specified amount.

