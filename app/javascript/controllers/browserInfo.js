/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2024 Ankit Rohatgi <plots@automeris.io>

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

// browserInfo.js - browser and available HTML5 feature detection
var wpd = wpd || {};
wpd.browserInfo = (function() {
    function checkBrowser() {
        if (!window.FileReader || typeof WebAssembly !== "object" || !("download" in document.createElement("a"))) {
            alert(
                'WARNING!\nYour web browser may not be fully supported. Please use a recent version of Google Chrome, Firefox or Safari browser with HTML5 and WebAssembly support.');
        }
    }

    function isElectronBrowser() {
        if (typeof process === 'undefined') { // there's probably a much better way to do this!
            return false;
        }
        return true;
    }

    return {
        checkBrowser: checkBrowser,
        isElectronBrowser: isElectronBrowser
    };
})();