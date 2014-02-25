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

wpd.scriptInjector = (function () {
    var $scriptFileInput,
        $script;

    function start() {
        wpd.popup.show('runScriptPopup');
        if($scriptFileInput == null) {
            $scriptFileInput = document.getElementById('runScriptFileInput');
            $scriptFileInput.addEventListener("change", loadScript, false);
        }
    }

    function cancel() {
        wpd.popup.close('runScriptPopup');
    }

    function loadScript(ev) {
        wpd.popup.close('runScriptPopup');
        if(ev.target.files.length == 1) {
            var fileReader = new FileReader();
            fileReader.onload = function() {
                eval(fileReader.result);
                wpdscript.run();
            };
            fileReader.readAsText(ev.target.files[0]);
        }
    }

    function execScript() {
    }

    return {
        start: start,
        cancel: cancel,
        loadScript: loadScript,
        execScript: execScript
    };
})();
