QUnit.module("Circular chart recorder tests");
QUnit.test("Calibration", function(assert) {

    let calib = new wpd.Calibration(2);
    // add 5 calibration points

    let circAxes = wpd.CircularChartRecorder();
    circAxes.calibrate(calib);

    assert.equal(1, 1, "dummy");
});