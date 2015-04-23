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
wpd.autoExtraction = (function () {

    function start() {
        wpd.sidebar.show('auto-extraction-sidebar');
        updateDatasetControl();
        wpd.colorPicker.init();
        wpd.algoManager.updateAlgoList();
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
          
    return {
        start: start,
        updateDatasetControl: updateDatasetControl,
        changeDataset: changeDataset
    };
})();


// Manage auto extract algorithms
wpd.algoManager = (function() {

    var axesPtr;

    function updateAlgoList() {
        
        var innerHTML = '',
            axes = wpd.appData.getPlotData().axes,
            $algoOptions = document.getElementById('auto-extract-algo-name');

        if(axes === axesPtr) {
            return; // don't re-render if already done for this axes object.
        } else {
            axesPtr = axes;
        }

        // Averaging Window
        if(!(axes instanceof wpd.BarAxes)) {
            innerHTML += '<option value="averagingWindow">Averaging Window</option>';
        }

        // X Step w/ Interpolation and X Step
        if((axes instanceof wpd.XYAxes) && (!axes.isLogX()) && (!axes.isLogY())) {
            innerHTML += '<option value="XStepWithInterpolation">X Step w/ Interpolation</option>';
            innerHTML += '<option value="XStep">X Step</option>';
        }

        // Blob Detector
        if(!(axes instanceof wpd.BarAxes)) {
            innerHTML += '<option value="blobDetector">Blob Detector</option>';
        }

        // Bar Extraction
        if(axes instanceof wpd.BarAxes) {
            innerHTML += '<option value="barExtraction">Bar Extraction</option>';
        }

        // Histogram
        if(axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="histogram">Histogram</option>';
        }

        $algoOptions.innerHTML = innerHTML;

        applyAlgoSelection();
    }

    function applyAlgoSelection() {
        var $algoOptions = document.getElementById('auto-extract-algo-name'),
            selectedValue = $algoOptions.value,
            autoDetector = wpd.appData.getPlotData().getAutoDetector();

        if (selectedValue === 'averagingWindow') {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        } else if (selectedValue === 'XStepWithInterpolation') {
            autoDetector.algorithm = new wpd.XStepWithInterpolationAlgo();
        } else if (selectedValue === 'XStep') {
            autoDetector.algorithm = new wpd.AveragingWindowWithStepSizeAlgo();
        } else if (selectedValue === 'blobDetector') {
            autoDetector.algorithm = new wpd.BlobDetectorAlgo();
        } else if (selectedValue === 'barExtraction' || selectedValue === 'histogram') {
            autoDetector.algorithm = new wpd.BarExtractionAlgo();
        } else {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        }

        renderParameters(autoDetector.algorithm);
    }

    function renderParameters(algo) {
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

    function run() {
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
        };
        setTimeout(fn, 10); // This is required for the busy note to work!
    }

    return {
        updateAlgoList: updateAlgoList,
        applyAlgoSelection: applyAlgoSelection,
        run: run
    };
})();


