/*
	WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

	Copyright 2010-2018 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.gridDetection = (function () {
    
    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        wpd.sidebar.show('grid-detection-sidebar');
        sidebarInit();
    }

    function sidebarInit() {
        var $colorPickerBtn = document.getElementById('grid-color-picker-button'),
            $backgroundMode = document.getElementById('grid-background-mode'),
            autodetector = wpd.appData.getPlotData().getAutoDetector(),
            color = autodetector.gridLineColor,
            backgroundMode = autodetector.gridBackgroundMode;

        if(color != null) {
            $colorPickerBtn.style.backgroundColor = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
            if(color[0] + color[1] + color[2] < 200) {
                $colorPickerBtn.style.color = 'rgb(255,255,255)';
            } else {
                $colorPickerBtn.style.color = 'rgb(0,0,0)';
            }
        }

        $backgroundMode.checked = backgroundMode;

        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize();
        autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
    }

    function markBox() {
        var tool = new wpd.GridBoxTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function viewMask() {
        var tool = new wpd.GridViewMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function clearMask() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.appData.getPlotData().getAutoDetector().gridMask = {
                xmin: null,
                xmax: null,
                ymin: null,
                ymax: null,
                pixels: []
            };
        wpd.graphicsWidget.resetData();
    }

    function grabMask() {
        // Mask is just a list of pixels with the yellow color in the data layer
        var ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height),
            maskData = [],
            i,
            mi = 0,
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            x, y;
        for(i = 0; i < maskDataPx.data.length; i+=4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i+1] === 255 && maskDataPx.data[i+2] === 0) {
                
                maskData[mi] = i/4; mi++;

                x = parseInt((i/4)%imageSize.width, 10);
                y = parseInt((i/4)/imageSize.width, 10);

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

        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            $xperc = document.getElementById('grid-horiz-perc'),
            $yperc = document.getElementById('grid-vert-perc'),
            horizEnable = document.getElementById('grid-horiz-enable').checked,
            vertEnable = document.getElementById('grid-vert-enable').checked,
            backgroundMode = document.getElementById('grid-background-mode').checked,
            plotData = wpd.appData.getPlotData();
        
        if(autoDetector.backupImageData == null) {
            autoDetector.backupImageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        }

        autoDetector.imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        autoDetector.generateGridBinaryData();

        // gather detection parameters from GUI

        wpd.gridDetectionCore.setHorizontalParameters(horizEnable, $xperc.value);
        wpd.gridDetectionCore.setVerticalParameters(vertEnable, $yperc.value);
        wpd.appData.getPlotData().getAutoDetector().gridData = wpd.gridDetectionCore.run(autoDetector);

        // edit image
        wpd.graphicsWidget.runImageOp(removeGridLinesOp);

        // cleanup memory
        wpd.appData.getPlotData().getAutoDetector().gridData = null;
    }

    function resetImageOp(idata, width, height) {
        var bkImg = wpd.appData.getPlotData().getAutoDetector().backupImageData,
            i;

        for(i = 0; i < bkImg.data.length; i++) {
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
        wpd.appData.getPlotData().getAutoDetector().gridData = null;
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();

        var plotData = wpd.appData.getPlotData();
        if(plotData.getAutoDetector().backupImageData != null) {
            wpd.graphicsWidget.runImageOp(resetImageOp);
        }
    }

    function removeGridLinesOp(idata, width, height) {
        /* image op to remove grid lines */
        var gridData = wpd.appData.getPlotData().getAutoDetector().gridData,
            bgColor = wpd.appData.getPlotData().getAutoDetector().topColors[0],
            rowi,
            coli,
            pindex;

        if(bgColor == null) { 
            bgColor = { r: 255, g: 0, b: 0 }; 
        }
        
        if(gridData != null) {
            for(rowi = 0; rowi < height; rowi++) {
                for(coli = 0; coli < width; coli++) {
                    pindex = 4*(rowi*width + coli);
                    if(gridData[pindex/4] === true) {
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
            color: wpd.appData.getPlotData().getAutoDetector().gridLineColor,
            triggerElementId: 'grid-color-picker-button',
            title: 'Specify Grid Line Color',
            setColorDelegate: function(col) {
                wpd.appData.getPlotData().getAutoDetector().gridLineColor = col;
            }
        });
        wpd.colorSelectionWidget.startPicker();
    }

    function testColor() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.GridColorFilterRepainter());

        var autoDetector = wpd.appData.getPlotData().getAutoDetector();

        changeColorDistance();
        autoDetector.generateGridBinaryData();

        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.gridBinaryData, autoDetector.gridMask.pixels);
    }

    function changeColorDistance() {
        var color_distance = parseFloat(document.getElementById('grid-color-distance').value);
        wpd.appData.getPlotData().getAutoDetector().gridColorDistance = color_distance;
    }

    function changeBackgroundMode() {
        var backgroundMode = document.getElementById('grid-background-mode').checked;
        wpd.appData.getPlotData().getAutoDetector().gridBackgroundMode = backgroundMode;
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
