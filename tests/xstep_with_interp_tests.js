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
    algo.setParams({
        xmin: 0,
        delx: 1,
        xmax: 100,
        ymin: 0,
        ymax: 10,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple Linear XY");

    // Apply on just a small window    
    algo.setParams({
        xmin: 10,
        delx: 2,
        xmax: 40,
        ymin: 0,
        ymax: 10,
        smoothing: 0
    });

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

    algo.setParams({
        xmin: 10,
        delx: 2,
        xmax: 40,
        ymin: 0,
        ymax: 10,
        smoothing: 0
    });
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
    algo.setParams({
        xmin: -100,
        delx: 1,
        xmax: 0,
        ymin: -10,
        ymax: 0,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple Linear XY");

    // Apply on just a small window    
    algo.setParams({
        xmin: -40,
        delx: 2,
        xmax: -10,
        ymin: -10,
        ymax: 0,
        smoothing: 0
    });
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

    algo.setParams({
        xmin: -40,
        delx: 2,
        xmax: -10,
        ymin: -10,
        ymax: 0,
        smoothing: 0
    });
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
    algo.setParams({
        xmin: 1e-5,
        delx: 10,
        xmax: 10,
        ymin: 0,
        ymax: 10,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 7, "Simple log scale in X direction");
});

// log scale
QUnit.test("Log scale in negative X direction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "-1e-5", "0"); // X1 = 1e-5 at (0, 99)px
    calib.addPoint(99, 99, "-10", "0"); // X2 = 10 at (99, 99)px
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

    for (let x = -1e-5; x >= -10; x *= 10) { // jump pixels as this algo can interpolate
        let y = dataFn(x);
        let pix = xyaxes.dataToPixel(x, y);
        let img_index = parseInt(pix.y, 10) * 100 + parseInt(pix.x, 10);
        autodetection.binaryData.add(img_index);
    }

    // X step w/ Interpolation
    let algo = new wpd.XStepWithInterpolationAlgo();
    algo.setParams({
        xmin: -10,
        delx: -10,
        xmax: -1e-5,
        ymin: 0,
        ymax: 10,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 4, "Simple log scale in negative X direction");
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
    algo.setParams({
        xmin: 0,
        delx: 1,
        xmax: 100,
        ymin: 1e-5,
        ymax: 1000,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple log scale in Y direction");
});

QUnit.test("Log scale in negative Y direction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "-1e-5"); // Y1 = -1e-5 at (0, 99)px
    calib.addPoint(0, 0, "0", "-1000"); // Y2 = -1000 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, true);

    // Given autodetection object with some pre-defined data using a function
    let dataFn = function(x) {
        return -Math.pow(10, 2 * Math.sin(x));
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
    algo.setParams({
        xmin: 0,
        delx: 1,
        xmax: 100,
        ymin: -1000,
        ymax: -1e-5,
        smoothing: 0
    });

    let ds = new wpd.Dataset();

    algo.run(autodetection, ds, xyaxes);
    assert.equal(ds.getCount(), 101, "Simple log scale in negative Y direction");
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
    algo.setParams({
        xmin: 0,
        delx: 1,
        xmax: 100,
        ymin: Math.pow(2, -5),
        ymax: Math.pow(2, 3),
        smoothing: 0
    });

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
