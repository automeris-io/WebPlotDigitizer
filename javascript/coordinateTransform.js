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

var dataToPixelxy;

/**
 * Pixel to real coordinate.
 * @param {Array} pdata Pixel data
 * @param {Int} pn Number of data points.
 * @param {String} ptype Plot type
 */
 function pixelToData(pdata, pn, ptype) {

    if((axesPicked === 1) && (pn >= 1)) {
        var rdata = [];
        
        if (ptype === 'XY') {

		    var x1 = xyAxes[0][0];
		    var y1 = xyAxes[0][1];
		    
		    var x2 = xyAxes[1][0];
		    var y2 = xyAxes[1][1];
		    
		    var x3 = xyAxes[2][0];
		    var y3 = xyAxes[2][1];

		    var x4 = xyAxes[3][0];
		    var y4 = xyAxes[3][1];
		    
		    var xmin = axesAlignmentData[0];
		    var xmax = axesAlignmentData[1];
		    var ymin = axesAlignmentData[2];
		    var ymax = axesAlignmentData[3];
		    
		    // If x-axis is log scale
		    if (axesAlignmentData[4] === true) {
		        xmin = Math.log(xmin)/Math.log(10);
		        xmax = Math.log(xmax)/Math.log(10);
		    }
		    
		    // If y-axis is log scale
		    if (axesAlignmentData[5] === true) {
		        ymin = Math.log(ymin)/Math.log(10);
		        ymax = Math.log(ymax)/Math.log(10);
		    }

		    var xm = xmax - xmin;
		    var ym = ymax - ymin;
		    
		    var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		    var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		    
		    var Lx = xm/d12; 
		    var Ly = ym/d34;
		    
		    var thetax = taninverse(-(y2-y1), (x2-x1));
		    var thetay = taninverse(-(y4-y3), (x4-x3));
		    
		    var theta = thetay-thetax;
		    

		    for(ii = 0; ii<pn; ii++) {
		    
		        var xp = pdata[ii][0];
		        var yp = pdata[ii][1];
		        
		        var dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
		        var thetaP1 = taninverse(-(yp-y1), (xp-x1)) - thetax;
		        
		        var dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);
		        
			var xf = dx*Lx + xmin;

			var dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));				    
			var thetaP3 = thetay - taninverse(-(yp-y3), (xp-x3));

			var dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);
			
			var yf = dy*Ly + ymin;
			
			// if x-axis is log scale
			if (axesAlignmentData[4] === true)
			    xf = Math.pow(10,xf);
			    
			// if y-axis is log scale
			if (axesAlignmentData[5] === true)
			    yf = Math.pow(10,yf);

			rdata[ii] = new Array();
			rdata[ii][0] = xf;
			rdata[ii][1] = yf;
		    }

		} else if (ptype === 'image') {// same as X-Y, but returns int data and doesn't support log scale.

		    var x1 = onScreenDimensions[0];
		    var y1 = onScreenDimensions[1];
		    
		    var x2 = onScreenDimensions[2];
		    var y2 = onScreenDimensions[1];
		    
		    var x3 = onScreenDimensions[0];
		    var y3 = onScreenDimensions[1];

		    var x4 = onScreenDimensions[0];
		    var y4 = onScreenDimensions[3];
		    
		    var xmin = axesAlignmentData[0];
		    var xmax = axesAlignmentData[1];
		    var ymin = axesAlignmentData[2];
		    var ymax = axesAlignmentData[3];
		    
		    var xm = xmax - xmin;
		    var ym = ymax - ymin;

			// Correction factor to account for the fact that the on screen dimensions are for image
			// corners and do not account for image pixels.
			var cfx = 0.5*(x2 - x1)/(xm+1);
			var cfy = 0.5*(y2 - y1)/(ym+1);

			x1 = x1 + cfx;
			x2 = x2 - cfx;
			y1 = y1 + cfy;
			y2 = y2 - cfy;

		    var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		    var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		    
		    var Lx = xm/d12; 
		    var Ly = ym/d34;
		    
		    var thetax = taninverse(-(y2-y1), (x2-x1));
		    var thetay = taninverse(-(y4-y3), (x4-x3));
		    
		    var theta = thetay-thetax;
		    

		    for(ii = 0; ii<pn; ii++) {
		    
		        var xp = pdata[ii][0];
		        var yp = pdata[ii][1];
		        
		        var dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
		        var thetaP1 = taninverse(-(yp-y1), (xp-x1)) - thetax;
		        
		        var dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);
		        
			var xf = dx*Lx + xmin;

			var dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));				    
			var thetaP3 = thetay - taninverse(-(yp-y3), (xp-x3));

			var dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);
			
			var yf = dy*Ly + ymin;
			
		
			rdata[ii] = new Array();
			rdata[ii][0] = Math.round(xf);
			rdata[ii][1] = Math.round(yf);
		    }
		
		} else if (ptype === 'map') {
		    
		    var mx0 = 0.0; my0 = canvasHeight;
		    var mx1 = 0.0; my1 = 0.0;
		    var mx2 = canvasWidth; my2 = 0;
		    var mx3 = canvasWidth; my3 = canvasHeight;
		    
		    var x1 = mx1 - mx0;
		    var y1 = -(my1 - my0);
		    
		    var x3 = mx3 - mx0;
		    var y3 = -(my3 - my0);
		    		
		    var scaleSize = axesAlignmentData[0];
		    
		    var sx1 = xyAxes[0][0];
		    var sy1 = xyAxes[0][1];
		    var sx2 = xyAxes[1][0];
		    var sy2 = xyAxes[1][1];
		    
		    var scaleLength = scaleSize/Math.sqrt((sx1-sx2)*(sx1-sx2) + (sy1-sy2)*(sy1-sy2));
		    		    
		    var xmin = 0;
		    var xmax = canvasWidth*scaleLength;
		    
		    var ymin = 0;
		    var ymax = canvasHeight*scaleLength;

		    var xm = xmax - xmin;
		    var ym = ymax - ymin;
		
		    var det = x1*y3 - y1*x3;

		    var x0 = xmin;
		    var y0 = ymin;

		    for(ii = 0; ii<pn; ii++) {
			var xr = pdata[ii][0] - mx0;
			var yr = - (pdata[ii][1] - my0);
			// find the transform
			var xf = (-y1*xm*xr + x1*xm*yr)/det + x0;
			var yf = (y3*ym*xr - x3*ym*yr)/det + y0;
			
			rdata[ii] = new Array();
			rdata[ii][0] = xf;
			rdata[ii][1] = yf;
		    }
		    
		} else if (ptype === 'polar') {
		    // Center: 0
		    var x0 = parseFloat(xyAxes[0][0]);
		    var y0 = parseFloat(xyAxes[0][1]);
		    
		    // Known Point: 1
		    var x1 = parseFloat(xyAxes[1][0]);
		    var y1 = parseFloat(xyAxes[1][1]);
		    
		    // Known Point: 2
		    var x2 = parseFloat(xyAxes[2][0]);
		    var y2 = parseFloat(xyAxes[2][1]);
		    			    
		    var r1 = parseFloat(axesAlignmentData[0]);
		    var theta1 = parseFloat(axesAlignmentData[1]); 
		    
		    var r2 = parseFloat(axesAlignmentData[2]);
		    var theta2 = parseFloat(axesAlignmentData[3]); 
		    
		    var isDegrees = axesAlignmentData[4];
		    
		    var isClockwise = axesAlignmentData[5];
		    
		    if (isDegrees === true) {// if degrees

		        theta1 = (Math.PI/180.0)*theta1;
    			theta2 = (Math.PI/180.0)*theta2;
		    }
		    			    
		    // Distance between 1 and 0.
		    var dist10 = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0)); 
		    
		    // Distance between 2 and 0
		    var dist20 = Math.sqrt((x2-x0)*(x2-x0) + (y2-y0)*(y2-y0)); 
		    
		    // Radial Distance between 1 and 2.
		    var dist12 = dist20 - dist10;
		    
		    var phi0 = taninverse(-(y1-y0),x1-x0);
		    
		    var alpha0 = phi0 - theta1;
		    
		    for(ii = 0; ii<pn; ii++) {
			    var xp = pdata[ii][0];
			    var yp = pdata[ii][1];
			
		        var rp = ((r2-r1)/dist12)*(Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0))-dist10) + r1;
			
			    var thetap = taninverse(-(yp-y0),xp-x0) - alpha0;
			
			    if(isDegrees == true)
			      thetap = 180.0*thetap/Math.PI;
			      
    		    rdata[ii] = new Array();
                rdata[ii][0] = rp;
                rdata[ii][1] = thetap;
			
		    }
		    
		} else if(plotType === 'ternary') {

		    var x0 = xyAxes[0][0];
		    var y0 = xyAxes[0][1];
		    
		    var x1 = xyAxes[1][0];
		    var y1 = xyAxes[1][1];
		    
		    var x2 = xyAxes[2][0];
		    var y2 = xyAxes[2][1];
		    
		    var L = Math.sqrt((x0-x1)*(x0-x1) + (y0-y1)*(y0-y1));
		    
		    var phi0 = taninverse(-(y1-y0),x1-x0);
		    
		    var root3 = Math.sqrt(3);
		    
		    var isRange0to100 = axesAlignmentData[0];
		    var isOrientationNormal = axesAlignmentData[1];
		    		    
		    for(ii = 0; ii<pn; ii++) {

			    var xp = pdata[ii][0];
			    var yp = pdata[ii][1];
			
		        var rp = Math.sqrt((xp-x0)*(xp-x0)+(yp-y0)*(yp-y0));
			
			    var thetap = taninverse(-(yp-y0),xp-x0) - phi0;
			
			    var xx = (rp*Math.cos(thetap))/L;
			    var yy = (rp*Math.sin(thetap))/L;
			
			    var ap = 1.0 - xx - yy/root3;
			    var bp = xx - yy/root3;
			    var cp = 2.0*yy/root3;
			
			    if(isOrientationNormal == false) {
			      // reverse axes orientation
			      var bpt = bp;
			      bp = ap;
			      ap = cp;
			      cp = bpt;
			      				  
			    }
			
			    if (isRange0to100 == true) {
			      ap = ap*100; bp = bp*100; cp = cp*100;
			    }
    
    			rdata[ii] = new Array();
                rdata[ii][0] = ap;
                rdata[ii][1] = bp;
                rdata[ii][2] = cp;

		    }
		    
		}
		
		return rdata;

    }
    
    return 0;
 }


 function dataToPixel(xp, yp, ptype) {

	dataToPixelxy = [];

	if (ptype === 'XY') {

		var x1 = xyAxes[0][0];
		var y1 = xyAxes[0][1];
		
		var x2 = xyAxes[1][0];
		var y2 = xyAxes[1][1];
		
		var x3 = xyAxes[2][0];
		var y3 = xyAxes[2][1];

		var x4 = xyAxes[3][0];
		var y4 = xyAxes[3][1];
		
		var xmin = axesAlignmentData[0];
		var xmax = axesAlignmentData[1];
		var ymin = axesAlignmentData[2];
		var ymax = axesAlignmentData[3];
		
		// If x-axis is log scale
		if (axesAlignmentData[4] === true) {
			xmin = Math.log(xmin)/Math.log(10);
			xmax = Math.log(xmax)/Math.log(10);
		}
		
		// If y-axis is log scale
		if (axesAlignmentData[5] === true) {
			ymin = Math.log(ymin)/Math.log(10);
			ymax = Math.log(ymax)/Math.log(10);
		}

		// Get intersection point in pixels
		var xydenom = (x1 - x2)*(y3-y4) - (y1-y2)*(x3 - x4);
		var xx_pix = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/xydenom;
		var yy_pix = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/xydenom;

		// Get intersection point in actual units
		var tempPix = [];
		tempPix[0] = new Array();
		tempPix[0][0] = xx_pix;
		tempPix[0][1] = yy_pix;
		var rtnPix = pixelToData(tempPix, 1, 'XY');
		var xx = rtnPix[0][0];
		var yx = rtnPix[0][1];

		var xm = xmax - xmin;
		var ym = ymax - ymin;
		
		var d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		var d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));
		
		var Lx = xm/d12; 
		var Ly = ym/d34;
		
		var thetax = taninverse(-(y2-y1), (x2-x1));
		var thetay = taninverse(-(y4-y3), (x4-x3));
		
		var theta = thetay-thetax;


		var xf = (xp - xmin)*Math.cos(thetax)/Lx + (yp - yx)*Math.cos(thetay)/Ly + x1;
		var yf = y3 - (xp - xx)*Math.sin(thetax)/Lx - (yp - ymin)*Math.sin(thetay)/Ly;

		dataToPixelxy[0] = xf;
		dataToPixelxy[1] = yf;

	}


	return 0;
}
