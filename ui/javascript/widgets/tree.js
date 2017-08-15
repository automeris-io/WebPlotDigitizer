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
        this.$mainElem.classList.add("tree-widget");
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

        let i = 0;
        for(i=0; i < data.length; i++) {
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

    selectItem(itemPath) {
        const itemId = this.idmap.indexOf(itemPath);
        if(itemId >= 0) {
            this._unselectAll();
            const $item = document.getElementById("tree-item-id-" + itemId);
            $item.classList.add("tree-selected");
            if(this.itemSelectionCallback != null) {
                this.itemSelectionCallback($item, itemPath);
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
                    this.itemSelectionCallback(e.target, this.idmap[itemId]);
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

    function init() {
        const $treeElem = document.getElementById("tree-container");
        const treeData = [
            {"Axes": ["XY Axes"]},
            {"Datasets":[
                    "Default Dataset", 
                    ]
            },
            {"Measurements": []}
        ];        
        
        let treeWidget = new wpd.TreeWidget($treeElem);
        treeWidget.onItemSelection(function(elem, path) {
            console.log(path);
        });
        // separate out:
        treeWidget.render(treeData);
        treeWidget.selectItem("/Datasets");
    }

    return {
        init: init
    };
})();

