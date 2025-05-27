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

QUnit.module("Math functions tests");
QUnit.test("getCircleFrom3Pts", function(assert) {

    // simple unit circle centered at origin
    let pts = [
        [-1.0, 0.0],
        [1.0, 0.0],
        [0.0, 1.0]
    ];
    let circ = wpd.getCircleFrom3Pts(pts);
    assert.equal(Math.abs(circ.radius - 1.0) < 1e-10, true, "radius check1");
    assert.equal(Math.abs(circ.x0) < 1e-10, true, "x0 check1");
    assert.equal(Math.abs(circ.y0) < 1e-10, true, "y0 check1");

    // arbitrary circle
    let pts2 = [
        [718.7992007992008, 107.06493506493506],
        [775.076923076923, 183.47452547452542],
        [825.4065934065934, 456.1698301698301]
    ];
    let expectedRes2 = {
        "x0": 412.87524365401157,
        "y0": 391.3159976286414,
        "radius": 417.59805330481277
    };
    let circ2 = wpd.getCircleFrom3Pts(pts2);
    assert.equal(Math.abs(circ2.radius - expectedRes2.radius) < 1e-10, true, "radius check2");
    assert.equal(Math.abs(circ2.x0 - expectedRes2.x0) < 1e-10, true, "x0 check2");
    assert.equal(Math.abs(circ2.y0 - expectedRes2.y0) < 1e-10, true, "y0 check2");

});
