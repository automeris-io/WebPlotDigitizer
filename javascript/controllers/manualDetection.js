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
        wpd.pointGroups.hideControls();
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount(dataset.getCount());
        wpd.graphicsWidget.removeRepainter();
    }

    function clearAll() {
        if (dataset.getCount() <= 0 && !dataset.hasPointGroups()) {
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
        if (axes instanceof wpd.BarAxes) {
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
        const pixel = dataset.getPixel(pointIndex),
            originalLabel = pixel.metadata.label;

        ds = dataset;
        ptIndex = pointIndex;
        tool = initTool;

        wpd.graphicsWidget.removeTool();

        // show popup window with originalLabel in the input field.
        wpd.popup.show('data-point-label-editor');
        const $labelField = document.getElementById('data-point-label-field');
        $labelField.value = originalLabel;
        $labelField.focus();
    }

    function ok() {
        var newLabel = document.getElementById('data-point-label-field').value;

        if (newLabel != null && newLabel.length > 0) {
            // fetch metadata and override values
            const pixel = ds.getPixel(ptIndex);
            let metadata = {};
            if (pixel.metadata != null) {
                metadata = pixel.metadata;
            }

            metadata.label = newLabel;

            // set label
            ds.setMetadataAt(ptIndex, metadata);

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
    let ds, ax, axLabels, ptIndexes, tool;

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

        // filter out bar chart "Label" axis
        axLabels = axes.getAxesLabels()
            .map(label => label.toLowerCase())
            .filter(label => label !== 'label');

        // generate the table row HTML using axes labels to label input fields
        document.getElementById(tableID).innerHTML = _getTableRowsHTML();

        // avoid handler collisions
        wpd.graphicsWidget.removeTool();

        // reselect point, display tool mask, and repaint to keep displaying the selected point
        dataset.selectPixels(pointIndexes);
        initTool.displayMask();
        wpd.graphicsWidget.forceHandlerRepaint();

        // bind keydown listener so esc key closes the popup properly
        window.addEventListener('keydown', keydown, false);
    }

    function _getTableRowsHTML() {
        let html = '';

        axLabels.forEach(label => {
            let displayLabel = wpd.utils.toSentenceCase(label);

            // display "Value" instead of "Y" for bar chart values
            if (ax instanceof wpd.BarAxes && label === 'y') {
                displayLabel = wpd.utils.toSentenceCase('value');
            }

            html += '<tr>';

            // row label
            html += '<td>';
            html += '<span id="' + labelBaseID + label + '">';
            html += displayLabel + '</span>:';
            html += '</td>';

            // row input
            html += '<td>';
            html += '<input type="text" id="' + fieldBaseID + label + '"';
            html += ' onkeydown="wpd.dataPointValueOverrideEditor.keydown(event);" />';
            html += '</td>';

            // row overridden indicator
            html += '<td>';
            html += '<span id="' + indicatorBaseID + label + '"';
            html += ' hidden>&#8682;</span>';
            html += '</td>';

            html += '</tr>';
        });

        return html;
    }

    function show(dataset, axes, pointIndexes, initTool) {
        // initialize popup
        _init(dataset, axes, pointIndexes, initTool);

        // show popup window
        wpd.popup.show(editorID);

        const displayValues = {};

        // variables for checking if each value on points have been overridden
        // and if all override values for each field are the same across all
        // selected points
        const isAllOverridden = {};
        const isSomeOverridden = {};
        const overrideValuesByField = {};

        // initialize information collection variables
        axLabels.forEach(label => {
            isAllOverridden[label] = true;
            isSomeOverridden[label] = false;
            overrideValuesByField[label] = [];
        });

        // go through each selected point and collect values for display
        pointIndexes.forEach(index => {
            const pixel = dataset.getPixel(index);
            const originals = _getDataFromPixel(pixel);

            // if metadata on the pixel exists, display saved override values
            // if not, display current values
            let overrides = {};
            if (pixel.metadata != null && pixel.metadata.hasOwnProperty('overrides')) {
                overrides = pixel.metadata.overrides;
            }

            // for each original calculated value, if there exists an override, display
            // the override value instead of the original value
            axLabels.forEach(label => {
                if (!overrides.hasOwnProperty(label)) {
                    // no override value, use original calculated value
                    displayValues[label] = originals[label];

                    isAllOverridden[label] = false;
                } else {
                    // override value exists, use override value
                    displayValues[label] = overrides[label];

                    overrideValuesByField[label].push(overrides[label]);

                    isSomeOverridden[label] = true;
                }
            });
        });

        // for each field: set display values, show/hide overridden icons,
        // and display appropriate placeholder text if applicable
        axLabels.forEach(label => {
            const $field = document.getElementById(fieldBaseID + label);
            const $overriddenIndicator = document.getElementById(indicatorBaseID + label);

            if (isSomeOverridden[label]) {
                if (isAllOverridden[label]) {
                    // check if all overridden values are the same
                    const hasSameValue = (value) => value === overrideValuesByField[label][0];

                    if (overrideValuesByField[label].every(hasSameValue)) {
                        // get the first set of values in displayValues if all overrides
                        // are the same value
                        $field.value = displayValues[label];
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
                if (pointIndexes.length === 1) {
                    $field.value = displayValues[label];
                } else {
                    // none overridden, clear inputs
                    $field.placeholder = multiplePointsSelectedMessage;
                }

                // hide value overridden indicator
                $overriddenIndicator.hidden = true;
            }
        });
    }

    function ok() {
        // process each selected point
        ptIndexes.forEach(index => {
            if (!_isReset()) {
                // fetch original values by converting pixel coordinates to values
                const pixel = ds.getPixel(index);
                const originals = _getDataFromPixel(pixel);

                // fetch metadata and override values
                let metadata = {};
                let overrides = {};
                if (pixel.metadata != null) {
                    metadata = pixel.metadata;

                    if (pixel.metadata.hasOwnProperty('overrides')) {
                        overrides = metadata.overrides;
                    }
                }

                const metadataKeys = ds.getMetadataKeys();

                const newOverrides = {};
                let hasChanges = false;

                // fetch and process each input field values
                axLabels.forEach(label => {
                    let newValue = document.getElementById(fieldBaseID + label).value;

                    // given value differs from the original calculated value
                    if (originals[label] != newValue) {
                        // given value is not null and has length
                        if (newValue != null && newValue.length > 0) {
                            hasChanges = true;

                            // convert numeric strings to float
                            if (!isNaN(newValue)) {
                                newValue = parseFloat(newValue);
                            }

                            // collect given value
                            newOverrides[label] = newValue;

                            // set overrides metadata keys for dataset if not been set
                            if (metadataKeys.indexOf('overrides') < 0) {
                                ds.setMetadataKeys([...metadataKeys, 'overrides']);
                            }
                        } else {
                            if (overrides.hasOwnProperty(label)) {
                                hasChanges = true;

                                // preserve previous override value if it exists
                                newOverrides[label] = overrides[label];
                            }
                        }
                    }
                });

                // if any value is overridden, set the metadata
                if (hasChanges) {
                    metadata.overrides = newOverrides;

                    // set value
                    ds.setMetadataAt(index, metadata);

                    // refresh graphics
                    wpd.graphicsWidget.resetData();
                } else {
                    _resetMetadataAt(index);
                }
            } else {
                // if reset flag is set, skip the checks and remove metadata on
                // selected points
                _resetMetadataAt(index);
            }
        });

        _closePopup();
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
        _toggleResetFlag(true);

        // process each selected point
        ptIndexes.forEach(index => {
            // convert pixel coordinates to values
            const originals = _getDataFromPixel(ds.getPixel(index));

            // process each field
            axLabels.forEach(label => {
                let $field = document.getElementById(fieldBaseID + label);
                let value;

                // different behavior when multiple points are selected
                if (ptIndexes.length > 1) {
                    value = '';
                    $field.placeholder = multiplePointsSelectedMessage;
                } else {
                    value = originals[label];
                }

                // reset input fields
                document.getElementById(fieldBaseID + label).value = value;

                // hide override indicators
                document.getElementById(indicatorBaseID + label).hidden = true;
            });
        });
    }

    function _getDataFromPixel(pixel) {
        // convert pixel data array into object keyed by axes labels
        // dependent on ordering of labels
        return ax.pixelToData(pixel.x, pixel.y).reduce((object, value, index) => {
            return {
                ...object,
                [axLabels[index]]: value
            };
        }, {});
    }

    function _resetMetadataAt(index) {
        // set the metadata to undefined, effectively removing it
        let newMetadata = undefined;

        if (ax instanceof wpd.BarAxes) {
            // preserve label information if this is a bar chart
            newMetadata = ds.getPixel(index).metadata;

            delete newMetadata.overrides;

            // check if there are any overrides
            const hasOverrides = ds.getAllPixels().some(pixel => {
                if (pixel.metadata && pixel.metadata.hasOwnProperty('overrides')) {
                    return true;
                }
                return false;
            });

            // no overrides left, remove overrides metadata key
            if (!hasOverrides) {
                ds.setMetadataKeys(ds.getMetadataKeys().filter(key => key !== 'overrides'));
            }
        } else {
            // remove metadata keys on the dataset if all have been removed
            if (!ds.hasMetadata()) {
                ds.setMetadataKeys([]);
            }
        }

        ds.setMetadataAt(index, newMetadata);
    }

    function _closePopup() {
        // clear reset flag
        _toggleResetFlag(false);

        // remove popup keydown listener
        window.removeEventListener("keydown", keydown, false);

        wpd.popup.close(editorID);
        wpd.graphicsWidget.setTool(tool);
        tool.toggleOverrideSection(ptIndexes);
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function _toggleResetFlag(enable) {
        let value = '0';

        if (enable) {
            value = '1';
        }

        document.getElementById(resetFlagID).value = value;
    }

    function _isReset() {
        return document.getElementById(resetFlagID).value === '1';
    }

    return {
        show: show,
        ok: ok,
        cancel: cancel,
        keydown: keydown,
        clear: clear
    };
})();
