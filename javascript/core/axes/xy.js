/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

            isXDate = false, isYDate = false,

            initialFormattingX, initialFormattingY,

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
                    cp4 = cal.getPoint(3),
                    ip = new wpd.InputParser();
                
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

                // Check for dates, validity etc.

                // Validate X-Axes:
                xmin = ip.parse(xmin);
                if(!ip.isValid) { return false; }
                isXDate = ip.isDate;
                xmax = ip.parse(xmax);
                if(!ip.isValid || (ip.isDate != isXDate)) { return false; }
                initialFormattingX = ip.formatting; 

                // Validate Y-Axes:
                ymin = ip.parse(ymin);
                if(!ip.isValid) { return false; }
                isYDate = ip.isDate;
                ymax = ip.parse(ymax);
                if(!ip.isValid || (ip.isDate != isYDate)) { return false; }
                initialFormattingY = ip.formatting; 

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
        
        this.getBounds = function() {
            return {
                x1: xmin,
                x2: xmax,
                y3: ymin,
                y4: ymax
            };
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
            var xydenom, xx_pix, yy_pix, 
                rtnPix, xx, yx, xf, yf;

            // Get intersection point in pixels
            xydenom = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4);
            xx_pix = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4))/xydenom;
            yy_pix = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4))/xydenom;

            // Get intersection point in actual units
        	rtnPix = this.pixelToData(xx_pix, yy_pix);
	    	xx = rtnPix[0];
		    yx = rtnPix[1];

            xf = (x - xmin)*Math.cos(thetax)/Lx + (y - yx)*Math.cos(thetay)/Ly + x1;
            yf = y3 - (x - xx)*Math.sin(thetax)/Lx - (y - ymin)*Math.sin(thetay)/Ly;

            return {
                x: xf,
                y: yf
            };
        };

        this.pixelToLiveString = function(pxi, pyi) {
            var rtnString = '',
                dataVal = this.pixelToData(pxi, pyi);
            if(isXDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[0], initialFormattingX);
            } else {
                rtnString += dataVal[0].toExponential(4);
            }
            rtnString += ', ';

            if(isYDate) {
                rtnString += wpd.dateConverter.formatDateNumber(dataVal[1], initialFormattingY);
            } else {
                rtnString += dataVal[1].toExponential(4);
            }
            return rtnString;
        };

        this.isDate = function (varIndex) {
            if(varIndex === 0) {
                return isXDate;
            } else {
                return isYDate;
            }
        };

        this.getInitialDateFormat = function (varIndex) {
            if(varIndex === 0) {
                return initialFormattingX;
            } else {
                return initialFormattingY;
            }
        };
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 4;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['X', 'Y'];
    };

    return AxesObj;

})();
