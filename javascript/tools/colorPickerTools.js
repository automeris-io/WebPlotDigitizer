/*
    WebPlotDigitizer - web based chart data extraction software (and more)

    Copyright (C) 2026 Ankit Rohatgi

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

wpd.ColorPickerTool = class {
    constructor() {
        this._ctx = wpd.graphicsWidget.getAllContexts();
    }

    onMouseClick(ev, pos, imagePos) {
        const pixData = this._ctx.oriImageCtx.getImageData(imagePos.x, imagePos.y, 1, 1);
        let ir = pixData.data[0];
        let ig = pixData.data[1];
        let ib = pixData.data[2];
        const ia = pixData.data[3];
        if (ia === 0) { // for transparent color, assume white RGB
            ir = 255;
            ig = 255;
            ib = 255;
        }
        this.onComplete([ir, ig, ib]);
    }

    onComplete(col) {}
};

wpd.ColorFilterRepainter = class {
    constructor() {
        this.painterName = 'colorFilterRepainter';
    }

    onRedraw() {
        const ds = wpd.tree.getActiveDataset();
        const autoDetector = wpd.appData.getPlotData().getAutoDetectionDataForDataset(ds);
        wpd.colorSelectionWidget.paintFilteredColor(autoDetector.binaryData, autoDetector.mask);
    }

    onAttach() {
        wpd.graphicsWidget.resetData();
    }
};
