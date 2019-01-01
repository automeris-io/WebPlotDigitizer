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

wpd.graphicsHelper = (function() {
    // imagePx - relative to original image
    // fillStyle - e.g. "rgb(200,0,0)"
    // label - e.g. "Bar 0"
    // position - "N", "E", "S" (default), or "W"
    function drawPoint(imagePx, fillStyle, label, position) {
        var screenPx = wpd.graphicsWidget.screenPx(imagePx.x, imagePx.y),
            ctx = wpd.graphicsWidget.getAllContexts(),
            labelWidth,
            imageHeight = wpd.graphicsWidget.getImageSize().height;

        if (label != null) {
            // Display Data Canvas Layer
            ctx.dataCtx.font = "15px sans-serif";
            labelWidth = ctx.dataCtx.measureText(label).width;
            ctx.dataCtx.fillStyle = "rgba(255, 255, 255, 0.7)";

            // Original Image Data Canvas Layer
            // No translucent background for text here.
            ctx.oriDataCtx.font = "15px sans-serif";
            ctx.oriDataCtx.fillStyle = fillStyle;

            // Switch for both canvases
            switch (position) {
                case "N":
                case "n":
                    ctx.dataCtx.fillRect(screenPx.x - 13, screenPx.y - 24, labelWidth + 5, 35);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, screenPx.x - 10, screenPx.y - 7);
                    ctx.oriDataCtx.fillText(label, imagePx.x - 10, imagePx.y - 7);
                    break;
                case "E":
                case "e":
                    ctx.dataCtx.fillRect(screenPx.x - 7, screenPx.y - 16, labelWidth + 17, 26);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, screenPx.x + 7, screenPx.y + 5);
                    ctx.oriDataCtx.fillText(label, imagePx.x + 7, imagePx.y + 5);
                    break;
                case "W":
                case "w":
                    ctx.dataCtx.fillRect(screenPx.x - labelWidth - 10, screenPx.y - 16, labelWidth + 17,
                        26);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, screenPx.x - labelWidth - 7, screenPx.y + 5);
                    ctx.oriDataCtx.fillText(label, imagePx.x - labelWidth - 7, imagePx.y + 5);
                    break;
                default:
                    ctx.dataCtx.fillRect(screenPx.x - 13, screenPx.y - 8, labelWidth + 5, 35);
                    ctx.dataCtx.fillStyle = fillStyle;
                    ctx.dataCtx.fillText(label, screenPx.x - 10, screenPx.y + 18);
                    ctx.oriDataCtx.fillText(label, imagePx.x - 10, imagePx.y + 18);
            }
        }

        // Display Data Canvas Layer
        ctx.dataCtx.beginPath();
        ctx.dataCtx.fillStyle = fillStyle;
        ctx.dataCtx.strokeStyle = "rgb(255, 255, 255)";
        ctx.dataCtx.arc(screenPx.x, screenPx.y, 4, 0, 2.0 * Math.PI, true);
        ctx.dataCtx.fill();
        ctx.dataCtx.stroke();

        // Original Image Data Canvas Layer
        ctx.oriDataCtx.beginPath();
        ctx.oriDataCtx.fillStyle = fillStyle;
        ctx.oriDataCtx.strokeStyle = "rgb(255, 255, 255)";
        ctx.oriDataCtx.arc(imagePx.x, imagePx.y, imageHeight > 1500 ? 4 : 2, 0, 2.0 * Math.PI,
            true);
        ctx.oriDataCtx.fill();
        ctx.oriDataCtx.stroke();
    }

    return {
        drawPoint: drawPoint
    };
})();