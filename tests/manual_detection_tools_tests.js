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

QUnit.module(
    "Manual detection tools tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Manual selection tool", (assert) => {
    const axes = new wpd.ImageAxes();
    const dataset = new wpd.Dataset(1);

    // stub functions
    const drawPointStub = sinon.stub(wpd.graphicsHelper, "drawPoint");
    const updateZoomStub = sinon.stub(wpd.graphicsWidget, "updateZoomOnEvent");
    const setCountStub = sinon.stub(wpd.dataPointCounter, "setCount");
    const showLabelEditorStub = sinon.stub(wpd.dataPointLabelEditor, "show");
    const dispatchStub = sinon.stub(wpd.events, "dispatch");
    const tupleIndexStub = sinon.stub(wpd.pointGroups, "getCurrentTupleIndex");
    const groupIndexStub = sinon.stub(wpd.pointGroups, "getCurrentGroupIndex");
    const setGroupIndexStub = sinon.stub(wpd.pointGroups, "setCurrentTupleIndex");
    const nextGroupStub = sinon.stub(wpd.pointGroups, "nextGroup");
    const hasPointGroupsStub = sinon.stub(dataset, "hasPointGroups");
    const addTupleStub = sinon.stub(dataset, "addTuple");
    const addToTupleAtStub = sinon.stub(dataset, "addToTupleAt");

    // spies
    const addPixelSpy = sinon.spy(dataset, "addPixel");

    // create instance
    let tool = new wpd.ManualSelectionTool(axes, dataset);

    // non-bar chart case
    let ev = {};
    let imagePos = {
        x: 0,
        y: 1
    };
    let expectedPoint = Object.assign({
        metadata: undefined
    }, imagePos);
    let expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: axes,
            dataset: dataset,
            index: 0
        }
    ];
    updateZoomStub.resetHistory();
    setCountStub.resetHistory();
    hasPointGroupsStub.returns(false);
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Non-bar chart point, no point groups: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y), "Non-bar chart point, no point groups: Added without metadata");
    assert.true(nextGroupStub.notCalled, "Non-bar chart point, no point groups: Next group not called");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Non-bar chart point, no point groups: Drawn");
    assert.true(updateZoomStub.called, "Non-bar chart point, no point groups: Updated zoom");
    assert.true(setCountStub.called, "Non-bar chart point, no point groups: Updated count");
    assert.true(showLabelEditorStub.notCalled, "Non-bar chart point, no point groups: Label editor not shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Non-bar chart point, no point groups: Dispatched point add event");

    // non-bar chart, point groups, primary group case
    expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: axes,
            dataset: dataset,
            index: 1
        }
    ];
    addTupleStub.resetHistory();
    addToTupleAtStub.resetHistory();
    updateZoomStub.resetHistory();
    setCountStub.resetHistory();
    tupleIndexStub.returns(null);
    groupIndexStub.returns(0);
    hasPointGroupsStub.returns(true);
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Non-bar chart point, point groups, primary group: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y), "Non-bar chart point, point groups, primary group: Added without metadata");
    assert.true(addTupleStub.called, "Non-bar chart point, point groups, primary group: Tuple added");
    assert.true(addToTupleAtStub.notCalled, "Non-bar chart point, point groups, primary group: Point not added to existing tuple");
    assert.true(setGroupIndexStub.called, "Non-bar chart point, point groups, primary group: Current tuple index set");
    assert.true(nextGroupStub.called, "Non-bar chart point, point groups, primary group: Go to next group");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Non-bar chart point, point groups, primary group: Drawn");
    assert.true(updateZoomStub.called, "Non-bar chart point, point groups, primary group: Updated zoom");
    assert.true(setCountStub.called, "Non-bar chart point, point groups, primary group: Updated count");
    assert.true(showLabelEditorStub.notCalled, "Non-bar chart point, point groups, primary group: Label editor not shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Non-bar chart point, point groups, primary group: Dispatched point add event");

    // non-bar chart, point groups, non-primary group case
    expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: axes,
            dataset: dataset,
            index: 2
        }
    ];
    addTupleStub.resetHistory();
    addToTupleAtStub.resetHistory();
    updateZoomStub.resetHistory();
    setCountStub.resetHistory();
    tupleIndexStub.returns(0);
    groupIndexStub.returns(1);
    hasPointGroupsStub.returns(true);
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Non-bar chart point, point groups, non-primary group: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y), "Non-bar chart point, point groups, non-primary group: Added without metadata");
    assert.true(addTupleStub.notCalled, "Non-bar chart point, point groups, non-primary group: Tuple not added");
    assert.true(addToTupleAtStub.called, "Non-bar chart point, point groups, non-primary group: Point added to existing tuple");
    assert.true(nextGroupStub.called, "Non-bar chart point, point groups, non-primary group: Go to next group");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Non-bar chart point, point groups, non-primary group: Drawn");
    assert.true(updateZoomStub.called, "Non-bar chart point, point groups, non-primary group: Updated zoom");
    assert.true(setCountStub.called, "Non-bar chart point, point groups, non-primary group: Updated count");
    assert.true(showLabelEditorStub.notCalled, "Non-bar chart point, point groups, non-primary group: Label editor not shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Non-bar chart point, point groups, non-primary group: Dispatched point add event");

    // bar chart, non-shift key, no data set metadata keys case
    // create new instance and supply bar axes
    const barAxes = new wpd.BarAxes();
    dataset._dataPoints = [];
    dataset._pixelMetadataKeys = [];
    tool = new wpd.ManualSelectionTool(barAxes, dataset);
    ev = {
        shiftKey: false
    };
    imagePos = {
        x: 2,
        y: 3
    };
    expectedPoint = Object.assign({
        metadata: {
            label: "Bar0"
        }
    }, imagePos);
    expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: barAxes,
            dataset: dataset,
            index: 0
        }
    ];
    updateZoomStub.resetHistory();
    setCountStub.resetHistory();
    hasPointGroupsStub.returns(false);
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Bar chart point, non-shift key: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y, {
        label: "Bar0"
    }), "Bar chart point, non-shift key: Added with metadata");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Bar chart point, non-shift key: Drawn");
    assert.true(updateZoomStub.called, "Bar chart point, non-shift key: Updated zoom");
    assert.true(setCountStub.called, "Bar chart point, non-shift key: Updated count");
    assert.true(showLabelEditorStub.notCalled, "Bar chart point, non-shift key: Label editor not shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Bar chart point, non-shift key: Dispatched point add event");
    assert.deepEqual(dataset.getMetadataKeys(), ["label"], "Label added to empty data set metadata keys correctly");

    // bar chart, shift key, existing data set metadata keys case
    dataset._pixelMetadataKeys = ["test"];
    ev = {
        shiftKey: true
    };
    imagePos = {
        x: 4,
        y: 5
    };
    expectedPoint = Object.assign({
        metadata: {
            label: "Bar1"
        }
    }, imagePos);
    expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: barAxes,
            dataset: dataset,
            index: 1
        }
    ];
    updateZoomStub.resetHistory();
    setCountStub.resetHistory();
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[1], expectedPoint, "Bar chart point, shift key, other metadata exists: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y, {
        label: "Bar1"
    }), "Bar chart point, shift key: Added with metadata");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Bar chart point, shift key, other metadata exists: Drawn");
    assert.true(updateZoomStub.called, "Bar chart point, shift key, other metadata exists: Updated zoom");
    assert.true(setCountStub.called, "Bar chart point, shift key, other metadata exists: Updated count");
    assert.true(showLabelEditorStub.calledOnce, "Bar chart point, shift key, other metadata exists: Label editor shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Bar chart point, shift key, other metadata exists: Dispatched point add event");
    assert.deepEqual(dataset.getMetadataKeys(), ["label", "test"], "Label added to data set metadata keys correctly");

    // bar chart, shift key, existing label data set metadata key case
    ev = {
        shiftKey: true
    };
    imagePos = {
        x: 6,
        y: 7
    };
    expectedPoint = Object.assign({
        metadata: {
            label: "Bar2"
        }
    }, imagePos);
    expectedEventArgs = [
        "wpd.dataset.point.add",
        {
            axes: barAxes,
            dataset: dataset,
            index: 2
        }
    ];
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[2], expectedPoint, "Bar chart point, shift key, label metadata exists: Added");
    assert.true(addPixelSpy.calledWith(imagePos.x, imagePos.y, {
        label: "Bar2"
    }), "Bar chart point, shift key, label metadata exists: Added with metadata");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Bar chart point, shift key, label metadata exists: Drawn");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Bar chart point, shift key, label metadata exists: Dispatched point add event");
    assert.deepEqual(dataset.getMetadataKeys(), ["label", "test"], "Label not duplicated in data set metadata keys");
});

QUnit.test("Delete data point tool", (assert) => {
    const axes = new wpd.ImageAxes();
    const dataset = new wpd.Dataset(1);

    // create instance
    const tool = new wpd.DeleteDataPointTool(axes, dataset);

    // stub functions
    sinon.stub(dataset, "removeNearestPixel").returns(0);
    const resetStub = sinon.stub(wpd.graphicsWidget, "resetData");
    const repaintStub = sinon.stub(wpd.graphicsWidget, "forceHandlerRepaint");
    const updateZoomStub = sinon.stub(wpd.graphicsWidget, "updateZoomOnEvent");
    const setCountStub = sinon.stub(wpd.dataPointCounter, "setCount");
    const dispatchStub = sinon.stub(wpd.events, "dispatch");
    const hasPointGroupsStub = sinon.stub(dataset, "hasPointGroups");
    const findNearestPixelStub = sinon.stub(dataset, "findNearestPixel");
    const showDeleteTuplePopupStub = sinon.stub(wpd.pointGroups, "showDeleteTuplePopup");

    const imagePos = {
        x: 0,
        y: 1
    };

    const expectedEventArgs = [
        "wpd.dataset.point.delete",
        {
            axes: axes,
            dataset: dataset,
            index: 0
        }
    ];

    // no point groups case
    tool.onMouseClick(null, null, imagePos);
    hasPointGroupsStub.returns(false);
    assert.true(resetStub.calledOnce, "No point groups: Graphics reset");
    assert.true(repaintStub.calledOnce, "No point groups: Repainted");
    assert.true(updateZoomStub.calledOnce, "No point groups: Updated zoom");
    assert.true(setCountStub.calledOnce, "No point groups: Updated count");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "No point groups: Dispatched point delete event");

    // point groups, point not found case
    hasPointGroupsStub.returns(true);
    findNearestPixelStub.returns(-1);
    tool.onMouseClick(null, null, imagePos);
    assert.true(showDeleteTuplePopupStub.notCalled, "Point groups, no point: Delete popup not shown");
    assert.true(resetStub.calledOnce, "Point groups, no point: Graphics reset");
    assert.true(repaintStub.calledOnce, "Point groups, no point: Repainted");
    assert.true(updateZoomStub.calledOnce, "Point groups, no point: Updated zoom");
    assert.true(setCountStub.calledOnce, "Point groups, no point: Updated count");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Point groups, no point: Dispatched point delete event");

    // point groups, point found case
    hasPointGroupsStub.returns(true);
    findNearestPixelStub.returns(0);
    tool.onMouseClick(null, null, imagePos);
    assert.true(showDeleteTuplePopupStub.called, "Point groups, point: Delete popup shown");
    assert.true(resetStub.calledOnce, "Point groups, point: Graphics reset");
    assert.true(repaintStub.calledOnce, "Point groups, point: Repainted");
    assert.true(updateZoomStub.calledOnce, "Point groups, point: Updated zoom");
    assert.true(setCountStub.calledOnce, "Point groups, point: Updated count");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Point groups, point: Dispatched point delete event");
});

QUnit.test("Edit data point tool", (assert) => {
    const axes = new wpd.ImageAxes();
    const dataset = new wpd.Dataset(1);

    // create instance
    const getElementByIdStub = sinon.stub(document, "getElementById");
    getElementByIdStub.withArgs("manual-adjust-button").returns({});
    getElementByIdStub.withArgs("value-overrides-controls").returns({});
    getElementByIdStub.withArgs("override-data-values").returns({});
    const tool = new wpd.AdjustDataPointTool(axes, dataset);
    // qunit uses the stubbed document functions, restore it immediately
    document.getElementById.restore();

    // async callback for setTimeout in onMouseUp
    const done = assert.async();

    // stub functions
    sinon.stub(dataset, "selectNearestPixel").returns(0);
    sinon.stub(dataset, "selectPixelsInRectangle");
    sinon.stub(dataset, "getSelectedPixels").returns([1, 2]);
    sinon.stub(tool, "_drawSelectionBox");
    const unselectAllSpy = sinon.spy(dataset, "unselectAll");
    const repaintStub = sinon.stub(wpd.graphicsWidget, "forceHandlerRepaint");
    const updateZoomStub = sinon.stub(wpd.graphicsWidget, "updateZoomOnEvent");
    const resetHoverStub = sinon.stub(wpd.graphicsWidget, "resetHover").onSecondCall().callsFake(function() {
        assert.true(resetHoverStub.calledTwice, "Multiple point selection: Hover reset");
        done();
    });
    const toggleOverrideStub = sinon.stub(tool, "toggleOverrideSection");
    const dispatchStub = sinon.stub(wpd.events, "dispatch");
    const onSelectSpy = sinon.spy(tool, "_onSelect");

    // single point selection case
    let expectedPayload = {
        axes: axes,
        dataset: dataset,
        indexes: [0]
    };
    const expectedEventArgs = ["wpd.dataset.point.select", expectedPayload];
    tool.onMouseClick(null, null, {
        x: 0,
        y: 1
    });
    assert.true(unselectAllSpy.calledOnce, "Single point selection: All points unselected");
    assert.true(onSelectSpy.calledWith(null, sinon.match([0])), "Single point selection: Passed point in an array");
    assert.true(repaintStub.calledOnce, "Single point selection: Repainted");
    assert.true(updateZoomStub.calledOnce, "Single point selection: Updated zoom");
    assert.true(toggleOverrideStub.calledOnce, "Single point selection: Updated override indicator");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Single point selection: Dispatched point select event");

    // multiple point selection case
    expectedPayload.indexes = [1, 2];
    tool.onMouseDown(null, null, null);
    tool.onMouseMove(null, null, null);
    tool.onMouseUp(null, null);
    assert.true(unselectAllSpy.calledTwice, "Multiple point selection: All points unselected");
    assert.true(onSelectSpy.calledWith(null, sinon.match([1, 2])), "Multiple point selection: Passed point in an array");
    assert.true(repaintStub.calledTwice, "Multiple point selection: Repainted");
    assert.true(updateZoomStub.calledTwice, "Multiple point selection: Updated zoom");
    assert.true(toggleOverrideStub.calledTwice, "Multiple point selection: Updated override indicator");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Multiple point selection: Dispatched point select event");
});
