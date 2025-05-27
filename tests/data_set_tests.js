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
        _groupNames: [],
        _tuples: [],
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

QUnit.test("Point groups", (assert) => {
    const dataset = new wpd.Dataset(1);

    let expected = ["hello", "there"];

    // set point groups
    dataset.setPointGroups(expected);
    assert.deepEqual(dataset._groupNames, expected, "Point groups set");

    // get point groups
    assert.deepEqual(dataset.getPointGroups(), expected, "Point group get");

    // has point groups
    assert.true(dataset.hasPointGroups(), "Point group has");

    // get group index at
    dataset._tuples = [
        [0, 1]
    ];
    assert.equal(dataset.getPointGroupIndexInTuple(0, 1), 1, "Get point group index at tuple index");

    // get pixel indexes in group
    dataset._tuples = [
        [0, 1],
        [1, 2]
    ];
    expected = [0, 1];
    assert.deepEqual(dataset.getPixelIndexesInGroup(0), expected, "Get point indexes in group");
});

QUnit.test("Tuples", (assert) => {
    const dataset = new wpd.Dataset(1);

    dataset._groupNames = ["hello", "there"];

    let expected;

    // add tuple
    expected = [
        [0, null],
    ];
    dataset.addTuple(0);
    assert.deepEqual(dataset._tuples, expected, "Add tuple");

    // add tuple no duplicate
    dataset.addTuple(0);
    assert.deepEqual(dataset._tuples, expected, "Add tuple: no duplicate");

    // add empty tuple
    expected = [
        [0, null],
        [null, null],
    ];
    dataset.addEmptyTupleAt(1);
    assert.deepEqual(dataset._tuples, expected, "Add empty tuple");

    // add empty tuple no duplicate
    dataset.addEmptyTupleAt(1);
    assert.deepEqual(dataset._tuples, expected, "Add empty tuple: no duplicate");

    // add to tuple at
    expected = [
        [0, 1],
        [null, null],
    ];
    dataset.addToTupleAt(0, 1, 1);
    assert.deepEqual(dataset._tuples, expected, "Add point to tuple");

    // add to tuple at no duplicate
    dataset.addToTupleAt(0, 1, 1);
    assert.deepEqual(dataset._tuples, expected, "Add point to tuple: no duplicate");

    // remove tuple
    expected = [
        [0, 1]
    ];
    dataset.removeTuple(1);
    assert.deepEqual(dataset._tuples, expected, "Tuple removed: found");

    // remove tuple not found
    dataset.removeTuple(1);
    assert.deepEqual(dataset._tuples, expected, "Tuple removed: not found");

    // remove from tuple at
    expected = [
        [0, null]
    ];
    dataset.removeFromTupleAt(0, 1);
    assert.deepEqual(dataset._tuples, expected, "Remove point from tuple: found");

    // remove from tuple at not found
    dataset.removeFromTupleAt(0, 2);
    assert.deepEqual(dataset._tuples, expected, "Remove point from tuple: not found");

    // get tuple index found
    assert.equal(dataset.getTupleIndex(0), 0, "Get tuple index: found");

    // get tuple index not found
    assert.equal(dataset.getTupleIndex(1), -1, "Get tuple index: not found");

    // get tuple
    assert.deepEqual(dataset.getTuple(0), expected[0], "Get tuple");

    // get all tuples
    assert.deepEqual(dataset.getAllTuples(), expected, "Get all tuples");

    // is tuple empty false
    assert.false(dataset.isTupleEmpty(0), "Is tuple empty: false");

    // is tuple empty true
    dataset.addEmptyTupleAt(1);
    assert.true(dataset.isTupleEmpty(1), "Is tuple empty: true");

    // refresh tuples after pixel removal
    dataset._tuples = [
        [0, 1],
        [2, 3]
    ];
    expected = [
        [0, null],
        [1, 2]
    ];
    dataset.refreshTuplesAfterPixelRemoval(1);
    assert.deepEqual(dataset._tuples, expected, "Refresh tuples after point removal");

    // refresh tuples after group add
    dataset._tuples = [
        [0, 1],
        [2, 3]
    ];
    expected = [
        [0, 1, null, null],
        [2, 3, null, null]
    ];
    dataset.refreshTuplesAfterGroupAdd(2);
    assert.deepEqual(dataset._tuples, expected, "Refresh tuples after group add");
});
