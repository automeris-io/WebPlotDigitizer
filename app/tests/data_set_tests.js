QUnit.module(
    "Data set tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Initialization", (assert) => {
    // create instance
    const dim = 1;
    const dataset = new wpd.Dataset(dim);
    const expected = {
        _dim: dim,
        _dataPoints: [],
        _connections: [],
        _selections: [],
        _pixelMetadataCount: 0,
        _pixelMetadataKeys: [],
        _metadata: {},
        name: 'Default Dataset',
        variableNames: ['x', 'y'],
        colorRGB: new wpd.Color(200, 0, 0)
    };

    // check properties
    assert.propEqual(Object.getOwnPropertyNames(dataset), Object.getOwnPropertyNames(expected), "Instance created with expected properties");

    // check default values
    assert.deepEqual(Object.values(dataset), Object.values(expected), "Instance created with default values");
});

QUnit.test("Add pixel", (assert) => {
    const dataset = new wpd.Dataset(1);

    // no metadata case
    let expected = {
        x: 0,
        y: 1,
        metadata: undefined
    };
    let index = dataset.addPixel(0, 1);
    assert.deepEqual(dataset._dataPoints[index], expected, "No metadata, pixel added");

    // metadata case
    const metadata = {
        hello: "there"
    };
    expected = {
        x: 2,
        y: 3,
        metadata: metadata
    };
    index = dataset.addPixel(2, 3, metadata);
    assert.deepEqual(dataset._dataPoints[index], expected, "With metadata, pixel added");
});

QUnit.test("Remove last pixel", (assert) => {
    const dataset = new wpd.Dataset(1);

    // set up dataset with a few pixels
    const a = {
        x: 0,
        y: 1,
        metadata: undefined
    };
    const b = {
        x: 2,
        y: 3,
        metadata: undefined
    };
    const c = {
        x: 3,
        y: 4,
        metadata: undefined
    };
    dataset._dataPoints = [a, b, c];

    // remove last pixel 1
    let index = dataset.removeLastPixel();
    assert.deepEqual(dataset._dataPoints, [a, b], "Removed last pixel once");

    // remove last pixel 2
    index = dataset.removeLastPixel();
    assert.deepEqual(dataset._dataPoints, [a], "Removed last pixel twice");
});

QUnit.test("Remove nearest pixel", (assert) => {
    const dataset = new wpd.Dataset(1);

    // set up dataset with a few pixels
    const a = {
        x: 0,
        y: 1,
        metadata: undefined
    };
    const b = {
        x: 2,
        y: 3,
        metadata: undefined
    };
    const c = {
        x: 3,
        y: 4,
        metadata: undefined
    };
    dataset._dataPoints = [a, b, c];

    // stub functions
    const findNearestPixelStub = sinon.stub(dataset, "findNearestPixel");

    // no pixel found for removal
    findNearestPixelStub.returns(-1);
    let index = dataset.removeNearestPixel();
    assert.equal(index, -1, "Returned -1");
    assert.deepEqual(dataset._dataPoints, [a, b, c], "Nothing removed");

    // pixel found for removal
    findNearestPixelStub.returns(1);
    index = dataset.removeNearestPixel();
    assert.equal(index, 1, "Returned 1");
    assert.deepEqual(dataset._dataPoints, [a, c], "Removed index 1");
});

QUnit.test("Get/Set metadata", (assert) => {
    const dataset = new wpd.Dataset(1);

    const expected = {
        hello: "there"
    };

    dataset.setMetadata(expected);

    // set
    assert.deepEqual(dataset._metadata, expected, "Metadata set");

    // get
    assert.deepEqual(dataset.getMetadata(), expected, "Metadata get");
});