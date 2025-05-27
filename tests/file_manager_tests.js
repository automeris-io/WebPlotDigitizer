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
    "File manager tests", {
        afterEach: () => {
            // restore mocks and fakes
            sinon.restore();
        }
    }
);

// helper function to create instance
const createInstance = () => {
    // stub document functions
    sinon
        .stub(document, "getElementsByClassName")
        .withArgs("paged")
        .returns([{
            hidden: null
        }]);

    sinon
        .stub(document, "getElementById")
        .withArgs("navSeparator")
        .returns({
            hidden: null
        });

    // create instance
    const fileManager = new wpd.FileManager();

    // qunit uses the stubbed document functions
    document.getElementsByClassName.restore();
    document.getElementById.restore();

    return fileManager;
};

// helper args
const args = {
    empty: [],
    single: [null],
    multiple: [null, null]
};

QUnit.test("Initialization", (assert) => {
    // put a spy in _hidePageInfo
    const hidePageInfoSpy = sinon.spy(wpd.FileManager.prototype, "_hidePageInfo");

    // create instance
    const fileManager = createInstance();

    // instantiation check
    assert.true(!!fileManager, "Created instance");

    // page info elements hide check
    assert.true(hidePageInfoSpy.calledOnce, "Page info hidden");
});

QUnit.test("Setting files", (assert) => {
    // create instance
    const fileManager = createInstance();

    // stub functions
    const initializeInputStub = sinon.stub(fileManager, "_initializeInput");
    const hideFileInfoStub = sinon.stub(fileManager, "_hideFileInfo");
    const showFileInfoStub = sinon.stub(fileManager, "_showFileInfo");

    // null case
    assert.throws(fileManager.set, "Null exception");

    // empty array case
    fileManager.set(args.empty);
    assert.equal(fileManager.files, args.empty, "Empty array: Files set");
    assert.true(initializeInputStub.calledOnce, "Empty array: Input initialized");
    assert.true(hideFileInfoStub.calledOnce && showFileInfoStub.notCalled, "Empty array: File info hidden");
    assert.true(fileManager.$navSeparator.hidden, "Empty array: Nav separator hidden");

    // single element array case
    fileManager.set(args.single);
    assert.equal(fileManager.files, args.single, "Single element array: Files set");
    assert.true(initializeInputStub.calledTwice, "Single element array: Input initialized");
    assert.true(hideFileInfoStub.calledTwice && showFileInfoStub.notCalled, "Single element array: File info hidden");
    assert.true(fileManager.$navSeparator.hidden, "Single element array: Nav separator hidden");

    // multiple element array case
    fileManager.set(args.multiple);
    assert.equal(fileManager.files, args.multiple, "Multiple element array: Files set");
    assert.true(initializeInputStub.calledThrice, "Multiple element array: Input initialized");
    assert.true(hideFileInfoStub.calledTwice && showFileInfoStub.calledOnce, "Multiple element array: File info displayed");
});

QUnit.test("Updating page info", (assert) => {
    // create instance
    const fileManager = createInstance();

    // stub functions
    const isMultipageStub = sinon.stub(wpd.appData, "isMultipage");
    const hidePageInfoStub = sinon.stub(wpd.FileManager.prototype, "_hidePageInfo");
    const showPageInfoStub = sinon.stub(wpd.FileManager.prototype, "_showPageInfo");

    // single page case
    isMultipageStub.returns(false);
    fileManager.refreshPageInfo();
    assert.true(hidePageInfoStub.calledOnce && showPageInfoStub.notCalled && fileManager.$navSeparator.hidden, "Page info hidden on single page image");

    // multiple page single file case
    isMultipageStub.returns(true);
    fileManager.files = args.single;
    fileManager.refreshPageInfo();
    assert.true(hidePageInfoStub.calledOnce && showPageInfoStub.calledOnce && fileManager.$navSeparator.hidden, "Page info hidden on multiple page image with single file");

    // multiple page multiple file case
    isMultipageStub.returns(true);
    fileManager.files = args.multiple;
    fileManager.refreshPageInfo();
    assert.true(hidePageInfoStub.calledOnce && showPageInfoStub.calledTwice && !fileManager.$navSeparator.hidden, "Page info hidden on multiple page image with multiple files");
});

QUnit.test("Save/Load page manager", (assert) => {
    // create instance
    const fileManager = createInstance();

    // stub functions
    const getPageManagerStub = sinon.stub(wpd.appData, "getPageManager");
    const setPageManagerStub = sinon.stub(wpd.appData, "setPageManager");

    // not saving
    fileManager.currentIndex = 0;
    fileManager.pageManagers = {
        0: true
    };
    getPageManagerStub.returns(true);
    fileManager._savePageManager();
    assert.true(getPageManagerStub.calledOnce, "Saving: Page manager exists");

    // saving
    fileManager.currentIndex = 0;
    fileManager.pageManagers = {};
    getPageManagerStub.returns(true);
    fileManager._savePageManager();
    assert.true(getPageManagerStub.calledTwice && fileManager.pageManagers[0], "Saving: Page manager saved");

    // not loading
    fileManager.pageManagers = {};
    fileManager._loadPageManager(0);
    assert.true(setPageManagerStub.calledOnce && setPageManagerStub.calledWith(null), "Loading: Page manager does not exist");

    // loading
    const refreshInputStub = sinon.spy();
    fileManager.pageManagers = {
        0: {
            refreshInput: refreshInputStub
        }
    };
    fileManager._loadPageManager(0);
    assert.true(setPageManagerStub.calledTwice && refreshInputStub.calledOnce, "Loading: Page manager loaded");
});

QUnit.test("Save/Load undo manager", (assert) => {
    // create instance
    const fileManager = createInstance();

    // stub functions
    const getMultipageUndoManagerStub = sinon.stub(wpd.appData, "getMultipageUndoManager");
    const getUndoManagerStub = sinon.stub(wpd.appData, "getUndoManager");
    const setUndoManagerStub = sinon.stub(wpd.appData, "setUndoManager");

    // not saving
    fileManager.currentIndex = 0;
    fileManager.pageManagers = {
        0: false
    };
    fileManager.undoManagers = {};
    getUndoManagerStub.returns({
        canUndo: () => false,
        canRedo: () => false
    });
    fileManager._saveUndoManager();
    assert.true(getUndoManagerStub.calledOnce && !fileManager.undoManagers[0], "Saving: Undo manager null");

    // single page saving
    fileManager.currentIndex = 0;
    fileManager.pageManagers = {
        0: false
    };
    fileManager.undoManagers = {};
    getUndoManagerStub.returns({
        canUndo: () => true,
        canRedo: () => true
    });
    fileManager._saveUndoManager();
    assert.true(getUndoManagerStub.calledTwice && !!fileManager.undoManagers[0], "Saving: Undo manager not null, single page image");

    // multiple page saving
    fileManager.currentIndex = 0;
    fileManager.pageManagers = {
        0: true
    };
    fileManager.undoManagers = {};
    getMultipageUndoManagerStub.returns(true);
    fileManager._saveUndoManager();
    assert.true(getMultipageUndoManagerStub.calledOnce && fileManager.undoManagers[0], "Saving: Undo manager not null, multiple page image");

    // not loading
    fileManager.undoManagers = {};
    fileManager._loadUndoManager(0);
    assert.true(setUndoManagerStub.calledOnce && setUndoManagerStub.calledWith(null), "Loading: Undo manager does not exist");

    // loading
    fileManager.undoManagers = {
        0: true
    };
    fileManager._loadUndoManager(0);
    assert.true(setUndoManagerStub.calledTwice && setUndoManagerStub.calledWith(true), "Loading: Undo manager loaded");
});

QUnit.test("Get metadata for JSON", (assert) => {
    // create instance
    const fileManager = createInstance();

    // stub functions
    sinon.stub(fileManager, "_savePageManager");
    const getMeasurementCollStub = sinon.stub(wpd.PlotData.prototype, "getMeasurementColl");
    const getAxesNameMapStub = sinon.stub(fileManager, "getAxesNameMap");
    const getDatasetNameMapStub = sinon.stub(fileManager, "getDatasetNameMap");
    const fileCountStub = sinon.stub(fileManager, "fileCount");

    // no metadata case
    assert.deepEqual(fileManager.getMetadata(), {}, "No metadata");

    // single file, single page case
    fileManager.pageManagers = {};
    getMeasurementCollStub.returns(["a"]);
    fileCountStub.returns(1);
    let expected = {};
    assert.deepEqual(fileManager.getMetadata(), expected, "Single file: Single page images");

    // single file, multiple page case
    fileManager.pageManagers = {
        0: {
            getAxesNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getDatasetNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getMeasurementPageMap: sinon.stub().returns({
                1: ["a"],
                2: ["b"]
            }),
            getPageLabelMap: sinon.stub().returns({
                1: "hello",
                2: "goodbye"
            }),
            getRotationMap: sinon.stub().returns({
                2: 180
            })
        }
    };
    getMeasurementCollStub.returns(["a", "b"]);
    fileCountStub.returns(1);
    expected = {
        page: {
            axes: {
                a: 1,
                b: 2
            },
            datasets: {
                a: 1,
                b: 2
            },
            measurements: [1, 2]
        },
        misc: {
            pageLabel: {
                0: {
                    1: "hello",
                    2: "goodbye"
                }
            },
            rotation: {
                0: {
                    2: 180
                }
            }
        }
    };
    assert.deepEqual(fileManager.getMetadata(), expected, "Single file: Multiple page images");

    // multiple files, single page case
    fileManager.pageManagers = {};
    fileManager.measurementsByFile = {
        0: ["a"],
        1: ["b", "c"]
    };
    getMeasurementCollStub.returns(["a", "b", "c"]);
    getAxesNameMapStub.returns({
        a: 0,
        b: 1
    });
    getDatasetNameMapStub.returns({
        a: 0,
        b: 1
    });
    fileCountStub.returns(2);
    expected = {
        file: {
            axes: {
                a: 0,
                b: 1
            },
            datasets: {
                a: 0,
                b: 1
            },
            measurements: [0, 1, 1]
        }
    };
    assert.deepEqual(fileManager.getMetadata(), expected, "Multiple files: Single page images");

    // multiple files, multiple page case
    fileManager.pageManagers = {
        0: {
            getAxesNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getDatasetNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getMeasurementPageMap: sinon.stub().returns({
                1: ["a"],
                2: ["b"]
            }),
            getPageLabelMap: sinon.stub().returns({
                1: "hello"
            }),
            getRotationMap: sinon.stub().returns({
                2: 90
            })
        },
        1: {
            getAxesNameMap: sinon.stub().returns({
                c: 1
            }),
            getDatasetNameMap: sinon.stub().returns({
                c: 1
            }),
            getMeasurementPageMap: sinon.stub().returns({
                1: ["c"]
            }),
            getPageLabelMap: sinon.stub().returns({
                1: "goodbye"
            }),
            getRotationMap: sinon.stub().returns({
                1: 270
            })
        }
    };
    fileManager.measurementsByFile = {
        0: ["a", "b"],
        1: ["c"]
    };
    getMeasurementCollStub.returns(["a", "b", "c"]);
    getAxesNameMapStub.returns({
        a: 0,
        b: 0,
        c: 1
    });
    getDatasetNameMapStub.returns({
        a: 0,
        b: 0,
        c: 1
    });
    fileCountStub.returns(2);
    expected = {
        file: {
            axes: {
                a: 0,
                b: 0,
                c: 1
            },
            datasets: {
                a: 0,
                b: 0,
                c: 1
            },
            measurements: [0, 0, 1]
        },
        page: {
            axes: {
                a: 1,
                b: 2,
                c: 1
            },
            datasets: {
                a: 1,
                b: 2,
                c: 1
            },
            measurements: [1, 2, 1]
        },
        misc: {
            pageLabel: {
                0: {
                    1: "hello"
                },
                1: {
                    1: "goodbye"
                }
            },
            rotation: {
                0: {
                    2: 90
                },
                1: {
                    1: 270
                }
            }
        }
    };
    assert.deepEqual(fileManager.getMetadata(), expected, "Multiple files: Multiple page images");

    // multiple files, mixed page case
    fileManager.pageManagers = {
        0: {
            getAxesNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getDatasetNameMap: sinon.stub().returns({
                a: 1,
                b: 2
            }),
            getMeasurementPageMap: sinon.stub().returns({
                1: ["a"],
                2: ["b"]
            }),
            getPageLabelMap: sinon.stub().returns({
                1: "hello"
            }),
            getRotationMap: sinon.stub().returns({
                1: 180
            })
        }
    };
    fileManager.measurementsByFile = {
        0: ["a", "b"],
        1: ["c"]
    };
    getMeasurementCollStub.returns(["a", "b", "c"]);
    getAxesNameMapStub.returns({
        a: 0,
        b: 0,
        c: 1
    });
    getDatasetNameMapStub.returns({
        a: 0,
        b: 0,
        c: 1
    });
    fileCountStub.returns(2);
    expected = {
        file: {
            axes: {
                a: 0,
                b: 0,
                c: 1
            },
            datasets: {
                a: 0,
                b: 0,
                c: 1
            },
            measurements: [0, 0, 1]
        },
        page: {
            axes: {
                a: 1,
                b: 2
            },
            datasets: {
                a: 1,
                b: 2
            },
            measurements: [1, 2, undefined]
        },
        misc: {
            pageLabel: {
                0: {
                    1: "hello"
                }
            },
            rotation: {
                0: {
                    1: 180
                }
            }
        }
    };
    assert.deepEqual(fileManager.getMetadata(), expected, "Multiple files: Mixed page images");
});

QUnit.test("Load metadata from JSON", async (assert) => {
    // create instance
    const fileManager = createInstance();

    // create async completion signals
    const functionDone1 = assert.async();
    const functionDone2 = assert.async();
    const functionDone3 = assert.async();
    const functionDone4 = assert.async();

    // set async timeout
    assert.timeout(500);

    // create fake files
    const png = new File([], "test.png", {
        type: "image/png"
    });
    const pdf = new File([], "test.pdf", {
        type: "application/pdf"
    });

    // stub functions
    sinon.stub(fileManager, "_initializeInput");
    sinon.stub(fileManager, "_hideFileInfo");
    sinon.stub(fileManager, "_showFileInfo");
    // define axes, datasets, and measurements for reference/clone checks
    let currentAxes = [];
    let currentDatasets = [];
    let currentMeasurements = [];
    const getPlotDataStub = sinon.stub(wpd.appData, "getPlotData").callsFake(() => {
        return {
            getAxesColl: () => currentAxes,
            getDatasets: () => currentDatasets,
            getMeasurementColl: () => currentMeasurements,
        };
    });
    // stub out pdfjsLib
    const pdfjsLibBackup = window.pdfjsLib;
    window.pdfjsLib = {
        getDocument: () => ({
            promise: new Promise((resolve) => {
                resolve();
            }),
        }),
    };
    // stub appData getPageManager
    const getPageManagerStub = sinon.stub(wpd.appData, "getPageManager").returns({
        loadPageData: sinon.spy(),
        refreshInput: () => {}
    });
    // stub tree refresh for ending assertions
    const treeRefreshStub = sinon.stub(wpd.tree, "refresh");
    // stub PDF manager initialization
    const pdfManagerStub = sinon.stub(wpd.imageManager, "initializePDFManager").returns({
        loadPageData: sinon.spy(),
        refreshInput: () => {}
    });

    // single file, single page case
    let metadata = {};
    let expected = {};
    fileManager.set([png]);
    // ends test by calling functionDone
    treeRefreshStub.callsFake(() => {
        functionDone1();
    });
    await fileManager.loadMetadata(metadata);
    assert.notEqual(fileManager.axesByFile['0'], currentAxes, "Axes cloned not referenced");
    assert.notEqual(fileManager.datasetsByFile['0'], currentDatasets, "Datasets cloned not referenced");
    assert.notEqual(fileManager.measurementsByFile['0'], currentMeasurements, "Measurements cloned not referenced");
    assert.deepEqual(fileManager.pageManagers, {}, "Single file, single page: Page manager not stored");

    // single file, multiple pages case
    currentAxes = ["axes_1", "axes_2", "axes_3"];
    currentDatasets = ["dataset_1", "dataset_2"];
    currentMeasurements = ["measurement_1"];
    metadata = {
        page: {
            axes: {
                1: ["axes_1", "axes_2"],
                2: ["axes_3"]
            },
            datasets: {
                1: ["dataset_1"],
                2: ["dataset_2"]
            },
            measurements: {
                1: ["measurement_1"]
            }
        }
    };
    expected = metadata.page;
    fileManager.set([pdf]);
    // ends test by calling functionDone
    treeRefreshStub.callsFake(function() {
        functionDone2();
    });
    await fileManager.loadMetadata(metadata);
    assert.deepEqual(fileManager.pageManagers['0'].loadPageData.args[0][0], expected, "Single file, multiple pages: Page manager stored");

    // multiple files, multiple pages case
    metadata = {
        file: {
            axes: {
                0: ["axes_1", "axes_2"],
                1: ["axes_3"]
            },
            datasets: {
                0: ["dataset_1"],
                1: ["dataset_2"]
            },
            measurements: {
                0: ["measurement_1"]
            }
        },
        page: {
            axes: {
                1: ["axes_1", "axes_3"],
                2: ["axes_2"]
            },
            datasets: {
                1: ["dataset_1", "dataset_2"]
            },
            measurements: {
                2: ["measurement_1"]
            }
        }
    };
    expected1 = {
        axes: {
            1: ["axes_1"],
            2: ["axes_2"]
        },
        datasets: {
            1: ["dataset_1"]
        },
        measurements: {
            2: ["measurement_1"]
        }
    };
    expected2 = {
        axes: {
            1: ["axes_3"],
            2: []
        },
        datasets: {
            1: ["dataset_2"]
        },
        measurements: {
            2: []
        }
    };
    fileManager.set([pdf, pdf]);
    // ends test by calling functionDone
    treeRefreshStub.callsFake(function() {
        functionDone3();
    });
    await fileManager.loadMetadata(metadata);
    assert.deepEqual(fileManager.pageManagers['0'].loadPageData.args[1][0], expected1, "Multiple files, multiple pages: Page manager 1 stored");
    assert.deepEqual(fileManager.pageManagers['1'].loadPageData.args[0][0], expected2, "Multiple files, multiple pages: Page manager 2 stored");

    // multiple files, mixed pages case
    metadata = {
        file: {
            axes: {
                0: ["axes_1", "axes_2"],
                1: ["axes_3"],
                2: ["axes_4"]
            },
            datasets: {
                0: ["dataset_1"],
                1: ["dataset_2"],
                2: ["dataset_3"]
            },
            measurements: {
                0: ["measurement_1"],
                2: ["measurement_2"]
            }
        },
        page: {
            axes: {
                1: ["axes_1", "axes_3"],
                2: ["axes_2"]
            },
            datasets: {
                1: ["dataset_1", "dataset_2"]
            },
            measurements: {
                2: ["measurement_1"]
            }
        }
    };
    expected1 = {
        axes: {
            1: ["axes_1"],
            2: ["axes_2"]
        },
        datasets: {
            1: ["dataset_1"]
        },
        measurements: {
            2: ["measurement_1"]
        }
    };
    expected2 = {
        axes: {
            1: ["axes_3"],
            2: []
        },
        datasets: {
            1: ["dataset_2"]
        },
        measurements: {
            2: []
        }
    };
    fileManager.set([pdf, pdf, png]);
    // ends test by calling functionDone
    treeRefreshStub.callsFake(function() {
        functionDone4();
    });
    await fileManager.loadMetadata(metadata);
    assert.deepEqual(fileManager.pageManagers['0'].loadPageData.args[2][0], expected1, "Multiple files, mixed pages: Page manager 1 stored");
    assert.deepEqual(fileManager.pageManagers['1'].loadPageData.args[1][0], expected2, "Multiple files, mixed pages: Page manager 2 stored");
    assert.equal(fileManager.pageManagers['2'], undefined, "Multiple files, mixed pages: Page manager 3 not stored");

    // revert pdfjsLib
    window.pdfjsLib = pdfjsLibBackup;
});
