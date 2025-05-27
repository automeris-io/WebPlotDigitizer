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

wpd.GridColorFilterRepainter = (function() {
    var Painter = function() {
        this.painterName = 'gridColorFilterRepainter';

        this.onRedraw = function() {
            var autoDetector = wpd.appData.getPlotData().getGridDetectionData();
            wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData,
                autoDetector.gridMask.pixels);
        };
    };
    return Painter;
})();

// TODO: Think of reusing mask.js code here
wpd.GridBoxTool = (function() {
    var Tool = function() {
        var isDrawing = false,
            topImageCorner, topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer, screen_pos,

            mouseMoveHandler =
            function() {
                wpd.graphicsWidget.resetHover();
                let topCanvasCorner = wpd.graphicsWidget.screenToCanvasPx(topScreenCorner.x, topScreenCorner.y);
                let canvasPos = wpd.graphicsWidget.screenToCanvasPx(screen_pos.x, screen_pos.y);
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                ctx.hoverCtx.strokeRect(topCanvasCorner.x, topCanvasCorner.y,
                    canvasPos.x - topCanvasCorner.x,
                    canvasPos.y - topCanvasCorner.y);
            },

            mouseUpHandler =
            function(ev, pos, imagePos) {
                if (isDrawing === false) {
                    return;
                }
                clearTimeout(moveTimer);
                isDrawing = false;
                wpd.graphicsWidget.resetHover();
                let topCanvasCorner = wpd.graphicsWidget.screenToCanvasPx(topScreenCorner.x, topScreenCorner.y);
                let canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
                ctx.dataCtx.fillStyle = "rgba(255,255,0,0.8)";
                ctx.dataCtx.fillRect(topCanvasCorner.x, topCanvasCorner.y,
                    canvasPos.x - topCanvasCorner.x, canvasPos.y - topCanvasCorner.y);
                ctx.oriDataCtx.fillStyle = "rgba(255,255,0,0.8)";
                ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y,
                    imagePos.x - topImageCorner.x,
                    imagePos.y - topImageCorner.y);
            },

            mouseOutPos = null,
            mouseOutImagePos = null;

        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
            document.getElementById('grid-mask-box').classList.add('pressed-button');
            document.getElementById('grid-mask-view').classList.add('pressed-button');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if (isDrawing === true)
                return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = pos;
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isDrawing === false)
                return;
            screen_pos = pos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
        };

        this.onMouseOut = function(ev, pos, imagePos) {
            if (isDrawing === true) {
                clearTimeout(moveTimer);
                mouseOutPos = pos;
                mouseOutImagePos = imagePos;
            }
        };

        this.onDocumentMouseUp = function(ev, pos, imagePos) {
            if (mouseOutPos != null && mouseOutImagePos != null) {
                mouseUpHandler(ev, mouseOutPos, mouseOutImagePos);
            } else {
                mouseUpHandler(ev, pos, imagePos);
            }
            mouseOutPos = null;
            mouseOutImagePos = null;
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            mouseUpHandler(ev, pos, imagePos);
        };

        this.onRemove = function() {
            document.getElementById('grid-mask-box').classList.remove('pressed-button');
            document.getElementById('grid-mask-view').classList.remove('pressed-button');
            wpd.gridDetection.grabMask();
        };
    };
    return Tool;
})();

wpd.GridViewMaskTool = (function() {
    var Tool = function() {
        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
            document.getElementById('grid-mask-view').classList.add('pressed-button');
        };

        this.onRemove = function() {
            document.getElementById('grid-mask-view').classList.remove('pressed-button');
            wpd.gridDetection.grabMask();
        };
    };

    return Tool;
})();

wpd.GridMaskPainter = (function() {
    var Painter = function() {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            autoDetector = wpd.appData.getPlotData().getGridDetectionData(),
            painter = function() {
                if (autoDetector.gridMask.pixels == null ||
                    autoDetector.gridMask.pixels.size === 0) {
                    return;
                }

                let imageSize = wpd.graphicsWidget.getImageSize();
                let imgData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

                for (let img_index of autoDetector.gridMask.pixels) {
                    imgData.data[img_index * 4] = 255;
                    imgData.data[img_index * 4 + 1] = 255;
                    imgData.data[img_index * 4 + 2] = 0;
                    imgData.data[img_index * 4 + 3] = 200;
                }

                ctx.oriDataCtx.putImageData(imgData, 0, 0);
                wpd.graphicsWidget.copyImageDataLayerToScreen();
            };

        this.painterName = 'gridMaskPainter';

        this.onRedraw = function() {
            wpd.gridDetection.grabMask();
            painter();
        };

        this.onAttach = function() {
            wpd.graphicsWidget.resetData();
            painter();
        };
    };
    return Painter;
})();
