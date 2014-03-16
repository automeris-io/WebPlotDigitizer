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
        var xmin = parseFloat(document.getElementById('xmin').value),
	        xmax = parseFloat(document.getElementById('xmax').value),
	        ymin = parseFloat(document.getElementById('ymin').value),
	        ymax = parseFloat(document.getElementById('ymax').value),
	        xlog = document.getElementById('xlog').value,
	        ylog = document.getElementById('ylog').value,
            axes = new wpd.XYAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        calib.setDataAt(0, xmin, ymin);
        calib.setDataAt(1, xmax, ymin);
        calib.setDataAt(2, xmin, ymin);
        calib.setDataAt(3, xmax, ymax);
        axes.calibrate(calib, xlog, ylog);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('xyAlignment');
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
        wpd.popup.close('polarAlignment');
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
        wpd.popup.close('ternaryAlignment');
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
            axes = new wpd.MapAxes(),
            plot,
            calib = wpd.alignAxes.getActiveCalib();

        axes.calibrate(calib, scaleLength);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.popup.close('mapAlignment');
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
                var thresh = 15.0/wpd.graphicsWidget.getZoomRatio(),
                    ci,
                    cpoint,
                    cal = wpd.alignAxes.getActiveCalib(),
                    dist;

                for (ci = 0; ci < cal.getCount(); ci++) {
                    cpoint = cal.getPoint(ci);
                    dist = Math.sqrt((cpoint.px - imagePos.x)*(cpoint.px - imagePos.x) + (cpoint.py - imagePos.y)*(cpoint.py - imagePos.y));
                    if(dist <= thresh) {
                        cal.unselectAll();
                        cal.selectPoint(ci);
                        wpd.graphicsWidget.forceHandlerRepaint();
                        wpd.graphicsWidget.updateZoomOnEvent(ev);
                        return;
                    }
                }
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

        var ctx = wpd.graphicsWidget.getAllContexts();

        this.painterName = 'AlignmentCornersReptainer';

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };

        this.onRedraw = function () {
            var cal = wpd.alignAxes.getActiveCalib();
            if (cal == null) { return; }

            var i, pos, imagePos;

            for(i = 0; i < cal.getCount(); i++) {
                imagePos = cal.getPoint(i);
                pos = wpd.graphicsWidget.screenPx(imagePos.px, imagePos.py);
                ctx.dataCtx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.dataCtx.fillRect(pos.x - 10, pos.y - 10, 20, 40); 
                ctx.dataCtx.beginPath();
                if(cal.isPointSelected(i)) {
                    ctx.dataCtx.fillStyle = "rgba(0,200,0,1)";
                } else {
        		    ctx.dataCtx.fillStyle = "rgba(200,0,0,1)";
                }
	        	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		        ctx.dataCtx.fill();
                ctx.dataCtx.font="14px sans-serif";
                ctx.dataCtx.fillText(cal.labels[i], pos.x-10, pos.y+18);
                
                ctx.oriDataCtx.beginPath();
                if(cal.isPointSelected(i)) {
                    ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
                } else {
        		    ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                }

                ctx.oriDataCtx.arc(imagePos.px, imagePos.py, 3, 0, 2.0*Math.PI, true);
                ctx.oriDataCtx.fill();
                ctx.oriDataCtx.font="14px sans-serif";
                ctx.oriDataCtx.fillText(cal.labels[i], parseInt(imagePos.px-10, 10), parseInt(imagePos.py+18,10));
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

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            calibrator = wpd.xyCalibration;
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
            wpd.acquireData.showSidebar();
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
        calibrator.align();
        wpd.appData.isAligned(true);
        wpd.acquireData.showSidebar();
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

