/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2021 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.CircularChartRecorderAxes = class {
    isCalibrated() {
        return false;
    }
    
    calibrate(calib) {
        this.calibration = calib;

        return true;
    }

    pixelToData(pxi, pyi) {
        let data = [0, 1];
        return data;
    }

    dataToPixel(x, y) {
        return {
            "x": 0,
            "y": 0
        };
    }

    pixelToLiveString(pxi, pyi) {
        let dataVal = this.pixelToData(pxi, pyi);
        return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
    }

    name = "Circular Chart Recorder";
    calibration = null;

    static numCalibrationPointsRequired() {
        return 5;
    }

    static getDimensions() {
        return 2;
    }

    static getAxesLabels() {
        return ['Time', 'Magnitude'];
    }
};