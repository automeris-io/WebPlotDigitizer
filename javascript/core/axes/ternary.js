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

wpd.TernaryAxes = (function() {
    var AxesObj = function() {
        var isCalibrated = false,

            metadata = {},

            x0, y0, x1, y1, x2, y2, L, phi0, root3, isRange0to100, isOrientationNormal,

            processCalibration = function(cal, range100, is_normal) {
                var cp0 = cal.getPoint(0),
                    cp1 = cal.getPoint(1),
                    cp2 = cal.getPoint(2);

                x0 = cp0.px;
                y0 = cp0.py;
                x1 = cp1.px;
                y1 = cp1.py;
                x2 = cp2.px;
                y2 = cp2.py;

                L = Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));

                phi0 = wpd.taninverse(-(y1 - y0), x1 - x0);

                root3 = Math.sqrt(3);

                isRange0to100 = range100;

                isOrientationNormal = is_normal;

                return true;
            };

        this.isCalibrated = function() {
            return isCalibrated;
        };

        this.calibration = null;

        this.calibrate = function(calib, range100, is_normal) {
            this.calibration = calib;
            isCalibrated = processCalibration(calib, range100, is_normal);
            return isCalibrated;
        };

        this.isRange100 = function() {
            return isRange0to100;
        };

        this.isNormalOrientation = function() {
            return isOrientationNormal;
        };

        this.pixelToData = function(pxi, pyi) {
            var data = [],
                rp, thetap, xx, yy, ap, bp, cp, bpt;

            let xp = parseFloat(pxi);
            let yp = parseFloat(pyi);

            rp = Math.sqrt((xp - x0) * (xp - x0) + (yp - y0) * (yp - y0));

            thetap = wpd.taninverse(-(yp - y0), xp - x0) - phi0;

            xx = (rp * Math.cos(thetap)) / L;
            yy = (rp * Math.sin(thetap)) / L;

            ap = 1.0 - xx - yy / root3;
            bp = xx - yy / root3;
            cp = 2.0 * yy / root3;

            if (isOrientationNormal == false) {
                // reverse axes orientation
                bpt = bp;
                bp = ap;
                ap = cp;
                cp = bpt;
            }

            if (isRange0to100 == true) {
                ap = ap * 100;
                bp = bp * 100;
                cp = cp * 100;
            }

            data[0] = ap;
            data[1] = bp;
            data[2] = cp;
            return data;
        };

        this.dataToPixel = function(a, b, c) {
            return {
                x: 0,
                y: 0
            };
        };

        this.pixelToLiveString = function(pxi, pyi) {
            var dataVal = this.pixelToData(pxi, pyi);
            return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4) + ', ' +
                dataVal[2].toExponential(4);
        };

        this.getMetadata = function() {
            // deep clone
            return JSON.parse(JSON.stringify(metadata));
        };

        this.setMetadata = function(obj) {
            // deep clone
            metadata = JSON.parse(JSON.stringify(obj));
        };

        this.name = "Ternary";
    };

    AxesObj.prototype.numCalibrationPointsRequired = function() {
        return 3;
    };

    AxesObj.prototype.getDimensions = function() {
        return 3;
    };

    AxesObj.prototype.getAxesLabels = function() {
        return ['a', 'b', 'c'];
    };

    return AxesObj;
})();
