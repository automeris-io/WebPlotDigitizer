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

QUnit.module("Calibration tests");

QUnit.test("2D - addPoint, getCount, getPoint", function(assert) {
    let cal = new wpd.Calibration(2);
    assert.equal(cal.getCount(), 0, "initially empty");
    assert.equal(cal.getDimensions(), 2, "2D dimensions");

    cal.addPoint(10, 20, 1.0, 2.0);
    assert.equal(cal.getCount(), 1, "count = 1 after addPoint");

    let pt = cal.getPoint(0);
    assert.equal(pt.px, 10, "px = 10");
    assert.equal(pt.py, 20, "py = 20");
    assert.equal(pt.dx, 1.0, "dx = 1.0");
    assert.equal(pt.dy, 2.0, "dy = 2.0");
    assert.equal(pt.dz, null, "dz = null in 2D");

    cal.addPoint(30, 40, 5.0, 6.0);
    assert.equal(cal.getCount(), 2, "count = 2");
    let pt2 = cal.getPoint(1);
    assert.equal(pt2.px, 30, "second point px");
    assert.equal(pt2.dx, 5.0, "second point dx");
});

QUnit.test("2D - changePointPx and setDataAt", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(10, 20, 1.0, 2.0);

    cal.changePointPx(0, 50, 60);
    let pt = cal.getPoint(0);
    assert.equal(pt.px, 50, "changed px = 50");
    assert.equal(pt.py, 60, "changed py = 60");
    assert.equal(pt.dx, 1.0, "dx unchanged");

    cal.setDataAt(0, 9.0, 8.0);
    pt = cal.getPoint(0);
    assert.equal(pt.dx, 9.0, "updated dx = 9.0");
    assert.equal(pt.dy, 8.0, "updated dy = 8.0");
});

QUnit.test("3D - addPoint stores dz", function(assert) {
    let cal = new wpd.Calibration(3);
    assert.equal(cal.getDimensions(), 3, "3D dimensions");

    cal.addPoint(5, 10, 1.0, 2.0, 3.0);
    let pt = cal.getPoint(0);
    assert.equal(pt.dz, 3.0, "dz = 3.0 in 3D");
    assert.equal(pt.dx, 1.0, "dx = 1.0");
    assert.equal(pt.dy, 2.0, "dy = 2.0");
});

QUnit.test("getPoint - out-of-bounds returns null", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(0, 0, 0, 0);
    assert.equal(cal.getPoint(-1), null, "index -1 → null");
    assert.equal(cal.getPoint(1), null, "index 1 (out of range) → null");
    assert.equal(cal.getPoint(100), null, "index 100 → null");
});

QUnit.test("findNearestPoint - returns correct index within threshold", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(10, 10, 0, 0);
    cal.addPoint(50, 50, 1, 1);
    cal.addPoint(90, 90, 2, 2);

    assert.equal(cal.findNearestPoint(12, 11), 0, "nearest to (12,11) is index 0");
    assert.equal(cal.findNearestPoint(48, 52), 1, "nearest to (48,52) is index 1");
    assert.equal(cal.findNearestPoint(88, 92), 2, "nearest to (88,92) is index 2");
});

QUnit.test("findNearestPoint - returns -1 when all outside threshold", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(10, 10, 0, 0);
    // default threshold is 50; point at (200, 200) is far away
    assert.equal(cal.findNearestPoint(200, 200), -1, "far point → -1");
    // custom threshold of 5: (16, 10) is 6px from (10,10) → -1
    assert.equal(cal.findNearestPoint(16, 10, 5), -1, "outside custom threshold → -1");
    // (14, 10) is 4px from (10,10) → 0
    assert.equal(cal.findNearestPoint(14, 10, 5), 0, "within custom threshold → 0");
});

QUnit.test("selectPoint, isPointSelected, getSelectedPoints, unselectAll", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(0, 0, 0, 0);
    cal.addPoint(10, 10, 1, 1);
    cal.addPoint(20, 20, 2, 2);

    assert.false(cal.isPointSelected(0), "nothing selected initially");

    cal.selectPoint(1);
    assert.true(cal.isPointSelected(1), "index 1 selected");
    assert.false(cal.isPointSelected(0), "index 0 not selected");
    assert.deepEqual(cal.getSelectedPoints(), [1], "selected list = [1]");

    cal.selectPoint(2);
    assert.true(cal.isPointSelected(2), "index 2 selected");
    let sel = cal.getSelectedPoints();
    assert.ok(sel.indexOf(1) >= 0 && sel.indexOf(2) >= 0, "both 1 and 2 in selection");

    // selecting same index twice does not duplicate
    cal.selectPoint(1);
    assert.equal(cal.getSelectedPoints().filter(i => i === 1).length, 1, "no duplicate selection");

    cal.unselectAll();
    assert.equal(cal.getSelectedPoints().length, 0, "empty after unselectAll");
    assert.false(cal.isPointSelected(1), "index 1 unselected");
});

QUnit.test("selectNearestPoint", function(assert) {
    let cal = new wpd.Calibration(2);
    cal.addPoint(10, 10, 0, 0);
    cal.addPoint(80, 80, 1, 1);

    cal.selectNearestPoint(12, 12);
    assert.true(cal.isPointSelected(0), "nearest to (12,12) = index 0 selected");

    cal.unselectAll();
    cal.selectNearestPoint(79, 81);
    assert.true(cal.isPointSelected(1), "nearest to (79,81) = index 1 selected");
});
