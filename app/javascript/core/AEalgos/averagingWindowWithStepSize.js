/*
	WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

	Copyright 2010-2018 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.AveragingWindowWithStepSizeAlgo = class {

    constructor() {
        this._xmin = 0;
        this._xmax = 0;
        this._delx = 0;
        this._lineWidth = 0;
        this._ymin = 0;
        this._ymax = 0;
    }

    getParamList(axes) {
        if(axes != null && axes instanceof wpd.XYAxes) {
            var bounds = axes.getBounds();
            return [["X_min","Units", bounds.x1],["ΔX Step","Units", 0.1],["X_max","Units", bounds.x2],["Y_min","Units", bounds.y3],["Y_max","Units", bounds.y4],["Line width","Px",30]];
        }
        return [["X_min","Units", 0],["ΔX Step","Units", 0.1],["X_max","Units", 0],["Y_min","Units", 0],["Y_max","Units", 0],["Line width","Px",30]];
    }

    setParam(index, val) {
        if (index === 0) {
            this._xmin = val;
        } else if (index === 1) {
            this._delx = val;
        } else if (index === 2) {
            this._xmax = val;
        } else if (index === 3) {
            this._ymin = val;
        } else if (index === 4) {
            this._ymax = val;
        } else if (index === 5) {
            this._lineWidth = val;
        }
    }

    run(autoDetector, dataSeries, axes) {
        var pointsPicked = 0,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            blobx = [],
            bloby = [],
            xi, xmin_pix, xmax_pix, ymin_pix, ymax_pix, dpix, r_unit_per_pix, step_pix,
            blobActive, blobEntry, blobExit,
            blobExitLocked,
            ii, yi,
            mean_ii,
            mean_yi,
            pdata;

        dataSeries.clearAll();

        for (xi = this._xmin; xi <= this._xmax; xi+= this._delx) {
            step_pix = 1;

            pdata = axes.dataToPixel(xi, this._ymin);
            xmin_pix = pdata.x;
            ymin_pix = pdata.y;

            pdata = axes.dataToPixel(xi, this._ymax);
            xmax_pix = pdata.x;
            ymax_pix = pdata.y;

            dpix = Math.sqrt((ymax_pix-ymin_pix)*(ymax_pix-ymin_pix) + (xmax_pix-xmin_pix)*(xmax_pix-xmin_pix));
            r_unit_per_pix = (this._ymax-this._ymin)/dpix;

            blobActive = false;
            blobEntry = 0;
            blobExit = 0;
            // To account for noise or if actual thickness is less than specified thickness.
            // This flag helps to set blobExit at the end of the thin part or account for noise.
            blobExitLocked = false;

            for (ii = 0; ii <= dpix; ii++) {
                yi = -ii*step_pix*r_unit_per_pix + this._ymax;
                pdata = axes.dataToPixel(xi, yi);
                xi_pix = pdata.x;
                yi_pix = pdata.y;

                if(xi_pix >= 0 && xi_pix < dw && yi_pix >=0 && yi_pix < dh)	{
                    if (autoDetector.binaryData[parseInt(yi_pix, 10)*dw + parseInt(xi_pix, 10)] === true) {
                        if(blobActive === false) {
                            blobEntry = ii;
                            blobExit = blobEntry;
                            blobActive = true;
                            blobExitLocked = false;
                        }
                        // Resume collection, it was just noise
                        if(blobExitLocked === true) {
                            blobExit = ii;
                            blobExitLocked = false;
                        }
                    } else	{

                        // collection ended before line thickness was hit. It could just be noise
                        // or it could be the actual end.
                        if(blobExitLocked === false) {
                            blobExit = ii;
                            blobExitLocked = true;
                        }					
                    }

                    if(blobActive === true)	{

                        if((ii > blobEntry + this._lineWidth) || (ii == dpix-1)) {
                            blobActive = false;

                            if(blobEntry > blobExit) {
                                blobExit = ii;							
                            }

                            mean_ii = (blobEntry + blobExit)/2.0;
                            mean_yi = -mean_ii*step_pix*r_unit_per_pix + this._ymax;

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

