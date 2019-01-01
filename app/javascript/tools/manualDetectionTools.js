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

wpd.ManualSelectionTool = (function() {
    var Tool = function(axes, dataset) {
        this.onAttach = function() {
            document.getElementById('manual-select-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(axes, dataset));
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            var pointLabel, mkeys;

            if (axes.dataPointsHaveLabels) { // e.g. Bar charts

                // This isn't the cleanest approach, but should do for now:
                mkeys = dataset.getMetadataKeys();
                if (mkeys == null || mkeys[0] !== 'Label') {
                    dataset.setMetadataKeys(['Label']);
                }
                pointLabel = axes.dataPointsLabelPrefix + dataset.getCount();
                dataset.addPixel(imagePos.x, imagePos.y, [pointLabel]);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)", pointLabel);

            } else {

                dataset.addPixel(imagePos.x, imagePos.y);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)");
            }

            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount(dataset.getCount());

            // If shiftkey was pressed while clicking on a point that has a label (e.g. bar charts),
            // then show a popup to edit the label
            if (axes.dataPointsHaveLabels && ev.shiftKey) {
                wpd.dataPointLabelEditor.show(dataset, dataset.getCount() - 1, this);
            }
        };

        this.onRemove = function() {
            document.getElementById('manual-select-button').classList.remove('pressed-button');
        };

        this.onKeyDown = function(ev) {
            var lastPtIndex = dataset.getCount() - 1,
                lastPt = dataset.getPixel(lastPtIndex),
                stepSize = 0.5 / wpd.graphicsWidget.getZoomRatio();

            if (wpd.keyCodes.isUp(ev.keyCode)) {
                lastPt.y = lastPt.y - stepSize;
            } else if (wpd.keyCodes.isDown(ev.keyCode)) {
                lastPt.y = lastPt.y + stepSize;
            } else if (wpd.keyCodes.isLeft(ev.keyCode)) {
                lastPt.x = lastPt.x - stepSize;
            } else if (wpd.keyCodes.isRight(ev.keyCode)) {
                lastPt.x = lastPt.x + stepSize;
            } else if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            } else {
                return;
            }

            dataset.setPixelAt(lastPtIndex, lastPt.x, lastPt.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(lastPt.x, lastPt.y);
            ev.preventDefault();
        };
    };
    return Tool;
})();

wpd.DeleteDataPointTool = (function() {
    var Tool = function(axes, dataset) {
        var ctx = wpd.graphicsWidget.getAllContexts();

        this.onAttach = function() {
            document.getElementById('delete-point-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(axes, dataset));
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            dataset.removeNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount(dataset.getCount());
        };

        this.onKeyDown = function(ev) {
            if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
            }
        };

        this.onRemove = function() {
            document.getElementById('delete-point-button').classList.remove('pressed-button');
        };
    };
    return Tool;
})();

wpd.DataPointsRepainter = (function() {
    var Painter = function(axes, dataset) {
        var drawPoints = function() {
            var dindex, imagePos, fillStyle, isSelected, mkeys = dataset.getMetadataKeys(),
                hasLabels = false,
                pointLabel;

            if (axes == null) {
                return; // this can happen when removing widgets when a new file is loaded:
            }

            if (axes.dataPointsHaveLabels && mkeys != null && mkeys[0] === 'Label') {
                hasLabels = true;
            }

            for (dindex = 0; dindex < dataset.getCount(); dindex++) {
                imagePos = dataset.getPixel(dindex);
                isSelected = dataset.getSelectedPixels().indexOf(dindex) >= 0;

                if (isSelected) {
                    fillStyle = "rgb(0,200,0)";
                } else {
                    fillStyle = "rgb(200,0,0)";
                }

                if (hasLabels) {
                    pointLabel = imagePos.metadata[0];
                    if (pointLabel == null) {
                        pointLabel = axes.dataPointsLabelPrefix + dindex;
                    }
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle, pointLabel);
                } else {
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle);
                }
            }
        };

        this.painterName = 'dataPointsRepainter';

        this.onAttach = function() {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };

        this.onRedraw = function() {
            drawPoints();
        };

        this.onForcedRedraw = function() {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };
    };
    return Painter;
})();

wpd.AdjustDataPointTool = (function() {
    var Tool = function(axes, dataset) {
        this.onAttach = function() {
            document.getElementById('manual-adjust-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(axes, dataset));
            wpd.toolbar.show('adjustDataPointsToolbar');
        };

        this.onRemove = function() {
            dataset.unselectAll();
            wpd.graphicsWidget.forceHandlerRepaint();
            document.getElementById('manual-adjust-button').classList.remove('pressed-button');
            wpd.toolbar.clear();
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            dataset.unselectAll();
            dataset.selectNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onKeyDown = function(ev) {
            if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            }

            var selIndex = dataset.getSelectedPixels()[0];

            if (selIndex == null) {
                return;
            }

            var selPoint = dataset.getPixel(selIndex),
                pointPx = selPoint.x,
                pointPy = selPoint.y,
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
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'q')) {
                dataset.selectPreviousPixel();
                selIndex = dataset.getSelectedPixels()[0];
                selPoint = dataset.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'w')) {
                dataset.selectNextPixel();
                selIndex = dataset.getSelectedPixels()[0];
                selPoint = dataset.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'e')) {
                if (axes.dataPointsHaveLabels) {
                    selIndex = dataset.getSelectedPixels()[0];
                    ev.preventDefault();
                    ev.stopPropagation();
                    wpd.dataPointLabelEditor.show(dataset, selIndex, this);
                    return;
                }
            } else if (wpd.keyCodes.isDel(ev.keyCode) || wpd.keyCodes.isBackspace(ev.keyCode)) {
                dataset.removePixelAtIndex(selIndex);
                dataset.unselectAll();
                if (dataset.findNearestPixel(pointPx, pointPy) >= 0) {
                    dataset.selectNearestPixel(pointPx, pointPy);
                    selIndex = dataset.getSelectedPixels()[0];
                    selPoint = dataset.getPixel(selIndex);
                    pointPx = selPoint.x;
                    pointPy = selPoint.y;
                }
                wpd.graphicsWidget.resetData();
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
                wpd.dataPointCounter.setCount();
                ev.preventDefault();
                ev.stopPropagation();
                return;
            } else {
                return;
            }

            dataset.setPixelAt(selIndex, pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation();
        };
    };
    return Tool;
})();

wpd.EditLabelsTool = function(axes, dataset) {
    this.onAttach = function() {
        document.getElementById('edit-data-labels').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(axes, dataset));
    };

    this.onRemove = function() {
        document.getElementById('edit-data-labels').classList.remove('pressed-button');
        dataset.unselectAll();
    };

    this.onMouseClick = function(ev, pos, imagePos) {
        var dataSeries = dataset,
            pixelIndex;
        dataSeries.unselectAll();
        pixelIndex = dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
        if (pixelIndex >= 0) {
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointLabelEditor.show(dataSeries, pixelIndex, this);
        }
    };

    this.onKeyDown = function(ev) {
        if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
        }
    };
};

wpd.dataPointCounter = {
    setCount: function(count) {
        let $counters = document.getElementsByClassName('data-point-counter');
        for (let ci = 0; ci < $counters.length; ci++) {
            $counters[ci].innerHTML = count;
        }
    }
};