/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Version 2.6

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
 * @fileoverview Some math functions.
 * @version 2.4
 * @author Ankit Rohatgi ankitrohatgi@hotmail.com
 */

/** 
 * Calculate inverse tan with range between 0, 2*pi.
 */
function taninverse(y,x) {
  var inv_ans;
  if (y>0) // I & II
    inv_ans = Math.atan2(y,x);
  else if (y<=0) // III & IV
    inv_ans = Math.atan2(y,x) + 2*Math.PI;
  
  if(inv_ans >= 2*Math.PI)
    inv_ans = 0.0;
  return inv_ans;
}
