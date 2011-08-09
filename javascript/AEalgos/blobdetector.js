/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.5

	Copyright 2010-2011 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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


AEObject.getParamList = function() {
    return [["Min size","Px","0"],["Max size","Px","1000"]];
  }

AEObject.run = function() {
    xyData = [];
    pointsPicked = 0;
    
    var minSize = document.getElementById('pv0').value;
    var maxSize = document.getElementById('pv1').value;
    
    var pixelVisited = []; // flag to determine whether a pixel was visited.
    
    // initialize to zero.
    for (var ri = 0; ri < canvasHeight; ri++)
    {
        pixelVisited[ri] = new Array();
        for(var ci = 0; ci < canvasWidth; ci++)
        {
            pixelVisited[ri][ci] = false;
        }
    }
    
    var objectCount = 0;            // number of objects.
    var objectArea = [];            // numbers of pixels in each obejct.
    var objectCentroidx = [];        // location of centroid of each object.
    var objectCentroidy = [];        // location of centroid of each object.
    var objectpx = [];          // list of pixels of each object.
    var objectpy = [];  
    var objectRange = [];    // span of the object in pixels.
    
    for (var rpi = 0; rpi < canvasHeight; rpi++)
    {
        for (var cpi = 0; cpi < canvasWidth; cpi++)
        {
            if((binaryData[rpi][cpi] == true) && (pixelVisited[rpi][cpi] == false))
            {
                pixelVisited[rpi][cpi] = true;
                
                objectCount = objectCount + 1;
                objectArea[objectCount-1] = 1;
                
                objectpx[objectCount-1] = new Array();
                objectpy[objectCount-1] = new Array();
                
                objectpx[objectCount-1][0] = cpi;
                objectpy[objectCount-1][0] = rpi;
                
                objectCentroidx[objectCount-1] = cpi;
                objectCentroidy[objectCount-1] = rpi;
                
                var pxi = 1;
                var oi = 1;
                
                while (pxi <= oi)
                {
                    ai = objectpy[objectCount-1][pxi-1];
                    bi = objectpx[objectCount-1][pxi-1];
                    
                    for (var pp = -1; pp <= 1; pp++)
                    {
                        for (var qq = -1; qq <=1; qq++)
                        {
                            if (((ai+pp) >= 0) && ((bi+qq) >= 0) && ((ai+pp) < canvasHeight) && ((bi+qq) < canvasWidth))
                            {
                                if ((binaryData[ai+pp][bi+qq] == true) && (pixelVisited[ai+pp][bi+qq] == false))
                                {
                                    objectArea[objectCount-1] = objectArea[objectCount-1] + 1;
                                    oi = objectArea[objectCount-1];
                                    objectpy[objectCount-1][oi-1] = ai+pp;
                                    objectpx[objectCount-1][oi-1] = bi+qq;
                                    
                                    objectCentroidy[objectCount-1] = (objectCentroidy[objectCount-1]*(oi-1) + (ai+pp))/oi;
                                    objectCentroidx[objectCount-1] = (objectCentroidx[objectCount-1]*(oi-1) + (bi+qq))/oi;
                                    
                                    pixelVisited[ai+pp][bi+qq] = true;
                                }
                            }
                        }
                    }
                    
                    pxi = pxi + 1;
                }
                               
                
                // Object is now fully captured. Get object range here.
                
                               
            }
            pixelVisited[rpi][cpi] = true;
        }
    }
    
    for (var obi = 0; obi < objectCount; obi++)
    {
        var sz = 2.0*Math.sqrt(objectArea[obi]/Math.PI);
        if ((sz>=minSize) && (sz<=maxSize))
        {
            xyData[pointsPicked] = new Array();
            xyData[pointsPicked][0] = parseFloat(objectCentroidx[obi]);
            xyData[pointsPicked][1] = parseFloat(objectCentroidy[obi]);
            xyData[pointsPicked][2] = objectArea[obi];
            pointsPicked = pointsPicked + 1;
        }
    }
         
}
