/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

    var hasHorizontal, hasVertical, xFrac = 0.1, yFrac = 0.1;

    function run() {
        var gridData = [],
            xi,
            yi,
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            xmin = autoDetector.gridMask.xmin,
            xmax = autoDetector.gridMask.xmax,
            ymin = autoDetector.gridMask.ymin,
            ymax = autoDetector.gridMask.ymax,
            dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            linePixCount;
        
        if (hasVertical) {

            for(xi = xmin; xi <= xmax; xi++) {
                linePixCount = 0;
                for(yi = ymin; yi < ymax; yi++) {
                    if(autoDetector.gridBinaryData[yi*dw + xi] === true) {
                        linePixCount++;
                    }
                }
                if(linePixCount > yFrac*(ymax-ymin)) {
                    for(yi = ymin; yi < ymax; yi++) {
                        gridData[yi*dw + xi] = true;
                    }
                }
            }
        }

        if (hasHorizontal) {

            for(yi = ymin; yi <= ymax; yi++) {
                linePixCount = 0;
                for(xi = xmin; xi <= xmax; xi++) {
                    if(autoDetector.gridBinaryData[yi*dw + xi] === true) {
                        linePixCount++;
                    }
                }
                if(linePixCount > xFrac*(xmax-xmin)) {
                    for(xi = xmin; xi <= xmax; xi++) {
                        gridData[yi*dw + xi] = true;
                    }
                }
            }
             
        }

        wpd.appData.getPlotData().gridData = gridData;
    }

    function setHorizontalParameters(has_horizontal, y_perc) {
        hasHorizontal = has_horizontal;
        yFrac = Math.abs(parseFloat(y_perc)/100.0);
    }

    function setVerticalParameters(has_vertical, x_perc) {
        hasVertical = has_vertical;
        xFrac = Math.abs(parseFloat(x_perc)/100.0);
    }

    return {
        run: run,
        setHorizontalParameters: setHorizontalParameters,
        setVerticalParameters: setVerticalParameters
    };
})();
