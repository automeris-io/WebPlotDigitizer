/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

var wpd = wpd || {};

wpd.GridLine = (function () {
    var obj = function () {
    };
    return obj;
})();

wpd.gridDetectionCore = (function () {

    var hasHorizontal, hasVertical, xDetectionWidth, yDetectionWidth, xMarkWidth, yMarkWidth;

    function run() {
    }

    function setHorizontalParameters(has_horizontal, y_det_w, y_mark_w) {
        hasHorizontal = has_horizontal;
        yDetectionWidth = y_det_w;
        yMarkWidth = y_mark_w;
    }

    function setVerticalParameters(has_vertical, x_det_w, x_mark_w) {
        hasVertical = has_vertical;
        xDetectionWidth = x_det_w;
        xMarkWidth = x_mark_w;
    }

    return {
        run: run,
        setHorizontalParameters: setHorizontalParameters,
        setVerticalParameters: setVerticalParameters
    };
})();
