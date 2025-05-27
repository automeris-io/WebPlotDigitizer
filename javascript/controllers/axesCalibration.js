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

wpd.AxesCalibrator = class {
    constructor(calibration, isEditing) {
        this._calibration = calibration;
        this._isEditing = isEditing;
    }
};

wpd.XYAxesCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        let tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show("xy-axes-sidebar");
        if (this._isEditing) {
            let axes = wpd.tree.getActiveAxes();
            let prevCal = axes.calibration;
            if (prevCal.getCount() == 4) {
                document.getElementById('xy-axes-x1').value = prevCal.getPoint(0).dx;
                document.getElementById('xy-axes-x2').value = prevCal.getPoint(1).dx;
                document.getElementById('xy-axes-y1').value = prevCal.getPoint(2).dy;
                document.getElementById('xy-axes-y2').value = prevCal.getPoint(3).dy;
                const $xscale = document.getElementById('xy-axes-xscale');
                if (axes.isLogX()) {
                    $xscale.value = "log";
                } else if (axes.isDate(0)) {
                    $xscale.value = "date";
                } else {
                    $xscale.value = "linear";
                }
                const $yscale = document.getElementById('xy-axes-yscale');
                if (axes.isLogY()) {
                    $yscale.value = "log";
                } else if (axes.isDate(1)) {
                    $yscale.value = "date";
                } else {
                    $yscale.value = "linear";
                }
                document.getElementById('xy-axes-skip-rotation').checked = axes.noRotation();
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("xy-axes-calibrate").disabled = true;
        }
    }

    align() {
        let xmin = document.getElementById('xy-axes-x1').value;
        let xmax = document.getElementById('xy-axes-x2').value;
        let ymin = document.getElementById('xy-axes-y1').value;
        let ymax = document.getElementById('xy-axes-y2').value;
        const $xscale = document.getElementById('xy-axes-xscale');
        const $yscale = document.getElementById('xy-axes-yscale');
        let xlog = ($xscale.value === "log");
        let ylog = ($yscale.value === "log");
        let noRotation = document.getElementById('xy-axes-skip-rotation').checked;
        let axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.XYAxes();

        // validate log scale values
        if ((xlog && (parseFloat(xmin) == 0 || parseFloat(xmax) == 0)) ||
            (ylog && (parseFloat(ymin) == 0 || parseFloat(ymax) == 0))) {
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-log-inputs'),
                wpd.gettext('calibration-enter-valid-log'),
                wpd.alignAxes.getCornerValues);
            return false;
        }

        this._calibration.setDataAt(0, xmin, ymin);
        this._calibration.setDataAt(1, xmax, ymin);
        this._calibration.setDataAt(2, xmin, ymin);
        this._calibration.setDataAt(3, xmax, ymax);
        if (!axes.calibrate(this._calibration, xlog, ylog, noRotation)) {
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-inputs'),
                wpd.gettext('calibration-enter-valid'),
                wpd.alignAxes.getCornerValues);
            return false;
        }

        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.XYAxes);
            let plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }
        return true;
    }
};

wpd.BarAxesCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        let tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show("bar-axes-sidebar");
        if (this._isEditing) {
            let axes = wpd.tree.getActiveAxes();
            let prevCal = axes.calibration;
            if (prevCal.getCount() == 2) {
                document.getElementById('bar-axes-p1').value = prevCal.getPoint(0).dy;
                document.getElementById('bar-axes-p2').value = prevCal.getPoint(1).dy;
                const $scale = document.getElementById("bar-axes-scale");
                $scale.value = axes.isLog() ? "log" : "linear";
                document.getElementById('bar-axes-rotated').checked = axes.isRotated();
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("bar-axes-calibrate").disabled = true;
        }
    }

    align() {
        let p1 = document.getElementById('bar-axes-p1').value;
        let p2 = document.getElementById('bar-axes-p2').value;
        const $scale = document.getElementById("bar-axes-scale");
        let isLogScale = ($scale.value == "log");
        let isRotated = document.getElementById('bar-axes-rotated').checked;
        let axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.BarAxes();

        this._calibration.setDataAt(0, 0, p1);
        this._calibration.setDataAt(1, 0, p2);
        if (!axes.calibrate(this._calibration, isLogScale, isRotated)) {
            wpd.messagePopup.show(wpd.gettext('calibration-invalid-inputs'),
                wpd.gettext('calibration-enter-valid'),
                wpd.alignAxes.getCornerValues);
            return false;
        }
        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.BarAxes);
            let plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }
        return true;
    }
};

wpd.PolarAxesCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        let tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show("polar-axes-sidebar");
        if (this._isEditing) {
            let axes = wpd.tree.getActiveAxes();
            let prevCal = axes.calibration;
            if (prevCal.getCount() == 3) {
                document.getElementById('polar-axes-r1').value = prevCal.getPoint(1).dx;
                document.getElementById('polar-axes-theta1').value = prevCal.getPoint(1).dy;
                document.getElementById('polar-axes-r2').value = prevCal.getPoint(2).dx;
                document.getElementById('polar-axes-theta2').value = prevCal.getPoint(2).dy;
                const $orientation = document.getElementById('polar-axes-angular-orientation');
                const $units = document.getElementById('polar-axes-angular-units');
                const $scale = document.getElementById('polar-axes-scale');
                $units.value = axes.isThetaDegrees() ? "degrees" : "radians";
                $orientation.value = axes.isThetaClockwise() ? "clockwise" : "anticlockwise";
                $scale.value = axes.isRadialLog() ? "log" : "linear";
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("polar-axes-calibrate").disabled = true;
        }
    }

    align() {
        let r1 = parseFloat(document.getElementById('polar-axes-r1').value);
        let theta1 = parseFloat(document.getElementById('polar-axes-theta1').value);
        let r2 = parseFloat(document.getElementById('polar-axes-r2').value);
        let theta2 = parseFloat(document.getElementById('polar-axes-theta2').value);
        let angUnits = document.getElementById('polar-axes-angular-units').value;
        let orientation = document.getElementById('polar-axes-angular-orientation').value;
        let isClockwise = (orientation === "clockwise");
        let rscale = document.getElementById('polar-axes-scale').value;
        let isRLog = (rscale === "log");
        let axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.PolarAxes();
        let isDegrees = (angUnits === "degrees");

        this._calibration.setDataAt(1, r1, theta1);
        this._calibration.setDataAt(2, r2, theta2);
        axes.calibrate(this._calibration, isDegrees, isClockwise, isRLog);
        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.PolarAxes);
            let plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }
        return true;
    }
};

wpd.TernaryAxesCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        let tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show('ternary-axes-sidebar');
        if (this._isEditing) {
            let axes = wpd.tree.getActiveAxes();
            let prevCal = axes.calibration;
            if (prevCal.getCount() == 3) {
                const $range = document.getElementById('ternary-axes-scale');
                $range.value = axes.isRange100() ? "scale100" : "scale1";
                const $orient = document.getElementById('ternary-axes-normal');
                $orient.checked = axes.isNormalOrientation();
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("ternary-axes-calibrate").disabled = true;
        }
    }

    align() {
        const $range = document.getElementById('ternary-axes-scale');
        const $orient = document.getElementById('ternary-axes-normal');
        let range100 = ($range.value == "scale100");
        let ternaryNormal = $orient.checked;
        let axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.TernaryAxes();

        axes.calibrate(this._calibration, range100, ternaryNormal);
        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.TernaryAxes);
            let plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }

        return true;
    }
};

wpd.MapAxesCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        var tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show("map-axes-sidebar");
        if (this._isEditing) {
            let axes = wpd.tree.getActiveAxes();
            let prevCal = axes.calibration;
            if (prevCal.getCount() == 2) {
                document.getElementById('map-axes-scale').value = axes.getScaleLength();
                document.getElementById('map-axes-units').value = axes.getUnits();
                const $origin = document.getElementById('map-axes-origin');
                $origin.value = axes.getOriginLocation() == "bottom-left" ? "bottom-left" : "top-left";
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("map-axes-calibrate").disabled = true;
        }
    }

    align() {
        let scaleLength = parseFloat(document.getElementById('map-axes-scale').value);
        let scaleUnits = document.getElementById('map-axes-units').value;
        let originLocation = document.getElementById('map-axes-origin').value;
        let imageHeight = wpd.graphicsWidget.getImageSize().height;
        let axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.MapAxes();

        axes.calibrate(this._calibration, scaleLength, scaleUnits, originLocation, imageHeight);
        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.MapAxes);
            let plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }
        return true;
    }
};

wpd.CircularChartRecorderCalibrator = class extends wpd.AxesCalibrator {

    pickCorners() {
        let tool = new wpd.AxesCornersTool(this._calibration, this._isEditing);
        wpd.graphicsWidget.setTool(tool);
        wpd.sidebar.show('ccr-axes-sidebar');
        if (this._isEditing) {
            const axes = wpd.tree.getActiveAxes();
            const prevCal = axes.calibration;
            if (prevCal.getCount() == 5) {
                document.getElementById('ccr-t0').value = prevCal.getPoint(0).dx;
                document.getElementById('ccr-r0').value = prevCal.getPoint(0).dy;
                const startTime = axes.getStartTime();
                const rotationTime = axes.getRotationTime();
                const rotationDirection = axes.getRotationDirection();
                if (startTime != null) {
                    document.getElementById('ccr-tstart').value = startTime;
                    document.getElementById('ccr-rotation-time').value = rotationTime;
                    document.getElementById('ccr-direction').value = rotationDirection;
                }
                document.getElementById('ccr-r2').value = prevCal.getPoint(2).dy;
            }
        }
        if (this._calibration.getCount() < this._calibration.maxPointCount) {
            document.getElementById("ccr-axes-calibrate").disabled = true;
        }
    }

    align() {
        const t0 = document.getElementById('ccr-t0').value;
        const r0 = parseFloat(document.getElementById('ccr-r0').value);
        const r2 = parseFloat(document.getElementById('ccr-r2').value);
        const tstart = document.getElementById('ccr-tstart').value;
        const rotationTime = document.getElementById('ccr-rotation-time').value;
        const rotationDirection = document.getElementById('ccr-direction').value;
        const axes = this._isEditing ? wpd.tree.getActiveAxes() : new wpd.CircularChartRecorderAxes();

        this._calibration.setDataAt(0, t0, r0);
        this._calibration.setDataAt(1, t0, 0);
        this._calibration.setDataAt(2, t0, r2);
        this._calibration.setDataAt(3, 0, r2);
        this._calibration.setDataAt(4, 0, r2);

        axes.calibrate(this._calibration, tstart, rotationTime, rotationDirection);
        if (!this._isEditing) {
            axes.name = wpd.alignAxes.makeAxesName(wpd.CircularChartRecorderAxes);
            const plot = wpd.appData.getPlotData();
            plot.addAxes(axes, wpd.appData.isMultipage());
            wpd.alignAxes.postProcessAxesAdd(axes);
        }
        return true;
    }
};

wpd.alignAxes = (function() {
    let calibration = null;
    let calibrator = null;

    function initiatePlotAlignment(axesTypeString) {
        if (axesTypeString === "xy") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['X1', 'X2', 'Y1', 'Y2'];
            calibration.labelPositions = ['N', 'N', 'E', 'E'];
            calibration.maxPointCount = 4;
            calibrator = new wpd.XYAxesCalibrator(calibration);
        } else if (axesTypeString === "bar") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['P1', 'P2'];
            calibration.labelPositions = ['S', 'S'];
            calibration.maxPointCount = 2;
            calibrator = new wpd.BarAxesCalibrator(calibration);
        } else if (axesTypeString === "polar") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['Origin', 'P1', 'P2'];
            calibration.labelPositions = ['E', 'S', 'S'];
            calibration.maxPointCount = 3;
            calibrator = new wpd.PolarAxesCalibrator(calibration);
        } else if (axesTypeString === "ternary") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['A', 'B', 'C'];
            calibration.labelPositions = ['S', 'S', 'E'];
            calibration.maxPointCount = 3;
            calibrator = new wpd.TernaryAxesCalibrator(calibration);
        } else if (axesTypeString === "map") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['P1', 'P2'];
            calibration.labelPositions = ['S', 'S'];
            calibration.maxPointCount = 2;
            calibrator = new wpd.MapAxesCalibrator(calibration);
        } else if (axesTypeString === "image") {
            calibration = null;
            calibrator = null;
            var imageAxes = new wpd.ImageAxes();
            imageAxes.name = wpd.alignAxes.makeAxesName(wpd.ImageAxes);
            imageAxes.calibrate();
            wpd.appData.getPlotData().addAxes(imageAxes, wpd.appData.isMultipage());
            postProcessAxesAdd(imageAxes);
            wpd.tree.refresh();
            let dsNameColl = wpd.appData.getPlotData().getDatasetNames();
            if (dsNameColl.length > 0) {
                let dsName = dsNameColl[dsNameColl.length - 1];
                wpd.tree.selectPath("/" + wpd.gettext("datasets") + "/" + dsName, true);
            }
            wpd.acquireData.load();
        } else if (axesTypeString === "circular-chart-recorder") {
            calibration = new wpd.Calibration(2);
            calibration.labels = ['(T0,R0)', '(T0,R1)', '(T0,R2)', '(T1,R2)', '(T2,R2)'];
            calibration.labelPositions = ['S', 'S', 'S', 'S', 'S'];
            calibration.maxPointCount = 5;
            calibrator = new wpd.CircularChartRecorderCalibrator(calibration);
        } else {
            console.error("unknown axes type string", axesTypeString);
        }

        if (calibrator != null) {
            wpd.tree.selectPath("/" + wpd.gettext("axes"));
            calibrator.pickCorners();
            if (axesTypeString === "circular-chart-recorder") {
                wpd.graphicsWidget.setRepainter(new wpd.CircularChartRecorderAlignmentRepainter(calibration));
            } else {
                wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration, axesTypeString));
            }
        }
    }

    function calibrationCompleted() {
        if (calibrator instanceof wpd.XYAxesCalibrator) {
            document.getElementById("xy-axes-calibrate").disabled = false;
        } else if (calibrator instanceof wpd.BarAxesCalibrator) {
            document.getElementById("bar-axes-calibrate").disabled = false;
        } else if (calibrator instanceof wpd.MapAxesCalibrator) {
            document.getElementById("map-axes-calibrate").disabled = false;
        } else if (calibrator instanceof wpd.PolarAxesCalibrator) {
            document.getElementById("polar-axes-calibrate").disabled = false;
        } else if (calibrator instanceof wpd.TernaryAxesCalibrator) {
            document.getElementById("ternary-axes-calibrate").disabled = false;
        } else if (calibrator instanceof wpd.CircularChartRecorderCalibrator) {
            document.getElementById("ccr-axes-calibrate").disabled = false;
        } else {
            wpd.sidebar.show('axes-calibration-sidebar');
        }
    }

    function zoomCalPoint(i) {
        var point = calibration.getPoint(i);
        wpd.graphicsWidget.updateZoomToImagePosn(point.px, point.py);
    }

    function getCornerValues() {
        calibrator.getCornerValues();
    }

    function pickCorners() {
        calibrator.pickCorners();
    }

    function align() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if (!calibrator.align()) {
            return;
        }
        wpd.sidebar.clear();
        wpd.tree.refresh();
        let dsNameColl = wpd.appData.getPlotData().getDatasetNames();
        if (dsNameColl.length > 0) {
            let dsName = dsNameColl[0];
            wpd.tree.selectPath("/" + wpd.gettext("datasets") + "/" + dsName);
        }
    }

    function editAlignment() {
        let hasAlignment = wpd.appData.isAligned() && calibrator != null;
        if (hasAlignment) {
            wpd.popup.show('edit-or-reset-calibration-popup');
        } else {
            wpd.calibrateAxesDialog.open();
        }
    }

    function addCalibration() {
        wpd.calibrateAxesDialog.open();
    }

    function reloadCalibrationForEditing() {
        wpd.popup.close('edit-or-reset-calibration-popup');
        calibrator = null;
        const axes = wpd.tree.getActiveAxes();
        calibration = axes.calibration;
        let axesTypeString = "";
        if (axes instanceof wpd.XYAxes) {
            calibrator = new wpd.XYAxesCalibrator(calibration, true);
            axesTypeString = "xy";
        } else if (axes instanceof wpd.BarAxes) {
            calibrator = new wpd.BarAxesCalibrator(calibration, true);
            axesTypeString = "bar";
        } else if (axes instanceof wpd.PolarAxes) {
            calibrator = new wpd.PolarAxesCalibrator(calibration, true);
            axesTypeString = "polar";
        } else if (axes instanceof wpd.TernaryAxes) {
            calibrator = new wpd.TernaryAxesCalibrator(calibration, true);
            axesTypeString = "ternary";
        } else if (axes instanceof wpd.MapAxes) {
            calibrator = new wpd.MapAxesCalibrator(calibration, true);
            axesTypeString = "map";
        } else if (axes instanceof wpd.CircularChartRecorderAxes) {
            calibrator = new wpd.CircularChartRecorderCalibrator(calibration, true);
            axesTypeString = "circular-chart-recorder";
        }
        if (calibrator == null)
            return;
        calibrator.pickCorners();
        if (axes instanceof wpd.CircularChartRecorderAxes) {
            wpd.graphicsWidget.setRepainter(new wpd.CircularChartRecorderAlignmentRepainter(calibration));
        } else {
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration, axesTypeString));
        }
        wpd.graphicsWidget.forceHandlerRepaint();
        if (calibrator instanceof wpd.XYAxesCalibrator) {
            document.getElementById('xy-axes-calibrate').disabled = false;
        } else if (calibrator instanceof wpd.BarAxesCalibrator) {
            document.getElementById('bar-axes-calibrate').disabled = false;
        } else if (calibrator instanceof wpd.MapAxesCalibrator) {
            document.getElementById('map-axes-calibrate').disabled = false;
        } else if (calibrator instanceof wpd.PolarAxesCalibrator) {
            document.getElementById('polar-axes-calibrate').disabled = false;
        } else if (calibrator instanceof wpd.TernaryAxesCalibrator) {
            document.getElementById('ternary-axes-calibrate').disabled = false;
        } else if (calibrator instanceof wpd.CircularChartRecorderCalibrator) {
            document.getElementById('ccr-axes-calibrate').disabled = false;
        } else {
            wpd.sidebar.show('axes-calibration-sidebar');
        }
    }

    function deleteCalibration() {
        wpd.okCancelPopup.show(wpd.gettext("delete-axes"), wpd.gettext("delete-axes-text"), deleteAssociatedDatasets);
    }

    function deleteAssociatedDatasets() {
        const deleteAxes = () => {
            const plotData = wpd.appData.getPlotData();
            const axes = wpd.tree.getActiveAxes();
            plotData.deleteAxes(axes);
            if (wpd.appData.isMultipage()) {
                wpd.appData.getPageManager().deleteAxesFromCurrentPage([axes]);
            }
            wpd.tree.refresh();
            wpd.tree.selectPath("/" + wpd.gettext("axes"));
            // dispatch axes delete event
            wpd.events.dispatch("wpd.axes.delete", {
                axes: axes
            });
        };

        const plotData = wpd.appData.getPlotData();
        const axes = wpd.tree.getActiveAxes();

        // get all datasets and filter to datasets of active axes
        const datasets = plotData.getDatasets();
        const axesDatasets = datasets.filter((ds) => plotData.getAxesForDataset(ds) === axes);

        if (axesDatasets.length > 0) {
            // only display delete associated datasets popup if they exist
            wpd.okCancelPopup.show(
                wpd.gettext("delete-associated-datasets"),
                wpd.gettext("delete-associated-datasets-text"),
                () => {
                    for (const dataset of axesDatasets) {
                        plotData.deleteDataset(dataset);
                        wpd.appData.getFileManager().deleteDatasetsFromCurrentFile([dataset]);
                        if (wpd.appData.isMultipage()) {
                            wpd.appData.getPageManager().deleteDatasetsFromCurrentPage([dataset]);
                        }
                        // dispatch dataset delete event
                        wpd.events.dispatch("wpd.dataset.delete", {
                            dataset: dataset
                        });

                        // no need to refresh the tree here
                    }

                    deleteAxes();
                },
                deleteAxes,
            );
        } else {
            // otherwise, proceed to delete the axes
            deleteAxes();
        }
    }

    function showRenameAxes() {
        const axes = wpd.tree.getActiveAxes();
        const $axName = document.getElementById("rename-axes-name-input");
        $axName.value = axes.name;
        wpd.popup.show('rename-axes-popup');
    }

    function renameAxes() {
        const $axName = document.getElementById("rename-axes-name-input");
        wpd.popup.close('rename-axes-popup');
        // check if this name already exists
        const name = $axName.value.trim();
        const plotData = wpd.appData.getPlotData();
        if (plotData.getAxesNames().indexOf(name) >= 0 || name.length === 0) {
            wpd.messagePopup.show(wpd.gettext("rename-axes-error"),
                wpd.gettext("axes-exists-error"), showRenameAxes);
            return;
        }
        const axes = wpd.tree.getActiveAxes();
        axes.name = name;
        wpd.tree.refresh();
        wpd.tree.selectPath("/" + wpd.gettext("axes") + "/" + name, true);
    }

    function renameKeypress(e) {
        if (e.key === "Enter") {
            renameAxes();
        }
    }

    function makeAxesName(axType) {
        const plotData = wpd.appData.getPlotData();
        let name = "";
        const existingAxesNames = plotData.getAxesNames();
        if (axType === wpd.XYAxes) {
            name = wpd.gettext("axes-name-xy");
        } else if (axType === wpd.PolarAxes) {
            name = wpd.gettext("axes-name-polar");
        } else if (axType === wpd.MapAxes) {
            name = wpd.gettext("axes-name-map");
        } else if (axType === wpd.TernaryAxes) {
            name = wpd.gettext("axes-name-ternary");
        } else if (axType === wpd.BarAxes) {
            name = wpd.gettext("axes-name-bar");
        } else if (axType === wpd.ImageAxes) {
            name = wpd.gettext("axes-name-image");
        } else if (axType === wpd.CircularChartRecorderAxes) {
            name = wpd.gettext("axes-name-circular-chart-recorder");
        }
        // avoid conflict with an existing name
        let idx = 2;
        let fullName = name;
        while (existingAxesNames.indexOf(fullName) >= 0) {
            fullName = name + " " + idx;
            idx++;
        }
        return fullName;
    }

    function postProcessAxesAdd(axes, suppressDatasetCreation) {
        // dispatch axes add event
        wpd.events.dispatch("wpd.axes.add", {
            axes: axes
        });

        const plotData = wpd.appData.getPlotData();
        const fileManager = wpd.appData.getFileManager();
        const pageManager = wpd.appData.getPageManager();

        fileManager.addAxesToCurrentFile([axes]);

        let axesColl = fileManager.filterToCurrentFileAxes(plotData.getAxesColl());
        let datasetColl = fileManager.filterToCurrentFileDatasets(plotData.getDatasets());

        if (wpd.appData.isMultipage()) {
            pageManager.addAxesToCurrentPage([axes]);
            axesColl = pageManager.filterToCurrentPageAxes(axesColl);
            datasetColl = pageManager.filterToCurrentPageDatasets(datasetColl);
        }

        // create a default dataset and associate it with the axes if this is the first
        // axes (in the file and/or page) and datasets do not yet exist
        if (axesColl.length === 1 && datasetColl.length === 0 && suppressDatasetCreation != true) {
            let dataset = new wpd.Dataset();
            dataset.name = 'Default Dataset';
            const count = wpd.dataSeriesManagement.getDatasetWithNameCount(dataset.name);
            if (count > 0) dataset.name += ' ' + (count + 1);

            plotData.addDataset(dataset);
            plotData.setAxesForDataset(dataset, axes);
            fileManager.addDatasetsToCurrentFile([dataset]);

            if (wpd.appData.isMultipage()) {
                pageManager.addDatasetsToCurrentPage([dataset]);
            }

            // dispatch dataset add event
            wpd.events.dispatch("wpd.dataset.add", {
                dataset: dataset
            });
        }
    }

    return {
        start: initiatePlotAlignment,
        calibrationCompleted: calibrationCompleted,
        zoomCalPoint: zoomCalPoint,
        getCornerValues: getCornerValues,
        pickCorners: pickCorners,
        align: align,
        editAlignment: editAlignment,
        reloadCalibrationForEditing: reloadCalibrationForEditing,
        addCalibration: addCalibration,
        deleteCalibration: deleteCalibration,
        showRenameAxes: showRenameAxes,
        makeAxesName: makeAxesName,
        renameAxes: renameAxes,
        renameKeypress: renameKeypress,
        postProcessAxesAdd: postProcessAxesAdd
    };
})();
