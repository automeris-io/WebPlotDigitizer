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
 * @fileoverview Generate CSV.
 * @version 2.1
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */

/**
 * Generate the .CSV output.
 */
function saveData() 
{
		// check if everything was specified
		// transform to proper numbers
		// save data as CSV.
		if(axesPicked ==1 && pointsPicked >= 1) 
		{
			showPopup('csvWindow');
			tarea = document.getElementById('tarea');
			tarea.value = '';
			
			if (plotType == 'XY')
			{
			    x1 = xyAxes[1][0] - xyAxes[0][0];
			    y1 = -(xyAxes[1][1] - xyAxes[0][1]) ;

			    x3 = xyAxes[3][0] - xyAxes[0][0];
			    y3 = -(xyAxes[3][1] - xyAxes[0][1]);
			    
			    xmin = axesAlignmentData[0];
			    xmax = axesAlignmentData[1];
			    ymin = axesAlignmentData[2];
			    ymax = axesAlignmentData[3];

			    xm = xmax - xmin;
			    ym = ymax - ymin;
			
			    det = x1*y3 - y1*x3;

			    x0 = xmin;
			    y0 = ymin;

			    for(ii = 0; ii<pointsPicked; ii++)
			    {
				xr = xyData[ii][0] - xyAxes[0][0];
				yr = - (xyData[ii][1] - xyAxes[0][1]);
				// find the transform
				xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
				yf = (y3*ym*xr - x3*ym*yr)/det + y0;
				tarea.value = tarea.value + xf + ',' + yf + '\n';
			    }
			}
			else if (plotType == 'map')
			{
			    
			    mx0 = 0.0; my0 = canvasHeight;
			    mx1 = 0.0; my1 = 0.0;
			    mx2 = canvasWidth; my2 = 0;
			    mx3 = canvasWidth; my3 = canvasHeight;
			    
			    x1 = mx1 - mx0;
			    y1 = -(my1 - my0);
			    
			    x3 = mx3 - mx0;
			    y3 = -(my3 - my0);
			    		
			    scaleSize = axesAlignmentData[0];
			    
			    sx1 = xyAxes[0][0];
			    sy1 = xyAxes[0][1];
			    sx2 = xyAxes[1][0];
			    sy2 = xyAxes[1][1];
			    
			    scaleLength = scaleSize/Math.sqrt((sx1-sx2)*(sx1-sx2) + (sy1-sy2)*(sy1-sy2));
			    		    
			    xmin = 0;
			    xmax = canvasWidth*scaleLength;
			    
			    ymin = 0;
			    ymax = canvasHeight*scaleLength;

			    xm = xmax - xmin;
			    ym = ymax - ymin;
			
			    det = x1*y3 - y1*x3;

			    x0 = xmin;
			    y0 = ymin;

			    for(ii = 0; ii<pointsPicked; ii++)
			    {
				xr = xyData[ii][0] - mx0;
				yr = - (xyData[ii][1] - my0);
				// find the transform
				xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
				yf = (y3*ym*xr - x3*ym*yr)/det + y0;
				tarea.value = tarea.value + xf + ',' + yf + '\n';
			    }
			    
			}
			else if (plotType == 'polar')
			{
			    // Center: 0
			    x0 = parseFloat(xyAxes[0][0]);
			    y0 = parseFloat(xyAxes[0][1]);
			    
			    // Known Point: 1
			    x1 = parseFloat(xyAxes[1][0]);
			    y1 = parseFloat(xyAxes[1][1]);
			    
			    // Known Point: 2
			    x2 = parseFloat(xyAxes[2][0]);
			    y2 = parseFloat(xyAxes[2][1]);
			    			    
			    r1 = parseFloat(axesAlignmentData[0]);
			    theta1 = parseFloat(axesAlignmentData[1]); 
			    
			    r2 = parseFloat(axesAlignmentData[2]);
			    theta2 = parseFloat(axesAlignmentData[3]); 
			    
			    isDegrees = axesAlignmentData[4];
			    
			    isClockwise = axesAlignmentData[5];
			    
			    if (isDegrees == true) // if degrees
			    {
			        theta1 = (Math.PI/180.0)*theta1;
				theta2 = (Math.PI/180.0)*theta2;
			    }
			    			    
			    
			    
			    // Distance between 1 and 0.
			    dist10 = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)); 
			    
			    // Distance between 2 and 0
			    dist20 = Math.sqrt((x2-x0)*(x2-x0) + (y2-y0)*(y2-y0)); 
			    
			    // Radial Distance between 1 and 2.
			    dist12 = dist20 - dist10;
			    
			    phi0 = taninverse(-(y1-y0),x1-x0);
			    
			    alpha0 = phi0 - theta1;
			    
			    for(ii = 0; ii<pointsPicked; ii++)
			    {
				xp = xyData[ii][0];
				yp = xyData[ii][1];
				
			        rp = ((r2-r1)/dist12)*(Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0))-dist10) + r1;
				
				thetap = taninverse(-(yp-y0),xp-x0) - alpha0;
				
				if(isDegrees == true)
				  thetap = 180.0*thetap/Math.PI;
				
				tarea.value = tarea.value + rp + ',' + thetap + '\n';
			    }
			    
			}
			else if(plotType == 'ternary')
			{
			    x0 = xyAxes[0][0];
			    y0 = xyAxes[0][1];
			    
			    x1 = xyAxes[1][0];
			    y1 = xyAxes[1][1];
			    
			    x2 = xyAxes[2][0];
			    y2 = xyAxes[2][1];
			    
			    L = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));
			    
			    phi0 = taninverse(-(y1-y0),x1-x0);
			    
			    root3 = Math.sqrt(3);
			    
			    var isRange0to100 = axesAlignmentData[0];
			    var isOrientationNormal = axesAlignmentData[1];
			    		    
			    for(ii = 0; ii<pointsPicked; ii++)
			    {
				xp = xyData[ii][0];
				yp = xyData[ii][1];
				
			        rp = Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0));
				
				thetap = taninverse(-(yp-y0),xp-x0) - phi0;
				
				xx = (rp*Math.cos(thetap))/L;
				yy = (rp*Math.sin(thetap))/L;
				
				ap = 1.0 - xx - yy/root3;
				bp = xx - yy/root3;
				cp = 2.0*yy/root3;
				
				if(isOrientationNormal == false)
				{
				  // reverse axes orientation
				  var bpt = bp;
				  bp = ap;
				  ap = cp;
				  cp = bpt;
				  				  
				}
				
				if (isRange0to100 == true)
				{
				  ap = ap*100; bp = bp*100; cp = cp*100;
				}
				
				tarea.value = tarea.value + ap + ',' + bp + ',' + cp + '\n';
			    }
			    
			}
		}
}



