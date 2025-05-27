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

wpd.dataSeriesManagement = (function() {
    function datasetWithNameExists(name) {
        const plotData = wpd.appData.getPlotData();
        const dsNameColl = plotData.getDatasetNames();
        if (dsNameColl.indexOf(name) >= 0) {
            return true;
        }
        return false;
    }

    function getDatasetWithNameCount(name) {
        const plotData = wpd.appData.getPlotData();
        const dsNameColl = plotData.getDatasetNames();
        let counter = 0;
        for (const dsName of dsNameColl) {
            if (dsName.startsWith(name)) {
                counter++;
            }
        }
        return counter;
    }

    function getDatasetCount() {
        const plotData = wpd.appData.getPlotData();
        return plotData.getDatasetCount();
    }

    function showAddDataset() {
        const $singleDatasetName = document.getElementById('add-single-dataset-name-input');
        let suffix = getDatasetCount();
        let dsName = wpd.gettext("dataset") + " " + suffix;
        while (datasetWithNameExists(dsName)) {
            suffix++;
            dsName = wpd.gettext("dataset") + " " + suffix;
        }
        $singleDatasetName.value = dsName;
        wpd.popup.show('add-dataset-popup');
    }

    function showRenameDataset() {
        const ds = wpd.tree.getActiveDataset();
        const $dsName = document.getElementById('rename-dataset-name-input');
        $dsName.value = ds.name;
        wpd.popup.show('rename-dataset-popup');
    }

    function renameDataset() {
        const $dsName = document.getElementById('rename-dataset-name-input');
        wpd.popup.close('rename-dataset-popup');

        if (datasetWithNameExists($dsName.value.trim())) {
            wpd.messagePopup.show(wpd.gettext("rename-dataset-error"),
                wpd.gettext("dataset-exists-error"), showRenameDataset);
            return;
        }
        const ds = wpd.tree.getActiveDataset();
        ds.name = $dsName.value.trim();
        wpd.tree.refresh();
        wpd.tree.selectPath("/" + wpd.gettext("datasets") + "/" + ds.name, true);
    }

    function renameKeypress(e) {
        if (e.key === "Enter") {
            renameDataset();
        }
    }

    function getDefaultAxes() {
        const fileManager = wpd.appData.getFileManager();
        const plotData = wpd.appData.getPlotData();
        let axesColl = fileManager.filterToCurrentFileAxes(plotData.getAxesColl());
        if (wpd.appData.isMultipage()) {
            const pageManager = wpd.appData.getPageManager();
            axesColl = pageManager.filterToCurrentPageAxes(axesColl);
        }
        if (axesColl.length > 0) {
            return axesColl.slice(-1)[0];
        }
        return null;
    }

    function addSingleDataset() {
        const $singleDatasetName = document.getElementById('add-single-dataset-name-input');

        wpd.popup.close('add-dataset-popup');

        // do not add if this name already exists
        if (datasetWithNameExists($singleDatasetName.value.trim())) {
            wpd.messagePopup.show(wpd.gettext("add-dataset-error"),
                wpd.gettext("dataset-exists-error"),
                function() {
                    wpd.popup.show('add-dataset-popup');
                });
            return;
        }

        const plotData = wpd.appData.getPlotData();
        let ds = new wpd.Dataset();
        ds.name = $singleDatasetName.value.trim();
        plotData.addDataset(ds);
        const defaultAxes = getDefaultAxes();
        if (defaultAxes != null) {
            plotData.setAxesForDataset(ds, defaultAxes);
        }
        wpd.appData.getFileManager().addDatasetsToCurrentFile([ds]);
        if (wpd.appData.isMultipage()) {
            wpd.appData.getPageManager().addDatasetsToCurrentPage([ds]);
        }
        wpd.tree.refreshPreservingSelection();
        // dispatch dataset add event
        wpd.events.dispatch("wpd.dataset.add", {
            dataset: ds
        });
    }

    function addMultipleDatasets() {
        const $dsCount = document.getElementById('add-multiple-datasets-count-input');
        const dsCount = parseInt($dsCount.value, 0);
        wpd.popup.close('add-dataset-popup');
        if (dsCount > 0) {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            const isMultipage = wpd.appData.isMultipage();
            let idx = getDatasetCount();
            const prefix = wpd.gettext("dataset") + " ";
            let i = 0;
            while (i < dsCount) {
                let dsName = prefix + idx;
                if (!datasetWithNameExists(dsName)) {
                    let ds = new wpd.Dataset();
                    ds.name = dsName;
                    plotData.addDataset(ds);
                    const defaultAxes = getDefaultAxes();
                    if (defaultAxes != null) {
                        plotData.setAxesForDataset(ds, defaultAxes);
                    }
                    fileManager.addDatasetsToCurrentFile([ds]);
                    if (isMultipage) {
                        wpd.appData.getPageManager().addDatasetsToCurrentPage([ds]);
                    }
                    // dispatch dataset add event
                    wpd.events.dispatch("wpd.dataset.add", {
                        dataset: ds
                    });
                    i++;
                }
                idx++;
            }
            wpd.tree.refreshPreservingSelection();
        } else {
            wpd.messagePopup(wpd.gettext("add-dataset-error"),
                wpd.gettext("add-dataset-count-error"),
                function() {
                    wpd.popup.show('add-dataset-popup');
                });
        }
    }

    function deleteDataset() {
        wpd.okCancelPopup.show(wpd.gettext("delete-dataset"), wpd.gettext("delete-dataset-text"),
            function() {
                const plotData = wpd.appData.getPlotData();
                const ds = wpd.tree.getActiveDataset();
                plotData.deleteDataset(ds);
                wpd.appData.getFileManager().deleteDatasetsFromCurrentFile([ds]);
                if (wpd.appData.isMultipage()) {
                    wpd.appData.getPageManager().deleteDatasetsFromCurrentPage([ds]);
                }
                wpd.tree.refresh();
                wpd.tree.selectPath("/" + wpd.gettext("datasets"));
                // dispatch dataset delete event
                wpd.events.dispatch("wpd.dataset.delete", {
                    dataset: ds
                });
            });
    }

    function changeAxes(axIdx) {
        const plotData = wpd.appData.getPlotData();
        const axesColl = plotData.getAxesColl();
        const ds = wpd.tree.getActiveDataset();
        axIdx = parseInt(axIdx, 10);
        if (axIdx === -1) {
            plotData.setAxesForDataset(ds, null);
        } else if (axIdx >= 0 && axIdx < axesColl.length) {
            plotData.setAxesForDataset(ds, axesColl[axIdx]);
        }
        wpd.tree.refreshPreservingSelection(true);
    }

    function startColorPicker() {
        wpd.graphicsWidget.removeTool();
        wpd.colorSelectionWidget.setParams({
            color: wpd.tree.getActiveDataset().colorRGB.getRGB(),
            triggerElementId: 'dataset-display-color-picker-button',
            parentElementId: 'dataset-display-color-picker-container',
            title: 'Specify Display Color for Digitized Points',
            setColorDelegate: function(col) {
                wpd.tree.getActiveDataset().colorRGB = new wpd.Color(col[0], col[1], col[2]);
                wpd.graphicsWidget.forceHandlerRepaint();
                wpd.tree.refreshPreservingSelection();
            }
        });
        wpd.colorSelectionWidget.startPicker();
    }

    return {
        showAddDataset: showAddDataset,
        showRenameDataset: showRenameDataset,
        renameDataset: renameDataset,
        renameKeypress: renameKeypress,
        addSingleDataset: addSingleDataset,
        addMultipleDatasets: addMultipleDatasets,
        deleteDataset: deleteDataset,
        changeAxes: changeAxes,
        startColorPicker: startColorPicker,
        getDatasetWithNameCount: getDatasetWithNameCount
    };
})();
