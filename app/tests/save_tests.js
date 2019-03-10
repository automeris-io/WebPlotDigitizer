QUnit.module("Save/Resume Tests");
QUnit.test("Resume Version 3.x JSON", function(assert) {
    let done = assert.async();
    wpdtest.fetchJSON("files/wpd3_xy.json").then(data => {
        assert.equal(data.wpd.version[0], 3, "data has version 3");
        let plotData = new wpd.PlotData();
        plotData.deserialize(data);

        // start verifying data
        assert.equal(plotData.getAxesCount(), 1, "One axes calibration loaded");
        done();
    });
});

QUnit.test("Resume Version 4: Check Axes", function(assert) {    
    let checkAxes = function(plotData, assert, testLabelPrefix) {
        assert.equal(plotData.getAxesCount(), 6, testLabelPrefix + "6 axes calibrations loaded");
    };

    let done = assert.async();
    wpdtest.loadPlotData("files/wpd4.json").then(plotDataObjs => {
        checkAxes(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkAxes(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
        done();
    });
});

QUnit.test("Resume Version 4: Check Datasets", function(assert) {
    let checkDatasets = function(plotData, assert, testLabelPrefix) {
        assert.equal(plotData.getDatasetCount(), 6, testLabelPrefix + "6 datasets loaded");

        let expectedNames = ['xy data', 'bar data', 'polar data', 'ternary data', 'map data', 'image data'];
        let expectedAxesNames = ['xy axes', 'Bar', 'Polar', 'Ternary', 'Map', 'Image'];
        let expectedPointCounts = [144, 3, 3, 3, 0, 57];
        let datasets = plotData.getDatasets();
        for (let dsIdx = 0; dsIdx < datasets.length; dsIdx++) {
            let ds = datasets[dsIdx];
            let axes = plotData.getAxesForDataset(ds);
            assert.equal(ds.getCount(), expectedPointCounts[dsIdx], testLabelPrefix + "Number of points in dataset " + (dsIdx + 1));
            assert.equal(ds.name, expectedNames[dsIdx], testLabelPrefix + "Dataset name of dataset " + (dsIdx + 1));
            assert.equal(axes.name, expectedAxesNames[dsIdx], testLabelPrefix + "Dataset axes name of dataset " + (dsIdx + 1));
        }
    };

    let done = assert.async();
    wpdtest.loadPlotData("files/wpd4.json").then(plotDataObjs => {
        checkDatasets(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkDatasets(plotDataObjs.plotData, assert, "Serialize then deserialize: ");
        done();
    });
});

QUnit.test("Save Version 4 JSON", function(assert) {
    // resume, then save, then resume again?
    assert.ok(true);
});