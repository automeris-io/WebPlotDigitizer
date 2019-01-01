/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.AxesCornersTool = (function() {
    var Tool = function(calibration, reloadTool) {
        var pointCount = 0,
            _calibration = calibration,
            isCapturingCorners = true;

        if (reloadTool) {
            pointCount = _calibration.maxPointCount;
            isCapturingCorners = false;
        } else {
            pointCount = 0;
            isCapturingCorners = true;
            wpd.graphicsWidget.resetData();
        }

        this.onMouseClick = function(ev, pos, imagePos) {
            if (isCapturingCorners) {
                pointCount = pointCount + 1;

                _calibration.addPoint(imagePos.x, imagePos.y, 0, 0);
                _calibration.unselectAll();
                _calibration.selectPoint(pointCount - 1);
                wpd.graphicsWidget.forceHandlerRepaint();

                if (pointCount === _calibration.maxPointCount) {
                    isCapturingCorners = false;
                    wpd.alignAxes.calibrationCompleted();
                }

                wpd.graphicsWidget.updateZoomOnEvent(ev);
            } else {
                _calibration.unselectAll();
                // cal.selectNearestPoint(imagePos.x,
                // imagePos.y, 15.0/wpd.graphicsWidget.getZoomRatio());
                _calibration.selectNearestPoint(imagePos.x, imagePos.y);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomOnEvent(ev);
            }
        };

        this.onKeyDown = function(ev) {
            if (_calibration.getSelectedPoints().length === 0) {
                return;
            }

            var selPoint = _calibration.getPoint(_calibration.getSelectedPoints()[0]),
                pointPx = selPoint.px,
                pointPy = selPoint.py,
                stepSize = ev.shiftKey === true ? 5 / wpd.graphicsWidget.getZoomRatio() :
                0.5 / wpd.graphicsWidget.getZoomRatio();

            if (wpd.keyCodes.isUp(ev.keyCode)) {
                pointPy = pointPy - stepSize;
            } else if (wpd.keyCodes.isDown(ev.keyCode)) {
                pointPy = pointPy + stepSize;
            } else if (wpd.keyCodes.isLeft(ev.keyCode)) {
                pointPx = pointPx - stepSize;
            } else if (wpd.keyCodes.isRight(ev.keyCode)) {
                pointPx = pointPx + stepSize;
            } else {
                return;
            }

            _calibration.changePointPx(_calibration.getSelectedPoints()[0], pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation();
        };
    };

    return Tool;
})();

wpd.AlignmentCornersRepainter = (function() {
    var Tool = function(calibration) {
        var _calibration = calibration;

        this.painterName = 'AlignmentCornersReptainer';

        this.onForcedRedraw = function() {
            wpd.graphicsWidget.resetData();
            this.onRedraw();
        };

        this.onRedraw = function() {
            if (_calibration == null) {
                return;
            }

            var i, imagePos, imagePx, fillStyle;

            for (i = 0; i < _calibration.getCount(); i++) {
                imagePos = _calibration.getPoint(i);
                imagePx = {
                    x: imagePos.px,
                    y: imagePos.py
                };

                if (_calibration.isPointSelected(i)) {
                    fillStyle = "rgba(0,200,0,1)";
                } else {
                    fillStyle = "rgba(200,0,0,1)";
                }

                wpd.graphicsHelper.drawPoint(imagePx, fillStyle, _calibration.labels[i],
                    _calibration.labelPositions[i]);
            }
        };
    };
    return Tool;
})();