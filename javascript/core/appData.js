/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
    var isAligned = false,
        plotData,
        corsProxy,
        imageName;

    function reset() {
        isAligned = false;
        plotData = null;
    }

    function getPlotData() {
        if(plotData == null) {
            plotData = new wpd.PlotData();
        }
        return plotData;
    }

    function isAlignedFn(is_aligned) {
        if(is_aligned != null) {
            isAligned = is_aligned;
        }
        return isAligned;
    }

    function plotLoaded(imageData) {
        getPlotData().topColors = wpd.colorAnalyzer.getTopColors(imageData);
    }

    function getCorsProxy() {
        return corsProxy;
    }

    function setCorsProxy(val) {
        corsProxy = val;
    }

    function getCorsProxyURL(url) {
        if (corsProxy != null && url.substring(0, 4) === 'http') {
            return corsProxy + "/" + url;
        } else {
            return url;
        }
    }

    function getImageName() {
        return imageName;
    }

    function setImageName(val) {
        imageName = val;
    }

    return {
        isAligned: isAlignedFn,
        getPlotData: getPlotData,
        reset: reset,
        plotLoaded: plotLoaded,
        getCorsProxy: getCorsProxy,
        getCorsProxyURL: getCorsProxyURL,
        setCorsProxy: setCorsProxy,
        getImageName: getImageName,
        setImageName: setImageName
    };
})();
