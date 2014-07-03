/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
