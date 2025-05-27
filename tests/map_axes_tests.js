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

QUnit.module("Axes tests: Map");

QUnit.test("Simple Map, top-left origin", function(assert) {
    let calib = new wpd.Calibration(2);
    calib.addPoint(10, 10);
    calib.addPoint(10, 20);

    let mapAxes = new wpd.MapAxes();
    mapAxes.calibrate(calib, "100", "m");

    let data = mapAxes.pixelToData(0, 10);
    assert.equal(data[0], 0, "pixelToData, X");
    assert.equal(data[1], 100, "pixelToData, Y");

    let distancePx = mapAxes.pixelToDataDistance(20);
    assert.equal(distancePx, 200, "pixelToDataDistance");

    let areaPx = mapAxes.pixelToDataArea(20);
    assert.equal(areaPx, 2000, "pixelToDataArea");
});

QUnit.test("Simple Map, bottom-left origin", function(assert) {
    let calib = new wpd.Calibration(2);
    calib.addPoint(10, 10);
    calib.addPoint(10, 20);

    let mapAxes = new wpd.MapAxes();
    mapAxes.calibrate(calib, "100", "m", "bottom-left", 500);

    let data = mapAxes.pixelToData(0, 10);
    assert.equal(data[0], 0, "pixelToData, X");
    assert.equal(data[1], 4890, "pixelToData, Y");

    let distancePx = mapAxes.pixelToDataDistance(20);
    assert.equal(distancePx, 200, "pixelToDataDistance");

    let areaPx = mapAxes.pixelToDataArea(20);
    assert.equal(areaPx, 2000, "pixelToDataArea");
});
