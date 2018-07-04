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

wpd.CropTool = class {
    
    constructor() {
        this._isDrawing = false;
        this._hasCropBox = false;
        this._topImageCorner = null;
        this._topScreenCorner = null;
        this._moveTimer = null;
        this._screenPos = null;
        this._imagePos = null;
        this._ctx = wpd.graphicsWidget.getAllContexts();
    }

    onAttach() {
        document.getElementById('image-editing-crop').classList.add('pressed-button');
    }

    onRemove() {
        document.getElementById('image-editing-crop').classList.remove('pressed-button');
    }

    onMouseDown(e, pos, imagePos) {
        if (!this._hasCropBox) {
            this._isDrawing = true;
            this._topImageCorner = imagePos;
            this._topScreenCorner = pos;
        } else {
            // find the nearest point and highlight it

            // change mouse cursor
        }
    }

    onMouseMove(e, pos, imagePos) {
        if (this._isDrawing) {
            this._screenPos = pos;
            this._imagePos = imagePos;
            clearTimeout(this._moveTimer);
            this._moveTimer = setTimeout(() => {
                wpd.graphicsWidget.resetHover();
                this._ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                this._ctx.hoverCtx.strokeRect(
                    this._topScreenCorner.x, 
                    this._topScreenCorner.y,
                    this._screenPos.x - this._topScreenCorner.x,
                    this._screenPos.y - this._topScreenCorner.y);                
            }, 2);
        } else if (this._hasCropBox) {
            // reposition selected point (and others to match)
        }
    }

    onMouseUp(e, pos, imagePos) {
        this._finalizeDrawing();
    }

    _finalizeDrawing() {
        clearTimeout(this._moveTimer);
        if (!this._isDrawing) return;

        this._isDrawing = false;
        this._hasCropBox = true;
        wpd.graphicsWidget.resetHover();
        this._ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
        this._ctx.hoverCtx.strokeRect(
            this._topScreenCorner.x, 
            this._topScreenCorner.y,
            this._screenPos.x - this._topScreenCorner.x,
            this._screenPos.y - this._topScreenCorner.y);
    }

    onMouseOut() {
        this._finalizeDrawing();
    }

    onDocumentMouseUp() {
        this._finalizeDrawing();
    }

    onKeyDown(e) {
        let isEsc = wpd.keyCodes.isEsc(e.keyCode);
        let isEnter = wpd.keyCodes.isEnter(e.keyCode);
        if (isEsc || isEnter) {
            this._isDrawing = false;
            wpd.graphicsWidget.resetHover();
        }

        if(isEsc) {
            this._hasCropBox = false;
        }

        if (isEnter && this._hasCropBox) {
            // execute the crop action
            let cropAction = new wpd.CropImageAction(
                this._topImageCorner.x,
                this._topImageCorner.y,
                this._imagePos.x,
                this._imagePos.y
            );
            cropAction.execute();
            wpd.appData.getUndoManager().insertAction(cropAction);
        }

        e.preventDefault();
    }

    onRedraw() {
        if(this._hasCropBox) {
            // recalculate screen coordinates and redraw crop-box if necessary
            console.log("redraw!");
        }
    }
};