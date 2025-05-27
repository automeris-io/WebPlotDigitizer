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

wpd.AddMeasurementTool = (function() {
    var Tool = function(mode) {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            pointsCaptured = 0,
            isCapturing = true,
            plist = [],
            dpr = 1;

        this.onAttach = function() {
            document.getElementById(mode.addButtonId).classList.add('pressed-button');
            if (mode.connectivity < 0) { // area/perimeter
                document.getElementById("add-polygon-info").style.display = "block";
            }
            dpr = window.devicePixelRatio;
        };

        this.onRemove = function() {
            document.getElementById(mode.addButtonId).classList.remove('pressed-button');
            if (mode.connectivity < 0) { // area/perimeter
                document.getElementById("add-polygon-info").style.display = "none";
            }
        };

        this.onKeyDown = function(ev) {
            // move the selected point or switch tools
            if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            } else if ((wpd.keyCodes.isEnter(ev.keyCode) || wpd.keyCodes.isEsc(ev.keyCode)) &&
                isCapturing === true && mode.connectivity < 0) {
                isCapturing = false;
                mode.getData().addConnection(plist);
                wpd.graphicsWidget.resetHover();
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
                return;
            }
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            if (isCapturing) {

                wpd.graphicsWidget.resetHover();

                plist[pointsCaptured * 2] = imagePos.x;
                plist[pointsCaptured * 2 + 1] = imagePos.y;
                pointsCaptured = pointsCaptured + 1;

                // get new pos by translating imagePos
                const {
                    x,
                    y
                } = wpd.graphicsWidget.imageToCanvasPx(imagePos.x, imagePos.y);

                if (pointsCaptured === mode.connectivity) {
                    isCapturing = false;
                    mode.getData().addConnection(plist);
                    wpd.graphicsWidget.resetHover();
                    wpd.graphicsWidget.forceHandlerRepaint();
                    mode.getData().selectNearestPoint(imagePos.x, imagePos.y);
                    wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
                    return;
                }

                if (pointsCaptured > 1) {
                    // draw line from previous point to current
                    var prevCanvasPx = wpd.graphicsWidget.imageToCanvasPx(
                        plist[(pointsCaptured - 2) * 2], plist[(pointsCaptured - 2) * 2 + 1]);

                    ctx.dataCtx.beginPath();
                    ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                    ctx.dataCtx.moveTo(prevCanvasPx.x, prevCanvasPx.y);
                    ctx.dataCtx.lineTo(x, y);
                    ctx.dataCtx.stroke();

                    ctx.oriDataCtx.beginPath();
                    ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                    ctx.oriDataCtx.moveTo(plist[(pointsCaptured - 2) * 2],
                        plist[(pointsCaptured - 2) * 2 + 1]);
                    ctx.oriDataCtx.lineTo(imagePos.x, imagePos.y);
                    ctx.oriDataCtx.stroke();
                }

                // draw current point
                ctx.dataCtx.beginPath();
                ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.dataCtx.arc(x, y, 3 * dpr, 0, 2.0 * Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
                ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0 * Math.PI, true);
                ctx.oriDataCtx.fill();
            }
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isCapturing && pointsCaptured >= 1) {
                wpd.graphicsWidget.resetHover();

                // need to rotate the values to the current rotation before translating to canvasPx
                const currentRotation = wpd.graphicsWidget.getRotation();
                const px = plist[(pointsCaptured - 1) * 2];
                const py = plist[(pointsCaptured - 1) * 2 + 1];
                var prevCanvasPx = wpd.graphicsWidget.imageToCanvasPx(px, py);

                ctx.hoverCtx.beginPath();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                ctx.hoverCtx.lineWidth = dpr;
                ctx.hoverCtx.moveTo(prevCanvasPx.x, prevCanvasPx.y);
                let canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
                ctx.hoverCtx.lineTo(canvasPos.x, canvasPos.y);
                ctx.hoverCtx.stroke();
            }
        };
    };
    return Tool;
})();

wpd.DeleteMeasurementTool = (function() {
    var Tool = function(mode) {
        var ctx = wpd.graphicsWidget.getAllContexts();

        this.onAttach = function() {
            document.getElementById(mode.deleteButtonId).classList.add('pressed-button');
        };

        this.onRemove = function() {
            document.getElementById(mode.deleteButtonId).classList.remove('pressed-button');
        };

        this.onKeyDown = function(ev) {
            // move the selected point or switch tools
            if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            }
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            mode.getData().deleteNearestConnection(imagePos.x, imagePos.y);
            wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };
    };
    return Tool;
})();

wpd.AdjustMeasurementTool = (function() {
    var Tool = function(mode) {

        let isDragging = false;

        this.onAttach = function() {};

        this.onMouseDown = function(ev, pos, imagePos) {
            mode.getData().selectNearestPoint(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            const measurementData = mode.getData();
            const selectedPt = measurementData.getSelectedConnectionAndPoint();
            if (selectedPt.connectionIndex >= 0 && selectedPt.pointIndex >= 0) {
                isDragging = true;
            }

        }

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isDragging) {
                const measurementData = mode.getData();
                const selectedPt = measurementData.getSelectedConnectionAndPoint();
                measurementData.setPointAt(selectedPt.connectionIndex, selectedPt.pointIndex, imagePos.x, imagePos.y);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomToImagePosn(imagePos.x, imagePos.y);
            }
        }

        this.onMouseUp = function(ev, pos, imagePos) {
            isDragging = false;
        }

        this.onMouseOut = function(ev, pos, imagePos) {
            isDragging = false;
        }

        this.onKeyDown = function(ev) {
            // move the selected point or switch tools
            if (wpd.keyCodes.isAlphabet(ev.keyCode, 'a')) {
                wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
                return;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'd')) {
                wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(mode));
                return;
            }

            var measurementData = mode.getData(),
                selectedPt = measurementData.getSelectedConnectionAndPoint();

            if (selectedPt.connectionIndex >= 0 && selectedPt.pointIndex >= 0) {

                var stepSize = ev.shiftKey === true ? 5 / wpd.graphicsWidget.getZoomRatio() :
                    0.5 / wpd.graphicsWidget.getZoomRatio(),
                    pointPx = measurementData.getPointAt(selectedPt.connectionIndex,
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
        };
    };
    return Tool;
})();

wpd.MeasurementRepainter = (function() {
    var Painter = function(mode) {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            dpr = 1,
            drawLine =
            function(sx0, sy0, sx1, sy1, ix0, iy0, ix1, iy1) {
                ctx.dataCtx.beginPath();
                ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.dataCtx.lineWidth = dpr;
                ctx.dataCtx.moveTo(sx0, sy0);
                ctx.dataCtx.lineTo(sx1, sy1);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.beginPath();
                ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.oriDataCtx.moveTo(ix0, iy0);
                ctx.oriDataCtx.lineTo(ix1, iy1);
                ctx.oriDataCtx.stroke();
            },

            drawPoint =
            function(sx, sy, ix, iy, isSelected) {
                ctx.dataCtx.beginPath();
                if (isSelected) {
                    ctx.dataCtx.fillStyle = "rgb(0, 200, 0)";
                } else {
                    ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                }
                ctx.dataCtx.arc(sx, sy, 3 * dpr, 0, 2.0 * Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
                if (isSelected) {
                    ctx.oriDataCtx.fillStyle = "rgb(0,200,0)";
                } else {
                    ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
                }
                ctx.oriDataCtx.arc(ix, iy, 3, 0, 2.0 * Math.PI, true);
                ctx.oriDataCtx.fill();
            },

            drawArc =
            function(sx, sy, ix, iy, theta1, theta2) {
                ctx.dataCtx.beginPath();
                ctx.dataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.dataCtx.arc(sx, sy, 15 * dpr, theta1, theta2, true);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.beginPath();
                ctx.oriDataCtx.strokeStyle = "rgb(0,0,10)";
                ctx.oriDataCtx.arc(ix, iy, 15, theta1, theta2, true);
                ctx.oriDataCtx.stroke();
            },

            drawLabel =
            function(sx, sy, ix, iy, lab) {
                var labelWidth;

                sx = parseInt(sx, 10);
                sy = parseInt(sy, 10);
                ix = parseInt(ix, 10);
                iy = parseInt(iy, 10);

                ctx.dataCtx.font = (dpr === 1) ? "14px sans-serif" : "32px sans-serif";
                labelWidth = ctx.dataCtx.measureText(lab).width;
                ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.dataCtx.fillRect(sx - 5 * dpr, sy - 15 * dpr, labelWidth + 10 * dpr, 25 * dpr);
                ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.dataCtx.fillText(lab, sx, sy);

                ctx.oriDataCtx.font = "14px sans-serif";
                labelWidth = ctx.oriDataCtx.measureText(lab).width;
                ctx.oriDataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.oriDataCtx.fillRect(ix - 5, iy - 15, labelWidth + 10, 25);
                ctx.oriDataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.oriDataCtx.fillText(lab, ix, iy);
            },

            drawDistances =
            function() {
                var distData = mode.getData(),
                    conn_count = distData.connectionCount(),
                    conni,
                    plist, x0, y0, x1, y1, spx0, spx1, dist, isSelected0, isSelected1,
                    axes = mode.getAxes();

                for (conni = 0; conni < conn_count; conni++) {
                    plist = distData.getConnectionAt(conni);
                    x0 = plist[0];
                    y0 = plist[1];
                    x1 = plist[2];
                    y1 = plist[3];
                    isSelected0 = distData.isPointSelected(conni, 0);
                    isSelected1 = distData.isPointSelected(conni, 1);
                    if (wpd.appData.isAligned() === true && axes instanceof wpd.MapAxes) {
                        dist = 'Dist' + conni.toString() + ': ' +
                            axes.pixelToDataDistance(distData.getDistance(conni)).toFixed(2) +
                            ' ' + axes.getUnits();
                    } else {
                        dist = 'Dist' + conni.toString() + ': ' +
                            distData.getDistance(conni).toFixed(2) + ' px';
                    }
                    spx0 = wpd.graphicsWidget.imageToCanvasPx(x0, y0);
                    spx1 = wpd.graphicsWidget.imageToCanvasPx(x1, y1);

                    // draw connecting lines:
                    drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);

                    // draw data points:
                    drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
                    drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);

                    // distance label
                    drawLabel(0.5 * (spx0.x + spx1.x), 0.5 * (spx0.y + spx1.y), 0.5 * (x0 + x1),
                        0.5 * (y0 + y1), dist);
                }
            },

            drawAngles =
            function() {
                var angleData = mode.getData(),
                    conn_count = angleData.connectionCount(),
                    conni,
                    plist, x0, y0, x1, y1, x2, y2, spx0, spx1, spx2, theta1, theta2, theta,
                    isSelected0, isSelected1, isSelected2;
                for (conni = 0; conni < conn_count; conni++) {
                    plist = angleData.getConnectionAt(conni);
                    x0 = plist[0];
                    y0 = plist[1];
                    x1 = plist[2];
                    y1 = plist[3];
                    x2 = plist[4];
                    y2 = plist[5];
                    isSelected0 = angleData.isPointSelected(conni, 0);
                    isSelected1 = angleData.isPointSelected(conni, 1);
                    isSelected2 = angleData.isPointSelected(conni, 2);
                    theta = 'Theta' + conni.toString() + ': ' +
                        angleData.getAngle(conni).toFixed(2) + '°';
                    theta1 = Math.atan2((y0 - y1), x0 - x1);
                    theta2 = Math.atan2((y2 - y1), x2 - x1);
                    spx0 = wpd.graphicsWidget.imageToCanvasPx(x0, y0);
                    spx1 = wpd.graphicsWidget.imageToCanvasPx(x1, y1);
                    spx2 = wpd.graphicsWidget.imageToCanvasPx(x2, y2);

                    // draw connecting lines:
                    drawLine(spx0.x, spx0.y, spx1.x, spx1.y, x0, y0, x1, y1);
                    drawLine(spx1.x, spx1.y, spx2.x, spx2.y, x1, y1, x2, y2);

                    // draw data points:
                    drawPoint(spx0.x, spx0.y, x0, y0, isSelected0);
                    drawPoint(spx1.x, spx1.y, x1, y1, isSelected1);
                    drawPoint(spx2.x, spx2.y, x2, y2, isSelected2);

                    // draw angle arc:
                    drawArc(spx1.x, spx1.y, x1, y1, theta1, theta2);

                    // angle label
                    drawLabel(spx1.x + 10, spx1.y + 15, x1 + 10, y1 + 15, theta);
                }
            },

            drawPolygons = function() {
                let connData = mode.getData();
                let connCount = connData.connectionCount();
                let axes = mode.getAxes();
                for (let connIdx = 0; connIdx < connCount; connIdx++) {
                    let conn = connData.getConnectionAt(connIdx);
                    let labelx = 0.0,
                        labely = 0.0;

                    let px_prev = 0,
                        py_prev = 0,
                        spx_prev = {
                            x: 0,
                            y: 0
                        };
                    for (let pi = 0; pi < conn.length; pi += 2) {
                        let px = conn[pi];
                        let py = conn[pi + 1];
                        let spx = wpd.graphicsWidget.imageToCanvasPx(px, py);

                        if (pi >= 2) {
                            drawLine(spx_prev.x, spx_prev.y, spx.x, spx.y, px_prev, py_prev, px,
                                py);
                        }

                        if (pi == conn.length - 2) {
                            let px0 = conn[0];
                            let py0 = conn[1];
                            let spx0 = wpd.graphicsWidget.imageToCanvasPx(px0, py0);
                            drawLine(spx0.x, spx0.y, spx.x, spx.y, px0, py0, px, py);
                        }

                        px_prev = px;
                        py_prev = py;
                        spx_prev = spx;
                    }

                    for (let pi = 0; pi < conn.length; pi += 2) {
                        let px = conn[pi];
                        let py = conn[pi + 1];
                        let spx = wpd.graphicsWidget.imageToCanvasPx(px, py);
                        let isSelected = connData.isPointSelected(connIdx, pi / 2);
                        drawPoint(spx.x, spx.y, px, py, isSelected);
                        labelx += px;
                        labely += py;
                    }
                    labelx /= conn.length / 2;
                    labely /= conn.length / 2;
                    let labelspx = wpd.graphicsWidget.imageToCanvasPx(labelx, labely);
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
                    let label = areaStr + ", " + periStr;
                    drawLabel(labelspx.x, labelspx.y, labelx, labely, label);
                }
            };

        this.painterName = 'measurementRepainter-' + mode.name;

        this.onAttach = function() {
            dpr = window.devicePixelRatio;
        };

        this.onRedraw = function() {
            if (mode.name === wpd.measurementModes.distance.name) {
                drawDistances();
            } else if (mode.name === wpd.measurementModes.angle.name) {
                drawAngles();
            } else if (mode.name === wpd.measurementModes.area.name) {
                drawPolygons();
            }
        };

        this.onForcedRedraw = function() {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };
    };
    return Painter;
})();
