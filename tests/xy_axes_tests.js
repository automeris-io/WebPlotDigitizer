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

QUnit.module("Axes tests: XY");

QUnit.test("Linear XY axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    let px = xyaxes.dataToPixel(50, 5);
    assert.ok(Math.abs(px.x - 99 / 2) < 1e-13, "dataToPixel, X");
    assert.ok(Math.abs(px.y - 99 / 2) < 1e-13, "dataToPixel, Y");

    let data = xyaxes.pixelToData(99 / 2, 99 / 2);
    assert.ok(Math.abs(data[0] - 50) < 1e-13, "pixelToData, X");
    assert.ok(Math.abs(data[1] - 5) < 1e-13, "pixelToData, Y");
});

QUnit.test("Linear XY axes, at 90 deg", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "10", "0"); // X2 = 10 at (0, 0)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "0", "100"); // Y2 = 100 at (99, 99)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false);

    let px = xyaxes.dataToPixel(5, 50);
    assert.ok(Math.abs(px.x - 99 / 2) < 1e-13, "dataToPixel, X");
    assert.ok(Math.abs(px.y - 99 / 2) < 1e-13, "dataToPixel, Y");

    let data = xyaxes.pixelToData(99 / 2, 99 / 2);
    assert.ok(Math.abs(data[1] - 50) < 1e-13, "pixelToData, X");
    assert.ok(Math.abs(data[0] - 5) < 1e-13, "pixelToData, Y");
});

QUnit.test("Linear XY axes, at 90 deg, no rotation correction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "10", "0"); // X2 = 10 at (0, 0)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "0", "100"); // Y2 = 100 at (99, 99)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false, true);

    let px = xyaxes.dataToPixel(5, 50);
    assert.ok(Math.abs(px.x - 99 / 2) < 1e-13, "dataToPixel, X");
    assert.ok(Math.abs(px.y - 99 / 2) < 1e-13, "dataToPixel, Y");

    let data = xyaxes.pixelToData(99 / 2, 99 / 2);
    assert.ok(Math.abs(data[1] - 50) < 1e-13, "pixelToData, X");
    assert.ok(Math.abs(data[0] - 5) < 1e-13, "pixelToData, Y");
});

QUnit.test("Linear XY axes, no rotation correction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "0", "0"); // X1 = 0 at (0, 99)px
    calib.addPoint(99, 99, "100", "0"); // X2 = 100 at (99, 99)px
    calib.addPoint(0, 99, "0", "0"); // Y1 = 0 at (0, 99)px
    calib.addPoint(0, 0, "0", "10"); // Y2 = 10 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, false, false, true);

    let px = xyaxes.dataToPixel(50, 5);
    assert.ok(Math.abs(px.x - 99 / 2) < 1e-13, "dataToPixel, X");
    assert.ok(Math.abs(px.y - 99 / 2) < 1e-13, "dataToPixel, Y");

    let data = xyaxes.pixelToData(99 / 2, 99 / 2);
    assert.ok(Math.abs(data[0] - 50) < 1e-13, "pixelToData, X");
    assert.ok(Math.abs(data[1] - 5) < 1e-13, "pixelToData, Y");
});

QUnit.test("Log XY axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "1e-5", "0"); // X1 = 10^-5 at (0, 99)px
    calib.addPoint(99, 99, "1e12", "0"); // X2 = 1e12 at (99, 99)px
    calib.addPoint(0, 99, "1e-5", "1e-20"); // Y1 = 1e-20 at (0, 99)px
    calib.addPoint(0, 0, "1e-5", "1"); // Y2 = 1 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, true);

    let px = xyaxes.dataToPixel(1e6, 1e-3);
    assert.ok(Math.abs(px.x - 99 * (6 + 5) / (12 + 5)) < 1e-13, "X calibration");
    assert.ok(Math.abs(px.y - 99 * (1 - (-3 + 20) / (0 + 20))) < 1e-13, "Y calibration");
});

QUnit.test("Log XY axes - negative direction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "-1e-5", "0"); // X1 = -10^-5 at (0, 99)px
    calib.addPoint(99, 99, "-1e12", "0"); // X2 = -1e12 at (99, 99)px
    calib.addPoint(0, 99, "-1e-5", "-1e-20"); // Y1 = -1e-20 at (0, 99)px
    calib.addPoint(0, 0, "-1e-5", "-1"); // Y2 = -1 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, true);

    let px = xyaxes.dataToPixel(-1e6, -1e-3);
    assert.ok(Math.abs(px.x - 99 * (6 + 5) / (12 + 5)) < 1e-13, "X calibration");
    assert.ok(Math.abs(px.y - 99 * (1 - (-3 + 20) / (0 + 20))) < 1e-13, "Y calibration");
});

QUnit.test("Log XY axes, no rotation correction", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, "1e-5", "0"); // X1 = 10^-5 at (0, 99)px
    calib.addPoint(99, 99, "1e12", "0"); // X2 = 1e12 at (99, 99)px
    calib.addPoint(0, 99, "1e-5", "1e-20"); // Y1 = 1e-20 at (0, 99)px
    calib.addPoint(0, 0, "1e-5", "1"); // Y2 = 1 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, true, true);

    let px = xyaxes.dataToPixel(1e6, 1e-3);
    assert.ok(Math.abs(px.x - 99 * (6 + 5) / (12 + 5)) < 1e-13, "X calibration");
    assert.ok(Math.abs(px.y - 99 * (1 - (-3 + 20) / (0 + 20))) < 1e-13, "Y calibration");
});

QUnit.test("Log base 2 axes", function(assert) {
    // Given linearly aligned axes
    let calib = new wpd.Calibration(2);
    calib.addPoint(0, 99, Math.pow(2, -5).toString(),
        Math.pow(2, -20).toString()); // X1 = 2^-5 at (0, 99)px
    calib.addPoint(99, 99, Math.pow(2, 12).toString(),
        Math.pow(2, -20).toString()); // X2 = 2^12 at (99, 99)px
    calib.addPoint(0, 99, Math.pow(2, -5).toString(),
        Math.pow(2, -20).toString()); // Y1 = 2^-20 at (0, 99)px
    calib.addPoint(0, 0, Math.pow(2, -5).toString(), "1"); // Y2 = 1 at (0, 0)px

    let xyaxes = new wpd.XYAxes();
    xyaxes.calibrate(calib, true, true);

    let px = xyaxes.dataToPixel(Math.pow(2, 6), Math.pow(2, -3));
    assert.ok(Math.abs(px.x - 99 * (6 + 5) / (12 + 5)) < 1e-13, "dataToPixel, X");
    assert.ok(Math.abs(px.y - 99 * (1 - (-3 + 20) / (0 + 20))) < 1e-13, "dataToPixel, Y");

    let data = xyaxes.pixelToData(99 * (6 + 5) / (12 + 5), 99 * (1 - (-3 + 20) / (0 + 20)));
    assert.ok(Math.abs(data[0] - Math.pow(2, 6)) < 1e-13, "pixelToData, X");
    assert.ok(Math.abs(data[1] - Math.pow(2, -3)) < 1e-13, "pixelToData, Y");
});
