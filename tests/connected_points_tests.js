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

QUnit.module("ConnectedPoints tests", {
    beforeEach: function() {
        sinon.stub(wpd.appData, 'isMultipage').returns(false);
    },
    afterEach: function() {
        sinon.restore();
    }
});

QUnit.test("ConnectedPoints - add, count, get, delete connections", function(assert) {
    let cp = new wpd.ConnectedPoints(2);
    assert.equal(cp.connectionCount(), 0, "initially empty");

    cp.addConnection([0, 0, 10, 10]);
    assert.equal(cp.connectionCount(), 1, "one connection");
    assert.deepEqual(cp.getConnectionAt(0), [0, 0, 10, 10], "getConnectionAt 0");

    cp.addConnection([5, 5, 15, 15]);
    assert.equal(cp.connectionCount(), 2, "two connections");

    cp.deleteConnectionAt(0);
    assert.equal(cp.connectionCount(), 1, "one after delete");
    assert.deepEqual(cp.getConnectionAt(0), [5, 5, 15, 15], "remaining connection");

    cp.clearAll();
    assert.equal(cp.connectionCount(), 0, "cleared");
});

QUnit.test("ConnectedPoints - setPointAt and getPointAt", function(assert) {
    let cp = new wpd.ConnectedPoints(2);
    cp.addConnection([0, 0, 10, 20]);
    let p0 = cp.getPointAt(0, 0);
    assert.equal(p0.x, 0, "p0.x = 0");
    assert.equal(p0.y, 0, "p0.y = 0");
    let p1 = cp.getPointAt(0, 1);
    assert.equal(p1.x, 10, "p1.x = 10");
    assert.equal(p1.y, 20, "p1.y = 20");

    cp.setPointAt(0, 0, 99, 88);
    let updated = cp.getPointAt(0, 0);
    assert.equal(updated.x, 99, "updated x");
    assert.equal(updated.y, 88, "updated y");
});

QUnit.test("ConnectedPoints - findNearestPointAndConnection", function(assert) {
    let cp = new wpd.ConnectedPoints(2);
    cp.addConnection([10, 10, 50, 50]);
    cp.addConnection([100, 100, 200, 200]);

    let result = cp.findNearestPointAndConnection(12, 11);
    assert.equal(result.connectionIndex, 0, "nearest to (12,11) is connection 0");
    assert.equal(result.pointIndex, 0, "nearest point is index 0 in connection 0");

    let result2 = cp.findNearestPointAndConnection(110, 105);
    assert.equal(result2.connectionIndex, 1, "nearest to (110,105) is connection 1");
    assert.equal(result2.pointIndex, 0, "nearest point is index 0 in connection 1");
});

QUnit.test("ConnectedPoints - selectNearestPoint and isPointSelected", function(assert) {
    let cp = new wpd.ConnectedPoints(2);
    cp.addConnection([10, 10, 50, 50]);
    cp.selectNearestPoint(11, 11);
    assert.true(cp.isPointSelected(0, 0), "point (connIdx=0, ptIdx=0) is selected");
    assert.false(cp.isPointSelected(0, 1), "other point not selected");

    cp.unselectConnectionAndPoint();
    assert.false(cp.isPointSelected(0, 0), "unselected after unselectConnectionAndPoint");
});

QUnit.test("DistanceMeasurement - getDistance", function(assert) {
    const eps = 1e-10;
    let dm = new wpd.DistanceMeasurement();

    // 3-4-5 right triangle → distance = 5
    dm.addConnection([0, 0, 3, 4]);
    assert.ok(Math.abs(dm.getDistance(0) - 5) < eps, "3-4-5 distance = 5");

    // zero-length segment
    dm.addConnection([7, 7, 7, 7]);
    assert.ok(Math.abs(dm.getDistance(1)) < eps, "zero-length distance = 0");

    // diagonal: (0,0) to (1,1) → sqrt(2)
    dm.addConnection([0, 0, 1, 1]);
    assert.ok(Math.abs(dm.getDistance(2) - Math.sqrt(2)) < eps, "diagonal = sqrt(2)");
});

QUnit.test("AngleMeasurement - getAngle", function(assert) {
    const eps = 1e-6;
    let am = new wpd.AngleMeasurement();

    // 90° angle: center=(50,50), p0=(100,50) [right], p1=(50,0) [up in screen coords]
    // ang2 = taninverse(-(50-50), 100-50) = taninverse(0,50) = 0
    // ang1 = taninverse(-(0-50), 50-50) = taninverse(50,0) = π/2
    // ang = π/2 rad = 90°
    am.addConnection([100, 50, 50, 50, 50, 0]);
    assert.ok(Math.abs(am.getAngle(0) - 90) < eps, "90 degree angle");

    // 45° angle: center=(50,50), p0=(100,50) [right, ang2=0], p1=(100,0) [northeast, ang1=π/4]
    // taninverse(-(0-50), 100-50) = taninverse(50, 50) = π/4
    am.addConnection([100, 50, 50, 50, 100, 0]);
    assert.ok(Math.abs(am.getAngle(1) - 45) < eps, "45 degree angle");

    // 270°: center=(50,50), p0=(50,0) [up], p1=(100,50) [right]
    // ang2 = taninverse(-(0-50), 50-50) = taninverse(50, 0) = π/2
    // ang1 = taninverse(-(50-50), 100-50) = taninverse(0, 50) = 0
    // ang = 0 - π/2 = -π/2 rad → -90° → +360 = 270°
    am.addConnection([50, 0, 50, 50, 100, 50]);
    assert.ok(Math.abs(am.getAngle(2) - 270) < eps, "270 degree angle");
});

QUnit.test("AreaMeasurement - getArea", function(assert) {
    const eps = 1e-10;
    let area = new wpd.AreaMeasurement();

    // Unit square vertices (0,0),(1,0),(1,1),(0,1): area = 1 by Shoelace
    area.addConnection([0, 0, 1, 0, 1, 1, 0, 1]);
    assert.ok(Math.abs(area.getArea(0) - 1) < eps, "unit square area = 1");

    // Right triangle (0,0),(3,0),(0,4): area = 6
    area.addConnection([0, 0, 3, 0, 0, 4]);
    assert.ok(Math.abs(area.getArea(1) - 6) < eps, "3-4 triangle area = 6");

    // Single point (length=2) → returns 0
    area.addConnection([5, 5]);
    assert.ok(Math.abs(area.getArea(2)) < eps, "single point area = 0");

    // Out-of-bounds index: getArea falls through to return 0
    assert.equal(area.getArea(99), 0, "out-of-bounds returns 0");
});

QUnit.test("AreaMeasurement - getPerimeter", function(assert) {
    const eps = 1e-6;
    let area = new wpd.AreaMeasurement();

    // Unit square: perimeter = 4
    area.addConnection([0, 0, 1, 0, 1, 1, 0, 1]);
    assert.ok(Math.abs(area.getPerimeter(0) - 4) < eps, "unit square perimeter = 4");

    // 3-4-5 right triangle: perimeter = 3 + 4 + 5 = 12
    area.addConnection([0, 0, 3, 0, 0, 4]);
    assert.ok(Math.abs(area.getPerimeter(1) - 12) < eps, "3-4-5 triangle perimeter = 12");
});
