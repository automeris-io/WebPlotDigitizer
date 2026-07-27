/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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

wpd.GridColorFilterRepainter = class {
    constructor() {
        this.painterName = 'gridColorFilterRepainter';
    }

    onRedraw() {
        const autoDetector = wpd.appData.getPlotData().getGridDetectionData();
        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData,
            autoDetector.gridMask.pixels);
    }
};

// TODO: Think of reusing mask.js code here
wpd.GridBoxTool = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._isDrawing = false;
        this._topImageCorner = null;
        this._topScreenCorner = null;
        this._moveTimer = null;
        this._screenPos = null;
        this._mouseOutPos = null;
        this._mouseOutImagePos = null;
    }

    _mouseMoveHandler() {
        wpd.graphicsWidget.resetHover();
        const topCanvasCorner = wpd.graphicsWidget.screenToCanvasPx(
            this._topScreenCorner.x, this._topScreenCorner.y);
        const canvasPos = wpd.graphicsWidget.screenToCanvasPx(
            this._screenPos.x, this._screenPos.y);
        this._ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
        this._ctx.hoverCtx.strokeRect(topCanvasCorner.x, topCanvasCorner.y,
            canvasPos.x - topCanvasCorner.x,
            canvasPos.y - topCanvasCorner.y);
    }

    _mouseUpHandler(ev, pos, imagePos) {
        if (this._isDrawing === false) {
            return;
        }
        clearTimeout(this._moveTimer);
        this._isDrawing = false;
        wpd.graphicsWidget.resetHover();
        const topCanvasCorner = wpd.graphicsWidget.screenToCanvasPx(
            this._topScreenCorner.x, this._topScreenCorner.y);
        const canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
        this._ctx.dataCtx.fillStyle = "rgba(255,255,0,0.8)";
        this._ctx.dataCtx.fillRect(topCanvasCorner.x, topCanvasCorner.y,
            canvasPos.x - topCanvasCorner.x, canvasPos.y - topCanvasCorner.y);
        this._ctx.oriDataCtx.fillStyle = "rgba(255,255,0,0.8)";
        this._ctx.oriDataCtx.fillRect(this._topImageCorner.x, this._topImageCorner.y,
            imagePos.x - this._topImageCorner.x,
            imagePos.y - this._topImageCorner.y);
    }

    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
        document.getElementById('grid-mask-box').classList.add('pressed-button');
        document.getElementById('grid-mask-view').classList.add('pressed-button');
    }

    onMouseDown(ev, pos, imagePos) {
        if (this._isDrawing === true)
            return;
        this._isDrawing = true;
        this._topImageCorner = imagePos;
        this._topScreenCorner = pos;
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isDrawing === false)
            return;
        this._screenPos = pos;
        clearTimeout(this._moveTimer);
        this._moveTimer = setTimeout(() => this._mouseMoveHandler(), 2);
    }

    onMouseOut(ev, pos, imagePos) {
        if (this._isDrawing === true) {
            clearTimeout(this._moveTimer);
            this._mouseOutPos = pos;
            this._mouseOutImagePos = imagePos;
        }
    }

    onDocumentMouseUp(ev, pos, imagePos) {
        if (this._mouseOutPos != null && this._mouseOutImagePos != null) {
            this._mouseUpHandler(ev, this._mouseOutPos, this._mouseOutImagePos);
        } else {
            this._mouseUpHandler(ev, pos, imagePos);
        }
        this._mouseOutPos = null;
        this._mouseOutImagePos = null;
    }

    onMouseUp(ev, pos, imagePos) {
        this._mouseUpHandler(ev, pos, imagePos);
    }

    onRemove() {
        document.getElementById('grid-mask-box').classList.remove('pressed-button');
        document.getElementById('grid-mask-view').classList.remove('pressed-button');
        wpd.gridDetection.grabMask();
    }
};

wpd.GridViewMaskTool = class {
    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.GridMaskPainter());
        document.getElementById('grid-mask-view').classList.add('pressed-button');
    }

    onRemove() {
        document.getElementById('grid-mask-view').classList.remove('pressed-button');
        wpd.gridDetection.grabMask();
    }
};

wpd.GridMaskPainter = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._autoDetector = wpd.appData.getPlotData().getGridDetectionData();
        this.painterName = 'gridMaskPainter';
    }

    _painter() {
        if (this._autoDetector.gridMask.pixels == null ||
            this._autoDetector.gridMask.pixels.size === 0) {
            return;
        }

        const imageSize = wpd.graphicsWidget.getImageSize();
        const imgData = this._ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        for (let img_index of this._autoDetector.gridMask.pixels) {
            imgData.data[img_index * 4] = 255;
            imgData.data[img_index * 4 + 1] = 255;
            imgData.data[img_index * 4 + 2] = 0;
            imgData.data[img_index * 4 + 3] = 200;
        }

        this._ctx.oriDataCtx.putImageData(imgData, 0, 0);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    onRedraw() {
        wpd.gridDetection.grabMask();
        this._painter();
    }

    onAttach() {
        wpd.graphicsWidget.resetData();
        this._painter();
    }
};
