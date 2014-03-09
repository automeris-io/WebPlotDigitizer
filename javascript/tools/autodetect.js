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
wpd.autoExtraction = (function () {

    function start() {
        wpd.sidebar.show('auto-extraction-sidebar');
        wpd.colorPicker.init();
        changeAlgorithm();
    }

    function changeAlgorithm() {
        var autoDetector = wpd.appData.getPlotData().getAutoDetector(),
            algoName = document.getElementById('auto-extract-algo-name').value;

        if(algoName === "averagingWindow") {
            autoDetector.algorithm = new wpd.AveragingWindowAlgo();
        }

        displayAlgoParameters(autoDetector.algorithm);
    }

    function displayAlgoParameters(algo) {
        var $paramContainer = document.getElementById('algo-parameter-container'),
            algoParams = algo.getParamList(),
            pi,
            tableString = "";

        
        for(pi = 0; pi < algoParams.length; pi++) {
            tableString += algoParams[pi][0] + 
                ' <input type="text" size=3 id="algo-param-' + pi + 
                '" class="algo-params" value="'+ algoParams[pi][2] + '"/> ' 
                + algoParams[pi][1];
            if(pi != algoParams.length - 1) {
                tableString += ', ';
            } 
        }
        tableString += "</table>";
        $paramContainer.innerHTML = tableString;
    }

    function runAlgo() {
        var algo = wpd.appData.getPlotData().getAutoDetector().algorithm,
            repainter = new wpd.DataPointsRepainter(),
            $paramFields = document.getElementsByClassName('algo-params'),
            pi,
            paramId, paramIndex;
        for(pi = 0; pi < $paramFields.length; pi++) {
            paramId = $paramFields[pi].id;
            paramIndex = parseInt(paramId.replace('algo-param-', ''), 10);
            algo.setParam(paramIndex, parseFloat($paramFields[pi].value));
        }
        wpd.graphicsWidget.setRepainter(repainter);
        algo.run(wpd.appData.getPlotData());
        wpd.graphicsWidget.forceHandlerRepaint();
        wpd.dataPointCounter.setCount();
    }
  
    return {
        start: start,
        changeAlgorithm: changeAlgorithm,
        runAlgo: runAlgo
    };
})();



