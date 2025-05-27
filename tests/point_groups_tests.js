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
    "Point groups tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

QUnit.test("Show settings popup", (assert) => {
    const count = 3;

    // stubs
    sinon.stub(wpd.popup, "show");
    sinon.stub(document, "querySelector").returns({});
    const getDatasetStub = sinon.stub(wpd.tree, "getActiveDataset");
    const addRowStub = sinon.stub(wpd.pointGroups, "addSettingsRow");

    // no rows to add
    getDatasetStub.returns({
        getPointGroups: () => []
    });
    wpd.pointGroups.showSettingsPopup();
    assert.true(addRowStub.notCalled, "No rows added");

    // 2 rows to add
    getDatasetStub.returns({
        getPointGroups: () => Array(count).fill(null)
    });
    wpd.pointGroups.showSettingsPopup();
    assert.true(addRowStub.calledTwice, "Two rows added");
});

QUnit.test("Save settings", (assert) => {
    const dataset = new wpd.Dataset(1);

    // stubs
    sinon.stub(wpd.tree, "getActiveDataset").returns(dataset);
    const selectorStub = sinon.stub(document, "querySelector").returns({
        children: [{
            querySelector: () => ({
                value: ""
            })
        }]
    });
    const hideControlsStub = sinon.stub(wpd.pointGroups, "hideControls");
    const showControlsStub = sinon.stub(wpd.pointGroups, "showControls");
    const refreshControlsStub = sinon.stub(wpd.pointGroups, "refreshControls");
    const closeSettingsStub = sinon.stub(wpd.pointGroups, "closeSettingsPopup");
    const refreshTuplesStub = sinon.stub(dataset, "refreshTuplesAfterGroupAdd");
    const removePointGroupFromTuplesStub = sinon.stub(dataset, "removePointGroupFromTuples");

    // one group, no custom name, no additions, no deletions
    let expected = [];
    wpd.pointGroups.saveSettings();
    assert.true(hideControlsStub.called, "One group, no custom name, no additions, no deletions: Hide controls");
    assert.true(showControlsStub.notCalled, "One group, no custom name, no additions, no deletions: No show controls");
    assert.true(refreshTuplesStub.notCalled, "One group, no custom name, no additions, no deletions: No tuple refresh");
    assert.deepEqual(dataset._groupNames, expected, "One group, no custom name, no additions, no deletions: Group names set");
    assert.true(removePointGroupFromTuplesStub.notCalled, "One group, no custom name, no additions, no deletions: No groups removed from tuples");
    assert.true(refreshControlsStub.called, "One group, no custom name, no additions, no deletions: Refresh controls");
    assert.true(closeSettingsStub.called, "One group, no custom name, no additions, no deletions: Closed settings popup");
    hideControlsStub.resetHistory();
    showControlsStub.resetHistory();
    refreshTuplesStub.resetHistory();
    refreshControlsStub.resetHistory();
    closeSettingsStub.resetHistory();
    removePointGroupFromTuplesStub.resetHistory();

    // one group, custom name, additions, no deletions
    selectorStub.returns({
        children: [{
            querySelector: () => ({
                value: "hello"
            })
        }]
    });
    expected = ["hello"];
    wpd.pointGroups.saveSettings();
    assert.true(hideControlsStub.called, "One group, custom name, additions, no deletions: Hide controls");
    assert.true(showControlsStub.notCalled, "One group, custom name, additions, no deletions: No show controls");
    assert.true(refreshTuplesStub.called, "One group, custom name, additions, no deletions: Tuple refresh");
    assert.deepEqual(dataset._groupNames, expected, "One group, custom name, additions, no deletions: Group names set");
    assert.true(removePointGroupFromTuplesStub.notCalled, "One group, no custom name, no additions, no deletions: No groups removed from tuples");
    assert.true(refreshControlsStub.called, "One group, custom name, additions, no deletions: Refresh controls");
    assert.true(closeSettingsStub.called, "One group, custom name, additions, no deletions: Closed settings popup");
    hideControlsStub.resetHistory();
    showControlsStub.resetHistory();
    refreshTuplesStub.resetHistory();
    refreshControlsStub.resetHistory();
    closeSettingsStub.resetHistory();
    removePointGroupFromTuplesStub.resetHistory();


    // muliple groups, additions, no deletions
    selectorStub.returns({
        children: [{
                querySelector: () => ({
                    value: "hello"
                })
            },
            {
                querySelector: () => ({
                    value: "there"
                })
            }
        ]
    });
    expected = ["hello", "there"];
    wpd.pointGroups.saveSettings();
    assert.true(hideControlsStub.notCalled, "Muliple groups, additions, no deletions: No hide controls");
    assert.true(showControlsStub.called, "Muliple groups, additions, no deletions: Show controls");
    assert.true(refreshTuplesStub.called, "Muliple groups, additions, no deletions: Tuple refresh");
    assert.deepEqual(dataset._groupNames, expected, "Muliple groups, additions, no deletions: Group names set");
    assert.true(removePointGroupFromTuplesStub.notCalled, "One group, no custom name, no additions, no deletions: No groups removed from tuples");
    assert.true(refreshControlsStub.called, "Muliple groups, additions, no deletions: Refresh controls");
    assert.true(closeSettingsStub.called, "Muliple groups, additions, no deletions: Closed settings popup");
    hideControlsStub.resetHistory();
    showControlsStub.resetHistory();
    refreshTuplesStub.resetHistory();
    refreshControlsStub.resetHistory();
    closeSettingsStub.resetHistory();
    removePointGroupFromTuplesStub.resetHistory();

    // one group, custom name, additions, deletions
    selectorStub.returns({
        children: [{
            querySelector: () => ({
                value: "hello"
            }),
            children: [{
                    querySelector: () => ({
                        innerText: 0
                    })
                },
                {
                    querySelector: () => ({
                        setAttribute: () => {}
                    })
                },
            ],
            rowIndex: 0
        }]
    });
    let el = {
        closest: () => ({
            rowIndex: 1,
            remove: () => {},
        })
    };
    expected = ["hello"];
    // set up deletions
    dataset._groupNames = ["hello", "there"];
    wpd.pointGroups.deleteSettingsRow(el);
    sinon.stub(wpd.tree, "getActiveAxes");
    sinon.stub(wpd.graphicsWidget, "resetData");
    sinon.stub(wpd.graphicsWidget, "forceHandlerRepaint");
    sinon.stub(wpd.dataPointCounter, "setCount");
    const showDeleteStub = sinon.stub(wpd.pointGroups, "showDeleteGroupPopup").callsArg(0);
    wpd.pointGroups.saveSettings();
    assert.true(hideControlsStub.called, "One group, custom name, additions, deletions: Hide controls");
    assert.true(showControlsStub.notCalled, "One group, custom name, additions, deletions: No show controls");
    assert.true(refreshTuplesStub.notCalled, "One group, custom name, additions, deletions: No tuple refresh");
    assert.deepEqual(dataset._groupNames, expected, "One group, custom name, additions, deletions: Group names set");
    assert.true(removePointGroupFromTuplesStub.called, "One group, custom name, additions, deletions: Groups removed from tuples");
    assert.true(refreshControlsStub.called, "One group, custom name, additions, deletions: Refresh controls");
    assert.true(closeSettingsStub.called, "One group, custom name, additions, deletions: Closed settings popup");
    hideControlsStub.resetHistory();
    showControlsStub.resetHistory();
    refreshTuplesStub.resetHistory();
    refreshControlsStub.resetHistory();
    closeSettingsStub.resetHistory();
    removePointGroupFromTuplesStub.resetHistory();

    // multiple groups, custom name, additions, deletions
    selectorStub.returns({
        children: [{
                querySelector: () => ({
                    value: "hello"
                }),
                children: [{
                        querySelector: () => ({
                            innerText: 0
                        })
                    },
                    {
                        querySelector: () => ({
                            setAttribute: () => {}
                        })
                    },
                ],
                rowIndex: 0
            },
            {
                querySelector: () => ({
                    value: "there"
                }),
                children: [{
                        querySelector: () => ({
                            innerText: 1
                        })
                    },
                    {
                        querySelector: () => ({
                            setAttribute: () => {}
                        })
                    },
                ],
                rowIndex: 1
            }
        ]
    });
    el = {
        closest: () => ({
            rowIndex: 1,
            remove: () => {},
        })
    };
    expected = ["hello", "there"];
    // set up deletions
    dataset._groupNames = ["hello", "goodbye", "there"];
    wpd.pointGroups.deleteSettingsRow(el);
    showDeleteStub.callsArg(0);
    wpd.pointGroups.saveSettings();
    assert.true(hideControlsStub.notCalled, "One group, custom name, additions, deletions: No hide controls");
    assert.true(showControlsStub.called, "One group, custom name, additions, deletions: Show controls");
    assert.true(refreshTuplesStub.called, "One group, custom name, additions, deletions: Tuple refresh");
    assert.deepEqual(dataset._groupNames, expected, "One group, custom name, additions, deletions: Group names set");
    assert.true(removePointGroupFromTuplesStub.called, "One group, custom name, additions, deletions: Groups removed from tuples");
    assert.true(refreshControlsStub.called, "One group, custom name, additions, deletions: Refresh controls");
    assert.true(closeSettingsStub.called, "One group, custom name, additions, deletions: Closed settings popup");
    hideControlsStub.resetHistory();
    showControlsStub.resetHistory();
    refreshTuplesStub.resetHistory();
    refreshControlsStub.resetHistory();
    closeSettingsStub.resetHistory();
    removePointGroupFromTuplesStub.resetHistory();
});

QUnit.test("Next group", (assert) => {
    const dataset = new wpd.Dataset(1);

    // stubs
    sinon.stub(wpd.tree, "getActiveDataset").returns(dataset);
    const refreshControlsStub = sinon.stub(wpd.pointGroups, "refreshControls");

    // at new tuple
    dataset._tuples = [];
    wpd.pointGroups.setCurrentGroupIndex(0);
    wpd.pointGroups.setCurrentTupleIndex(null);
    wpd.pointGroups.nextGroup();
    assert.true(refreshControlsStub.called, "Controls refreshed");
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 0, "At new tuple: Group unchanged");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), null, "At new tuple: Tuple unchanged");

    // at created tuple
    dataset._tuples = [
        [0, null]
    ];
    wpd.pointGroups.setCurrentGroupIndex(0);
    wpd.pointGroups.setCurrentTupleIndex(0);
    wpd.pointGroups.nextGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 1, "Unfilled group in same tuple: Group updated");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), 0, "Unfilled group in same tuple: Tuple unchanged");

    // no unfilled groups
    dataset._tuples = [
        [0, 1]
    ];
    wpd.pointGroups.setCurrentGroupIndex(1);
    wpd.pointGroups.setCurrentTupleIndex(0);
    wpd.pointGroups.nextGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 0, "No unfilled groups: Group updated");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), null, "No unfilled groups: Tuple updated");

    // unfilled group in next tuple
    dataset._tuples = [
        [0, 1],
        [2, null]
    ];
    wpd.pointGroups.setCurrentGroupIndex(0);
    wpd.pointGroups.setCurrentTupleIndex(0);
    wpd.pointGroups.nextGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 1, "Unfilled group in next tuple: Group updated");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), 1, "Unfilled group in next tuple: Tuple updated");
});

QUnit.test("Previous group", (assert) => {
    const dataset = new wpd.Dataset(1);

    // stubs
    sinon.stub(wpd.tree, "getActiveDataset").returns(dataset);
    const refreshControlsStub = sinon.stub(wpd.pointGroups, "refreshControls");

    // at new tuple
    dataset._tuples = [];
    wpd.pointGroups.setCurrentGroupIndex(0);
    wpd.pointGroups.setCurrentTupleIndex(null);
    wpd.pointGroups.previousGroup();
    assert.true(refreshControlsStub.called, "Controls refreshed");
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 0, "At new tuple, no unfilled slots: Group unchanged");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), null, "At new tuple, no unfilled slots: Tuple unchanged");

    // at created tuple
    dataset._tuples = [
        [null, 0]
    ];
    wpd.pointGroups.setCurrentGroupIndex(1);
    wpd.pointGroups.setCurrentTupleIndex(0);
    wpd.pointGroups.previousGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 0, "Unfilled group in same tuple: Group updated");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), 0, "Unfilled group in same tuple: Tuple unchanged");

    // no unfilled groups
    dataset._tuples = [
        [0, 1]
    ];
    wpd.pointGroups.setCurrentGroupIndex(1);
    wpd.pointGroups.setCurrentTupleIndex(0);
    wpd.pointGroups.previousGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 1, "No unfilled groups: Group unchanged");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), 0, "No unfilled groups: Tuple unchanged");

    // unfilled group in previous tuple
    dataset._tuples = [
        [0, null],
        [2, 3]
    ];
    wpd.pointGroups.setCurrentGroupIndex(1);
    wpd.pointGroups.setCurrentTupleIndex(1);
    wpd.pointGroups.previousGroup();
    assert.equal(wpd.pointGroups.getCurrentGroupIndex(), 1, "Unfilled group in previous tuple: Group unchanged");
    assert.equal(wpd.pointGroups.getCurrentTupleIndex(), 0, "Unfilled group in previous tuple: Tuple updated");
});
