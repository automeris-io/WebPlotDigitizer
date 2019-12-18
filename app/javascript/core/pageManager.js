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
        this._$pageNavInput = document.getElementById('image-page-nav-input');
        this._$pageInfoElements = document.getElementsByClassName('paged');
        this.init();
    }

    init() {
        this._curPage = 1;
        this._minPage = 0;
        this._maxPage = this.pageCount();
        this._$pageNavInput.setAttribute('max', this._maxPage);
        this.showInfo();
        wpd.appData.setPageManager(this);
    }

    get() {
        return this._handle;
    }

    getPage(pageNumber) {
        // implementation specific
    }

    pageCount() {
        return 0;
    }

    _toggleInfoDisplay(hide) {
        for (const $el of this._$pageInfoElements) $el.hidden = hide;
    }

    showInfo() {
        this._toggleInfoDisplay(false);
    }

    hideInfo() {
        this._toggleInfoDisplay(true);
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

        const axesMap = wpd.appData.getPlotData().getAxesPageMap();
        const hasAxes = Object.keys(axesMap).some(name => axesMap[name] === parsedPageNumber);
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
            this.getPage(pageNumber).then(page => this._pageRenderer(page, resumedProject, resolve,
                reject));
        });
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
