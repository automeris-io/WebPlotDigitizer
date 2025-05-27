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

wpd.AveragingWindowWithStepSizeAlgo = class {

    constructor() {
        this._xmin = 0;
        this._xmax = 0;
        this._delx = 0.1;
        this._lineWidth = 30;
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
                this._ymin = bounds.y3;
                this._ymax = bounds.y4;
            }
        }

        return {
            xmin: ["X_min", "Units", this._xmin],
            delx: ["ΔX Step", "Units", this._delx],
            xmax: ["X_max", "Units", this._xmax],
            ymin: ["Y_min", "Units", this._ymin],
            ymax: ["Y_max", "Units", this._ymax],
            lineWidth: ["Line width", "Px", this._lineWidth]
        };
    }

    setParams(params) {
        this._xmin = parseFloat(params.xmin);
        this._delx = parseFloat(params.delx);
        this._xmax = parseFloat(params.xmax);
        this._ymin = parseFloat(params.ymin);
        this._ymax = parseFloat(params.ymax);
        this._lineWidth = parseFloat(params.lineWidth);
    }

    getParams() {
        return {
            xmin: this._xmin,
            delx: this._delx,
            xmax: this._xmax,
            ymin: this._ymin,
            ymax: this._ymax,
            lineWidth: this._lineWidth
        };
    }

    serialize() {
        return this._wasRun ? {
                algoType: "AveragingWindowWithStepSizeAlgo",
                xmin: this._xmin,
                delx: this._delx,
                xmax: this._xmax,
                ymin: this._ymin,
                ymax: this._ymax,
                lineWidth: this._lineWidth
            } :
            null;
    }

    deserialize(obj) {
        this._xmin = obj.xmin;
        this._delx = obj.delx;
        this._xmax = obj.xmax;
        this._ymin = obj.ymin;
        this._ymax = obj.ymax;
        this._lineWidth = obj.lineWidth;
        this._wasRun = true;
    }

    run(autoDetector, dataSeries, axes, imageData) {
        this._wasRun = true;
        var pointsPicked = 0,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            blobx = [],
            bloby = [],
            xi, xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix,
            r_unit_per_pix, step_pix, blobActive, blobEntry, blobExit, blobExitLocked, ii, yi,
            mean_ii, mean_yi, pdata;

        dataSeries.clearAll();

        for (xi = this._xmin; xi <= this._xmax; xi += this._delx) {
            step_pix = 1;

            pdata = axes.dataToPixel(xi, this._ymin);
            xmin_pix = pdata.x;
            ymin_pix = pdata.y;

            pdata = axes.dataToPixel(xi, this._ymax);
            xmax_pix = pdata.x;
            ymax_pix = pdata.y;

            dpix = Math.sqrt((ymax_pix - ymin_pix) * (ymax_pix - ymin_pix) +
                (xmax_pix - xmin_pix) * (xmax_pix - xmin_pix));
            r_unit_per_pix = (this._ymax - this._ymin) / dpix;

            blobActive = false;
            blobEntry = 0;
            blobExit = 0;
            // To account for noise or if actual thickness is less than specified thickness.
            // This flag helps to set blobExit at the end of the thin part or account for noise.
            blobExitLocked = false;

            for (ii = 0; ii <= dpix; ii++) {
                yi = -ii * step_pix * r_unit_per_pix + this._ymax;
                pdata = axes.dataToPixel(xi, yi);
                let xi_pix = pdata.x;
                let yi_pix = pdata.y;

                if (xi_pix >= 0 && xi_pix < dw && yi_pix >= 0 && yi_pix < dh) {
                    if (autoDetector.binaryData.has(parseInt(yi_pix, 10) * dw +
                            parseInt(xi_pix, 10))) {
                        if (blobActive === false) {
                            blobEntry = ii;
                            blobExit = blobEntry;
                            blobActive = true;
                            blobExitLocked = false;
                        }
                        // Resume collection, it was just noise
                        if (blobExitLocked === true) {
                            blobExit = ii;
                            blobExitLocked = false;
                        }
                    } else {

                        // collection ended before line thickness was hit. It could just be noise
                        // or it could be the actual end.
                        if (blobExitLocked === false) {
                            blobExit = ii;
                            blobExitLocked = true;
                        }
                    }

                    if (blobActive === true) {

                        if ((ii > blobEntry + this._lineWidth) || (ii == dpix - 1)) {
                            blobActive = false;

                            if (blobEntry > blobExit) {
                                blobExit = ii;
                            }

                            mean_ii = (blobEntry + blobExit) / 2.0;
                            mean_yi = -mean_ii * step_pix * r_unit_per_pix + this._ymax;

                            pdata = axes.dataToPixel(xi, mean_yi);
                            dataSeries.addPixel(parseFloat(pdata.x), parseFloat(pdata.y));
                            pointsPicked = pointsPicked + 1;
                        }
                    }
                }
            }
        }
    }
}
