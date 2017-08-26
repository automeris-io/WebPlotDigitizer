/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2017 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.

*/

var wpd = wpd || {};

wpd.TreeWidget = class {
    constructor($elem) {
        this.$mainElem = $elem;
        this.treeData = null;
        this.$mainElem.addEventListener("click", e => this._onclick(e));
        this.idmap = [];
        this.itemCount = 0;
    }

    _renderFolder(data, basePath, isInnerFolder) {
        let htmlStr = "";
        
        if(isInnerFolder) {
            htmlStr = "<ul class=\"tree-list\">";
        } else {
            htmlStr = "<ul class=\"tree-list-root\">";
        }

        for(let i = 0; i < data.length; i++) {
            let item = data[i];
            this.itemCount++;
            if(typeof(item) === "string") {
                htmlStr += "<li>"
                htmlStr += "<span class=\"tree-item\" id=\"tree-item-id-" + this.itemCount + "\">" + item + "</span>";
                this.idmap[this.itemCount] = basePath + "/" + item;
            } else if(typeof(item) === "object") {
                htmlStr += "<li>";
                let labelKey = Object.keys(item)[0];
                htmlStr += "<span class=\"tree-folder\" id=\"tree-item-id-" + this.itemCount + "\">" + labelKey + "</span>";
                this.idmap[this.itemCount] = basePath + "/" + labelKey;
                htmlStr += this._renderFolder(item[labelKey], basePath + "/" + labelKey, true);
            }
            htmlStr += "</li>";
        }
        htmlStr += "</ul>";
        return(htmlStr);
    }
    
    render(treeData) {
        this.idmap = [];
        this.itemCount = 0;
        this.treeData = treeData;
        this.$mainElem.innerHTML = this._renderFolder(this.treeData, "", false);
        console.log(this.idmap);
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
    }

    selectPath(itemPath, suppressSecondaryActions) {
        const itemId = this.idmap.indexOf(itemPath);
        if(itemId >= 0) {
            this._unselectAll();
            const $item = document.getElementById("tree-item-id-" + itemId);
            $item.classList.add("tree-selected");
            if(this.itemSelectionCallback != null) {
                this.itemSelectionCallback($item, itemPath, suppressSecondaryActions);
            }
        }
    }

    _onclick(e) {
        const isItem = e.target.classList.contains("tree-item");
        const isFolder = e.target.classList.contains("tree-folder");
        if(isItem || isFolder) {
            this._unselectAll();
            e.target.classList.add("tree-selected");
            if(this.itemSelectionCallback != null) {
                let itemId = parseInt(e.target.id.replace("tree-item-id-",""),10);
                if(!isNaN(itemId)) {
                    this.itemSelectionCallback(e.target, this.idmap[itemId], false);
                }
            }
        }
    }

    onItemSelection(callback) {
        this.itemSelectionCallback = callback;
    }
};

wpd.tree = (function() {

    let treeWidget = null;

    function buildTree() {
        if(treeWidget == null) {
            return;
        }
        let treeData = [];
        
        const plotData = wpd.appData.getPlotData();
        
        const axes = plotData.axes;
        if(axes == null) {
            treeData.push({"Axes": []});
        } else {
            treeData.push({"Axes": [axes.name]});
        }

        const datasetNames = plotData.getDataSeriesNames();
        treeData.push({"Datasets": datasetNames});

        let measurementItems = [];
        if(plotData.angleMeasurementData != null) {
            measurementItems.push("Angle");
        }
        if(plotData.distanceMeasurementData != null) {
            measurementItems.push("Distance");
        }
        treeData.push({"Measurements": measurementItems});

        treeWidget.render(treeData);

        showTreeItemWidget(null);
    }

    function showTreeItemWidget(id) {
        const $treeWidgets = document.querySelectorAll(".tree-widget");
        $treeWidgets.forEach(function($e) {
            if($e.id === id) {
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
        if(!suppressSecondaryActions) {
            // get dataset index
            const plotData = wpd.appData.getPlotData();
            const dsNamesColl = plotData.getDataSeriesNames();
            const dsIdx = dsNamesColl.indexOf(path.replace("/Datasets/",""));
            // set active dataset 
            plotData.setActiveDataSeriesIndex(dsIdx);
            // refresh UI
            wpd.acquireData.load();
        }
        showTreeItemWidget('dataset-item-tree-widget');
    }

    function onSelection(elem, path, suppressSecondaryActions) {
        if(path === "/Datasets") {
            resetGraphics();
            showTreeItemWidget("dataset-group-tree-widget");
        } else if(path === "/Axes") {
            resetGraphics();
            showTreeItemWidget("axes-group-tree-widget");
        } else if(path === "/Measurements") {
            resetGraphics();
            showTreeItemWidget("measurement-group-tree-widget");
        } else if(path === wpd.measurementModes.distance.treePath) {
            if(!suppressSecondaryActions) {
                wpd.measurement.start(wpd.measurementModes.distance);
            }
            showTreeItemWidget('distance-item-tree-widget');
        } else if(path === wpd.measurementModes.angle.treePath) {
            if(!suppressSecondaryActions) {
                wpd.measurement.start(wpd.measurementModes.angle);
            }
            showTreeItemWidget('angle-item-tree-widget');
        } else if(path.startsWith("/Datasets/")) {
            onDatasetSelection(elem, path, suppressSecondaryActions);
        } else if(path.startsWith("/Axes/")) {

        } else {
            showTreeItemWidget(null);
        }
    }

    function init() {
        const $treeElem = document.getElementById("tree-container");        
        treeWidget = new wpd.TreeWidget($treeElem);
        treeWidget.onItemSelection(onSelection)
        buildTree();
    }

    function refresh() {
        buildTree();
    }

    function selectPath(path, suppressSecondaryActions) {
        treeWidget.selectPath(path, suppressSecondaryActions);
    }

    function addMeasurement(mode) {
        wpd.measurement.start(mode);
        refresh();
        wpd.tree.selectPath(mode.treePath, true);
    }

    return {
        init: init,
        refresh: refresh,
        selectPath: selectPath,
        addMeasurement: addMeasurement        
    };
})();

