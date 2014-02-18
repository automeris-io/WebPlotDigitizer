/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.XYAxes = (function () {

    var AxesObj = function () {
        var calibration,
            isCalibrated = false,
            isLogScaleX = false,
            isLogScaleY = false,
            processCalibration = function() {
                return true;
            };


        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.setCalibration = function(calib, isLogX, isLogY) {
            calibration = calib;
            isLogScaleX = isLogX;
            isLogScaleY = isLogY;
            return processCalibration();
        };

        this.plotToData = function(px, py) {
            return {
                d0: 0,
                d1: 0
            };
        };

        this.dataToPlot = function(x, y) {
            return {
                px: 0,
                py: 0
            };
        };

    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 4;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    return AxesObj;

})();
