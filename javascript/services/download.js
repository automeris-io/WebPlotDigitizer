/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2015 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.download = (function() {
    
    function textFile(data, format) {
        var formContainer,
            formElement,
            formData,
            jsonData = data;
        
        // Create a hidden form and submit
        formContainer = document.createElement('div'),
        formElement = document.createElement('form'),
        formData = document.createElement('textarea');

        formElement.setAttribute('method', 'post');

        if(format === 'json') {
            formElement.setAttribute('action', 'php/json.php');
        } else if (format === 'csv') {
            formElement.setAttribute('action', 'php/csvexport.php');
        }

        formData.setAttribute('name', "data");
        formData.setAttribute('id', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        formData.innerHTML = jsonData;
        formElement.submit();
        document.body.removeChild(formContainer);
    }

    function json(jsonData) {
        textFile(jsonData, 'json');
    }

    function csv(csvData) {
        textFile(csvData, 'csv');
    }

    return {
        json: json,
        csv: csv
    };
})();
