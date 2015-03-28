/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.xyCalibration = (function () {

    function start() {
        wpd.popup.show('xyAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('xyAxesInfo');
        var tool = new wpd.AxesCornersTool(4, 2, ['X1', 'X2', 'Y1', 'Y2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('xyAlignment');
    }

    function align() {
        var xmin = document.getElementById('xmin').value,
	        xmax = document.getElementById('xmax').value,
	        ymin = document.getElementById('ymin').value,
	        ymax = document.getElementById('ymax').value,
	        xlog = document.getElementById('xlog').checked,
	        ylog = document.getElementById('ylog').checked,
            axes = new wpd.XYAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(0, xmin, ymin);
        calib.setDataAt(1, xmax, ymin);
        calib.setDataAt(2, xmin, ymin);
        calib.setDataAt(3, xmax, ymax);
        if(!axes.calibrate(calib, xlog, ylog)) {
            wpd.popup.close('xyAlignment');
            wpd.messagePopup.show('Invalid Inputs', 'Please enter valid values for calibration.', getCornerValues);
            return false;
        }
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('xyAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };
})();

wpd.barCalibration = (function () {

    function start() {
        wpd.popup.show('barAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('barAxesInfo');
        var tool = new wpd.AxesCornersTool(2, 2, ['P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('barAlignment');
    }

    function align() {
        var p1 = document.getElementById('bar-axes-p1').value,
	        p2 = document.getElementById('bar-axes-p2').value,
	        isLogScale = document.getElementById('bar-axes-log-scale').checked,
            axes = new wpd.BarAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(0, 0, p1);
        calib.setDataAt(1, 0, p2);
        if(!axes.calibrate(calib, isLogScale)) {
            wpd.popup.close('barAlignment');
            wpd.messagePopup.show('Invalid Inputs', 'Please enter valid values for calibration.', getCornerValues);
            return false;
        }
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('barAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };
})();


wpd.polarCalibration = (function () {

    function start() {
        wpd.popup.show('polarAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('polarAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 2, ['Origin', 'P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('polarAlignment');
    }

    function align() {
        var r1 = parseFloat(document.getElementById('rpoint1').value),
	        theta1 = parseFloat(document.getElementById('thetapoint1').value),
	        r2 = parseFloat(document.getElementById('rpoint2').value),
	        theta2 = parseFloat(document.getElementById('thetapoint2').value),
	        degrees = document.getElementById('degrees').checked,
	        radians = document.getElementById('radians').checked,
	        orientation = document.getElementById('clockwise').checked,
            axes = new wpd.PolarAxes(),
            plot,
            isDegrees = degrees,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(1, r1, theta1);
        calib.setDataAt(2, r2, theta2);
        axes.calibrate(calib, isDegrees, orientation);

        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('polarAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();

wpd.ternaryCalibration = (function () {

    function start() {
        wpd.popup.show('ternaryAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('ternaryAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 3, ['A', 'B', 'C']);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('ternaryAlignment');
    }

    function align() {
        var range1 = document.getElementById('range0to1').checked,
	        range100 = document.getElementById('range0to100').checked,
	        ternaryNormal = document.getElementById('ternarynormal').checked,
            axes = new wpd.TernaryAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, range100, ternaryNormal);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('ternaryAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();

wpd.mapCalibration = (function () {

    function start() {
        wpd.popup.show('mapAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('mapAxesInfo');
        var tool = new wpd.AxesCornersTool(2, 2, ['P1', 'P2']);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues() {
        wpd.popup.show('mapAlignment');
    }

    function align() {
        var scaleLength = parseFloat(document.getElementById('scaleLength').value),
            scaleUnits = document.getElementById('scaleUnits').value,
            axes = new wpd.MapAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, scaleLength, scaleUnits);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        plot.calibration = calib;
        wpd.popup.close('mapAlignment');
        return true;
    }

    return {
        start: start,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();


wpd.AxesCornersTool = (function () {

    var Tool = function(maxPoints, dimensions, pointLabels) {
        var pointCount = 0,
            ncal = new wpd.Calibration(dimensions),
            isCapturingCorners = true; 

        ncal.labels = pointLabels;
        wpd.alignAxes.setActiveCalib(ncal);
        wpd.graphicsWidget.resetData();

        this.onMouseClick = function(ev, pos, imagePos) {

            if(isCapturingCorners) {
                pointCount = pointCount + 1;
                
                var calib =  wpd.alignAxes.getActiveCalib();
                calib.addPoint(imagePos.x, imagePos.y, 0, 0);
                calib.unselectAll();
                calib.selectPoint(pointCount-1);
                wpd.graphicsWidget.forceHandlerRepaint(); 

                if(pointCount === maxPoints) {
                    isCapturingCorners = false;
                    wpd.alignAxes.calibrationCompleted();
                }

                wpd.graphicsWidget.updateZoomOnEvent(ev);
            } else {
                var cal = wpd.alignAxes.getActiveCalib();
                cal.unselectAll();
                //cal.selectNearestPoint(imagePos.x, imagePos.y, 15.0/wpd.graphicsWidget.getZoomRatio());
                cal.selectNearestPoint(imagePos.x, imagePos.y);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomOnEvent(ev);

            }
        };

        this.onKeyDown = function(ev) {
            var cal = wpd.alignAxes.getActiveCalib();

            if(cal.getSelectedPoints().length === 0) {
                return;
            }

            var selPoint = cal.getPoint(cal.getSelectedPoints()[0]),
                pointPx = selPoint.px,
                pointPy = selPoint.py,
                stepSize = ev.shiftKey === true ? 5/wpd.graphicsWidget.getZoomRatio() : 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                pointPy = pointPy - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                pointPy = pointPy + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                pointPx = pointPx - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                pointPx = pointPx + stepSize;
            } else {
                return;
            }
            
            cal.changePointPx(cal.getSelectedPoints()[0], pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation();
        };

    };

    return Tool;
})();


wpd.AlignmentCornersRepainter = (function () {
    var Tool = function () {

        this.painterName = 'AlignmentCornersReptainer';

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };

        this.onRedraw = function () {
            var cal = wpd.alignAxes.getActiveCalib();
            if (cal == null) { return; }

            var i, imagePos, imagePx, fillStyle;

            for(i = 0; i < cal.getCount(); i++) {
                imagePos = cal.getPoint(i);
                imagePx = { x: imagePos.px, y: imagePos.py };

                if(cal.isPointSelected(i)) {
                    fillStyle = "rgba(0,200,0,1)";
                } else {
        		    fillStyle = "rgba(200,0,0,1)";
                }

                wpd.graphicsHelper.drawPoint(imagePx, fillStyle, cal.labels[i]);
            }
        };
    };
    return Tool;
})();

wpd.alignAxes = (function () {

    var calib, calibrator;

    function initiatePlotAlignment() {
        xyEl = document.getElementById('r_xy');
        polarEl = document.getElementById('r_polar');
        ternaryEl = document.getElementById('r_ternary');
        mapEl = document.getElementById('r_map');
        imageEl = document.getElementById('r_image');
        barEl = document.getElementById('r_bar');

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            calibrator = wpd.xyCalibration;
        } else if(barEl.checked === true) {
            calibrator = wpd.barCalibration;
        } else if(polarEl.checked === true) {
            calibrator = wpd.polarCalibration;
        } else if(ternaryEl.checked === true) {
            calibrator = wpd.ternaryCalibration;
        } else if(mapEl.checked === true) {
            calibrator = wpd.mapCalibration;
        } else if(imageEl.checked === true) {
            calibrator = null;
            var imageAxes = new wpd.ImageAxes();
            imageAxes.calibrate();
            wpd.appData.getPlotData().axes = imageAxes;
            wpd.appData.isAligned(true);
            wpd.acquireData.load();
        }

        if(calibrator != null) {
            calibrator.start();
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter());
        }
    }

    function calibrationCompleted() {
        wpd.sidebar.show('axes-calibration-sidebar');
    }


    function getCornerValues() {
        calibrator.getCornerValues();
    }

    function align() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if(!calibrator.align()) {
            return;
        }
        wpd.appData.isAligned(true);
        wpd.acquireData.load();
    }

    function getActiveCalib() {
        return calib;
    }

    function setActiveCalib(cal) {
        calib = cal;
    }

    return {
        start: initiatePlotAlignment,
        calibrationCompleted: calibrationCompleted,
        getCornerValues: getCornerValues,
        align: align,
        getActiveCalib: getActiveCalib,
        setActiveCalib: setActiveCalib
    };

})();

