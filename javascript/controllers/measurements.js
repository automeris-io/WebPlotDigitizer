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

wpd.measurementModes = {
    distance: {
        name: 'distance',
        connectivity: 2,
        addButtonId: 'add-pair-button',
        deleteButtonId: 'delete-pair-button',
        sidebarId: 'measure-distances-sidebar',
        init: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            const distMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.DistanceMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                if (pageManager.filterToCurrentPageMeasurements(distMeasures).length == 0) {
                    const distMeasure = new wpd.DistanceMeasurement();
                    const pageAxes = pageManager.getCurrentPageAxes();
                    if (pageAxes.length > 0) {
                        for (let i = pageAxes.length - 1; i > -1; i--) {
                            if (
                                pageAxes[i] instanceof wpd.MapAxes ||
                                pageAxes[i] instanceof wpd.ImageAxes
                            ) {
                                plotData.setAxesForMeasurement(distMeasure, pageAxes[i]);
                                break;
                            }
                        }
                    }
                    plotData.addMeasurement(distMeasure, true);
                    fileManager.addMeasurementsToCurrentFile([distMeasure]);
                    pageManager.addMeasurementsToCurrentPage([distMeasure]);
                }
            } else {
                if (distMeasures.length == 0) {
                    const distMeasure = new wpd.DistanceMeasurement();
                    plotData.addMeasurement(distMeasure);
                    fileManager.addMeasurementsToCurrentFile([distMeasure]);
                }
            }
        },
        clear: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            let distMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.DistanceMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                distMeasures = pageManager.filterToCurrentPageMeasurements(distMeasures);
                pageManager.deleteMeasurementsFromCurrentPage(distMeasures);
            }
            fileManager.deleteMeasurementsFromCurrentFile(distMeasures);
            distMeasures.forEach(m => {
                m.clearAll();
            });
            plotData.deleteMeasurement(distMeasures[0]);
            wpd.tree.refresh();
        },
        getData: function() {
            const plotData = wpd.appData.getPlotData();
            let distMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.DistanceMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                distMeasures = pageManager.filterToCurrentPageMeasurements(distMeasures);
            }
            return distMeasures[0];
        },
        getAxes: function() {
            const plotData = wpd.appData.getPlotData();
            let distMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.DistanceMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                distMeasures = pageManager.filterToCurrentPageMeasurements(distMeasures);
            }
            return plotData.getAxesForMeasurement(distMeasures[0]);
        },
        changeAxes: function(axIdx) {
            const plotData = wpd.appData.getPlotData();
            let distMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.DistanceMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                distMeasures = pageManager.filterToCurrentPageMeasurements(distMeasures);
            }
            let distMeasure = distMeasures[0];
            let axesColl = plotData.getAxesColl();
            if (axIdx == -1) {
                plotData.setAxesForMeasurement(distMeasure, null);
            } else {
                plotData.setAxesForMeasurement(distMeasure, axesColl[axIdx]);
            }
            wpd.tree.refreshPreservingSelection(true);
        }
    },
    angle: {
        name: 'angle',
        connectivity: 3,
        addButtonId: 'add-angle-button',
        deleteButtonId: 'delete-angle-button',
        sidebarId: 'measure-angles-sidebar',
        init: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            const angleMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AngleMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                if (pageManager.filterToCurrentPageMeasurements(angleMeasures).length == 0) {
                    const angleMeasure = new wpd.AngleMeasurement();
                    plotData.addMeasurement(angleMeasure, true);
                    fileManager.addMeasurementsToCurrentFile([angleMeasure]);
                    pageManager.addMeasurementsToCurrentPage([angleMeasure]);
                }
            } else {
                if (angleMeasures.length == 0) {
                    const angleMeasure = new wpd.AngleMeasurement();
                    plotData.addMeasurement(angleMeasure);
                    fileManager.addMeasurementsToCurrentFile([angleMeasure]);
                }
            }
        },
        clear: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            let angleMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AngleMeasurement)
            );
            fileManager.deleteMeasurementsFromCurrentFile(angleMeasures);
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                angleMeasures = pageManager.filterToCurrentPageMeasurements(angleMeasures);
                pageManager.deleteMeasurementsFromCurrentPage(angleMeasures);
            }
            angleMeasures.forEach(m => {
                m.clearAll();
            });
            plotData.deleteMeasurement(angleMeasures[0]);
            wpd.tree.refresh();
        },
        getData: function() {
            let plotData = wpd.appData.getPlotData();
            let angleMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AngleMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                angleMeasures = pageManager.filterToCurrentPageMeasurements(angleMeasures);
            }
            return angleMeasures[0];
        }
    },
    area: {
        name: 'area',
        connectivity: -1,
        addButtonId: 'add-polygon-button',
        deleteButtonId: 'delete-polygon-button',
        sidebarId: 'measure-area-sidebar',
        init: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            let areaMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AreaMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                areaMeasures = pageManager.filterToCurrentPageMeasurements(areaMeasures);
                if (areaMeasures.length == 0) {
                    const areaMeasure = new wpd.AreaMeasurement();
                    plotData.addMeasurement(areaMeasure, true);
                    fileManager.addMeasurementsToCurrentFile([areaMeasure]);
                    pageManager.addMeasurementsToCurrentPage([areaMeasure]);
                }
            } else {
                if (areaMeasures.length == 0) {
                    const areaMeasure = new wpd.AreaMeasurement();
                    plotData.addMeasurement(areaMeasure);
                    fileManager.addMeasurementsToCurrentFile([areaMeasure]);
                }
            }
        },
        clear: function() {
            const plotData = wpd.appData.getPlotData();
            const fileManager = wpd.appData.getFileManager();
            let areaMeasures = fileManager.filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AreaMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                areaMeasures = pageManager.filterToCurrentPageMeasurements(areaMeasures);
                pageManager.deleteMeasurementsFromCurrentPage(areaMeasures);
            }
            fileManager.deleteMeasurementsFromCurrentFile(areaMeasures);
            areaMeasures.forEach(m => {
                m.clearAll();
            });
            plotData.deleteMeasurement(areaMeasures[0]);
            wpd.tree.refresh();
        },
        getData: function() {
            const plotData = wpd.appData.getPlotData();
            let areaMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AreaMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                areaMeasures = pageManager.filterToCurrentPageMeasurements(areaMeasures);
            }
            return areaMeasures[0];
        },
        getAxes: function() {
            const plotData = wpd.appData.getPlotData();
            let areaMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AreaMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                areaMeasures = pageManager.filterToCurrentPageMeasurements(areaMeasures);
            }
            return plotData.getAxesForMeasurement(areaMeasures[0]);
        },
        changeAxes: function(axIdx) {
            const plotData = wpd.appData.getPlotData();
            let areaMeasures = wpd.appData.getFileManager().filterToCurrentFileMeasurements(
                plotData.getMeasurementsByType(wpd.AreaMeasurement)
            );
            if (wpd.appData.isMultipage()) {
                const pageManager = wpd.appData.getPageManager();
                areaMeasures = pageManager.filterToCurrentPageMeasurements(areaMeasures);
            }
            let areaMeasure = areaMeasures[0];
            let axesColl = plotData.getAxesColl();
            if (axIdx == -1) {
                plotData.setAxesForMeasurement(areaMeasure, null);
            } else {
                plotData.setAxesForMeasurement(areaMeasure, axesColl[axIdx]);
            }
            wpd.tree.refreshPreservingSelection(true);
        }
    }
};

wpd.measurement = (function() {
    var activeMode;

    function start(mode) {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        mode.init();
        wpd.sidebar.show(mode.sidebarId);
        const connectionCount = mode.getData().connectionCount();
        if (connectionCount == 0) {
            wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
        } else {
            wpd.graphicsWidget.setTool(new wpd.AdjustMeasurementTool(mode));
        }
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        wpd.graphicsWidget.forceHandlerRepaint();
        activeMode = mode;
    }

    function addItem() {
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(activeMode));
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(activeMode));
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function deleteItem() {
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(activeMode));
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(activeMode));
        wpd.graphicsWidget.forceHandlerRepaint();
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.removeRepainter();
        wpd.graphicsWidget.resetData();
        wpd.sidebar.clear();
        activeMode.clear();
    }

    function changeAxes(axIdx) {
        activeMode.changeAxes(parseInt(axIdx, 10));
    }

    return {
        start: start,
        addItem: addItem,
        deleteItem: deleteItem,
        clearAll: clearAll,
        changeAxes: changeAxes
    };
})();
