/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2016 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd = wpd || {};

wpd.perspective = (function () {

    function start() {

        // Clear current graphics and detach tools
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();

        // Display dialog box with instructions
        wpd.popup.show('perspective-info');
    }

    // called when clicked 'ok' on dialog box
    function pickCorners() { 
    }

    // called when clicked 'run' on sidebar
    function run() {
    }

    // called when clicked 'reset' on sidebar
    function revert() {
    }

    return {
        start: start,
        pickCorners: pickCorners,
        run: run,
        revert: revert
    };
})();

wpd.perspectiveCornersRepainter = function () {
    this.painterName = 'perspectiveCornersRepainter';

    this.onRedraw = function() {

    };
};

wpd.perspectiveCornersTool = function () {
    this.onAttach = function () {
    };

    this.onMouseDown = function () {
    };

    this.onRemove = function () {
    };
};
