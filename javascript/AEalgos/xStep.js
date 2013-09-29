/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.5

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

/**
 * @fileoverview Averaging Window Extraction Algorithm
 * @version 2.5
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */

AEObject.getParamList = function () {
    return [["ΔX","Px","5"],["Line Width","Px","15"]];
  };
 
AEObject.run = function() {
  
   var xPointsPicked = 0;
      xyData = [];
      pointsPicked = 0;
      
      resetLayers();
      
      var xStepEl = document.getElementById("pv0");
      var xStep = parseFloat(xStepEl.value);
      
      var LineThicknessEl = document.getElementById("pv1");
      var yStep = parseFloat(LineThicknessEl.value);
      
      var dw = canvasWidth;
      var dh = canvasHeight;
      
      var blobAvg = new Array();
      
      var dx = 1;
      var coli = 0;
      
      while (coli < dw) {
            blobs = -1;
            firstbloby = -2.0*yStep;
            bi = 0;
    
            for(var rowi = 0; rowi < dh; rowi++) {
                if (binaryData[rowi][coli] === true) {
                    dx = xStep; // First contact has been made, start moving forward with xStep now.
                    
                    if (rowi > firstbloby + yStep) {
                        blobs = blobs + 1;
	                    bi = 1;
	                    blobAvg[blobs] = rowi;
	                    firstbloby = rowi;
	                } else {
	                    bi = bi + 1;
	                    blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
	                }
                }
                
            }
            
            if (blobs >= 0) {
	            xi = coli;
	            for (var blbi = 0; blbi <= blobs; blbi++) {
	                  yi = blobAvg[blbi];
                      xyData[pointsPicked] = new Array();
                      xyData[pointsPicked][0] = parseFloat(xi);
                      xyData[pointsPicked][1] = parseFloat(yi);
                      pointsPicked = pointsPicked + 1;	
     
	            }
            }

            
            coli = coli + dx;
      }
     
};

