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

wpd.BarAxes = (function () {

    var AxesObj = function () {
        // Throughout this code, it is assumed that "y" is the continuous axes and "x" is
        // the discrete axes. In practice, this shouldn't matter even if the orientation
        // is different.
        var isCalibrated = false,
            isLogScale = false,
            x1, y1, x2, y2, p1, p2;

        this.isCalibrated = function () {
            return isCalibrated;
        };

        this.calibrate = function(calibration, isLog) {
            isCalibrated = false;
            var cp1 = calibration.getPoint(0),
                cp2 = calibration.getPoint(1);

            x1 = cp1.px;
            y1 = cp1.py;
            x2 = cp2.px;
            y2 = cp2.py;
            p1 = parseFloat(cp1.dy);
            p2 = parseFloat(cp2.dy);

            if(isLog) {
                isLogScale = true;
                p1 = Math.log(p1)/Math.log(10);
                p2 = Math.log(p2)/Math.log(10);
            } else {
                isLogScale = false;
            }

            isCalibrated = true;
            return true;
        };

        this.pixelToData = function (pxi, pyi) {
            var data = [],
                c_c2 = ((pyi-y1)*(y2-y1) + (x2-x1)*(pxi-x1))/((y2-y1)*(y2-y1) + (x2-x1)*(x2-x1));
            data[0] = pxi;
            data[1] = (p2 - p1)*c_c2 + p1;
            if(isLogScale) {
                data[1] = Math.pow(10, data[1]);
            }
            return data;
        };

        this.dataToPixel = function (x, y) {
            // not implemented yet
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function (pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[1].toExponential(4);
        };

        this.isLog = function () {
            return isLogScale;
        };

        this.getTransformationEquations = function () {
            return {
                pixelToData: ['', ''],
                dataToPixel: ['', '']
            };
        };

        this.dataPointsHaveLabels = true;

        this.dataPointsLabelPrefix = 'Bar';
    };

    AxesObj.prototype.numCalibrationPointsRequired = function () {
        return 2;
    };

    AxesObj.prototype.getDimensions = function () {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function () {
        return ['Label', 'Y'];
    };

    return AxesObj;
})();
