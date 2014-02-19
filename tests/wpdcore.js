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

var loadScript;
/**
 * Loads an external JS file.
 */
function loadJS(jsfile) {

  if(jsfile != '') {
    unloadJS();
    
    loadScript=document.createElement('script');
    loadScript.setAttribute("type","text/javascript");
    loadScript.setAttribute("src", jsfile);
    loadScript.setAttribute("Id","loadedJS");
    loadScript.setAttribute("onerror","alert('Error loading file!');");
    
    if (typeof loadScript!="undefined")
      document.getElementsByTagName("head")[0].appendChild(loadScript);
    else
      alert('Error loading script!');
     
  }
}

function unloadJS() {

  var getJSelement = document.getElementById('loadedJS');
  if (getJSelement)
    getJSelement.parentNode.removeChild(getJSelement);
}

function AEObject() {
  this.getParamList = function() {};
  this.run = function() {};
}

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

var wpd = wpd || {};
// maintain and manage current state of the application
wpd.appState = (function () {
    var isAligned = false,
        axesType,
        pointsPicked = 0;

    function reset() {
        isAligned = false;
        axesType = null;
        pointsPicked = 0;
    }

    return {
        aligned: function(is_aligned) {
            if(is_aligned != null) {
                isAligned = is_aligned;
            }
            return isAligned;
        },
        reset: reset
    };
})();
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
			// corners and do not account for image pixel being counted from the middle of a pixel.
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
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

// calibration info
wpd.Calibration = (function () {

    var Calib = function(dim) {
        // Pixel information
        var px = [];
        var py = [];

        // Data information
        var dimensions = dim == null ? 2 : dim;
        var dp = [];

        this.getCount = function () { return px.length; };
        this.getDimensions = function() { return dimensions; };
        this.addPoint = function(pxi, pyi, dxi, dyi, dzi) {
            var plen = px.length, dlen = dp.length;
            px[plen] = pxi;
            py[plen] = pyi;
            dp[dlen] = dxi; dp[dlen+1] = dyi;
            if(dimensions === 3) {
                dp[dlen+2] = dzi;
            }
        };
        this.getPoint = function(index) {
            if(index < 0 || index >= px.length) return null;

            return {
                px: px[index],
                py: py[index],
                dx: dp[dimensions*index],
                dy: dp[dimensions*index+1],
                dz: dimensions === 2 ? null : dp[dimensions*index + 2]
            };
        };
    };
    return Calib;
})();

// Data from a series
wpd.DataSeries = (function () {
    return function (dim) {
        var pixels = []; // flat array to store (x,y) pixel info.
        
        this.addPixel = function(pxi, pyi) {
            var plen = pixels.length;
            pixels[plen] = pxi;
            pixels[plen+1] = pyi;
        };

        this.insertPixel = function(pxi, pyi, index) {

        };

        this.removePixelAtIndex = function(index) {

        };

        this.removeLastPixel = function() {
            var pIndex = pixels.length/2;
            this.removePixelAtIndex(pIndex);
        };

        this.removeNearestPixel = function(x, y, threshold) {
        };

        this.reset = function() { pixels = []; };
        this.getCount = function() { return pixels.length/2; }
    };
})();


// Plot information
wpd.PlotData = (function () {
    var PlotData = function() {
        this.axes = null;
        this.dataSeriesColl = [];
    };

    PlotData.prototype.reset = function () {
        this.axes = null;
        this.dataSeriesColl = [];
    };
   
    return PlotData;
})();
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

/* Parse dates and convert back and forth to Julian days */

var dateConverter = {
	
	parse: function(input) {
				if(input == null) {
					return null;
				}

				if(input.indexOf("/") === -1) {
					return null;
				}

				return this.toJD(input);
			},

	// Convert to Julian Date
	toJD: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					day,
					tempDate,
					rtnValue;

				if(dateParts.length <= 0 || dateParts.length > 3) {
					return null;
				}

				year = parseInt(dateParts[0], 10);

				month = parseInt(dateParts[1] === undefined ? 0 : dateParts[1], 10);

				date = parseInt(dateParts[2] === undefined ? 1 : dateParts[2], 10);

				if(isNaN(year) || isNaN(month) || isNaN(date)) {
					return null;
				}

				if(month > 12 || month < 1) {
					return null;
				}

				if(date > 31 || date < 1) {
					return null;
				}

				// Temporary till I figure out julian dates:
				tempDate = new Date();
				tempDate.setUTCFullYear(year);
				tempDate.setUTCMonth(month-1);
				tempDate.setUTCDate(date);
				rtnValue = parseFloat(Date.parse(tempDate));
				if(!isNaN(rtnValue)) {
					return rtnValue;
				}
				return null;
			},

	// Convert back from Julian Date
	fromJD: function(jd) {

				// Temporary till I figure out julian dates:
				jd = parseFloat(jd);
				var msInDay = 24*60*60*1000,
					roundedDate = parseInt(Math.round(jd/msInDay)*msInDay,10),
					tempDate = new Date(roundedDate);

				return tempDate;
			},

	formatDate: function(dateObject, formatString) {
				var longMonths = [
									"January", 
									"February", 
									"March", 
									"April", 
									"May", 
									"June", 
									"July", 
									"August", 
									"September",
									"October",
									"November",
									"December"
								],
					shortMonths = [
									"Jan",
									"Feb",
									"Mar",
									"Apr",
									"May",
									"Jun",
									"Jul",
									"Aug",
									"Sep",
									"Oct",
									"Nov",
									"Dec"
								];
				
				var outputString = formatString;

				outputString = outputString.replace("YYYY", "yyyy");
				outputString = outputString.replace("YY", "yy");
				outputString = outputString.replace("MMMM", "mmmm");
				outputString = outputString.replace("MMM", "mmm");
				outputString = outputString.replace("MM", "mm");
				outputString = outputString.replace("DD", "dd");

				outputString = outputString.replace("yyyy", dateObject.getUTCFullYear());

				var twoDigitYear = dateObject.getUTCFullYear()%100;
				twoDigitYear = twoDigitYear < 10 ? '0' + twoDigitYear : twoDigitYear;

				outputString = outputString.replace("yy", twoDigitYear);

				outputString = outputString.replace("mmmm", longMonths[dateObject.getUTCMonth()]);
				outputString = outputString.replace("mmm", shortMonths[dateObject.getUTCMonth()]);
				outputString = outputString.replace("mm", (dateObject.getUTCMonth()+1));
				
				outputString = outputString.replace("dd", dateObject.getUTCDate());
				
				return outputString;
			},

	getFormatString: function(dateString) {
				var dateParts = dateString.split("/"),
					year,
					month,
					date,
					formatString = 'yyyy/mm/dd';
				
				if(dateParts.length >= 1) {
					formatString = 'yyyy';
				}

				if(dateParts.length >= 2) {
					formatString += '/mm';
				}

				if(dateParts.length === 3) {
					formatString += '/dd';
				}

				return formatString;
			}
};
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

/* This file contains image processing functions */

/** 
 * Finds differences between two sets of ImageData and returns a difference matrix. 'true' where unmatched, 'false' where pixels match.
 * @params {ImageData} d1 first ImageData
 * @params {ImageData} d2 second ImageData
 */
function findDifference(d1,d2) {
    var dw = canvasWidth;
    var dh = canvasHeight;
    var diff = new Array();
    
    for (var rowi = 0; rowi < dh; rowi++) {
		diff[rowi] = new Array();
		for(var coli = 0; coli < dw; coli++) {
			var index = rowi*4*dw + coli*4;
			diff[rowi][coli] = false;
			
			for(var p = 0; p < 4; p++) {
				if (d1.data[index+p] != d2.data[index+p]) {
					diff[rowi][coli] = true;
				}
			}
	    
		}
    }
    
    return diff;
}

/**
 * Copies pixels based on the difference matrix. 
 */
function copyUsingDifference(copyTo, copyFrom, diff) {
    var dw = canvasWidth;
    var dh = canvasHeight;
    
    for (var rowi = 0; rowi < dh; rowi++) {
		for(var coli = 0; coli < dw; coli++) {
			var index = rowi*4*dw + coli*4;
				
			if (diff[rowi][coli] === true)
			for(var p = 0; p < 4; p++)
				copyTo.data[index+p] = copyFrom.data[index+p];
				   
		}
    }
    
    return copyTo;
}

/** 
 * create BW image based on the colors specified.
 */
function colorSelect(imgd, mode, colorRGB, tol) {
    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {
		seldata[rowi] = new Array();
		for(var coli=0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			ir = imgd.data[index];
			ig = imgd.data[index+1];
			ib = imgd.data[index+2];
			
			dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib+bluev)*(ib+bluev));
			
			seldata[rowi][coli] = false;
			
			if (mode === 'fg') {
				if (dist <= tol) {
					seldata[rowi][coli] = true;
				}

			} else if (mode === 'bg') {

				if (dist > tol) {
					seldata[rowi][coli] = true;
				}
			}
		}
    }
    
    return seldata;
}

/**
 * create BW image based on the colors but only in valid region of difference matrix.
 */
function colorSelectDiff(imgd, mode, colorRGB, tol, diff) {

    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {
		seldata[rowi] = new Array();
		for(var coli=0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			var ir = imgd.data[index];
			var ig = imgd.data[index+1];
			var ib = imgd.data[index+2];
			
			var dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev));
			
			seldata[rowi][coli] = false;
			
			if ((mode === 'fg') && (diff[rowi][coli] === 1)) {
				if (dist <= tol) {
					seldata[rowi][coli] = true;
				}
			} else if ((mode === 'bg') && (diff[rowi][coli] === 1)) {
				if (dist > tol) {
					seldata[rowi][coli] = true;
				}
			}
		}
    }
    
    return seldata;
}

/**
 * Select from marked region of interest based on color.
 */
function selectFromMarkedRegion(mode, colorRGB, tol) {

    dw = canvasWidth;
    dh = canvasHeight;
    
    redv = colorRGB[0];
    greenv = colorRGB[1];
    bluev = colorRGB[2];
    
    var markedRegion = dataCtx.getImageData(0,0,canvasWidth,canvasHeight);
    var imgd = getCanvasData();
    
    var seldata = new Array();
    
    for (var rowi=0; rowi < dh; rowi++) {

	    seldata[rowi] = new Array();
	    for(var coli=0; coli < dw; coli++) {
	        index = rowi*4*dw + coli*4;
	        
	        // marked region
	        var mr = markedRegion.data[index];
	        var mg = markedRegion.data[index+1];
	        var mb = markedRegion.data[index+2];
	        
	        // plot data
	        var ir = imgd.data[index];
	        var ig = imgd.data[index+1];
	        var ib = imgd.data[index+2];
	        
       	    seldata[rowi][coli] = false;
       	    
       	    if ((mr === 255) && (mg ===  255) && (mb === 0)) {// yellow marked region

       	        var dist = Math.sqrt((ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev));
       	        
       	        if ((mode === 'fg') && (dist <= tol))
       	            seldata[rowi][coli] = true;
       	        else if ((mode === 'bg') && (dist > tol))
       	            seldata[rowi][coli] = true;
       	    }
	    }
	 }
	 
	 return seldata;
}

/**
 * Populate an ImageData array based on a binary data matrix.
 */
function binaryToImageData(bwdata,imgd) {
    dw = canvasWidth;
    dh = canvasHeight;
         
    for(var rowi = 0; rowi < dh; rowi++) {
		for(var coli = 0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;
			if (bwdata[rowi][coli] === false) {
				imgd.data[index] = 255; imgd.data[index+1] = 255; imgd.data[index+2] = 255; imgd.data[index+3] = 255;
			} else {
				imgd.data[index] = 0; imgd.data[index+1] = 0; imgd.data[index+2] = 0; imgd.data[index+3] = 255;
			}
		}
	}
    
    return imgd;
}


function getImageDataBasedOnSelection(imgdout, mode, colorRGB, tol) {
	var dw = canvasWidth,
		dh = canvasHeight,
		rowi,
		coli,
		index,
		dist,
		
		redv = colorRGB[0],
		greenv = colorRGB[1],
		bluev = colorRGB[2],
		
		markedRegion = dataCtx.getImageData(0,0,canvasWidth,canvasHeight),
		
		imgd = currentScreen,
		
		mr, mg, mb,
		ir, ig, ib,
		markPixelWhite;

	for(rowi = 0; rowi < dh; rowi++) {
		for(coli = 0; coli < dw; coli++) {
			index = rowi*4*dw + coli*4;

	        // marked region RGB
	        mr = markedRegion.data[index];
	        mg = markedRegion.data[index+1];
	        mb = markedRegion.data[index+2];
	        
	        // plot data
	        ir = imgd.data[index];
	        ig = imgd.data[index+1];
			ib = imgd.data[index+2];

			// set default to white
			markPixelWhite = true;
       	    
       	    if ((mr === 255) && (mg ===  255) && (mb === 0)) {// yellow marked region

       	        dist = (ir-redv)*(ir-redv) + (ig-greenv)*(ig-greenv) + (ib-bluev)*(ib-bluev);
       	        
       	        if ((mode === 'fg') && (dist <= tol*tol)) {
					markPixelWhite = false;

				} else if ((mode === 'bg') && (dist > tol*tol)) {
					markPixelWhite = false;
				}
			}

			if(markPixelWhite) {

				imgdout.data[index] = 255;
				imgdout.data[index+1] = 255;
				imgdout.data[index+2] = 255;
				imgdout.data[index+3] = 255;

			} else {
				
				imgdout.data[index] = 0;
				imgdout.data[index+1] = 0;
				imgdout.data[index+2] = 0;
				imgdout.data[index+3] = 255;
			}
		}
	}

	return imgdout;
}

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

/* Parse user provided expressions, dates etc. */

var InputParser = function () {
	var self = this;

	self.parse = function(input) {
		
		self.isValid = false;
		self.isDate = false;

		if (input == null) {
			return null;
		}

		input = input.trim();

		if (input.indexOf("^") !== -1) {
			return null;
		}

		var parsedDate = dateConverter.parse(input);
		if(parsedDate !== null) {
			self.isValid = true;
			self.isDate = true;
			return parsedDate;
		}

		var parsedFloat = parseFloat(input);
		if(!isNaN(parsedFloat)) {
			self.isValid = true;
			return parsedFloat;
		}

		return null;
	};

	self.isValid = false;

	self.isDate = false;
};
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


/** 
 * Calculate inverse tan with range between 0, 2*pi.
 */
var wpd = wpd || {};

wpd.taninverse = function(y,x) {
    var inv_ans;
    if (y>0) // I & II
    inv_ans = Math.atan2(y,x);
    else if (y<=0) // III & IV
    inv_ans = Math.atan2(y,x) + 2*Math.PI;

    if(inv_ans >= 2*Math.PI)
    inv_ans = 0.0;
    return inv_ans;
};
/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.XYAxes = (function () {

    var AxesObj = function () {
        var calibration,
            isCalibrated = false,
            isLogScaleX = false,
            isLogScaleY = false,

            x1, x2, x3, x4, y1, y2, y3, y4,
            xmin, xmax, ymin, ymax, xm, ym,
            d12, d34, Lx, Ly, 
            thetax, thetay, theta,

            processCalibration = function(cal, isLogX, isLogY) {

                if(cal.getCount() < 4) {
                    return false;
                }

                var cp1 = cal.getPoint(0),
                    cp2 = cal.getPoint(1),
                    cp3 = cal.getPoint(2),
                    cp4 = cal.getPoint(3);
                
                x1 = cp1.px;
                y1 = cp1.py;
                x2 = cp2.px;
                y2 = cp2.py;
                x3 = cp3.px;
                y3 = cp3.py;
                x4 = cp4.px;
                y4 = cp4.py;

                xmin = cp1.dx;
                xmax = cp2.dx;
                ymin = cp3.dy;
                ymax = cp4.dy;

                isLogScaleX = isLogX;
                isLogScaleY = isLogY;

                // If x-axis is log scale
                if (isLogScaleX === true)
                {
                    xmin = Math.log(xmin)/Math.log(10);
                    xmax = Math.log(xmax)/Math.log(10);
                }

                // If y-axis is log scale
                if (isLogScaleY === true)
                {
                     ymin = Math.log(ymin)/Math.log(10);
                     ymax = Math.log(ymax)/Math.log(10);
                }

                xm = xmax - xmin;
                ym = ymax - ymin;

                d12 = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
                d34 = Math.sqrt((x3-x4)*(x3-x4) + (y3-y4)*(y3-y4));

                Lx = xm/d12;
                Ly = ym/d34;

                thetax = wpd.taninverse(-(y2-y1), (x2-x1));
                thetay = wpd.taninverse(-(y4-y3), (x4-x3));

                theta = thetay-thetax;
                calibration = cal;
                return true;
            };


        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function(calib, isLogX, isLogY) {
            isCalibrated = processCalibration(calib, isLogX, isLogY);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                xp, yp, xf, yf, dP1, dP3, thetaP1, thetaP3,
                dx, dy;

            xp = parseFloat(pxi);
            yp = parseFloat(pyi);

            dP1 = Math.sqrt((xp-x1)*(xp-x1) + (yp-y1)*(yp-y1));
            thetaP1 = wpd.taninverse(-(yp-y1), (xp-x1)) - thetax;
            dx = dP1*Math.cos(thetaP1) - dP1*Math.sin(thetaP1)/Math.tan(theta);

            xf = dx*Lx + xmin;

            dP3 = Math.sqrt((xp-x3)*(xp-x3) + (yp-y3)*(yp-y3));
            thetaP3 = thetay - wpd.taninverse(-(yp-y3), (xp-x3));
            dy = dP3*Math.cos(thetaP3) - dP3*Math.sin(thetaP3)/Math.tan(theta);

            yf = dy*Ly + ymin;

            // if x-axis is log scale
            if (isLogScaleX === true)
                xf = Math.pow(10,xf);

            // if y-axis is log scale
            if (isLogScaleY === true)
                yf = Math.pow(10,yf);

            data[0] = xf;
            data[1] = yf;

            return data;
        };

        this.dataToPixel = function(x, y) {
            return {
                px: 0,
                py: 0
            };
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 4;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    return AxesObj;

})();
module.exports = wpd;
