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

        // Bar Extraction
        if (axes instanceof wpd.BarAxes) {
            innerHTML +=
                '<option value="barExtraction">' + wpd.gettext('bar-extraction') + '</option>';
        }

        innerHTML += '<option value="templateMatcher">' + wpd.gettext('template-matcher') + '</option>';

        // X Step w/ Interpolation and X Step
        if (axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="XStepWithInterpolation">' +
                wpd.gettext('x-step-with-interpolation') + '</option>';
            innerHTML += '<option value="XStep">' + wpd.gettext('x-step') + '</option>';
        }

        // CustomIndependents
        if (axes instanceof wpd.XYAxes) {
            innerHTML += '<option value="CustomIndependents">' + wpd.gettext('custom-independents') + '</option>';
        }

        // Blob Detector
        if (!(axes instanceof wpd.BarAxes)) {
            innerHTML +=
                '<option value="blobDetector">' + wpd.gettext('blob-detector') + '</option>';
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
            } else if (autoDetector.algorithm instanceof wpd.CustomIndependents) {
                $algoOptions.value = "CustomIndependents";
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
            } else if (autoDetector.algorithm instanceof wpd.TemplateMatcherAlgo) {
                $algoOptions.value = "templateMatcher";
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
        } else if (selectedValue === 'CustomIndependents') {
            autoDetector.algorithm = new wpd.CustomIndependents();
        } else if (selectedValue === 'XStep') {
            autoDetector.algorithm = new wpd.AveragingWindowWithStepSizeAlgo();
        } else if (selectedValue === 'blobDetector') {
            autoDetector.algorithm = new wpd.BlobDetectorAlgo();
        } else if (selectedValue === 'barExtraction' || selectedValue === 'histogram') {
            autoDetector.algorithm = new wpd.BarExtractionAlgo();
        } else if (selectedValue == 'templateMatcher') {
            autoDetector.algorithm = new wpd.TemplateMatcherAlgo();
        } else {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        }

        renderParameters(autoDetector.algorithm);
    }

    function renderParameters(algo) {
        let $paramContainer = document.getElementById('algo-parameter-container');
        let algoParams = algo.getParamList(axes);
        let algoParamKeys = Object.keys(algoParams);
        let tableString = "<table>";

        for (let pi = 0; pi < algoParamKeys.length; pi++) {
            let algoParam = algoParams[algoParamKeys[pi]];
            tableString += '<tr><td>' + algoParam[0] +
                '</td><td><input type="text" size=3 id="algo-param-' + algoParamKeys[pi] +
                '" class="algo-params" value="' + algoParam[2] + '"/></td><td>' +
                algoParam[1] + '</td></tr>';
        }

        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
        let autoDetector = getAutoDetectionData();
        renderSpecialControls(autoDetector.algorithm);
    }

    function renderSpecialControls(algo) {
        // hide all custom controls first
        const $algoControls = document.querySelectorAll('.algo-controls');
        for (let $ctrl of $algoControls) {
            $ctrl.style.display = 'none';
        }

        // now enable the ones we need
        if (algo instanceof wpd.TemplateMatcherAlgo) {
            const $ctrls = document.getElementById('template-matcher-controls');
            $ctrls.style.display = "inline-block";
        } else if (algo instanceof wpd.CustomIndependents) {
            const $ctrls = document.getElementById('custom-indeps-controls');
            $ctrls.style.display = "inline-block";
        }
    }

    function selectTemplate(mode) {
        const autoDetector = getAutoDetectionData();
        const algo = autoDetector.algorithm;
        if (algo instanceof wpd.TemplateMatcherAlgo) {
            const ctx = wpd.graphicsWidget.getAllContexts();
            const imageSize = wpd.graphicsWidget.getImageSize();
            const imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
            autoDetector.imageWidth = imageSize.width;
            autoDetector.imageHeight = imageSize.height;
            autoDetector.generateBinaryData(imageData);
            if (mode === "point") {
                wpd.graphicsWidget.setTool(new wpd.TemplateMatcherPointTool(algo, autoDetector));
            } else {
                wpd.graphicsWidget.setTool(new wpd.TemplateMatcherBoxTool(algo, autoDetector));
            }
        }
    }

    function run() {
        wpd.busyNote.show();
        document.getElementById('algo-run-btn').disabled = true;
        let autoDetector = getAutoDetectionData();
        let algo = autoDetector.algorithm;
        let repainter = new wpd.DataPointsRepainter(axes, dataset);
        let $paramFields = document.getElementsByClassName('algo-params');
        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();

        let algoParams = {};
        for (let pi = 0; pi < $paramFields.length; pi++) {
            let paramId = $paramFields[pi].id;
            let paramVar = paramId.replace('algo-param-', '');
            algoParams[paramVar] = $paramFields[pi].value;
        }
        algo.setParams(algoParams);

        wpd.graphicsWidget.removeTool();

        let imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.imageWidth = imageSize.width;
        autoDetector.imageHeight = imageSize.height;
        autoDetector.generateBinaryData(imageData);
        wpd.graphicsWidget.setRepainter(repainter);

        const isTemplateMatching = algo instanceof wpd.TemplateMatcherAlgo;
        if (isTemplateMatching) {
            algo.setOnCompleteCallback(() => {
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.dataPointCounter.setCount(dataset.getCount());
                document.getElementById('algo-run-btn').disabled = false;
                wpd.busyNote.close();
            });
            algo.run(autoDetector, dataset, axes, imageData);
        } else {
            algo.run(autoDetector, dataset, axes, imageData);
            wpd.graphicsWidget.forceHandlerRepaint();
            wpd.dataPointCounter.setCount(dataset.getCount());
            document.getElementById('algo-run-btn').disabled = false;
            wpd.busyNote.close();
        }
        return true;
    }

    function getCustomXValues() {
        wpd.popup.show('custom-indeps-dialog');
        const $x = document.getElementById('custom-indeps-x-input');
        // todo populate this with the algo values
        let autoDetector = getAutoDetectionData();
        let algo = autoDetector.algorithm;
        if (!algo instanceof wpd.CustomIndependents) {
            console.error("incorrect algo type!");
            return
        }
        $x.value = algo.getXVals();
    }

    function setCustomXValues() {
        const $x = document.getElementById('custom-indeps-x-input');
        let autoDetector = getAutoDetectionData();
        let algo = autoDetector.algorithm;
        if (!algo instanceof wpd.CustomIndependents) {
            console.error("incorrect algo type!");
            return
        }
        algo.setXVals($x.value);
        wpd.popup.close('custom-indeps-dialog');
        // save it to the algo values
    }

    return {
        updateAlgoList: updateAlgoList,
        applyAlgoSelection: applyAlgoSelection,
        run: run,
        selectTemplate: selectTemplate,
        getCustomXValues: getCustomXValues,
        setCustomXValues: setCustomXValues,
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

        autoDetector.setMask(maskData);
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
