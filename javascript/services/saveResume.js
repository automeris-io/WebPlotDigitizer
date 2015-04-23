/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

var wpd = wpd || {};

wpd.saveResume = (function () {

    function save() {
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
       var plotData = wpd.appData.getPlotData(),
           rdata = json_data.wpd,
           calib,
           i, j, ds, currDataset;

       plotData.reset();
       wpd.appData.isAligned(false);
        
       if(rdata.axesType == null) {
           return;
       }

       if(rdata.axesType !== 'ImageAxes' 
           && (rdata.calibration == null || rdata.axesParameters == null)) {
           return;
       }

       if(rdata.axesType !== 'ImageAxes') {
           if(rdata.axesType === 'TernaryAxes') {
               calib = new wpd.Calibration(3);
           } else {
               calib = new wpd.Calibration(2);
           }
           for(i = 0; i < rdata.calibration.length; i++) {
               calib.addPoint(rdata.calibration[i].px,
                              rdata.calibration[i].py,
                              rdata.calibration[i].dx,
                              rdata.calibration[i].dy,
                              rdata.calibration[i].dz);

           }
           plotData.calibration = calib;
       }

       if(rdata.axesType === 'XYAxes') {
           plotData.axes = new wpd.XYAxes();
           if(!plotData.axes.calibrate(plotData.calibration, 
                                       rdata.axesParameters.isLogX,
                                       rdata.axesParameters.isLogY)) {
               return;
           }
       } else if (rdata.axesType === 'BarAxes') {
           plotData.axes = new wpd.BarAxes();
           if(!plotData.axes.calibrate(plotData.calibration, rdata.axesParameters.isLog)) {
               return;
           }
       } else if (rdata.axesType === 'PolarAxes') {
           plotData.axes = new wpd.PolarAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.isDegrees,
                                      rdata.axesParameters.isClockwise)) {
               return;
           }
       } else if(rdata.axesType === 'TernaryAxes') {
           plotData.axes = new wpd.TernaryAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.isRange100,
                                      rdata.axesParameters.isNormalOrientation)) {
               return;
           }
       } else if(rdata.axesType === 'MapAxes') {
           plotData.axes = new wpd.MapAxes();
           if(!plotData.axes.calibrate(plotData.calibration,
                                      rdata.axesParameters.scaleLength,
                                      rdata.axesParameters.unitString)) {
               return;
           }
       } else if(rdata.axesType === 'ImageAxes') {
           plotData.axes = new wpd.ImageAxes();
       }

       wpd.appData.isAligned(true);
       
       if(rdata.dataSeries == null) {
           return;
       }

       for(i = 0; i < rdata.dataSeries.length; i++) {
           ds = rdata.dataSeries[i];
           plotData.dataSeriesColl[i] = new wpd.DataSeries();
           currDataset = plotData.dataSeriesColl[i];
           currDataset.name = ds.name;
           if(ds.metadataKeys != null) {
               currDataset.setMetadataKeys(ds.metadataKeys);
           }
           for(j = 0; j < ds.data.length; j++) {
               currDataset.addPixel(ds.data[j].x, ds.data[j].y, ds.data[j].metadata);
           }
       }

       if(rdata.distanceMeasurementData != null) {
           plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
           for(i = 0; i < rdata.distanceMeasurementData.length; i++) {
               plotData.distanceMeasurementData.addConnection(rdata.distanceMeasurementData[i]);
           }
       }

       if(rdata.angleMeasurementData != null) {
           plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
           for(i = 0; i < rdata.angleMeasurementData.length; i++) {
               plotData.angleMeasurementData.addConnection(rdata.angleMeasurementData[i]);
           }
       }


    }

    function generateJSON() {
        var plotData = wpd.appData.getPlotData(),
            calibration = plotData.calibration,
            outData = {
                    wpd: {
                        version: [3, 8], // [major, minor, subminor,...]
                        axesType: null,
                        axesParameters: null,
                        calibration: null,
                        dataSeries: [],
                        distanceMeasurementData: null,
                        angleMeasurementData: null
                    }
                },
            json_string = '',
            i,j,
            ds,
            pixel,
            mkeys;
        
        if(calibration != null) {
            outData.wpd.calibration = [];
            for(i = 0; i < calibration.getCount(); i++) {
                outData.wpd.calibration[i] = calibration.getPoint(i);
            }
        }

        if(plotData.axes != null) {
            if(plotData.axes instanceof wpd.XYAxes) {
                outData.wpd.axesType = 'XYAxes';
                outData.wpd.axesParameters = {
                    isLogX: plotData.axes.isLogX(),
                    isLogY: plotData.axes.isLogY()
                };
            } else if(plotData.axes instanceof wpd.BarAxes) {
                outData.wpd.axesType = 'BarAxes';
                outData.wpd.axesParameters = {
                    isLog: plotData.axes.isLog()
                };
            } else if(plotData.axes instanceof wpd.PolarAxes) {
                outData.wpd.axesType = 'PolarAxes';
                outData.wpd.axesParameters = {
                    isDegrees: plotData.axes.isThetaDegrees(),
                    isClockwise: plotData.axes.isThetaClockwise()
                };
            } else if(plotData.axes instanceof wpd.TernaryAxes) {
                outData.wpd.axesType = 'TernaryAxes';
                outData.wpd.axesParameters = {
                    isRange100: plotData.axes.isRange100(),
                    isNormalOrientation: plotData.axes.isNormalOrientation()
                };
            } else if(plotData.axes instanceof wpd.MapAxes) {
                outData.wpd.axesType = 'MapAxes';
                outData.wpd.axesParameters = {
                    scaleLength: plotData.axes.getScaleLength(),
                    unitString: plotData.axes.getUnits() 
                };
            } else if(plotData.axes instanceof wpd.ImageAxes) {
                outData.wpd.axesType = 'ImageAxes';
            }
        }

        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            ds = plotData.dataSeriesColl[i];
            outData.wpd.dataSeries[i] = {
                name: ds.name,
                data: []
            };
            mkeys = ds.getMetadataKeys();
            if(mkeys != null) {
                outData.wpd.dataSeries[i].metadataKeys = mkeys;
            }
            for(j = 0; j < ds.getCount(); j++) {
                pixel = ds.getPixel(j);
                outData.wpd.dataSeries[i].data[j] = pixel;
                outData.wpd.dataSeries[i].data[j].value = plotData.axes.pixelToData(pixel.x, pixel.y);
            }
        }

        if (plotData.distanceMeasurementData != null) {
            outData.wpd.distanceMeasurementData = [];
            for(i = 0; i < plotData.distanceMeasurementData.connectionCount(); i++) {
                outData.wpd.distanceMeasurementData[i] = plotData.distanceMeasurementData.getConnectionAt(i);
            }
        }
        if(plotData.angleMeasurementData != null) {
            outData.wpd.angleMeasurementData = [];
            for(i = 0; i < plotData.angleMeasurementData.connectionCount(); i++) {
                outData.wpd.angleMeasurementData[i] = plotData.angleMeasurementData.getConnectionAt(i);
            }
        }

        json_string = JSON.stringify(outData);
        return json_string;
    }

    function download() {
        wpd.download.json(generateJSON()); 
        wpd.popup.close('export-json-window');
    }

    function read() {
        var $fileInput = document.getElementById('import-json-file');
        wpd.popup.close('import-json-window');
        if($fileInput.files.length === 1) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var json_data = JSON.parse(fileReader.result);
                resumeFromJSON(json_data); 
                
                wpd.graphicsWidget.resetData();
                wpd.graphicsWidget.removeTool();
                wpd.graphicsWidget.removeRepainter();
                if(wpd.appData.isAligned()) {
                    wpd.acquireData.load();
                }
                wpd.messagePopup.show("Import JSON","JSON data has been loaded!");
            };
            fileReader.readAsText($fileInput.files[0]);
        }
    }

    return {
        save: save,
        load: load,
        download: download,
        read: read
    };
})();
