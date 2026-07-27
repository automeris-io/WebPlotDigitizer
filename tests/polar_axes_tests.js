/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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

// Helper: calibrate polar axes with origin at (ox,oy),
// point 1 at (p1x,p1y) with data (r1,th1),
// point 2 at (p2x,p2y) with data (r2,th2).
function makePolarAxes(ox, oy, p1x, p1y, r1, th1, p2x, p2y, r2, th2,
    isDegrees, isClockwise, isLogR) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(ox, oy, 0, 0); // origin (point 0)
    cal.addPoint(p1x, p1y, r1, th1); // point 1
    cal.addPoint(p2x, p2y, r2, th2); // point 2
    let axes = new wpd.PolarAxes();
    axes.calibrate(cal, isDegrees, isClockwise, isLogR);
    return axes;
}

QUnit.module("Polar axes - coordinate transformation tests");

QUnit.test("Linear scale, degrees, counter-clockwise - calibration points recover exactly", function(assert) {
    const eps = 1e-6;
    // Origin at (100,100). "East" direction in screen coords.
    // Point 1: pixel (150, 100) → r=50, θ=0°
    // Point 2: pixel (200, 100) → r=100, θ=0°
    let axes = makePolarAxes(100, 100, 150, 100, 50, 0, 200, 100, 100, 0,
        true /* degrees */ , false /* CCW */ , false);

    // Cal point 1 should recover
    let d1 = axes.pixelToData(150, 100);
    assert.ok(Math.abs(d1[0] - 50) < eps, "r=50 at cal pt1");
    assert.ok(Math.abs(d1[1]) < eps, "θ=0° at cal pt1");

    // Cal point 2 should recover
    let d2 = axes.pixelToData(200, 100);
    assert.ok(Math.abs(d2[0] - 100) < eps, "r=100 at cal pt2");
    assert.ok(Math.abs(d2[1]) < eps, "θ=0° at cal pt2");
});

QUnit.test("Linear scale, degrees, CCW - 90° direction (screen up)", function(assert) {
    const eps = 1e-6;
    // Same setup. Pixel (100, 50) is 50px straight up from origin.
    // Distance from origin = 50, so r=50.
    // In CCW polar (math convention), screen-up = 90°.
    let axes = makePolarAxes(100, 100, 150, 100, 50, 0, 200, 100, 100, 0,
        true, false, false);

    let d = axes.pixelToData(100, 50);
    assert.ok(Math.abs(d[0] - 50) < eps, "r=50 for 50px from origin");
    assert.ok(Math.abs(d[1] - 90) < eps, "θ=90° for screen-up direction in CCW");
});

QUnit.test("Linear scale, degrees, CCW - 45° direction", function(assert) {
    const eps = 1e-4;
    // Pixel at 45° CCW from East: (100+50/√2, 100-50/√2)
    let axes = makePolarAxes(100, 100, 150, 100, 50, 0, 200, 100, 100, 0,
        true, false, false);
    let r = 50;
    let px = 100 + r / Math.sqrt(2);
    let py = 100 - r / Math.sqrt(2);
    let d = axes.pixelToData(px, py);
    assert.ok(Math.abs(d[0] - r) < eps, "r≈50");
    assert.ok(Math.abs(d[1] - 45) < eps, "θ≈45°");
});

QUnit.test("Linear scale, radians, CCW - quarter turn is π/2", function(assert) {
    const eps = 1e-6;
    // Same pixel geometry but in radians
    // Point 1: pixel (150, 100) → r=50, θ=0 (radians)
    // Point 2: pixel (200, 100) → r=100, θ=0 (radians)
    let axes = makePolarAxes(100, 100, 150, 100, 50, 0, 200, 100, 100, 0,
        false /* radians */ , false, false);

    // Screen-up pixel should be θ=π/2 in radians
    let d = axes.pixelToData(100, 50);
    assert.ok(Math.abs(d[0] - 50) < eps, "r=50");
    assert.ok(Math.abs(d[1] - Math.PI / 2) < eps, "θ=π/2 radians for screen-up");
});

QUnit.test("Clockwise rotation - screen-up is 270° (or equivalently -90° → 270°)", function(assert) {
    const eps = 1e-4;
    // In clockwise convention, East=0, going clockwise: South=90, West=180, North=270
    // Same geometry: origin (100,100), p1 (150,100) r=50 θ=0, p2 (200,100) r=100 θ=0
    let axes = makePolarAxes(100, 100, 150, 100, 50, 0, 200, 100, 100, 0,
        true /* degrees */ , true /* CW */ , false);

    // Screen-up (pixel (100,50)) should be 270° in CW convention
    let d = axes.pixelToData(100, 50);
    assert.ok(Math.abs(d[0] - 50) < eps, "r=50 (CW)");
    assert.ok(Math.abs(d[1] - 270) < eps, "θ=270° for screen-up in CW mode");
});

QUnit.test("Log radial scale - r values are log-transformed", function(assert) {
    const eps = 1e-4;
    // Origin at (100,100).
    // Point 1 at pixel (110, 100): r=10 (log10(10)=1 in log-space), θ=0°
    // Point 2 at pixel (200, 100): r=1000 (log10(1000)=3 in log-space), θ=0°
    // In log-space: dist from origin to p1 = 10px, to p2 = 100px
    // r_log scale: r_log = ((3-1)/90) * (dist - 10) + 1
    let axes = makePolarAxes(100, 100, 110, 100, 10, 0, 200, 100, 1000, 0,
        true, false, true /* logR */);

    // At 10px from origin → r=10
    let d1 = axes.pixelToData(110, 100);
    assert.ok(Math.abs(d1[0] - 10) < eps, "r=10 at 10px from origin");

    // At 100px from origin → r=1000
    let d2 = axes.pixelToData(200, 100);
    assert.ok(Math.abs(d2[0] - 1000) < eps, "r=1000 at 100px from origin");

    // At 55px from origin (midpoint in log-space between 1 and 3) → r=100
    let d3 = axes.pixelToData(155, 100);
    assert.ok(Math.abs(d3[0] - 100) < eps, "r≈100 at midpoint (log scale)");
});
