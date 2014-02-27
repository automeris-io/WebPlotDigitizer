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

    var calib;

    function start() {
        calib = null;
        wpd.popup.show('xyAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('xyAxesInfo');
        var tool = new wpd.AxesCornersTool(4, 2);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues(cal) {
        calib = cal;
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
            plot;

        calib.setDataAt(0, xmin, ymin);
        calib.setDataAt(1, xmax, ymin);
        calib.setDataAt(2, xmin, ymin);
        calib.setDataAt(3, xmax, ymax);
        axes.calibrate(calib, xlog, ylog);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.appData.isAligned(true);
        wpd.popup.close('xyAlignment');
        calib = null;
        wpd.alignAxes.alignmentCompleted();
    }

    return {
        start: start,
        pickCorners: pickCorners,
        align: align
    };
})();

wpd.polarCalibration = (function () {
    var calib;

    function start() {
        calib = null;
        wpd.popup.show('polarAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('polarAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 2);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues(cal) {
        calib = cal;
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
            isDegrees = degrees;

        calib.setDataAt(1, r1, theta1);
        calib.setDataAt(2, r2, theta2);
        axes.calibrate(calib, isDegrees, orientation);

        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.appData.isAligned(true);
        wpd.popup.close('polarAlignment');
        calib = null;
        wpd.alignAxes.alignmentCompleted();
    }

    return {
        start: start,
        pickCorners: pickCorners,
        align: align
    };

})();

wpd.ternaryCalibration = (function () {
    var calib;

    function start() {
        calib = null;
        wpd.popup.show('ternaryAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('ternaryAxesInfo');
        var tool = new wpd.AxesCornersTool(3, 3);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues(cal) {
        calib = cal;
        wpd.popup.show('ternaryAlignment');
    }

    function align() {
        var range1 = document.getElementById('range0to1').checked,
	        range100 = document.getElementById('range0to100').checked,
	        ternaryNormal = document.getElementById('ternarynormal').checked,
            axes = new wpd.TernaryAxes(),
            plot;

        axes.calibrate(calib, range100, ternaryNormal);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.appData.isAligned(true);
        wpd.popup.close('ternaryAlignment');
        calib = null;
        wpd.alignAxes.alignmentCompleted();
    }

    return {
        start: start,
        pickCorners: pickCorners,
        align: align
    };

})();

wpd.mapCalibration = (function () {
    var calib;

    function start() {
        calib = null;
        wpd.popup.show('mapAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('mapAxesInfo');
        var tool = new wpd.AxesCornersTool(2, 2);
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = getCornerValues;
    }

    function getCornerValues(cal) {
        calib = cal;
        wpd.popup.show('mapAlignment');
    }

    function align() {
        var scaleLength = parseFloat(document.getElementById('scaleLength').value),
            axes = new wpd.MapAxes(),
            plot;

        axes.calibrate(calib, scaleLength);
        plot = wpd.appData.getPlotData();
        plot.axes = axes;
        wpd.appData.isAligned(true);
        wpd.popup.close('mapAlignment');
        calib = null;
        wpd.alignAxes.alignmentCompleted();
    }

    return {
        start: start,
        pickCorners: pickCorners,
        align: align
    };

})();


wpd.AxesCornersTool = (function () {

    var Tool = function(maxPoints, dimensions) {
        var points = [],
            ctx = wpd.graphicsWidget.getAllContexts(),
            cal = new wpd.Calibration(dimensions);

        wpd.graphicsWidget.resetData();

        this.onMouseClick = function(ev, pos, imagePos) {
            
            var len = points.length;
            points[len] = imagePos.x;
            points[len+1] = imagePos.y;

            ctx.dataCtx.beginPath();
    		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.dataCtx.fill();

            ctx.oriDataCtx.beginPath();
    		ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.oriDataCtx.fill();

            cal.addPoint(imagePos.x, imagePos.y, 0, 0);

            if(len/2+1 === maxPoints) {
                wpd.graphicsWidget.removeTool();
                wpd.graphicsWidget.resetData();
                this.onComplete(cal);
            }

            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onRedraw = function() {
            for(var i = 0; i < points.length; i+=2) {
                var pos = wpd.graphicsWidget.screenPx(points[i], points[i+1]);
                ctx.dataCtx.beginPath();
        		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	        	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		        ctx.dataCtx.fill();
            }
        };

        this.onComplete = function(cal) {};
    };

    return Tool;
})();


wpd.alignAxes = (function () {

    function initiatePlotAlignment() {
        xyEl = document.getElementById('r_xy');
        polarEl = document.getElementById('r_polar');
        ternaryEl = document.getElementById('r_ternary');
        mapEl = document.getElementById('r_map');
        imageEl = document.getElementById('r_image');

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            wpd.xyCalibration.start();
        } else if(polarEl.checked === true) {
            wpd.polarCalibration.start();
        } else if(ternaryEl.checked === true) {
            wpd.ternaryCalibration.start();
        } else if(mapEl.checked === true) {
            wpd.mapCalibration.start();
        } else if(imageEl.checked === true) {
            wpd.imageCalibration.start();
        }
    }

    function alignmentCompleted() {
        wpd.sidebar.show('acquireDataSidebar');
    }

    return {
        initiate: initiatePlotAlignment,
        alignmentCompleted: alignmentCompleted
    };

})();

