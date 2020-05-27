/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2020 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        // this should only trigger the tool if the axes type is bar
        if (axes.getType() === 'bar') {
            wpd.graphicsWidget.setTool(new wpd.EditLabelsTool(axes, dataset));
        }
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

wpd.dataPointValueOverrideEditor = (function() {
    let ds, ax, ptIndexes, tool;

    const editorID = 'data-point-value-override-editor';
    const tableID = 'data-point-value-override-editor-table';
    const resetFlagID = 'data-point-value-override-revert-flag';

    const labelBaseID = 'data-point-value-override-field-label-';
    const fieldBaseID = 'data-point-value-override-field-';
    const indicatorBaseID = 'data-point-value-override-indicator-';

    const multiplePointsSelectedMessage = 'Multiple points selected';
    const multipleOverridesExistMessage = 'Multiple override values';
    const someOverridesExistMessage = 'Some values overridden';

    function _init(dataset, axes, pointIndexes, initTool) {
        ds = dataset;
        ax = axes;
        ptIndexes = pointIndexes;
        tool = initTool;

        // generate the table row HTML using axes labels to label input fields
        document.getElementById(tableID).innerHTML = _getTableRowsHTML(axes.getAxesLabels());

        // avoid handler collisions
        wpd.graphicsWidget.removeTool();

        // reselect point, display tool mask, and repaint to keep displaying the selected point
        dataset.selectPixels(pointIndexes);
        initTool.displayMask();
        wpd.graphicsWidget.forceHandlerRepaint();

        // bind keydown listener so esc key closes the popup properly
        window.addEventListener("keydown", keydown, false);
    }

    function _getTableRowsHTML(axesLabels) {
        let html = '';

        for (let i = 0; i < axesLabels.length; i++) {
            html += '<tr>';

            // row label
            html += '<td>';
            html += '<span id="' + labelBaseID + i + '">';
            html += axesLabels[i] + '</span>:';
            html += '</td>';

            // row input
            html += '<td>';
            html += '<input type="text" id="' + fieldBaseID + i + '"';
            html += ' onkeydown="wpd.dataPointValueOverrideEditor.keydown(event);" />';
            html += '</td>';

            // row overridden indicator
            html += '<td>';
            html += '<span id="' + indicatorBaseID + i + '"';
            html += ' hidden>&#8682;</span>';
            html += '</td>';

            html += '</tr>';
        }

        return html;
    }

    function show(dataset, axes, pointIndexes, initTool) {
        // Bar charts currently not supported
        if (axes.getType() === 'bar') {
            return;
        }

        const fieldCount = axes.getDimensions();

        // initialize popup
        _init(dataset, axes, pointIndexes, initTool);

        // show popup window
        wpd.popup.show(editorID);

        const displayValues = [];

        // variables for checking if each value on points have been overridden
        const isAllOverridden = [];
        const isSomeOverridden = [];

        // go through each selected point and collect values for display
        for (let i = 0; i < pointIndexes.length; i++) {
            const pixel = dataset.getPixel(pointIndexes[i]);
            const originalValues = axes.pixelToData(pixel.x, pixel.y);

            let overrideValues = [];

            // if metadata on the pixel exists, display saved override values
            // if not, display current values
            if (pixel.metadata != null) {
                // retrieve stored override values
                overrideValues = pixel.metadata;
            }

            // for each original calculated value, if there exists an override, display
            // the override value instead of the original value
            for (let j = 0; j < fieldCount; j++) {
                if (isAllOverridden[j] === undefined) {
                    isAllOverridden.push(true);
                }

                if (isSomeOverridden[j] === undefined) {
                    isSomeOverridden.push(false);
                }

                if (overrideValues[j] == null) {
                    // no override value, use original calculated value
                    displayValues.push(originalValues[j]);

                    isAllOverridden[j] = false;
                } else {
                    // override value exists, use override value
                    displayValues.push(overrideValues[j]);

                    isSomeOverridden[j] = true;
                }
            }
        }

        // for each field: set display values, show/hide overridden icons,
        // and display appropriate placeholder text if applicable
        for (let i = 0; i < fieldCount; i++) {
            const $field = document.getElementById(fieldBaseID + i);
            const $overriddenIndicator = document.getElementById(indicatorBaseID + i);

            if (isSomeOverridden[i]) {
                if (isAllOverridden[i]) {
                    // check if all overridden values are the same
                    let sameValue = true;
                    for (let j = i + fieldCount; j < displayValues.length; j += fieldCount) {
                        if (displayValues[i] !== displayValues[j]) {
                            sameValue = false;
                            break;
                        }
                    }

                    if (sameValue) {
                        // get the first set of values in displayValues if all overrides
                        // are the same value
                        $field.value = displayValues[i];
                    } else {
                        $field.placeholder = multipleOverridesExistMessage;
                    }
                } else {
                    $field.placeholder = someOverridesExistMessage;
                }

                // display value overridden indicator
                $overriddenIndicator.hidden = false;
            } else {
                // single point
                if (displayValues.length === fieldCount) {
                    $field.value = displayValues[i];
                } else {
                    // none overridden, clear inputs
                    $field.placeholder = multiplePointsSelectedMessage;
                }

                // hide value overridden indicator
                $overriddenIndicator.hidden = true;
            }
        }
    }

    function ok() {
        // process each selected point
        for (let i = 0; i < ptIndexes.length; i++) {
            if (document.getElementById(resetFlagID).value === '0') {
                // fetch original values by converting pixel coordinates to values
                const pixel = ds.getPixel(ptIndexes[i]);
                const originalValues = ax.pixelToData(pixel.x, pixel.y);

                const newValues = [];
                let hasChanges = false;

                // fetch and process each input field values
                for (let j = 0; j < ax.getDimensions(); j++) {
                    let newValue = document.getElementById(fieldBaseID + j).value;

                    if (
                        originalValues[j] != newValue
                        && newValue != null
                        && newValue.length > 0
                    ) {
                        hasChanges = true;

                        // convert numeric strings to float
                        if (!isNaN(newValue)) {
                            newValue = parseFloat(newValue);
                        }
                    } else {
                        newValue = null;
                    }
                    newValues.push(newValue);
                }

                // if any value is overridden, set the metadata
                if (hasChanges) {
                    // set value
                    ds.setMetadataAt(ptIndexes[i], newValues);

                    // set metadata keys for dataset if not been set
                    if (ds.getMetadataKeys().length === 0) {
                        ds.setMetadataKeys(ax.getAxesLabels().map(
                            function(label) { return 'Override-' + label; }
                        ));
                    }

                    // refresh graphics
                    wpd.graphicsWidget.resetData();
                } else {
                    _resetMetadataAt(ptIndexes[i]);
                }
            } else {
                // if reset flag is set, skip the checks and remove metadata on
                // selected points
                _resetMetadataAt(ptIndexes[i]);
            }
        }

        _closePopup();
    }

    function _resetMetadataAt(index) {
        // otherwise set the metadata to null, effectively removing it
        ds.setMetadataAt(index, undefined);

        // remove metadata keys on the dataset if all have been removed
        if (!ds.hasMetadata()) {
            ds.setMetadataKeys([]);
        }
    }

    function _closePopup() {
        // clear reset flag
        document.getElementById(resetFlagID).value = '0';

        // remove popup keydown listener
        window.removeEventListener("keydown", keydown, false);

        wpd.popup.close(editorID);
        wpd.graphicsWidget.setTool(tool);
        tool.toggleOverrideSection(ptIndexes);
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function cancel() {
        _closePopup();
    }

    function keydown(ev) {
        if (wpd.keyCodes.isEnter(ev.keyCode)) {
            ok();
        } else if (wpd.keyCodes.isEsc(ev.keyCode)) {
            cancel();
        }
        ev.stopPropagation();
    }

    function clear() {
        // set reset flag
        document.getElementById(resetFlagID).value = '1';

        // process each selected point
        for (let i = 0; i < ptIndexes.length; i++) {
            // convert pixel coordinates to values
            const pixel = ds.getPixel(ptIndexes[i]);
            const originalValues = ax.pixelToData(pixel.x, pixel.y);

            // process each field
            for (let j = 0; j < ax.getDimensions(); j++) {
                let $field = document.getElementById(fieldBaseID + j);
                let value;

                // different behavior when multiple points are selected
                if (ptIndexes.length > 1) {
                    value = '';
                    $field.placeholder = multiplePointsSelectedMessage;
                } else {
                    value = originalValues[j];
                }

                // reset input fields
                document.getElementById(fieldBaseID + j).value = value

                // hide override indicators
                document.getElementById(indicatorBaseID + j).hidden = true;
            }
        }
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel,
        keydown: keydown,
        clear: clear
    };
})();
