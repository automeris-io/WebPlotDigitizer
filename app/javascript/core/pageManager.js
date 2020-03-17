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

wpd.PageManager = class {
    constructor(handle) {
        this._handle = handle;
        this._curPage = 0;
        this._minPage = 0;
        this._maxPage = 0;
        this._axesByPage = {};
        this._datasetsByPage = {};
        this._measurementsByPage = {};
        this._$pageNavInput = document.getElementById('image-page-nav-input');
        this._$pageInfoElements = document.getElementsByClassName('paged');
        this.init();
    }

    init() {
        this._curPage = 1;
        this._minPage = 0;
        this._maxPage = this.pageCount();
        this._$pageNavInput.setAttribute('max', this._maxPage);
        this._showPageInfo();
    }

    destroy() {
        this._hidePageInfo();
        return null;
    }

    get() {
        return this._handle;
    }

    getPage() {}

    pageCount() {
        return 0;
    }

    _togglePageInfoDisplay(hide) {
        for (const $el of this._$pageInfoElements) $el.hidden = hide;
    }

    _showPageInfo() {
        this._togglePageInfoDisplay(false);
    }

    _hidePageInfo() {
        this._togglePageInfoDisplay(true);
    }

    currentPage() {
        return this._curPage;
    }

    previousPage() {
        this.goToPage(this._curPage - 1);
    }

    nextPage() {
        this.goToPage(this._curPage + 1);
    }

    goToPage(pageNumber = 1) {
        wpd.busyNote.show();

        if (!this._validatePageNumber(pageNumber)) {
            wpd.busyNote.close();
            wpd.messagePopup.show('Error', 'Invalid page number.');
            return false;
        }

        const parsedPageNumber = parseInt(pageNumber, 10);
        this._curPage = parsedPageNumber;
        this._$pageNavInput.value = parsedPageNumber;

        const axesPageMap = this.getAxesByName();
        const hasAxes = Object.keys(axesPageMap).some(name => axesPageMap[name] === parsedPageNumber);
        this.renderPage(parsedPageNumber, hasAxes);
    }

    _validatePageNumber(pageNumber) {
        return pageNumber > this._minPage && pageNumber <= this._maxPage;
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
        let pageCollection = [];
        if (collection[this._curPage]) {
            pageCollection = collection[this._curPage];
        }
        return pageCollection;
    }

    getCurrentPageAxes() {
        return this._getCurrentPageObjects(this._axesByPage);
    }

    getCurrentPageDatasets() {
        return this._getCurrentPageObjects(this._datasetsByPage);
    }

    _addToCurrentPage(collection, object) {
        if (!collection[this._curPage]) {
            collection[this._curPage] = [];
        }
        collection[this._curPage].push(object);
    }

    addAxesToCurrentPage(axes) {
        this._addToCurrentPage(this._axesByPage, axes);
    }

    addDatasetToCurrentPage(dataset) {
        this._addToCurrentPage(this._datasetsByPage, dataset);
    }

    addMeasurementToCurrentPage(measurement) {
        this._addToCurrentPage(this._measurementsByPage, measurement);
    }

    _deleteFromCurrentPage(collection, objects) {
        if (!collection[this._curPage]) return;
        objects.forEach(object => {
            const index = collection[this._curPage].indexOf(object);
            if (index > -1) {
                collection[this._curPage].splice(index, 1);
            }
        });
    }

    deleteAxesFromCurrentPage(axes) {
        this._deleteFromCurrentPage(this._axesByPage, [axes]);
    }

    deleteDatasetFromCurrentPage(dataset) {
        this._deleteFromCurrentPage(this._datasetsByPage, [dataset]);
    }

    deleteMeasurementsFromCurrentPage(measurements) {
        this._deleteFromCurrentPage(this._measurementsByPage, measurements);
    }

    autoAddDataset() {
        if (this.getCurrentPageAxes().length === 1 && this.getCurrentPageDatasets().length === 0) {
            const plotData = wpd.appData.getPlotData();
            const dataset = plotData.createDefaultDataset();
            plotData.addDataset(dataset);
            this.addDatasetToCurrentPage(dataset);
        }
    }

    _getPageMap(object) {
        let map = {};
        Object.entries(object).forEach(([pageNumber, collection]) => {
            collection.forEach(item => map[item.name] = parseInt(pageNumber, 10));
        });
        return map;
    }

    getAxesByName() {
        return this._getPageMap(this._axesByPage);
    }

    getDatasetsByName() {
        return this._getPageMap(this._datasetsByPage);
    }

    filterToCurrentPageMeasurements(measurements) {
        let filteredMeasurements = [];
        if (this._measurementsByPage[this._curPage]) {
            filteredMeasurements =  measurements.filter(measurement => {
                return this._measurementsByPage[this._curPage].indexOf(measurement) > -1;
            });
        }
        return filteredMeasurements;
    }

    _findPageNumberForMeasurement(measurement) {
        for (const page in this._measurementsByPage) {
            if (this._measurementsByPage[page].indexOf(measurement) > -1) {
                return parseInt(page, 10);
            }
        }
    }

    getPageData() {
        return {
            axes: this.getAxesByName(),
            datasets: this.getDatasetsByName(),
            measurements: wpd.appData.getPlotData().getMeasurementColl().map(ms => {
                return this._findPageNumberForMeasurement(ms);
            })
        };
    }

    loadPageData(data) {
        this._axesByPage = data.axes;
        this._datasetsByPage = data.datasets;
        this._measurementsByPage = data.measurements;
    }
};

wpd.PDFManager = class extends wpd.PageManager {
    getPage(pageNumber) {
        super.getPage();
        return this._handle.getPage(pageNumber);
    }

    pageCount() {
        super.pageCount();
        return this._handle.numPages;
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
