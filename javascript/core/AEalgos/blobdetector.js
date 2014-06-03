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
wpd = wpd || {};

wpd.BlobDetectorAlgo = (function () {
    
    var Algo = function () {
        this.getParamList = function () {
            return [];
        };

        this.setParam = function (index, val) {
        };

        this.run = function (plotData) {
            var autoDetector = plotData.getAutoDetector(),
                dataSeries = plotData.getActiveDataSeries();

            dataSeries.clearAll();
            dataSeries.setMetadataKeys(["area", "moment"]);
            
            // dummy data
            for (var i = 0; i < 10; i++) {
                dataSeries.addPixel(i, 2*i, [i/10.0, i*i]);
            }
        };
    };

    return Algo;
})();

