/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2019 Ankit Rohatgi <ankitrohatgi@hotmail.com>

    This file is part of WebPlotDigitizer.

    WebPlotDIgitizer is free software: you can redistribute it and/or modify
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

// Data from a series
wpd.Dataset = class {
    constructor(dim) {
        this._dim = dim;
        this._dataPoints = [];
        this._connections = [];
        this._selections = [];
        this._hasMetadata = false;
        this._mkeys = [];

        // public:
        this.name = "Defaut Dataset";
        this.variableNames = ['x', 'y'];
        this.colorRGB = new wpd.Color(200, 0, 0);
    }

    hasMetadata() {
        return this._hasMetadata;
    }

    setMetadataKeys(metakeys) {
        this._mkeys = metakeys;
    }

    getMetadataKeys() {
        return this._mkeys;
    }

    addPixel(pxi, pyi, mdata) {
        let dlen = this._dataPoints.length;
        this._dataPoints[dlen] = {
            x: pxi,
            y: pyi,
            metadata: mdata
        };
        if (mdata != null) {
            this._hasMetadata = true;
        }
    }

    getPixel(index) {
        return this._dataPoints[index];
    }

    setPixelAt(index, pxi, pyi) {
        if (index < this._dataPoints.length) {
            this._dataPoints[index].x = pxi;
            this._dataPoints[index].y = pyi;
        }
    }

    setMetadataAt(index, mdata) {
        if (index < this._dataPoints.length) {
            this._dataPoints[index].metadata = mdata;
        }
    }

    insertPixel(index, pxi, pyi, mdata) {
        this._dataPoints.splice(index, 0, {
            x: pxi,
            y: pyi,
            metadata: mdata
        });
    }

    removePixelAtIndex(index) {
        if (index < this._dataPoints.length) {
            this._dataPoints.splice(index, 1);
        }
    }

    removeLastPixel() {
        let pIndex = this._dataPoints.length - 1;
        removePixelAtIndex(pIndex);
    }

    findNearestPixel(x, y, threshold) {
        threshold = (threshold == null) ? 50 : parseFloat(threshold);
        let minDist = 0,
            minIndex = -1;
        for (let i = 0; i < this._dataPoints.length; i++) {
            let dist = Math.sqrt((x - this._dataPoints[i].x) * (x - this._dataPoints[i].x) +
                (y - this._dataPoints[i].y) * (y - this._dataPoints[i].y));
            if ((minIndex < 0 && dist <= threshold) || (minIndex >= 0 && dist < minDist)) {
                minIndex = i;
                minDist = dist;
            }
        }
        return minIndex;
    }

    removeNearestPixel(x, y, threshold) {
        let minIndex = this.findNearestPixel(x, y, threshold);
        if (minIndex >= 0) {
            this.removePixelAtIndex(minIndex);
        }
    }

    clearAll() {
        this._dataPoints = [];
        this._hasMetadata = false;
        this._mkeys = [];
    }

    getCount() {
        return this._dataPoints.length;
    }

    selectPixel(index) {
        if (this._selections.indexOf(index) >= 0) {
            return;
        }
        this._selections.push(index);
    }

    unselectAll() {
        this._selections = [];
    }

    selectNearestPixel(x, y, threshold) {
        let minIndex = this.findNearestPixel(x, y, threshold);
        if (minIndex >= 0) {
            this.selectPixel(minIndex);
        }
        return minIndex;
    }

    selectNextPixel() {
        for (let i = 0; i < this._selections.length; i++) {
            this._selections[i] = (this._selections[i] + 1) % this._dataPoints.length;
        }
    }

    selectPreviousPixel() {
        for (let i = 0; i < this._selections.length; i++) {
            let newIndex = this._selections[i];
            if (newIndex === 0) {
                newIndex = this._dataPoints.length - 1;
            } else {
                newIndex = newIndex - 1;
            }
            this._selections[i] = newIndex;
        }
    }

    getSelectedPixels() {
        return this._selections;
    }
};