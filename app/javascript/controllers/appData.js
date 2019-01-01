/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
*/

var wpd = wpd || {};

// maintain and manage current state of the application
wpd.appData = (function() {
    let _plotData = null;
    let _undoManager = null;

    function reset() {
        _plotData = null;
        _undoManager = null;
    }

    function getPlotData() {
        if (_plotData == null) {
            _plotData = new wpd.PlotData();
        }
        return _plotData;
    }

    function getUndoManager() {
        if (_undoManager == null) {
            _undoManager = new wpd.UndoManager();
        }
        return _undoManager;
    }

    function isAligned() {
        return getPlotData().getAxesCount() > 0;
    }

    function plotLoaded(imageData) {
        getPlotData().setTopColors(wpd.colorAnalyzer.getTopColors(imageData));
    }

    return {
        isAligned: isAligned,
        getPlotData: getPlotData,
        getUndoManager: getUndoManager,
        reset: reset,
        plotLoaded: plotLoaded
    };
})();