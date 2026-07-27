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

wpd.BoxMaskTool = class {
    constructor() {
        this.isDrawing = false;
        this.topImageCorner = null;
        this.topScreenCorner = null;
        this.moveTimer = null;
        this.screenPos = null;
        this.canvasPos = null;
        this.mouseOutPos = null;
        this.mouseOutImagePos = null;
    }

    mouseMoveHandler() {
        if (this.isDrawing === false) {
            return;
        }
        let ctx = wpd.graphicsWidget.getAllContexts();
        wpd.graphicsWidget.resetHover();
        ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
        ctx.hoverCtx.strokeRect(this.topScreenCorner.x, this.topScreenCorner.y,
            this.canvasPos.x - this.topScreenCorner.x,
            this.canvasPos.y - this.topScreenCorner.y);
    }

    mouseUpHandler(ev, pos, imagePos) {
        if (this.isDrawing === false) {
            return;
        }
        clearTimeout(this.moveTimer);
        let ctx = wpd.graphicsWidget.getAllContexts();
        this.isDrawing = false;
        wpd.graphicsWidget.resetHover();
        ctx.dataCtx.globalCompositeOperation = "xor";
        ctx.oriDataCtx.globalCompositeOperation = "xor";
        ctx.dataCtx.fillStyle = "rgba(255,255,0,0.5)";
        let canvasPos = wpd.graphicsWidget.imageToCanvasPx(imagePos.x, imagePos.y);
        ctx.dataCtx.fillRect(this.topScreenCorner.x, this.topScreenCorner.y,
            canvasPos.x - this.topScreenCorner.x, canvasPos.y - this.topScreenCorner.y);
        ctx.oriDataCtx.fillStyle = "rgba(255,255,0,0.5)";
        ctx.oriDataCtx.fillRect(this.topImageCorner.x, this.topImageCorner.y,
            imagePos.x - this.topImageCorner.x,
            imagePos.y - this.topImageCorner.y);
    }

    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
        document.getElementById('box-mask').classList.add('pressed-button');
        document.getElementById('view-mask').classList.add('pressed-button');
    }

    onMouseDown(ev, pos, imagePos) {
        if (this.isDrawing === true)
            return;
        this.isDrawing = true;
        this.topImageCorner = imagePos;
        this.topScreenCorner = wpd.graphicsWidget.imageToCanvasPx(imagePos.x, imagePos.y);
    }

    onMouseMove(ev, pos, imagePos) {
        if (this.isDrawing === false)
            return;
        this.canvasPos = wpd.graphicsWidget.imageToCanvasPx(imagePos.x, imagePos.y);
        this.mouseMoveHandler();
    }

    onMouseOut(ev, pos, imagePos) {
        if (this.isDrawing === true) {
            clearTimeout(this.moveTimer);
            this.mouseOutPos = pos;
            this.mouseOutImagePos = imagePos;
        }
    }

    onDocumentMouseUp(ev, pos, imagePos) {
        if (this.mouseOutPos != null && this.mouseOutImagePos != null) {
            this.mouseUpHandler(ev, this.mouseOutPos, this.mouseOutImagePos);
        } else {
            this.mouseUpHandler(ev, pos, imagePos);
        }
        this.mouseOutPos = null;
        this.mouseOutImagePos = null;
    }

    onMouseUp(ev, pos, imagePos) {
        this.mouseUpHandler(ev, pos, imagePos);
    }

    onRemove() {
        document.getElementById('box-mask').classList.remove('pressed-button');
        document.getElementById('view-mask').classList.remove('pressed-button');
        wpd.dataMask.grabMask();
    }
};

wpd.PenMaskTool = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._isDrawing = false;
        this._moveTimer = null;
        this._screenPos = null;
        this._canvasPos = null;
        this._imagePos = null;
    }

    _mouseMoveHandler() {
        this._ctx.dataCtx.globalCompositeOperation = "xor";
        this._ctx.oriDataCtx.globalCompositeOperation = "xor";
        this._ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.5)";
        this._ctx.dataCtx.lineTo(this._canvasPos.x, this._canvasPos.y);
        this._ctx.dataCtx.stroke();

        this._ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.5)";
        this._ctx.oriDataCtx.lineTo(this._imagePos.x, this._imagePos.y);
        this._ctx.oriDataCtx.stroke();
        this._ctx.dataCtx.globalCompositeOperation = "source-over";
        this._ctx.oriDataCtx.globalCompositeOperation = "source-over";
    }

    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
        document.getElementById('pen-mask').classList.add('pressed-button');
        document.getElementById('view-mask').classList.add('pressed-button');
        document.getElementById('mask-paint-container').style.display = 'block';
    }

    onMouseDown(ev, pos, imagePos) {
        if (this._isDrawing === true)
            return;
        const lwidth = parseInt(document.getElementById('paintThickness').value, 10);
        const canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
        this._isDrawing = true;
        this._ctx.dataCtx.globalCompositeOperation = "xor";
        this._ctx.oriDataCtx.globalCompositeOperation = "xor";
        this._ctx.dataCtx.strokeStyle = "rgba(255,255,0,0.5)";
        this._ctx.dataCtx.lineWidth = lwidth * wpd.graphicsWidget.getZoomRatio();
        this._ctx.dataCtx.beginPath();
        this._ctx.dataCtx.moveTo(canvasPos.x, canvasPos.y);

        this._ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,0.5)";
        this._ctx.oriDataCtx.lineWidth = lwidth;
        this._ctx.oriDataCtx.beginPath();
        this._ctx.oriDataCtx.moveTo(imagePos.x, imagePos.y);
        this._ctx.dataCtx.globalCompositeOperation = "source-over";
        this._ctx.oriDataCtx.globalCompositeOperation = "source-over";
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isDrawing === false)
            return;
        this._screenPos = pos;
        this._canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
        this._imagePos = imagePos;
        clearTimeout(this._moveTimer);
        this._moveTimer = setTimeout(() => this._mouseMoveHandler(), 2);
    }

    onMouseUp(ev, pos, imagePos) {
        clearTimeout(this._moveTimer);
        this._ctx.dataCtx.closePath();
        this._ctx.dataCtx.lineWidth = 1;
        this._ctx.oriDataCtx.closePath();
        this._ctx.oriDataCtx.lineWidth = 1;
        this._isDrawing = false;
    }

    onMouseOut(ev, pos, imagePos) {
        this.onMouseUp(ev, pos, imagePos);
    }

    onRemove() {
        document.getElementById('pen-mask').classList.remove('pressed-button');
        document.getElementById('view-mask').classList.remove('pressed-button');
        document.getElementById('mask-paint-container').style.display = 'none';
        wpd.dataMask.grabMask();
        wpd.toolbar.clear();
    }
};

wpd.EraseMaskTool = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
        this._isDrawing = false;
        this._moveTimer = null;
        this._screenPos = null;
        this._canvasPos = null;
        this._imagePos = null;
    }

    _mouseMoveHandler() {
        this._ctx.dataCtx.globalCompositeOperation = "destination-out";
        this._ctx.oriDataCtx.globalCompositeOperation = "destination-out";

        this._ctx.dataCtx.strokeStyle = "rgba(255,255,0,1)";
        this._ctx.dataCtx.lineTo(this._canvasPos.x, this._canvasPos.y);
        this._ctx.dataCtx.stroke();

        this._ctx.oriDataCtx.strokeStyle = "rgba(255,255,0,1)";
        this._ctx.oriDataCtx.lineTo(this._imagePos.x, this._imagePos.y);
        this._ctx.oriDataCtx.stroke();
        this._ctx.dataCtx.globalCompositeOperation = "source-over";
        this._ctx.oriDataCtx.globalCompositeOperation = "source-over";
    }

    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
        document.getElementById('erase-mask').classList.add('pressed-button');
        document.getElementById('view-mask').classList.add('pressed-button');
        document.getElementById('mask-erase-container').style.display = 'block';
    }

    onMouseDown(ev, pos, imagePos) {
        if (this._isDrawing === true)
            return;
        const lwidth = parseInt(document.getElementById('eraseThickness').value, 10);
        const canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
        this._isDrawing = true;
        this._ctx.dataCtx.globalCompositeOperation = "destination-out";
        this._ctx.oriDataCtx.globalCompositeOperation = "destination-out";

        this._ctx.dataCtx.strokeStyle = "rgba(0,0,0,1)";
        this._ctx.dataCtx.lineWidth = lwidth * wpd.graphicsWidget.getZoomRatio();
        this._ctx.dataCtx.beginPath();
        this._ctx.dataCtx.moveTo(canvasPos.x, canvasPos.y);

        this._ctx.oriDataCtx.strokeStyle = "rgba(0,0,0,1)";
        this._ctx.oriDataCtx.lineWidth = lwidth;
        this._ctx.oriDataCtx.beginPath();
        this._ctx.oriDataCtx.moveTo(imagePos.x, imagePos.y);
        this._ctx.dataCtx.globalCompositeOperation = "source-over";
        this._ctx.oriDataCtx.globalCompositeOperation = "source-over";
    }

    onMouseMove(ev, pos, imagePos) {
        if (this._isDrawing === false)
            return;
        this._screenPos = pos;
        this._imagePos = imagePos;
        this._canvasPos = wpd.graphicsWidget.screenToCanvasPx(pos.x, pos.y);
        clearTimeout(this._moveTimer);
        this._moveTimer = setTimeout(() => this._mouseMoveHandler(), 2);
    }

    onMouseOut(ev, pos, imagePos) {
        this.onMouseUp(ev, pos, imagePos);
    }

    onMouseUp(ev, pos, imagePos) {
        clearTimeout(this._moveTimer);
        this._ctx.dataCtx.closePath();
        this._ctx.dataCtx.lineWidth = 1;
        this._ctx.oriDataCtx.closePath();
        this._ctx.oriDataCtx.lineWidth = 1;

        this._ctx.dataCtx.globalCompositeOperation = "source-over";
        this._ctx.oriDataCtx.globalCompositeOperation = "source-over";

        this._isDrawing = false;
    }

    onRemove() {
        document.getElementById('erase-mask').classList.remove('pressed-button');
        document.getElementById('view-mask').classList.remove('pressed-button');
        document.getElementById('mask-erase-container').style.display = 'none';
        wpd.dataMask.grabMask();
        wpd.toolbar.clear();
    }
};

wpd.ViewMaskTool = class {
    onAttach() {
        wpd.graphicsWidget.setRepainter(new wpd.MaskPainter());
        document.getElementById('view-mask').classList.add('pressed-button');
    }

    onRemove() {
        document.getElementById('view-mask').classList.remove('pressed-button');
        wpd.dataMask.grabMask();
    }
};

wpd.MaskPainter = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
        const ds = wpd.tree.getActiveDataset();
        this._autoDetector = wpd.appData.getPlotData().getAutoDetectionDataForDataset(ds);
        this.preventGrab = false;
        this.painterName = 'dataMaskPainter';
    }

    _painter() {
        if (this._autoDetector.mask == null || this._autoDetector.mask.size === 0) {
            return;
        }
        const imageSize = wpd.graphicsWidget.getImageSize();
        const imgData = this._ctx.oriDataCtx.getImageData(0, 0, imageSize.width, imageSize.height);

        for (let img_index of this._autoDetector.mask) {
            imgData.data[img_index * 4] = 255;
            imgData.data[img_index * 4 + 1] = 255;
            imgData.data[img_index * 4 + 2] = 0;
            imgData.data[img_index * 4 + 3] = 255 / 2;
        }

        this._ctx.oriDataCtx.putImageData(imgData, 0, 0);
        wpd.graphicsWidget.copyImageDataLayerToScreen();
    }

    onRedraw() {
        if (!this.preventGrab) {
            wpd.dataMask.grabMask();
        }
        this._painter();
    }

    onAttach() {
        this.preventGrab = true;
        wpd.graphicsWidget.resetData();
        this.preventGrab = false;
    }
};
