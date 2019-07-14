QUnit.module("Save/Resume Tests");
QUnit.test("Resume Version 3.x JSON", function(assert) {
    let checkAxes = function(plotData, assert, testLabelPrefix) {
        assert.equal(plotData.getAxesCount(), 1, testLabelPrefix + "One axes calibration loaded");
    };

    let done = assert.async();
    wpdtest.loadPlotData("files/wpd3_xy.json").then(plotDataObjs => {
        checkAxes(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkAxes(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
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
        checkDatasets(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
        done();
    });
});

QUnit.test("Resume Version 4.2 with masks", function(assert) {
    let checkAxes = function(plotData, assert, testLabelPrefix) {
        assert.equal(plotData.getAxesCount(), 6, testLabelPrefix + "6 axes calibrations loaded");
    };
    let checkDatasets = function(plotData, assert, testLabelPrefix) {
        assert.equal(plotData.getDatasetCount(), 6, testLabelPrefix + "6 datasets loaded");

        let expectedNames = ['xy data', 'bar data', 'polar data', 'ternary data', 'map data', 'image data'];
        let expectedAxesNames = ['xy axes', 'Bar', 'Polar', 'Ternary', 'Map', 'Image'];
        let expectedPointCounts = [143, 3, 3, 3, 0, 57];
        let datasets = plotData.getDatasets();
        for (let dsIdx = 0; dsIdx < datasets.length; dsIdx++) {
            let ds = datasets[dsIdx];
            let axes = plotData.getAxesForDataset(ds);
            assert.equal(ds.getCount(), expectedPointCounts[dsIdx], testLabelPrefix + "Number of points in dataset " + (dsIdx + 1));
            assert.equal(ds.name, expectedNames[dsIdx], testLabelPrefix + "Dataset name of dataset " + (dsIdx + 1));
            assert.equal(axes.name, expectedAxesNames[dsIdx], testLabelPrefix + "Dataset axes name of dataset " + (dsIdx + 1));
        }

        // Check an autodetection object
        let autodetection1 = plotData.getAutoDetectionDataForDataset(datasets[0]);
        assert.equal(autodetection1.mask.size, 264662, testLabelPrefix + "Check mask size for 1st dataset");
        let autodetection2 = plotData.getAutoDetectionDataForDataset(datasets[5]);
        assert.equal(autodetection2.mask.size, 14710, testLabelPrefix + "Check mask size for 6th dataset");
    };
    let checkMeasurements = function(plotData, assert, testLabelPrefix) {
        // distance
        let distanceMeasurements = plotData.getMeasurementsByType(wpd.DistanceMeasurement);
        assert.equal(distanceMeasurements.length, 1, testLabelPrefix + "Number of distance measurements");
        assert.equal(distanceMeasurements[0].connectionCount(), 1, testLabelPrefix + "Number of distances");
        let axes = plotData.getAxesForMeasurement(distanceMeasurements[0]);
        assert.equal(axes.pixelToDataDistance(distanceMeasurements[0].getDistance(0)), 5.969022081900202, testLabelPrefix + "Distance value");

        // angle
        let angleMeasurements = plotData.getMeasurementsByType(wpd.AngleMeasurement);
        assert.equal(angleMeasurements.length, 1, testLabelPrefix + "Number of angle measurements");
        assert.equal(angleMeasurements[0].connectionCount(), 1, testLabelPrefix + "Number of angles");
        assert.equal(angleMeasurements[0].getAngle(0), 45.01999740464475, testLabelPrefix + "Angle value");

        // area/perimeter
        let areaMeasurements = plotData.getMeasurementsByType(wpd.AreaMeasurement);
        assert.equal(areaMeasurements.length, 1, testLabelPrefix + "Number of area measurements");
        assert.equal(areaMeasurements[0].connectionCount(), 1, testLabelPrefix + "Number of areas");
        axes = plotData.getAxesForMeasurement(areaMeasurements[0]);
        assert.equal(axes.pixelToDataDistance(areaMeasurements[0].getPerimeter(0)), 22.18065208060926, testLabelPrefix + "Perimeter value");
        assert.equal(axes.pixelToDataArea(areaMeasurements[0].getArea(0)), 30.245012069196335, testLabelPrefix + "Area value");

    };
    let done = assert.async();
    wpdtest.loadPlotData("files/wpd4_2_with_masks.json").then(plotDataObjs => {
        checkAxes(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkAxes(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
        checkDatasets(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkDatasets(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
        checkMeasurements(plotDataObjs.plotData, assert, "Deserialize from JSON: ");
        checkMeasurements(plotDataObjs.plotData2, assert, "Serialize then deserialize: ");
        done();
    });
});