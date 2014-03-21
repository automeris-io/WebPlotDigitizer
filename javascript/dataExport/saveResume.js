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

wpd.saveResume = (function () {

    function save() {
        // TRIAL CODE!!
        // None of this works...

        var appData = wpd.appData,
            //appDataBSON = BSON.serialize(appData),
            appDataJSON = JSON.stringify(appData.getPlotData().getAutoDetector().imageData),
            
            formContainer,
            formElement,
            formData;

        // Create a hidden form and submit
        formContainer = document.createElement('div'),
        formElement = document.createElement('form'),
        formData = document.createElement('input');

        formElement.setAttribute('method', 'post');
        //formElement.setAttribute('action', 'php/bson.php');
        formElement.setAttribute('action', 'php/bson.php');

        formData.setAttribute('type', "text");
        formData.setAttribute('name', "data");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';

        //formData.setAttribute('value', appDataBSON);
        formData.setAttribute('value', appDataJSON);

        formElement.submit();
        document.body.removeChild(formContainer);
    }

    return {
        save: save
    };
})();
