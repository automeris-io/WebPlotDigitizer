/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2020 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};

// Simple curve extraction with interpolation, but at user provided independents (x, theta etc.)
wpd.CustomIndependents = class {
    constructor() {
        this._xvals = [];
        this._ymin = 0;
        this._ymax = 0;
        this._smoothing = 0;
        this._curveWidth = 5;
        this._wasRun = false;
    }

    deserialize(obj) {
        this._xvals = obj.xvals;
        this._ymin = obj.ymin;
        this._ymax = obj.ymax;
        this._curveWidth = obj.curveWidth;
        this._smoothing = obj.smoothing;
        this._wasRun = true;
    }

    setParams(params) {
        this._xvals = params.xvals;
        this._ymin = parseFloat(params.ymin);
        this._ymax = parseFloat(params.ymax);
        this._curveWidth = parseFloat(params.curveWidth);
        this._smoothing = parseFloat(params.smoothing);
    }

    getParams() {
        return {
            xvals: this._xvals,
            ymin: this._ymin,
            ymax: this._ymax,
            curveWidth: this._curveWidth,
            smoothing: this._smoothing
        };
    }

    getParamList(axes) {
        if (!this._wasRun) {
            if (axes != null && axes instanceof wpd.XYAxes) {
                let bounds = axes.getBounds();
                this._xvals = "[" + bounds.x1 + ", " + bounds.x2 + "]";
                this._ymin = bounds.y3;
                this._ymax = bounds.y4;
                this._curveWidth = 5;
                this._smoothing = 0;
            }
        }
        return {
            xvals: ["X Values", "Array", this._xvals],
            ymin: ["Y min", "Units", this._ymin],
            ymax: ["Y max", "Units", this._ymax],
            curveWidth: ["Curve Width", "Px", this._curveWidth],
            smoothing: ["Smoothing", "%", this._smoothing]
        };
    }

    serialize() {
        return this._wasRun ? {
            algoType: "CustomIndependents",
            xvals: this._xvals,
            ymin: this._ymin,
            ymax: this._ymax,
            curveWidth: this._curveWidth,
            smoothing: this._smoothing
        } : null;
    }

    run(autoDetector, dataSeries, axes) {
        this._wasRun = true;
        dataSeries.clearAll();

        let inputParser = new wpd.InputParser();
        let parsedVals = inputParser.parse(this._xvals);
        if (parsedVals == null || !inputParser.isArray) {
            return;
        }
        parsedVals.sort();
        let scaled_xmin = parsedVals[0];
        let scaled_xmax = parsedVals[parsedVals.length - 1];
        let scaled_ymin = this._ymin;
        let scaled_ymax = this._ymax;

        let isLogX = axes.isLogX();
        let isLogY = axes.isLogY();
        if (isLogX) {
            scaled_xmin = Math.log10(scaled_xmin);
            scaled_xmax = Math.log10(scaled_xmax);
        }
        if (isLogY) {
            scaled_ymin = Math.log10(scaled_ymin);
            scaled_ymax = Math.log10(scaled_ymax);
        }

        // pixel distance between xmin and xmax, ymin and ymax:
        let xmin_ymin_px = axes.dataToPixel(scaled_xmin, this._ymin);
        let xmax_ymin_px = axes.dataToPixel(scaled_xmax, this._ymin);
        let xmin_ymax_px = axes.dataToPixel(scaled_xmin, this._ymax);
        let distX = Math.sqrt((xmin_ymin_px.x - xmax_ymin_px.x) * (xmin_ymin_px.x - xmax_ymin_px.x) + (xmin_ymin_px.y - xmax_ymin_px.y) * (xmin_ymin_px.y - xmax_ymin_px.y));
        let distY = Math.sqrt((xmin_ymin_px.x - xmin_ymax_px.x) * (xmin_ymin_px.x - xmin_ymax_px.x) + (xmin_ymin_px.y - xmin_ymax_px.y) * (xmin_ymin_px.y - xmin_ymax_px.y));

        // change in axes units per pixel:
        let delX = (scaled_xmax - scaled_xmin) / distX;
        let delY = (scaled_ymax - scaled_ymin) / distY;

        let imageWidth = autoDetector.imageWidth;
        let imageHeight = autoDetector.imageHeight;
        let xpoints = [];
        let ypoints = [];

        for (let xi = scaled_xmin - 2.0 * delX; xi <= scaled_xmax + 2.0 * delX; xi += delX) {
            let mean_yi = 0;
            let y_count = 0;
            let yi = delY > 0 ? scaled_ymin : scaled_ymax;
            while ((delY > 0 && yi <= scaled_ymax) || (delY < 0 && yi >= scaled_ymin)) {
                let px = axes.dataToPixel(isLogX ? Math.pow(10, xi) : xi,
                    isLogY ? Math.pow(10, yi) : yi);
                if (px.x >= 0 && px.y >= 0 && px.x < imageWidth && px.y < imageHeight) {
                    if (autoDetector.binaryData.has(parseInt(px.y, 10) * imageWidth +
                            parseInt(px.x, 10))) {
                        mean_yi += yi;
                        y_count++;
                    }
                }
                yi += delY;
            }

            if (y_count > 0) {
                mean_yi /= y_count;
                xpoints.push(parseFloat(xi));
                ypoints.push(parseFloat(mean_yi));
            }
        }

        if (xpoints.length <= 0 || ypoints.length <= 0) {
            return;
        }

        let xpointsMean = [];
        let ypointsMean = [];
        if (this._curveWidth > 0) {
            for (let ptIdx = 0; ptIdx < xpoints.length; ptIdx += this._curveWidth) {
                let meanX = 0;
                let meanY = 0;
                let neighborCount = 0;
                let currPx = axes.dataToPixel(xpoints[ptIdx], ypoints[ptIdx]);
                for (let nIdx = 0; nIdx < xpoints.length; nIdx++) {
                    let nPx = axes.dataToPixel(xpoints[nIdx], ypoints[nIdx]);
                    if (Math.abs(currPx.x - nPx.x) < this._curveWidth && Math.abs(currPx.y - nPx.y) < this._curveWidth) {
                        meanX += xpoints[nIdx];
                        meanY += ypoints[nIdx];
                        neighborCount++;
                    }
                }
                meanX /= neighborCount;
                meanY /= neighborCount;
                xpointsMean.push(meanX);
                ypointsMean.push(meanY);
            }
        } else {
            xpointsMean = xpoints;
            ypointsMean = ypoints;
        }

        // Cubic spline
        let cs = wpd.cspline(xpointsMean, ypointsMean);
        if (cs == null) {
            return;
        }

        let yinterp = [];
        for (let ptIdx = 0; ptIdx < parsedVals.length; ptIdx++) {
            if (isNaN(parsedVals[ptIdx])) {
                continue;
            }

            let yinterp = wpd.cspline_interp(cs, parsedVals[ptIdx]);
            if (yinterp == null) {
                continue;
            }

            let px = axes.dataToPixel(isLogX ? Math.pow(10, parsedVals[ptIdx]) : parsedVals[ptIdx], isLogY ? Math.pow(10, yinterp) : yinterp);
            dataSeries.addPixel(px.x, px.y);
        }
    }
};