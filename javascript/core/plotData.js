/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

// Plot information
wpd.PlotData = (function () {
    var PlotData = function() {

        var activeSeriesIndex = 0,
            autoDetector = new wpd.AutoDetector();
        
        this.topColors = null;
        this.axes = null;
        this.dataSeriesColl = [];
        this.gridData = null;
        this.calibration = null;

        this.angleMeasurementData = null;
        this.distanceMeasurementData = null;

        this.getActiveDataSeries = function() {
            if (this.dataSeriesColl[activeSeriesIndex] == null) {
                this.dataSeriesColl[activeSeriesIndex] = new wpd.DataSeries();
            }
            return this.dataSeriesColl[activeSeriesIndex];
        };

        this.getDataSeriesCount = function() {
            return this.dataSeriesColl.length;
        };

        this.setActiveDataSeriesIndex = function(index) {
            activeSeriesIndex = index;
        };

        this.getActiveDataSeriesIndex = function() {
            return activeSeriesIndex;
        };

        this.getAutoDetector = function() {
            return autoDetector;
        };

        this.getDataSeriesNames = function() {
            var rtnVal = [];
            for(var i = 0; i < this.dataSeriesColl.length; i++) {
                rtnVal[i] = this.dataSeriesColl[i].name;
            }
            return rtnVal;
        };

        this.reset = function() {
            this.axes = null;
            this.angleMeasurementData = null;
            this.distanceMeasurementData = null;
            this.dataSeriesColl = [];
            this.gridData = null;
            this.calibration = null;
            activeSeriesIndex = 0;
            autoDetector = new wpd.AutoDetector();
        };
    };

    return PlotData;
})();


