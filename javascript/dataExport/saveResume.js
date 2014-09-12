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

var wpd = wpd || {};

wpd.saveResume = (function () {

    function save() {
        wpd.popup.show('export-json-window');
    }

    function load() {
        wpd.popup.show('import-json-window');
    }

    function resumeFromJSON(json_data) {
        // call resume on individual components
    }

    function generateJSON() {
        var plotData = wpd.appData.getPlotData(),
            calibration = wpd.alignAxes.getActiveCalib(),
            outData = {
                    wpd: {
                        version: '3.4',
                        axesType: 'unknown',
                        axesParameters: {},
                        calibration: [],
                        dataSeries: [],
                        distanceMeasurementData: [],
                        angleMeasurementData: []
                    }
                },
            json_string = '',
            i,j,
            ds;
        
        if(calibration != null) {
            for(i = 0; i < calibration.getCount(); i++) {
                outData.wpd.calibration[i] = calibration.getPoint(i);
            }
        }

        if(plotData.axes != null) {
            if(plotData.axes instanceof wpd.XYAxes) {
                outData.wpd.axesType = 'XYAxes';
                outData.wpd.axesParameters = {
                    isLogX: plotData.axes.isLogX(),
                    isLogY: plotData.axes.isLogY(),
                    isDateX: plotData.axes.isDate(0),
                    isDateY: plotData.axes.isDate(1),
                    initialDateFormattingX: plotData.axes.getInitialDateFormat(0),
                    initialDateFormattingY: plotData.axes.getInitialDateFormat(1)
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
            for(j = 0; j < ds.getCount(); j++) {
                outData.wpd.dataSeries[i].data[j] = ds.getPixel(j);
            }
        }

        if (plotData.distanceMeasurementData != null) {
            for(i = 0; i < plotData.distanceMeasurementData.connectionCount(); i++) {
                outData.wpd.distanceMeasurementData[i] = plotData.distanceMeasurementData.getConnectionAt(i);
            }
        }
        if(plotData.angleMeasurementData != null) {
            for(i = 0; i < plotData.angleMeasurementData.connectionCount(); i++) {
                outData.wpd.angleMeasurementData[i] = plotData.angleMeasurementData.getConnectionAt(i);
            }
        }

        json_string = JSON.stringify(outData);
        return json_string;
    }

    function download() {
        var formContainer,
            formElement,
            formData,
            jsonData = generateJSON();
        
        // Create a hidden form and submit
        formContainer = document.createElement('div'),
        formElement = document.createElement('form'),
        formData = document.createElement('input');

        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'php/json.php');

        formData.setAttribute('type', "text");
        formData.setAttribute('name', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        formData.setAttribute('value', jsonData);
        formElement.submit();
        document.body.removeChild(formContainer);

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
