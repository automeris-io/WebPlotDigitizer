/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.acquireData = (function () {
    function load() {
        if(!wpd.appData.isAligned()) {
            wpd.messagePopup.show("Acquire Data", "Please calibrate the axes before acquiring data.");
        } else {
            showSidebar();
            wpd.dataPointCounter.setCount();
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());

            manualSelection();
        }
    }

    function manualSelection() {
        var tool = new wpd.ManualSelectionTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function deletePoint() {
        var tool = new wpd.DeleteDataPointTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function confirmedClearAll() {
        wpd.appData.getPlotData().getActiveDataSeries().clearAll();
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount();
        wpd.graphicsWidget.removeRepainter();
    }

    function clearAll() {
        if(wpd.appData.getPlotData().getActiveDataSeries().getCount() <= 0) {
            return;
        }
        wpd.okCancelPopup.show("Clear data points?", "This will delete all data points from this dataset", confirmedClearAll, function() {});
    }

    function undo() {
        wpd.appData.getPlotData().getActiveDataSeries().removeLastPixel();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
 
    function showSidebar() {
        wpd.sidebar.show('acquireDataSidebar');
        updateDatasetControl();
        updateControlVisibility();
        wpd.dataPointCounter.setCount();
    }

    function updateControlVisibility() {
        var axes = wpd.appData.getPlotData().axes,
            $editLabelsBtn = document.getElementById('edit-data-labels');
        if(axes instanceof wpd.BarAxes) {
            $editLabelsBtn.style.display = 'inline-block';
        } else {
            $editLabelsBtn.style.display = 'none';
        }
    }

    function updateDatasetControl() {
        var plotData = wpd.appData.getPlotData(),
            currentDataset = plotData.getActiveDataSeries(), // just to create a dataset if there is none.
            currentIndex = plotData.getActiveDataSeriesIndex(),
            $datasetList = document.getElementById('manual-sidebar-dataset-list'),
            listHTML = '',
            i;
        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            listHTML += '<option>'+plotData.dataSeriesColl[i].name+'</option>';
        }
        $datasetList.innerHTML = listHTML;
        $datasetList.selectedIndex = currentIndex;
    }

    function changeDataset($datasetList) {
        var index = $datasetList.selectedIndex;
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }

    function adjustPoints() {
        wpd.graphicsWidget.setTool(new wpd.AdjustDataPointTool());
    }

    function editLabels() {
        wpd.graphicsWidget.setTool(new wpd.EditLabelsTool());
    }

    function switchToolOnKeyPress(alphaKey) {
        switch(alphaKey) {
            case 'd': 
                deletePoint();
                break;
            case 'a': 
                manualSelection();
                break;
            case 's': 
                adjustPoints();
                break;
            case 'e':
                editLabels();
                break;
            default: 
                break;
        }
    }

    function isToolSwitchKey(keyCode) {
        if(wpd.keyCodes.isAlphabet(keyCode, 'a')
            || wpd.keyCodes.isAlphabet(keyCode, 's')
            || wpd.keyCodes.isAlphabet(keyCode, 'd')
            || wpd.keyCodes.isAlphabet(keyCode, 'e')) {
            return true;
        }
        return false;
    }

    return {
        load: load,
        manualSelection: manualSelection,
        adjustPoints: adjustPoints,
        deletePoint: deletePoint,
        clearAll: clearAll,
        undo: undo,
        showSidebar: showSidebar,
        switchToolOnKeyPress: switchToolOnKeyPress,
        isToolSwitchKey: isToolSwitchKey,
        updateDatasetControl: updateDatasetControl,
        changeDataset: changeDataset,
        editLabels: editLabels
    };
})();

wpd.dataPointLabelEditor = (function() {

    var ds, ptIndex, tool;
    
    function show(dataSeries, pointIndex, initTool) {
        var pixel = dataSeries.getPixel(pointIndex),
            originalLabel = pixel.metadata[0],
            $labelField;
        
        ds = dataSeries;
        ptIndex = pointIndex;
        tool = initTool;

        wpd.graphicsWidget.removeTool();

        // show popup window with originalLabel in the input field.
        wpd.popup.show('data-point-label-editor');
        $labelField = document.getElementById('data-point-label-field');
        $labelField.value = originalLabel;
        $labelField.focus();
    }

    function ok() {
        var newLabel = document.getElementById('data-point-label-field').value;

        if(newLabel != null && newLabel.length > 0) {
            // set label 
            ds.setMetadataAt(ptIndex, [newLabel]);
            // refresh graphics
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
        }

        wpd.popup.close('data-point-label-editor');
        wpd.graphicsWidget.setTool(tool);
    }

    function cancel() {
        // just close the popup
        wpd.popup.close('data-point-label-editor');
        wpd.graphicsWidget.setTool(tool);
    }

    function keydown(ev) {
        if(wpd.keyCodes.isEnter(ev.keyCode)) {
            ok();
        } else if(wpd.keyCodes.isEsc(ev.keyCode)) {
            cancel();
        }
        ev.stopPropagation();
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel,
        keydown: keydown
    };
})();

wpd.ManualSelectionTool = (function () {
    var Tool = function () {
        var plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            document.getElementById('manual-select-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        };

       
        this.onMouseClick = function (ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries(),
                pointLabel,
                mkeys;
            
            if(plotData.axes.dataPointsHaveLabels) { // e.g. Bar charts

                // This isn't the cleanest approach, but should do for now:
                mkeys = activeDataSeries.getMetadataKeys();
                if(mkeys == null || mkeys[0] !== 'Label') {
                    activeDataSeries.setMetadataKeys(['Label']);
                }
                pointLabel = plotData.axes.dataPointsLabelPrefix + activeDataSeries.getCount();
                activeDataSeries.addPixel(imagePos.x, imagePos.y, [pointLabel]);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)", pointLabel);

            } else {

                activeDataSeries.addPixel(imagePos.x, imagePos.y);
                wpd.graphicsHelper.drawPoint(imagePos, "rgb(200,0,0)");

            }

            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();

            // If shiftkey was pressed while clicking on a point that has a label (e.g. bar charts),
            // then show a popup to edit the label
            if(plotData.axes.dataPointsHaveLabels && ev.shiftKey) {
                wpd.dataPointLabelEditor.show(activeDataSeries, activeDataSeries.getCount() - 1, this);
            }
        };

        this.onRemove = function () {
            document.getElementById('manual-select-button').classList.remove('pressed-button');
        };

        this.onKeyDown = function (ev) {
            var activeDataSeries = plotData.getActiveDataSeries(),
                lastPtIndex = activeDataSeries.getCount() - 1,
                lastPt = activeDataSeries.getPixel(lastPtIndex),
                stepSize = 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                lastPt.y = lastPt.y - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                lastPt.y = lastPt.y + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                lastPt.x = lastPt.x - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                lastPt.x = lastPt.x + stepSize;
            } else if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            } else {
                return;
            }

            activeDataSeries.setPixelAt(lastPtIndex, lastPt.x, lastPt.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(lastPt.x, lastPt.y);
            ev.preventDefault();
        };
    };
    return Tool;
})();


wpd.DeleteDataPointTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            document.getElementById('delete-point-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries();
            activeDataSeries.removeNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();
        };

        this.onKeyDown = function (ev) {
            if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
            }
        };

        this.onRemove = function () {
            document.getElementById('delete-point-button').classList.remove('pressed-button');
        };
    };
    return Tool;
})();


wpd.DataPointsRepainter = (function () {
    var Painter = function () {

        var drawPoints = function () {
            var plotData = wpd.appData.getPlotData(),
                activeDataSeries = plotData.getActiveDataSeries(),
                dindex,
                imagePos,
                fillStyle,
                isSelected,
                mkeys = activeDataSeries.getMetadataKeys(),
                hasLabels = false,
                pointLabel;

            if(plotData.axes.dataPointsHaveLabels && mkeys != null && mkeys[0] === 'Label') {
                hasLabels = true;
            }

            for(dindex = 0; dindex < activeDataSeries.getCount(); dindex++) {
                imagePos = activeDataSeries.getPixel(dindex);
                isSelected = activeDataSeries.getSelectedPixels().indexOf(dindex) >= 0;

                if(isSelected) {
                    fillStyle = "rgb(0,200,0)";
                } else {
                    fillStyle = "rgb(200,0,0)";
                }

                if (hasLabels) {
                    pointLabel = imagePos.metadata[0];
                    if(pointLabel == null) {
                        pointLabel = plotData.axes.dataPointsLabelPrefix + dindex;
                    }
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle, pointLabel);
                } else {
                    wpd.graphicsHelper.drawPoint(imagePos, fillStyle);
                }
            }
        };
        
        this.painterName = 'dataPointsRepainter';

        this.onAttach = function () {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };

        this.onRedraw = function () {
            drawPoints();
        };

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
            drawPoints();
        };
    };
    return Painter;
})();


wpd.AdjustDataPointTool = (function () {
    var Tool = function () {

        this.onAttach = function () {
            document.getElementById('manual-adjust-button').classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
            wpd.toolbar.show('adjustDataPointsToolbar');
        }; 
        
        this.onRemove = function () {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            wpd.graphicsWidget.forceHandlerRepaint();
            document.getElementById('manual-adjust-button').classList.remove('pressed-button');
            wpd.toolbar.clear();
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            var dataSeries = wpd.appData.getPlotData().getActiveDataSeries();
            dataSeries.unselectAll();
            dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onKeyDown = function (ev) {

            if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
                wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
                return;
            }

            var activeDataSeries = wpd.appData.getPlotData().getActiveDataSeries(),
                selIndex = activeDataSeries.getSelectedPixels()[0];

            if(selIndex == null) { return; }

            var selPoint = activeDataSeries.getPixel(selIndex),
                pointPx = selPoint.x,
                pointPy = selPoint.y,
                stepSize = ev.shiftKey === true ? 5/wpd.graphicsWidget.getZoomRatio() : 0.5/wpd.graphicsWidget.getZoomRatio();

            if(wpd.keyCodes.isUp(ev.keyCode)) {
                pointPy = pointPy - stepSize;
            } else if(wpd.keyCodes.isDown(ev.keyCode)) {
                pointPy = pointPy + stepSize;
            } else if(wpd.keyCodes.isLeft(ev.keyCode)) {
                pointPx = pointPx - stepSize;
            } else if(wpd.keyCodes.isRight(ev.keyCode)) {
                pointPx = pointPx + stepSize;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'q')) {
                activeDataSeries.selectPreviousPixel();
                selIndex = activeDataSeries.getSelectedPixels()[0];
                selPoint = activeDataSeries.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'w')) {
                activeDataSeries.selectNextPixel();
                selIndex = activeDataSeries.getSelectedPixels()[0];
                selPoint = activeDataSeries.getPixel(selIndex);
                pointPx = selPoint.x;
                pointPy = selPoint.y;
            } else if(wpd.keyCodes.isAlphabet(ev.keyCode, 'e')) {
                if(wpd.appData.getPlotData().axes.dataPointsHaveLabels) {
                    selIndex = activeDataSeries.getSelectedPixels()[0];
                    ev.preventDefault();
                    ev.stopPropagation();
                    wpd.dataPointLabelEditor.show(activeDataSeries, selIndex, this);
                    return;
                }
            } else if(wpd.keyCodes.isDel(ev.keyCode) || wpd.keyCodes.isBackspace(ev.keyCode)) {
                activeDataSeries.removePixelAtIndex(selIndex);
                activeDataSeries.unselectAll();
                if(activeDataSeries.findNearestPixel(pointPx, pointPy) >= 0) {
                    activeDataSeries.selectNearestPixel(pointPx, pointPy);
                    selIndex = activeDataSeries.getSelectedPixels()[0];
                    selPoint = activeDataSeries.getPixel(selIndex);
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
            
            activeDataSeries.setPixelAt(selIndex, pointPx, pointPy);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
            ev.preventDefault();
            ev.stopPropagation(); 
        };
    };
    return Tool;
})();

wpd.EditLabelsTool = function() {

    this.onAttach = function () {
        document.getElementById('edit-data-labels').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter());
    };

    this.onRemove = function () {
        document.getElementById('edit-data-labels').classList.remove('pressed-button');
        wpd.appData.getPlotData().getActiveDataSeries().unselectAll();
    };

    this.onMouseClick = function (ev, pos, imagePos) {
        var dataSeries = wpd.appData.getPlotData().getActiveDataSeries(),
            pixelIndex;
        dataSeries.unselectAll();
        pixelIndex = dataSeries.selectNearestPixel(imagePos.x, imagePos.y);
        if(pixelIndex >= 0) { 
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointLabelEditor.show(dataSeries, pixelIndex, this);
        }
    };

    this.onKeyDown = function (ev) {
        if(wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
        }
    };
};

wpd.dataPointCounter = (function () {
    function setCount() {
        var $counters = document.getElementsByClassName('data-point-counter'),
            ci;
        for(ci = 0; ci < $counters.length; ci++) {
            $counters[ci].innerHTML = wpd.appData.getPlotData().getActiveDataSeries().getCount();
        }
    }

    return {
        setCount: setCount
    };
})();

