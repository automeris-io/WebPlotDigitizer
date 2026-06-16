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

wpd.AddMeasurementTool = class {
    constructor(mode) {
        this._mode = mode;
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._pointsCaptured = 0;
        this._isCapturing = true;
        this._plist = [];
        this._dpr = 1;
    }

    onAttach() {
        document.getElementById(this._mode.addButtonId).classList.add('pressed-button');
        if (this._mode.connectivity < 0) { // area/perimeter
            document.getElementById("add-polygon-info").style.display = "block";
        }
        this._dpr = window.devicePixelRatio;
    }

    onRemove() {
        document.getElementById(this._mode.addButtonId).classList.remove('pressed-button');
        if (this._mode.connectivity < 0) { // area/perimeter
            document.getElementById("add-polygon-info").style.display = "none";
        }
    }

    onKeyDown(ev) {
        // move the selected point or switch tools
        if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
            wpd.graphicsWidget.resetHover();
            wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(this._mode));
            return;
        } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
            wpd.graphicsWidget.resetHover();
            wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(this._mode));
            return;
        } else if ((wpd.keyCodes.isEnter(ev.keyCode) || wpd.keyCodes.isEsc(ev.keyCode)) &&
            this._isCapturing === true && this._mode.connectivity < 0) {
            this._isCapturing = false;
            this._mode.getData().addConnection(this._plist);
            wpd.graphicsWidget.resetHover();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(this._mode));
            return;
        }
    }

    onMouseClick(ev, pos, imagePos) {
        if (this._isCapturing) {

            wpd.graphicsWidget.resetHover();

            this._plist[this._pointsCaptured * 2] = imagePos.x;
            this._plist[this._pointsCaptured * 2 + 1] = imagePos.y;
            this._pointsCaptured = this._pointsCaptured + 1;

            // get new pos by translating imagePos
            const {
                x,
                y
            } = wpd.graphicsWidget.imageToCanvasPx(imagePos.x, imagePos.y);

            if (this._pointsCaptured === this._mode.connectivity) {
                this._isCapturing = false;
                this._mode.getData().addConnection(this._plist);
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.forceHandlerRepaint();
                this._mode.getData().selectNearestPoint(imagePos.x, imagePos.y);
                wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(this._mode));
                return;
            }

            if (this._pointsCaptured > 1) {
                // draw line from previous point to current
                const prevCanvasPx = wpd.graphicsWidget.imageToCanvasPx(
                    this._plist[(this._pointsCaptured - 2) * 2],
                    this._plist[(this._pointsCaptured - 2) * 2 + 1]);

                this._ctx.dataCtx.beginPath();
                this._ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                this._ctx.dataCtx.moveTo(prevCanvasPx.x, prevCanvasPx.y);
                this._ctx.dataCtx.lineTo(x, y);
                this._ctx.dataCtx.stroke();

                this._ctx.oriDataCtx.beginPath();
                this._ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                this._ctx.oriDataCtx.moveTo(this._plist[(this._pointsCaptured - 2) * 2],
                    this._plist[(this._pointsCaptured - 2) * 2 + 1]);
                this._ctx.oriDataCtx.lineTo(imagePos.x, imagePos.y);
                this._ctx.oriDataCtx.stroke();
            }

            // draw current point
            this._ctx.dataCtx.beginPath();
            this._ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
            this._ctx.dataCtx.arc(x, y, 3 * this._dpr, 0, 2.0 * Math.PI, true);
            this._ctx.dataCtx.fill();

            this._ctx.oriDataCtx.beginPath();
            this._ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
            this._ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0 * Math.PI, true);
            this._ctx.oriDataCtx.fill();
        }
        wpd.graphicsWidget.updateZoomOnEvent(ev);
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isCapturing && this._pointsCaptured >= 1) {
            wpd.graphicsWidget.resetHover();

            const px = this._plist[(this._pointsCaptured - 1) * 2];
            const py = this._plist[(this._pointsCaptured - 1) * 2 + 1];
            const prevCanvasPx = wpd.graphicsWidget.imageToCanvasPx(px, py);

            this._ctx.hoverCtx.beginPath();
            this._ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
            this._ctx.hoverCtx.lineWidth = this._dpr;
            this._ctx.hoverCtx.moveTo(prevCanvasPx.x, prevCanvasPx.y);
            const canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
            this._ctx.hoverCtx.lineTo(canvasPos.x, canvasPos.y);
            this._ctx.hoverCtx.stroke();
        }
    }
};

wpd.DeleteMeasurementTool = class {
    constructor(mode) {
        this._mode = mode;
    }

    onAttach() {
        document.getElementById(this._mode.deleteButtonId).classList.add('pressed-button');
    }

    onRemove() {
        document.getElementById(this._mode.deleteButtonId).classList.remove('pressed-button');
    }

    onKeyDown(ev) {
        // move the selected point or switch tools
        if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
            wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(this._mode));
            return;
        } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
            wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(this._mode));
            return;
        }
    }

    onMouseClick(ev, pos, imagePos) {
        this._mode.getData().deleteNearestConnection(imagePos.x, imagePos.y);
        wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(this._mode));
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.graphicsWidget.updateZoomOnEvent(ev);
    }
};

wpd.AdjustMeasurementTool = class {
    constructor(mode) {
        this._mode = mode;
        this._isDragging = false;
    }

    onAttach() {}

    onMouseDown(ev, pos, imagePos) {
        this._mode.getData().selectNearestPoint(imagePos.x, imagePos.y);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.graphicsWidget.updateZoomOnEvent(ev);
        const measurementData = this._mode.getData();
        const selectedPt = measurementData.getSelectedConnectionAndPoint();
        if (selectedPt.connectionIndex >= 0 && selectedPt.pointIndex >= 0) {
            this._isDragging = true;
        }
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isDragging) {
            const measurementData = this._mode.getData();
            const selectedPt = measurementData.getSelectedConnectionAndPoint();
            measurementData.setPointAt(selectedPt.connectionIndex, selectedPt.pointIndex, imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(imagePos.x, imagePos.y);
        }
    }

    onMouseUp(ev, pos, imagePos) {
        this._isDragging = false;
    }

    onMouseOut(ev, pos, imagePos) {
        this._isDragging = false;
    }

    onKeyDown(ev) {
        // move the selected point or switch tools
        if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
            wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(this._mode));
            return;
        } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
            wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(this._mode));
            return;
        }

        const measurementData = this._mode.getData();
        const selectedPt = measurementData.getSelectedConnectionAndPoint();

        if (selectedPt.connectionIndex >= 0 && selectedPt.pointIndex >= 0) {

            const stepSize = ev.shiftKey === true ? 5 / wpd.graphicsWidget.getZoomRatio() :
                0.5 / wpd.graphicsWidget.getZoomRatio();
            const pointPx = measurementData.getPointAt(selectedPt.connectionIndex,
                selectedPt.pointIndex);

            // rotate to current rotation
            const currentRotation = wpd.graphicsWidget.getRotation();
            let {
                x,
                y
            } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, pointPx.x, pointPx.y);

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

            measurementData.setPointAt(selectedPt.connectionIndex, selectedPt.pointIndex, x, y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(x, y);
            ev.preventDefault();
            ev.stopPropagation();
        }
    }
};

wpd.MeasurementRepainter = class {
    constructor(mode) {
        this._mode = mode;
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._dpr = 1;
        this.painterName = 'measurementRepainter-' + mode.name;
    }

    onAttach() {
        this._dpr = window.devicePixelRatio;
    }

    onRedraw() {
        if (this._mode.name === wpd.measurementModes.distance.name) {
            this._drawDistances();
        } else if (this._mode.name === wpd.measurementModes.angle.name) {
            this._drawAngles();
        } else if (this._mode.name === wpd.measurementModes.area.name) {
            this._drawPolygons();
        }
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        this.onRedraw();
    }

    _drawLine(sx0, sy0, sx1, sy1, ix0, iy0, ix1, iy1) {
        this._ctx.dataCtx.beginPath();
        this._ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
        this._ctx.dataCtx.lineWidth = this._dpr;
        this._ctx.dataCtx.moveTo(sx0, sy0);
        this._ctx.dataCtx.lineTo(sx1, sy1);
        this._ctx.dataCtx.stroke();

        this._ctx.oriDataCtx.beginPath();
        this._ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
        this._ctx.oriDataCtx.moveTo(ix0, iy0);
        this._ctx.oriDataCtx.lineTo(ix1, iy1);
        this._ctx.oriDataCtx.stroke();
    }

    _drawPoint(sx, sy, ix, iy, isSelected) {
        this._ctx.dataCtx.beginPath();
        if (isSelected) {
            this._ctx.dataCtx.fillStyle = "rgb(0, 200, 0)";
        } else {
            this._ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
        }
        this._ctx.dataCtx.arc(sx, sy, 3 * this._dpr, 0, 2.0 * Math.PI, true);
        this._ctx.dataCtx.fill();

        this._ctx.oriDataCtx.beginPath();
        if (isSelected) {
            this._ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
        } else {
            this._ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
        }
        this._ctx.oriDataCtx.arc(ix, iy, 3, 0, 2.0 * Math.PI, true);
        this._ctx.oriDataCtx.fill();
    }

    _drawArc(sx, sy, ix, iy, theta1, theta2) {
        this._ctx.dataCtx.beginPath();
        this._ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
        this._ctx.dataCtx.arc(sx, sy, 15 * this._dpr, theta1, theta2, true);
        this._ctx.dataCtx.stroke();

        this._ctx.oriDataCtx.beginPath();
        this._ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
        this._ctx.oriDataCtx.arc(ix, iy, 15, theta1, theta2, true);
        this._ctx.oriDataCtx.stroke();
    }

    _drawLabel(sx, sy, ix, iy, lab) {
        sx = parseInt(sx, 10);
        sy = parseInt(sy, 10);
        ix = parseInt(ix, 10);
        iy = parseInt(iy, 10);

        this._ctx.dataCtx.font = (this._dpr === 1) ? "14px sans-serif" : "32px sans-serif";
        let labelWidth = this._ctx.dataCtx.measureText(lab).width;
        this._ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this._ctx.dataCtx.fillRect(sx - 5 * this._dpr, sy - 15 * this._dpr,
            labelWidth + 10 * this._dpr, 25 * this._dpr);
        this._ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
        this._ctx.dataCtx.fillText(lab, sx, sy);

        this._ctx.oriDataCtx.font = "14px sans-serif";
        labelWidth = this._ctx.oriDataCtx.measureText(lab).width;
        this._ctx.oriDataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
        this._ctx.oriDataCtx.fillRect(ix - 5, iy - 15, labelWidth + 10, 25);
        this._ctx.oriDataCtx.fillStyle = "rgb(200, 0, 0)";
        this._ctx.oriDataCtx.fillText(lab, ix, iy);
    }

    _drawDistances() {
        const distData = this._mode.getData();
        const conn_count = distData.connectionCount();
        const axes = this._mode.getAxes();

        for (let conni = 0; conni < conn_count; conni++) {
            const plist = distData.getConnectionAt(conni);
            const x0 = plist[0];
            const y0 = plist[1];
            const x1 = plist[2];
            const y1 = plist[3];
            const isSelected0 = distData.isPointSelected(conni, 0);
            const isSelected1 = distData.isPointSelected(conni, 1);
            let dist;
            if (wpd.appData.isAligned() === true && axes instanceof wpd.MapAxes) {
                dist = 'Dist' + conni.toString() + ': ' +
                    axes.pixelToDataDistance(distData.getDistance(conni)).toFixed(2) +
                    ' ' + axes.getUnits();
            } else {
                dist = 'Dist' + conni.toString() + ': ' +
                    distData.getDistance(conni).toFixed(2) + ' px';
            }
            const spx0 = wpd.graphicsWidget.imageToCanvasPx(x0, y0);
            const spx1 = wpd.graphicsWidget.imageToCanvasPx(x1, y1);

            // draw connecting lines:
            this._drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);

            // draw data points:
            this._drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
            this._drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);

            // distance label
            this._drawLabel(0.5 * (spx0.x + spx1.x), 0.5 * (spx0.y + spx1.y),
                0.5 * (x0 + x1), 0.5 * (y0 + y1), dist);
        }
    }

    _drawAngles() {
        const angleData = this._mode.getData();
        const conn_count = angleData.connectionCount();

        for (let conni = 0; conni < conn_count; conni++) {
            const plist = angleData.getConnectionAt(conni);
            const x0 = plist[0];
            const y0 = plist[1];
            const x1 = plist[2];
            const y1 = plist[3];
            const x2 = plist[4];
            const y2 = plist[5];
            const isSelected0 = angleData.isPointSelected(conni, 0);
            const isSelected1 = angleData.isPointSelected(conni, 1);
            const isSelected2 = angleData.isPointSelected(conni, 2);
            const theta = 'Theta' + conni.toString() + ': ' +
                angleData.getAngle(conni).toFixed(2) + '°';
            const theta1 = Math.atan2((y0 - y1), x0 - x1);
            const theta2 = Math.atan2((y2 - y1), x2 - x1);
            const spx0 = wpd.graphicsWidget.imageToCanvasPx(x0, y0);
            const spx1 = wpd.graphicsWidget.imageToCanvasPx(x1, y1);
            const spx2 = wpd.graphicsWidget.imageToCanvasPx(x2, y2);

            // draw connecting lines:
            this._drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);
            this._drawLine(spx1.x, spx1.y, spx2.x, spx2.y, x1, y1, x2, y2);

            // draw data points:
            this._drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
            this._drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);
            this._drawPoint(spx2.x, spx2.y, x2, y2, isSelected2);

            // draw angle arc:
            this._drawArc(spx1.x, spx1.y, x1, y1, theta1, theta2);

            // angle label
            this._drawLabel(spx1.x + 10, spx1.y + 15, x1 + 10, y1 + 15, theta);
        }
    }

    _drawPolygons() {
        const connData = this._mode.getData();
        const connCount = connData.connectionCount();
        const axes = this._mode.getAxes();

        for (let connIdx = 0; connIdx < connCount; connIdx++) {
            const conn = connData.getConnectionAt(connIdx);
            let labelx = 0.0;
            let labely = 0.0;

            let px_prev = 0;
            let py_prev = 0;
            let spx_prev = { x: 0, y: 0 };

            for (let pi = 0; pi < conn.length; pi += 2) {
                const px = conn[pi];
                const py = conn[pi + 1];
                const spx = wpd.graphicsWidget.imageToCanvasPx(px, py);

                if (pi >= 2) {
                    this._drawLine(spx_prev.x, spx_prev.y, spx.x, spx.y,
                        px_prev, py_prev, px, py);
                }

                if (pi == conn.length - 2) {
                    const px0 = conn[0];
                    const py0 = conn[1];
                    const spx0 = wpd.graphicsWidget.imageToCanvasPx(px0, py0);
                    this._drawLine(spx0.x, spx0.y, spx.x, spx.y, px0, py0, px, py);
                }

                px_prev = px;
                py_prev = py;
                spx_prev = spx;
            }

            for (let pi = 0; pi < conn.length; pi += 2) {
                const px = conn[pi];
                const py = conn[pi + 1];
                const spx = wpd.graphicsWidget.imageToCanvasPx(px, py);
                const isSelected = connData.isPointSelected(connIdx, pi / 2);
                this._drawPoint(spx.x, spx.y, px, py, isSelected);
                labelx += px;
                labely += py;
            }
            labelx /= conn.length / 2;
            labely /= conn.length / 2;
            const labelspx = wpd.graphicsWidget.imageToCanvasPx(labelx, labely);
            let areaStr = "";
            let periStr = "";
            if (wpd.appData.isAligned() === true && axes instanceof wpd.MapAxes) {
                areaStr = "Area" + connIdx + ": " +
                    axes.pixelToDataArea(connData.getArea(connIdx)).toFixed(2) + ' ' +
                    axes.getUnits() + '^2';
                periStr =
                    "Perimeter" + connIdx + ": " +
                    axes.pixelToDataDistance(connData.getPerimeter(connIdx)).toFixed(2) +
                    ' ' + axes.getUnits();
            } else {
                areaStr = "Area" + connIdx + ": " + connData.getArea(connIdx).toFixed(2) +
                    ' px^2';
                periStr = "Perimeter" + connIdx + ": " +
                    connData.getPerimeter(connIdx).toFixed(2) + ' px';
            }
            const label = areaStr + ", " + periStr;
            this._drawLabel(labelspx.x, labelspx.y, labelx, labely, label);
        }
    }
};
