/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.AutoDetector = (function () {
    var obj = function () {
        this.fgColor = [0, 0, 200];
        this.bgColor = [255, 255, 255];
        this.mask = null;
        this.colorDetectionMode = 'fg';
        this.colorDistance = 80;
        this.algorithm = null;
        this.binaryData = null;
        this.imageData = null;

        this.generateBinaryData = function() {

            if(this.mask == null || this.mask.length === 0) {
                return;
            }

            this.binaryData = [];
            var maski, img_index, dist, 
                ref_color = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor;

            for(maski = 0; maski < this.mask.length; maski++) {
                img_index = this.mask[maski];
                dist = Math.sqrt( (this.imageData.data[img_index*4] - ref_color[0])*(this.imageData.data[img_index*4] - ref_color[0]) + 
                    (this.imageData.data[img_index*4+1] - ref_color[1])*(this.imageData.data[img_index*4+1] - ref_color[1]) + 
                    (this.imageData.data[img_index*4+2] - ref_color[2])*(this.imageData.data[img_index*4+2] - ref_color[2]));

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
    };
    return obj;
})();

