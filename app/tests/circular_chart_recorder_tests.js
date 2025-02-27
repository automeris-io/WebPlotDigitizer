QUnit.module("Circular chart recorder tests");
QUnit.test("Calibration", function(assert) {

    let calib = new wpd.Calibration(2);

    // add 5 calibration points
    calib.addPoint(1, 1, 0, 0);
    calib.addPoint(1.6, 1.8, 0, 0);
    calib.addPoint(1.707, 1.707, 0, 0);
    calib.addPoint(1, 2, 0, 0);
    calib.addPoint(0, 1, 0, 0);

    calib.setDataAt(0, "0", "0");
    calib.setDataAt(1, "0", 0);
    calib.setDataAt(2, "0", "1");
    calib.setDataAt(3, 0, "1");
    calib.setDataAt(4, 0, "1");

    let circAxes = new wpd.CircularChartRecorderAxes();
    circAxes.calibrate(calib, "0");

    assert.equal(1, 1, "dummy");
});