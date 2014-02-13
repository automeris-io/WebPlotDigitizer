/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

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

var wpd = wpd || {};
// maintain and manage current state of the application
wpd.appState = (function () {
    var isAligned = false,
        axesType,
        pointsPicked = 0;

    function reset() {
        isAligned = false;
        axesType = null;
        pointsPicked = 0;
    }

    return {
        aligned: function(is_aligned) {
            if(is_aligned != null) {
                isAligned = is_aligned;
            }
            return isAligned;
        },
        reset: reset
    };
})();
