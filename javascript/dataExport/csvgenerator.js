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
wpd.CSVExport = (function () {

    var rawCSVData,
        displayData = [];

    // Generate CSV.
    function generateCSV() {

        if((axesPicked === 1) && (pointsPicked >= 1)) {
            wpd.popup.show('csvWindow');
                
            rawCSVData = pixelToData(xyData, pointsPicked, plotType);

            var dataSortOrder = document.getElementById('dataSortOrder'),
                dataSortOption = document.getElementById('dataSortOption'),
                variableNames = document.getElementById('dataVariables');

            dataSortOption.innerHTML = '<option value="raw">Raw Output</option>';

            if( (plotType === 'XY') || (plotType === 'map') || (plotType === 'image')) {

                dataSortOption.innerHTML += '<option value="0">x</option>';
                dataSortOption.innerHTML += '<option value="1">y</option>';
                variableNames.innerHTML = 'x, y';

            } else if ( (plotType === 'ternary') ) {

                dataSortOption.innerHTML += '<option value="0">a</option>';
                dataSortOption.innerHTML += '<option value="1">b</option>';
                dataSortOption.innerHTML += '<option value="2">c</option>';
                variableNames.innerHTML = 'a, b, c';

            } else if ( (plotType === 'polar') ) {

                dataSortOption.innerHTML += '<option value="0">r</option>';
                dataSortOption.innerHTML += '<option value="1">Θ</option>';
                variableNames.innerHTML = 'r, Θ';
            }

            dataSortOption.innerHTML += '<option value="NearestNeighbor">Nearest Neighbor</option>';

            updateCSVSortingControls();

            var dateFormattingEl = document.getElementById('csvDateFormatting');
            if(plotType === 'XY') {
                if((axesAlignmentData[6] === true || axesAlignmentData[7] === true)) {
                    dateFormattingEl.style.display = 'inline-block';

                    var xDateFormattingEl = document.getElementById('csvDateFormattingX');
                    var yDateFormattingEl = document.getElementById('csvDateFormattingY');
                    var xDateFormatEl = document.getElementById('xDateFormat');
                    var yDateFormatEl = document.getElementById('yDateFormat');

                    if(axesAlignmentData[6]) {
                        xDateFormattingEl.style.display = 'inline-block';
                        xDateFormatEl.value = axesAlignmentData[8];
                    } else {	
                        xDateFormattingEl.style.display = 'none';
                    }

                    if(axesAlignmentData[7]) {
                        yDateFormattingEl.style.display = 'inline-block';
                        yDateFormat.value = axesAlignmentData[9];
                    } else {	
                        yDateFormattingEl.style.display = 'none';
                    }
                } else {
                    dateFormattingEl.style.display = 'none';
                }
            } else {
                dateFormattingEl.style.display = 'none';
            }
            
            generateCSVTextFromData(rawCSVData);
        }
     }

     /**
      * Select all data in text area.
      */
     function selectAllCSVData() {
        var tarea = document.getElementById('tarea');
        tarea.focus();
        tarea.select();
     }

    /**
     * Update CSV sorting controls.
     */
    function updateCSVSortingControls() {
        var dataSortOption = document.getElementById('dataSortOption'),
            dataSortOrder = document.getElementById('dataSortOrder');
        
        if(dataSortOption.value === 'NearestNeighbor' || dataSortOption.value === 'raw') {
            dataSortOrder.setAttribute('disabled', true);	
        } else {
            dataSortOrder.removeAttribute('disabled');
        }

        reSortCSV();
    }

    /**
     * Dump data to the CSV text area
     */
    function generateCSVTextFromData(retData) {

        var tarea = document.getElementById('tarea');
            tarea.value = '';

        if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
            for(var ii = 0; ii < pointsPicked; ii++) {
                tarea.value = tarea.value + formatVariableInCSV(retData[ii][0], 'X') + ',' + formatVariableInCSV(retData[ii][1], 'Y') + '\n';
            }
        } else if((plotType === 'ternary')) {
            for(var ii = 0; ii < pointsPicked; ii++) {
                tarea.value = tarea.value + retData[ii][0] + ',' + retData[ii][1] + ',' + retData[ii][2] + '\n';
            }
        }

        displayData = retData;
    }

    /**
     * Format variable 
     */
    function formatVariableInCSV(val, variableType) {
        if(plotType === 'XY') {
            if(variableType === 'X' && axesAlignmentData[6]) {
                var xDateFormatEl = document.getElementById('xDateFormat');
                return dateConverter.formatDate(dateConverter.fromJD(val), xDateFormatEl.value);			
            }
            if(variableType === 'Y' && axesAlignmentData[7]) {
                var yDateFormatEl = document.getElementById('yDateFormat');
                return dateConverter.formatDate(dateConverter.fromJD(val), yDateFormatEl.value);
            }
        }
        return val;
    }

    /**
     * Resort data
     */
    function reSortCSV() {
        var dataSortOption = document.getElementById('dataSortOption'),
            dataSortOrder = document.getElementById('dataSortOrder'),
            
            isAscending = dataSortOrder.value === 'ascending',
            isRaw = dataSortOption.value == 'raw',
            isConnectivity = dataSortOption.value === 'NearestNeighbor',
            dataIndex,
            sortedData = rawCSVData.slice(0),
            plotDim = (plotType === 'ternary') ? 3 : 2;

        if(isRaw) {
            generateCSVTextFromData(sortedData);
            return;
        }

        if(!isConnectivity) {
            dataIndex = parseInt(dataSortOption.value, 10);
            if((dataIndex < 0) || (dataIndex >= 3)) return;

            sortedData.sort(function(a,b) {
                if(a[dataIndex] > b[dataIndex]) {
                    return isAscending ? 1 : -1;
                } else if (a[dataIndex] < b[dataIndex]) {
                    return isAscending ? -1 : 1;
                }
                return 0;			
            });

            generateCSVTextFromData(sortedData);
            return;
        }

        if(isConnectivity) {
            var mindist, compdist, minindex,
                swapVariable = [1.0, 1.0, 1.0];

            for(var ii = 0; ii < pointsPicked-1; ii++) {
                minindex = -1;

                for(var jj = ii + 1; jj < pointsPicked; jj++) {
                    compdist = (sortedData[ii][0] - sortedData[jj][0])*(sortedData[ii][0] - sortedData[jj][0]) + 
                                (sortedData[ii][1] - sortedData[jj][1])*(sortedData[ii][1] - sortedData[jj][1]);
                    if(plotDim === 3) {
                        compdist += (sortedData[ii][2] - sortedData[jj][2])*(sortedData[ii][2] - sortedData[jj][2]);
                    }
                    if((compdist < mindist) || (minindex === -1)) {
                        mindist = compdist;
                        minindex = jj;
                    }
                }

                swapVariable[0] = sortedData[minindex][0];
                sortedData[minindex][0] = sortedData[ii+1][0];
                sortedData[ii+1][0] = swapVariable[0];

                swapVariable[1] = sortedData[minindex][1];
                sortedData[minindex][1] = sortedData[ii+1][1];
                sortedData[ii+1][1] = swapVariable[1];

                if(plotDim === 3) {
                    swapVariable[2] = sortedData[minindex][2];
                    sortedData[minindex][2] = sortedData[ii+1][2];
                    sortedData[ii+1][2] = swapVariable[2];
                }
            }

            generateCSVTextFromData(sortedData);
            return;
        }

       
    }

    function getDisplayData() {
        return displayData;
    }


    return {
        generate: generateCSV,
        reSort: reSortCSV,
        updateSortingControls: updateCSVSortingControls,
        selectAll: selectAllCSVData,
        getDisplayData: getDisplayData
    };

})();

