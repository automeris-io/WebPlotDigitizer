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

wpd.AxesCornersTool = class {
    constructor(calibration, reloadTool) {
        this.pointCount = 0,
            this._calibration = calibration,
            this.isCapturingCorners = true;
        this.reloadTool = reloadTool;
        this._isGrabbing = false;
        this._grabPtIndex = -1;
        if (reloadTool) {
            this.pointCount = this._calibration.maxPointCount;
            this.isCapturingCorners = false;
        } else {
            this.pointCount = 0;
            this.isCapturingCorners = true;
            wpd.graphicsWidget.resetData();
        }
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._calibration.getCount() != this._calibration.maxPointCount) {
            return;
        }
        const ptIndex = this._calibration.findNearestPoint(imagePos.x, imagePos.y);
        if (ptIndex >= 0) {
            ev.target.style.cursor = this._isGrabbing ? "grabbing" : "grab";
        } else {
            ev.target.style.cursor = "crosshair";
        }

        if (this._isGrabbing) {
            // move this calibration point to the mouse location
            this._calibration.changePointPx(this._grabPtIndex, imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
        }
    }

    onMouseDown(ev, pos, imagePos) {
        if (this._calibration.getCount() != this._calibration.maxPointCount) {
            return;
        }
        const ptIndex = this._calibration.findNearestPoint(imagePos.x, imagePos.y);
        if (ptIndex >= 0) {
            this._isGrabbing = true;
            this._grabPtIndex = ptIndex;
            this._calibration.unselectAll();
            this._calibration.selectPoint(ptIndex);
        }
    }

    onMouseUp(ev, pos, imagePos) {
        this._isGrabbing = false;
    }

    onMouseClick(ev, pos, imagePos) {
        if (this.isCapturingCorners) {
            this.pointCount = this.pointCount + 1;

            this._calibration.addPoint(imagePos.x, imagePos.y, 0, 0);
            this._calibration.unselectAll();
            this._calibration.selectPoint(this.pointCount - 1);
            wpd.graphicsWidget.forceHandlerRepaint();

            if (this.pointCount === this._calibration.maxPointCount) {
                this.isCapturingCorners = false;
                wpd.alignAxes.calibrationCompleted();
            }
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        } else {
            this._calibration.unselectAll();
            // cal.selectNearestPoint(imagePos.x,
            // imagePos.y, 15.0/wpd.graphicsWidget.getZoomRatio());
            this._calibration.selectNearestPoint(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        }
    }

    onKeyDown(ev) {
        if (this._calibration.getSelectedPoints().length === 0) {
            return;
        }

        let selPoint = this._calibration.getPoint(this._calibration.getSelectedPoints()[0]);
        let pointPx = selPoint.px;
        let pointPy = selPoint.py;
        let stepSize = ev.shiftKey === true ? 5 / wpd.graphicsWidget.getZoomRatio() :
            0.5 / wpd.graphicsWidget.getZoomRatio();

        // rotate to current rotation
        const currentRotation = wpd.graphicsWidget.getRotation();
        let {
            x,
            y
        } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, pointPx, pointPy);

        if (wpd.keyCodes.isUp(ev.keyCode)) {
            y = y - stepSize;
        } else if (wpd.keyCodes.isDown(ev.keyCode)) {
            y = y + stepSize;
        } else if (wpd.keyCodes.isLeft(ev.keyCode)) {
            x = x - stepSize;
        } else if (wpd.keyCodes.isRight(ev.keyCode)) {
            x = x + stepSize;
        } else {
            return;
        }

        // rotate back to original rotation
        ({
            x,
            y
        } = wpd.graphicsWidget.getRotatedCoordinates(currentRotation, 0, x, y));

        this._calibration.changePointPx(this._calibration.getSelectedPoints()[0], x, y);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.graphicsWidget.updateZoomToImagePosn(x, y);
        ev.preventDefault();
        ev.stopPropagation();
    }
};

wpd.AlignmentCornersRepainter = class {
    constructor(calibration, axesTypeString) {
        this._calibration = calibration;
        this.painterName = 'AlignmentCornersReptainer';
        this._axesTypeString = axesTypeString;
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        this.onRedraw();
    }

    onRedraw() {
        if (this._calibration == null) {
            return;
        }

        this.drawAxes();

        for (let i = 0; i < this._calibration.getCount(); i++) {
            let imagePos = this._calibration.getPoint(i);
            let imagePx = {
                x: imagePos.px,
                y: imagePos.py
            };

            let fillStyle = "rgba(200,0,0,1)";
            if (this._calibration.isPointSelected(i)) {
                fillStyle = "rgba(0,200,0,1)";
            }

            wpd.graphicsHelper.drawPoint(imagePx, fillStyle, this._calibration.labels[i],
                this._calibration.labelPositions[i]);
        }
    }

    drawAxes() {
        if (this._axesTypeString === "xy") {
            if (this._calibration.getCount() === 4) {
                let x1 = this._calibration.getPoint(0);
                let x2 = this._calibration.getPoint(1);
                let y1 = this._calibration.getPoint(2);
                let y2 = this._calibration.getPoint(3);
                wpd.graphicsHelper.drawLine({
                    x: x1.px,
                    y: x1.py
                }, {
                    x: x2.px,
                    y: x2.py
                }, "rgba(200,0,0,0.3)");
                wpd.graphicsHelper.drawLine({
                    x: y1.px,
                    y: y1.py
                }, {
                    x: y2.px,
                    y: y2.py
                }, "rgba(0,200,0,0.3)");
            }
        }

        if (this._axesTypeString === "bar") {
            if (this._calibration.getCount() === 2) {
                let p1 = this._calibration.getPoint(0);
                let p2 = this._calibration.getPoint(1);
                wpd.graphicsHelper.drawLine({
                    x: p1.px,
                    y: p1.py
                }, {
                    x: p2.px,
                    y: p2.py
                }, "rgba(200,0,0,0.3)");
            }
        }

        if (this._axesTypeString === "ternary") {
            if (this._calibration.getCount() === 3) {
                let a = this._calibration.getPoint(0);
                let b = this._calibration.getPoint(1);
                let c = this._calibration.getPoint(2);
                wpd.graphicsHelper.drawLine({
                    x: a.px,
                    y: a.py
                }, {
                    x: b.px,
                    y: b.py
                }, "rgba(200,0,0,0.3)");
                wpd.graphicsHelper.drawLine({
                    x: b.px,
                    y: b.py
                }, {
                    x: c.px,
                    y: c.py
                }, "rgba(0,200,0,0.3)");
                wpd.graphicsHelper.drawLine({
                    x: c.px,
                    y: c.py
                }, {
                    x: a.px,
                    y: a.py
                }, "rgba(0,0,200,0.3)");
            }
        }
    }
};

wpd.CircularChartRecorderAlignmentRepainter = class {
    _calibration = null;
    painterName = 'CircularChartRecorderAlignmentRepainter';

    constructor(calibration) {
        this._calibration = calibration;
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        this.onRedraw();
    }

    onRedraw() {
        if (this._calibration == null) {
            return;
        }
        for (let i = 0; i < this._calibration.getCount(); i++) {
            let imagePos = this._calibration.getPoint(i);
            let imagePx = {
                x: imagePos.px,
                y: imagePos.py
            };

            let fillStyle = "rgba(200,0,0,1)";
            if (this._calibration.isPointSelected(i)) {
                fillStyle = "rgba(0,200,0,1)";
            }
            wpd.graphicsHelper.drawPoint(imagePx, fillStyle, this._calibration.labels[i], this._calibration.labelPositions[i]);
        }

        // draw chart and pen circles
        if (this._calibration.getCount() == 5) {
            let cp = [];
            for (let i = 0; i < 5; i++) {
                cp.push(this._calibration.getPoint(i));
            }
            let penArcPts = [
                [cp[0].px, cp[0].py],
                [cp[1].px, cp[1].py],
                [cp[2].px, cp[2].py]
            ];
            let chartPts = [
                [cp[2].px, cp[2].py],
                [cp[3].px, cp[3].py],
                [cp[4].px, cp[4].py]
            ];
            let penCircle = wpd.getCircleFrom3Pts(penArcPts);
            let chartCircle = wpd.getCircleFrom3Pts(chartPts);
            wpd.graphicsHelper.drawCircle(penCircle, "rgba(0,200,0,0.5)");
            wpd.graphicsHelper.drawCircle(chartCircle, "rgba(200,0,0,1)");
        }
    }
};
