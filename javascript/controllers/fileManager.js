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

wpd.FileManager = class {
    constructor() {
        this.$pageInfoElements = document.getElementsByClassName('paged');
        this.$fileSelectorContainers = document.getElementsByClassName('files');
        this.$navSeparator = document.getElementById('navSeparator');
        this.$fileSelector = document.getElementById('image-file-select');
        this._init();
    }

    _init() {
        this.currentIndex = 0;
        this.pageManagers = {};
        this.undoManagers = {};
        this.axesByFile = {};
        this.datasetsByFile = {};
        this.measurementsByFile = {};
        this.rotationsByFile = {};
        this.files = [];
        this.$navSeparator.hidden = true;
        this._hidePageInfo();

        // listen for page rotations
        wpd.events.removeListener("wpd.image.rotate", this.rotationHandler);
        this.rotationHandler = wpd.events.addListener("wpd.image.rotate", (payload) => {
            // only set rotation information for files with pages
            const pageManager = wpd.appData.getPageManager();
            if (pageManager) {
                pageManager.setRotation(payload.rotation);
            }
        });
    }

    set(files) {
        this.files = files;
        this._initializeInput();
        if (files.length > 1) {
            this._showFileInfo();
        } else {
            this._hideFileInfo();
            this.$navSeparator.hidden = true;
        }
    }

    reset() {
        this._init();
        wpd.appData.setPageManager(null);
    }

    getFiles() {
        return this.files;
    }

    fileCount() {
        return this.files.length;
    }

    currentFileIndex() {
        return this.currentIndex;
    }

    _initializeInput() {
        const labels = Array.prototype.map.call(this.files, file => file.name);
        const values = wpd.utils.integerRange(this.files.length);
        const selected = this.currentIndex;
        this.$fileSelector.innerHTML = wpd.utils.createOptionsHTML(labels, values, selected);
    }

    _showFileInfo() {
        wpd.utils.toggleElementsDisplay(this.$fileSelectorContainers, false);
    }

    _hideFileInfo() {
        wpd.utils.toggleElementsDisplay(this.$fileSelectorContainers, true);
    }

    _showPageInfo() {
        wpd.utils.toggleElementsDisplay(this.$pageInfoElements, false);
    }

    _hidePageInfo() {
        wpd.utils.toggleElementsDisplay(this.$pageInfoElements, true);
    }

    // controlling the display logic for page related elements here so it can
    // be managed after file change
    refreshPageInfo() {
        if (wpd.appData.isMultipage()) {
            this._showPageInfo();
            if (this.files.length > 1) {
                this.$navSeparator.hidden = false;
            }
        } else {
            this._hidePageInfo();
            this.$navSeparator.hidden = true;
        }
    }

    _savePageManager() {
        const pageManager = wpd.appData.getPageManager();
        if (pageManager && !this.pageManagers[this.currentIndex]) {
            this.pageManagers[this.currentIndex] = pageManager;
        }
    }

    _loadPageManager(index) {
        let pageManager = null;
        if (this.pageManagers[index]) {
            pageManager = this.pageManagers[index];
            pageManager.refreshInput();
        }
        wpd.appData.setPageManager(pageManager);
    }

    _saveUndoManager() {
        let undoManager = null;

        // checks for empty undo managers; if so don't save them to avoid unnecessary
        // use of memory
        if (this.pageManagers[this.currentIndex]) {
            undoManager = wpd.appData.getMultipageUndoManager();
        } else {
            undoManager = wpd.appData.getUndoManager();
            // if cannot undo and cannot redo, we assume it's empty
            if (!undoManager.canUndo() && !undoManager.canRedo()) {
                undoManager = null;
            }
        }

        if (undoManager) {
            this.undoManagers[this.currentIndex] = undoManager;
        }
    }

    _loadUndoManager(index) {
        let undoManager = null;
        if (this.undoManagers[index]) {
            undoManager = this.undoManagers[index];
        }
        wpd.appData.setUndoManager(undoManager);
    }

    switch (index) {
        const newIndex = parseInt(index, 10);
        if (newIndex !== this.currentIndex && newIndex > -1 && newIndex <= this.files.length) {
            // save page manager
            this._savePageManager();

            // load or clear page manager
            this._loadPageManager(newIndex);

            // save undo manager
            this._saveUndoManager();

            // load or clear undo manager
            this._loadUndoManager(newIndex);

            // load the file
            wpd.imageManager.loadFromFile(this.files[newIndex], true);

            // update current file index
            this.currentIndex = newIndex;

            // hide sidebars
            wpd.sidebar.clear();

            // refresh the tree
            wpd.tree.refresh();
        }
    }

    addAxesToCurrentFile(axes) {
        wpd.utils.addToCollection(this.axesByFile, this.currentIndex, axes);
    }

    addDatasetsToCurrentFile(datasets) {
        wpd.utils.addToCollection(this.datasetsByFile, this.currentIndex, datasets);
    }

    addMeasurementsToCurrentFile(measurements) {
        wpd.utils.addToCollection(this.measurementsByFile, this.currentIndex, measurements);
    }

    deleteDatasetsFromCurrentFile(datasets) {
        wpd.utils.deleteFromCollection(this.datasetsByFile, this.currentIndex, datasets);
    }

    deleteMeasurementsFromCurrentFile(measurements) {
        wpd.utils.deleteFromCollection(this.measurementsByFile, this.currentIndex, measurements);
    }

    getAxesNameMap() {
        return wpd.utils.invertObject(this.axesByFile);
    }

    getDatasetNameMap() {
        return wpd.utils.invertObject(this.datasetsByFile);
    }

    filterToCurrentFileAxes(axes) {
        return wpd.utils.filterCollection(this.axesByFile, this.currentIndex, axes);
    }

    filterToCurrentFileDatasets(datasets) {
        return wpd.utils.filterCollection(this.datasetsByFile, this.currentIndex, datasets);
    }

    filterToCurrentFileMeasurements(measurements) {
        return wpd.utils.filterCollection(this.measurementsByFile, this.currentIndex, measurements);
    }

    // for use with saving wpd json
    getMetadata() {
        const metadata = {};

        const allMeasurements = wpd.appData.getPlotData().getMeasurementColl();

        // save the latest page manager, in case it hasn't been saved
        this._savePageManager();

        // only include file metadata if there is more than 1 file
        if (this.fileCount() > 1) {
            metadata.file = {
                axes: this.getAxesNameMap(),
                datasets: this.getDatasetNameMap(),
                measurements: allMeasurements.map(ms => wpd.utils.findKey(this.measurementsByFile, ms))
            };
        }

        // only include page and pageLabel metadata if there are page managers saved in the file manager
        if (Object.keys(this.pageManagers).length > 0) {
            // setting axes name maps and dataset name maps to start with an empty object
            // for ease of calling Object.assign later
            let axesNameMaps = [{}];
            let datasetNameMaps = [{}];
            let measurementPageMaps = []; // measurements do not have unique names
            let pageLabelMaps = {};
            let rotationMaps = {};

            // collect metadata from all page managers
            for (const index in this.pageManagers) {
                axesNameMaps.push(this.pageManagers[index].getAxesNameMap());
                datasetNameMaps.push(this.pageManagers[index].getDatasetNameMap());
                measurementPageMaps.push(this.pageManagers[index].getMeasurementPageMap());
                const pageLabelMap = this.pageManagers[index].getPageLabelMap();
                if (Object.keys(pageLabelMap).length) {
                    pageLabelMaps[index] = pageLabelMap;
                }
                const rotationMap = this.pageManagers[index].getRotationMap();
                if (Object.keys(rotationMap).length) {
                    rotationMaps[index] = rotationMap;
                }
            }

            metadata.page = {
                axes: Object.assign.apply(null, axesNameMaps),
                datasets: Object.assign.apply(null, datasetNameMaps),
                measurements: allMeasurements.map(ms => {
                    for (const measurementPageMap of measurementPageMaps) {
                        const foundPage = wpd.utils.findKey(measurementPageMap, ms);
                        if (foundPage) {
                            return foundPage;
                        }
                    }
                })
            };

            if (Object.keys(pageLabelMaps).length || Object.keys(rotationMaps).length) {
                metadata.misc = {};

                // include page label maps by file in the miscellaneous category
                if (Object.keys(pageLabelMaps).length) {
                    metadata.misc.pageLabel = pageLabelMaps;
                }

                // include rotation maps by file in the miscellaneous category
                if (Object.keys(rotationMaps).length) {
                    metadata.misc.rotation = rotationMaps;
                }
            }
        }

        return metadata;
    }

    // for use when loading wpd json
    loadMetadata(metadata) {
        let fileManager = this;

        // load file metadata
        if (metadata.file) {
            fileManager.axesByFile = metadata.file.axes || {};
            fileManager.datasetsByFile = metadata.file.datasets || {};
            fileManager.measurementsByFile = metadata.file.measurements || {};
        } else {
            // if there does not exist file indexes, assume there is only one file and
            // associate all data collections with the only file
            fileManager.axesByFile['0'] = wpd.appData.getPlotData().getAxesColl().slice();
            fileManager.datasetsByFile['0'] = wpd.appData.getPlotData().getDatasets().slice();
            fileManager.measurementsByFile['0'] = wpd.appData.getPlotData().getMeasurementColl().slice();
        }

        let files = [];
        for (let index = 0; index < fileManager.files.length; index++) {
            let filePromise = null
            if (fileManager.files[index].type === 'application/pdf') {
                // if the first file is a pdf, it has already been loaded with a page manager
                // save the page manager
                if (index === 0) {
                    fileManager._savePageManager();
                } else {
                    filePromise = new Promise((resolve, reject) => {
                        let reader = new FileReader();
                        reader.onload = function() {
                            pdfjsLib.getDocument(reader.result).promise.then(pdf => resolve(pdf));
                        };
                        reader.readAsDataURL(this.files[index]);
                    });
                }
            }
            files.push(filePromise);
        }

        return Promise.all(files).then(files => {
            for (let index = 0; index < files.length; index++) {
                let pageData = {};

                // only supporting pages in pdf files for now, this should include tiff files
                // in the future
                if (fileManager.files[index].type === 'application/pdf') {
                    if (files[index] !== null) {
                        // initialize page managers
                        fileManager.pageManagers[index] = wpd.imageManager.initializePDFManager(
                            files[index],
                            true
                        );
                    }

                    // load page metadata
                    if (metadata.page) {
                        let pageAxes = {};
                        let pageDatasets = {};
                        let pageMeasurements = {};

                        for (const page in metadata.page.axes) {
                            pageAxes[page] = metadata.page.axes[page].filter(ax => {
                                return fileManager.axesByFile[index] &&
                                    fileManager.axesByFile[index].indexOf(ax) > -1;
                            });
                        }
                        for (const page in metadata.page.datasets) {
                            pageDatasets[page] = metadata.page.datasets[page].filter(ds => {
                                return fileManager.datasetsByFile[index] &&
                                    fileManager.datasetsByFile[index].indexOf(ds) > -1;
                            });
                        }
                        for (const page in metadata.page.measurements) {
                            pageMeasurements[page] = metadata.page.measurements[page].filter(ms => {
                                return fileManager.measurementsByFile[index] &&
                                    fileManager.measurementsByFile[index].indexOf(ms) > -1;
                            });
                        }

                        Object.assign(pageData, {
                            axes: pageAxes,
                            datasets: pageDatasets,
                            measurements: pageMeasurements
                        });
                    }
                }

                // load miscellaneous metadata
                if (metadata.misc) {
                    // load page labels
                    if (metadata.misc.pageLabel) {
                        if (fileManager.pageManagers.hasOwnProperty(index)) {
                            Object.assign(pageData, {
                                pageLabels: metadata.misc.pageLabel[index]
                            });
                        }
                    }

                    // load page rotations
                    if (metadata.misc.rotation) {
                        if (fileManager.pageManagers.hasOwnProperty(index)) {
                            Object.assign(pageData, {
                                rotations: metadata.misc.rotation[index]
                            });
                        }
                    }
                }

                // load page data into page manager
                if (fileManager.pageManagers.hasOwnProperty(index)) {
                    if (Object.keys(pageData).length) {
                        fileManager.pageManagers[index].loadPageData(pageData);
                    }

                    // refresh the page select input for the first file
                    if (index === 0) {
                        fileManager.pageManagers[index].refreshInput();
                    }
                }
            }
            wpd.tree.refresh();
        });
    }
};
