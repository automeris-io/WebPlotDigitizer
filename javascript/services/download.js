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
    
    function textFile(data, filename, format) {
        var formContainer,
            formElement,
            formData,
            formFilename,
            jsonData = data;
        
        // Create a hidden form and submit
        formContainer = document.createElement('div');
        formElement = document.createElement('form');
        formData = document.createElement('textarea');
        formFilename = document.createElement('input');
        formFilename.type = 'hidden';

        formElement.setAttribute('method', 'post');

        if(format === 'json') {
            formElement.setAttribute('action', 'php/json.php');
        } else if (format === 'csv') {
            formElement.setAttribute('action', 'php/csvexport.php');
        }

        formData.setAttribute('name', "data");
        formData.setAttribute('id', "data");
        formFilename.setAttribute('name', 'filename');
        formFilename.setAttribute('id', 'filename');
        formFilename.value = stripIllegalCharacters(filename);

        formElement.appendChild(formData);
        formElement.appendChild(formFilename);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        formData.innerHTML = jsonData;
        formElement.submit();
        document.body.removeChild(formContainer);
    }

    function json(jsonData, filename) {
        if(filename == null) {
            filename = 'wpd_plot_data';
        }
        textFile(jsonData, filename, 'json');
    }

    function csv(csvData, filename) {
        if(filename == null) {
            filename = 'data';
        }
        textFile(csvData, filename, 'csv');
    }

    function stripIllegalCharacters(filename) {
        return filename.replace(/[^a-zA-Z\d+\.\-_\s]/g,"_");
    }

    return {
        json: json,
        csv: csv
    };
})();
