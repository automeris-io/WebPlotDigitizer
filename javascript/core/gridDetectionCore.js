/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.gridDetectionCore = (function () {

    var hasHorizontal, hasVertical, xDetectionWidth, yDetectionWidth, xMarkWidth, yMarkWidth;

    function run() {
        var gridData = [],
            xi,
            delx,
            yi,
            dely,
            pix,
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            xmin = autoDetector.gridMask.xmin,
            xmax = autoDetector.gridMask.xmax,
            ymin = autoDetector.gridMask.ymin,
            ymax = autoDetector.gridMask.ymax,
            xp, yp,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            linePixCount,
            linePix,
            pix_index,
            ii;

        if (hasVertical) {
        
            for (xi = xmin; xi <= xmax; xi += xDetectionWidth) {

                pix = [];
                linePix = [];
                linePixCount = 0;

                for ( xp = xi - xDetectionWidth; xp <= xi + xDetectionWidth; xp++ ) {

                    for (yi = ymin; yi <= ymax; yi++) {                        
                        pix_index = yi*dw + parseInt(xp, 10);
                        if (autoDetector.gridBinaryData[pix_index] === true) {
                            pix[pix.length] = pix_index;
                            if (!(linePix[yi] === true)) {
                                linePixCount++;
                                linePix[yi] = true;
                            }
                        }
                    }
                }

                if (linePixCount > (ymax - ymin)*0.3) {
                    for (ii = 0; ii < pix.length; ii++) {
                        gridData[pix[ii]] = true;
                    }
                }
            }
        }

        if (hasHorizontal) {
            for (yi = ymin; yi <= ymax; yi += yDetectionWidth) {
                pix = [];
                linePix = [];
                linePixCount = 0;

                for (yp = yi - yDetectionWidth; yp <= yi + yDetectionWidth; yp++) {
                    for (xi = xmin; xi <= xmax; xi++) {
                        pix_index = parseInt(yp, 10)*dw + xi;
                        if (autoDetector.gridBinaryData[pix_index] === true) {
                            pix[pix.length] = pix_index;
                            if(!(linePix[xi] === true)) {
                                linePixCount++;
                                linePix[xi] = true;
                            }
                        }
                    }
                }

                if (linePixCount > (xmax - xmin)*0.3) {
                    for (ii = 0; ii < pix.length; ii++) {
                        gridData[pix[ii]] = true;
                    }
                }
            }
        }

        wpd.appData.getPlotData().gridData = gridData;
    }

    function setHorizontalParameters(has_horizontal, y_det_w, y_mark_w) {
        hasHorizontal = has_horizontal;
        yDetectionWidth = y_det_w;
        yMarkWidth = y_mark_w;
    }

    function setVerticalParameters(has_vertical, x_det_w, x_mark_w) {
        hasVertical = has_vertical;
        xDetectionWidth = x_det_w;
        xMarkWidth = x_mark_w;
    }

    return {
        run: run,
        setHorizontalParameters: setHorizontalParameters,
        setVerticalParameters: setVerticalParameters
    };
})();
