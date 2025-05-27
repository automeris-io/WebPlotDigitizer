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

wpd.MapAxes = (function() {
    var AxesObj = function() {
        var isCalibrated = false,

            metadata = {},

            scaleLength, scaleUnits, dist, originLocation, imageHeight,

            processCalibration = function(cal, scale_length, scale_units, origin_location, image_height) {
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1);
                dist = Math.sqrt((cp0.px - cp1.px) * (cp0.px - cp1.px) +
                    (cp0.py - cp1.py) * (cp0.py - cp1.py));
                scaleLength = parseFloat(scale_length);
                scaleUnits = scale_units;
                originLocation = origin_location != null ? origin_location : "top-left";
                imageHeight = parseFloat(image_height);
                return true;
            };

        this.calibration = null;

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function(calib, scale_length, scale_units, origin_location, image_height) {
            this.calibration = calib;
            isCalibrated = processCalibration(calib, scale_length, scale_units, origin_location, image_height);
            return isCalibrated;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [];
            data[0] = pxi * scaleLength / dist;
            if (originLocation === "top-left") {
                data[1] = pyi * scaleLength / dist;
            } else if (originLocation === "bottom-left") {
                data[1] = (imageHeight - pyi - 1) * scaleLength / dist;
            }
            return data;
        };

        this.pixelToDataDistance = function(distancePx) {
            return distancePx * scaleLength / dist;
        };

        this.pixelToDataArea = function(
            areaPx) {
            return areaPx * scaleLength * scaleLength / (dist * dist);
        };

        this.dataToPixel = function(a, b, c) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function(pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
        };

        this.getScaleLength = function() {
            return scaleLength;
        };

        this.getUnits = function() {
            return scaleUnits;
        };

        this.getOriginLocation = function() {
            return originLocation;
        };

        this.getImageHeight = function() {
            return imageHeight;
        };

        this.getMetadata = function() {
            // deep clone
            return JSON.parse(JSON.stringify(metadata));
        };

        this.setMetadata = function(obj) {
            // deep clone
            metadata = JSON.parse(JSON.stringify(obj));
        };

        this.name = "Map";
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 2;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['X', 'Y'];
    };

    return AxesObj;
})();
