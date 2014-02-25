/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.

*/

/* Zoomed-in view */
var wpd = wpd || {};
wpd.zoomView = (function() {
    var zCanvas, 
        zctx,
        tempCanvas,
        tctx,
        zWindowWidth = 250,
        zWindowHeight = 250,
        $mPosn,
        extendedCrosshair = false,
        pix = [],
        zoomTimeout,
        zoomRatio;

    pix[0] = new Array();

    function init() {

        zCanvas = document.getElementById('zoomCanvas');
    	zctx = zCanvas.getContext('2d');
	    tempCanvas = document.createElement('canvas');
        tctx = tempCanvas.getContext('2d');

        $mPosn = document.getElementById('mousePosition');

        var zCrossHair = document.getElementById("zoomCrossHair");
        var zchCtx = zCrossHair.getContext("2d");
        zchCtx.strokeStyle = "rgb(0,0,0)";
        zchCtx.beginPath();
        zchCtx.moveTo(zWindowWidth/2, 0);
        zchCtx.lineTo(zWindowWidth/2, zWindowHeight);
        zchCtx.moveTo(0, zWindowHeight/2);
        zchCtx.lineTo(zWindowWidth, zWindowHeight/2);
        zchCtx.stroke();

        zoomRatio = 5;
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
        tempCanvas.width = zwidth/zoomRatio;
        tempCanvas.height = zheight/zoomRatio;
        tctx.putImageData(imgData, 0, 0);
        zctx.drawImage(tempCanvas, x0, y0, zwidth, zheight);
    }

    function setCoords(imageX, imageY) {
        if(wpd.appData.isAligned()) {
            var plotData = wpd.appData.getPlotData(),
                dataCoords = plotData.axes.pixelToData(imageX, imageY);
            $mPosn.innerText = dataCoords[0] + ', ' + dataCoords[1];
        } else {
            $mPosn.innerText = imageX.toFixed(2) + ', ' + imageY.toFixed(2);
        }
    }

    return {
        initZoom: init,
        setZoomImage: setZoomImage,
        setCoords: setCoords,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,
        getSize: getSize
    };
})();

