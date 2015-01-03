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
wpd = wpd || {};

wpd.BlobDetectorAlgo = (function () {
    
    var Algo = function () {
        var min_dia, max_dia;

        this.getParamList = function () {
            var isAligned = wpd.appData.isAligned(),
                axes = wpd.appData.getPlotData().axes;
            
            if (isAligned && axes instanceof wpd.MapAxes) { 
			    return [['Min Diameter', 'Units', 0], ['Max Diameter', 'Units', 5000]];
            }

			return [['Min Diameter', 'Px', 0], ['Max Diameter', 'Px', 5000]];
        };

        this.setParam = function (index, val) {
            if (index === 0) {
                min_dia = parseFloat(val);
            } else if (index === 1) {
                max_dia = parseFloat(val);
            }
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries(),
                dw = autoDetector.imageWidth,
                dh = autoDetector.imageHeight,
                pixelVisited = [],
                blobCount = 0,
                blobs = [],
                xi, yi,
                blobPtIndex,
                bIndex, 
                nxi, nyi,
                bxi, byi,
                pcount,
                dia;

            if (dw <= 0 || dh <= 0 || autoDetector.binaryData == null 
                || autoDetector.binaryData.length === 0) {
                return;
            }

            dataSeries.clearAll();
            dataSeries.setMetadataKeys(["area", "moment"]);

            for (xi = 0; xi < dw; xi++) {
                for (yi = 0; yi < dh; yi++) {
                    if (autoDetector.binaryData[yi*dw + xi] === true && !(pixelVisited[yi*dw + xi] === true)) {

                        pixelVisited[yi*dw + xi] = true;

                        bIndex = blobs.length;

                        blobs[bIndex] = {
                            pixels: [{x: xi, y: yi}],
                            centroid: {x: xi, y: yi},
                            area: 1.0,
                            moment: 0.0
                        };

                        blobPtIndex = 0;
                        while (blobPtIndex < blobs[bIndex].pixels.length) {
                            bxi = blobs[bIndex].pixels[blobPtIndex].x;
                            byi = blobs[bIndex].pixels[blobPtIndex].y;

                            for (nxi = bxi - 1; nxi <= bxi + 1; nxi++) {
                                for(nyi = byi - 1; nyi <= byi + 1; nyi++) {
                                    if (nxi >= 0 && nyi >= 0 && nxi < dw && nyi < dh) {
                                        if (!(pixelVisited[nyi*dw + nxi] === true) && autoDetector.binaryData[nyi*dw + nxi] === true) {

                                            pixelVisited[nyi*dw + nxi] = true;
                                            
                                            pcount = blobs[bIndex].pixels.length;

                                            blobs[bIndex].pixels[pcount] = {
                                                x: nxi,
                                                y: nyi
                                            };

                                            blobs[bIndex].centroid.x = (blobs[bIndex].centroid.x*pcount + nxi)/(pcount + 1.0);
                                            blobs[bIndex].centroid.y = (blobs[bIndex].centroid.y*pcount + nyi)/(pcount + 1.0);
                                            blobs[bIndex].area = blobs[bIndex].area + 1.0;
                                        }
                                    }
                                }
                            }
                            blobPtIndex = blobPtIndex + 1;
                        }
                    }
                }
            }

            for (bIndex = 0; bIndex < blobs.length; bIndex++) {
                blobs[bIndex].moment = 0;
                for (blobPtIndex = 0; blobPtIndex < blobs[bIndex].pixels.length; blobPtIndex++) {
                    blobs[bIndex].moment = blobs[bIndex].moment 
                        + (blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x)*(blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x)
                        + (blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y)*(blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y);
                        
                }
                if (plotData.axes instanceof wpd.MapAxes) {
                    blobs[bIndex].area = plotData.axes.pixelToDataArea(blobs[bIndex].area);
                }

                dia = 2.0*Math.sqrt(blobs[bIndex].area/Math.PI);
                if (dia <= max_dia && dia >= min_dia) {
                    dataSeries.addPixel(blobs[bIndex].centroid.x, blobs[bIndex].centroid.y, [blobs[bIndex].area, blobs[bIndex].moment]);
                }
            }
        };
    };

    return Algo;
})();

