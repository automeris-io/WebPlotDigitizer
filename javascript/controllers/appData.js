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

// maintain and manage current state of the application
wpd.appData = (function() {
    let _plotData = null;
    let _undoManager = null;
    let _pageManager = null;
    let _fileManager = null;

    function reset() {
        _plotData = null;
        _undoManager = null;
    }

    function getPlotData() {
        if (_plotData == null) {
            _plotData = new wpd.PlotData();
        }
        return _plotData;
    }

    function getUndoManager() {
        if (isMultipage()) {
            let currentPage = _pageManager.currentPage();
            if (_undoManager === null) {
                _undoManager = {};
            }
            if (!_undoManager.hasOwnProperty(currentPage)) {
                _undoManager[currentPage] = new wpd.UndoManager();
            }
            return _undoManager[currentPage];
        } else {
            if (_undoManager == null) {
                _undoManager = new wpd.UndoManager();
            }
            return _undoManager;
        }
    }

    function getMultipageUndoManager() {
        if (isMultipage()) {
            return _undoManager;
        }
        return null;
    }

    function setUndoManager(undoManager) {
        _undoManager = undoManager;
    }

    function getFileManager() {
        if (_fileManager == null) {
            _fileManager = new wpd.FileManager();
        }
        return _fileManager;
    }

    function getPageManager() {
        return _pageManager;
    }

    function setPageManager(pageManager) {
        _pageManager = pageManager;
        getFileManager().refreshPageInfo();
    }

    function isAligned() {
        return getPlotData().getAxesCount() > 0;
    }

    function isMultipage() {
        const pageManager = getPageManager();
        if (!pageManager) return false;
        return pageManager.pageCount() > 1;
    }

    function plotLoaded(imageData) {
        getPlotData().setTopColors(wpd.colorAnalyzer.getTopColors(imageData));
        getUndoManager().reapply();
    }

    return {
        isAligned: isAligned,
        isMultipage: isMultipage,
        getPlotData: getPlotData,
        getUndoManager: getUndoManager,
        getPageManager: getPageManager,
        getFileManager: getFileManager,
        getMultipageUndoManager: getMultipageUndoManager,
        setPageManager: setPageManager,
        setUndoManager: setUndoManager,
        reset: reset,
        plotLoaded: plotLoaded
    };
})();
