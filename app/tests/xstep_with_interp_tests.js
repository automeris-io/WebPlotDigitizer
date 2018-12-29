QUnit.module("X step with interpolation tests");
QUnit.test("Linear XY axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.sin(x) + 2;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 100; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParam(0, 0); // xmin
    algo.setParam(1, 1); // delx
    algo.setParam(2, 100); // xmax
    algo.setParam(3, 0); // ymin
    algo.setParam(4, 10); // ymax
    algo.setParam(5, 0); // smoothing

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple Linear XY");

    // Apply on just a small window
    algo.setParam(0, 10); // xmin
    algo.setParam(1, 2); // delx
    algo.setParam(2, 40); // xmax
    algo.setParam(3, 0); // ymin
    algo.setParam(4, 10); // ymax
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 16, "Simple Linear XY - Bounded with step size");

    // discontinuous sin(x) in a window with custom step size
    autodetection.binaryData = new Set();
    for (let x = 9; x <= 41; x += 2) { // jump pixels as this algo can interpolate, also make sure end point have data
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    algo.setParam(0, 10); // xmin
    algo.setParam(1, 2); // delx
    algo.setParam(2, 40); // xmax
    algo.setParam(3, 0); // ymin
    algo.setParam(4, 10); // ymax
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 16, "Simple Linear XY - Discontinuous sin(x)");
});

QUnit.test("Linear negative XY axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(99, 0, "0", "0"); // X1 = 0 at (99,0)px
    calib.addPoint(0, 0, "-100", "0"); // X2 = -100 at (0, 0)px
    calib.addPoint(99, 0, "0", "0"); // Y1 = 0 at (99,0)px
    calib.addPoint(99, 99, "0", "-10"); // Y2 = -10 at (99, 99)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.sin(x) - 3;
    };
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = -100; x <= 0; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParam(0, -100); // xmin
    algo.setParam(1, 1); // delx
    algo.setParam(2, 0); // xmax
    algo.setParam(3, -10); // ymin
    algo.setParam(4, 0); // ymax
    algo.setParam(5, 0); // smoothing

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple Linear XY");

    // Apply on just a small window
    algo.setParam(0, -40); // xmin
    algo.setParam(1, 2); // delx
    algo.setParam(2, -10); // xmax
    algo.setParam(3, -10); // ymin
    algo.setParam(4, 0); // ymax
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 16, "Simple Linear XY - Bounded with step size");

    // discontinuous sin(x) in a window with custom step size
    autodetection.binaryData = new Set();
    for (let x = -41; x <= -9; x += 2) { // jump pixels as this algo can interpolate, also make sure end point have data
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    algo.setParam(0, -40); // xmin
    algo.setParam(1, 2); // delx
    algo.setParam(2, -10); // xmax
    algo.setParam(3, -10); // ymin
    algo.setParam(4, 0); // ymax
    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 16, "Simple Linear XY - Discontinuous sin(x)");
});

// log scale
QUnit.test("Log scale in X direction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "1e-5", "0"); // X1 = 1e-5 at (0, 99)px
    calib.addPoint(99, 99, "10", "0"); // X2 = 10 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, false);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return 5;
    };

    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 1e-5; x <= 10; x *= 10) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParam(0, 1e-5); // xmin
    algo.setParam(1, 10); // delx
    algo.setParam(2, 10); // xmax
    algo.setParam(3, 0); // ymin
    algo.setParam(4, 10); // ymax
    algo.setParam(5, 0); // smoothing

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 7, "Simple log scale in X direction");
});

QUnit.test("Log scale in Y direction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "1e-5"); // Y1 = 1e-5 at (0, 99)px
    calib.addPoint(0, 0, "0", "1000"); // Y2 = 1000 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, true);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.pow(10, 2 * Math.sin(x));
    };

    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 100; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParam(0, 0); // xmin
    algo.setParam(1, 1); // delx
    algo.setParam(2, 100); // xmax
    algo.setParam(3, 1e-5); // ymin
    algo.setParam(4, 1000); // ymax
    algo.setParam(5, 0); // smoothing

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple log scale in Y direction");
});

QUnit.test("Log scale in Y direction, base 2", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", Math.pow(2, -5).toString()); // Y1 = 2^-5 at (0, 99)px
    calib.addPoint(0, 0, "0", Math.pow(2, 3).toString()); // Y2 = 2^3 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, true);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return Math.pow(2, 2 * Math.sin(x));
    };

    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    for (let x = 0; x <= 100; x += 1) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParam(0, 0); // xmin
    algo.setParam(1, 1); // delx
    algo.setParam(2, 100); // xmax
    algo.setParam(3, Math.pow(2, -5)); // ymin
    algo.setParam(4, Math.pow(2, 3)); // ymax
    algo.setParam(5, 0); // smoothing

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple log scale in Y direction");

    let totError = 0;
    for (let pi = 0; pi < ds.getCount(); pi++) {
        let px = ds.getPixel(pi);
        let data = xyaxes.pixelToData(px.x, px.y);
        totError += Math.abs(dataFn(data[0]) - data[1]);
    }
    totError /= ds.getCount();
    assert.ok(totError < 1, "total error less than 1")
});