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

wpd.PolarAxes = (function() {
    var AxesObj = function() {
        var isCalibrated = false,
            isDegrees = false,
            isClockwise = false,
            isLog = false,

            metadata = {},

            x0, y0, x1, y1, x2, y2, r1, theta1, r2, theta2, dist10, dist20, dist12, phi0, alpha0;

        let processCalibration = function(cal, is_degrees, is_clockwise, is_log_r) {
            var cp0 = cal.getPoint(0),
                cp1 = cal.getPoint(1),
                cp2 = cal.getPoint(2);
            x0 = cp0.px;
            y0 = cp0.py;
            x1 = cp1.px;
            y1 = cp1.py;
            x2 = cp2.px;
            y2 = cp2.py;

            r1 = cp1.dx;
            theta1 = cp1.dy;

            r2 = cp2.dx;
            theta2 = cp2.dy;

            isDegrees = is_degrees;
            isClockwise = is_clockwise;

            if (isDegrees === true) { // if degrees
                theta1 = (Math.PI / 180.0) * theta1;
                theta2 = (Math.PI / 180.0) * theta2;
            }

            if (is_log_r) {
                isLog = true;
                r1 = Math.log(r1) / Math.log(10);
                r2 = Math.log(r2) / Math.log(10);
            }

            // Distance between 1 and 0.
            dist10 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

            // Distance between 2 and 0
            dist20 = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));

            // Radial Distance between 1 and 2.
            dist12 = dist20 - dist10;

            phi0 = wpd.taninverse(-(y1 - y0), x1 - x0);

            if (isClockwise) {
                alpha0 = phi0 + theta1;
            } else {
                alpha0 = phi0 - theta1;
            }

            return true;
        };

        this.calibration = null;

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibrate = function(calib, is_degrees, is_clockwise, is_log_r) {
            this.calibration = calib;
            isCalibrated = processCalibration(calib, is_degrees, is_clockwise, is_log_r);
            return isCalibrated;
        };

        this.isThetaDegrees = function() {
            return isDegrees;
        };

        this.isThetaClockwise = function() {
            return isClockwise;
        };

        this.isRadialLog = function() {
            return isLog;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                rp, thetap;

            let xp = parseFloat(pxi);
            let yp = parseFloat(pyi);

            rp = ((r2 - r1) / dist12) *
                (Math.sqrt((xp - x0) * (xp - x0) + (yp - y0) * (yp - y0)) - dist10) +
                r1;

            if (isClockwise) {
                thetap = alpha0 - wpd.taninverse(-(yp - y0), xp - x0);
            } else {
                thetap = wpd.taninverse(-(yp - y0), xp - x0) - alpha0;
            }

            if (thetap < 0) {
                thetap = thetap + 2 * Math.PI;
            }

            if (isDegrees === true) {
                thetap = 180.0 * thetap / Math.PI;
            }

            if (isLog) {
                rp = Math.pow(10, rp);
            }

            data[0] = rp;
            data[1] = thetap;

            return data;
        };

        this.dataToPixel = function(r, theta) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function(pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
        };

        this.getMetadata = function() {
            // deep clone
            return JSON.parse(JSON.stringify(metadata));
        };

        this.setMetadata = function(obj) {
            // deep clone
            metadata = JSON.parse(JSON.stringify(obj));
        };

        this.name = "Polar";
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 3;
    };

    AxesObj.prototype.getDimensions = function() {
        return 2;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['r', 'θ'];
    };

    return AxesObj;
})();
