/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2025 Ankit Rohatgi

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

var wpd = wpd || {};

wpd.XStepWithInterpolationAlgo = class {
    constructor() {
        this._xmin = 0;
        this._xmax = 1;
        this._delx = 0.1;
        this._smoothing = 0;
        this._ymin = 0;
        this._ymax = 0;
        this._wasRun = false;
    }

    getParamList(axes) {
        if (!this._wasRun) {
            if (axes != null && axes instanceof wpd.XYAxes) {
                let bounds = axes.getBounds();
                this._xmin = bounds.x1;
                this._xmax = bounds.x2;
                this._delx = (bounds.x2 - bounds.x1) / 50.0;
                this._ymin = bounds.y3;
                this._ymax = bounds.y4;
                this._smoothing = 0;
            }
        }
        return {
            xmin: ["X_min", "Units", this._xmin],
            delx: ["ΔX Step", "Units", this._delx],
            xmax: ["X_max", "Units", this._xmax],
            ymin: ["Y_min", "Units", this._ymin],
            ymax: ["Y_max", "Units", this._ymax],
            smoothing: ["Smoothing", "% of ΔX", this._smoothing]
        };
    }

    setParams(params) {
        this._xmin = parseFloat(params.xmin);
        this._delx = parseFloat(params.delx);
        this._xmax = parseFloat(params.xmax);
        this._ymin = parseFloat(params.ymin);
        this._ymax = parseFloat(params.ymax);
        this._smoothing = parseFloat(params.smoothing);
    }

    getParams() {
        return {
            xmin: this._xmin,
            delx: this._delx,
            xmax: this._xmax,
            ymin: this._ymin,
            ymax: this._ymax,
            smoothing: this._smoothing
        };
    }

    serialize() {
        return this._wasRun ? {
                algoType: "XStepWithInterpolationAlgo",
                xmin: this._xmin,
                delx: this._delx,
                xmax: this._xmax,
                ymin: this._ymin,
                ymax: this._ymax,
                smoothing: this._smoothing
            } :
            null;
    }

    deserialize(obj) {
        this._xmin = obj.xmin;
        this._delx = obj.delx;
        this._xmax = obj.xmax;
        this._ymin = obj.ymin;
        this._ymax = obj.ymax;
        this._smoothing = obj.smoothing;
        this._wasRun = true;
    }

    run(autoDetector, dataSeries, axes, imageData) {
        this._wasRun = true;
        var pointsPicked = 0,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            xi,
            dist_y_px, dist_x_px, ii, yi, jj, mean_yi, y_count, pdata, pdata0, pdata1, xpoints = [],
            ypoints = [],
            xpoints_mean = [],
            ypoints_mean = [],
            mean_x, mean_y, delx, dely, xinterp,
            yinterp, param_width = Math.abs(this._delx * (this._smoothing / 100.0)),
            cs,
            isLogX = axes.isLogX(),
            isLogY = axes.isLogY(),
            isLogXNegative = axes.isLogXNegative(),
            isLogYNegative = axes.isLogYNegative(),
            logXFactor = isLogXNegative ? -1.0 : 1.0,
            logYFactor = isLogYNegative ? -1.0 : 1.0,
            isDateX = axes.isDate(0),
            isDateY = axes.isDate(1),
            scaled_param_xmin = this._xmin,
            scaled_param_xmax = this._xmax,
            scaled_param_ymin = this._ymin,
            scaled_param_ymax = this._ymax,
            scaled_param_width = param_width,
            scaled_param_delx = this._delx;

        dataSeries.clearAll();

        if (isLogX) {
            scaled_param_xmax = Math.log10(logXFactor * scaled_param_xmax);
            scaled_param_xmin = Math.log10(logXFactor * scaled_param_xmin);
            scaled_param_width = Math.abs(Math.log10(logXFactor * this._delx) * this._smoothing / 100.0);
            scaled_param_delx = logXFactor * Math.log10(logXFactor * scaled_param_delx);
        }
        if (isLogY) {
            scaled_param_ymin = Math.log10(logYFactor * scaled_param_ymin);
            scaled_param_ymax = Math.log10(logYFactor * scaled_param_ymax);
        }

        // Calculate pixel distance between y_min and y_max:
        pdata0 = axes.dataToPixel(this._xmin, this._ymin);
        pdata1 = axes.dataToPixel(this._xmin, this._ymax);
        dist_y_px = Math.sqrt((pdata0.x - pdata1.x) * (pdata0.x - pdata1.x) +
            (pdata0.y - pdata1.y) * (pdata0.y - pdata1.y));
        dely = (scaled_param_ymax - scaled_param_ymin) / dist_y_px;

        // Calculate pixel distance between x_min and x_max:
        pdata1 = axes.dataToPixel(this._xmax, this._ymin);
        dist_x_px = Math.sqrt((pdata0.x - pdata1.x) * (pdata0.x - pdata1.x) +
            (pdata0.y - pdata1.y) * (pdata0.y - pdata1.y));
        delx = (scaled_param_xmax - scaled_param_xmin) / dist_x_px;

        if (Math.abs(scaled_param_width / delx) > 0 && Math.abs(scaled_param_width / delx) < 1) {
            scaled_param_width = delx;
        }

        xi = delx > 0 ? scaled_param_xmin - 2 * delx : scaled_param_xmin + 2 * delx;
        while ((delx > 0 && xi <= scaled_param_xmax + 2 * delx) ||
            (delx < 0 && xi >= scaled_param_xmax - 2 * delx)) {

            mean_yi = 0;
            y_count = 0;
            yi = scaled_param_ymin;
            while ((dely > 0 && yi <= scaled_param_ymax) || (dely < 0 && yi >= scaled_param_ymax)) {
                pdata = axes.dataToPixel(isLogX ? logXFactor * Math.pow(10, xi) : xi,
                    isLogY ? logYFactor * Math.pow(10, yi) : yi);
                if (pdata.x >= 0 && pdata.y >= 0 && pdata.x < dw && pdata.y < dh) {
                    if (autoDetector.binaryData.has(parseInt(pdata.y, 10) * dw +
                            parseInt(pdata.x, 10))) {
                        mean_yi = (mean_yi * y_count + yi) / (parseFloat(y_count + 1));
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

        if (scaled_param_width > 0) {
            xpoints_mean = [];
            ypoints_mean = [];

            xi = xpoints[0];
            while ((delx > 0 && xi <= xpoints[xpoints.length - 1]) ||
                (delx < 0 && xi >= xpoints[xpoints.length - 1])) {
                mean_x = 0;
                mean_y = 0;
                y_count = 0;
                for (ii = 0; ii < xpoints.length; ii++) {
                    if (xpoints[ii] <= xi + scaled_param_width &&
                        xpoints[ii] >= xi - scaled_param_width) {
                        mean_x = (mean_x * y_count + xpoints[ii]) / parseFloat(y_count + 1);
                        mean_y = (mean_y * y_count + ypoints[ii]) / parseFloat(y_count + 1);
                        y_count++;
                    }
                }

                if (y_count > 0) {
                    xpoints_mean[xpoints_mean.length] = mean_x;
                    ypoints_mean[ypoints_mean.length] = mean_y;
                }

                if (delx > 0) {
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
        xi = scaled_param_xmin;

        if ((delx < 0 && this._delx > 0) || (delx > 0 && this._delx < 0)) {
            return;
        }

        while ((delx > 0 && xi <= scaled_param_xmax) || (delx < 0 && xi >= scaled_param_xmax)) {
            xinterp[ii] = xi;
            ii++;
            xi = xi + scaled_param_delx;
        }

        if (delx < 0) {
            xpoints_mean = xpoints_mean.reverse();
            ypoints_mean = ypoints_mean.reverse();
        }

        // Cubic spline interpolation:
        cs = wpd.cspline(xpoints_mean, ypoints_mean);
        if (cs != null) {
            yinterp = [];
            for (ii = 0; ii < xinterp.length; ++ii) {
                if (!isNaN(xinterp[ii])) {
                    yinterp[ii] = wpd.cspline_interp(cs, xinterp[ii]);
                    if (yinterp[ii] !== null) {
                        pdata = axes.dataToPixel(isLogX ? logXFactor * Math.pow(10, xinterp[ii]) : xinterp[ii],
                            isLogY ? logYFactor * Math.pow(10, yinterp[ii]) : yinterp[ii]);
                        dataSeries.addPixel(pdata.x, pdata.y);
                    }
                }
            }
        }
    }
};
