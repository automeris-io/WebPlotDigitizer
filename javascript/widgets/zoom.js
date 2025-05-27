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
wpd.zoomView = (function() {
    let zCanvas = null;
    let zCrossHair = null;
    let zctx = null;
    let zchCtx = null;
    let tempCanvas = null;
    let tctx = null;
    let zWindowWidth = 250;
    let zWindowHeight = 250;
    let $mPosn = null;
    let pix = [];
    let zoomRatio = 5;
    let crosshairColorText = 'black';
    let dpRatio = 1.0;

    pix[0] = [];

    function init() {
        dpRatio = window.devicePixelRatio;
        zCanvas = document.getElementById('zoomCanvas');
        zCrossHair = document.getElementById('zoomCrossHair');
        if (dpRatio != 1) {
            zCanvas.width = zWindowWidth * dpRatio;
            zCanvas.height = zWindowHeight * dpRatio;
            zCanvas.style.width = zWindowWidth + 'px';
            zCanvas.style.height = zWindowHeight + 'px';

            zCrossHair.width = zWindowWidth * dpRatio;
            zCrossHair.height = zWindowHeight * dpRatio;
            zCrossHair.style.width = zWindowWidth + 'px';
            zCrossHair.style.height = zWindowHeight + 'px';

            zWindowWidth = zWindowWidth * dpRatio;
            zWindowHeight = zWindowHeight * dpRatio;
        }
        tempCanvas = document.createElement('canvas');
        $mPosn = document.getElementById('mousePosition');
        zctx = zCanvas.getContext('2d');
        zchCtx = zCrossHair.getContext("2d");
        tctx = tempCanvas.getContext('2d');
        zoomRatio = 5;
        drawCrosshair();
    }

    function drawCrosshair() {
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
        zchCtx.lineWidth = dpRatio;
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

    function setZoomImage(imgData, x0, y0, zwidth, zheight, matrix) {
        tempCanvas.width = zwidth / zoomRatio;
        tempCanvas.height = zheight / zoomRatio;
        tctx.putImageData(imgData, 0, 0);
        zCanvas.width = zCanvas.width;
        // rotate zoom canvas after reset (setting width resets)
        zctx.setTransform(matrix);
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
