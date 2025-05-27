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

wpd.gridDetection = (function() {
    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        wpd.sidebar.show('grid-detection-sidebar');
        sidebarInit();
    }

    function sidebarInit() {
        let $colorPickerBtn = document.getElementById('grid-color-picker-button');
        let $backgroundMode = document.getElementById('grid-background-mode');
        let autodetector = wpd.appData.getPlotData().getGridDetectionData();
        let color = autodetector.lineColor;
        let backgroundMode = autodetector.gridBackgroundMode;

        if (color != null) {
            $colorPickerBtn.style.backgroundColor =
                'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            if (color[0] + color[1] + color[2] < 200) {
                $colorPickerBtn.style.color = 'rgb(255,255,255)';
            } else {
                $colorPickerBtn.style.color = 'rgb(0,0,0)';
            }
        }

        $backgroundMode.checked = backgroundMode;
    }

    function markBox() {
        let tool = new wpd.GridBoxTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function viewMask() {
        let tool = new wpd.GridViewMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function clearMask() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.appData.getPlotData().getGridDetectionData().gridMask = {
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null,
            pixels: new Set()
        };
        wpd.graphicsWidget.resetData();
    }

    function grabMask() {
        // Mask is just a list of pixels with the yellow color in the data layer
        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();
        let maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        let maskData = new Set();
        let mi = 0;
        let autoDetector = wpd.appData.getPlotData().getGridDetectionData();

        for (let i = 0; i < maskDataPx.data.length; i += 4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i + 1] === 255 &&
                maskDataPx.data[i + 2] === 0) {

                maskData.add(i / 4);
                mi++;

                let x = parseInt((i / 4) % imageSize.width, 10);
                let y = parseInt((i / 4) / imageSize.width, 10);

                if (mi === 1) {
                    autoDetector.gridMask.xmin = x;
                    autoDetector.gridMask.xmax = x;
                    autoDetector.gridMask.ymin = y;
                    autoDetector.gridMask.ymax = y;
                } else {
                    if (x < autoDetector.gridMask.xmin) {
                        autoDetector.gridMask.xmin = x;
                    }
                    if (x > autoDetector.gridMask.xmax) {
                        autoDetector.gridMask.xmax = x;
                    }
                    if (y < autoDetector.gridMask.ymin) {
                        autoDetector.gridMask.ymin = y;
                    }
                    if (y > autoDetector.gridMask.ymax) {
                        autoDetector.gridMask.ymax = y;
                    }
                }
            }
        }
        autoDetector.gridMask.pixels = maskData;
    }

    function run() {

        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();

        // For now, just reset before detecting, otherwise users will get confused:
        reset();

        let autoDetector = wpd.appData.getPlotData().getGridDetectionData();
        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();
        let $xperc = document.getElementById('grid-horiz-perc');
        let $yperc = document.getElementById('grid-vert-perc');
        let horizEnable = document.getElementById('grid-horiz-enable').checked;
        let vertEnable = document.getElementById('grid-vert-enable').checked;
        let backgroundMode = document.getElementById('grid-background-mode').checked;
        let plotData = wpd.appData.getPlotData();

        if (autoDetector.backupImageData == null) {
            autoDetector.backupImageData =
                ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        }

        let imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        autoDetector.generateBinaryData(imageData);

        // gather detection parameters from GUI

        wpd.gridDetectionCore.setHorizontalParameters(horizEnable, $xperc.value);
        wpd.gridDetectionCore.setVerticalParameters(vertEnable, $yperc.value);
        autoDetector.gridData = wpd.gridDetectionCore.run(autoDetector);

        // edit image
        wpd.graphicsWidget.runImageOp(removeGridLinesOp);

        // cleanup memory
        wpd.appData.getPlotData().getGridDetectionData().gridData = null;
    }

    function resetImageOp(idata, width, height) {
        let bkImg = wpd.appData.getPlotData().getGridDetectionData().backupImageData;

        for (let i = 0; i < bkImg.data.length; i++) {
            idata.data[i] = bkImg.data[i];
        }

        return {
            imageData: idata,
            width: width,
            height: height,
            keepZoom: true
        };
    }

    function reset() {
        wpd.graphicsWidget.removeTool();
        wpd.appData.getPlotData().getGridDetectionData().gridData = null;
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();

        let plotData = wpd.appData.getPlotData();
        if (plotData.getGridDetectionData().backupImageData != null) {
            wpd.graphicsWidget.runImageOp(resetImageOp);
        }
    }

    function removeGridLinesOp(idata, width, height) {
        /* image op to remove grid lines */
        let gridData = wpd.appData.getPlotData().getGridDetectionData().gridData;
        let bgColor = wpd.appData.getPlotData().getTopColors()[0];

        if (bgColor == null) {
            bgColor = {
                r: 255,
                g: 0,
                b: 0
            };
        }

        if (gridData != null) {
            for (let rowi = 0; rowi < height; rowi++) {
                for (let coli = 0; coli < width; coli++) {
                    let pindex = 4 * (rowi * width + coli);
                    if (gridData.has(pindex / 4)) {
                        idata.data[pindex] = bgColor.r;
                        idata.data[pindex + 1] = bgColor.g;
                        idata.data[pindex + 2] = bgColor.b;
                        idata.data[pindex + 3] = 255;
                    }
                }
            }
        }

        return {
            imageData: idata,
            width: width,
            height: height
        };
    }

    function startColorPicker() {
        wpd.colorSelectionWidget.setParams({
            color: wpd.appData.getPlotData().getGridDetectionData().lineColor,
            triggerElementId: 'grid-color-picker-button',
            parentElementId: 'grid-color-picker-container',
            setColorDelegate: function(
                col) {
                wpd.appData.getPlotData().getGridDetectionData().lineColor = col;
            }
        });
        wpd.colorSelectionWidget.startPicker();
    }

    function testColor() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.GridColorFilterRepainter());

        let autoDetector = wpd.appData.getPlotData().getGridDetectionData();

        changeColorDistance();

        let ctx = wpd.graphicsWidget.getAllContexts();
        let imageSize = wpd.graphicsWidget.getImageSize();
        let imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateBinaryData(imageData);

        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData,
            autoDetector.gridMask.pixels);
    }

    function changeColorDistance() {
        let color_distance = parseFloat(document.getElementById('grid-color-distance').value);
        wpd.appData.getPlotData().getGridDetectionData().colorDistance = color_distance;
    }

    function changeBackgroundMode() {
        let backgroundMode = document.getElementById('grid-background-mode').checked;
        wpd.appData.getPlotData().getGridDetectionData().gridBackgroundMode = backgroundMode;
    }

    return {
        start: start,
        markBox: markBox,
        clearMask: clearMask,
        viewMask: viewMask,
        grabMask: grabMask,
        startColorPicker: startColorPicker,
        changeColorDistance: changeColorDistance,
        changeBackgroundMode: changeBackgroundMode,
        testColor: testColor,
        run: run,
        reset: reset
    };
})();
