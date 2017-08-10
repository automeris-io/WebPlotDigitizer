
var wpd = wpd || {};

wpd.TreeWidget = class {
    constructor($elem) {
        this.$mainElem = $elem;
        this.treeData = null;
        this.$mainElem.addEventListener("click", e => this._onclick(e));
        this.$mainElem.classList.add("tree-widget");
        this.itemPaths = [];
        this.idmap = [];
    }

    _renderFolder(data) {
        let htmlStr = "<ul class=\"tree-list\">";
        let i = 0;
        for(i=0; i < data.length; i++) {
            let item = data[i];
            if(typeof(item) === "string") {
                htmlStr += "<li>"
                htmlStr += "<span class=\"tree-item\">" + item + "</span>";
            } else if(typeof(item) === "object") {
                htmlStr += "<li>";
                let labelKey = Object.keys(item)[0];
                htmlStr += "<span class=\"tree-folder\">" + labelKey + "</span>";
                htmlStr += this._renderFolder(item[labelKey]);
            }
            htmlStr += "</li>";
        }
        htmlStr += "</ul>";
        console.log(htmlStr);
        return(htmlStr);
    }
    
    render(treeData) {
        this.treeData = treeData;
        this.$mainElem.innerHTML = this._renderFolder(this.treeData);
    }

    selectItem(itemPath) {
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

    _onclick(e) {
        const isItem = e.target.classList.contains("tree-item");
        const isFolder = e.target.classList.contains("tree-folder");
        if(isItem || isFolder) {
            this._unselectAll();
            e.target.classList.add("tree-selected");
        }
        if(isItem && this.itemSelectionCallback != null) {
            this.itemSelectionCallback(e.target);
        }
        if(isFolder && this.folderSelectionCallback != null) {
            this.folderSelectionCallback(e.target);
        }
    }

    onItemSelection(callback) {
        this.itemSelectionCallback = callback;
    }

    onFolderSelection(callback) {
        this.folderSelectionCallback = callback;
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
                    "Dataset 1",
                    "Dataset 1",
                    "Dataset 1",
                    "Dataset 1",
                    "Dataset 1"
                    ]
            },
            {"Measurements": []}
        ];
        
        treeWidget = new wpd.TreeWidget($treeElem);

        // separate out:
        treeWidget.render(treeData);

    }

    return {
        init: init
    };
})();

