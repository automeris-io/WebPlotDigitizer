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

	var formContainer = document.createElement('div'),
		formElement = document.createElement('form'),
		formData = document.createElement('input');
	
	
	formElement.setAttribute('method', 'post');
	formElement.setAttribute('action', 'https://plot.ly/external');
	formElement.setAttribute('target', '_blank');
	
	formData.setAttribute('type', "text");
	formData.setAttribute('name', "data");

	formElement.appendChild(formData);
	formContainer.appendChild(formElement);
	document.body.appendChild(formContainer);
	formContainer.style.display = 'none';


	var xDisplayData = [],
		yDisplayData = [],
		zDisplayData = [],
		jsonData = { data: [] };
	
	if((plotType === 'XY') || (plotType === 'map') || (plotType === 'polar') || (plotType === 'image')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			xDisplayData[ii] = formatVariableForPlotly(displayData[ii][0], 'X');
			yDisplayData[ii] = formatVariableForPlotly(displayData[ii][1], 'Y');
		}
		jsonData.data[0] = {x: xDisplayData, y: yDisplayData};

	} else if((plotType === 'ternary')) {
		for(var ii = 0; ii < pointsPicked; ii++) {
			xDisplayData[ii] = displayData[ii][0];
			yDisplayData[ii] = displayData[ii][1];
			zDisplayData[ii] = displayData[ii][2];
		}
		jsonData.data[0] = {x: xDisplayData, y: yDisplayData, z: zDisplayData};
	}

	formData.setAttribute('value', JSON.stringify(jsonData));

	formElement.submit();

	document.body.removeChild(formContainer);
}

function formatVariableForPlotly(val, variableType) {
	var formatString = 'yyyy-mm-dd';

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
