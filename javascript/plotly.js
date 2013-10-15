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

/* This file contains code to export CSV data to an external software called Plotly (http://plot.ly) */


/* Dump the contents of the global variable displayData into Plotly
*/
function exportToPlotly() {

	if(pointsPicked === 0) return;

	var dataDump = '',
		urlBase = 'http://plot.ly/plot?csv=';

	if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			dataDump = dataDump + formatVariableForPlotly(displayData[ii][0], 'X') + ',' + formatVariableForPlotly(displayData[ii][1], 'Y') + '\n';
		}
	} else if((plotType === 'ternary')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			dataDump = dataDump + displayData[ii][0] + ',' + displayData[ii][1] + ',' + displayData[ii][2] + '\n';
		}
	}
	
	window.open(urlBase + encodeURIComponent(dataDump), '_plotly');
}

function formatVariableForPlotly(val, variableType) {
	var formatString = 'mm-dd-yyyy';

	if(plotType === 'XY') {
		if(variableType === 'X' && axesAlignmentData[6]) {
			return dateConverter.formatDate(dateConverter.fromJD(val), formatString);			
		}
		if(variableType === 'Y' && axesAlignmentData[7]) {
			return dateConverter.formatDate(dateConverter.fromJD(val), formatString);
		}
	}
	return val;
}

