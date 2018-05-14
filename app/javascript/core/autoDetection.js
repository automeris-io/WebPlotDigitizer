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

wpd.AutoDetector = (function () {
    var obj = function () {

        this.fgColor = [0, 0, 200];
        this.bgColor = [255, 255, 255];
        this.mask = null;
        this.gridMask = { xmin: null, xmax: null, ymin: null, ymax: null, pixels: [] };
        this.gridLineColor = [255, 255, 255];
        this.gridColorDistance = 10;
        this.gridData = null;
        this.colorDetectionMode = 'fg';
        this.colorDistance = 120;
        this.algorithm = null;
        this.binaryData = null;
        this.gridBinaryData = null;
        this.imageData = null;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.gridBackgroundMode = true;
        this.topColors = null;
        this.backupImageData = null;
        
        this.reset = function () {
            this.mask = null;
            this.binaryData = null;
            this.imageData = null;
            this.gridData = null;
            this.gridMask = { xmin: null, xmax: null, ymin: null, ymax: null, pixels: [] };
        };

        this.generateBinaryDataFromMask = function () {

            var maski, img_index, dist, ir, ig, ib, ia,
                ref_color = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor;

            for(maski = 0; maski < this.mask.length; maski++) {
                img_index = this.mask[maski];
                ir = this.imageData.data[img_index*4];
                ig = this.imageData.data[img_index*4+1];
                ib = this.imageData.data[img_index*4+2];
                ia = this.imageData.data[img_index*4+3];
                if(ia === 0) { // for transparent images, assume white RGB
                    ir = 255; ig = 255; ib = 255;
                }

                dist = wpd.dist3d(ir, ig, ib, ref_color[0], ref_color[1], ref_color[2]);

                if(this.colorDetectionMode === 'fg') {
                    if(dist <= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                } else {
                    if(dist >= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                }
            }
        };

        this.generateBinaryDataUsingFullImage = function () {
            
            var dist, img_index,
                ref_color = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor,
                ir,ig,ib,ia; 

            for(img_index = 0; img_index < this.imageData.data.length/4; img_index++) {
                ir = this.imageData.data[img_index*4];
                ig = this.imageData.data[img_index*4+1];
                ib = this.imageData.data[img_index*4+2];
                ia = this.imageData.data[img_index*4+3];

                // If image is transparent, then assume white background.
                if(ia === 0) {
                    ir = 255; ig = 255; ib = 255;
                }
                
                dist = wpd.dist3d(ir, ig, ib, ref_color[0], ref_color[1], ref_color[2]);           

                if(this.colorDetectionMode === 'fg') {
                    if(dist <= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                } else {
                    if(dist >= this.colorDistance) {
                        this.binaryData[img_index] = true;
                    }
                }
            }
        };

        this.generateBinaryData = function () {

            this.binaryData = [];

            if(this.imageData == null) {
                this.imageHeight = 0;
                this.imageWidth = 0;
                return;
            }

            this.imageHeight = this.imageData.height;
            this.imageWidth = this.imageData.width;

            if (this.mask == null || this.mask.length === 0) {
                this.generateBinaryDataUsingFullImage();
            } else {
                this.generateBinaryDataFromMask();
            }
        };

        this.generateGridBinaryData = function () {
            this.gridBinaryData = [];

            if (this.imageData == null) {
                this.imageWidth = 0;
                this.imageHeight = 0;
                return;
            }
            
            this.imageWidth = this.imageData.width;
            this.imageHeight = this.imageData.height;

            var xi, yi, dist, img_index, maski, ir, ig, ib, ia;

            if (this.gridMask.pixels == null || this.gridMask.pixels.length === 0) {
                // Use full image if no mask is present
                maski = 0;
                this.gridMask.pixels = [];
                for(yi = 0; yi < this.imageHeight; yi++) {
                    for(xi = 0; xi < this.imageWidth; xi++) {
                        img_index = yi*this.imageWidth + xi;
                        ir = this.imageData.data[img_index*4];
                        ig = this.imageData.data[img_index*4+1];
                        ib = this.imageData.data[img_index*4+2];
                        ia = this.imageData.data[img_index*4+3];

                        if(ia === 0) { // assume white color when image is transparent
                            ir = 255; ig = 255; ib = 255;
                        }

                        dist = wpd.dist3d(this.gridLineColor[0], this.gridLineColor[1], this.gridLineColor[2], ir, ig, ib);
                        
                        if(this.gridBackgroundMode) {
                            if (dist > this.gridColorDistance) {
                                this.gridBinaryData[img_index] = true;
                                this.gridMask.pixels[maski] = img_index;
                                maski++;
                            }
                        } else {
                            if (dist < this.gridColorDistance) {
                                this.gridBinaryData[img_index] = true;
                                this.gridMask.pixels[maski] = img_index;
                                maski++;
                            }
                        }
                    }
                }
                this.gridMask.xmin = 0;
                this.gridMask.xmax = this.imageWidth;
                this.gridMask.ymin = 0;
                this.gridMask.ymax = this.imageHeight;
                return;
            }

            for (maski = 0; maski < this.gridMask.pixels.length; maski++) {
                img_index = this.gridMask.pixels[maski];
                ir = this.imageData.data[img_index*4];
                ig = this.imageData.data[img_index*4+1];
                ib = this.imageData.data[img_index*4+2];
                ia = this.imageData.data[img_index*4+3];

                dist = wpd.dist3d(this.gridLineColor[0], this.gridLineColor[1], this.gridLineColor[2], ir, ig, ib);

                if(this.gridBackgroundMode) {
                    if (dist > this.gridColorDistance) {
                        this.gridBinaryData[img_index] = true;
                    }
                } else {
                    if (dist < this.gridColorDistance) {
                        this.gridBinaryData[img_index] = true;
                    }
                }
            }
        };

    };
    return obj;
})();

