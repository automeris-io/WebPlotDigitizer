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

/* TODO: Insert data sorting algorithms.  */

/*
 * Generate CSV.
 */
 function generateCSV() {

    if((axesPicked === 1) && (pointsPicked >= 1)) {
        showPopup('csvWindow');
		var tarea = document.getElementById('tarea');
		tarea.value = '';
		
		var retData = pixelToData(xyData, pointsPicked, plotType);
		
		if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
		    for(var ii = 0; ii < pointsPicked; ii++) {
				tarea.value = tarea.value + retData[ii][0] + ',' + retData[ii][1] + '\n';
		    }
		} else if((plotType === 'ternary')) {
		    for(var ii = 0; ii < pointsPicked; ii++) {
				tarea.value = tarea.value + retData[ii][0] + ',' + retData[ii][1] + ',' + retData[ii][2] + '\n';
		    }
		}
    }
 }



