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
var yStepAlgo = {
	getParamList: function () {
		return [["ΔY","Px","5"],["Line Width","Px","15"]];
	  },
	  
	run: function() {
		  
		   var xPointsPicked = 0;
			  xyData = [];
			  pointsPicked = 0;
			  
			  resetLayers();
					
			  var yStepEl = document.getElementById("pv0");
			  var yStep = parseFloat(yStepEl.value);
			  
			  var LineThicknessEl = document.getElementById("pv1");
			  var xStep = parseFloat(LineThicknessEl.value);
			  
			  var dw = canvasWidth;
			  var dh = canvasHeight;
			  
			  var blobAvg = new Array();
			  
			  var dy = -1;
			  var rowi = dh-1;
			  
			  while (rowi >= 0) {
					blobs = -1;
					firstblobx = -2.0*xStep;
					bi = 0;
			
					for(var coli = 0; coli < dw; coli++) {
						if (binaryData[rowi][coli] === true) {
							dy = -yStep; // First contact has been made, start moving forward with xStep now.
							
							if (coli > firstblobx + xStep) {
								blobs = blobs + 1;
								bi = 1;
								blobAvg[blobs] = coli;
								firstblobx = coli;
							} else {
								bi = bi + 1;
								blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + coli)/parseFloat(bi));
							}
						}
						
					}
					
					if (blobs >= 0) {
						yi = rowi;
						for (var blbi = 0; blbi <= blobs; blbi++) {
							  xi = blobAvg[blbi];
							  xyData[pointsPicked] = new Array();
							  xyData[pointsPicked][0] = parseFloat(xi);
							  xyData[pointsPicked][1] = parseFloat(yi);
							  pointsPicked = pointsPicked + 1;	
			 
						}
					}

					
					rowi = rowi + dy;
			  }
			 
			 
		}
};

