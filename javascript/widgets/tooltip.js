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

wpd.tooltip = (function() {

    let $tooltip = null;

    function showTooltip(event) {
        const $e = event.target;
        const tip = $e.dataset.tooltip;
        if (tip != null && tip != "" && $tooltip != null) {
            const rect = $e.getBoundingClientRect();
            let x = rect.x + 5;
            let y = rect.bottom + 5;
            $tooltip.style.display = 'inline-block';
            $tooltip.innerHTML = tip;
            if ($tooltip.clientWidth + x > window.innerWidth) {
                x = rect.right - $tooltip.clientWidth + 5;
            }
            $tooltip.style.top = y + 'px';
            $tooltip.style.left = x + 'px';
        }
    }

    function hideTooltip() {
        $tooltip.style.display = 'none';
    }

    function init() {
        $tooltip = document.getElementById('wpd-tooltip');
        const $elems = document.querySelectorAll(".has-tooltip");
        for (let $e of $elems) {
            $e.addEventListener("mouseenter", showTooltip);
            $e.addEventListener("mouseleave", hideTooltip);
        }
    }

    return {
        init: init
    };
})();
