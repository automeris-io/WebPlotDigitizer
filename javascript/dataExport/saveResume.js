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
            imageData = appData.getPlotData().getAutoDetector().imageData,

            oReq = new XMLHttpRequest(),
            form = new FormData();

        oReq.open("POST", 'php/test.php', true);
        oReq.onload = function (oEvent) {
            console.log('done');
        };

        // var testObj = { x: [1, 2, 3, 4], y: [0, 1, 2], z: 'hello' };
        var blob = new Blob(BSON.serialize(imageData), {type: 'application/bson'});
        form.append('file.bson', blob, 'file.bson');
        oReq.send(form);
        

    }

    return {
        save: save
    };
})();
