/*
	WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

	Copyright 2010-2018 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
wpd.appData = (function () {
    let plotData;
    let backupImageData = null;

    function reset() {
        isAligned = false;
        plotData = null;
        backupImageData = null;
    }

    function getPlotData() {
        if(plotData == null) {
            plotData = new wpd.PlotData();
        }
        return plotData;
    }

    function isAligned() {
        return getPlotData().getAxesCount() > 0;
    }

    function plotLoaded(imageData) {
        getPlotData().getAutoDetector().topColors = wpd.colorAnalyzer.getTopColors(imageData);
    }

    return {
        isAligned: isAligned,
        getPlotData: getPlotData,
        reset: reset,
        plotLoaded: plotLoaded,
        backupImageData: backupImageData       
    };
})();
