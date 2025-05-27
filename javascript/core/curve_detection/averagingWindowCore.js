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

wpd.AveragingWindowCore = class {

    constructor(binaryData, imageHeight, imageWidth, dx, dy, dataSeries) {
        this._binaryData = binaryData;
        this._imageHeight = imageHeight;
        this._imageWidth = imageWidth;
        this._dx = dx;
        this._dy = dy;
        this._dataSeries = dataSeries;
    }

    run() {
        var xPoints = [],
            xPointsPicked = 0,
            pointsPicked = 0,
            dw = this._imageWidth,
            dh = this._imageHeight,
            blobAvg = [],
            coli, rowi, firstbloby, bi, blobs, blbi, xi, yi,
            pi, inRange, xxi, oldX, oldY, avgX, avgY, newX, newY, matches, xStep = this._dx,
            yStep = this._dy;

        this._dataSeries.clearAll();

        for (coli = 0; coli < dw; coli++) {

            blobs = -1;
            firstbloby = -2.0 * yStep;
            bi = 0;

            // Scan vertically for blobs:

            for (rowi = 0; rowi < dh; rowi++) {
                if (this._binaryData.has(rowi * dw + coli)) {
                    if (rowi > firstbloby + yStep) {
                        blobs = blobs + 1;
                        bi = 1;
                        blobAvg[blobs] = rowi;
                        firstbloby = rowi;
                    } else {
                        bi = bi + 1;
                        blobAvg[blobs] =
                            parseFloat((blobAvg[blobs] * (bi - 1.0) + rowi) / parseFloat(bi));
                    }
                }
            }

            if (blobs >= 0) {
                xi = coli + 0.5;
                for (blbi = 0; blbi <= blobs; blbi++) {
                    yi = blobAvg[blbi] + 0.5; // add 0.5 to shift to the middle of the pixels
                    // instead of the starting edge.

                    xPoints[xPointsPicked] = [];
                    xPoints[xPointsPicked][0] = parseFloat(xi);
                    xPoints[xPointsPicked][1] = parseFloat(yi);
                    xPoints[xPointsPicked][2] =
                        true; // true if not filtered, false if processed already
                    xPointsPicked = xPointsPicked + 1;
                }
            }
        }

        if (xPointsPicked === 0) {
            return;
        }

        for (pi = 0; pi < xPointsPicked; pi++) {
            if (xPoints[pi][2] === true) { // if still available
                inRange = true;
                xxi = pi + 1;

                oldX = xPoints[pi][0];
                oldY = xPoints[pi][1];

                avgX = oldX;
                avgY = oldY;

                matches = 1;

                while ((inRange === true) && (xxi < xPointsPicked)) {
                    newX = xPoints[xxi][0];
                    newY = xPoints[xxi][1];

                    if ((Math.abs(newX - oldX) <= xStep) && (Math.abs(newY - oldY) <= yStep) &&
                        (xPoints[xxi][2] === true)) {
                        avgX = (avgX * matches + newX) / (matches + 1.0);
                        avgY = (avgY * matches + newY) / (matches + 1.0);
                        matches = matches + 1;
                        xPoints[xxi][2] = false;
                    }

                    if (newX > oldX + 2 * xStep) {
                        inRange = false;
                    }

                    xxi = xxi + 1;
                }

                xPoints[pi][2] = false;

                pointsPicked = pointsPicked + 1;
                this._dataSeries.addPixel(parseFloat(avgX), parseFloat(avgY));
            }
        }
        xPoints = [];
        return this._dataSeries;
    }
};
