/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2020 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.PageManager = class {
    constructor() {
        this.handle = null;
        this.curPage = 0;
        this.minPage = 0;
        this.maxPage = 0;
        this.axesByPage = {};
        this.datasetsByPage = {};
        this.measurementsByPage = {};
        this.$pageNavInput = document.getElementById('image-page-nav-input');
    }

    init(handle) {
        this.handle = handle;
        this.curPage = 1;
        this.minPage = 1;
        this.maxPage = this.pageCount();
        this.$pageNavInput.setAttribute('min', this.minPage);
        this.$pageNavInput.setAttribute('max', this.maxPage);

        return this;
    }

    get() {
        return this.handle;
    }

    getPage() {}

    pageCount() {
        return 0;
    }

    getPageText() {
        return wpd.gettext('image-page')
            + ' ' + this.currentPage()
            + ' ' + wpd.gettext('image-of')
            + ' ' + this.pageCount();
    }

    currentPage() {
        return this.curPage;
    }

    previousPage() {
        this.goToPage(this.curPage - 1);
    }

    nextPage() {
        this.goToPage(this.curPage + 1);
    }

    goToPage(pageNumber = 1) {
        wpd.busyNote.show();

        if (!this._validatePageNumber(pageNumber)) {
            wpd.busyNote.close();
            wpd.messagePopup.show('Error', 'Invalid page number.');
            return false;
        }

        const parsedPageNumber = parseInt(pageNumber, 10);
        this.curPage = parsedPageNumber;
        this.$pageNavInput.value = parsedPageNumber;

        const axesPageMap = this.getAxesNameMap();
        const hasAxes = Object.keys(axesPageMap).some(name => axesPageMap[name] === parsedPageNumber);
        this.renderPage(parsedPageNumber, hasAxes);
    }

    _validatePageNumber(pageNumber) {
        return pageNumber >= this.minPage && pageNumber <= this.maxPage;
    }

    _pageRenderer(page, resumedProject, resolve, reject) {
        // implementation specific
    }

    renderPage(pageNumber, resumedProject) {
        return new Promise((resolve, reject) => {
            this.getPage(pageNumber).then(page => {
                this._pageRenderer(page, resumedProject, resolve, reject);
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

    loadPageData(data) {
        this.axesByPage = data.axes;
        this.datasetsByPage = data.datasets;
        this.measurementsByPage = data.measurements;
    }
};

wpd.PDFManager = class extends wpd.PageManager {
    getPage(pageNumber) {
        return this.handle.getPage(pageNumber);
    }

    pageCount() {
        return this.handle.numPages;
    }

    _pageRenderer(page, resumedProject, resolve, reject) {
        let scale = 3;
        let viewport = page.getViewport({scale: scale});
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
                    wpd.imageManager.loadFromURL(url, resumedProject).then(resolve);
                },
                function(err) {
                    console.log(err);
                    wpd.busyNote.close();
                    reject(err);
                });
    }
};
