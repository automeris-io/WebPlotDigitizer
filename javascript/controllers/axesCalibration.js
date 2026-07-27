/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2026 Ankit Rohatgi

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

wpd.alignAxes = (function() {
    let calibration = null;
    let calibrator = null;

    const ALL_CALIBRATORS = [
        wpd.XYAxesCalibrator, wpd.BarAxesCalibrator, wpd.PolarAxesCalibrator,
        wpd.TernaryAxesCalibrator, wpd.MapAxesCalibrator, wpd.CircularChartRecorderCalibrator
    ];
    const BY_TYPE = Object.fromEntries(ALL_CALIBRATORS.map(C => [C.typeString, C]));
    const BY_AXES_CLASS = ALL_CALIBRATORS.map(C => [C.axesClass, C]);

    function initiatePlotAlignment(axesTypeString) {
        if (axesTypeString === "image") {
            calibration = null;
            calibrator = null;
            const imageAxes = new wpd.ImageAxes();
            imageAxes.name = wpd.alignAxes.makeAxesName(wpd.ImageAxes);
            imageAxes.calibrate();
            wpd.appData.getPlotData().addAxes(imageAxes, wpd.appData.isMultipage());
            postProcessAxesAdd(imageAxes);
            wpd.tree.refresh();
            const dsNameColl = wpd.appData.getPlotData().getDatasetNames();
            if (dsNameColl.length > 0) {
                const dsName = dsNameColl[dsNameColl.length - 1];
                wpd.tree.selectPath("/" + wpd.gettext("datasets") + "/" + dsName, true);
            }
            wpd.acquireData.load();
            return;
        }

        const CalibratorClass = BY_TYPE[axesTypeString];
        if (!CalibratorClass) {
            console.error("unknown axes type string", axesTypeString);
            return;
        }
        const spec = CalibratorClass.calibrationSpec;
        calibration = new wpd.Calibration(spec.dimensions);
        calibration.labels = spec.labels;
        calibration.labelPositions = spec.labelPositions;
        calibration.maxPointCount = spec.maxPointCount;
        calibrator = new CalibratorClass(calibration);

        wpd.tree.selectPath("/" + wpd.gettext("axes"));
        calibrator.pickCorners();
        if (axesTypeString === "circular-chart-recorder") {
            wpd.graphicsWidget.setRepainter(new wpd.CircularChartRecorderAlignmentRepainter(calibration));
        } else {
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration, axesTypeString));
        }
    }

    function calibrationCompleted() {
        if (calibrator?.calibrateButtonId) {
            document.getElementById(calibrator.calibrateButtonId).disabled = false;
        } else {
            wpd.sidebar.show('axes-calibration-sidebar');
        }
    }

    function zoomCalPoint(i) {
        var point = calibration.getPoint(i);
        wpd.graphicsWidget.updateZoomToImagePosn(point.px, point.py);
    }

    function getCornerValues() {
        calibrator.getCornerValues();
    }

    function pickCorners() {
        calibrator.pickCorners();
    }

    function align() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        if (!calibrator.align()) {
            return;
        }
        wpd.sidebar.clear();
        wpd.tree.refresh();
        let dsNameColl = wpd.appData.getPlotData().getDatasetNames();
        if (dsNameColl.length > 0) {
            let dsName = dsNameColl[0];
            wpd.tree.selectPath("/" + wpd.gettext("datasets") + "/" + dsName);
        }
    }

    function editAlignment() {
        let hasAlignment = wpd.appData.isAligned() && calibrator != null;
        if (hasAlignment) {
            wpd.popup.show('edit-or-reset-calibration-popup');
        } else {
            wpd.calibrateAxesDialog.open();
        }
    }

    function addCalibration() {
        wpd.calibrateAxesDialog.open();
    }

    function reloadCalibrationForEditing() {
        wpd.popup.close('edit-or-reset-calibration-popup');
        calibrator = null;
        const axes = wpd.tree.getActiveAxes();
        calibration = axes.calibration;
        const entry = BY_AXES_CLASS.find(([AxesClass]) => axes instanceof AxesClass);
        if (!entry) return;
        const [, CalibratorClass] = entry;
        const axesTypeString = CalibratorClass.typeString;
        calibrator = new CalibratorClass(calibration, true);
        calibrator.pickCorners();
        if (axesTypeString === "circular-chart-recorder") {
            wpd.graphicsWidget.setRepainter(new wpd.CircularChartRecorderAlignmentRepainter(calibration));
        } else {
            wpd.graphicsWidget.setRepainter(new wpd.AlignmentCornersRepainter(calibration, axesTypeString));
        }
        wpd.graphicsWidget.forceHandlerRepaint();
        if (calibrator.calibrateButtonId) {
            document.getElementById(calibrator.calibrateButtonId).disabled = false;
        } else {
            wpd.sidebar.show('axes-calibration-sidebar');
        }
    }

    function deleteCalibration() {
        wpd.okCancelPopup.show(wpd.gettext("delete-axes"), wpd.gettext("delete-axes-text"), deleteAssociatedDatasets);
    }

    function deleteAssociatedDatasets() {
        const deleteAxes = () => {
            const plotData = wpd.appData.getPlotData();
            const axes = wpd.tree.getActiveAxes();
            plotData.deleteAxes(axes);
            if (wpd.appData.isMultipage()) {
                wpd.appData.getPageManager().deleteAxesFromCurrentPage([axes]);
            }
            wpd.tree.refresh();
            wpd.tree.selectPath("/" + wpd.gettext("axes"));
            // dispatch axes delete event
            wpd.events.dispatch("wpd.axes.delete", {
                axes: axes
            });
        };

        const plotData = wpd.appData.getPlotData();
        const axes = wpd.tree.getActiveAxes();

        // get all datasets and filter to datasets of active axes
        const datasets = plotData.getDatasets();
        const axesDatasets = datasets.filter((ds) => plotData.getAxesForDataset(ds) === axes);

        if (axesDatasets.length > 0) {
            // only display delete associated datasets popup if they exist
            wpd.okCancelPopup.show(
                wpd.gettext("delete-associated-datasets"),
                wpd.gettext("delete-associated-datasets-text"),
                () => {
                    for (const dataset of axesDatasets) {
                        plotData.deleteDataset(dataset);
                        wpd.appData.getFileManager().deleteDatasetsFromCurrentFile([dataset]);
                        if (wpd.appData.isMultipage()) {
                            wpd.appData.getPageManager().deleteDatasetsFromCurrentPage([dataset]);
                        }
                        // dispatch dataset delete event
                        wpd.events.dispatch("wpd.dataset.delete", {
                            dataset: dataset
                        });

                        // no need to refresh the tree here
                    }

                    deleteAxes();
                },
                deleteAxes,
            );
        } else {
            // otherwise, proceed to delete the axes
            deleteAxes();
        }
    }

    function showRenameAxes() {
        const axes = wpd.tree.getActiveAxes();
        const $axName = document.getElementById("rename-axes-name-input");
        $axName.value = axes.name;
        wpd.popup.show('rename-axes-popup');
    }

    function renameAxes() {
        const $axName = document.getElementById("rename-axes-name-input");
        wpd.popup.close('rename-axes-popup');
        // check if this name already exists
        const name = $axName.value.trim();
        const plotData = wpd.appData.getPlotData();
        if (plotData.getAxesNames().indexOf(name) >= 0 || name.length === 0) {
            wpd.messagePopup.show(wpd.gettext("rename-axes-error"),
                wpd.gettext("axes-exists-error"), showRenameAxes);
            return;
        }
        const axes = wpd.tree.getActiveAxes();
        axes.name = name;
        wpd.tree.refresh();
        wpd.tree.selectPath("/" + wpd.gettext("axes") + "/" + name, true);
    }

    function renameKeypress(e) {
        if (e.key === "Enter") {
            renameAxes();
        }
    }

    const AXES_NAME_KEYS = new Map([
        [wpd.XYAxes, "axes-name-xy"],
        [wpd.BarAxes, "axes-name-bar"],
        [wpd.PolarAxes, "axes-name-polar"],
        [wpd.TernaryAxes, "axes-name-ternary"],
        [wpd.MapAxes, "axes-name-map"],
        [wpd.ImageAxes, "axes-name-image"],
        [wpd.CircularChartRecorderAxes, "axes-name-circular-chart-recorder"],
    ]);

    function makeAxesName(axType) {
        const plotData = wpd.appData.getPlotData();
        const name = wpd.gettext(AXES_NAME_KEYS.get(axType) ?? "");
        const existingAxesNames = plotData.getAxesNames();
        let idx = 2;
        let fullName = name;
        while (existingAxesNames.indexOf(fullName) >= 0) {
            fullName = name + " " + idx;
            idx++;
        }
        return fullName;
    }

    function postProcessAxesAdd(axes, suppressDatasetCreation) {
        // dispatch axes add event
        wpd.events.dispatch("wpd.axes.add", {
            axes: axes
        });

        const plotData = wpd.appData.getPlotData();
        const fileManager = wpd.appData.getFileManager();
        const pageManager = wpd.appData.getPageManager();

        fileManager.addAxesToCurrentFile([axes]);

        let axesColl = fileManager.filterToCurrentFileAxes(plotData.getAxesColl());
        let datasetColl = fileManager.filterToCurrentFileDatasets(plotData.getDatasets());

        if (wpd.appData.isMultipage()) {
            pageManager.addAxesToCurrentPage([axes]);
            axesColl = pageManager.filterToCurrentPageAxes(axesColl);
            datasetColl = pageManager.filterToCurrentPageDatasets(datasetColl);
        }

        // create a default dataset and associate it with the axes if this is the first
        // axes (in the file and/or page) and datasets do not yet exist
        if (axesColl.length === 1 && datasetColl.length === 0 && suppressDatasetCreation != true) {
            let dataset = new wpd.Dataset();
            dataset.name = 'Default Dataset';
            const count = wpd.dataSeriesManagement.getDatasetWithNameCount(dataset.name);
            if (count > 0) dataset.name += ' ' + (count + 1);

            plotData.addDataset(dataset);
            plotData.setAxesForDataset(dataset, axes);
            fileManager.addDatasetsToCurrentFile([dataset]);

            if (wpd.appData.isMultipage()) {
                pageManager.addDatasetsToCurrentPage([dataset]);
            }

            // dispatch dataset add event
            wpd.events.dispatch("wpd.dataset.add", {
                dataset: dataset
            });
        }
    }

    return {
        start: initiatePlotAlignment,
        calibrationCompleted: calibrationCompleted,
        zoomCalPoint: zoomCalPoint,
        getCornerValues: getCornerValues,
        pickCorners: pickCorners,
        align: align,
        editAlignment: editAlignment,
        reloadCalibrationForEditing: reloadCalibrationForEditing,
        addCalibration: addCalibration,
        deleteCalibration: deleteCalibration,
        showRenameAxes: showRenameAxes,
        makeAxesName: makeAxesName,
        renameAxes: renameAxes,
        renameKeypress: renameKeypress,
        postProcessAxesAdd: postProcessAxesAdd
    };
})();
