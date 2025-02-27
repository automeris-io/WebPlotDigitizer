/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2024 Ankit Rohatgi <plots@automeris.io>

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

wpd.BoxMaskTool = (function() {
    var Tool = function() {
        var isDrawing = false,
            topImageCorner, topScreenCorner,
            ctx = wpd.graphicsWidget.getAllContexts(),
            moveTimer, screen_pos, canvas_pos,

            mouseMoveHandler =
            function() {
                wpd.graphicsWidget.resetHover();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                ctx.hoverCtx.strokeRect(topScreenCorner.x, topScreenCorner.y,
                    canvas_pos.x - topScreenCorner.x,
                    canvas_pos.y - topScreenCorner.y);
            },

            mouseUpHandler =
            function(ev, pos, imagePos) {
                if (isDrawing === false) {
                    return;
                }
                clearTimeout(moveTimer);
                isDrawing = false;
                wpd.graphicsWidget.resetHover();
                ctx.dataCtx.globalCompositeOperation = "xor";
                ctx.oriDataCtx.globalCompositeOperation = "xor";
                ctx.dataCtx.fillStyle = "rgba(255,255,0,0.5)";
                let canvasPos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
                ctx.dataCtx.fillRect(topScreenCorner.x, topScreenCorner.y,
                    canvasPos.x - topScreenCorner.x, canvasPos.y - topScreenCorner.y);
                ctx.oriDataCtx.fillStyle = "rgba(255,255,0,0.5)";
                ctx.oriDataCtx.fillRect(topImageCorner.x, topImageCorner.y,
                    imagePos.x - topImageCorner.x,
                    imagePos.y - topImageCorner.y);
            },

            mouseOutPos = null,
            mouseOutImagePos = null;

        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('box-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if (isDrawing === true)
                return;
            isDrawing = true;
            topImageCorner = imagePos;
            topScreenCorner = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isDrawing === false)
                return;
            canvas_pos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
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
            document.getElementById('box-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask();
        };
    };
    return Tool;
})();

wpd.PenMaskTool = (function() {
    var Tool = function() {
        var strokeWidth, ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, canvas_pos, image_pos, mouseMoveHandler = function() {
                ctx.dataCtx.globalCompositeOperation = "xor";
                ctx.oriDataCtx.globalCompositeOperation = "xor";
                ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.5)";
                ctx.dataCtx.lineTo(canvas_pos.x, canvas_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.5)";
                ctx.oriDataCtx.lineTo(image_pos.x, image_pos.y);
                ctx.oriDataCtx.stroke();
                ctx.dataCtx.globalCompositeOperation = "source-over";
                ctx.oriDataCtx.globalCompositeOperation = "source-over";
            };

        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('pen-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
            document.getElementById('mask-paint-container').style.display = 'block';
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if (isDrawing === true)
                return;
            let lwidth = parseInt(document.getElementById('paintThickness').value, 10);
            let canvasPos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
            isDrawing = true;
            ctx.dataCtx.globalCompositeOperation = "xor";
            ctx.oriDataCtx.globalCompositeOperation = "xor";
            ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.5)";
            ctx.dataCtx.lineWidth = lwidth * wpd.graphicsWidget.getZoomRatio();
            ctx.dataCtx.beginPath();
            ctx.dataCtx.moveTo(canvasPos.x, canvasPos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.5)";
            ctx.oriDataCtx.lineWidth = lwidth;
            ctx.oriDataCtx.beginPath();
            ctx.oriDataCtx.moveTo(imagePos.x, imagePos.y);
            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isDrawing === false)
                return;
            screen_pos = pos;
            canvas_pos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
            image_pos = imagePos;
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            clearTimeout(moveTimer);
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;
            isDrawing = false;
        };

        this.onMouseOut = function(ev, pos, imagePos) {
            this.onMouseUp(ev, pos, imagePos);
        };

        this.onRemove = function() {
            document.getElementById('pen-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            document.getElementById('mask-paint-container').style.display = 'none';
            wpd.dataMask.grabMask();
            wpd.toolbar.clear();
        };
    };
    return Tool;
})();

wpd.EraseMaskTool = (function() {
    var Tool = function() {
        var strokeWidth, ctx = wpd.graphicsWidget.getAllContexts(),
            isDrawing = false,
            moveTimer,
            screen_pos, canvas_pos, image_pos, mouseMoveHandler = function() {
                ctx.dataCtx.globalCompositeOperation = "destination-out";
                ctx.oriDataCtx.globalCompositeOperation = "destination-out";

                ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
                ctx.dataCtx.lineTo(canvas_pos.x, canvas_pos.y);
                ctx.dataCtx.stroke();

                ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
                ctx.oriDataCtx.lineTo(image_pos.x, image_pos.y);
                ctx.oriDataCtx.stroke();
                ctx.dataCtx.globalCompositeOperation = "source-over";
                ctx.oriDataCtx.globalCompositeOperation = "source-over";
            };

        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('erase-mask').classList.add('pressed-button');
            document.getElementById('view-mask').classList.add('pressed-button');
            document.getElementById('mask-erase-container').style.display = 'block';
        };

        this.onMouseDown = function(ev, pos, imagePos) {
            if (isDrawing === true)
                return;
            let lwidth = parseInt(document.getElementById('eraseThickness').value, 10);
            let canvasPos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
            isDrawing = true;
            ctx.dataCtx.globalCompositeOperation = "destination-out";
            ctx.oriDataCtx.globalCompositeOperation = "destination-out";

            ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
            ctx.dataCtx.lineWidth = lwidth * wpd.graphicsWidget.getZoomRatio();
            ctx.dataCtx.beginPath();
            ctx.dataCtx.moveTo(canvasPos.x, canvasPos.y);

            ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
            ctx.oriDataCtx.lineWidth = lwidth;
            ctx.oriDataCtx.beginPath();
            ctx.oriDataCtx.moveTo(imagePos.x, imagePos.y);
            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";
        };

        this.onMouseMove = function(ev, pos, imagePos) {
            if (isDrawing === false)
                return;
            screen_pos = pos;
            image_pos = imagePos;
            canvas_pos = wpd.graphicsWidget.canvasPx(pos.x, pos.y);
            clearTimeout(moveTimer);
            moveTimer = setTimeout(mouseMoveHandler, 2);
        };

        this.onMouseOut = function(ev, pos, imagePos) {
            this.onMouseUp(ev, pos, imagePos);
        };

        this.onMouseUp = function(ev, pos, imagePos) {
            clearTimeout(moveTimer);
            ctx.dataCtx.closePath();
            ctx.dataCtx.lineWidth = 1;
            ctx.oriDataCtx.closePath();
            ctx.oriDataCtx.lineWidth = 1;

            ctx.dataCtx.globalCompositeOperation = "source-over";
            ctx.oriDataCtx.globalCompositeOperation = "source-over";

            isDrawing = false;
        };

        this.onRemove = function() {
            document.getElementById('erase-mask').classList.remove('pressed-button');
            document.getElementById('view-mask').classList.remove('pressed-button');
            document.getElementById('mask-erase-container').style.display = 'none';
            wpd.dataMask.grabMask();
            wpd.toolbar.clear();
        };
    };
    return Tool;
})();

wpd.ViewMaskTool = (function() {
    var Tool = function() {
        this.onAttach = function() {
            wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
            document.getElementById('view-mask').classList.add('pressed-button');
        };

        this.onRemove = function() {
            document.getElementById('view-mask').classList.remove('pressed-button');
            wpd.dataMask.grabMask();
        };
    };

    return Tool;
})();

wpd.MaskPainter = (function() {
    var Painter = function() {
        let ctx = wpd.graphicsWidget.getAllContexts();
        let ds = wpd.tree.getActiveDataset();
        let autoDetector = wpd.appData.getPlotData().getAutoDetectionDataForDataset(ds);

        let painter = function() {
            if (autoDetector.mask == null || autoDetector.mask.size === 0) {
                return;
            }
            let imageSize = wpd.graphicsWidget.getImageSize();
            let imgData = ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

            for (let img_index of autoDetector.mask) {
                imgData.data[img_index * 4] = 255;
                imgData.data[img_index * 4 + 1] = 255;
                imgData.data[img_index * 4 + 2] = 0;
                imgData.data[img_index * 4 + 3] = 255 / 2;
            }

            ctx.oriDataCtx.putImageData(imgData, 0, 0);
            wpd.graphicsWidget.copyImageDataLayerToScreen();
        };

        this.painterName = 'dataMaskPainter';

        this.onRedraw = function() {
            wpd.dataMask.grabMask();
            painter();
        };

        this.onAttach = function() {
            painter();
        };
    };
    return Painter;
})();