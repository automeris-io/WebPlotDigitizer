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
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.*/

/* Zoomed-in view */
var wpd = wpd || {};
wpd.zoomView = (function() {
    var zCanvas, zctx, tempCanvas, tctx, zWindowWidth = 250,
        zWindowHeight = 250,
        $mPosn, pix = [],
        zoomRatio, crosshairColorText = 'black';

    pix[0] = [];

    function init() {

        zCanvas = document.getElementById('zoomCanvas');
        zctx = zCanvas.getContext('2d');
        tempCanvas = document.createElement('canvas');
        tctx = tempCanvas.getContext('2d');

        $mPosn = document.getElementById('mousePosition');

        zoomRatio = 5;

        drawCrosshair();
    }

    function drawCrosshair() {
        var zCrossHair = document.getElementById("zoomCrossHair");
        var zchCtx = zCrossHair.getContext("2d");

        zCrossHair.width = zCrossHair.width;

        if (crosshairColorText === 'black') {
            zchCtx.strokeStyle = "rgba(0,0,0,1)";
        } else if (crosshairColorText === 'red') {
            zchCtx.strokeStyle = "rgba(255,0,0,1)";
        } else if (crosshairColorText === 'yellow') {
            zchCtx.strokeStyle = "rgba(255,255,0,1)";
        } else {
            zchCtx.strokeStyle = "rgba(0,0,0,1)";
        }

        zchCtx.beginPath();
        zchCtx.moveTo(zWindowWidth / 2, 0);
        zchCtx.lineTo(zWindowWidth / 2, zWindowHeight);
        zchCtx.moveTo(0, zWindowHeight / 2);
        zchCtx.lineTo(zWindowWidth, zWindowHeight / 2);
        zchCtx.stroke();
    }

    function setZoomRatio(zratio) {
        zoomRatio = zratio;
    }

    function getZoomRatio() {
        return zoomRatio;
    }

    function getSize() {
        return {
            width: zWindowWidth,
            height: zWindowHeight
        };
    }

    function setZoomImage(imgData, x0, y0, zwidth, zheight) {
        tempCanvas.width = zwidth / zoomRatio;
        tempCanvas.height = zheight / zoomRatio;
        tctx.putImageData(imgData, 0, 0);
        zCanvas.width = zCanvas.width;
        zctx.drawImage(tempCanvas, x0, y0, zwidth, zheight);
    }

    function setCoords(imageX, imageY) {
        const axes = wpd.tree.getActiveAxes();
        if (axes != null) {
            $mPosn.innerHTML = axes.pixelToLiveString(imageX, imageY);
        } else {
            $mPosn.innerHTML = imageX.toFixed(2) + ', ' + imageY.toFixed(2);
        }
    }

    function showSettingsWindow() {
        document.getElementById('zoom-magnification-value').value = zoomRatio;
        document.getElementById('zoom-crosshair-color-value').value = crosshairColorText;
        wpd.popup.show('zoom-settings-popup');
    }

    function applySettings() {
        zoomRatio = document.getElementById('zoom-magnification-value').value;
        crosshairColorText = document.getElementById('zoom-crosshair-color-value').value;
        drawCrosshair();
        wpd.popup.close('zoom-settings-popup');
    }

    return {
        initZoom: init,
        setZoomImage: setZoomImage,
        setCoords: setCoords,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,
        getSize: getSize,
        showSettingsWindow: showSettingsWindow,
        applySettings: applySettings
    };
})();