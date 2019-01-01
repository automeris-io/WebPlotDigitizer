/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.transformationEquations = (function() {
    function show() {
        wpd.popup.show('axes-transformation-equations-window');

        let $list = document.getElementById('axes-transformation-equation-list');
        let listHTML = '';
        let axes = wpd.tree.getActiveAxes();
        let eqns = axes.getTransformationEquations();

        listHTML += '<p><b>Axes Type</b>: ';
        if (axes instanceof wpd.XYAxes) {
            listHTML += 'XY</p>';
        } else if (axes instanceof wpd.PolarAxes) {
            listHTML += 'Polar</p>';
        } else if (axes instanceof wpd.TernaryAxes) {
            listHTML += 'Ternary</p>';
        } else if (axes instanceof wpd.MapAxes) {
            listHTML += 'Map</p>';
        } else if (axes instanceof wpd.ImageAxes) {
            listHTML += 'Image</p>';
        }

        if (eqns.pixelToData != null) {
            listHTML += '<p><b>Pixel to Data</b></p><ol>';
            for (let i = 0; i < eqns.pixelToData.length; i++) {
                listHTML += '<li><p class="footnote">' + eqns.pixelToData[i] + "</p></li>";
            }
            listHTML += '</ol>';
        }

        listHTML += '<p>&nbsp;</p>';

        if (eqns.dataToPixel != null) {
            listHTML += '<p><b>Data to Pixel</b></p><ol>';
            for (i = 0; i < eqns.dataToPixel.length; i++) {
                listHTML += '<li><p class="footnote">' + eqns.dataToPixel[i] + "</p></li>";
            }
            listHTML += '</ol>';
        }

        $list.innerHTML = listHTML;
    }
    return {
        show: show
    };
})();