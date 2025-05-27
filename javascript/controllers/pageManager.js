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

wpd.PageManager = class {
    constructor() {
        this.handle = null;
        this.curPage = 0;
        this.minPage = 0;
        this.maxPage = 0;
        this.customLabelsByPage = {};
        this.rotationsByPage = {};
        this.axesByPage = {};
        this.datasetsByPage = {};
        this.measurementsByPage = {};
        this.$pageSelector = document.getElementById('image-page-nav-select');
        this.$pageRelabelInput = document.getElementById('image-page-relabel-input');
        this.$pageRelabelAllCheckbox = document.getElementById('image-page-relabel-all-checkbox');
        this.$pageRelabelSetButton = document.getElementById('image-page-relabel-set-button');
        this.$pageRelabelDeleteButton = document.getElementById('image-page-relabel-delete-button');
        this.$pageRelabelDeleteAllButton = document.getElementById('image-page-relabel-delete-all-button');
    }

    init(handle, skipInputRefresh) {
        this.handle = handle;
        this.curPage = 1;
        this.minPage = 1;
        this.maxPage = this.pageCount();
        if (!skipInputRefresh) {
            this._initializeInput();
        }

        return this;
    }

    _initializeInput() {
        const values = wpd.utils.integerRange(this.maxPage, this.minPage);
        const selected = this.curPage;
        this.getPageLabels().then(fileLabels => {
            let labels = [];

            // loop through page range
            values.forEach(page => {
                const index = page - 1;
                let label = page;
                // priority of page labels:
                //   1. custom page labels
                //   2. file page labels
                //   3. page number
                if (this.customLabelsByPage.hasOwnProperty(page)) {
                    label = this.customLabelsByPage[page] + ' (page ' + page + ' within file)';
                } else if (fileLabels !== null) {
                    label = fileLabels[index] + ' (page ' + page + ' within file)';
                }
                labels.push(label);
            }, this);

            this.$pageSelector.innerHTML = wpd.utils.createOptionsHTML(labels, values, selected);
        });
    }

    refreshInput() {
        this._initializeInput();
        this._resetRelabelPopup();
    }

    validateLabel(label) {
        if (label !== '') {
            this.$pageRelabelSetButton.disabled = false;
            if (wpd.utils.isInteger(label)) {
                this.$pageRelabelAllCheckbox.disabled = false;
                this.$pageRelabelAllCheckbox.parentElement.style = 'color: black;';
            } else {
                this.$pageRelabelAllCheckbox.checked = false;
                this.$pageRelabelAllCheckbox.disabled = true;
                this.$pageRelabelAllCheckbox.parentElement.style = 'color: lightgray;';
            }
        } else {
            this.$pageRelabelSetButton.disabled = true;
        }
    }

    _resetRelabelPopup() {
        this.$pageRelabelInput.value = '';
        this.$pageRelabelAllCheckbox.checked = false;
        this.$pageRelabelAllCheckbox.disabled = true;
        this.$pageRelabelAllCheckbox.parentElement.style = 'color: lightgray;';
        this.$pageRelabelSetButton.disabled = true;
        if (Object.keys(this.customLabelsByPage).length) {
            this.$pageRelabelDeleteAllButton.disabled = false;
            if (this.customLabelsByPage.hasOwnProperty(this.curPage)) {
                this.$pageRelabelDeleteButton.disabled = false;
            } else {
                this.$pageRelabelDeleteButton.disabled = true;
            }
        } else {
            this.$pageRelabelDeleteButton.disabled = true;
            this.$pageRelabelDeleteAllButton.disabled = true;
        }
    }

    setLabel() {
        const newLabel = this.$pageRelabelInput.value;
        if (newLabel !== '') {
            if (this.$pageRelabelAllCheckbox.checked) {
                const pages = wpd.utils.integerRange(this.maxPage, this.minPage);
                const delta = newLabel - this.curPage;
                pages.forEach(page => this.customLabelsByPage[page] = page + delta, this);
            } else {
                this.customLabelsByPage[this.curPage] = newLabel;
            }
            this._initializeInput();
            wpd.popup.close('image-page-relabel-popup');
            this._resetRelabelPopup();
        }
    }

    deleteLabel(all) {
        if (all) {
            this.customLabelsByPage = {};
        } else {
            delete this.customLabelsByPage[this.curPage];
        }
        this._initializeInput();
        wpd.popup.close('image-page-relabel-popup');
        this._resetRelabelPopup();
    }

    setRotation(rotation) {
        this.rotationsByPage[this.curPage] = rotation;
    }

    getRotation() {
        return this.rotationsByPage[this.curPage] ?? 0;
    }

    get() {
        return this.handle;
    }

    getPage() {}

    pageCount() {
        return 0;
    }

    getPageLabels() {
        return new Promise(resolve => resolve(null));
    }

    currentPage() {
        return this.curPage;
    }

    previous() {
        this.switch(this.curPage - 1);
    }

    next() {
        this.switch(this.curPage + 1);
    }

    switch (pageNumber = 1) {
        wpd.busyNote.show();

        const parsedPageNumber = parseInt(pageNumber, 10);

        if (!this._validatePageNumber(parsedPageNumber)) {
            wpd.busyNote.close();
            wpd.messagePopup.show('Error', 'Invalid page number.');
            return false;
        }

        this.curPage = parsedPageNumber;

        // udpate select value for calls from other controls
        this.$pageSelector.value = parsedPageNumber;

        this.renderPage(parsedPageNumber);
        this._resetRelabelPopup();
    }

    _validatePageNumber(pageNumber) {
        return pageNumber >= this.minPage && pageNumber <= this.maxPage;
    }

    _pageRenderer(page, resolve, reject) {
        // implementation specific
    }

    renderPage(pageNumber) {
        return new Promise((resolve, reject) => {
            this.getPage(pageNumber).then(page => {
                this._pageRenderer(page, resolve, reject);
            });
        });
    }

    _getCurrentPageObjects(collection) {
        if (collection[this.curPage]) {
            return collection[this.curPage];
        }
        return [];
    }

    getCurrentPageAxes() {
        return this._getCurrentPageObjects(this.axesByPage);
    }

    getCurrentPageDatasets() {
        return this._getCurrentPageObjects(this.datasetsByPage);
    }

    addAxesToCurrentPage(axes) {
        wpd.utils.addToCollection(this.axesByPage, this.curPage, axes);
    }

    addDatasetsToCurrentPage(dataset) {
        wpd.utils.addToCollection(this.datasetsByPage, this.curPage, dataset);
    }

    addMeasurementsToCurrentPage(measurements) {
        wpd.utils.addToCollection(this.measurementsByPage, this.curPage, measurements);
    }

    deleteAxesFromCurrentPage(axes) {
        wpd.utils.deleteFromCollection(this.axesByPage, this.curPage, axes);
    }

    deleteDatasetsFromCurrentPage(datasets) {
        wpd.utils.deleteFromCollection(this.datasetsByPage, this.curPage, datasets);
    }

    deleteMeasurementsFromCurrentPage(measurements) {
        wpd.utils.deleteFromCollection(this.measurementsByPage, this.curPage, measurements);
    }

    getAxesNameMap() {
        return wpd.utils.invertObject(this.axesByPage);
    }

    getDatasetNameMap() {
        return wpd.utils.invertObject(this.datasetsByPage);
    }

    filterToCurrentPageAxes(axes) {
        return wpd.utils.filterCollection(this.axesByPage, this.curPage, axes);
    }

    filterToCurrentPageDatasets(datasets) {
        return wpd.utils.filterCollection(this.datasetsByPage, this.curPage, datasets);
    }

    filterToCurrentPageMeasurements(measurements) {
        return wpd.utils.filterCollection(this.measurementsByPage, this.curPage, measurements);
    }

    getMeasurementPageMap() {
        return this.measurementsByPage;
    }

    getPageLabelMap() {
        return this.customLabelsByPage;
    }

    getRotationMap() {
        return this.rotationsByPage;
    }

    loadPageData(data) {
        this.axesByPage = data.axes || {};
        this.datasetsByPage = data.datasets || {};
        this.measurementsByPage = data.measurements || {};
        this.customLabelsByPage = data.pageLabels || {};
        this.rotationsByPage = data.rotations || {};

        // set graphics widget rotation if the loaded page has rotation data
        if (Object.keys(this.rotationsByPage).length) {
            wpd.graphicsWidget.setRotation(this.getRotation());
            wpd.graphicsWidget.rotateAndResize();
        }
    }
};

wpd.PDFManager = class extends wpd.PageManager {
    getPage(pageNumber) {
        return this.handle.getPage(pageNumber);
    }

    getPageLabels() {
        return this.handle.getPageLabels();
    }

    pageCount() {
        return this.handle.numPages;
    }

    _pageRenderer(page, resolve, reject) {
        const self = this;
        let scale = 3;
        let viewport = page.getViewport({
            scale: scale
        });
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
                    wpd.imageManager.loadFromURL(url, true).then(() => {
                        wpd.graphicsWidget.setRotation(self.getRotation());
                        wpd.graphicsWidget.rotateAndResize();
                        resolve();
                    });
                },
                function(err) {
                    console.log(err);
                    wpd.busyNote.close();
                    reject(err);
                });
    }
};
