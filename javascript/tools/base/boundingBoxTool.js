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

wpd.BoundingBoxTool = class {
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
        this._dpr = window.devicePixelRatio;
        this._showCenterPoint = false;
    }

    initBbox(bbox) {
        if (bbox == null) {
            return;
        }
        this._topImageCorner = {
            x: bbox.xmin,
            y: bbox.ymin,
        };
        this._imagePos = {
            x: bbox.xmax,
            y: bbox.ymax,
        };
        this._topScreenCorner = wpd.graphicsWidget.imageToScreenPx(this._topImageCorner.x, this._topImageCorner.y);
        this._screenPos = wpd.graphicsWidget.imageToScreenPx(this._imagePos.x, this._imagePos.y);
        this._hotspotCoords = this._getHotspotCoords();
        this._hasCropBox = true;
    }

    onAttach() {}

    onRemove() {
        wpd.graphicsWidget.resetHover();
    }

    onMouseDown(e, pos, imagePos) {
        if (!this._hasCropBox) {
            this._screenPos = pos;
            this._imagePos = imagePos;
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

                this._topImageCorner = wpd.graphicsWidget.screenToImagePx(this._topScreenCorner.x, this._topScreenCorner.y);
                this._imagePos = wpd.graphicsWidget.screenToImagePx(this._screenPos.x, this._screenPos.y);

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
        let topCanvasCorner = wpd.graphicsWidget.screenToCanvasPx(this._topScreenCorner.x, this._topScreenCorner.y);
        let canvasPos = wpd.graphicsWidget.screenToCanvasPx(this._screenPos.x, this._screenPos.y);

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = this._dpr;
        ctx.strokeRect(topCanvasCorner.x, topCanvasCorner.y,
            canvasPos.x - topCanvasCorner.x,
            canvasPos.y - topCanvasCorner.y);

        this._hotspotCoords = this._getHotspotCoords();

        ctx.fillStyle = "rgb(255,0,0)";
        ctx.strokeStyle = "rgb(255,255,255)";
        for (let pt of this._hotspotCoords) {
            ctx.beginPath();
            let canvasPt = wpd.graphicsWidget.screenToCanvasPx(pt.x, pt.y);
            ctx.arc(canvasPt.x, canvasPt.y, 4 * this._dpr, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.stroke();
        }

        if (this._showCenterPoint) {
            wpd.graphicsWidget.clearData();
            let oriDataCtx = this._ctx.oriDataCtx;
            let imagePt = {
                x: (this._topImageCorner.x + this._imagePos.x) / 2,
                y: (this._topImageCorner.y + this._imagePos.y) / 2,
            };
            oriDataCtx.fillStyle = "rgb(255,0,0)";
            oriDataCtx.strokeStyle = "rgb(255,255,255)";
            oriDataCtx.beginPath();
            oriDataCtx.arc(imagePt.x, imagePt.y, 4, 0, 2 * Math.PI, true);
            oriDataCtx.fill();
            oriDataCtx.stroke();
        }
    }

    onMouseUp(e, pos, imagePos) {
        this._finalizeDrawing();
        e.stopPropagation();
    }

    _finalizeDrawing() {
        clearTimeout(this._moveTimer);
        if (!this._isDrawing && !this._isResizing)
            return;

        this._isDrawing = false;
        this._isResizing = false;
        this._hasCropBox = true;
        this._drawCropBox();
        this.boundingBoxCompleted();
    }

    boundingBoxCompleted() {}

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

    onRedraw() {
        if (this._hasCropBox) {
            // recalculate screen coordinates and redraw crop-box
            this._topScreenCorner =
                wpd.graphicsWidget.imageToScreenPx(this._topImageCorner.x, this._topImageCorner.y);
            this._screenPos = wpd.graphicsWidget.imageToScreenPx(this._imagePos.x, this._imagePos.y);
            this._drawCropBox();
        }
    }
}
