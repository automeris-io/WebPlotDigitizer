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

/**
 * Calculate inverse tan with range between 0, 2*pi.
 */
var wpd = wpd || {};

wpd.taninverse = function(y, x) {
    var inv_ans;
    if (y > 0) // I & II
        inv_ans = Math.atan2(y, x);
    else if (y <= 0) // III & IV
        inv_ans = Math.atan2(y, x) + 2 * Math.PI;

    if (inv_ans >= 2 * Math.PI)
        inv_ans = 0.0;
    return inv_ans;
};

wpd.sqDist2d = function(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
};

wpd.sqDist3d = function(
    x1, y1, z1, x2, y2,
    z2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2);
};

wpd.dist2d = function(x1, y1, x2, y2) {
    return Math.sqrt(wpd.sqDist2d(x1, y1, x2, y2));
};

wpd.dist3d = function(x1, y1, z1, x2, y2,
    z2) {
    return Math.sqrt(wpd.sqDist3d(x1, y1, z1, x2, y2, z2));
};

wpd.mat = (function() {
    function det2x2(m) {
        return m[0] * m[3] - m[1] * m[2];
    }

    function inv2x2(m) {
        var det = det2x2(m);
        return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det];
    }

    function mult2x2(m1, m2) {
        return [
            m1[0] * m2[0] + m1[1] * m2[2], m1[0] * m2[1] + m1[1] * m2[3],
            m1[2] * m2[0] + m1[3] * m2[2], m1[2] * m2[1] + m1[3] * m2[3]
        ];
    }

    function mult2x2Vec(m, v) {
        return [m[0] * v[0] + m[1] * v[1], m[2] * v[0] + m[3] * v[1]];
    }

    function multVec2x2(v, m) {
        return [m[0] * v[0] + m[2] * v[1], m[1] * v[0] + m[3] * v[1]];
    }

    return {
        det2x2: det2x2,
        inv2x2: inv2x2,
        mult2x2: mult2x2,
        mult2x2Vec: mult2x2Vec,
        multVec2x2: multVec2x2
    };
})();

wpd.cspline =
    function(x, y) {
        var len = x.length,
            cs = {
                x: x,
                y: y,
                len: len,
                d: []
            },
            l = [],
            b = [],
            i;

        /* TODO: when len = 1, return the same value. For len = 2, do a linear interpolation */
        if (len < 3) {
            return null;
        }

        b[0] = 2.0;
        l[0] = 3.0 * (y[1] - y[0]);
        for (i = 1; i < len - 1; ++i) {
            b[i] = 4.0 - 1.0 / b[i - 1];
            l[i] = 3.0 * (y[i + 1] - y[i - 1]) - l[i - 1] / b[i - 1];
        }

        b[len - 1] = 2.0 - 1.0 / b[len - 2];
        l[len - 1] = 3.0 * (y[len - 1] - y[len - 2]) - l[len - 2] / b[len - 1];

        i = len - 1;
        cs.d[i] = l[i] / b[i];
        while (i > 0) {
            --i;
            cs.d[i] = (l[i] - cs.d[i + 1]) / b[i];
        }

        return cs;
    };

wpd.cspline_interp =
    function(cs, x) {
        var i = 0,
            t, a, b, c, d;
        if (x >= cs.x[cs.len - 1] || x < cs.x[0]) {
            return null;
        }

        /* linear search to find the index */
        while (x > cs.x[i]) {
            i++;
        }

        i = (i > 0) ? i - 1 : 0;
        t = (x - cs.x[i]) / (cs.x[i + 1] - cs.x[i]);
        a = cs.y[i];
        b = cs.d[i];
        c = 3.0 * (cs.y[i + 1] - cs.y[i]) - 2.0 * cs.d[i] - cs.d[i + 1];
        d = 2.0 * (cs.y[i] - cs.y[i + 1]) + cs.d[i] + cs.d[i + 1];
        return a + b * t + c * t * t + d * t * t * t;
    };


// Get circle center and radius from three 2D points
wpd.getCircleFrom3Pts = function(pts) {
    let Ax = pts[0][0];
    let Bx = pts[1][0];
    let Cx = pts[2][0];
    let Ay = pts[0][1];
    let By = pts[1][1];
    let Cy = pts[2][1];
    let a = wpd.dist2d(Cx, Cy, Bx, By);
    let b = wpd.dist2d(Ax, Ay, Cx, Cy);
    let c = wpd.dist2d(Bx, By, Ax, Ay);
    let s = (a + b + c) / 2.0;
    let R = (a * b * c) / 4.0 / Math.sqrt(s * (s - a) * (s - b) * (s - c));
    let b1 = a * a * (b * b + c * c - a * a);
    let b2 = b * b * (a * a + c * c - b * b);
    let b3 = c * c * (a * a + b * b - c * c);
    let X = [
        (Ax * b1 + Bx * b2 + Cx * b3) / (b1 + b2 + b3),
        (Ay * b1 + By * b2 + Cy * b3) / (b1 + b2 + b3)
    ];
    return {
        "x0": X[0],
        "y0": X[1],
        "radius": R,
    };
};

wpd.normalizeAngleDeg = function(angleDeg) {
    let normDeg = angleDeg % 360;
    if (normDeg < 0) {
        normDeg += 360.0;
    }
    return normDeg;
};
