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
wpd.autoExtraction = (function () {

    function start() {
        wpd.sidebar.show('auto-extraction-sidebar');
        updateDatasetControl();
        wpd.colorPicker.init();
        changeAlgorithm();
    }

    function updateDatasetControl() {
        var plotData = wpd.appData.getPlotData(),
            currentDataset = plotData.getActiveDataSeries(), // just to create a dataset if there is none.
            currentIndex = plotData.getActiveDataSeriesIndex(),
            $datasetList = document.getElementById('automatic-sidebar-dataset-list'),
            listHTML = '',
            i;
        for(i = 0; i < plotData.dataSeriesColl.length; i++) {
            listHTML += '<option>'+plotData.dataSeriesColl[i].name+'</option>';
        }
        $datasetList.innerHTML = listHTML;
        $datasetList.selectedIndex = currentIndex;
    }

    function changeDataset() {
        var $datasetList = document.getElementById('automatic-sidebar-dataset-list'),
            index = $datasetList.selectedIndex;
        wpd.appData.getPlotData().setActiveDataSeriesIndex(index);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }

    function changeAlgorithm() {
        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            algoName = document.getElementById('auto-extract-algo-name').value;

        if(algoName === "averagingWindow") {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        } else if (algoName === 'XStep' || algoName === 'XStepWithInterpolation') {

            var axes = wpd.appData.getPlotData().axes;

            if (axes instanceof wpd.XYAxes && axes.isLogX() === false && axes.isLogY() === false) {
                if (algoName === 'XStep') {
                    autoDetector.algorithm = new wpd.AveragingWindowWithStepSizeAlgo();
                } else if (algoName === 'XStepWithInterpolation') {
                    autoDetector.algorithm = new wpd.XStepWithInterpolationAlgo();
                }
            } else {
                wpd.messagePopup.show('Not supported!', 'This algorithm is only supported for non log scale XY plots.');
                document.getElementById('auto-extract-algo-name').value = 'averagingWindow';
                autoDetector.algorithm = new wpd.AveragingWindowAlgo();
            }
        } else if (algoName === 'blobDetector') {
            autoDetector.algorithm = new wpd.BlobDetectorAlgo();
        }

        displayAlgoParameters(autoDetector.algorithm);
    }

    function displayAlgoParameters(algo) {
        var $paramContainer = document.getElementById('algo-parameter-container'),
            algoParams = algo.getParamList(),
            pi,
            tableString = "<table>";

        
        for(pi = 0; pi < algoParams.length; pi++) {
            tableString += '<tr><td>' + algoParams[pi][0] + 
                '</td><td><input type="text" size=3 id="algo-param-' + pi + 
                '" class="algo-params" value="'+ algoParams[pi][2] + '"/></td><td>' 
                + algoParams[pi][1] + '</td></tr>';
        }
        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
    }

    function runAlgo() {
        wpd.busyNote.show();
        var fn = function () {
            var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
                algo = autoDetector.algorithm,
                repainter = new wpd.DataPointsRepainter(),
                $paramFields = document.getElementsByClassName('algo-params'),
                pi,
                paramId, paramIndex,
                ctx = wpd.graphicsWidget.getAllContexts(),
                imageSize = wpd.graphicsWidget.getImageSize();

            for(pi = 0; pi < $paramFields.length; pi++) {
                paramId = $paramFields[pi].id;
                paramIndex = parseInt(paramId.replace('algo-param-', ''), 10);
                algo.setParam(paramIndex, parseFloat($paramFields[pi].value));
            }

            wpd.graphicsWidget.removeTool();

            autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
            autoDetector.generateBinaryData();
            wpd.graphicsWidget.setRepainter(repainter);
            algo.run(wpd.appData.getPlotData());
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.dataPointCounter.setCount();
            wpd.busyNote.close();
            return true;
        }
        setTimeout(fn, 10); // This is required for the busy note to work!
    }
  
    return {
        start: start,
        changeAlgorithm: changeAlgorithm,
        runAlgo: runAlgo,
        updateDatasetControl: updateDatasetControl,
        changeDataset: changeDataset
    };
})();



