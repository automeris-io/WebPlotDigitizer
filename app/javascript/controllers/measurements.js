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
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.
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
            let plotData = wpd.appData.getPlotData();
            if (plotData.getMeasurementsByType(wpd.DistanceMeasurement).length == 0) {
                plotData.addMeasurement(new wpd.DistanceMeasurement());
            }
        },
        clear: function() {
            let plotData = wpd.appData.getPlotData();
            let distMeasures = plotData.getMeasurementsByType(wpd.DistanceMeasurement);
            distMeasures.forEach(m => {
                m.clearAll();
            });
        },
        getData: function() {
            let plotData = wpd.appData.getPlotData();
            let distMeasures = plotData.getMeasurementsByType(wpd.DistanceMeasurement);
            return distMeasures[0];
        },
        getAxes: function() {
            let plotData = wpd.appData.getPlotData();
            let distMeasures = plotData.getMeasurementsByType(wpd.DistanceMeasurement);
            return plotData.getAxesForMeasurement(distMeasures[0]);
        },
        changeAxes: function(axIdx) {
            let plotData = wpd.appData.getPlotData();
            let ms = plotData.getMeasurementsByType(wpd.DistanceMeasurement)[0];
            let axesColl = plotData.getAxesColl();
            if (axIdx == -1) {
                plotData.setAxesForMeasurement(ms, null);
            } else {
                plotData.setAxesForMeasurement(ms, axesColl[axIdx]);
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
            let plotData = wpd.appData.getPlotData();
            if (plotData.getMeasurementsByType(wpd.AngleMeasurement).length == 0) {
                plotData.addMeasurement(new wpd.AngleMeasurement());
            }
        },
        clear: function() {
            let plotData = wpd.appData.getPlotData();
            let angleMeasures = plotData.getMeasurementsByType(wpd.AngleMeasurement);
            angleMeasures.forEach(m => {
                m.clearAll();
            });
        },
        getData: function() {
            let plotData = wpd.appData.getPlotData();
            let angleMeasures = plotData.getMeasurementsByType(wpd.AngleMeasurement);
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
            let plotData = wpd.appData.getPlotData();
            if (plotData.getMeasurementsByType(wpd.AreaMeasurement).length == 0) {
                plotData.addMeasurement(new wpd.AreaMeasurement());
            }
        },
        clear: function() {
            let plotData = wpd.appData.getPlotData();
            let areaMeasures = plotData.getMeasurementsByType(wpd.AreaMeasurement);
            areaMeasures.forEach(m => {
                m.clearAll();
            });
        },
        getData: function() {
            let plotData = wpd.appData.getPlotData();
            let areaMeasures = plotData.getMeasurementsByType(wpd.AreaMeasurement);
            return areaMeasures[0];
        },
        getAxes: function() {
            let plotData = wpd.appData.getPlotData();
            let areaMeasures = plotData.getMeasurementsByType(wpd.AreaMeasurement);
            return plotData.getAxesForMeasurement(areaMeasures[0]);
        },
        changeAxes: function(axIdx) {
            let plotData = wpd.appData.getPlotData();
            let ms = plotData.getMeasurementsByType(wpd.AreaMeasurement)[0];
            let axesColl = plotData.getAxesColl();
            if (axIdx == -1) {
                plotData.setAxesForMeasurement(ms, null);
            } else {
                plotData.setAxesForMeasurement(ms, axesColl[axIdx]);
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
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        wpd.graphicsWidget.forceHandlerRepaint();
        activeMode = mode;
    }

    function addItem() {
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(activeMode));
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(activeMode));
    }

    function deleteItem() {
        wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(activeMode));
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(activeMode));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
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