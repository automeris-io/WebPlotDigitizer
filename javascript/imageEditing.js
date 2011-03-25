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
 * @fileoverview Image Editing functions.
 * @version 2.1
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */
var cropStatus = 0;
var cropCoordinates = [0,0,0,0];

/**
 * Flip picture horizontally
 */
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

/**
 * Flip picture vertically
 */
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

/**
 * Enable crop mode
 */
function cropPlot() // crop image
{
	redrawCanvas();
	removeAllMouseEvents();
	addMouseEvent('mousedown',cropMousedown,true);
	addMouseEvent('mouseup',cropMouseup,true);
	addMouseEvent('mousemove',cropMousemove,true);
}

/**
 * Crop mode - mouse down
 */
function cropMousedown(ev)
{
	cropCoordinates[0] = parseInt(ev.layerX);
	cropCoordinates[1] = parseInt(ev.layerY);
	cropStatus = 1;
}

/**
 * Crop mode - mouse up
 */
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

/**
 * Crop mode - mouse move
 */
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

/**
 * Restore to original image
 */
function restoreOriginalImage()
{
	loadImage(originalImage);
}

/**
 * Rotate image by a certain specified angle. Not implemented yet.
 */
function rotateCanvas() // Rotate by a specified amount.
{
}

