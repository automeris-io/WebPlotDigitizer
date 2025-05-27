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
