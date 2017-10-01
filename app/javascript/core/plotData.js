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
        this._autoDetector = null;
        this._topColors = null;
        this._axesColl = [];        
        this._dataSetColl = [];
        this._measurementColl = [];        
        this._objectAxesMap = new Map();
    }

    reset() {
        this._autoDetector = null;
        this._topColors = null;
        this._axesColl = [];        
        this._dataSetColl = [];
        this._measurementColl = [];        
        this._objectAxesMap = new Map();  
    }

    addAxes(ax) {
        this._axesColl.push(ax);
        if(this._axesColl.length == 1) {       
            let ds = new wpd.DataSeries();
            ds.name = "Default Dataset";
            this.addDataset(ds);
        }
    }

    getAxesColl() {
        return this._axesColl;
    }

    getAxesNames() {
        let names = [];
        this._axesColl.forEach((ax) => {
            names.push(ax.name);
        });
        return names;
    }

    deleteAxes(ax) {
        let axIdx = this._axesColl.indexOf(ax);
        if(axIdx >= 0) {
            this._axesColl.splice(axIdx, 1);

            // take care of dependents
            this._objectAxesMap.forEach((val, key, map) => {
                if(val === ax) {
                    map.set(key, null);
                }
            });
        }
    }

    getAxesCount() {
        return this._axesColl.length;
    }

    addDataset(ds) {
        this._dataSetColl.push(ds);        
        // by default bind ds to last axes
        const axCount = this._axesColl.length;
        if(axCount > 0) {
            let axes = this._axesColl[axCount-1];
            this.setAxesForDataset(ds, axes);            
        }
    }

    getDatasets() {
        return this._dataSetColl;
    }

    getDatasetNames() {
        let names = [];
        this._dataSetColl.forEach((ds) => {
            names.push(ds.name);
        });
        return names;
    }

    getDatasetCount() {
        return this._dataSetColl.length;
    }

    addMeasurement(ms) {
        this._measurementColl.push(ms);
    }

    getMeasurements() {
        return this._measurementColl;
    }

    deleteMeasurement(ms) {
        var msIdx = this._measurementColl.indexOf(ms);
        if(msIdx >= 0) {
            this._measurementColl.splice(msIdx, 1);
            this._objectAxesMap.delete(ms);
        }
    }

    setAxesForDataset(ds, ax) {
        this._objectAxesMap.set(ds, ax);
    }

    setAxesForMeasurement(ms, ax) {
        this._objectAxesMap.set(ms, ax);
    }

    getAxesForDataset(ds) {
        return this._objectAxesMap.get(ds);
    }

    getAxesForMeasurement(ms) {
        return this._objectAxesMap.get(ms);
    }

    deleteDataset(ds) {
        var dsIdx = this._dataSetColl.indexOf(ds);
        if(dsIdx >= 0) {
            this._dataSetColl.splice(dsIdx, 1);
            this._objectAxesMap.delete(ds);
        }
    }
        
    getAutoDetector() {
        if(this._autoDetector == null) {
            this._autoDetector = new wpd.AutoDetector();
        }
        return this._autoDetector;
    }
};

