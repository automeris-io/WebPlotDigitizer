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

wpd.BlobDetectorAlgo = class {

    constructor() {
        this._minDia = 0;
        this._maxDia = 5000;
        this._wasRun = false;
    }

    getParamList(axes) {
        if (axes != null && axes instanceof wpd.MapAxes) {
            return {
                minDia: ['Min Diameter', 'Units', this._minDia],
                maxDia: ['Max Diameter', 'Units', this._maxDia]
            };
        }
        return {
            minDia: ['Min Diameter', 'Px', this._minDia],
            maxDia: ['Max Diameter', 'Px', this._maxDia]
        };
    }

    serialize() {
        return this._wasRun ? {
                algoType: "BlobDetectorAlgo",
                minDia: this._minDia,
                maxDia: this._maxDia
            } :
            null;
    }

    deserialize(obj) {
        this._minDia = obj.minDia;
        this._maxDia = obj.maxDia;
        this._wasRun = true;
    }

    setParams(params) {
        this._minDia = parseFloat(params.minDia);
        this._maxDia = parseFloat(params.maxDia);
    }

    getParams() {
        return {
            minDia: this._minDia,
            maxDia: this._maxDia
        };
    }

    run(autoDetector, dataSeries, axes, imageData) {
        this._wasRun = true;
        var dw = autoDetector.imageWidth,
            dh = autoDetector.imageHeight,
            pixelVisited = [],
            blobCount = 0,
            blobs = [],
            xi, yi, blobPtIndex, bIndex, nxi, nyi, bxi, byi, pcount, dia;

        if (dw <= 0 || dh <= 0 || autoDetector.binaryData == null ||
            autoDetector.binaryData.size === 0) {
            return;
        }

        dataSeries.clearAll();
        dataSeries.setMetadataKeys(["area", "moment"]);

        for (xi = 0; xi < dw; xi++) {
            for (yi = 0; yi < dh; yi++) {
                if (autoDetector.binaryData.has(yi * dw + xi) &&
                    !(pixelVisited[yi * dw + xi] === true)) {

                    pixelVisited[yi * dw + xi] = true;

                    bIndex = blobs.length;

                    blobs[bIndex] = {
                        pixels: [{
                            x: xi,
                            y: yi
                        }],
                        centroid: {
                            x: xi,
                            y: yi
                        },
                        area: 1.0,
                        moment: 0.0
                    };

                    blobPtIndex = 0;
                    while (blobPtIndex < blobs[bIndex].pixels.length) {
                        bxi = blobs[bIndex].pixels[blobPtIndex].x;
                        byi = blobs[bIndex].pixels[blobPtIndex].y;

                        for (nxi = bxi - 1; nxi <= bxi + 1; nxi++) {
                            for (nyi = byi - 1; nyi <= byi + 1; nyi++) {
                                if (nxi >= 0 && nyi >= 0 && nxi < dw && nyi < dh) {
                                    if (!(pixelVisited[nyi * dw + nxi] === true) &&
                                        autoDetector.binaryData.has(nyi * dw + nxi)) {

                                        pixelVisited[nyi * dw + nxi] = true;

                                        pcount = blobs[bIndex].pixels.length;

                                        blobs[bIndex].pixels[pcount] = {
                                            x: nxi,
                                            y: nyi
                                        };

                                        blobs[bIndex].centroid.x =
                                            (blobs[bIndex].centroid.x * pcount + nxi) /
                                            (pcount + 1.0);
                                        blobs[bIndex].centroid.y =
                                            (blobs[bIndex].centroid.y * pcount + nyi) /
                                            (pcount + 1.0);
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
                blobs[bIndex].moment =
                    blobs[bIndex].moment +
                    (blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x) *
                    (blobs[bIndex].pixels[blobPtIndex].x - blobs[bIndex].centroid.x) +
                    (blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y) *
                    (blobs[bIndex].pixels[blobPtIndex].y - blobs[bIndex].centroid.y);
            }
            if (axes instanceof wpd.MapAxes) {
                blobs[bIndex].area = plotData.axes.pixelToDataArea(blobs[bIndex].area);
            }

            dia = 2.0 * Math.sqrt(blobs[bIndex].area / Math.PI);
            if (dia <= this._maxDia && dia >= this._minDia) {
                // add 0.5 pixel offset to shift to the center of the pixels.
                dataSeries.addPixel(blobs[bIndex].centroid.x + 0.5, blobs[bIndex].centroid.y + 0.5, {
                    "area": blobs[bIndex].area,
                    "moment": blobs[bIndex].moment
                });
            }
        }
    }
}
