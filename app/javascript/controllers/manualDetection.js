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
wpd.acquireData = (function() {
    var dataset, axes;

    function load() {
        dataset = getActiveDataset();
        axes = getAxes();

        if (axes == null) {
            wpd.messagePopup.show(wpd.gettext('dataset-no-calibration'),
                wpd.gettext('calibrate-dataset'));
        } else {
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.resetData();
            showSidebar();
            wpd.autoExtraction.start();
            wpd.dataPointCounter.setCount();
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(axes, dataset));

            manualSelection();

            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.dataPointCounter.setCount(dataset.getCount());
        }
    }

    function getActiveDataset() {
        return wpd.tree.getActiveDataset();
    }

    function getAxes() {
        return wpd.appData.getPlotData().getAxesForDataset(getActiveDataset());
    }

    function manualSelection() {
        var tool = new wpd.ManualSelectionTool(axes, dataset);
        wpd.graphicsWidget.setTool(tool);
    }

    function deletePoint() {
        var tool = new wpd.DeleteDataPointTool(axes, dataset);
        wpd.graphicsWidget.setTool(tool);
    }

    function confirmedClearAll() {
        dataset.clearAll();
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount(dataset.getCount());
        wpd.graphicsWidget.removeRepainter();
    }

    function clearAll() {
        if (dataset.getCount() <= 0) {
            return;
        }
        wpd.okCancelPopup.show(wpd.gettext('clear-data-points'),
            wpd.gettext('clear-data-points-text'), confirmedClearAll,
            function() {});
    }

    function undo() {
        dataset.removeLastPixel();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount(dataset.getCount());
    }

    function showSidebar() {
        wpd.sidebar.show('acquireDataSidebar');
        updateControlVisibility();
        wpd.dataPointCounter.setCount(dataset.getCount());
    }

    function updateControlVisibility() {
        var $editLabelsBtn = document.getElementById('edit-data-labels');
        if (axes instanceof wpd.BarAxes) {
            $editLabelsBtn.style.display = 'inline-block';
        } else {
            $editLabelsBtn.style.display = 'none';
        }
    }

    function adjustPoints() {
        wpd.graphicsWidget.setTool(new wpd.AdjustDataPointTool(axes, dataset));
    }

    function editLabels() {
        wpd.graphicsWidget.setTool(new wpd.EditLabelsTool(axes, dataset));
    }

    function switchToolOnKeyPress(alphaKey) {
        switch (alphaKey) {
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
        if (wpd.keyCodes.isAlphabet(keyCode, 'a') || wpd.keyCodes.isAlphabet(keyCode, 's') ||
            wpd.keyCodes.isAlphabet(keyCode, 'd') || wpd.keyCodes.isAlphabet(keyCode, 'e')) {
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
        editLabels: editLabels
    };
})();

wpd.dataPointLabelEditor = (function() {
    var ds, ptIndex, tool;

    function show(dataset, pointIndex, initTool) {
        var pixel = dataset.getPixel(pointIndex),
            originalLabel = pixel.metadata[0],
            $labelField;

        ds = dataset;
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

        if (newLabel != null && newLabel.length > 0) {
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
        if (wpd.keyCodes.isEnter(ev.keyCode)) {
            ok();
        } else if (wpd.keyCodes.isEsc(ev.keyCode)) {
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