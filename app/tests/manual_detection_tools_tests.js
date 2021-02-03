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
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Non-bar chart point: Added");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Non-bar chart point: Drawn");
    assert.true(updateZoomStub.calledOnce, "Non-bar chart point: Updated zoom");
    assert.true(setCountStub.calledOnce, "Non-bar chart point: Updated count");
    assert.true(showLabelEditorStub.notCalled, "Non-bar chart point: Label editor not shown");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Non-bar chart point: Dispatched point add event");

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
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[0], expectedPoint, "Bar chart point, non-shift key: Added");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Bar chart point, non-shift key: Drawn");
    assert.true(updateZoomStub.calledTwice, "Bar chart point, non-shift key: Updated zoom");
    assert.true(setCountStub.calledTwice, "Bar chart point, non-shift key: Updated count");
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
    tool.onMouseClick(ev, null, imagePos);
    assert.deepEqual(dataset._dataPoints[1], expectedPoint, "Bar chart point, shift key, other metadata exists: Added");
    assert.true(drawPointStub.calledWith(imagePos, dataset.colorRGB.toRGBString()), "Bar chart point, shift key, other metadata exists: Drawn");
    assert.true(updateZoomStub.calledThrice, "Bar chart point, shift key, other metadata exists: Updated zoom");
    assert.true(setCountStub.calledThrice, "Bar chart point, shift key, other metadata exists: Updated count");
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

    const expectedEventArgs = [
        "wpd.dataset.point.delete",
        {
            axes: axes,
            dataset: dataset,
            index: 0
        }
    ];

    tool.onMouseClick(null, null, {
        x: 0,
        y: 1
    });
    assert.true(resetStub.calledOnce, "Graphics reset");
    assert.true(repaintStub.calledOnce, "Repainted");
    assert.true(updateZoomStub.calledOnce, "Updated zoom");
    assert.true(setCountStub.calledOnce, "Updated count");
    assert.true(dispatchStub.calledWith(...expectedEventArgs), "Dispatched point delete event");
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