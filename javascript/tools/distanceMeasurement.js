/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2014 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var wpd = wpd || {};

wpd.distanceMeasurement = (function () {

    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        var plotData = wpd.appData.getPlotData();
        if (plotData.distanceMeasurementData == null) {
            plotData.distanceMeasurementData = new wpd.ConnectedPoints(2);
        }
        wpd.sidebar.show('measure-distances-sidebar');
    }

    function addPair() {
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('distance'));
    }

    function deletePair() {
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool('distance'));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.appData.getPlotData().distanceMeasurementTool = new wpd.ConnectedPoints(2);
    }

    return {
        start: start,
        addPair: addPair,
        deletePair: deletePair,
        clearAll: clearAll
    };
})();

wpd.angleMeasurement = (function () {
    function start() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        var plotData = wpd.appData.getPlotData();
        if (plotData.angleMeasurementData == null) {
            plotData.angleMeasurementData = new wpd.ConnectedPoints(3);
        }
        wpd.sidebar.show('measure-angles-sidebar');
    }

    function addAngle() {
        wpd.graphicsWidget.setTool(new wpd.AddMeasurementTool('angle'));
    }

    function deleteAngle() {
        wpd.graphicsWidget.setTool(new wpd.DeleteMeasurementTool('angle'));
    }

    function clearAll() {
        wpd.graphicsWidget.removeTool();
        wpd.graphicsWidget.resetData();
        wpd.appData.getPlotData().angleMeasurementTool = new wpd.ConnectedPoints(3);
    }

    return {
        start: start,
        addAngle: addAngle,
        deleteAngle: deleteAngle,
        clearAll: clearAll 
    };
})();

wpd.AddMeasurementTool = (function () {
    var Tool = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData(),
            
            pointsCaptured = 0,
            isCapturing = true,
            plist = [],
            maxPts = isDistanceMode ? 2 : 3;

        this.onAttach = function () {
            var btnId = (isDistanceMode === true) ? 'add-pair-button' : 'add-angle-button';
            document.getElementById(btnId).classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        };

        this.onRemove = function () {
            var btnId = (isDistanceMode === true) ? 'add-pair-button' : 'add-angle-button';
            document.getElementById(btnId).classList.remove('pressed-button');
        };

        this.onMouseClick = function (ev, pos, imagePos) {
            if(isCapturing) {

                wpd.graphicsWidget.resetHover();

                plist[pointsCaptured*2] = imagePos.x;
                plist[pointsCaptured*2 + 1] = imagePos.y;
                pointsCaptured = pointsCaptured + 1;

                if(pointsCaptured === maxPts) {
                    isCapturing = false;

                    if(isDistanceMode) {
                        plotData.distanceMeasurementData.addConnection(plist);
                    } else {
                        plotData.angleMeasurementData.addConnection(plist);
                    }
                }

                if(pointsCaptured > 1) {
                    // draw line from previous point to current
                    var prevScreenPx = wpd.graphicsWidget.screenPx(plist[(pointsCaptured-2)*2], plist[(pointsCaptured-2)*2 + 1]);
                    ctx.dataCtx.beginPath();
                    ctx.dataCtx.strokeStyle = "rgb(0,0,0)";
                    ctx.dataCtx.moveTo(prevScreenPx.x, prevScreenPx.y);
                    ctx.dataCtx.lineTo(pos.x, pos.y);
                    ctx.dataCtx.stroke();

                    ctx.oriDataCtx.beginPath();
                    ctx.oriDataCtx.strokeStyle = "rgb(0,0,0)";
                    ctx.oriDataCtx.moveTo(plist[(pointsCaptured-2)*2], plist[(pointsCaptured-2)*2 + 1]);
                    ctx.oriDataCtx.lineTo(imagePos.x, imagePos.y);
                    ctx.oriDataCtx.stroke();
                }

                // draw current point
                ctx.dataCtx.beginPath();
                ctx.dataCtx.fillStyle = "rgb(200, 0, 0)";
                ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
                ctx.dataCtx.fill();

                ctx.oriDataCtx.beginPath();
    	    	ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	        	ctx.oriDataCtx.arc(imagePos.x, imagePos.y, 3, 0, 2.0*Math.PI, true);
	    	    ctx.oriDataCtx.fill();

            }
            wpd.graphicsWidget.updateZoomOnEvent(ev); 
        };

        this.onMouseMove = function (ev, pos, imagePos) {
            // if isCapturing and pointsCaptured > 1
            // then clear previous hover lines and show a hover line to the current mouse position
            if(isCapturing && pointsCaptured >= 1) {
                wpd.graphicsWidget.resetHover();
                var prevScreenPx = wpd.graphicsWidget.screenPx(plist[(pointsCaptured-1)*2], plist[(pointsCaptured-1)*2 + 1]);

                ctx.hoverCtx.beginPath();
                ctx.hoverCtx.strokeStyle = "rgb(0,0,0)";
                ctx.hoverCtx.moveTo(prevScreenPx.x, prevScreenPx.y);
                ctx.hoverCtx.lineTo(pos.x, pos.y);
                ctx.hoverCtx.stroke();
            }
        };

        this.onKeyDown = function (ev) {

        };

    };
    return Tool;
})();

wpd.DeleteMeasurementTool = (function () {
    var Tool = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onAttach = function () {
            var btnId = (isDistanceMode === true) ? 'delete-pair-button' : 'delete-angle-button';
            document.getElementById(btnId).classList.add('pressed-button');
            wpd.graphicsWidget.setRepainter(new wpd.MeasurementRepainter(mode));
        };

        this.onRemove = function () {
            var btnId = (isDistanceMode === true) ? 'delete-pair-button' : 'delete-angle-button';
            document.getElementById(btnId).classList.remove('pressed-button');
        };

    };
    return Tool;
})();

wpd.MeasurementRepainter = (function () {
    var Painter = function (mode) {
        var isDistanceMode = mode === 'distance',
            isAngleMode = mode === 'angle',
            ctx = wpd.graphicsWidget.getAllContexts();

        this.painterName = 'measurementRepainter-'+mode;

        this.onAttach = function () {
            wpd.graphicsWidget.resetData();
        };

        this.onRedraw = function () {
        };

        this.onForcedRedraw = function () {
            wpd.graphicsWidget.resetData();
        };
    };
    return Painter;
})();
