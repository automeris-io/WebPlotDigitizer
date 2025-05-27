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

wpd.graphicsHelper = (function() {
    // imagePx - relative to original image
    // fillStyle - e.g. "rgb(200,0,0)"
    // label - e.g. "Bar 0"
    // position - "N", "E", "S" (default), or "W"
    function drawPoint(imagePx, fillStyle, label, position) {
        const canvasPx = wpd.graphicsWidget.imageToCanvasPx(imagePx.x, imagePx.y);
        const ctx = wpd.graphicsWidget.getAllContexts();
        const dpr = window.devicePixelRatio;
        let labelWidth = 1;
        let imageHeight = wpd.graphicsWidget.getImageSize().height;

        if (label != null) {
            // Display Data Canvas Layer
            ctx.dataCtx.font = (dpr === 1) ? "15px sans-serif" : "32px sans-serif";
            labelWidth = ctx.dataCtx.measureText(label).width;
            ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.5)";

            // Original Image Data Canvas Layer
            // No translucent background for text here.
            ctx.oriDataCtx.font = "15px sans-serif";
            ctx.oriDataCtx.fillStyle = fillStyle;

            // Switch for both canvases
            switch (position) {
                case "N":
                case "n":
                    ctx.dataCtx.fillRect(canvasPx.x - 13 * dpr, canvasPx.y - 24 * dpr, labelWidth + 5 * dpr, 35 * dpr);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, canvasPx.x - 10 * dpr, canvasPx.y - 7 * dpr);
                    ctx.oriDataCtx.fillText(label, imagePx.x - 10, imagePx.y - 7);
                    break;
                case "E":
                case "e":
                    ctx.dataCtx.fillRect(canvasPx.x - 7 * dpr, canvasPx.y - 16 * dpr, labelWidth + 17 * dpr, 26 * dpr);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, canvasPx.x + 7 * dpr, canvasPx.y + 5 * dpr);
                    ctx.oriDataCtx.fillText(label, imagePx.x + 7, imagePx.y + 5);
                    break;
                case "W":
                case "w":
                    ctx.dataCtx.fillRect(canvasPx.x - labelWidth - 10 * dpr, canvasPx.y - 16 * dpr, labelWidth + 17 * dpr,
                        26 * dpr);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, canvasPx.x - labelWidth - 7 * dpr, canvasPx.y + 5 * dpr);
                    ctx.oriDataCtx.fillText(label, imagePx.x - labelWidth - 7, imagePx.y + 5);
                    break;
                default:
                    ctx.dataCtx.fillRect(canvasPx.x - 13 * dpr, canvasPx.y - 8 * dpr, labelWidth + 5 * dpr, 35 * dpr);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, canvasPx.x - 10 * dpr, canvasPx.y + 18 * dpr);
                    ctx.oriDataCtx.fillText(label, imagePx.x - 10, imagePx.y + 18);
            }
        }

        // Display Data Canvas Layer
        ctx.dataCtx.beginPath();
        ctx.dataCtx.fillStyle = fillStyle;
        ctx.dataCtx.strokeStyle = "rgb(255, 255, 255)";
        ctx.dataCtx.arc(canvasPx.x, canvasPx.y, 4 * dpr, 0, 2.0 * Math.PI, true);
        ctx.dataCtx.fill();
        ctx.dataCtx.stroke();

        // Original Image Data Canvas Layer
        ctx.oriDataCtx.beginPath();
        ctx.oriDataCtx.fillStyle = fillStyle;
        ctx.oriDataCtx.strokeStyle = "rgb(255, 255, 255)";
        ctx.oriDataCtx.arc(imagePx.x, imagePx.y, 3, 0, 2.0 * Math.PI,
            true);
        ctx.oriDataCtx.fill();
        ctx.oriDataCtx.stroke();
    }

    function drawCircle(circleInfo, strokeStyle) {
        const dpr = window.devicePixelRatio;
        let canvasPx = wpd.graphicsWidget.imageToCanvasPx(circleInfo.x0, circleInfo.y0);
        let canvasRadius = wpd.graphicsWidget.imageToCanvasLength(circleInfo.radius);
        let ctx = wpd.graphicsWidget.getAllContexts();

        ctx.dataCtx.beginPath();
        ctx.dataCtx.strokeStyle = strokeStyle;
        ctx.dataCtx.lineWidth = 2 * dpr;
        ctx.dataCtx.arc(canvasPx.x, canvasPx.y, canvasRadius, 0, 2.0 * Math.PI, false);
        ctx.dataCtx.stroke();

        ctx.oriDataCtx.beginPath();
        ctx.oriDataCtx.strokeStyle = strokeStyle;
        ctx.oriDataCtx.lineWidth = 2;
        ctx.oriDataCtx.arc(circleInfo.x0, circleInfo.y0, circleInfo.radius, 0, 2.0 * Math.PI, false);
        ctx.oriDataCtx.stroke();
    }

    function drawBox(bbox, strokeStyle) {
        const dpr = window.devicePixelRatio;
        const ctx = wpd.graphicsWidget.getAllContexts();
        const canvasPx0 = wpd.graphicsWidget.imageToCanvasPx(bbox.xmin, bbox.ymin);
        const canvasPx1 = wpd.graphicsWidget.imageToCanvasPx(bbox.xmax, bbox.ymax);

        ctx.dataCtx.strokeStyle = strokeStyle;
        ctx.dataCtx.lineWidth = dpr;
        ctx.dataCtx.strokeRect(canvasPx0.x, canvasPx0.y, canvasPx1.x - canvasPx0.x, canvasPx1.y - canvasPx0.y);

        ctx.oriDataCtx.strokeStyle = strokeStyle;
        ctx.oriDataCtx.strokeRect(bbox.xmin, bbox.ymin, bbox.xmax - bbox.xmin, bbox.ymax - bbox.ymin);
    }

    function drawLine(p1, p2, strokeStyle) {
        const dpr = window.devicePixelRatio;
        const ctx = wpd.graphicsWidget.getAllContexts();
        const canvasP1 = wpd.graphicsWidget.imageToCanvasPx(p1.x, p1.y);
        const canvasP2 = wpd.graphicsWidget.imageToCanvasPx(p2.x, p2.y);

        ctx.dataCtx.beginPath();
        ctx.dataCtx.strokeStyle = strokeStyle;
        ctx.dataCtx.lineWidth = 3 * dpr;
        ctx.dataCtx.moveTo(canvasP1.x, canvasP1.y);
        ctx.dataCtx.lineTo(canvasP2.x, canvasP2.y);
        ctx.dataCtx.stroke();

        ctx.oriDataCtx.beginPath();
        ctx.oriDataCtx.strokeStyle = strokeStyle;
        ctx.oriDataCtx.lineWidth = 2;
        ctx.oriDataCtx.moveTo(p1.x, p1.y);
        ctx.oriDataCtx.lineTo(p2.x, p2.y);
        ctx.oriDataCtx.stroke();
    }

    return {
        drawPoint: drawPoint,
        drawCircle: drawCircle,
        drawBox: drawBox,
        drawLine: drawLine
    };
})();
