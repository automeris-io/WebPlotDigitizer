/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.acquireData = (function () {
    function load() {
        if(!wpd.appData.isAligned()) {
            wpd.popup.show('alignAxes');
        } else {
            wpd.sidebar.show('acquireDataSidebar');
            wpd.graphicsWidget.resetData();
            wpd.graphicsWidget.removeTool();
        }
    };

    function manualSelection() {
        var tool = new wpd.ManualSelectionTool();
        wpd.graphicsWidget.setTool(tool);
    };

    function deletePoint() {
        var tool = new wpd.DeleteDataPointTool();
        wpd.graphicsWidget.setTool(tool);
    };

    function clearAll() {
        wpd.appData.getPlotData().getActiveDataSeries().clearAll()
        wpd.graphicsWidget.resetData();
        wpd.dataPointCounter.setCount();
    };

    function undo() {
        wpd.appData.getPlotData().getActiveDataSeries().removeLastPixel();
        redrawData();
        wpd.dataPointCounter.setCount();
    };

    function redrawData() {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData(),
            activeDataSeries = plotData.getActiveDataSeries(),
            dindex,
            imagePos,
            pos;

        for(dindex = 0; dindex < activeDataSeries.getCount(); dindex++) {
            imagePos = activeDataSeries.getPixel(dindex);
            pos = wpd.graphicsWidget.screenPx(imagePos.x, imagePos.y);

            ctx.dataCtx.beginPath();
    		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.dataCtx.arc(parseInt(pos.x,10), parseInt(pos.y,10), 3, 0, 2.0*Math.PI, true);
		    ctx.dataCtx.fill();

            ctx.oriDataCtx.beginPath();
    		ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.oriDataCtx.arc(parseInt(imagePos.x,10), parseInt(imagePos.y,10), 3, 0, 2.0*Math.PI, true);
		    ctx.oriDataCtx.fill();
        }
    };

    return {
        load: load,
        manualSelection: manualSelection,
        deletePoint: deletePoint,
        clearAll: clearAll,
        undo: undo,
        redrawData: redrawData
    };
})();


wpd.ManualSelectionTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onRedraw = function() {
            wpd.acquireData.redrawData();
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries();
            activeDataSeries.addPixel(imagePos.x, imagePos.y);

            ctx.dataCtx.beginPath();
    		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.dataCtx.fill();

            ctx.oriDataCtx.beginPath();
    		ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.oriDataCtx.arc(parseInt(imagePos.x,10), parseInt(imagePos.y,10), 3, 0, 2.0*Math.PI, true);
		    ctx.oriDataCtx.fill();
            
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();
        };
    };
    return Tool;
})();


wpd.DeleteDataPointTool = (function () {
    var Tool = function () {
        var ctx = wpd.graphicsWidget.getAllContexts(),
            plotData = wpd.appData.getPlotData();

        this.onRedraw = function() {
            wpd.acquireData.redrawData();
        };

        this.onMouseClick = function(ev, pos, imagePos) {
            var activeDataSeries = plotData.getActiveDataSeries();
            activeDataSeries.deleteNearestPixel(imagePos.x, imagePos.y);
            wpd.acquireData.redrawData();
            wpd.graphicsWidget.updateZoomOnEvent(ev);
            wpd.dataPointCounter.setCount();
        };
    };
    return Tool;
})();


wpd.dataPointCounter = (function () {
    var $counter;

    function setCount() {
        if($counter == null) {
            $counter = document.getElementById('pointsStatus');
        }
        $counter.innerHTML = wpd.appData.getPlotData().getActiveDataSeries().getCount();
    }

    return {
        setCount: setCount
    };
})();

