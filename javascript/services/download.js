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

function download(filename, text, type) {
    var element = document.createElement('a');

    element.href = window.URL.createObjectURL(new Blob([text], {type: type}));
    element.download = filename;
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

wpd.download = (function() {
    
    function textFile(data, filename, format) {
        var formContainer,
            formElement,
            formData,
            formFilename,
            jsonData = data;

        filename = stripIllegalCharacters(filename);
        var type;
        switch (format) {
            case 'json':
                type = 'application/json';
                filename = filename + '.json';
                break;
            case 'csv':
                type = 'text/csv';
                filename = filename + '.csv';
                data = JSON.parse(data);
                break;
            default:
                throw new Error(format + ' is not a valid format');
                break;
        }
        
        var element = document.createElement('a');
        element.href = URL.createObjectURL(new Blob([data], {type: type}));
        element.download = filename;
        
        element.style.display = 'none';
        document.body.appendChild(element);
        
        element.click();
        
        document.body.removeChild(element);
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
