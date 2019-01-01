/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

wpd.imageManager = (function() {
    let _firstLoad = true;
    let _imageInfo = {
        width: 0,
        height: 0
    };

    function saveImage() {
        wpd.graphicsWidget.saveImage();
    }

    function load() {
        let $input = document.getElementById('fileLoadBox');
        if ($input.files.length == 1) {
            let imageFile = $input.files[0];
            loadFromFile(imageFile);
        }
        wpd.popup.close('loadNewImage');
    }

    function loadFromFile(imageFile, resumedProject) {
        return new Promise((resolve, reject) => {
            if (imageFile.type.match("image.*")) {
                wpd.busyNote.show();
                let reader = new FileReader();
                reader.onload = function() {
                    let url = reader.result;
                    loadFromURL(url, resumedProject).then(resolve);
                };
                reader.readAsDataURL(imageFile);
            } else if (imageFile.type == "application/pdf") {
                wpd.busyNote.show();
                let reader = new FileReader();
                reader.onload = function() {
                    let pdfurl = reader.result;
                    // PDFJS.disableWorker = true;
                    PDFJS.getDocument(pdfurl).then(function(pdf) {
                        pdf.getPage(1).then(function(page) {
                            let scale = 3;
                            let viewport = page.getViewport(scale);
                            let $canvas = document.createElement('canvas');
                            let ctx = $canvas.getContext('2d');
                            $canvas.width = viewport.width;
                            $canvas.height = viewport.height;
                            page.render({
                                    canvasContext: ctx,
                                    viewport: viewport
                                })
                                .promise.then(
                                    function() {
                                        let url = $canvas.toDataURL();
                                        loadFromURL(url, resumedProject).then(resolve);
                                    },
                                    function(err) {
                                        console.log(err);
                                        wpd.busyNote.close();
                                        reject(err);
                                    });
                        });
                    });
                };
                reader.readAsDataURL(imageFile);
            } else {
                console.log(imageFile.type);
                wpd.messagePopup.show(wpd.gettext('invalid-file'),
                    wpd.gettext('invalid-file-text'));
            }
        });
    }

    function loadFromURL(url, resumedProject) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = function() {
                _setImage(image, resumedProject);
                resolve();
            };
            image.src = url;
        });
    }

    function _setImage(image, resumedProject) {
        wpd.appData.reset();
        wpd.sidebar.clear();
        let imageData = wpd.graphicsWidget.loadImage(image);
        wpd.appData.plotLoaded(imageData);
        wpd.busyNote.close();
        wpd.tree.refresh();

        if (_firstLoad) {
            wpd.sidebar.show('start-sidebar');
        } else if (!resumedProject) {
            wpd.popup.show('axesList');
        }
        _firstLoad = false;
        _imageInfo = {
            width: imageData.width,
            height: imageData.height
        };
    }

    function getImageInfo() {
        return _imageInfo;
    }

    return {
        saveImage: saveImage,
        loadFromURL: loadFromURL,
        loadFromFile: loadFromFile,
        load: load,
        getImageInfo: getImageInfo
    };
})();