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

wpd.imageManager = (function() {
    let _firstLoad = true;
    let _newLoad = false;
    let _imageInfo = {
        width: 0,
        height: 0
    };

    function saveImage() {
        wpd.graphicsWidget.saveImage();
    }

    function load() {
        let $input = document.getElementById('fileLoadBox');
        if ($input.files.length > 0) {
            _newLoad = true;
            initializeFileManager($input.files);
            wpd.appData.setPageManager(null);
            loadFromFile($input.files[0]);
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
                    pdfjsLib.GlobalWorkerOptions.workerSrc = "node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
                    pdfjsLib.getDocument(pdfurl).promise.then(function(pdf) {
                        const existingPageManager = wpd.appData.getPageManager();
                        if (existingPageManager) {
                            existingPageManager.renderPage(existingPageManager.currentPage()).then(resolve);
                        } else {
                            const pdfManager = initializePDFManager(pdf);
                            pdfManager.renderPage(1).then(resolve);
                            wpd.appData.setPageManager(pdfManager);
                        }
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
        if (_newLoad) {
            wpd.appData.reset();
            wpd.sidebar.clear();
        }
        const pageManager = wpd.appData.getPageManager();
        if (pageManager) {
            wpd.graphicsWidget.setRotation(pageManager.getRotation());
        }
        let imageData = wpd.graphicsWidget.loadImage(image);
        wpd.appData.plotLoaded(imageData);
        wpd.busyNote.close();
        if (_newLoad) {
            wpd.tree.refresh();
        } else {
            wpd.tree.refreshPreservingSelection();
        }
        if (_firstLoad) {
            wpd.sidebar.show('start-sidebar');
        } else if (!resumedProject) {
            wpd.calibrateAxesDialog.open();
        }
        _firstLoad = false;
        _newLoad = false;
        _imageInfo = {
            width: imageData.width,
            height: imageData.height
        };
    }

    function getImageInfo() {
        return _imageInfo;
    }

    function initializeFileManager(files, exemptQuota) {
        const fileManager = wpd.appData.getFileManager();
        fileManager.reset();
        fileManager.set(files);

        if (exemptQuota == null || exemptQuota === false) {
            for (let f of files) {
                wpd.cloudNewImage().then(() => {}, () => {});
            }
        }
    }

    function initializePDFManager(pdf, skipInputRefresh) {
        const pdfManager = new wpd.PDFManager();
        pdfManager.init(pdf, skipInputRefresh);
        return pdfManager;
    }

    return {
        saveImage: saveImage,
        loadFromURL: loadFromURL,
        loadFromFile: loadFromFile,
        load: load,
        getImageInfo: getImageInfo,
        initializeFileManager: initializeFileManager,
        initializePDFManager: initializePDFManager
    };
})();
