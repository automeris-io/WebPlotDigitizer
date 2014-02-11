/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Multi-layered canvas widet to display plot, data, graphics etc. */

var graphicsWidget = (function () {

    var $mainCanvas, // original picture is displayed here
        $dataCanvas, // data points
        $drawCanvas, // selection region graphics etc
        $hoverCanvas, // temp graphics while drawing
        $topCanvas, // top level, handles mouse events

        $oriImageCanvas,
        $oriDataCanvas,
        
        $canvasDiv,

        mainCtx,
        dataCtx,
        drawCtx,
        hoverCtx,
        topCtx,

        oriImageCtx,
        oriDataCtx,

        width,
        height,
        originalWidth,
        originalHeight,
        
        aspectRatio,
        displayAspectRatio,
        
        originalImage,
        originalImageData,
        scaledImage,
        zoomRatio,
        extendedCrosshair = false,
        hoverTimer;

    function posn(ev) { // get screen pixel from event
        var mainCanvasPosition = $mainCanvas.getBoundingClientRect();
        return {
            x: parseInt(ev.pageX - (mainCanvasPosition.left + window.pageXOffset), 10),
            y: parseInt(ev.pageY - (mainCanvasPosition.top + window.pageYOffset), 10)
        };
    }

    // get image pixel when screen pixel is provided
    function imagePx(screenX, screenY) {
        return {
            x: screenX/zoomRatio,
            y: screenY/zoomRatio
        };
    }

    // get screen pixel when image pixel is provided
    function screenPx(imageX, imageY) {
        return {
            x: imageX*zoomRatio,
            y: imageY*zoomRatio
        };
    }

    function resize(cwidth, cheight) {

        cwidth = parseInt(cwidth, 10);
        cheight = parseInt(cheight, 10);

        $canvasDiv.style.width = cwidth + 'px';
        $canvasDiv.style.height = cheight + 'px';

        $mainCanvas.width = cwidth;
        $dataCanvas.width = cwidth;
        $drawCanvas.width = cwidth;
        $hoverCanvas.width = cwidth;
        $topCanvas.width = cwidth;

        $mainCanvas.height = cheight;
        $dataCanvas.height = cheight;
        $drawCanvas.height = cheight;
        $hoverCanvas.height = cheight;
        $topCanvas.height = cheight;

        displayAspectRatio = cwidth/(cheight*1.0);

        width = cwidth;
        height = cheight;

        drawImage();
    }

    function resetAllLayers() {
        $mainCanvas.width = $mainCanvas.width;
        resetDrawingLayers();
    }

    function resetDrawingLayers() {
        $dataCanvas.width = $dataCanvas.width;
        $drawCanvas.width = $drawCanvas.width;
        $hoverCanvas.width = $hoverCanvas.width;
        $topCanvas.width = $topCanvas.width;
    }

    function drawImage() {
        if(originalImage == null) return;
        
        mainCtx.fillStyle = "rgb(255, 255, 255)";
        mainCtx.fillRect(0, 0, width, height);
        mainCtx.drawImage(originalImage, 0, 0, width, height); 
    }

    function zoomIn() {
        setZoomRatio(zoomRatio*1.2);
    }

    function zoomOut() {
        setZoomRatio(zoomRatio/1.2);
    }

    function zoomFit() {
        var viewportSize = layoutManager.getGraphicsViewportSize();
        resize(viewportSize.width, viewportSize.height);

        if(displayAspectRatio > aspectRatio) {
            zoomRatio = height/(originalHeight*1.0);
            resize(height*aspectRatio, height);
        } else {
            zoomRatio = width/(originalWidth*1.0);
            resize(width, width/aspectRatio);
        }
    }

    function zoom100perc() {
        setZoomRatio(1.0);
    }

    function setZoomRatio(zratio) {
        zoomRatio = zratio;
        resize(originalWidth*zoomRatio, originalHeight*zoomRatio);
    }

    function getDrawCtx() {
        return drawCtx;
    }

    function getDataCtx() {
        return dataCtx;
    }

    function toggleExtendedCrosshair(ev) {
         if (ev.keyCode === 220) {
            ev.preventDefault();
            extendedCrosshair = !(extendedCrosshair);
            $hoverCanvas.width = $hoverCanvas.width;
        }
    }

    function hoverOverCanvas(ev) {
        var pos = posn(ev),
            xpos = pos.x,
            ypos = pos.y,
            imagePos = imagePx(xpos, ypos);

        if(extendedCrosshair) {
            $hoverCanvas.width = $hoverCanvas.width;
            hoverCtx.strokeStyle = "rgba(0,0,0, 0.5)";
            hoverCtx.beginPath();
            hoverCtx.moveTo(xpos, 0);
            hoverCtx.lineTo(xpos, height);
            hoverCtx.moveTo(0, ypos);
            hoverCtx.lineTo(width, ypos);
            hoverCtx.stroke();
        }

        setZoomImage(imagePos.x, imagePos.y);
        zoomView.setCoords(imagePos.x, imagePos.y);
    }

    function setZoomImage(ix, iy) {
        var zsize = zoomView.getSize(),
            zratio = zoomView.getZoomRatio(),
            ix0, iy0,
            zw, zh,
            iw, ih,
            idata,
            ixmin, iymin, ixmax, iymax,
            zxmin = 0, zymin = 0, zxmax = zsize.width, zymax = zsize.height;

        iw = zsize.width/zratio;
        ih = zsize.height/zratio;
        
        ix0 = ix - iw/2.0; iy0 = iy - ih/2.0;
        
        ixmin = ix0; iymin = iy0;
        ixmax = ix0 + iw; iymax = iy0 + ih;

        if(ix0 < 0) {
            ixmin = 0;
            zxmin = -ix0*zratio;
        }
        if(iy0 < 0) {
            iymin = 0;
            zymin = -iy0*zratio;
        }
        if(ix0 + iw >= originalWidth) {
            ixmax = originalWidth;
            zxmax = zxmax - zratio*(originalWidth - (ix0 + iw));
        }
        if(iy0 + ih >= originalHeight) {
            iymax = originalHeight;
            zymax = zymax - zratio*(originalHeight - (iy0 + ih));
        }
        idata = oriImageCtx.getImageData(parseInt(ixmin, 10), 
                                         parseInt(iymin, 10), 
                                         parseInt(ixmax-ixmin, 10), 
                                         parseInt(iymax-iymin, 10));

        zoomView.setZoomImage(idata, parseInt(zxmin, 10), 
                                     parseInt(zymin, 10), 
                                     parseInt(zxmax - zxmin, 10), 
                                     parseInt(zymax - zymin, 10));
    }

    function hoverOverCanvasHandler(ev) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(hoverOverCanvas(ev), 10);
    }

    function dropHandler(ev) {

    }

    function init() {
        $mainCanvas = document.getElementById('mainCanvas');
        $dataCanvas = document.getElementById('dataCanvas');
        $drawCanvas = document.getElementById('drawCanvas');
        $hoverCanvas = document.getElementById('hoverCanvas');
        $topCanvas = document.getElementById('topCanvas');
        
        $oriImageCanvas = document.createElement('canvas');

        mainCtx = $mainCanvas.getContext('2d');
        dataCtx = $dataCanvas.getContext('2d');
        hoverCtx = $hoverCanvas.getContext('2d');
        topCtx = $topCanvas.getContext('2d');
        drawCtx = $drawCanvas.getContext('2d');

        oriImageCtx = $oriImageCanvas.getContext('2d');

        $canvasDiv = document.getElementById('canvasDiv');

        // Extended crosshair
        document.body.addEventListener('keydown', toggleExtendedCrosshair, false);

        // hovering over canvas
        $topCanvas.addEventListener('mousemove', hoverOverCanvasHandler, false);

        // drag over canvas
        $topCanvas.addEventListener('dragover', function(evt) {
                evt.preventDefault();
            }, true);
        $topCanvas.addEventListener("drop", function(evt) { 
                evt.preventDefault(); 
                dropHandler(evt);
            }, true);
        
    }

    function loadImage() {
        
        if($mainCanvas == null) {
            init();
        }

        originalWidth = originalImage.width;
        originalHeight = originalImage.height;
        aspectRatio = originalWidth/(originalHeight*1.0);
        $oriImageCanvas.width = originalWidth;
        $oriImageCanvas.height = originalHeight;
        oriImageCtx.drawImage(originalImage, 0, 0, originalWidth, originalHeight);
        originalImageData = oriImageCtx.getImageData(0, 0, originalWidth, originalHeight);
        resetAllLayers();
        zoomFit();
    }

    function loadImageFromSrc(imgSrc) {
        originalImage = document.createElement('img');
        originalImage.onload = function () {
            loadImage();
        };
        originalImage.src = imgSrc;
    }

    return {
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomFit: zoomFit,
        zoom100perc: zoom100perc,
        setZoomRatio: setZoomRatio,
        loadImageFromURL: loadImageFromSrc,
        setTool: null,
        removeTool: null,
    };
})();
