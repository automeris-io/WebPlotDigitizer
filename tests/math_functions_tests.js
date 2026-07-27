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

QUnit.module("Math functions tests");

QUnit.test("taninverse - quadrant coverage", function(assert) {
    const eps = 1e-10;
    // Q1: y>0, x>0
    assert.ok(Math.abs(wpd.taninverse(1, 1) - Math.PI / 4) < eps, "Q1: 45deg");
    // Q2: y>0, x<0
    assert.ok(Math.abs(wpd.taninverse(1, -1) - 3 * Math.PI / 4) < eps, "Q2: 135deg");
    // Q3: y<0, x<0  →  atan2(-1,-1) + 2π = -3π/4 + 2π = 5π/4
    assert.ok(Math.abs(wpd.taninverse(-1, -1) - 5 * Math.PI / 4) < eps, "Q3: 225deg");
    // Q4: y<0, x>0  →  atan2(-1,1) + 2π = -π/4 + 2π = 7π/4
    assert.ok(Math.abs(wpd.taninverse(-1, 1) - 7 * Math.PI / 4) < eps, "Q4: 315deg");
    // y=0, x>0 → 0° (special: atan2(0,1)+2π = 2π → clamped to 0)
    assert.ok(Math.abs(wpd.taninverse(0, 1) - 0) < eps, "y=0, x>0: 0deg");
    // y>0, x=0 → π/2
    assert.ok(Math.abs(wpd.taninverse(1, 0) - Math.PI / 2) < eps, "y>0, x=0: 90deg");
    // result is always in [0, 2π)
    const angles = [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
        [0.5, 3],
        [-2, 0.1]
    ];
    angles.forEach(([y, x]) => {
        const r = wpd.taninverse(y, x);
        assert.ok(r >= 0 && r < 2 * Math.PI, `in [0,2π) for y=${y} x=${x}`);
    });
});

QUnit.test("sqDist2d and dist2d", function(assert) {
    const eps = 1e-10;
    assert.ok(Math.abs(wpd.sqDist2d(0, 0, 0, 0)) < eps, "coincident → 0");
    // 3-4-5 right triangle
    assert.ok(Math.abs(wpd.sqDist2d(0, 0, 3, 4) - 25) < eps, "sqDist 3-4-5 = 25");
    assert.ok(Math.abs(wpd.dist2d(0, 0, 3, 4) - 5) < eps, "dist 3-4-5 = 5");
    assert.ok(Math.abs(wpd.dist2d(1, 2, 1, 2)) < eps, "dist coincident = 0");
    // symmetry
    assert.ok(Math.abs(wpd.dist2d(0, 0, 3, 4) - wpd.dist2d(3, 4, 0, 0)) < eps, "symmetric");
});

QUnit.test("sqDist3d and dist3d", function(assert) {
    const eps = 1e-10;
    assert.ok(Math.abs(wpd.sqDist3d(0, 0, 0, 0, 0, 0)) < eps, "coincident → 0");
    // (1,2,2) from origin: sqrt(1+4+4) = 3
    assert.ok(Math.abs(wpd.sqDist3d(0, 0, 0, 1, 2, 2) - 9) < eps, "sqDist3d = 9");
    assert.ok(Math.abs(wpd.dist3d(0, 0, 0, 1, 2, 2) - 3) < eps, "dist3d = 3");
    // symmetry
    assert.ok(Math.abs(wpd.dist3d(0, 0, 0, 1, 2, 2) - wpd.dist3d(1, 2, 2, 0, 0, 0)) < eps, "symmetric");
});

QUnit.test("mat - det2x2, inv2x2, mult2x2, mult2x2Vec, multVec2x2", function(assert) {
    const eps = 1e-10;
    // det2x2: [[a,b],[c,d]] stored as [a,b,c,d]
    assert.ok(Math.abs(wpd.mat.det2x2([1, 0, 0, 1]) - 1) < eps, "identity det = 1");
    assert.ok(Math.abs(wpd.mat.det2x2([2, 3, 1, 4]) - 5) < eps, "det 2*4-3*1 = 5");
    assert.ok(Math.abs(wpd.mat.det2x2([1, 2, 2, 4])) < eps, "singular det = 0");

    // inv2x2: M * inv(M) = identity
    let M = [2, 1, 5, 3];
    let Minv = wpd.mat.inv2x2(M);
    let prod = wpd.mat.mult2x2(M, Minv);
    assert.ok(Math.abs(prod[0] - 1) < eps, "M*inv(M)[0,0]=1");
    assert.ok(Math.abs(prod[1]) < eps, "M*inv(M)[0,1]=0");
    assert.ok(Math.abs(prod[2]) < eps, "M*inv(M)[1,0]=0");
    assert.ok(Math.abs(prod[3] - 1) < eps, "M*inv(M)[1,1]=1");

    // mult2x2: identity * M = M
    let I = [1, 0, 0, 1];
    let IM = wpd.mat.mult2x2(I, M);
    assert.ok(Math.abs(IM[0] - M[0]) < eps && Math.abs(IM[3] - M[3]) < eps, "I*M=M");

    // mult2x2Vec: [1,0;0,1] * [3,4] = [3,4]
    let v = wpd.mat.mult2x2Vec([1, 0, 0, 1], [3, 4]);
    assert.ok(Math.abs(v[0] - 3) < eps && Math.abs(v[1] - 4) < eps, "I*v=v");

    // multVec2x2: [3,4] * [1,0;0,1] = [3,4]
    let v2 = wpd.mat.multVec2x2([3, 4], [1, 0, 0, 1]);
    assert.ok(Math.abs(v2[0] - 3) < eps && Math.abs(v2[1] - 4) < eps, "v*I=v");

    // known product: [[1,2],[3,4]] * [[0,1],[1,0]] = [[2,1],[4,3]]
    let R = wpd.mat.mult2x2([1, 2, 3, 4], [0, 1, 1, 0]);
    assert.ok(Math.abs(R[0] - 2) < eps, "mult [0] = 2");
    assert.ok(Math.abs(R[1] - 1) < eps, "mult [1] = 1");
    assert.ok(Math.abs(R[2] - 4) < eps, "mult [2] = 4");
    assert.ok(Math.abs(R[3] - 3) < eps, "mult [3] = 3");
});

QUnit.test("cspline and cspline_interp", function(assert) {
    const eps = 1e-10;

    // Too few points → null
    assert.equal(wpd.cspline([0, 1], [0, 1]), null, "< 3 points returns null");

    // Linear function y=x: spline must interpolate exactly
    let xs = [0, 1, 2, 3];
    let ys = [0, 1, 2, 3];
    let cs = wpd.cspline(xs, ys);
    assert.ok(cs !== null, "cspline returns object for 4 points");

    // The cubic Hermite formula guarantees exact reproduction at knot boundaries (t=0 and t=1).
    // x=1 and x=2 land at t=1 of their segments and must equal y[1]=1 and y[2]=2.
    assert.ok(Math.abs(wpd.cspline_interp(cs, 1.0) - 1.0) < eps, "knot value x=1 → y=1");
    assert.ok(Math.abs(wpd.cspline_interp(cs, 2.0) - 2.0) < eps, "knot value x=2 → y=2");
    // Interior x returns a non-null number
    let midVal = wpd.cspline_interp(cs, 0.5);
    assert.ok(midVal !== null && typeof midVal === "number", "x=0.5 → non-null number");

    // Out-of-bounds → null
    assert.equal(wpd.cspline_interp(cs, -0.1), null, "x below range → null");
    assert.equal(wpd.cspline_interp(cs, 3.0), null, "x at upper bound → null");
    assert.equal(wpd.cspline_interp(cs, 5), null, "x above range → null");
});

QUnit.test("normalizeAngleDeg", function(assert) {
    const eps = 1e-10;
    assert.ok(Math.abs(wpd.normalizeAngleDeg(0)) < eps, "0 → 0");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(90) - 90) < eps, "90 → 90");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(360)) < eps, "360 → 0");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(370) - 10) < eps, "370 → 10");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(-10) - 350) < eps, "-10 → 350");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(-360)) < eps, "-360 → 0");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(720)) < eps, "720 → 0");
    assert.ok(Math.abs(wpd.normalizeAngleDeg(181) - 181) < eps, "181 → 181");
});

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
