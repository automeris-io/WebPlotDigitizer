/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        this._isResizing = false;
        this._topImageCorner = null;
        this._topScreenCorner = null;
        this._moveTimer = null;
        this._screenPos = null;
        this._imagePos = null;
        this._hotspotCoords = null;
        this._resizingHotspot = '';
        this._resizeStartCoords = {
            x: 0,
            y: 0
        };
        this._ctx = wpd.graphicsWidget.getAllContexts();
    }

    onAttach() {
        document.getElementById('image-editing-crop').classList.add('pressed-button');
    }

    onRemove() {
        wpd.graphicsWidget.resetHover();
        document.getElementById('image-editing-crop').classList.remove('pressed-button');
    }

    onMouseDown(e, pos, imagePos) {
        if (!this._hasCropBox) {
            this._isDrawing = true;
            this._topImageCorner = imagePos;
            this._topScreenCorner = pos;
        } else {
            let hotspot = this._getHotspot(pos);
            if (hotspot != null) {
                // initiate resize/move action
                this._isResizing = true;
                this._resizeStartCoords = {
                    x: pos.x,
                    y: pos.y
                };
                this._resizingHotspot = hotspot;
            }
        }
    }

    onMouseMove(e, pos, imagePos) {
        if (this._isDrawing) {
            this._screenPos = pos;
            this._imagePos = imagePos;
            clearTimeout(this._moveTimer);
            this._moveTimer = setTimeout(() => {
                this._drawCropBox();
            }, 2);
        } else if (this._hasCropBox) {
            // reposition selected point (and others to match)
            let hotspot = this._isResizing ? this._resizingHotspot : this._getHotspot(pos);

            // set the appropriate cursor on hover or resize
            if (hotspot != null) {
                let cursor = "crosshair";
                if (hotspot === "n" || hotspot === "s") {
                    cursor = "ns-resize";
                } else if (hotspot == "e" || hotspot == "w") {
                    cursor = "ew-resize";
                } else if (hotspot == "nw" || hotspot == "se") {
                    cursor = "nwse-resize";
                } else if (hotspot == "ne" || hotspot == "sw") {
                    cursor = "nesw-resize";
                } else if (hotspot == "c") {
                    cursor = "move";
                }
                e.target.style.cursor = cursor;
            } else {
                e.target.style.cursor = "crosshair";
            }

            // resize or move based on hotspot
            if (this._isResizing) {
                let posDiff = {
                    x: pos.x - this._resizeStartCoords.x,
                    y: pos.y - this._resizeStartCoords.y
                };
                if (this._resizingHotspot == "n") {
                    this._topScreenCorner.y += posDiff.y;
                } else if (this._resizingHotspot == "s") {
                    this._screenPos.y += posDiff.y;
                } else if (this._resizingHotspot == "w") {
                    this._topScreenCorner.x += posDiff.x;
                } else if (this._resizingHotspot == "e") {
                    this._screenPos.x += posDiff.x;
                } else if (this._resizingHotspot == "nw") {
                    this._topScreenCorner.y += posDiff.y;
                    this._topScreenCorner.x += posDiff.x;
                } else if (this._resizingHotspot == "ne") {
                    this._topScreenCorner.y += posDiff.y;
                    this._screenPos.x += posDiff.x;
                } else if (this._resizingHotspot == "sw") {
                    this._screenPos.y += posDiff.y;
                    this._topScreenCorner.x += posDiff.x;
                } else if (this._resizingHotspot == "se") {
                    this._screenPos.y += posDiff.y;
                    this._screenPos.x += posDiff.x;
                } else if (this._resizingHotspot == "c") {
                    this._topScreenCorner.x += posDiff.x;
                    this._topScreenCorner.y += posDiff.y;
                    this._screenPos.x += posDiff.x;
                    this._screenPos.y += posDiff.y;
                }

                clearTimeout(this._moveTimer);
                this._moveTimer = setTimeout(() => {
                    this._drawCropBox();
                }, 2);

                this._resizeStartCoords = {
                    x: pos.x,
                    y: pos.y
                };
            }
        }
    }

    _drawCropBox() {
        wpd.graphicsWidget.resetHover();
        let ctx = this._ctx.hoverCtx;

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.strokeRect(this._topScreenCorner.x, this._topScreenCorner.y,
            this._screenPos.x - this._topScreenCorner.x,
            this._screenPos.y - this._topScreenCorner.y);

        this._hotspotCoords = this._getHotspotCoords();

        ctx.fillStyle = "rgb(255,0,0)";
        ctx.strokeStyle = "rgb(255,255,255)";
        for (let pt of this._hotspotCoords) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
        }
    }

    onMouseUp(e, pos, imagePos) {
        this._finalizeDrawing();
    }

    _finalizeDrawing() {
        clearTimeout(this._moveTimer);
        if (!this._isDrawing && !this._isResizing)
            return;

        this._isDrawing = false;
        this._isResizing = false;
        this._hasCropBox = true;
        this._drawCropBox();
    }

    _getHotspotCoords() {
        return [{
                x: this._topScreenCorner.x,
                y: this._topScreenCorner.y
            }, // nw
            {
                x: this._screenPos.x,
                y: this._topScreenCorner.y
            }, // ne
            {
                x: this._screenPos.x,
                y: this._screenPos.y
            }, // se
            {
                x: this._topScreenCorner.x,
                y: this._screenPos.y
            }, // sw
            {
                x: (this._topScreenCorner.x + this._screenPos.x) / 2,
                y: this._topScreenCorner.y
            }, // n
            {
                x: this._screenPos.x,
                y: (this._topScreenCorner.y + this._screenPos.y) / 2
            }, // e
            {
                x: (this._topScreenCorner.x + this._screenPos.x) / 2,
                y: this._screenPos.y
            }, // s
            {
                x: this._topScreenCorner.x,
                y: (this._topScreenCorner.y + this._screenPos.y) / 2
            }, // w
            {
                x: (this._topScreenCorner.x + this._screenPos.x) / 2,
                y: (this._topScreenCorner.y + this._screenPos.y) / 2
            } // c
        ];
    }

    // is the screenPos on an active hotspot? if yes, then return the type
    _getHotspot(screenPos) {
        let hotspots = ['nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w', 'c'];
        let radius = 8; // distance from the center
        let pointCoords = this._hotspotCoords;
        for (let ptIdx = 0; ptIdx < pointCoords.length; ptIdx++) {
            let pt = pointCoords[ptIdx];
            let dist2 = (pt.x - screenPos.x) * (pt.x - screenPos.x) +
                (pt.y - screenPos.y) * (pt.y - screenPos.y);
            if (dist2 < radius * radius) {
                return hotspots[ptIdx];
            }
        }
        return null; // not on a hotspot
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

        if (isEsc) {
            this._hasCropBox = false;
        }

        if (isEnter && this._hasCropBox) {
            // execute the crop action
            let cropAction = new wpd.CropImageAction(this._topImageCorner.x, this._topImageCorner.y,
                this._imagePos.x, this._imagePos.y);
            wpd.appData.getUndoManager().insertAction(cropAction);
            cropAction.execute();
        }

        e.preventDefault();
    }

    onRedraw() {
        if (this._hasCropBox) {
            // recalculate screen coordinates and redraw crop-box
            this._topScreenCorner =
                wpd.graphicsWidget.screenPx(this._topImageCorner.x, this._topImageCorner.y);
            this._screenPos = wpd.graphicsWidget.screenPx(this._imagePos.x, this._imagePos.y);
            this._drawCropBox();
        }
    }
};