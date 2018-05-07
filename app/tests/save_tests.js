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

QUnit.test("Resume Version 4 JSON", function(assert) {
    let done = assert.async();
    wpdtest.fetchJSON("files/wpd4.json").then(data => {
        assert.equal(data.version[0], 4, "data has version 4");
        let plotData = new wpd.PlotData();
        plotData.deserialize(data);

        // start verifying data
        assert.equal(plotData.getAxesCount(), 6, "Six axes calibrations loaded");
        done();
    });
});

QUnit.test("Save Version 4 JSON", function(assert) {
    // resume, then save, then resume again?
    assert.ok(true);
});

