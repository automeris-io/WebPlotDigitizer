/*
    WebPlotDigitizer - web based chart data extraction software (and more)
    
    Copyright (C) 2025 Ankit Rohatgi

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/

var wpd = wpd || {};
wpd.toolbar = (function() {
    function show(tbid) { // Shows a specific toolbar
        clear();
        let tb = document.getElementById(tbid);
        tb.style.display = "inline-block";
    }

    function clear() { // Clears all open toolbars
        const toolbarList = document.getElementsByClassName('toolbar');
        for (let ii = 0; ii < toolbarList.length; ii++) {
            if (toolbarList[ii].classList.contains("permanent-toolbar")) {
                // skip permanent toolbars
                continue;
            }
            toolbarList[ii].style.display = "none";
        }
    }

    return {
        show: show,
        clear: clear
    };
})();
