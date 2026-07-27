/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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
    static get typeString() { return "xy"; }
    static get axesClass() { return wpd.XYAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['X1', 'X2', 'Y1', 'Y2'], labelPositions: ['N', 'N', 'E', 'E'], maxPointCount: 4 };
    }
    get calibrateButtonId() { return "xy-axes-calibrate"; }

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
    static get typeString() { return "bar"; }
    static get axesClass() { return wpd.BarAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['P1', 'P2'], labelPositions: ['S', 'S'], maxPointCount: 2 };
    }
    get calibrateButtonId() { return "bar-axes-calibrate"; }

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
    static get typeString() { return "polar"; }
    static get axesClass() { return wpd.PolarAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['Origin', 'P1', 'P2'], labelPositions: ['E', 'S', 'S'], maxPointCount: 3 };
    }
    get calibrateButtonId() { return "polar-axes-calibrate"; }

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
    static get typeString() { return "ternary"; }
    static get axesClass() { return wpd.TernaryAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['A', 'B', 'C'], labelPositions: ['S', 'S', 'E'], maxPointCount: 3 };
    }
    get calibrateButtonId() { return "ternary-axes-calibrate"; }

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
    static get typeString() { return "map"; }
    static get axesClass() { return wpd.MapAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['P1', 'P2'], labelPositions: ['S', 'S'], maxPointCount: 2 };
    }
    get calibrateButtonId() { return "map-axes-calibrate"; }

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
    static get typeString() { return "circular-chart-recorder"; }
    static get axesClass() { return wpd.CircularChartRecorderAxes; }
    static get calibrationSpec() {
        return { dimensions: 2, labels: ['(T0,R0)', '(T0,R1)', '(T0,R2)', '(T1,R2)', '(T2,R2)'], labelPositions: ['S', 'S', 'S', 'S', 'S'], maxPointCount: 5 };
    }
    get calibrateButtonId() { return "ccr-axes-calibrate"; }

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
