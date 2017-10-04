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
        this._datasetColl = [];
        this._measurementColl = [];        
        this._objectAxesMap = new Map();
    }

    reset() {
        this._autoDetector = null;
        this._topColors = null;
        this._axesColl = [];        
        this._datasetColl = [];
        this._measurementColl = [];        
        this._objectAxesMap = new Map();  
    }

    addAxes(ax) {
        this._axesColl.push(ax);
        if(this._axesColl.length === 1 && this._datasetColl.length === 0) {       
            let ds = new wpd.Dataset();
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
        this._datasetColl.push(ds);        
        // by default bind ds to last axes
        const axCount = this._axesColl.length;
        if(axCount > 0) {
            let axes = this._axesColl[axCount-1];
            this.setAxesForDataset(ds, axes);            
        }
    }

    getDatasets() {
        return this._datasetColl;
    }

    getDatasetNames() {
        let names = [];
        this._datasetColl.forEach((ds) => {
            names.push(ds.name);
        });
        return names;
    }

    getDatasetCount() {
        return this._datasetColl.length;
    }

    addMeasurement(ms) {
        this._measurementColl.push(ms);

        // if this is a distance measurement, then attach to fist existing image or map axes:
        if(ms instanceof wpd.DistanceMeasurement && this._axesColl.length > 0) {
            for(let aIdx = 0; aIdx < this._axesColl.length; aIdx++) {
                if(this._axesColl[aIdx] instanceof wpd.MapAxes || this._axesColl[aIdx] instanceof wpd.ImageAxes) {
                    this.setAxesForMeasurement(ms, this._axesColl[aIdx]);
                    break;
                }
            }            
        }
    }

    getMeasurementsByType(mtype) {
        let mcoll = [];
        this._measurementColl.forEach(m => {
            if(m instanceof mtype) {
                mcoll.push(m);
            }
        });
        return mcoll;
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
        var dsIdx = this._datasetColl.indexOf(ds);
        if(dsIdx >= 0) {
            this._datasetColl.splice(dsIdx, 1);
            this._objectAxesMap.delete(ds);
        }
    }
        
    getAutoDetector() {
        if(this._autoDetector == null) {
            this._autoDetector = new wpd.AutoDetector();
        }
        return this._autoDetector;
    }

    _deserializePreVersion4(data) {
        // read axes info
        if(data.axesType == null) {
            return true;
        }
        if(data.axesType !== "ImageAxes" && (data.calibration == null || data.axesParameters == null)) {
            return false;
        }

        // get calibration points
        let calibration = null;
        if(data.axesType !== "ImageAxes") {            
            if(data.axesType === "TernaryAxes") {
                calibration = new wpd.Calibration(3);
            } else {
                calibration = new wpd.Calibration(2);
            }
            for(let calIdx = 0; calIdx < data.calibration.length; calIdx++) {
                calibration.addPoint(
                    data.calibration[calIdx].px,
                    data.calibration[calIdx].py,
                    data.calibration[calIdx].dx,
                    data.calibration[calIdx].dy,
                    data.calibration[calIdx].dz
                );
            }
        }

        let axes = null;
        if(data.axesType === "XYAxes") {
            axes = new wpd.XYAxes();            
            axes.calibrate(calibration, data.axesParameters.isLogX, data.axesParameters.isLogY);
        } else if(data.axesType === "BarAxes") {
            axes = new wpd.BarAxes();
            axes.calibrate(calibration, data.axesParameters.isLog);
        } else if(data.axesType === "PolarAxes") {
            axes = new wpd.PolarAxes();
            axes.calibrate(calibration, data.axesParameters.isDegrees, data.axesParameters.isClockwise);
        } else if(data.axesType === "TernaryAxes") {
            axes = new wpd.TernaryAxes();
            axes.calibrate(calibration, data.axesParameters.isRange100, data.axesParameters.isNormalOrientation);
        } else if(data.axesType === "MapAxes") {
            axes = new wpd.MapAxes();
            axes.calibrate(calibration, data.axesParameters.scaleLength, data.axesParameters.unitString);
        } else if(data.axesType === "ImageAxes") {
            axes = new wpd.ImageAxes();            
        }

        if(axes != null) {
            this._axesColl.push(axes);
        }
        
        // datasets
        if(data.dataSeries != null) {
            for(let dsIdx = 0; dsIdx < data.dataSeries.length; dsIdx++) {
                const dsData = data.dataSeries[dsIdx];
                let ds = new wpd.Dataset();
                ds.name = dsData.name;
                if(dsData.metadataKeys != null) {
                    ds.setMetadataKeys(dsData.metadataKeys);
                }
                for(let pxIdx = 0; pxIdx < dsData.data.length; pxIdx++) {
                    ds.addPixel(dsData.data[pxIdx].x, dsData.data[pxIdx].y, dsData.data[pxIdx].metadata);
                }
                this.addDataset(ds);
                this.setAxesForDataset(ds, axes);
            }
        }

        // measurements

        // distances
        if(data.distanceMeasurementData != null) {
            let dist = new wpd.DistanceMeasurement();
            for(let cIdx = 0; cIdx < data.distanceMeasurementData.length; cIdx++) {
                dist.addConnection(data.distanceMeasurementData[i]);
            }
            this.addMeasurement(dist);
            if(axes instanceof wpd.MapAxes) {
                this.setAxesForMeasurement(dist, axes);
            }
        }        

        // angles
        if(data.angleMeasurementData != null) {
            let ang = new wpd.AngleMeasurement();
            for(let cIdx = 0; cIdx < data.angleMeasurementData.length; cIdx++) {
                ang.addConnection(data.angleMeasurementData[i]);
            }
            this.addMeasurement(ang);            
        }

        return true;
    }

    _deserializeVersion4(data) {
        return true;
    }

    deserialize(data) {
        this.reset();
        try {
            if(data.wpd.version[0] === 3) {
                return this._deserializePreVersion4(data.wpd);
            }
            if(data.version[0] === 4) {
                return this._deserializeVersion4(data);
            }                                    
            return true;
        }
        catch(e) {
            console.log(e);
            return false;
        }        
    }

    serialize() {
        let data = {};
        data.version = [4,0];        
        data.axesColl = [];
        data.datasetColl = [];
        data.measurementColl = [];        
        return JSON.stringify(data);
    }
};

