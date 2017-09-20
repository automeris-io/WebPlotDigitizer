/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotdigitizer

	Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

// Plot information

wpd.PlotData = class {
    constructor() {
        this.activeSeriesIndex = 0;
        this.activeAxesIndex = 0;
        this.autoDetector = new wpd.AutoDetector();
        this.topColors = null;
        this.axesColl = [];
        this.axes = null;
        this.dataSeriesColl = [];
        this.gridData = null;
        this.calibration = null;
        this.angleMeasurementData = null;
        this.distanceMeasurementData = null;
        this.openPathMeasurementData = null;
        this.closedPathMeasurementData = null;
        this.backupImageData = null;
        this.objectAxesMap = new Map();
    }

    addAxes(ax) {
        this.axesColl.push(ax);
    }

    removeAxes(ax) {
        this.axesColl = this.axesColl.filter(function(a) {
            a.name !== ax.name;
        });
        
        for(let k in this.objectAxesMap.keys()) {
            this.objectAxesMap.set(k, null);
        }
    }

    getActiveAxes() {        
        return this.axesColl[activeAxesIndex];
    }

    getActiveDataSeries() {
        if (this.dataSeriesColl[activeSeriesIndex] == null) {
            this.dataSeriesColl[activeSeriesIndex] = new wpd.DataSeries();
        }
        return this.dataSeriesColl[activeSeriesIndex];
    };

    getDataSeriesCount() {
        return this.dataSeriesColl.length;
    };

    setActiveDataSeriesIndex(index) {
        activeSeriesIndex = index;
    };

    getActiveDataSeriesIndex() {
        return activeSeriesIndex;
    };

    getAutoDetector() {
        return autoDetector;
    };

    getDataSeriesNames() {
        var rtnVal = [];
        for(var i = 0; i < this.dataSeriesColl.length; i++) {
            rtnVal[i] = this.dataSeriesColl[i].name;
        }
        return rtnVal;
    };

    reset() {
        this.axes = null;
        this.axesColl = [];
        this.objectAxesMap.clear();
        this.angleMeasurementData = null;
        this.distanceMeasurementData = null;
        this.openPathMeasurementData = null;
        this.closedPathMeasurementData = null;
        this.dataSeriesColl = [];
        this.gridData = null;
        this.calibration = null;
        this.backupImageData = null;
        activeSeriesIndex = 0;
        activeAxesIndex = 0;
        autoDetector = new wpd.AutoDetector();
    };
};

