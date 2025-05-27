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

wpd.CircularChartRecorderAxes = class {
    isCalibrated() {
        return false;
    }

    xChart = 0;
    yChart = 0;

    xPen = 0;
    yPen = 0;
    rPen = 0;
    rMax = 0;
    rMin = 0;
    rMinPx = 0;
    rMaxPx = 0;

    chartToPenDist = 0;
    thetac0 = 0;
    thetaStartOffset = 0;
    timeFormat = null;
    time0 = 0;
    timeMax = 0;
    tStart = null;
    tEnd = null;
    rotationDirection = 'anticlockwise';
    rotationTime = 'week';

    calibrate(calib, startTimeInput, rotationTime, rotationDirection) {

        let cp0 = calib.getPoint(0);
        let cp1 = calib.getPoint(1);
        let cp2 = calib.getPoint(2);
        let cp3 = calib.getPoint(3);
        let cp4 = calib.getPoint(4);

        let ip = new wpd.InputParser();
        let t0 = cp0.dx;
        this.time0 = ip.parse(t0);
        if (ip.isDate) {
            this.timeFormat = ip.formatting;
        }
        let date0 = new Date(this.time0);
        this.tStart = ip.parse(startTimeInput);
        let dateEnd = new Date(this.tStart);

        if (rotationTime === "week") {
            this.timeMax = parseFloat(date0.setDate(date0.getDate() + 7));
            this.tEnd = parseFloat(dateEnd.setDate(dateEnd.getDate() + 7));
        } else if (rotationTime === "day") {
            this.timeMax = parseFloat(date0.setHours(date0.getHours() + 24));
            this.tEnd = parseFloat(dateEnd.setHours(dateEnd.getHours() + 24));
        }

        let r0 = cp0.dy;
        let r2 = cp2.dy;

        let penArcPts = [
            [cp0.px, cp0.py],
            [cp1.px, cp1.py],
            [cp2.px, cp2.py],
        ];
        let penCircle = wpd.getCircleFrom3Pts(penArcPts);

        let chartArcPts = [
            [cp2.px, cp2.py],
            [cp3.px, cp3.py],
            [cp4.px, cp4.py],
        ];
        let chartCircle = wpd.getCircleFrom3Pts(chartArcPts);

        this.thetac0 = wpd.taninverse(penCircle.y0 - chartCircle.y0, penCircle.x0 - chartCircle.x0) * 180.0 / Math.PI;

        // find offset for tStart:
        this.thetaStartOffset = 360.0 * (this.tStart - this.time0) / (this.timeMax - this.time0);

        this.xChart = chartCircle.x0;
        this.yChart = chartCircle.y0;
        this.xPen = penCircle.x0;
        this.yPen = penCircle.y0;
        this.rPen = penCircle.radius;
        this.rMin = r0;
        this.rMax = r2;
        this.rMinPx = wpd.dist2d(cp0.px, cp0.py, chartCircle.x0, chartCircle.y0);
        this.rMaxPx = wpd.dist2d(cp2.px, cp2.py, chartCircle.x0, chartCircle.y0);
        this.chartToPenDist = wpd.dist2d(chartCircle.x0, chartCircle.y0, penCircle.x0, penCircle.y0);
        this.rotationDirection = rotationDirection;
        this.rotationTime = rotationTime;
        this.calibration = calib;

        return true;
    }

    pixelToData(pxi, pyi) {
        let data = [0, 1];

        let rPx = wpd.dist2d(pxi, pyi, this.xChart, this.yChart);

        // calc range
        let r = (this.rMax - this.rMin) * (rPx - this.rMinPx) / (this.rMaxPx - this.rMinPx) + this.rMin;

        // calc time angle
        let thetap = wpd.taninverse(pyi - this.yChart, pxi - this.xChart);
        let alpha = Math.acos((this.chartToPenDist * this.chartToPenDist + rPx * rPx - this.rPen * this.rPen) / (2.0 * this.chartToPenDist * rPx));
        let timeVal = 0;
        if (this.rotationDirection === 'anticlockwise') {
            let thetac = thetap + alpha;
            let thetacDeg = wpd.normalizeAngleDeg(thetac * 180.0 / Math.PI);
            timeVal = (this.tEnd - this.tStart) * (wpd.normalizeAngleDeg(thetacDeg - this.thetac0 - this.thetaStartOffset)) / 360.0 + this.tStart;
        } else if (this.rotationDirection === 'clockwise') {
            let thetac = thetap - alpha;
            let thetacDeg = wpd.normalizeAngleDeg(thetac * 180.0 / Math.PI);
            timeVal = (this.tEnd - this.tStart) * (wpd.normalizeAngleDeg(-(thetacDeg - this.thetac0) - this.thetaStartOffset)) / 360.0 + this.tStart;
        }
        data[0] = timeVal;
        data[1] = r;

        return data;
    }

    dataToPixel(t, r) {
        // calc thetac

        // calc range

        // calc coords

        return {
            "x": 0,
            "y": 0
        };
    }

    pixelToLiveString(pxi, pyi) {
        let dataVal = this.pixelToData(pxi, pyi);
        if (this.timeFormat == null) {
            return "calibration error!";
        }
        let timeStr = wpd.dateConverter.formatDateNumber(dataVal[0], this.timeFormat);
        return timeStr + ', ' + dataVal[1].toExponential(4);
    }

    name = "Circular Chart";
    calibration = null;
    _metadata = {};

    getStartTime() {
        if (this.timeFormat == null || this.tStart == null) {
            return null;
        }
        return wpd.dateConverter.formatDateNumber(this.tStart, this.timeFormat);
    }

    getRotationTime() {
        return this.rotationTime;
    }

    getRotationDirection() {
        return this.rotationDirection;
    }

    getTimeFormat() {
        return this.timeFormat;
    }

    getInitialDateFormat(col) {
        if (col == 0) {
            return this.timeFormat;
        }
        return null;
    }

    isDate(col) {
        return (col === 0) ? true : false;
    }

    getMetadata() {
        // deep clone
        return JSON.parse(JSON.stringify(this._metadata));
    };

    setMetadata(obj) {
        // deep clone
        this._metadata = JSON.parse(JSON.stringify(obj));
    };

    numCalibrationPointsRequired() {
        return 5;
    }

    getDimensions() {
        return 2;
    }

    getAxesLabels() {
        return ['Time', 'Magnitude'];
    }
};
