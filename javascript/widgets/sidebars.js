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
wpd.sidebar = (function() {
    function show(sbid) { // Shows a specific sidebar
        clear();
        let sb = document.getElementById(sbid);
        sb.style.display = "inline-block";
        sb.style.height = parseInt(document.body.offsetHeight, 10) - 280 + 'px';
    }

    function clear() { // Clears all open sidebars

        const sidebarList = document.getElementsByClassName('sidebar');
        for (let ii = 0; ii < sidebarList.length; ii++) {
            sidebarList[ii].style.display = "none";
        }
    }

    function resize() {

        let sidebarList = document.getElementsByClassName('sidebar');
        for (let ii = 0; ii < sidebarList.length; ii++) {
            if (sidebarList[ii].style.display === "inline-block") {
                sidebarList[ii].style.height =
                    parseInt(document.body.offsetHeight, 10) - 280 + 'px';
            }
        }
    }

    return {
        show: show,
        clear: clear,
        resize: resize
    };
})();
