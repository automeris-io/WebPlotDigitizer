/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.XStepWithInterpolationAlgo = (function () {
    var Algo = function () {
        var param_xmin, param_delx, param_xmax, 
            param_smoothing, param_ymin, param_ymax;

        this.getParamList = function () {
            var isAligned = wpd.appData.isAligned(),
                axes = wpd.appData.getPlotData().axes;
        
            if(isAligned && axes instanceof wpd.XYAxes) {
                var bounds = axes.getBounds();
                return [["X_min","Units", bounds.x1],["ΔX Step","Units", (bounds.x2 - bounds.x1)/50.0], 
                        ["X_max","Units", bounds.x2],["Y_min","Units", bounds.y3],
                        ["Y_max","Units", bounds.y4],["Smoothing","% of ΔX", 0]];

            } 

            return [["X_min","Units", 0],["ΔX Step","Units", 0.1],
                    ["X_max","Units", 0],["Y_min","Units", 0],
                    ["Y_max","Units", 0],["Smoothing","% of ΔX", 0]];
        };
        
        this.setParam = function (index, val) {
            if (index === 0) {
                param_xmin = val;
            } else if (index === 1) {
                param_delx = val;
            } else if (index === 2) {
                param_xmax = val;
            } else if (index === 3) {
                param_ymin = val;
            } else if (index === 4) {
                param_ymax = val;
            } else if (index === 5) {
                param_smoothing = val;
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                axes = plotData.axes,
                pointsPicked = 0,
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                xi,
                dist_y_px,
                dist_x_px,
                ii, yi, jj, 
                mean_yi,
                y_count,
                pdata,
                pdata0,
                pdata1,
                xpoints = [],
                ypoints = [],
                xpoints_mean = [],
                ypoints_mean = [],
                mean_x, mean_y,
                delx,
                dely,
                xinterp,
                yinterp,
                param_width = Math.abs(param_delx*(param_smoothing/100.0));

            dataSeries.clearAll();

            // Calculate pixel distance between y_min and y_max:
            pdata0 = axes.dataToPixel(param_xmin, param_ymin);
            pdata1 = axes.dataToPixel(param_xmin, param_ymax);
            dist_y_px = Math.sqrt((pdata0.x - pdata1.x)*(pdata0.x - pdata1.x) + (pdata0.y - pdata1.y)*(pdata0.y - pdata1.y));
            dely = (param_ymax - param_ymin)/dist_y_px;

            // Calculate pixel distance between x_min and x_max:
            pdata1 = axes.dataToPixel(param_xmax, param_ymin);
            dist_x_px = Math.sqrt((pdata0.x - pdata1.x)*(pdata0.x - pdata1.x) + (pdata0.y - pdata1.y)*(pdata0.y - pdata1.y));
            delx = (param_xmax - param_xmin)/dist_x_px;

            if(Math.abs(param_width/delx) > 0 && Math.abs(param_width/delx) < 1) {
                param_width = delx;
            }

            xi = param_xmin;
            while( ( delx > 0 && xi <= param_xmax ) || ( delx < 0 && xi >= param_xmax ) ) {

                mean_yi = 0; y_count = 0;
                yi = param_ymin;
                while ( ( dely > 0 && yi <= param_ymax ) || ( dely < 0 && yi >= param_ymax ) ) {
                    pdata = axes.dataToPixel(xi, yi);
                    if (pdata.x > 0 && pdata.y > 0 && pdata.x < dw && pdata.y < dh) {
                        if (autoDetector.binaryData[parseInt(pdata.y, 10)*dw + parseInt(pdata.x, 10)] === true) {
                            mean_yi = (mean_yi*y_count + yi)/(parseFloat(y_count+1));
                            y_count++;
                        }
                    }
                    yi = yi + dely;
                }

                if (y_count > 0) {
                    xpoints[pointsPicked] = parseFloat(xi);
                    ypoints[pointsPicked] = parseFloat(mean_yi);
                    pointsPicked = pointsPicked + 1;
                }

                xi = xi + delx;
            }
            
            if (xpoints.length <= 0 || ypoints.length <= 0) {
                return; // kill if nothing was detected so far.
            }

            if (param_width > 0) {
                xpoints_mean = [];
                ypoints_mean = [];

                xi = xpoints[0];
                while ( (delx > 0 && xi <= xpoints[xpoints.length-1]) || (delx < 0 && xi >= xpoints[xpoints.length-1]) ) {
                    mean_x = 0;
                    mean_y = 0;
                    y_count = 0;
                    for (ii = 0; ii < xpoints.length; ii++) {
                        if (xpoints[ii] <= xi + param_width && xpoints[ii] >= xi - param_width) {
                            mean_x = (mean_x*y_count + xpoints[ii])/parseFloat(y_count + 1);
                            mean_y = (mean_y*y_count + ypoints[ii])/parseFloat(y_count + 1);
                            y_count++;
                        }
                    }

                    if (y_count > 0) {
                        xpoints_mean[xpoints_mean.length] = mean_x;
                        ypoints_mean[ypoints_mean.length] = mean_y;
                    }

                    if(delx > 0) {
                        xi = xi + param_width;
                    } else {
                        xi = xi - param_width;
                    }
                }

            } else {
                xpoints_mean = xpoints;
                ypoints_mean = ypoints;
            }

            if (xpoints_mean.length <= 0 || ypoints_mean.length <= 0) {
                return;
            }

            xinterp = [];
            ii = 0;
            xi = param_xmin;

            if (( delx < 0 && param_delx > 0) || (delx > 0 && param_delx < 0)) {
                return;
            }
            
            while ( (delx > 0 && xi <= param_xmax) || (delx < 0 && xi >= param_xmax) ) {
                xinterp[ii] = xi;
                ii++;
                xi = xi + param_delx;
            }

            if(delx < 0) {
                xpoints_mean = xpoints_mean.reverse();
                ypoints_mean = ypoints_mean.reverse();
            }

            yinterp = numeric.spline(xpoints_mean, ypoints_mean).at(xinterp);

            for(ii = 0; ii < yinterp.length; ii++) {
                if (!isNaN(xinterp[ii]) && !isNaN(yinterp[ii])) {
                    pdata = axes.dataToPixel(xinterp[ii], yinterp[ii]);
                    dataSeries.addPixel(pdata.x, pdata.y);
                }
            }

         };
            
    };
    return Algo;
})();
