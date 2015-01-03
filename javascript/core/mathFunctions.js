/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/


/** 
 * Calculate inverse tan with range between 0, 2*pi.
 */
var wpd = wpd || {};

wpd.taninverse = function(y,x) {
    var inv_ans;
    if (y>0) // I & II
    inv_ans = Math.atan2(y,x);
    else if (y<=0) // III & IV
    inv_ans = Math.atan2(y,x) + 2*Math.PI;

    if(inv_ans >= 2*Math.PI)
    inv_ans = 0.0;
    return inv_ans;
};

wpd.sqDist2d = function (x1, y1, x2, y2) {
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);
};

wpd.sqDist3d = function (x1, y1, z1, x2, y2, z2) {
    return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2) + (z1 - z2)*(z1 - z2);
};

wpd.dist2d = function (x1, y1, x2, y2) {
    return Math.sqrt(wpd.sqDist2d(x1, y1, x2, y2));
};

wpd.dist3d = function (x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(wpd.sqDist3d(x1, y1, z1, x2, y2, z2));
};

wpd.mat = (function () {
    
    function det2x2(m) {
        return m[0]*m[3] - m[1]*m[2];
    }

    function inv2x2(m) {
        var det = det2x2(m);
        return [m[3]/det, -m[1]/det, -m[2]/det, m[0]/det];
    }

    function mult2x2(m1, m2) {
        return [
                    m1[0]*m2[0] + m1[1]*m2[2], 
                    m1[0]*m2[1] + m1[1]*m2[3], 
                    m1[2]*m2[0] + m1[3]*m2[2], 
                    m1[2]*m2[1] + m1[3]*m2[3]
               ];
    }

    function mult2x2Vec(m, v) {
        return [m[0]*v[0] + m[1]*v[1], m[2]*v[0] + m[3]*v[1]];
    }

    function multVec2x2(v, m) {
        return [m[0]*v[0] + m[2]*v[1], m[1]*v[0] + m[3]*v[1]];
    }

    return {
        det2x2: det2x2,
        inv2x2: inv2x2,
        mult2x2: mult2x2,
        mult2x2Vec: mult2x2Vec,
        multVec2x2: multVec2x2
    };
})();
