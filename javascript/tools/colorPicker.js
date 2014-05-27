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

wpd.colorPicker = (function () {

    function init() {
        var $colorBtn = document.getElementById('color-button'),
            $colorDistance = document.getElementById('color-distance-value'),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            $modeSelector = document.getElementById('color-detection-mode-select'),
            color;
        
        if(autoDetector.colorDetectionMode === 'fg') {
            color = autoDetector.fgColor;
        } else {
            color = autoDetector.bgColor;
        }
        color_distance = autoDetector.colorDistance;

        $colorBtn.style.backgroundColor = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
        $colorDistance.value = color_distance;
        $modeSelector.value = autoDetector.colorDetectionMode;
    }

    function startFGPicker() {
        var fg_color = wpd.appData.getPlotData().getAutoDetector().fgColor,
            $selectedColor = document.getElementById('selectedFGColorBox');

        $selectedColor.style.backgroundColor = 'rgb('+fg_color[0]+','+fg_color[1]+','+fg_color[2]+')';
        document.getElementById('color_red_fg').value = fg_color[0];
	    document.getElementById('color_green_fg').value = fg_color[1];
		document.getElementById('color_blue_fg').value = fg_color[2];
        renderColorOptions('fg');
        wpd.popup.show('colorPickerFG');
    }

    function startBGPicker() {
        var bg_color = wpd.appData.getPlotData().getAutoDetector().bgColor,
            $selectedColor = document.getElementById('selectedBGColorBox');

        $selectedColor.style.backgroundColor = 'rgb('+bg_color[0]+','+bg_color[1]+','+bg_color[2]+')';
        document.getElementById('color_red_bg').value = bg_color[0];
	    document.getElementById('color_green_bg').value = bg_color[1];
		document.getElementById('color_blue_bg').value = bg_color[2];
        renderColorOptions('bg');
        wpd.popup.show('colorPickerBG');
    }

    function renderColorOptions(mode) {
        var containerDivId = mode === 'fg' ? "fgColorOptions" : "bgColorOptions",
            $container = document.getElementById(containerDivId),
            topColors = wpd.appData.getPlotData().topColors,
            colorCount = topColors.length > 10 ? 10 : topColors.length,
            colori,
            containerHtml = "",
            perc,
            colorString;

        for (colori = 0; colori < colorCount; colori++) {

            colorString = 'rgb(' + topColors[colori].r + ',' + topColors[colori].g + ',' + topColors[colori].b + ');';
            perc = topColors[colori].percentage.toFixed(3) + "%";

            containerHtml += '<div class="colorOptionBox" style="background-color: ' + colorString + '\" title=\"' + perc 
                + '" onclick="wpd.colorPicker.selectTopColor('+ colori +',\''+ mode +'\');"></div>';
        }

        $container.innerHTML = containerHtml;
    }

    function selectTopColor(colorIndex, mode) {
        var color = [],
            topColors = wpd.appData.getPlotData().topColors;

        color[0] = topColors[colorIndex].r;
        color[1] = topColors[colorIndex].g;
        color[2] = topColors[colorIndex].b;
        
        if (mode === 'fg') {
            wpd.appData.getPlotData().getAutoDetector().fgColor = color;
            startFGPicker();
        } else {
            wpd.appData.getPlotData().getAutoDetector().bgColor = color;
            startBGPicker();
        }
    }

    function pickFGColor() {
        wpd.popup.close('colorPickerFG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().fgColor = col;
                wpd.graphicsWidget.removeTool();
                startFGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function pickBGColor() {
        wpd.popup.close('colorPickerBG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().bgColor = col;
                wpd.graphicsWidget.removeTool();
                startBGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function setFGColor() {
        var fg_color = [];
        fg_color[0] = parseInt(document.getElementById('color_red_fg').value, 10);
	    fg_color[1] = parseInt(document.getElementById('color_green_fg').value, 10);
		fg_color[2] = parseInt(document.getElementById('color_blue_fg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().fgColor = fg_color;
        wpd.popup.close('colorPickerFG');
        init();
    }

    function setBGColor() {
        var bg_color = [];
        bg_color[0] = parseInt(document.getElementById('color_red_bg').value, 10);
	    bg_color[1] = parseInt(document.getElementById('color_green_bg').value, 10);
		bg_color[2] = parseInt(document.getElementById('color_blue_bg').value, 10);
        wpd.appData.getPlotData().getAutoDetector().bgColor = bg_color;
        wpd.popup.close('colorPickerBG');
        init();
    }

    function changeColorDistance() {
        var color_distance = parseFloat(document.getElementById('color-distance-value').value);
        wpd.appData.getPlotData().getAutoDetector().colorDistance = color_distance;
    }

    function paintFilteredColor() {
         var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maski,
            img_index,
            imgx, imgy,
            dataLayer;

        dataLayer = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateBinaryData();
        
        if(autoDetector.mask == null || autoDetector.mask.length === 0) {
            return;
        }

        for(maski = 0; maski < autoDetector.mask.length; maski++) {
            img_index = autoDetector.mask[maski];
            if(autoDetector.binaryData[img_index] === true) {
                imgx = img_index % imageSize.width;
                imgy = parseInt(img_index/imageSize.width, 10);
                dataLayer.data[img_index*4] = 255;
                dataLayer.data[img_index*4+1] = 255;
                dataLayer.data[img_index*4+2] = 0;
                dataLayer.data[img_index*4+3] = 255;                
            } else {
                dataLayer.data[img_index*4] = 0;
                dataLayer.data[img_index*4+1] = 0;
                dataLayer.data[img_index*4+2] = 0;
                dataLayer.data[img_index*4+3] = 150;   
            }
        }

        ctx.oriDataCtx.putImageData(dataLayer, 0, 0);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    function testColorDetection() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.graphicsWidget.setRepainter(new wpd.ColorFilterRepainter());
        paintFilteredColor(); 
    }
    
    function startPicker() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if(wpd.appData.getPlotData().getAutoDetector().colorDetectionMode === 'fg') {
            startFGPicker();
        } else {
            startBGPicker();
        }
    }

    function changeDetectionMode() {
        var $modeSelector = document.getElementById('color-detection-mode-select');
        wpd.appData.getPlotData().getAutoDetector().colorDetectionMode = $modeSelector.value;
        init();
    }

    return {
        startPicker: startPicker,
        changeDetectionMode: changeDetectionMode,
        pickFGColor: pickFGColor,
        pickBGColor: pickBGColor,
        setFGColor: setFGColor,
        setBGColor: setBGColor,
        changeColorDistance: changeColorDistance,
        init: init,
        testColorDetection: testColorDetection,
        paintFilteredColor: paintFilteredColor,
        selectTopColor: selectTopColor
    };
})();

wpd.ColorPickerTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts();
        this.onMouseClick = function(ev, pos, imagePos) {
            var pixData = ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
            this.onComplete([pixData.data[0], pixData.data[1], pixData.data[2]]);
        };
        this.onComplete = function(col) {};
    };
    return Tool;
})();


wpd.ColorFilterRepainter = (function () {
    var Painter = function () {
        this.painterName = 'colorFilterRepainter';

        this.onRedraw = function () {
            wpd.colorPicker.paintFilteredColor();
        };
    }
    return Painter;
})();
