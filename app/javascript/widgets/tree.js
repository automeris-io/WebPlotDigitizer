/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.*/

var wpd = wpd || {};

wpd.TreeWidget = class {
    constructor($elem) {
        this.$mainElem = $elem;
        this.treeData = null;
        this.itemColors = {};
        this.$mainElem.addEventListener("click", e => this._onclick(e));
        this.$mainElem.addEventListener("keydown", e => this._onkeydown(e));
        this.$mainElem.addEventListener("dblclick", e => this._ondblclick(e));
        this.idmap = [];
        this.itemCount = 0;
        this.selectedPath = null;
    }

    _renderFolder(data, basePath, isInnerFolder) {
        if (data == null)
            return;

        let htmlStr = "";

        if (isInnerFolder) {
            htmlStr = "<ul class=\"tree-list\">";
        } else {
            htmlStr = "<ul class=\"tree-list-root\">";
        }

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            this.itemCount++;
            if (typeof(item) === "string") {
                let itemPath = basePath + "/" + item;
                htmlStr += "<li title=\"" + item + "\">";
                let itemColor = this.itemColors[itemPath];
                if (typeof(itemColor) !== 'undefined') {
                    htmlStr += "<div class=\"tree-item-icon\" style=\"background-color: " + itemColor.toRGBString() + ";\"></div>";
                }
                htmlStr += "<span class=\"tree-item\" id=\"tree-item-id-" + this.itemCount + "\">" +
                    item + "</span>";
                this.idmap[this.itemCount] = itemPath;
            } else if (typeof(item) === "object") {
                htmlStr += "<li>";
                let labelKey = Object.keys(item)[0];
                htmlStr += "<span class=\"tree-folder\" id=\"tree-item-id-" + this.itemCount +
                    "\">" + labelKey + "</span>";
                this.idmap[this.itemCount] = basePath + "/" + labelKey;
                htmlStr += this._renderFolder(item[labelKey], basePath + "/" + labelKey, true);
            }
            htmlStr += "</li>";
        }
        htmlStr += "</ul>";
        return (htmlStr);
    }

    // Expected format: 
    // treeData = ["item0", {"folder0": ["sub-item0", "sub-item1"]}, "item1"]
    // itemColors = {"path0" : wpd.Color, "path1" : wpd.Color}
    render(treeData, itemColors) {
        this.idmap = [];
        this.itemCount = 0;
        this.treeData = treeData;
        this.itemColors = itemColors;
        this.$mainElem.innerHTML = this._renderFolder(this.treeData, "", false);
        this.selectedPath = null;
    }

    _unselectAll() {
        const $folders = this.$mainElem.querySelectorAll(".tree-folder");
        const $items = this.$mainElem.querySelectorAll(".tree-item");
        $folders.forEach(function($e) {
            $e.classList.remove("tree-selected");
        });
        $items.forEach(function($e) {
            $e.classList.remove("tree-selected");
        });
        this.selectedPath = null;
    }

    selectPath(itemPath, suppressSecondaryActions) {
        const itemId = this.idmap.indexOf(itemPath);
        if (itemId >= 0) {
            this._unselectAll();
            this.selectedPath = itemPath;
            const $item = document.getElementById("tree-item-id-" + itemId);
            $item.classList.add("tree-selected");
            if (this.itemSelectionCallback != null) {
                this.itemSelectionCallback($item, itemPath, suppressSecondaryActions);
            }
        }
    }

    _onclick(e) {
        const isItem = e.target.classList.contains("tree-item");
        const isFolder = e.target.classList.contains("tree-folder");
        if (isItem || isFolder) {
            this._unselectAll();
            e.target.classList.add("tree-selected");
            if (this.itemSelectionCallback != null) {
                let itemId = parseInt(e.target.id.replace("tree-item-id-", ""), 10);
                if (!isNaN(itemId)) {
                    this.selectedPath = this.idmap[itemId];
                    this.itemSelectionCallback(e.target, this.idmap[itemId], false);
                }
            }
        }
    }

    _onkeydown(e) {
        // allow either F2 or Meta+R to trigger rename
        if (e.key === "F2" || (e.key.toLowerCase() === "r" && e.metaKey)) {
            if (this.itemRenameCallback) {
                this.itemRenameCallback(e.target, this.selectedPath, false);
                e.preventDefault();
            }
        }
    }

    _ondblclick(e) {
        if (this.itemRenameCallback) {
            this.itemRenameCallback(e.target, this.selectedPath, false);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    onItemSelection(callback) {
        this.itemSelectionCallback = callback;
    }

    onItemRename(callback) {
        this.itemRenameCallback = callback;
    }

    getSelectedPath() {
        return this.selectedPath;
    }
};

wpd.tree = (function() {
    let treeWidget = null;
    let activeDataset = null;
    let activeAxes = null;

    // polyfill for IE11/Microsoft Edge
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function(callback, thisArg) {
            thisArg = thisArg || window;
            for (let i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    function buildTree() {
        if (treeWidget == null) {
            return;
        }
        let treeData = [];
        let itemColors = {};

        const plotData = wpd.appData.getPlotData();

        // Image item
        treeData.push(wpd.gettext("image"));

        // Axes folder
        let axesFolder = {};
        axesFolder[wpd.gettext("axes")] = plotData.getAxesNames();
        treeData.push(axesFolder);

        // Datasets folder
        const datasetNames = plotData.getDatasetNames();
        let datasetsFolder = {};
        datasetsFolder[wpd.gettext("datasets")] = datasetNames;
        treeData.push(datasetsFolder);

        // Dataset colors
        for (let ds of plotData.getDatasets()) {
            if (ds.colorRGB != null) {
                itemColors["/" + wpd.gettext("datasets") + "/" + ds.name] = ds.colorRGB;
            }
        }

        // Measurements folder
        let measurementItems = [];
        let distMeasures = plotData.getMeasurementsByType(wpd.DistanceMeasurement);
        let angleMeasures = plotData.getMeasurementsByType(wpd.AngleMeasurement);
        let areaMeasures = plotData.getMeasurementsByType(wpd.AreaMeasurement);
        if (areaMeasures.length > 0) {
            measurementItems.push(wpd.gettext("area"));
        }
        if (angleMeasures.length > 0) {
            measurementItems.push(wpd.gettext("angle"));
        }
        if (distMeasures.length > 0) {
            measurementItems.push(wpd.gettext("distance"));
        }
        let measurementFolder = {};
        measurementFolder[wpd.gettext("measurements")] = measurementItems;
        treeData.push(measurementFolder);

        treeWidget.render(treeData, itemColors);

        showTreeItemWidget(null);
    }

    function showTreeItemWidget(id) {
        const $treeWidgets = document.querySelectorAll(".tree-widget");
        $treeWidgets.forEach(function($e) {
            if ($e.id === id) {
                $e.style.display = "inline";
            } else {
                $e.style.display = "none";
            }
        });
    }

    function resetGraphics() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.sidebar.clear();
    }

    function onDatasetSelection(elem, path, suppressSecondaryActions) {
        // get dataset index
        const plotData = wpd.appData.getPlotData();
        const dsNamesColl = plotData.getDatasetNames();
        const dsIdx = dsNamesColl.indexOf(path.replace("/" + wpd.gettext("datasets") + "/", ""));
        if (dsIdx >= 0) {
            if (!suppressSecondaryActions) {
                // clean up existing UI
                resetGraphics();
            }

            activeDataset = plotData.getDatasets()[dsIdx];

            if (!suppressSecondaryActions) {
                // set up UI for the new dataset
                wpd.acquireData.load();
            }
        }
        showTreeItemWidget('dataset-item-tree-widget');
        renderDatasetAxesSelection();
        setDatasetDisplayColor();
    }

    function onDatasetGroupSelection() {
        resetGraphics();
        let axesList = [];
        let datasetList = [];
        const plotData = wpd.appData.getPlotData();
        for (let ds of plotData.getDatasets()) {
            axesList.push(plotData.getAxesForDataset(ds));
            datasetList.push(ds);
        }
        wpd.graphicsWidget.setRepainter(new wpd.MultipltDatasetRepainter(axesList, datasetList));
    }

    function renderDatasetAxesSelection() {
        if (activeDataset == null)
            return;
        const plotData = wpd.appData.getPlotData();
        const axesNames = plotData.getAxesNames();
        const dsaxes = plotData.getAxesForDataset(activeDataset);
        const $selection = document.getElementById("dataset-item-axes-select");
        let innerHTML = "<option value='-1'>None</option>";
        for (let axIdx = 0; axIdx < axesNames.length; axIdx++) {
            innerHTML += "<option value='" + axIdx + "'>" + axesNames[axIdx] + "</option>";
        }
        $selection.innerHTML = innerHTML;
        if (dsaxes == null) {
            $selection.value = "-1";
        } else {
            $selection.value = axesNames.indexOf(dsaxes.name);
        }
        activeAxes = dsaxes;
    }

    function setDatasetDisplayColor() {
        if (activeDataset == null) {
            return;
        }
        let $btn = document.getElementById("dataset-display-color-picker-button");
        $btn.style.backgroundColor = activeDataset.colorRGB.toRGBString();
    }

    function renderAreaAxesSelection() {
        renderAxesSelectionForMeasurement(wpd.measurementModes.area);
    }

    function renderDistanceAxesSelection() {
        renderAxesSelectionForMeasurement(wpd.measurementModes.distance);
    }

    function renderAxesSelectionForMeasurement(mode) {
        const isDist = mode == wpd.measurementModes.distance;
        const plotData = wpd.appData.getPlotData();
        const msColl = isDist ? plotData.getMeasurementsByType(wpd.DistanceMeasurement) :
            plotData.getMeasurementsByType(wpd.AreaMeasurement);
        if (msColl.length != 1)
            return; // only 1 distance or area object is supported right now
        const ms = msColl[0];
        const $selection = isDist ? document.getElementById("distance-item-axes-select") :
            document.getElementById("area-item-axes-select");;
        const axesColl = plotData.getAxesColl();
        const axes = plotData.getAxesForMeasurement(ms);
        let innerHTML = "<option value='-1'>None</option>";
        for (let axIdx = 0; axIdx < axesColl.length; axIdx++) {
            if (axesColl[axIdx] instanceof wpd.ImageAxes || axesColl[axIdx] instanceof wpd.MapAxes) {
                innerHTML += "<option value='" + axIdx + "'>" + axesColl[axIdx].name + "</option>";
            }
        }
        $selection.innerHTML = innerHTML;
        if (axes == null) {
            $selection.value = "-1";
        } else {
            $selection.value = axesColl.indexOf(axes);
        }
        activeAxes = axes;
    }

    function onAxesSelection(elem, path, suppressSecondaryActions) {
        resetGraphics();
        showTreeItemWidget("axes-item-tree-widget");
        const axName = path.replace("/" + wpd.gettext("axes") + "/", "");
        const plotData = wpd.appData.getPlotData();
        const axIdx = plotData.getAxesNames().indexOf(axName);
        activeAxes = plotData.getAxesColl()[axIdx];
        const $tweakButton = document.getElementById("tweak-axes-calibration-button");
        $tweakButton.disabled = activeAxes instanceof wpd.ImageAxes ? true : false;
    }

    function onSelection(elem, path, suppressSecondaryActions) {
        if (path === "/" + wpd.gettext("image")) {
            resetGraphics();
            activeAxes = null;
            showTreeItemWidget("image-item-tree-widget");
            wpd.sidebar.show("image-editing-sidebar");
            wpd.appData.getUndoManager().updateUI();
        } else if (path === "/" + wpd.gettext("datasets")) {
            onDatasetGroupSelection();
            showTreeItemWidget("dataset-group-tree-widget");
            activeAxes = null;
        } else if (path === "/" + wpd.gettext("axes")) {
            resetGraphics();
            showTreeItemWidget("axes-group-tree-widget");
            activeAxes = null;
        } else if (path === "/" + wpd.gettext("measurements")) {
            resetGraphics();
            showTreeItemWidget("measurement-group-tree-widget");
            activeAxes = null;
        } else if (path === '/' + wpd.gettext('measurements') + '/' + wpd.gettext('distance')) {
            if (!suppressSecondaryActions) {
                wpd.measurement.start(wpd.measurementModes.distance);
            }
            showTreeItemWidget('distance-item-tree-widget');
            renderDistanceAxesSelection();
        } else if (path === '/' + wpd.gettext('measurements') + '/' + wpd.gettext('angle')) {
            if (!suppressSecondaryActions) {
                wpd.measurement.start(wpd.measurementModes.angle);
            }
            showTreeItemWidget('angle-item-tree-widget');
            activeAxes = null;
        } else if (path === '/' + wpd.gettext('measurements') + '/' + wpd.gettext('area')) {
            if (!suppressSecondaryActions) {
                wpd.measurement.start(wpd.measurementModes.area);
            }
            showTreeItemWidget('area-item-tree-widget');
            renderAreaAxesSelection();
        } else if (path.startsWith("/" + wpd.gettext("datasets") + "/")) {
            onDatasetSelection(elem, path, suppressSecondaryActions);
        } else if (path.startsWith("/" + wpd.gettext("axes") + "/")) {
            onAxesSelection(elem, path, suppressSecondaryActions);
        } else {
            resetGraphics();
            showTreeItemWidget(null);
            activeAxes = null;
        }
    }

    function onRename(elem, path, suppressSecondaryActions) {
        if (path.startsWith("/" + wpd.gettext("datasets") + "/")) {
            wpd.dataSeriesManagement.showRenameDataset();
        } else if (path.startsWith("/" + wpd.gettext("axes") + "/")) {
            wpd.alignAxes.showRenameAxes();
        }
    }

    function init() {
        const $treeElem = document.getElementById("tree-container");
        treeWidget = new wpd.TreeWidget($treeElem);
        treeWidget.onItemSelection(onSelection)
        treeWidget.onItemRename(onRename);
        buildTree();
    }

    function refresh() {
        buildTree();
    }

    function refreshPreservingSelection(forceRefresh) {
        if (treeWidget != null) {
            const selectedPath = treeWidget.getSelectedPath();
            refresh();
            treeWidget.selectPath(selectedPath, !forceRefresh);
        } else {
            refresh();
        }
    }

    function selectPath(path, suppressSecondaryActions) {
        treeWidget.selectPath(path, suppressSecondaryActions);
    }

    function addMeasurement(mode) {
        wpd.measurement.start(mode);
        refresh();
        if (mode === wpd.measurementModes.distance) {
            wpd.tree.selectPath("/" + wpd.gettext("measurements") + "/" + wpd.gettext("distance"),
                true);
        } else if (mode === wpd.measurementModes.angle) {
            wpd.tree.selectPath("/" + wpd.gettext("measurements") + "/" + wpd.gettext("angle"),
                true);
        } else if (mode === wpd.measurementModes.area) {
            wpd.tree.selectPath("/" + wpd.gettext("measurements") + "/" + wpd.gettext("area"),
                true);
        }
    }

    function getActiveDataset() {
        return activeDataset;
    }

    function getActiveAxes() {
        return activeAxes;
    }

    return {
        init: init,
        refresh: refresh,
        refreshPreservingSelection: refreshPreservingSelection,
        selectPath: selectPath,
        addMeasurement: addMeasurement,
        getActiveDataset: getActiveDataset,
        getActiveAxes: getActiveAxes
    };
})();