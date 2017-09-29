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

wpd.measurementModes = {
    distance: {
        name: 'distance',
        connectivity: 2,
        addButtonId: 'add-pair-button',
        deleteButtonId: 'delete-pair-button',
        sidebarId: 'measure-distances-sidebar',
        init: function() {
            var plotData = wpd.appData.getPlotData();
            if(plotData.distanceMeasurementData == null) {
                plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
            }
        },
        clear: function() {
            var plotData = wpd.appData.getPlotData();
            plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
        },
        getData: function() {
            var plotData = wpd.appData.getPlotData();
            return plotData.distanceMeasurementData;
        }
    },
    angle: {
        name: 'angle',
        connectivity: 3,
        addButtonId: 'add-angle-button',
        deleteButtonId: 'delete-angle-button',
        sidebarId: 'measure-angles-sidebar',
        init: function() {
            var plotData = wpd.appData.getPlotData();
            if(plotData.angleMeasurementData == null) {
                plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
            }
        },
        clear: function() {
            var plotData = wpd.appData.getPlotData();
            plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
        },
        getData: function() {
            var plotData = wpd.appData.getPlotData();
            return plotData.angleMeasurementData;
        }
    },
    openPath: {
        name: 'open-path',
        connectivity: -1,
        addButtonId: 'add-open-path-button',
        deleteButtonId: 'delete-open-path-button',
        sidebarId: 'measure-open-path-sidebar',
        init: function() {
            var plotData = wpd.appData.getPlotData();
            if(plotData.openPathMeasurementData == null) {
                plotData.openPathMeasurementData = new wpd.ConnectedPoints();
            }
        },
        clear: function() {
            var plotData = wpd.appData.getPlotData();
            plotData.openPathMeasurementData = new wpd.ConnectedPoints();
        },
        getData: function() {
            var plotData = wpd.appData.getPlotData();
            return plotData.openPathMeasurementData;
        }
    },
    closedPath: {
        name: 'closed-path',
        connectivity: -1,
        addButtonId: 'add-closed-path-button',
        deleteButtonId: 'delete-closed-path-button',
        sidebarId: 'measure-closed-path-sidebar',
        init: function() {
            var plotData = wpd.appData.getPlotData();
            if(plotData.closedPathMeasurementData == null) {
                plotData.closedPathMeasurementData = new wpd.ConnectedPoints();
            }
        },
        clear: function() {
            var plotData = wpd.appData.getPlotData();
            plotData.closedPathMeasurementData = new wpd.ConnectedPoints();
        },
        getData: function() {
            var plotData = wpd.appData.getPlotData();
            return plotData.closedPathMeasurementData;
        }
    }
};

wpd.measurement = (function () {

    var activeMode;

    function start(mode) {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        mode.init();
        wpd.sidebar.show(mode.sidebarId);
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(mode));
        wpd.graphicsWidget.forceHandlerRepaint();
        activeMode = mode;
    }

    function addItem() {
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool(activeMode));
    }

    function deleteItem() {
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool(activeMode));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        activeMode.clear();
    }

    return {
        start: start,
        addItem: addItem,
        deleteItem: deleteItem,
        clearAll: clearAll
    };
})();