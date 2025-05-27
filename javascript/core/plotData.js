/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2025 Ankit Rohatgi

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

var wpd = wpd || {};

// Plot information

wpd.PlotData = class {
    constructor() {
        this._topColors = null;
        this._axesColl = [];
        this._datasetColl = [];
        this._measurementColl = [];
        this._objectAxesMap = new Map();
        this._datasetAutoDetectionDataMap = new Map();
        this._gridDetectionData = null;
    }

    reset() {
        this._axesColl = [];
        this._datasetColl = [];
        this._measurementColl = [];
        this._objectAxesMap = new Map();
        this._datasetAutoDetectionDataMap = new Map();
        this._gridDetectionData = null;
    }

    setTopColors(topColors) {
        this._topColors = topColors;
    }

    getTopColors(topColors) {
        return this._topColors;
    }

    addAxes(ax) {
        this._axesColl.push(ax);
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
        if (axIdx >= 0) {
            this._axesColl.splice(axIdx, 1);

            // take care of dependents
            this._objectAxesMap.forEach((val, key, map) => {
                if (val === ax) {
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

    addMeasurement(ms, skipAutoAttach) {
        this._measurementColl.push(ms);

        // if this is a distance measurement, then attach to first existing image or map axes:
        if (!skipAutoAttach && ms instanceof wpd.DistanceMeasurement && this._axesColl.length > 0) {
            for (let aIdx = 0; aIdx < this._axesColl.length; aIdx++) {
                if (this._axesColl[aIdx] instanceof wpd.MapAxes || this._axesColl[aIdx] instanceof wpd.ImageAxes) {
                    this.setAxesForMeasurement(ms, this._axesColl[aIdx]);
                    break;
                }
            }
        }
    }

    getMeasurementColl() {
        return this._measurementColl;
    }

    getMeasurementsByType(mtype) {
        let mcoll = [];
        this._measurementColl.forEach(m => {
            if (m instanceof mtype) {
                mcoll.push(m);
            }
        });
        return mcoll;
    }

    deleteMeasurement(ms) {
        var msIdx = this._measurementColl.indexOf(ms);
        if (msIdx >= 0) {
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

    setAutoDetectionDataForDataset(ds, autoDetectionData) {
        this._datasetAutoDetectionDataMap.set(ds, autoDetectionData);
    }

    getAxesForDataset(ds) {
        return this._objectAxesMap.get(ds);
    }

    getAxesForMeasurement(ms) {
        return this._objectAxesMap.get(ms);
    }

    getAutoDetectionDataForDataset(ds) {
        let ad = this._datasetAutoDetectionDataMap.get(ds);
        if (ad == null) { // create one if no autodetection data is present!
            ad = new wpd.AutoDetectionData();
            this.setAutoDetectionDataForDataset(ds, ad);
        }
        return ad;
    }

    getGridDetectionData() {
        if (this._gridDetectionData == null) {
            this._gridDetectionData = new wpd.GridDetectionData();
        }
        return this._gridDetectionData;
    }

    deleteDataset(ds) {
        var dsIdx = this._datasetColl.indexOf(ds);
        if (dsIdx >= 0) {
            this._datasetColl.splice(dsIdx, 1);
            this._objectAxesMap.delete(ds);
            this._datasetAutoDetectionDataMap.delete(ds);
        }
    }

    _deserializePreVersion4(data) {
        // read axes info
        if (data.axesType == null) {
            return true;
        }
        if (data.axesType !== "ImageAxes" &&
            (data.calibration == null || data.axesParameters == null)) {
            return false;
        }

        // get calibration points
        let calibration = null;
        if (data.axesType !== "ImageAxes") {
            if (data.axesType === "TernaryAxes") {
                calibration = new wpd.Calibration(3);
            } else {
                calibration = new wpd.Calibration(2);
            }
            for (let calIdx = 0; calIdx < data.calibration.length; calIdx++) {
                calibration.addPoint(data.calibration[calIdx].px, data.calibration[calIdx].py,
                    data.calibration[calIdx].dx, data.calibration[calIdx].dy,
                    data.calibration[calIdx].dz);
            }
        }

        let axes = null;
        if (data.axesType === "XYAxes") {
            axes = new wpd.XYAxes();
            calibration.labels = ['X1', 'X2', 'Y1', 'Y2'];
            calibration.labelPositions = ['N', 'N', 'E', 'E'];
            calibration.maxPointCount = 4;
            axes.calibrate(calibration, data.axesParameters.isLogX, data.axesParameters.isLogY);
        } else if (data.axesType === "BarAxes") {
            axes = new wpd.BarAxes();
            calibration.labels = ['P1', 'P2'];
            calibration.labelPositions = ['S', 'S'];
            calibration.maxPointCount = 2;
            axes.calibrate(calibration, data.axesParameters.isLog);
        } else if (data.axesType === "PolarAxes") {
            axes = new wpd.PolarAxes();
            calibration.labels = ['Origin', 'P1', 'P2'];
            calibration.labelPositions = ['E', 'S', 'S'];
            calibration.maxPointCount = 3;
            axes.calibrate(calibration, data.axesParameters.isDegrees,
                data.axesParameters.isClockwise);
        } else if (data.axesType === "TernaryAxes") {
            axes = new wpd.TernaryAxes();
            calibration.labels = ['A', 'B', 'C'];
            calibration.labelPositions = ['S', 'S', 'E'];
            calibration.maxPointCount = 3;
            axes.calibrate(calibration, data.axesParameters.isRange100,
                data.axesParameters.isNormalOrientation);
        } else if (data.axesType === "MapAxes") {
            axes = new wpd.MapAxes();
            calibration.labels = ['P1', 'P2'];
            calibration.labelPositions = ['S', 'S'];
            calibration.maxPointCount = 2;
            axes.calibrate(calibration, data.axesParameters.scaleLength,
                data.axesParameters.unitString, "top-left", 0);
        } else if (data.axesType === "ImageAxes") {
            axes = new wpd.ImageAxes();
        }

        if (axes != null) {
            this._axesColl.push(axes);
        }

        // datasets
        if (data.dataSeries != null) {
            for (let dsIdx = 0; dsIdx < data.dataSeries.length; dsIdx++) {
                const dsData = data.dataSeries[dsIdx];
                let ds = new wpd.Dataset();
                ds.name = dsData.name;
                if (dsData.metadataKeys != null && dsData.metadataKeys.length > 0) {
                    ds.setMetadataKeys(dsData.metadataKeys.map(k => k.toLowerCase()));
                }
                for (let pxIdx = 0; pxIdx < dsData.data.length; pxIdx++) {
                    // only label key existed in the past
                    if (dsData.metadataKeys.length > 0) {
                        const metadataKey = dsData.metadataKeys[0].toLowerCase();
                        const metadataValue = dsData.data[pxIdx].metadata[0];
                        ds.addPixel(dsData.data[pxIdx].x, dsData.data[pxIdx].y, {
                            [metadataKey]: metadataValue
                        });
                    } else {
                        ds.addPixel(dsData.data[pxIdx].x, dsData.data[pxIdx].y);
                    }
                }
                this.addDataset(ds);
                this.setAxesForDataset(ds, axes);
            }
        }

        // measurements

        // distances
        if (data.distanceMeasurementData != null) {
            let dist = new wpd.DistanceMeasurement();
            for (let cIdx = 0; cIdx < data.distanceMeasurementData.length; cIdx++) {
                dist.addConnection(data.distanceMeasurementData[cIdx]);
            }
            this.addMeasurement(dist);
            if (axes instanceof wpd.MapAxes) {
                this.setAxesForMeasurement(dist, axes);
            }
        }

        // angles
        if (data.angleMeasurementData != null) {
            let ang = new wpd.AngleMeasurement();
            for (let cIdx = 0; cIdx < data.angleMeasurementData.length; cIdx++) {
                ang.addConnection(data.angleMeasurementData[cIdx]);
            }
            this.addMeasurement(ang);
        }

        return true;
    }

    _deserializeVersion4(data) {
        // collect page data if it exists
        let documentMetadata = {};

        const collectMetadata = (group, type, key, object) => {
            if (!documentMetadata[group])
                documentMetadata[group] = {};
            if (!documentMetadata[group][type])
                documentMetadata[group][type] = {};
            if (!documentMetadata[group][type][key])
                documentMetadata[group][type][key] = [];
            documentMetadata[group][type][key].push(object);
        };

        // axes data
        if (data.axesColl != null) {
            for (let axIdx = 0; axIdx < data.axesColl.length; axIdx++) {
                const axData = data.axesColl[axIdx];

                // get calibration
                let calibration = null;
                if (axData.type !== "ImageAxes") {
                    if (axData.type === "TernaryAxes") {
                        calibration = new wpd.Calibration(3);
                    } else {
                        calibration = new wpd.Calibration(2);
                    }
                    for (let calIdx = 0; calIdx < axData.calibrationPoints.length; calIdx++) {
                        calibration.addPoint(axData.calibrationPoints[calIdx].px,
                            axData.calibrationPoints[calIdx].py,
                            axData.calibrationPoints[calIdx].dx,
                            axData.calibrationPoints[calIdx].dy,
                            axData.calibrationPoints[calIdx].dz);
                    }
                }

                // create axes
                let axes = null;
                if (axData.type === "XYAxes") {
                    axes = new wpd.XYAxes();
                    calibration.labels = ['X1', 'X2', 'Y1', 'Y2'];
                    calibration.labelPositions = ['N', 'N', 'E', 'E'];
                    calibration.maxPointCount = 4;
                    axes.calibrate(calibration, axData.isLogX, axData.isLogY, axData.noRotation);
                } else if (axData.type === "BarAxes") {
                    axes = new wpd.BarAxes();
                    calibration.labels = ['P1', 'P2'];
                    calibration.labelPositions = ['S', 'S'];
                    calibration.maxPointCount = 2;
                    axes.calibrate(calibration, axData.isLog,
                        axData.isRotated == null ? false : axData.isRotated);
                } else if (axData.type === "PolarAxes") {
                    axes = new wpd.PolarAxes();
                    calibration.labels = ['Origin', 'P1', 'P2'];
                    calibration.labelPositions = ['E', 'S', 'S'];
                    calibration.maxPointCount = 3;
                    axes.calibrate(calibration, axData.isDegrees, axData.isClockwise, axData.isLog);
                } else if (axData.type === "TernaryAxes") {
                    axes = new wpd.TernaryAxes();
                    calibration.labels = ['A', 'B', 'C'];
                    calibration.labelPositions = ['S', 'S', 'E'];
                    calibration.maxPointCount = 3;
                    axes.calibrate(calibration, axData.isRange100, axData.isNormalOrientation);
                } else if (axData.type === "MapAxes") {
                    axes = new wpd.MapAxes();
                    calibration.labels = ['P1', 'P2'];
                    calibration.labelPositions = ['S', 'S'];
                    calibration.maxPointCount = 2;
                    let originLocation = axData.originLocation != null ? axData.originLocation : "top-left";
                    let imageHeight = axData.imageHeight != null ? parseInt(axData.imageHeight, 10) : 0;
                    axes.calibrate(calibration, axData.scaleLength, axData.unitString, originLocation, imageHeight);
                } else if (axData.type === "ImageAxes") {
                    axes = new wpd.ImageAxes();
                } else if (axData.type === "CircularChartRecorderAxes") {
                    axes = new wpd.CircularChartRecorderAxes();
                    calibration.labels = ['(T0,R0)', '(T0,R1)', '(T0,R2)', '(T1,R2)', '(T2,R2)'];
                    calibration.labelPositions = ['S', 'S', 'S', 'S', 'S'];
                    calibration.maxPointCount = 5;
                    axes.calibrate(calibration, axData.startTime, axData.rotationTime == null ? "week" : axData.rotationTime, axData.rotationDirection == null ? "anticlockwise" : axData.rotationDirection);
                }

                if (axes != null) {
                    axes.name = axData.name;

                    if (axData.metadata !== undefined) {
                        axes.setMetadata(axData.metadata);
                    }

                    this._axesColl.push(axes);

                    // collect document metadata
                    if (axData.file !== undefined) {
                        collectMetadata('file', 'axes', axData.file, axes);
                    }
                    if (axData.page !== undefined) {
                        collectMetadata('page', 'axes', axData.page, axes);
                    }
                }
            }
        }

        // datasets
        if (data.datasetColl != null) {
            for (let dsIdx = 0; dsIdx < data.datasetColl.length; dsIdx++) {
                const dsData = data.datasetColl[dsIdx];
                let ds = new wpd.Dataset();
                ds.name = dsData.name;
                if (dsData.colorRGB != null) {
                    ds.colorRGB = new wpd.Color(dsData.colorRGB[0], dsData.colorRGB[1], dsData.colorRGB[2]);
                }
                // dataset metadata
                if (dsData.metadata !== undefined) {
                    ds.setMetadata(dsData.metadata);
                }
                // data point groups
                if (dsData.groupNames !== undefined) {
                    ds.setPointGroups(dsData.groupNames);
                }
                // data points metadata keys
                if (dsData.metadataKeys != null) {
                    ds.setMetadataKeys(dsData.metadataKeys);
                }

                // data points
                for (let pxIdx = 0; pxIdx < dsData.data.length; pxIdx++) {
                    // for backwards compatibility; metadata was updated from array
                    // to object
                    let metadata = dsData.data[pxIdx].metadata;
                    if (dsData.data[pxIdx].metadata != null) {
                        if (Array.isArray(metadata)) {
                            // transform metadata array into object
                            metadata = metadata.reduce((obj, val, idx) => {
                                return {
                                    ...obj,
                                    [dsData.metadataKeys[idx]]: val
                                };
                            }, {});
                        }
                    }
                    // set point group data, if present
                    if (
                        ds.hasPointGroups() &&
                        dsData.data[pxIdx].tuple !== undefined &&
                        dsData.data[pxIdx].group !== undefined
                    ) {
                        // addEmptyTupleAt checks if tuple exists
                        ds.addEmptyTupleAt(dsData.data[pxIdx].tuple);
                        ds.addToTupleAt(dsData.data[pxIdx].tuple, dsData.data[pxIdx].group, pxIdx);
                    }
                    ds.addPixel(dsData.data[pxIdx].x, dsData.data[pxIdx].y, metadata);
                }
                this._datasetColl.push(ds);

                // collect document metadata
                if (dsData.file !== undefined) {
                    collectMetadata('file', 'datasets', dsData.file, ds);
                }
                if (dsData.page !== undefined) {
                    collectMetadata('page', 'datasets', dsData.page, ds);
                }

                // set axes for this dataset
                const axIdx = this.getAxesNames().indexOf(dsData.axesName);
                if (axIdx >= 0) {
                    this.setAxesForDataset(ds, this._axesColl[axIdx]);
                }

                // autodetector
                if (dsData.autoDetectionData != null) {
                    let autoDetectionData = new wpd.AutoDetectionData();
                    autoDetectionData.deserialize(dsData.autoDetectionData);
                    this.setAutoDetectionDataForDataset(ds, autoDetectionData);
                }
            }
        }

        // measurements
        if (data.measurementColl != null) {
            for (let msIdx = 0; msIdx < data.measurementColl.length; msIdx++) {
                const msData = data.measurementColl[msIdx];
                let ms = null;
                if (msData.type === "Distance") {
                    ms = new wpd.DistanceMeasurement();
                    this._measurementColl.push(ms);
                    // set axes
                    const axIdx = this.getAxesNames().indexOf(msData.axesName);
                    if (axIdx >= 0) {
                        this.setAxesForMeasurement(ms, this._axesColl[axIdx]);
                    }
                } else if (msData.type === "Angle") {
                    ms = new wpd.AngleMeasurement();
                    this._measurementColl.push(ms);
                } else if (msData.type === "Area") {
                    ms = new wpd.AreaMeasurement();
                    this._measurementColl.push(ms);
                    // set axes
                    const axIdx = this.getAxesNames().indexOf(msData.axesName);
                    if (axIdx >= 0) {
                        this.setAxesForMeasurement(ms, this._axesColl[axIdx]);
                    }
                }
                if (ms != null) {
                    // add connections
                    for (let cIdx = 0; cIdx < msData.data.length; cIdx++) {
                        ms.addConnection(msData.data[cIdx]);
                    }

                    // collect document metadata
                    if (msData.file !== undefined) {
                        collectMetadata('file', 'measurements', msData.file, ms);
                    }
                    if (msData.page !== undefined) {
                        collectMetadata('page', 'measurements', msData.page, ms);
                    }
                }
            }
        }

        // misc
        if (data.misc != null) {
            documentMetadata.misc = data.misc;
        }

        return documentMetadata;
    }

    deserialize(data) {
        this.reset();
        try {
            if (data.wpd != null && data.wpd.version[0] === 3) {
                return this._deserializePreVersion4(data.wpd);
            }
            if (data.version != null && data.version[0] === 4) {
                return this._deserializeVersion4(data);
            }
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    serialize(documentMetadata) {
        let data = {};
        data.version = [4, 2];
        data.axesColl = [];
        data.datasetColl = [];
        data.measurementColl = [];

        // axes data
        for (let axIdx = 0; axIdx < this._axesColl.length; axIdx++) {
            const axes = this._axesColl[axIdx];
            let axData = {};
            axData.name = axes.name;

            // file and page metadata
            if (documentMetadata) {
                if (documentMetadata.file && documentMetadata.file.axes[axes.name] !== undefined) {
                    axData.file = documentMetadata.file.axes[axes.name];
                }
                if (documentMetadata.page && documentMetadata.page.axes[axes.name] !== undefined) {
                    axData.page = documentMetadata.page.axes[axes.name];
                }
            }

            // axes data
            if (axes instanceof wpd.XYAxes) {
                axData.type = "XYAxes";
                axData.isLogX = axes.isLogX();
                axData.isLogY = axes.isLogY();
                axData.noRotation = axes.noRotation();
            } else if (axes instanceof wpd.BarAxes) {
                axData.type = "BarAxes";
                axData.isLog = axes.isLog();
                axData.isRotated = axes.isRotated();
            } else if (axes instanceof wpd.PolarAxes) {
                axData.type = "PolarAxes";
                axData.isDegrees = axes.isThetaDegrees();
                axData.isClockwise = axes.isThetaClockwise();
                axData.isLog = axes.isRadialLog();
            } else if (axes instanceof wpd.TernaryAxes) {
                axData.type = "TernaryAxes";
                axData.isRange100 = axes.isRange100();
                axData.isNormalOrientation = axes.isNormalOrientation;
            } else if (axes instanceof wpd.MapAxes) {
                axData.type = "MapAxes";
                axData.scaleLength = axes.getScaleLength();
                axData.unitString = axes.getUnits();
                axData.originLocation = axes.getOriginLocation();
                axData.imageHeight = axes.getImageHeight();
            } else if (axes instanceof wpd.ImageAxes) {
                axData.type = "ImageAxes";
            } else if (axes instanceof wpd.CircularChartRecorderAxes) {
                axData.type = "CircularChartRecorderAxes";
                axData.startTime = axes.getStartTime();
                axData.rotationTime = axes.getRotationTime();
                axData.rotationDirection = axes.getRotationDirection();
            }

            // include axes metadata, if present
            if (Object.keys(axes.getMetadata()).length > 0) {
                axData.metadata = axes.getMetadata();
            }

            // calibration points
            if (!(axes instanceof wpd.ImageAxes)) {
                axData.calibrationPoints = [];
                for (let calIdx = 0; calIdx < axes.calibration.getCount(); calIdx++) {
                    axData.calibrationPoints.push(axes.calibration.getPoint(calIdx));
                }
            }

            data.axesColl.push(axData);
        }

        // datasets
        for (let dsIdx = 0; dsIdx < this._datasetColl.length; dsIdx++) {
            const ds = this._datasetColl[dsIdx];
            const axes = this.getAxesForDataset(ds);
            const autoDetectionData = this.getAutoDetectionDataForDataset(ds);

            // dataset information
            let dsData = {};
            dsData.name = ds.name;
            dsData.axesName = axes != null ? axes.name : "";
            dsData.colorRGB = ds.colorRGB.serialize();
            dsData.metadataKeys = ds.getMetadataKeys(); // point metadata keys
            // include file and page information, if present
            if (documentMetadata) {
                if (documentMetadata.file && documentMetadata.file.datasets[ds.name] !== undefined) {
                    dsData.file = documentMetadata.file.datasets[ds.name];
                }
                if (documentMetadata.page && documentMetadata.page.datasets[ds.name] !== undefined) {
                    dsData.page = documentMetadata.page.datasets[ds.name];
                }
            }
            // include point group names, if present
            if (ds.hasPointGroups()) {
                dsData.groupNames = ds.getPointGroups();
            }
            // include dataset metadata, if present
            if (Object.keys(ds.getMetadata()).length > 0) {
                // this is metadata on the dataset itself, not to be confused with metadataKeys which denote metadata keys on
                // each data point within the dataset
                dsData.metadata = ds.getMetadata();
            }

            // data points
            dsData.data = [];
            for (let pxIdx = 0; pxIdx < ds.getCount(); pxIdx++) {
                let px = ds.getPixel(pxIdx);

                // include point group data, if present
                if (ds.hasPointGroups()) {
                    const tupleIdx = ds.getTupleIndex(pxIdx)
                    const groupIdx = ds.getPointGroupIndexInTuple(tupleIdx, pxIdx);
                    if (tupleIdx > -1 && groupIdx > -1) {
                        px.tuple = tupleIdx;
                        px.group = groupIdx;
                    }
                }

                dsData.data[pxIdx] = px;
                if (axes != null) {
                    dsData.data[pxIdx].value = axes.pixelToData(px.x, px.y);
                }
            }
            dsData.autoDetectionData =
                autoDetectionData != null ? autoDetectionData.serialize() : null;
            data.datasetColl.push(dsData);
        }

        // measurements
        for (let msIdx = 0; msIdx < this._measurementColl.length; msIdx++) {
            const ms = this._measurementColl[msIdx];
            const axes = this.getAxesForMeasurement(ms);
            let msData = {};
            if (ms instanceof wpd.DistanceMeasurement) {
                msData.type = "Distance";
                msData.name = "Distance";
                msData.axesName = axes != null ? axes.name : "";
            } else if (ms instanceof wpd.AngleMeasurement) {
                msData.type = "Angle";
                msData.name = "Angle";
            } else if (ms instanceof wpd.AreaMeasurement) {
                msData.type = "Area";
                msData.name = "Area";
                msData.axesName = axes != null ? axes.name : "";
            }
            if (documentMetadata) {
                if (documentMetadata.file && documentMetadata.file.measurements[msIdx] !== undefined) {
                    msData.file = documentMetadata.file.measurements[msIdx];
                }
                if (documentMetadata.page && documentMetadata.page.measurements[msIdx] !== undefined) {
                    msData.page = documentMetadata.page.measurements[msIdx];
                }
            }
            msData.data = [];
            for (let cIdx = 0; cIdx < ms.connectionCount(); cIdx++) {
                msData.data.push(ms.getConnectionAt(cIdx));
            }
            data.measurementColl.push(msData);
        }

        if (documentMetadata && documentMetadata.misc) {
            data.misc = documentMetadata.misc;
        }

        return data;
    }
};
