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

wpd.ManualSelectionTool = class {
    constructor(axes, dataset) {
        this._axes = axes;
        this._dataset = dataset;
    }

    onAttach() {
        document.getElementById('manual-select-button').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(this._axes, this._dataset));

        // show point group controls if set
        if (this._dataset.hasPointGroups()) {
            wpd.pointGroups.showControls();
            wpd.pointGroups.refreshControls();
        }
    }

    onMouseClick(ev, pos, imagePos) {
        const addPixelArgs = [imagePos.x, imagePos.y];
        const hasPointGroups = this._dataset.hasPointGroups();

        const tupleIndex = wpd.pointGroups.getCurrentTupleIndex();
        const groupIndex = wpd.pointGroups.getCurrentGroupIndex();

        // handle bar axes labels
        let pointLabel = null;
        if (this._axes.dataPointsHaveLabels) {
            // only add a label if:
            // 1. point groups do not exist, or
            // 2. current group is a primary group (i.e. index 0)
            if (!hasPointGroups || groupIndex === 0) {
                const mkeys = this._dataset.getMetadataKeys();
                const labelKey = "label";

                // update metadata keys on the dataset, if necessary
                if (mkeys == null || !mkeys.length) {
                    // first metadata entry
                    this._dataset.setMetadataKeys([labelKey]);
                } else if (mkeys.indexOf(labelKey) < 0) {
                    // first label entry (existing metadata)
                    this._dataset.setMetadataKeys([labelKey, ...mkeys]);
                }

                // generate label
                let count = this._dataset.getCount();
                if (hasPointGroups) {
                    if (tupleIndex === null) {
                        count = this._dataset.getTupleCount();
                    } else {
                        count = tupleIndex;
                    }
                }
                pointLabel = this._axes.dataPointsLabelPrefix + count;

                // include label as point metadata
                addPixelArgs.push({
                    [labelKey]: pointLabel
                });
            }
        }

        // add the pixel to the dataset
        const index = this._dataset.addPixel(...addPixelArgs);

        // draw the point
        wpd.graphicsHelper.drawPoint(imagePos, this._dataset.colorRGB.toRGBString(), pointLabel);

        // update point group data
        if (hasPointGroups) {
            if (tupleIndex === null && groupIndex === 0) {
                // record the point as a new tuple
                const newTupleIndex = this._dataset.addTuple(index);
                wpd.pointGroups.setCurrentTupleIndex(newTupleIndex);
            } else {
                this._dataset.addToTupleAt(tupleIndex, groupIndex, index);
            }

            // switch to next point group
            wpd.pointGroups.nextGroup();
        }

        wpd.graphicsWidget.updateZoomOnEvent(ev);
        wpd.dataPointCounter.setCount(this._dataset.getCount());

        // If shiftkey was pressed while clicking on a point that has a label (e.g. bar charts),
        // then show a popup to edit the label
        if (this._axes.dataPointsHaveLabels && ev.shiftKey) {
            wpd.dataPointLabelEditor.show(this._dataset, this._dataset.getCount() - 1, this);
        }

        // dispatch point add event
        wpd.events.dispatch("wpd.dataset.point.add", {
            axes: this._axes,
            dataset: this._dataset,
            index: index
        });
    }

    onRemove() {
        document.getElementById('manual-select-button').classList.remove('pressed-button');

        // hide point group controls if set
        if (this._dataset.hasPointGroups()) {
            wpd.pointGroups.hideControls();
        }
    }

    onKeyDown(ev) {
        const lastPtIndex = this._dataset.getCount() - 1;
        const lastPt = this._dataset.getPixel(lastPtIndex);
        const stepSize = 0.5 / wpd.graphicsWidget.getZoomRatio();

        // rotate to current rotation
        const currentRotation = wpd.graphicsWidget.getRotation();
        let {
            x,
            y
        } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, lastPt.x, lastPt.y);

        if (wpd.keyCodes.isUp(ev.keyCode)) {
            y = y - stepSize;
        } else if (wpd.keyCodes.isDown(ev.keyCode)) {
            y = y + stepSize;
        } else if (wpd.keyCodes.isLeft(ev.keyCode)) {
            x = x - stepSize;
        } else if (wpd.keyCodes.isRight(ev.keyCode)) {
            x = x + stepSize;
        } else if (wpd.keyCodes.isComma(ev.keyCode)) {
            wpd.pointGroups.previousGroup();
            return;
        } else if (wpd.keyCodes.isPeriod(ev.keyCode)) {
            wpd.pointGroups.nextGroup();
            return;
        } else if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
            return;
        } else {
            return;
        }

        // rotate back to original rotation
        ({
            x,
            y
        } = wpd.graphicsWidget.getRotatedCoordinates(currentRotation, 0, x, y));

        this._dataset.setPixelAt(lastPtIndex, x, y);
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.graphicsWidget.updateZoomToImagePosn(lastPt.x, lastPt.y);
        ev.preventDefault();
    }
};

wpd.DeleteDataPointTool = class {
    constructor(axes, dataset) {
        this._axes = axes;
        this._dataset = dataset;
    }

    onAttach() {
        document.getElementById('delete-point-button').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(this._axes, this._dataset));
    }

    onMouseClick(ev, pos, imagePos) {
        const tupleCallback = (imagePos, index) => {
            const tupleIndex = this._dataset.getTupleIndex(index);

            if (tupleIndex > -1) {
                const indexes = this._dataset.getTuple(tupleIndex);

                // sort indexes in descending order for removal
                const indexesDesc = [...indexes].filter(i => i !== null).sort((a, b) => b - a);

                // remove each data point in tuple
                indexesDesc.forEach(idx => {
                    this._dataset.removePixelAtIndex(idx);
                    // update pixel references in tuples
                    this._dataset.refreshTuplesAfterPixelRemoval(idx);
                });

                // remove tuple
                this._dataset.removeTuple(tupleIndex);

                // update current tuple index pointer
                wpd.pointGroups.previousGroup();

                finalCallback(indexes);
            } else {
                // if tuple does not exist, just remove the pixel
                finalCallback([this._dataset.removeNearestPixel(imagePos.x, imagePos.y)]);
            }
        };

        const pointCallback = (imagePos) => {
            const index = this._dataset.removeNearestPixel(imagePos.x, imagePos.y);

            // remove data point index references from tuples
            const tupleIndex = this._dataset.getTupleIndex(index);

            if (tupleIndex > -1) {
                this._dataset.removeFromTupleAt(tupleIndex, index);

                // update pixel references in tuples
                this._dataset.refreshTuplesAfterPixelRemoval(index);

                // remove tuple if no point index references left in tuple
                if (this._dataset.isTupleEmpty(tupleIndex)) {
                    this._dataset.removeTuple(tupleIndex);
                }

                // update current tuple index pointer
                wpd.pointGroups.previousGroup();
            }

            finalCallback([index]);
        };

        const finalCallback = (indexes) => {
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount(this._dataset.getCount());

            // dispatch point delete event
            indexes.forEach(index => {
                wpd.events.dispatch("wpd.dataset.point.delete", {
                    axes: this._axes,
                    dataset: this._dataset,
                    index: index
                });
            });
        };

        // handle point tuple deletion
        if (this._dataset.hasPointGroups()) {
            const index = this._dataset.findNearestPixel(imagePos.x, imagePos.y);

            if (index > -1) {
                // display tuple deletion confirmation popup if point groups exist
                wpd.pointGroups.showDeleteTuplePopup(
                    tupleCallback.bind(null, imagePos, index),
                    pointCallback.bind(null, imagePos)
                );
            }
        } else {
            pointCallback(imagePos);
        }
    }

    onKeyDown(ev) {
        if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
        }
    }

    onRemove() {
        document.getElementById('delete-point-button').classList.remove('pressed-button');
    }
};

wpd.MultipleDatasetRepainter = class {
    constructor(axesList, datasetList) {
        this.painterName = "multipleDatasetsRepainter";
        this._datasetList = datasetList;
        this._axesList = axesList;

        // TODO: for each dataset, create a separate DataPointsRepainter
        this._datasetRepainters = [];
        for (let [dsIdx, ds] of datasetList.entries()) {
            let dsAxes = axesList[dsIdx];
            this._datasetRepainters.push(new wpd.DataPointsRepainter(dsAxes, ds));
        }
    }

    drawPoints() {
        for (let dsRepainter of this._datasetRepainters) {
            dsRepainter.drawPoints();
        }
    }

    onAttach() {
        wpd.graphicsWidget.resetData();
        this.drawPoints();
    }

    onRedraw() {
        this.drawPoints();
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        this.drawPoints();
    }
};

wpd.DataPointsRepainter = class {
    constructor(axes, dataset) {
        this._axes = axes;
        this._dataset = dataset;
        this.painterName = 'dataPointsRepainter';
    }

    drawPoints() {
        let mkeys = this._dataset.getMetadataKeys();
        let hasLabels = false;

        if (this._axes == null) {
            return; // this can happen when removing widgets when a new file is loaded:
        }

        if (this._axes.dataPointsHaveLabels && mkeys != null && mkeys[0] === 'label') {
            hasLabels = true;
        }

        for (let dindex = 0; dindex < this._dataset.getCount(); dindex++) {
            let imagePos = this._dataset.getPixel(dindex);
            let isSelected = this._dataset.getSelectedPixels().indexOf(dindex) >= 0;

            let fillStyle = isSelected ? "rgb(0,200,0)" : this._dataset.colorRGB.toRGBString();

            if (hasLabels) {
                let pointLabel = null;
                if (this._dataset.hasPointGroups()) {
                    // with point groups, bar labels only apply to points in the primary group (i.e. index 0)
                    const tupleIndex = this._dataset.getTupleIndex(dindex);
                    const groupIndex = this._dataset.getPointGroupIndexInTuple(tupleIndex, dindex);
                    if (groupIndex <= 0) {
                        if (imagePos.metadata !== undefined) {
                            pointLabel = imagePos.metadata.label;
                        }
                        const index = tupleIndex > -1 ? tupleIndex : dindex;
                        if (pointLabel == null) {
                            pointLabel = this._axes.dataPointsLabelPrefix + index;
                        }
                    }
                } else {
                    pointLabel = imagePos.metadata.label;
                    if (pointLabel == null) {
                        pointLabel = this._axes.dataPointsLabelPrefix + dindex;
                    }
                }
                wpd.graphicsHelper.drawPoint(imagePos, fillStyle, pointLabel);
            } else {
                wpd.graphicsHelper.drawPoint(imagePos, fillStyle);
            }
        }
    }

    onAttach() {
        wpd.graphicsWidget.resetData();
        this.drawPoints();
    }

    onRedraw() {
        this.drawPoints();
    }

    onForcedRedraw() {
        wpd.graphicsWidget.resetData();
        //this.drawPoints();
    }
};

wpd.AdjustDataPointTool = class {
    constructor(axes, dataset) {
        this._axes = axes;
        this._dataset = dataset;
        this._$button = document.getElementById('manual-adjust-button');
        this._$overrideSection = document.getElementById('value-overrides-controls');
        this._$overrideButton = document.getElementById('override-data-values');

        // multi-select box
        this._isMouseDown = false;
        this._isSelecting = false;
        this._drawTimer = null;
        this._p1 = null;
        this._p2 = null;
        this._imageP1 = null;
        this._imageP2 = null;
    }

    onAttach() {
        this._$button.classList.add('pressed-button');
        this._$overrideButton.classList.remove('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(this._axes, this._dataset));
        wpd.toolbar.show('adjustDataPointsToolbar');
    }

    onRemove() {
        this._dataset.unselectAll();
        wpd.graphicsWidget.forceHandlerRepaint();
        this._$button.classList.remove('pressed-button');
        wpd.toolbar.clear();

        // hide override section
        this._$overrideSection.hidden = true;
    }

    onMouseDown(ev, pos, imagePos) {
        this._isMouseDown = true;

        // record the first selection rectangle point
        this._p1 = pos;
        this._imageP1 = imagePos;

        // unselect everything
        this._dataset.unselectAll();
    }

    onMouseUp(ev, pos) {
        if (this._isSelecting === true) {
            // reset hover context to remove selection box drawing
            wpd.graphicsWidget.resetHover();

            // select points within the selection rectangle
            this._dataset.selectPixelsInRectangle(this._imageP1, this._imageP2);
            this._onSelect(ev, this._dataset.getSelectedPixels());

            // clear the draw timer
            clearTimeout(this._drawTimer);

            // push these reset statements to the bottom of the events message queue
            setTimeout(() => {
                this._isSelecting = false;
                this._isMouseDown = false;
                this._p1 = null;
                this._p2 = null;

                // reset hover context to remove previous selection box
                wpd.graphicsWidget.resetHover();
            });
        } else {
            this._isMouseDown = false;
            this._p1 = null;
            this._p2 = null;

            // reset hover context to remove previous selection box
            wpd.graphicsWidget.resetHover();
        }
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isMouseDown === true) {
            this._isSelecting = true;

            // record the new position as the second selection rectangle point
            this._p2 = pos;
            this._imageP2 = imagePos;

            // refresh the selection rectangle every 1 ms
            clearTimeout(this._drawTimer);
            this._drawTimer = setTimeout(() => {
                this._drawSelectionBox();
            }, 1);
        }
    }

    _drawSelectionBox() {
        // reset hover context to remove previous selection box
        wpd.graphicsWidget.resetHover();

        // fetch the hover context
        const ctx = wpd.graphicsWidget.getAllContexts().hoverCtx;

        // draw a black rectangle
        if (this._p1 != null && this._p2 != null) {
            const canvasP1 = wpd.graphicsWidget.screenToCanvasPx(this._p1.x, this._p1.y);
            const canvasP2 = wpd.graphicsWidget.screenToCanvasPx(this._p2.x, this._p2.y);

            ctx.strokeStyle = 'rgb(0,0,0)';
            ctx.strokeRect(
                canvasP1.x,
                canvasP1.y,
                canvasP2.x - canvasP1.x,
                canvasP2.y - canvasP1.y
            );
        }
    }

    _onSelect(ev, pixelIndexes) {
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.graphicsWidget.updateZoomOnEvent(ev);
        this.toggleOverrideSection(pixelIndexes);
        wpd.events.dispatch("wpd.dataset.point.select", {
            axes: this._axes,
            dataset: this._dataset,
            indexes: pixelIndexes
        });
    }

    onMouseClick(ev, pos, imagePos) {
        if (this._isSelecting === false) {
            this._dataset.unselectAll();
            const pixelIndex = this._dataset.selectNearestPixel(imagePos.x, imagePos.y);
            this._onSelect(ev, [pixelIndex]);
        }
    }

    onKeyDown(ev) {
        if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
            return;
        }

        const selIndexes = this._dataset.getSelectedPixels();

        if (selIndexes.length < 1) {
            return;
        }

        // key strokes that do not need each point processed
        if (wpd.keyCodes.isAlphabet(ev.keyCode, 'r')) {
            wpd.dataPointValueOverrideEditor.show(this._dataset, this._axes, selIndexes, this);
            return;
        }

        // key strokes that need each point processed
        let lastPtCoord = {
            x: null,
            y: null
        };
        selIndexes.forEach((selIndex) => {
            const stepSize = ev.shiftKey === true ? 5 / wpd.graphicsWidget.getZoomRatio() :
                0.5 / wpd.graphicsWidget.getZoomRatio();

            let selPoint = this._dataset.getPixel(selIndex),
                pointPx = selPoint.x,
                pointPy = selPoint.y;

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
            } else if (selIndexes.length === 1) {
                // single selected point operations
                if (wpd.keyCodes.isAlphabet(ev.keyCode, 'q')) {
                    this._dataset.selectPreviousPixel();
                    selIndex = this._dataset.getSelectedPixels()[0];
                    selPoint = this._dataset.getPixel(selIndex);
                    pointPx = selPoint.x;
                    pointPy = selPoint.y;
                    ({
                        x,
                        y
                    } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, pointPx, pointPy));
                } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'w')) {
                    this._dataset.selectNextPixel();
                    selIndex = this._dataset.getSelectedPixels()[0];
                    selPoint = this._dataset.getPixel(selIndex);
                    pointPx = selPoint.x;
                    pointPy = selPoint.y;
                    ({
                        x,
                        y
                    } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, pointPx, pointPy));
                } else if (wpd.keyCodes.isAlphabet(ev.keyCode, 'e')) {
                    if (this._axes.dataPointsHaveLabels) {
                        selIndex = this._dataset.getSelectedPixels()[0];
                        ev.preventDefault();
                        ev.stopPropagation();
                        wpd.dataPointLabelEditor.show(this._dataset, selIndex, this);
                        return;
                    }
                } else if (wpd.keyCodes.isDel(ev.keyCode) || wpd.keyCodes.isBackspace(ev.keyCode)) {
                    this._dataset.removePixelAtIndex(selIndex);
                    this._dataset.unselectAll();
                    if (this._dataset.findNearestPixel(pointPx, pointPy) >= 0) {
                        this._dataset.selectNearestPixel(pointPx, pointPy);
                        selIndex = this._dataset.getSelectedPixels()[0];
                        selPoint = this._dataset.getPixel(selIndex);
                        pointPx = selPoint.x;
                        pointPy = selPoint.y;
                        ({
                            x,
                            y
                        } = wpd.graphicsWidget.getRotatedCoordinates(0, currentRotation, pointPx, pointPy));
                    }
                    wpd.graphicsWidget.resetData();
                    wpd.graphicsWidget.forceHandlerRepaint();
                    wpd.graphicsWidget.updateZoomToImagePosn(pointPx, pointPy);
                    wpd.dataPointCounter.setCount(this._dataset.getCount());
                    ev.preventDefault();
                    ev.stopPropagation();
                    return;
                } else {
                    return;
                }
            } else {
                return;
            }

            // rotate back to original rotation
            ({
                x,
                y
            } = wpd.graphicsWidget.getRotatedCoordinates(currentRotation, 0, x, y));
            this._dataset.setPixelAt(selIndex, x, y);
            lastPtCoord = {
                x: x,
                y: y
            };
        });

        wpd.graphicsWidget.forceHandlerRepaint();
        if (lastPtCoord.x != null) {
            wpd.graphicsWidget.updateZoomToImagePosn(lastPtCoord.x, lastPtCoord.y);
        }
        ev.preventDefault();
        ev.stopPropagation();
    }

    toggleOverrideSection(pixelIndexes) {
        // Bar charts currently not supported
        const $overriddenIndicator = document.getElementById('overridden-data-indicator');

        // always start with overridden value indicator hidden
        $overriddenIndicator.hidden = true;

        if (
            // single pixel selection:
            // if selectNearestPixel does not find a pixel within the threshold
            // it returns -1
            (
                pixelIndexes.length === 1 &&
                pixelIndexes[0] >= 0
            ) ||
            pixelIndexes.length > 1
        ) {
            // display override section
            this._$overrideSection.hidden = false;

            // attach click handler for value edit popup
            this._$overrideButton.onclick = wpd.dataPointValueOverrideEditor.show.bind(
                null,
                this._dataset,
                this._axes,
                pixelIndexes,
                this
            );

            // display overridden value indicator if at least one point has
            // one override value (unless the key is label)
            this._dataset.getSelectedPixels().some(index => {
                const pixel = this._dataset.getPixel(index);
                if (pixel.metadata) {
                    let threshold = 1;
                    if (pixel.metadata.hasOwnProperty('label')) {
                        threshold += 1;
                    }
                    if (Object.keys(pixel.metadata).length >= threshold) {
                        $overriddenIndicator.hidden = false;
                        return true;
                    }
                }
                return false;
            });
        } else {
            // no point(s) selected
            this._$overrideSection.hidden = true;

            // hide button and clear onclick handler
            this._$overrideButton.onclick = null;
        }
    }

    displayMask() {
        // create a mask that makes this tool appear to still be selected
        // when the override popup is engaged
        this._$button.classList.add('pressed-button');
        wpd.toolbar.show('adjustDataPointsToolbar');
        this._$overrideSection.hidden = false;
        this._$overrideButton.classList.add('pressed-button');
    }
};

wpd.EditLabelsTool = class {
    constructor(axes, dataset) {
        this._axes = axes;
        this._dataset = dataset;
    }

    onAttach() {
        document.getElementById('edit-data-labels').classList.add('pressed-button');
        wpd.graphicsWidget.setRepainter(new wpd.DataPointsRepainter(this._axes, this._dataset));
    }

    onRemove() {
        document.getElementById('edit-data-labels').classList.remove('pressed-button');
        this._dataset.unselectAll();
    }

    onMouseClick(ev, pos, imagePos) {
        this._dataset.unselectAll();
        const pixelIndex = this._dataset.selectNearestPixel(imagePos.x, imagePos.y);
        if (
            pixelIndex >= 0 &&
            (
                // if point groups exist, check that point is either not in a group
                // or in the primary group
                !this._dataset.hasPointGroups() || this._dataset.getPointGroupIndexInTuple(
                    this._dataset.getTupleIndex(pixelIndex),
                    pixelIndex
                ) <= 0
            )
        ) {
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointLabelEditor.show(this._dataset, pixelIndex, this);
        }
    }

    onKeyDown(ev) {
        if (wpd.acquireData.isToolSwitchKey(ev.keyCode)) {
            wpd.acquireData.switchToolOnKeyPress(String.fromCharCode(ev.keyCode).toLowerCase());
        }
    }
};

wpd.dataPointCounter = {
    setCount: function(count) {
        let $counters = document.getElementsByClassName('data-point-counter');
        for (let ci = 0; ci < $counters.length; ci++) {
            $counters[ci].innerHTML = count;
        }
    }
};
