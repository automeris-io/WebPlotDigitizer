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

    calibrate(calib) {

        let cp0 = calib.getPoint(0);
        let cp1 = calib.getPoint(1);
        let cp2 = calib.getPoint(2);
        let cp3 = calib.getPoint(3);
        let cp4 = calib.getPoint(4);        

        let t0 = cp0.dx;
        let t1 = cp3.dx;
        let t2 = cp4.dx;

        // TODO: check t=t0 for cp1 and cp2
        // TODO: check r=r2 for cp3 and cp4
        let r0 = cp0.dy;
        let r1 = cp1.dy; // unused?
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

        // debug
        console.log(penCircle);
        console.log(chartCircle);

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
        
        this.calibration = calib;

        return true;
    }

    pixelToData(pxi, pyi) {
        let data = [0, 1];

        let rPx = wpd.dist2d(pxi, pyi, this.xChart, this.yChart);

        // calc range
        let r = (this.rMax - this.rMin)*(rPx-this.rMinPx)/(this.rMaxPx - this.rMinPx) + this.rMin;

        // calc time angle
        let thetap = wpd.taninverse(pyi-this.yChart, pxi-this.xChart);
        let alpha = Math.acos((this.chartToPenDist*this.chartToPenDist + rPx*rPx - this.rPen*this.rPen)/(2.0*this.chartToPenDist*rPx));
        let thetac = thetap + alpha;

        // todo: map thetac to [0, 360)
        // todo: map time angle to time

        data[0] = r;
        data[1] = thetac*180.0/Math.PI;

        return data;
    }

    dataToPixel(t, r) {
        return {
            "x": 0,
            "y": 0
        };
    }

    pixelToLiveString(pxi, pyi) {
        let dataVal = this.pixelToData(pxi, pyi);
        return dataVal[0].toExponential(4) + ', ' + dataVal[1].toExponential(4);
    }

    name = "Circular Chart";
    calibration = null;
    metadata = {};

    getMetadata() {
        // deep clone
        return JSON.parse(JSON.stringify(this.metadata));
    };

    setMetadata(obj) {
        // deep clone
        this.metadata = JSON.parse(JSON.stringify(obj));
    };

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