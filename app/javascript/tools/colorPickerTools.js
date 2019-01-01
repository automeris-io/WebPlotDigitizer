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

wpd.ColorPickerTool = (function() {
    var Tool = function() {
        var ctx = wpd.graphicsWidget.getAllContexts();

        this.onMouseClick = function(ev, pos, imagePos) {
            var ir, ig, ib, ia, pixData;

            pixData = ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
            ir = pixData.data[0];
            ig = pixData.data[1];
            ib = pixData.data[2];
            ia = pixData.data[3];
            if (ia === 0) { // for transparent color, assume white RGB
                ir = 255;
                ig = 255;
                ib = 255;
            }
            this.onComplete([ir, ig, ib]);
        };

        this.onComplete = function(col) {};
    };
    return Tool;
})();

wpd.ColorFilterRepainter = (function() {
    var Painter = function() {
        this.painterName = 'colorFilterRepainter';

        this.onRedraw = function() {
            var autoDetector = wpd.appData.getPlotData().getAutoDetector();
            wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData, autoDetector.mask);
        };
    };
    return Painter;
})();