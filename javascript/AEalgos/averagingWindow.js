/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.6

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
    return [["ΔX","Px","5"],["ΔY","Px","5"]];
  }
 
AEObject.run = function()
{
  
  var xPoints = new Array();
  var xPointsPicked = 0;
  xyData = [];
  pointsPicked = 0;
  
  var xStepEl = document.getElementById("pv0");
  var xStep = parseFloat(xStepEl.value);
  var yStepEl = document.getElementById("pv1");
  var yStep = parseFloat(yStepEl.value);
  
  var dw = canvasWidth;
  var dh = canvasHeight;
  
  var blobAvg = new Array();
  
  for(var coli = 0; coli < dw; coli++)
  {
    blobs = -1;
    firstbloby = -2.0*yStep;
    bi = 0;
       
    for(var rowi = 0; rowi < dh; rowi++)
    {
	if (binaryData[rowi][coli] == true)
	{
	  if (rowi > firstbloby + yStep)
	  {
	    blobs = blobs + 1;
	    bi = 1;
	    blobAvg[blobs] = rowi;
	    firstbloby = rowi;
	  }
	  else
	  {
	    bi = bi + 1;
	    blobAvg[blobs] = parseFloat((blobAvg[blobs]*(bi-1.0) + rowi)/parseFloat(bi));
	  }
	}
	
    }
    
    if (blobs >= 0)
    {
	    xi = coli;
	    for (var blbi = 0; blbi <= blobs; blbi++)
	    {
	      yi = blobAvg[blbi];
	      
	      xPoints[xPointsPicked] = new Array();
	      xPoints[xPointsPicked][0] = parseFloat(xi);
	      xPoints[xPointsPicked][1] = parseFloat(yi);
	      xPoints[xPointsPicked][2] = 1; // 1 if not filtered, 0 if processed already
	      xPointsPicked = xPointsPicked + 1;
	    }
    }
    
  }
  
  if (xPointsPicked == 0)
    return 0;
  
  for(var pi = 0; pi < xPointsPicked; pi++)
  {
    if(xPoints[pi][2] == 1) // if still available
    {
      var inRange = 1;
      var xxi = pi+1;
      
      var oldX = xPoints[pi][0];
      var oldY = xPoints[pi][1];
      
      var avgX = oldX;
      var avgY = oldY;
      
      var matches = 1;
      
      while((inRange == 1) && (xxi < xPointsPicked))
      {
	    var newX = xPoints[xxi][0];
	    var newY = xPoints[xxi][1];
	
	    if( (Math.abs(newX-oldX) <= xStep) && (Math.abs(newY-oldY) <= yStep) && (xPoints[xxi][2] == 1))
	    {
	      avgX = (avgX*matches + newX)/(matches+1.0);
	      avgY = (avgY*matches + newY)/(matches+1.0);
	      matches = matches + 1;
	      
	      xPoints[xxi][2] = 0;
	    }
	    if (newX > oldX + 2*xStep)
	      inRange = 0;
	
	    xxi = xxi + 1;
      }
      
      xPoints[pi][2] = 0; 
      
      xyData[pointsPicked] = new Array();
      xyData[pointsPicked][0] = parseFloat(avgX);
      xyData[pointsPicked][1] = parseFloat(avgY);
      pointsPicked = pointsPicked + 1;	

    }
    
  }
  xPoints = [];	
}

