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

QUnit.module("Bar extraction algorithm tests");
QUnit.test("Linear axis, vertical", function(assert) {

    // calibrate bar axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 89, "0", "0"); // P1
    calib.addPoint(0, 0, "0", "20"); // P2
    let barAxes = new wpd.BarAxes();
    barAxes.calibrate(calib, false, false);
    let orientation = barAxes.getOrientation();
    assert.equal(orientation.axes, "Y", "Orientation axes");
    assert.equal(orientation.direction, "increasing", "Orientation direction");
    assert.equal(orientation.angle, 90, "Orientation angle");

    // create dummy data
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    // three bars, two positive, one negative
    for (let x = 10; x < 20; x++) {
        for (let y = 89; y >= 12; y--) {
            let index = y * 100 + x;
            autodetection.binaryData.add(index);
        }
    }

    for (let x = 30; x < 50; x++) {
        for (let y = 97; y >= 88; y--) {
            let index = y * 100 + x;
            autodetection.binaryData.add(index);
        }
    }

    for (let x = 60; x < 80; x++) {
        for (let y = 79; y >= 20; y--) {
            let index = y * 100 + x;
            autodetection.binaryData.add(index);
        }
    }

    let algo = new wpd.BarExtractionAlgo();
    algo.setParams({
        delX: 20,
        delVal: 1
    });
    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, barAxes);
    assert.equal(ds.getCount(), 3, "Dataset size");
    let pt1 = ds.getPixel(0);
    assert.equal(pt1.metadata["label"], "Bar0", "pt1 label");
    assert.equal(pt1.x, 15, "pt1 x");
    assert.equal(pt1.y, 12.5, "pt1 y");

    let pt2 = ds.getPixel(1);
    assert.equal(pt2.metadata["label"], "Bar1", "pt2 label");
    assert.equal(pt2.x, 40, "pt2 x");
    assert.equal(pt2.y, 97.5, "pt2 y");

    let pt3 = ds.getPixel(2);
    assert.equal(pt3.metadata["label"], "Bar2", "pt3 label");
    assert.equal(pt3.x, 70, "pt3 x");
    assert.equal(pt3.y, 20.5, "pt3 y");
});


QUnit.test("Linear axis, horizontal", function(assert) {

    // calibrate bar axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(10, 5, "0", "0"); // P1
    calib.addPoint(99, 5, "0", "20"); // P2
    let barAxes = new wpd.BarAxes();
    barAxes.calibrate(calib, false, false);
    let orientation = barAxes.getOrientation();
    assert.equal(orientation.axes, "X", "Orientation axes");
    assert.equal(orientation.direction, "increasing", "Orientation direction");
    assert.equal(orientation.angle, 0, "Orientation angle");

    // create dummy data
    let autodetection = new wpd.AutoDetectionData();
    autodetection.imageHeight = 100;
    autodetection.imageWidth = 100;
    autodetection.binaryData = new Set();

    // two bars, one positive, one negative
    for (let y = 10; y < 20; y++) {
        for (let x = 5; x <= 12; x++) {
            let index = y * 100 + x;
            autodetection.binaryData.add(index);
        }
    }

    for (let y = 30; y < 50; y++) {
        for (let x = 11; x <= 56; x++) {
            let index = y * 100 + x;
            autodetection.binaryData.add(index);
        }
    }

    let algo = new wpd.BarExtractionAlgo();
    algo.setParams({
        delX: 20,
        delVal: 1
    });
    let ds = new wpd.Dataset();
    algo.run(autodetection, ds, barAxes);
    assert.equal(ds.getCount(), 2, "Dataset size");
    let pt1 = ds.getPixel(0);
    assert.equal(pt1.metadata["label"], "Bar0", "pt1 label");
    assert.equal(pt1.x, 5.5, "pt1 x");
    assert.equal(pt1.y, 15, "pt1 y");

    let pt2 = ds.getPixel(1);
    assert.equal(pt2.metadata["label"], "Bar1", "pt2 label");
    assert.equal(pt2.x, 56.5, "pt2 x");
    assert.equal(pt2.y, 40, "pt2 y");
});
