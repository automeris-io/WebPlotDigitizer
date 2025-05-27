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

wpd.calibrateAxesDialog = (function() {
    let isInitialized = false;
    const dialogId = "calibrate-axes-options";
    const selectedClass = "selectable-item-selected";
    let $selectionItems = [];
    let $selectedItem = null;

    function _init() {
        // grab elements, attach event handlers
        if (isInitialized) {
            return;
        }
        $selectionItems = document.querySelectorAll("#calibrate-axes-options .calibrate-axes-item");
        for (let $item of $selectionItems) {
            $item.addEventListener("click", _onSelect);
        }
        isInitialized = true;
    }

    function _unselectAll() {
        for (let $item of $selectionItems) {
            $item.classList.remove(selectedClass);
            const $infoItem = _getInfoElement($item.id);
            $infoItem.style.display = "none";
        }
        $selectedItem = null;
    }

    function _getChartType(itemId) {
        return itemId.replace("calibrate-axes-option-", "");
    }

    function _getInfoElement(selectionId) {
        const chartType = _getChartType(selectionId);
        const infoId = "calibrate-axes-info-" + chartType;
        return document.getElementById(infoId);
    }

    function _onSelect(ev) {
        _unselectAll();
        let $item = ev.target;
        $item.classList.add(selectedClass);
        const $infoItem = _getInfoElement($item.id);
        $infoItem.style.display = "inline";
        $selectedItem = $item;
    }

    function open() {
        _init();
        // select default item
        if ($selectedItem == null) {
            const $item = $selectionItems[0];
            const $infoItem = _getInfoElement($item.id);
            $item.classList.add(selectedClass);
            $infoItem.style.display = "inline";
            $selectedItem = $item;
        }
        wpd.popup.show(dialogId);
    }

    function cancel() {
        wpd.popup.close(dialogId);
    }

    function calibrate() {
        // do something
        wpd.popup.close(dialogId);
        const chartType = _getChartType($selectedItem.id);
        wpd.alignAxes.start(chartType);
    }

    return {
        open: open,
        cancel: cancel,
        calibrate: calibrate
    };
})();
