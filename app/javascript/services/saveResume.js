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

wpd.saveResume = (function () {

    function save() {
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
        const plotData = wpd.appData.getPlotData();
        plotData.deserialize(json_data);
        wpd.tree.refresh();
    }

    function generateJSON() {
        var plotData = wpd.appData.getPlotData(),
            axes = plotData.getAxesCount() > 0 ? plotData.getAxesColl()[0] : null,
            calibration = axes != null ? axes.calibration : null,
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

        if(axes != null) {
            if(axes instanceof wpd.XYAxes) {
                outData.wpd.axesType = 'XYAxes';
                outData.wpd.axesParameters = {
                    isLogX: axes.isLogX(),
                    isLogY: axes.isLogY()
                };
            } else if(axes instanceof wpd.BarAxes) {
                outData.wpd.axesType = 'BarAxes';
                outData.wpd.axesParameters = {
                    isLog: axes.isLog()
                };
            } else if(axes instanceof wpd.PolarAxes) {
                outData.wpd.axesType = 'PolarAxes';
                outData.wpd.axesParameters = {
                    isDegrees: axes.isThetaDegrees(),
                    isClockwise: axes.isThetaClockwise()
                };
            } else if(axes instanceof wpd.TernaryAxes) {
                outData.wpd.axesType = 'TernaryAxes';
                outData.wpd.axesParameters = {
                    isRange100: axes.isRange100(),
                    isNormalOrientation: axes.isNormalOrientation()
                };
            } else if(axes instanceof wpd.MapAxes) {
                outData.wpd.axesType = 'MapAxes';
                outData.wpd.axesParameters = {
                    scaleLength: axes.getScaleLength(),
                    unitString: axes.getUnits() 
                };
            } else if(axes instanceof wpd.ImageAxes) {
                outData.wpd.axesType = 'ImageAxes';
            }
        }

        let dsColl = plotData.getDatasets();
        for(i = 0; i < dsColl.length; i++) {
            ds = dsColl[i];
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
                outData.wpd.dataSeries[i].data[j].value = axes.pixelToData(pixel.x, pixel.y);
            }
        }

        /*
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
        */
        
        json_string = JSON.stringify(outData);
        return json_string;
    }

    function stripIllegalCharacters(filename) {
        return filename.replace(/[^a-zA-Z\d+\.\-_\s]/g,"_");
    }

    function downloadJSON() {
        // get project name
        let projectName = stripIllegalCharacters(document.getElementById("project-name-input").value) + ".json";

        wpd.download.json(generateJSON(), projectName); 
        wpd.popup.close('export-json-window');
    }

    function downloadProject() {        
        // get project name
        let projectName = stripIllegalCharacters(document.getElementById("project-name-input").value);

        // get JSON
        let json = generateJSON();

        // get Image
        let imageFile = wpd.graphicsWidget.getImagePNG();

        // projectInfo
        let projectInfo = JSON.stringify({"version": [4,0], "json": "wpd.json", "image": "image.png"});

        // generate project file
        let tarWriter = new tarball.TarWriter();
        tarWriter.addFolder(projectName + "/");
        tarWriter.addTextFile(projectName + "/info.json", projectInfo);
        tarWriter.addTextFile(projectName + "/wpd.json", json);
        tarWriter.addFile(projectName + "/image.png", imageFile);
        tarWriter.download(projectName + ".tar");
        wpd.popup.close('export-json-window');
    }

    function readJSONFileOnly(jsonFile) {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            var json_data = JSON.parse(fileReader.result);
            resumeFromJSON(json_data); 
            
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.removeTool();
            wpd.graphicsWidget.removeRepainter();            
            wpd.tree.refresh();
            wpd.messagePopup.show(wpd.gettext('import-json'), wpd.gettext("json-data-loaded"));
        };
        fileReader.readAsText(jsonFile);
    }

    function readProjectFile(file) {
        wpd.busyNote.show();
        var tarReader = new tarball.TarReader();
        tarReader.readFile(file).then(function(fileInfo) {
            wpd.busyNote.close();
            let infoIndex = fileInfo.findIndex(info => info.name.endsWith("/info.json"));
            if(infoIndex >= 0) {
                let projectName = fileInfo[infoIndex].name.replace("/info.json","");
                let wpdimage = tarReader.getFileBlob(projectName + "/image.png", "image/png");
                wpdimage.name = "image.png";                
                let wpdjson = JSON.parse(tarReader.getTextFile(projectName + "/wpd.json"));
                wpd.imageManager.loadFromFile(wpdimage, true).then(() => {
                    resumeFromJSON(wpdjson);
                    wpd.tree.refresh();
                    wpd.messagePopup.show(wpd.gettext('import-json'), wpd.gettext("json-data-loaded"));
                });
            }
        }, function(err) {
            console.log(err);
        });
    }   

    function read() {
        const $fileInput = document.getElementById('import-json-file');
        wpd.popup.close('import-json-window');
        if($fileInput.files.length === 1) {
            let file = $fileInput.files[0];
            
            if(file.type == "application/json") {
                readJSONFileOnly(file);
            } else {
                readProjectFile(file);
            }            
        }
    }

    return {
        save: save,
        load: load,
        downloadJSON: downloadJSON,
        downloadProject: downloadProject,
        read: read
    };
})();
