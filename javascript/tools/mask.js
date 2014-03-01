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
        var $fgBtn = document.getElementById('fg-color-button'),
            $bgBtn = document.getElementById('bg-color-button'),
            $colorDistance = document.getElementById('color-distance-value'),
            autoDetector = wpd.appData.getPlotData().getAutoDetector();

            fg_color = autoDetector.fgColor,
            bg_color = autoDetector.bgColor;
            color_distance = autoDetector.colorDistance;

        $fgBtn.style.backgroundColor = 'rgb('+fg_color[0]+','+fg_color[1]+','+fg_color[2]+')';
        $bgBtn.style.backgroundColor = 'rgb('+bg_color[0]+','+bg_color[1]+','+bg_color[2]+')';
        $colorDistance.value = color_distance;
    }

    function startFGPicker() {
        var fg_color = wpd.appData.getPlotData().getAutoDetector().fgColor;
        document.getElementById('color_red_fg').value = fg_color[0];
	    document.getElementById('color_green_fg').value = fg_color[1];
		document.getElementById('color_blue_fg').value = fg_color[2];
        wpd.popup.show('colorPickerFG');
    }

    function startBGPicker() {
        var bg_color = wpd.appData.getPlotData().getAutoDetector().bgColor;
        document.getElementById('color_red_bg').value = bg_color[0];
	    document.getElementById('color_green_bg').value = bg_color[1];
		document.getElementById('color_blue_bg').value = bg_color[2];
        wpd.popup.show('colorPickerBG');
    }

    function pickFGColor(mode) {
        wpd.popup.close('colorPickerFG');
        var tool = new wpd.ColorPickerTool();
        tool.onComplete = function(col) {
                wpd.appData.getPlotData().getAutoDetector().fgColor = col;
                wpd.graphicsWidget.removeTool();
                startFGPicker();
            };
        wpd.graphicsWidget.setTool(tool); 
    }

    function pickBGColor(mode) {
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

    function testColorDetection() {

        wpd.graphicsWidget.resetData();
        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maski,
            img_index,
            imgx, imgy,
            dataLayer;

        dataLayer = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        autoDetector.generateBinaryData();
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
    
    return {
        startFGPicker: startFGPicker,
        startBGPicker: startBGPicker,

        pickFGColor: pickFGColor,
        pickBGColor: pickBGColor,

        setFGColor: setFGColor,
        setBGColor: setBGColor,

        changeColorDistance: changeColorDistance,

        init: init,

        testColorDetection: testColorDetection
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

wpd.dataMask = (function () {
    function grabMask(grabImageData) {
        // Mask is just a list of pixels with the yellow color in the data layer
        var ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            maskDataPx = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height),
            maskData = [],
            i,
            mi = 0;
        for(i = 0; i < maskDataPx.data.length; i+=4) {
            if (maskDataPx.data[i] === 255 && maskDataPx.data[i+1] === 255 && maskDataPx.data[i+2] === 0) {
                maskData[mi] = i/4; mi++;
            }
        }
        wpd.appData.getPlotData().getAutoDetector().mask = maskData;
        if(grabImageData === true) {
            wpd.appData.getPlotData().getAutoDetector().imageData = ctx.oriImageCtx.getImageData(0, 0, imageSize.width, imageSize.height);
        }
    }

    function grabImageData() {

    }

    function drawMask() {
        var maskData = wpd.appData.getPlotData().getAutoDetector().mask;
        
        if(maskData == null || maskData.length === 0) {
            return;
        }

        var i, ix, iy, img_index, scr_index,
            ctx = wpd.graphicsWidget.getAllContexts(),
            imageSize = wpd.graphicsWidget.getImageSize(),
            oriData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        for(i = 0; i < maskData.length; i++) {
            img_index = maskData[i];
            ix = img_index % imageSize.width;
            iy = parseInt(img_index / imageSize.height, 10);
            oriData.data[img_index*4] = 255;
            oriData.data[img_index*4+1] = 255;
            oriData.data[img_index*4+2] = 0;
            oriData.data[img_index*4+3] = 255;
        }

        ctx.oriDataCtx.putImageData(oriData, 0, 0, imageSize.width, imageSize.height);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    function markBox() {
        var tool = new wpd.BoxMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function markPen() {
        var tool = new wpd.PenMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    function eraseMarks() {
        var tool = new wpd.EraseMaskTool();
        wpd.graphicsWidget.setTool(tool);
    }

    return {
        grabMask: grabMask,
        drawMask: drawMask,
        markBox: markBox,
        markPen: markPen,
        eraseMarks: eraseMarks
    };
})();

wpd.BoxMaskTool = (function () {
    var Tool = function () {
        var isDrawing = false,
            topImageCorner,
            topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer,
            screen_pos,
            mouseMoveHandler = function() {
                wpd.graphicsWidget.resetHover();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
    		    ctx.hoverCtx.strokeRect(topScreenCorner.x, topScreenCorner.y, screen_pos.x - topScreenCorner.x, screen_pos.y - topScreenCorner.y);
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = pos;
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            if(isDrawing === false) {
                return;
            }
            clearTimeout(moveTimer);
            isDrawing = false;
            wpd.graphicsWidget.resetHover();
            ctx.dataCtx.fillStyle = "rgba(255,255,0,1)";
    	    ctx.dataCtx.fillRect(topScreenCorner.x, topScreenCorner.y, pos.x-topScreenCorner.x, pos.y-topScreenCorner.y);
            ctx.oriDataCtx.fillStyle = "rgba(255,255,0,1)";
            ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y, imagePos.x - topImageCorner.x, imagePos.y - topImageCorner.y);
        };

        this.onRedraw = function() {
        };
    };
    return Tool;
})();

wpd.PenMaskTool = (function () {
    var Tool = function () {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {
                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
            ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;
            isDrawing = false;
        };

        this.onRemove = function() {
            // hide toolbar for stroke width
        };

        this.onRedraw = function() {
            // call generic data redraw method
        };
    };
    return Tool;
})();

wpd.EraseMaskTool = (function () {
    var Tool = function() {
        var strokeWidth,
            ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, image_pos,
            mouseMoveHandler = function() {

	            ctx.dataCtx.globalCompositeOperation = "destination-out";
                ctx.oriDataCtx.globalCompositeOperation = "destination-out";

                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.dataCtx.lineTo(screen_pos.x,screen_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        	    ctx.oriDataCtx.lineTo(image_pos.x,image_pos.y);
                ctx.oriDataCtx.stroke();
            };

        this.onMouseDown = function(ev, pos, imagePos) {
            if(isDrawing === true) return;
            isDrawing = true;
	        ctx.dataCtx.globalCompositeOperation = "destination-out";
            ctx.oriDataCtx.globalCompositeOperation = "destination-out";

            ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.dataCtx.lineWidth = 20;
	        ctx.dataCtx.beginPath();
        	ctx.dataCtx.moveTo(pos.x,pos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
        	ctx.oriDataCtx.lineWidth = 20;
	        ctx.oriDataCtx.beginPath();
        	ctx.oriDataCtx.moveTo(imagePos.x,imagePos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if(isDrawing === false) return;
            screen_pos = pos;
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 10);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;

            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";

            isDrawing = false;
        };

        this.onRemove = function() {
            // hide toolbar for stroke width
        };

        this.onRedraw = function() {
            // call generic data redraw method
        };
    };
    return Tool;
})();

