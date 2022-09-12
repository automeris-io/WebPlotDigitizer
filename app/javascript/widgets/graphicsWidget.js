/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2022 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

/* Multi-layered canvas widget to display plot, data, graphics etc. */
var wpd = wpd || {};
wpd.graphicsWidget = (function() {
    var $mainCanvas, // original picture is displayed here
        $dataCanvas, // data points
        $drawCanvas, // selection region graphics etc
        $hoverCanvas, // temp graphics while drawing
        $topCanvas, // top level, handles mouse events

        $oriImageCanvas, $oriDataCanvas, $tempImageCanvas,

        $canvasDiv,

        mainCtx, dataCtx, drawCtx, hoverCtx, topCtx,

        oriImageCtx, oriDataCtx, tempImageCtx,

        width, height, originalWidth, originalHeight,

        aspectRatio, displayAspectRatio,

        originalImageData, zoomRatio, extendedCrosshair = false,
        hoverTimer,

        activeTool, repaintHandler,

        isCanvasInFocus = false,

        firstLoad = true,

        rotation = 0;

    function posn(ev) { // get screen pixel from event
        let mainCanvasPosition = $mainCanvas.getBoundingClientRect();
        return {
            x: parseInt(ev.pageX - (mainCanvasPosition.left + window.pageXOffset), 10),
            y: parseInt(ev.pageY - (mainCanvasPosition.top + window.pageYOffset), 10)
        };
    }

    // get image pixel when screen pixel is provided
    function imagePx(screenX, screenY) {
        const imageX = screenX / zoomRatio;
        const imageY = screenY / zoomRatio;

        if (rotation === 0) {
            // this function is often called frequently
            // do not do extra work if canvases have not been rotated
            return {
                x: imageX,
                y: imageY
            };
        } else {
            // rotate given x and y after dividing by zoom ratio
            return getRotatedCoordinates(rotation, 0, imageX, imageY);
        }
    }

    // get screen pixel when image pixel is provided
    function screenPx(imageX, imageY) {
        return {
            x: imageX * zoomRatio,
            y: imageY * zoomRatio
        };
    }

    function screenLength(imageLength) {
        return imageLength * zoomRatio;
    }

    function getDisplaySize() {
        return {
            width: width,
            height: height
        };
    }

    function getImageSize() {
        return {
            width: originalWidth,
            height: originalHeight
        };
    }

    function getAllContexts() {
        return {
            mainCtx: mainCtx,
            dataCtx: dataCtx,
            drawCtx: drawCtx,
            hoverCtx: hoverCtx,
            topCtx: topCtx,
            oriImageCtx: oriImageCtx,
            oriDataCtx: oriDataCtx
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

        displayAspectRatio = cwidth / (cheight * 1.0);

        width = cwidth;
        height = cheight;
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
        $oriDataCanvas.width = $oriDataCanvas.width;
    }

    function drawImage(dx, dy) {
        if (originalImageData == null)
            return;

        mainCtx.fillStyle = "rgb(255, 255, 255)";
        mainCtx.fillRect(0, 0, dx, dy);
        mainCtx.drawImage($oriImageCanvas, 0, 0, dx, dy);

        if (repaintHandler != null && repaintHandler.onRedraw != undefined) {
            repaintHandler.onRedraw();
        }

        if (activeTool != null && activeTool.onRedraw != undefined) {
            activeTool.onRedraw();
        }
    }

    function forceHandlerRepaint() {
        if (repaintHandler != null && repaintHandler.onForcedRedraw != undefined) {
            repaintHandler.onForcedRedraw();
        }
    }

    function setRepainter(fhandle) {
        if (repaintHandler != null && repaintHandler.onRemove != undefined) {
            repaintHandler.onRemove();
        }
        repaintHandler = fhandle;
        if (repaintHandler != null && repaintHandler.onAttach != undefined) {
            repaintHandler.onAttach();
        }
    }

    function getRepainter() {
        return repaintHandler;
    }

    function removeRepainter() {
        if (repaintHandler != null && repaintHandler.onRemove != undefined) {
            repaintHandler.onRemove();
        }
        repaintHandler = null;
    }

    function copyImageDataLayerToScreen() {
        if (rotation % 180 === 0) {
            dataCtx.drawImage($oriDataCanvas, 0, 0, width, height);
        } else {
            dataCtx.drawImage($oriDataCanvas, 0, 0, height, width);
        }
    }

    function getRotationMatrix(degrees, dx, dy) {
        // determine translation (moves origin)
        let xTranslation, yTranslation;
        switch (degrees) {
            case 90:
                xTranslation = dy ?? 0;
                yTranslation = 0;
                break;
            case 180:
                xTranslation = dx ?? 0;
                yTranslation = dy ?? 0;
                break;
            case 270:
                xTranslation = 0;
                yTranslation = dx ?? 0;
                break;
            default:
                xTranslation = 0;
                yTranslation = 0;
                break;
        }

        // convert degrees to radians
        const radians = degrees * Math.PI / 180;

        // define transformation matrix [a, b, c, d, e, f]
        // matrix format:
        //   a c e 0
        //   b d f 0
        //   0 0 1 0
        //   0 0 0 1
        return new DOMMatrix([
            Math.cos(radians),
            Math.sin(radians),
            -Math.sin(radians),
            Math.cos(radians),
            xTranslation,
            yTranslation,
        ]);
    };

    function rotateClockwise() {
        rotateAndResize(90);
    }

    function rotateCounterClockwise() {
        rotateAndResize(-90);
    }

    function rotateAndResize(deltaDegrees = 0, newWidth = null, newHeight = null) {
        // do nothing if delta degrees value is not a multiple of 90
        if (Math.abs(deltaDegrees) % 90 !== 0) {
            return;
        }

        // use provided width and height, if available
        // otherwise, use current zoomed width and height values
        const displayWidth = newWidth ?? (originalWidth * zoomRatio);
        const displayHeight = newHeight ?? (originalHeight * zoomRatio);

        // add delta degrees to rotation
        // if rotation is 0 start at 360
        // modulo to make sure it is 0 <= d < 360
        rotation = ((rotation || 360) + deltaDegrees) % 360;

        // determine if it is necessary to swap canvas width and height
        const dimensions = rotation % 180 === 0 ? [displayWidth, displayHeight] : [displayHeight, displayWidth];

        // setting size clears canvases, update the size of the canvases before transforming
        resize(...dimensions);

        // get transformation matrix and set transform on canvas context
        const matrix = getRotationMatrix(rotation, displayWidth, displayHeight);
        mainCtx.setTransform(matrix);
        dataCtx.setTransform(matrix);
        drawCtx.setTransform(matrix);
        hoverCtx.setTransform(matrix);
        topCtx.setTransform(matrix);

        // draw the image with the rotation independent dimensions
        drawImage(displayWidth, displayHeight);

        // fire rotation event if image has been rotated
        if (deltaDegrees !== 0) {
            wpd.events.dispatch("wpd.image.rotate", {
                rotation: rotation
            });
        }
    }

    function getRotation() {
        return rotation;
    }

    function setRotation(degrees) {
        rotation = degrees;
    }

    function zoomIn() {
        setZoomRatio(zoomRatio * 1.2);
    }

    function zoomOut() {
        setZoomRatio(zoomRatio / 1.2);
    }

    function zoomFit() {
        let viewportSize = wpd.layoutManager.getGraphicsViewportSize();
        let newAspectRatio = viewportSize.width / (viewportSize.height * 1.0);

        if (newAspectRatio > aspectRatio) {
            zoomRatio = viewportSize.height / (originalHeight * 1.0);
            rotateAndResize(0, viewportSize.height * aspectRatio, viewportSize.height);
        } else {
            zoomRatio = viewportSize.width / (originalWidth * 1.0);
            rotateAndResize(0, viewportSize.width, viewportSize.width / aspectRatio);
        }
    }

    function zoom100perc() {
        setZoomRatio(1.0);
    }

    function setZoomRatio(zratio) {
        zoomRatio = zratio;
        rotateAndResize(0, originalWidth * zoomRatio, originalHeight * zoomRatio);
    }

    function getZoomRatio() {
        return zoomRatio;
    }

    function resetData() {
        $oriDataCanvas.width = $oriDataCanvas.width;
        $dataCanvas.width = $dataCanvas.width;

        // re-rotate canvases
        rotateAndResize();
    }

    function resetHover() {
        $hoverCanvas.width = $hoverCanvas.width;
    }

    function toggleExtendedCrosshair(ev) { // called when backslash is hit
        if (ev.keyCode === 220) {
            ev.preventDefault();
            toggleExtendedCrosshairBtn();
        }
    }

    function toggleExtendedCrosshairBtn() { // called directly when toolbar button is hit
        extendedCrosshair = !(extendedCrosshair);
        let $crosshairBtn = document.getElementById('extended-crosshair-btn');
        if (extendedCrosshair) {
            $crosshairBtn.classList.add('pressed-button');
        } else {
            $crosshairBtn.classList.remove('pressed-button');
        }
        $topCanvas.width = $topCanvas.width;
    }

    function hoverOverCanvas(ev) {
        let pos = posn(ev);
        let xpos = pos.x;
        let ypos = pos.y;
        let imagePos = imagePx(xpos, ypos);

        if (extendedCrosshair) {
            $topCanvas.width = $topCanvas.width;
            topCtx.strokeStyle = "rgba(0,0,0, 0.5)";
            topCtx.beginPath();
            topCtx.moveTo(xpos, 0);
            topCtx.lineTo(xpos, height);
            topCtx.moveTo(0, ypos);
            topCtx.lineTo(width, ypos);
            topCtx.stroke();
        }

        setZoomImage(imagePos.x, imagePos.y);
        wpd.zoomView.setCoords(imagePos.x, imagePos.y);
    }

    function getRotatedCoordinates(sourceDegrees, targetDegrees, x, y) {
        // get the delta degrees
        const deltaDegrees = targetDegrees - sourceDegrees;

        // short-circuit
        // return original x and y if delta degrees is not a multiple of 90
        if (Math.abs(deltaDegrees) % 90 !== 0) {
            return {
                x: x,
                y: y
            };
        }

        // determine source rotation image dimensions
        const dimensions = sourceDegrees % 180 === 0 ? {
            x: originalWidth,
            y: originalHeight
        } : {
            x: originalHeight,
            y: originalWidth
        };

        let rotatedX, rotatedY;
        switch (deltaDegrees) {
            case 90:
            case -270:
                rotatedX = dimensions.y - y;
                rotatedY = x;
                break;
            case 180:
            case -180:
                rotatedX = dimensions.x - x;
                rotatedY = dimensions.y - y;
                break;
            case 270:
            case -90:
                rotatedX = y;
                rotatedY = dimensions.x - x;
                break;
            case 360:
            case 0:
            default:
                rotatedX = x;
                rotatedY = y;
                break;
        }

        return {
            x: rotatedX,
            y: rotatedY
        };
    }

    function setZoomImage(ix, iy) {
        var zsize = wpd.zoomView.getSize(),
            zratio = wpd.zoomView.getZoomRatio(),
            ix0, iy0, iw, ih,
            idata, ddata, ixmin, iymin, ixmax, iymax, zxmin = 0,
            zymin = 0,
            zxmax = zsize.width,
            zymax = zsize.height,
            xcorr, ycorr, alpha;

        iw = zsize.width / zratio;
        ih = zsize.height / zratio;

        ix0 = ix - iw / 2.0;
        iy0 = iy - ih / 2.0;

        ixmin = ix0;
        iymin = iy0;
        ixmax = ix0 + iw;
        iymax = iy0 + ih;

        if (ix0 < 0) {
            ixmin = 0;
            zxmin = -ix0 * zratio;
        }
        if (iy0 < 0) {
            iymin = 0;
            zymin = -iy0 * zratio;
        }
        if (ix0 + iw >= originalWidth) {
            ixmax = originalWidth;
            zxmax = zxmax - zratio * (originalWidth - (ix0 + iw));
        }
        if (iy0 + ih >= originalHeight) {
            iymax = originalHeight;
            zymax = zymax - zratio * (originalHeight - (iy0 + ih));
        }
        idata = oriImageCtx.getImageData(parseInt(ixmin, 10), parseInt(iymin, 10),
            parseInt(ixmax - ixmin, 10), parseInt(iymax - iymin, 10));

        ddata = oriDataCtx.getImageData(parseInt(ixmin, 10), parseInt(iymin, 10),
            parseInt(ixmax - ixmin, 10), parseInt(iymax - iymin, 10));

        for (var index = 0; index < ddata.data.length; index += 4) {
            if (ddata.data[index] != 0 || ddata.data[index + 1] != 0 ||
                ddata.data[index + 2] != 0) {
                alpha = ddata.data[index + 3] / 255;
                idata.data[index] = (1 - alpha) * idata.data[index] + alpha * ddata.data[index];
                idata.data[index + 1] =
                    (1 - alpha) * idata.data[index + 1] + alpha * ddata.data[index + 1];
                idata.data[index + 2] =
                    (1 - alpha) * idata.data[index + 2] + alpha * ddata.data[index + 2];
            }
        }

        // Make this accurate to subpixel level
        xcorr = zratio * (parseInt(ixmin, 10) - ixmin);
        ycorr = zratio * (parseInt(iymin, 10) - iymin);

        wpd.zoomView.setZoomImage(idata, parseInt(zxmin + xcorr, 10), parseInt(zymin + ycorr, 10),
            parseInt(zxmax - zxmin, 10), parseInt(zymax - zymin, 10), getRotationMatrix(rotation, zxmax, zymax));
    }

    function updateZoomOnEvent(ev) {
        var pos = posn(ev),
            xpos = pos.x,
            ypos = pos.y,
            imagePos = imagePx(xpos, ypos);
        setZoomImage(imagePos.x, imagePos.y);
        wpd.zoomView.setCoords(imagePos.x, imagePos.y);
    }

    function updateZoomToImagePosn(x, y) {
        setZoomImage(x, y);
        wpd.zoomView.setCoords(x, y);
    }

    function hoverOverCanvasHandler(ev) {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(hoverOverCanvas(ev), 10);
    }

    function dropHandler(ev) {
        wpd.busyNote.show();
        let allDrop = ev.dataTransfer.files;
        if (allDrop.length === 1) {
            wpd.imageManager.initializeFileManager(allDrop);
            wpd.imageManager.loadFromFile(allDrop[0]);
        }
    }

    function pasteHandler(ev) {
        if (ev.clipboardData !== undefined) {
            let items = ev.clipboardData.items;
            if (items !== undefined) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        wpd.busyNote.show();
                        var imageFile = items[i].getAsFile();
                        wpd.imageManager.initializeFileManager([imageFile]);
                        wpd.imageManager.loadFromFile(imageFile);
                    }
                }
            }
        }
    }

    function init() {
        $mainCanvas = document.getElementById('mainCanvas');
        $dataCanvas = document.getElementById('dataCanvas');
        $drawCanvas = document.getElementById('drawCanvas');
        $hoverCanvas = document.getElementById('hoverCanvas');
        $topCanvas = document.getElementById('topCanvas');

        $oriImageCanvas = document.createElement('canvas');
        $oriDataCanvas = document.createElement('canvas');
        $tempImageCanvas = document.createElement('canvas');

        mainCtx = $mainCanvas.getContext('2d');
        dataCtx = $dataCanvas.getContext('2d');
        hoverCtx = $hoverCanvas.getContext('2d');
        topCtx = $topCanvas.getContext('2d');
        drawCtx = $drawCanvas.getContext('2d');

        oriImageCtx = $oriImageCanvas.getContext('2d');
        oriDataCtx = $oriDataCanvas.getContext('2d');
        tempImageCtx = $tempImageCanvas.getContext('2d');

        $canvasDiv = document.getElementById('canvasDiv');

        // Extended crosshair
        document.addEventListener('keydown', function(ev) {
            if (isCanvasInFocus) {
                toggleExtendedCrosshair(ev);
            }
        }, false);

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

        $topCanvas.addEventListener("mousemove", onMouseMove, false);
        $topCanvas.addEventListener("click", onMouseClick, false);
        $topCanvas.addEventListener("mouseup", onMouseUp, false);
        $topCanvas.addEventListener("mousedown", onMouseDown, false);
        $topCanvas.addEventListener("mouseout", onMouseOut, true);
        document.addEventListener("mouseup", onDocumentMouseUp, false);

        document.addEventListener("mousedown", function(ev) {
            if (ev.target === $topCanvas) {
                isCanvasInFocus = true;
            } else {
                isCanvasInFocus = false;
            }
        }, false);
        document.addEventListener("keydown", function(ev) {
            if (isCanvasInFocus) {
                onKeyDown(ev);
            }
        }, true);

        wpd.zoomView.initZoom();

        // Paste image from clipboard
        window.addEventListener('paste', function(event) {
            pasteHandler(event);
        }, false);
    }

    function loadImage(originalImage, savedRotation) {
        if ($mainCanvas == null) {
            init();
        }
        removeTool();
        removeRepainter();
        originalWidth = originalImage.width;
        originalHeight = originalImage.height;
        aspectRatio = originalWidth / (originalHeight * 1.0);
        $oriImageCanvas.width = originalWidth;
        $oriImageCanvas.height = originalHeight;
        $oriDataCanvas.width = originalWidth;
        $oriDataCanvas.height = originalHeight;
        oriImageCtx.drawImage(originalImage, 0, 0, originalWidth, originalHeight);
        originalImageData = oriImageCtx.getImageData(0, 0, originalWidth, originalHeight);
        setRotation(savedRotation);
        resetAllLayers();
        zoomFit();
        return originalImageData;
    }

    function loadImageFromData(idata, iwidth, iheight, keepZoom) {
        removeTool();
        removeRepainter();
        originalWidth = iwidth;
        originalHeight = iheight;
        aspectRatio = originalWidth / (originalHeight * 1.0);
        $oriImageCanvas.width = originalWidth;
        $oriImageCanvas.height = originalHeight;
        $oriDataCanvas.width = originalWidth;
        $oriDataCanvas.height = originalHeight;
        oriImageCtx.putImageData(idata, 0, 0);
        originalImageData = idata;
        resetAllLayers();

        if (!keepZoom) {
            zoomFit();
        } else {
            setZoomRatio(zoomRatio);
        }
    }

    function saveImage() {
        var exportCanvas = document.createElement('canvas'),
            exportCtx = exportCanvas.getContext('2d'),
            exportData, di, dLayer, alpha;
        exportCanvas.width = originalWidth;
        exportCanvas.height = originalHeight;
        exportCtx.drawImage($oriImageCanvas, 0, 0, originalWidth, originalHeight);
        exportData = exportCtx.getImageData(0, 0, originalWidth, originalHeight);
        dLayer = oriDataCtx.getImageData(0, 0, originalWidth, originalHeight);
        for (di = 0; di < exportData.data.length; di += 4) {
            if (dLayer.data[di] != 0 || dLayer.data[di + 1] != 0 || dLayer.data[di + 2] != 0) {
                alpha = dLayer.data[di + 3] / 255;
                exportData.data[di] = (1 - alpha) * exportData.data[di] + alpha * dLayer.data[di];
                exportData.data[di + 1] =
                    (1 - alpha) * exportData.data[di + 1] + alpha * dLayer.data[di + 1];
                exportData.data[di + 2] =
                    (1 - alpha) * exportData.data[di + 2] + alpha * dLayer.data[di + 2];
            }
        }
        exportCtx.putImageData(exportData, 0, 0);
        window.open(exportCanvas.toDataURL(), "_blank");
    }

    // run an external operation on the image data. this would normally mean a reset.
    function runImageOp(operFn) {
        let opResult = operFn(originalImageData, originalWidth, originalHeight);
        loadImageFromData(opResult.imageData, opResult.width, opResult.height, opResult.keepZoom);
    }

    function getImageData() {
        return originalImageData;
    }

    function setTool(tool) {
        if (activeTool != null && activeTool.onRemove != undefined) {
            activeTool.onRemove();
        }
        activeTool = tool;
        if (activeTool != null && activeTool.onAttach != undefined) {
            activeTool.onAttach();
        }
    }

    function removeTool() {
        if (activeTool != null && activeTool.onRemove != undefined) {
            activeTool.onRemove();
        }
        activeTool = null;
    }

    function onMouseMove(ev) {
        if (activeTool != null && activeTool.onMouseMove != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseMove(ev, pos, imagePos);
        }
    }

    function onMouseClick(ev) {
        if (activeTool != null && activeTool.onMouseClick != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseClick(ev, pos, imagePos);
        }
    }

    function onDocumentMouseUp(ev) {
        if (activeTool != null && activeTool.onDocumentMouseUp != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onDocumentMouseUp(ev, pos, imagePos);
        }
    }

    function onMouseUp(ev) {
        if (activeTool != null && activeTool.onMouseUp != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseUp(ev, pos, imagePos);
        }
    }

    function onMouseDown(ev) {
        if (activeTool != null && activeTool.onMouseDown != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseDown(ev, pos, imagePos);
        }
    }

    function onMouseOut(ev) {
        if (activeTool != null && activeTool.onMouseOut != undefined) {
            var pos = posn(ev),
                xpos = pos.x,
                ypos = pos.y,
                imagePos = imagePx(xpos, ypos);
            activeTool.onMouseOut(ev, pos, imagePos);
        }
    }

    function onKeyDown(ev) {
        if (activeTool != null && activeTool.onKeyDown != undefined) {
            activeTool.onKeyDown(ev);
        }
    }

    // for use when downloading wpd project file
    // converts all images (except pdfs) to png
    function getImageFiles() {
        let imageFiles = [];
        for (const file of wpd.appData.getFileManager().getFiles()) {
            let imageFile;
            if (file.type === 'application/pdf') {
                imageFile = file;
            } else {
                imageFile = _convertToPNG(file);
            }
            imageFiles.push(imageFile);
        }
        return Promise.all(imageFiles);
    }

    function _convertToPNG(imageFile) {
        return new Promise((resolve, reject) => {
            // reject any non-image files
            if (imageFile.type.match("image.*")) {
                let reader = new FileReader();
                reader.onload = function() {
                    let url = reader.result;
                    new Promise((resolve, reject) => {
                        let image = new Image();
                        image.onload = function() {
                            $tempImageCanvas.width = image.width;
                            $tempImageCanvas.height = image.height;
                            tempImageCtx.drawImage(image, 0, 0, image.width, image.height);
                            resolve();
                        };
                        image.src = url;
                    }).then(() => {
                        let imageURL = $tempImageCanvas.toDataURL('image/png');
                        let bstr = atob(imageURL.split(',')[1]);
                        let n = bstr.length;
                        let u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        resolve(new File([u8arr], imageFile.name, {
                            type: 'image/png',
                            encoding: 'utf-8',
                        }));
                        tempImageCtx.clearRect(0, 0, $tempImageCanvas.width, $tempImageCanvas.height);
                    });
                };
                reader.readAsDataURL(imageFile);
            } else {
                reject();
            }
        });
    }

    return {
        zoomIn: zoomIn,
        zoomOut: zoomOut,
        zoomFit: zoomFit,
        zoom100perc: zoom100perc,
        toggleExtendedCrosshairBtn: toggleExtendedCrosshairBtn,
        setZoomRatio: setZoomRatio,
        getZoomRatio: getZoomRatio,

        rotateClockwise: rotateClockwise,
        rotateCounterClockwise: rotateCounterClockwise,
        rotateAndResize: rotateAndResize,
        getRotation: getRotation,
        setRotation: setRotation,
        getRotationMatrix: getRotationMatrix,
        getRotatedCoordinates: getRotatedCoordinates,

        runImageOp: runImageOp,

        setTool: setTool,
        removeTool: removeTool,

        getAllContexts: getAllContexts,
        resetData: resetData,
        resetHover: resetHover,
        imagePx: imagePx,
        screenPx: screenPx,
        screenLength: screenLength,

        updateZoomOnEvent: updateZoomOnEvent,
        updateZoomToImagePosn: updateZoomToImagePosn,

        getDisplaySize: getDisplaySize,
        getImageSize: getImageSize,

        copyImageDataLayerToScreen: copyImageDataLayerToScreen,
        setRepainter: setRepainter,
        removeRepainter: removeRepainter,
        forceHandlerRepaint: forceHandlerRepaint,
        getRepainter: getRepainter,

        saveImage: saveImage,
        loadImage: loadImage,

        getImageFiles: getImageFiles
    };
})();