/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.xyCalibration = (function () {

    var _calibration = null;

    function start(calibration) {
        _calibration = calibration;
        wpd.popup.show('xyAxesInfo');
    }

    function reload() {
        var tool = new wpd.AxesCornersTool(_calibration, true);
        wpd.graphicsWidget.setTool(tool);
    }

    function pickCorners() {
        wpd.popup.close('xyAxesInfo');
        var tool = new wpd.AxesCornersTool(_calibration, false);
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
            plot;

        // validate log scale values
        if((xlog && (parseFloat(xmin) == 0 || parseFloat(xmax) == 0)) || (ylog && (parseFloat(ymin) == 0 || parseFloat(ymax) == 0))) {
            wpd.popup.close('xyAlignment');
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-log-inputs'), wpd.gettext('calibration-enter-valid-log'), getCornerValues);
            return false;            
        }

        _calibration.setDataAt(0, xmin, ymin);
        _calibration.setDataAt(1, xmax, ymin);
        _calibration.setDataAt(2, xmin, ymin);
        _calibration.setDataAt(3, xmax, ymax);
        if(!axes.calibrate(_calibration, xlog, ylog)) {
            wpd.popup.close('xyAlignment');
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-inputs'), wpd.gettext('calibration-enter-valid'), getCornerValues);
            return false;
        }
        axes.name = wpd.gettext("axes-name-xy");
        plot = wpd.appData.getPlotData();
        plot.addAxes(axes);        
        wpd.popup.close('xyAlignment');
        return true;
    }

    return {
        start: start,
        reload: reload,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };
})();

wpd.barCalibration = (function () {
    
    var _calibration = null;

    function start(calibration) {
        _calibration = calibration;
        wpd.popup.show('barAxesInfo');
    }

    function reload() {
        var tool = new wpd.AxesCornersTool(_calibration, true);
        wpd.graphicsWidget.setTool(tool);
    }

    function pickCorners() {
        wpd.popup.close('barAxesInfo');
        var tool = new wpd.AxesCornersTool(_calibration, false);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('barAlignment');
    }

    function align() {
        var p1 = document.getElementById('bar-axes-p1').value,
            p2 = document.getElementById('bar-axes-p2').value,
            isLogScale = document.getElementById('bar-axes-log-scale').checked,
            isRotated = document.getElementById('bar-axes-rotated').checked,
            axes = new wpd.BarAxes(),
            plot;

        _calibration.setDataAt(0, 0, p1);
        _calibration.setDataAt(1, 0, p2);
        if(!axes.calibrate(_calibration, isLogScale, isRotated)) {
            wpd.popup.close('barAlignment');
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-inputs'), wpd.gettext('calibration-enter-valid'), getCornerValues);
            return false;
        }
        axes.name = wpd.gettext("axes-name-bar");
        plot = wpd.appData.getPlotData();
        plot.addAxes(axes);        
        wpd.popup.close('barAlignment');
        return true;
    }

    return {
        start: start,
        reload: reload,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };
})();

wpd.polarCalibration = (function () {
    
    var _calibration = null;

    function start(calibration) {
        _calibration = calibration;
        wpd.popup.show('polarAxesInfo');
    }

    function reload() {
        var tool = new wpd.AxesCornersTool(_calibration, true);
        wpd.graphicsWidget.setTool(tool);
    }

    function pickCorners() {
        wpd.popup.close('polarAxesInfo');
        var tool = new wpd.AxesCornersTool(_calibration, false);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('polarAlignment');
    }

    function align() {
        var r1 = parseFloat(document.getElementById('polar-r1').value),
            theta1 = parseFloat(document.getElementById('polar-theta1').value),
            r2 = parseFloat(document.getElementById('polar-r2').value),
            theta2 = parseFloat(document.getElementById('polar-theta2').value),
            degrees = document.getElementById('polar-degrees').checked,
            radians = document.getElementById('polar-radians').checked,
            orientation = document.getElementById('polar-clockwise').checked,
            rlog = document.getElementById('polar-log-scale').checked,
            axes = new wpd.PolarAxes(),
            plot,
            isDegrees = degrees;

        _calibration.setDataAt(1, r1, theta1);
        _calibration.setDataAt(2, r2, theta2);
        axes.calibrate(_calibration, isDegrees, orientation, rlog);
        axes.name = wpd.gettext("axes-name-polar");
        plot = wpd.appData.getPlotData();
        plot.addAxes(axes);        
        wpd.popup.close('polarAlignment');
        return true;
    }

    return {
        start: start,
        reload: reload,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();
        
wpd.ternaryCalibration = (function () {

    var _calibration = null;

    function start(calibration) {
        _calibration = calibration;
        wpd.popup.show('ternaryAxesInfo');
    }

    function reload() {
        var tool = new wpd.AxesCornersTool(_calibration, true);
        wpd.graphicsWidget.setTool(tool);
    }

    function pickCorners() {
        wpd.popup.close('ternaryAxesInfo');
        var tool = new wpd.AxesCornersTool(_calibration, false);
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
            plot;

        axes.calibrate(_calibration, range100, ternaryNormal);
        axes.name = wpd.gettext("axes-name-ternary");
        plot = wpd.appData.getPlotData();
        plot.addAxes(axes);
        wpd.popup.close('ternaryAlignment');
        return true;
    }

    return {
        start: start,
        reload: reload,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();
        
wpd.mapCalibration = (function () {

    var _calibration = null;

    function start(calibration) {
        _calibration = calibration;
        wpd.popup.show('mapAxesInfo');
    }

    function reload() {
        var tool = new wpd.AxesCornersTool(2, true, _calibration);
        wpd.graphicsWidget.setTool(tool);
    }

    function pickCorners() {
        wpd.popup.close('mapAxesInfo');
        var tool = new wpd.AxesCornersTool(2, false, _calibration);
        wpd.graphicsWidget.setTool(tool);
    }

    function getCornerValues() {
        wpd.popup.show('mapAlignment');
    }

    function align() {
        var scaleLength = parseFloat(document.getElementById('scaleLength').value),
            scaleUnits = document.getElementById('scaleUnits').value,
            axes = new wpd.MapAxes(),
            plot;

        axes.calibrate(_calibration, scaleLength, scaleUnits);
        axes.name = wpd.gettext("axes-name-map");
        plot = wpd.appData.getPlotData();
        plot.addAxes(axes);        
        wpd.popup.close('mapAlignment');
        return true;
    }

    return {
        start: start,
        reload: reload,
        pickCorners: pickCorners,
        getCornerValues: getCornerValues,
        align: align
    };

})();

wpd.alignAxes = (function () {
    
    var calibration, calibrator;

    function initiatePlotAlignment() {
        xyEl = document.getElementById('r_xy');
        polarEl = document.getElementById('r_polar');
        ternaryEl = document.getElementById('r_ternary');
        mapEl = document.getElementById('r_map');
        imageEl = document.getElementById('r_image');
        barEl = document.getElementById('r_bar');

        wpd.popup.close('axesList');

        if (xyEl.checked === true) {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['X1', 'X2', 'Y2', 'Y2'];
            calibration.maxPointCount = 4;
            calibrator = wpd.xyCalibration;
        } else if(barEl.checked === true) {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['P1', 'P2'];
            calibration.maxPointCount = 2;
            calibrator = wpd.barCalibration;
        } else if(polarEl.checked === true) {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['Origin', 'P1', 'P2'];
            calibration.maxPointCount = 3;
            calibrator = wpd.polarCalibration;
        } else if(ternaryEl.checked === true) {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['A', 'B', 'C'];
            calibration.maxPointCount = 3;
            calibrator = wpd.ternaryCalibration;
        } else if(mapEl.checked === true) {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['P1', 'P2'];
            calibration.maxPointCount = 2;
            calibrator = wpd.mapCalibration;
        } else if(imageEl.checked === true) {
            calibration = null;
            calibrator = null;
            var imageAxes = new wpd.ImageAxes();
            imageAxes.name = wpd.gettext("axes-name-image")
            imageAxes.calibrate();
            wpd.appData.getPlotData().addAxes(imageAxes);
            wpd.tree.refresh();
            let dsNameColl = wpd.appData.getPlotData().getDatasetNames();
            if(dsNameColl.length > 0) {
                let dsName = dsNameColl[0];
                wpd.tree.selectPath("/"+ wpd.gettext("datasets") +"/" + dsName, true);
            }
            wpd.acquireData.load();
        }

        if(calibrator != null) {
            calibrator.start(calibration);
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration));
        }
    }

    function calibrationCompleted() {
        wpd.sidebar.show('axes-calibration-sidebar');
    }

    function zoomCalPoint(i){
        var point = calibration.getPoint(i);
        wpd.graphicsWidget.updateZoomToImagePosn(point.px, point.py);
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
        wpd.tree.refresh();
        let dsNameColl = wpd.appData.getPlotData().getDatasetNames();
        if(dsNameColl.length > 0) {
            let dsName = dsNameColl[0];
            wpd.tree.selectPath("/"+wpd.gettext("datasets")+"/"+dsName);
        }        
    }

    function editAlignment() {
        var hasAlignment = wpd.appData.isAligned() && calibrator != null;
        if(hasAlignment) {
            wpd.popup.show('edit-or-reset-calibration-popup');
        } else {
            wpd.popup.show('axesList');
        }
    }

    function reloadCalibrationForEditing() {
        wpd.popup.close('edit-or-reset-calibration-popup');        
        calibrator.reload();
        wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration));
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.sidebar.show('axes-calibration-sidebar');
    }

    return {
        start: initiatePlotAlignment,
        calibrationCompleted: calibrationCompleted,
        zoomCalPoint: zoomCalPoint,
        getCornerValues: getCornerValues,
        align: align,        
        editAlignment: editAlignment,
        reloadCalibrationForEditing: reloadCalibrationForEditing
    };

})();