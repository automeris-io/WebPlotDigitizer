/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
wpd.autoExtraction = (function() {
    function start() {
        wpd.colorPicker.init();
        wpd.algoManager.updateAlgoList();
    }

    return {
        start: start
    };
})();

// Manage auto extract algorithms
wpd.algoManager = (function() {
    var axes, dataset;

    function updateAlgoList() {

        dataset = wpd.tree.getActiveDataset();
        axes = wpd.appData.getPlotData().getAxesForDataset(dataset);

        let innerHTML = '';
        let $algoOptions = document.getElementById('auto-extract-algo-name');

        // Averaging Window
        if (!(axes instanceof wpd.BarAxes)) {
            innerHTML +=
                '<option value="averagingWindow">' + wpd.gettext('averaging-window') + '</option>';
        }

        // X Step w/ Interpolation and X Step
        if (axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="XStepWithInterpolation">' +
                wpd.gettext('x-step-with-interpolation') + '</option>';
            innerHTML += '<option value="XStep">' + wpd.gettext('x-step') + '</option>';
        }

        // Blob Detector
        if (!(axes instanceof wpd.BarAxes)) {
            innerHTML +=
                '<option value="blobDetector">' + wpd.gettext('blob-detector') + '</option>';
        }

        // Bar Extraction
        if (axes instanceof wpd.BarAxes) {
            innerHTML +=
                '<option value="barExtraction">' + wpd.gettext('bar-extraction') + '</option>';
        }

        // Histogram
        if (axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="histogram">' + wpd.gettext('histogram') + '</option>';
        }

        $algoOptions.innerHTML = innerHTML;

        let autoDetector = getAutoDetectionData();
        if (autoDetector.algorithm != null) {
            if (autoDetector.algorithm instanceof wpd.AveragingWindowAlgo) {
                $algoOptions.value = "averagingWindow";
            } else if (autoDetector.algorithm instanceof wpd.XStepWithInterpolationAlgo) {
                $algoOptions.value = "XStepWithInterpolation";
            } else if (autoDetector.algorithm instanceof wpd.AveragingWindowWithStepSizeAlgo) {
                $algoOptions.value = "XStep";
            } else if (autoDetector.algorithm instanceof wpd.BlobDetectorAlgo) {
                $algoOptions.value = "blobDetector";
            } else if (autoDetector.algorithm instanceof wpd.BarExtractionAlgo) {
                if (axes instanceof wpd.XYAxes) {
                    $algoOptions.value = "histogram";
                } else {
                    $algoOptions.value = "barExtraction";
                }
            }
            renderParameters(autoDetector.algorithm);
        } else {
            applyAlgoSelection();
        }
    }

    function getAutoDetectionData() {
        let ds = wpd.tree.getActiveDataset();
        return wpd.appData.getPlotData().getAutoDetectionDataForDataset(ds);
    }

    function applyAlgoSelection() {
        let $algoOptions = document.getElementById('auto-extract-algo-name');
        let selectedValue = $algoOptions.value;
        let autoDetector = getAutoDetectionData();

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
        let $paramContainer = document.getElementById('algo-parameter-container');
        let algoParams = algo.getParamList(axes);
        let tableString = "<table>";

        for (let pi = 0; pi < algoParams.length; pi++) {
            tableString += '<tr><td>' + algoParams[pi][0] +
                '</td><td><input type="text" size=3 id="algo-param-' + pi +
                '" class="algo-params" value="' + algoParams[pi][2] + '"/></td><td>' +
                algoParams[pi][1] + '</td></tr>';
        }

        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
    }

    function run() {
        wpd.busyNote.show();
        let autoDetector = getAutoDetectionData();
        let algo = autoDetector.algorithm;
        let repainter = new wpd.DataPointsRepainter(axes, dataset);
        let $paramFields = document.getElementsByClassName('algo-params');
        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();

        for (let pi = 0; pi < $paramFields.length; pi++) {
            let paramId = $paramFields[pi].id;
            let paramIndex = parseInt(paramId.replace('algo-param-', ''), 10);
            algo.setParam(paramIndex, parseFloat($paramFields[pi].value));
        }

        wpd.graphicsWidget.removeTool();

        let imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.imageWidth = imageSize.width;
        autoDetector.imageHeight = imageSize.height;
        autoDetector.generateBinaryData(imageData);
        wpd.graphicsWidget.setRepainter(repainter);
        algo.run(autoDetector, dataset, axes);
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount(dataset.getCount());
        wpd.busyNote.close();
        return true;
    }

    return {
        updateAlgoList: updateAlgoList,
        applyAlgoSelection: applyAlgoSelection,
        run: run
    };
})();

wpd.dataMask = (function() {
    function getAutoDetectionData() {
        let ds = wpd.tree.getActiveDataset();
        return wpd.appData.getPlotData().getAutoDetectionDataForDataset(ds);
    }

    function grabMask() {
        // Mask is just a list of pixels with the yellow color in the data layer
        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();
        let maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        let maskData = new Set();
        let autoDetector = getAutoDetectionData();

        for (let i = 0; i < maskDataPx.data.length; i += 4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i + 1] === 255 &&
                maskDataPx.data[i + 2] === 0) {
                maskData.add(i / 4);
            }
        }

        autoDetector.mask = maskData;
    }

    function markBox() {
        let tool = new wpd.BoxMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function markPen() {
        let tool = new wpd.PenMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function eraseMarks() {
        let tool = new wpd.EraseMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function viewMask() {
        let tool = new wpd.ViewMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function clearMask() {
        wpd.graphicsWidget.resetData();
        grabMask();
    }

    return {
        grabMask: grabMask,
        markBox: markBox,
        markPen: markPen,
        eraseMarks: eraseMarks,
        viewMask: viewMask,
        clearMask: clearMask
    };
})();