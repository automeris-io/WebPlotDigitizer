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

// calibration info
wpd.Calibration = class {

    constructor(dim) {
        this._dim = dim;
        this._px = [];
        this._py = [];
        this._dimensions = dim == null ? 2 : dim;
        this._dp = [];
        this._selections = [];

        // public:
        this.labels = [];
        this.labelPositions = [];
        this.maxPointCount = 0;
    }

    getCount() {
        return this._px.length;
    }

    getDimensions() {
        return this._dimensions;
    }

    addPoint(pxi, pyi, dxi, dyi, dzi) {
        let plen = this._px.length;
        let dlen = this._dp.length;
        this._px[plen] = pxi;
        this._py[plen] = pyi;
        this._dp[dlen] = dxi;
        this._dp[dlen + 1] = dyi;
        if (this._dimensions === 3) {
            this._dp[dlen + 2] = dzi;
        }
    }

    getPoint(index) {
        if (index < 0 || index >= this._px.length)
            return null;

        return {
            px: this._px[index],
            py: this._py[index],
            dx: this._dp[this._dimensions * index],
            dy: this._dp[this._dimensions * index + 1],
            dz: this._dimensions === 2 ? null : this._dp[this._dimensions * index + 2]
        };
    }

    changePointPx(index, npx, npy) {
        if (index < 0 || index >= this._px.length) {
            return;
        }
        this._px[index] = npx;
        this._py[index] = npy;
    }

    setDataAt(index, dxi, dyi, dzi) {
        if (index < 0 || index >= this._px.length)
            return;
        this._dp[this._dimensions * index] = dxi;
        this._dp[this._dimensions * index + 1] = dyi;
        if (this._dimensions === 3) {
            this._dp[this._dimensions * index + 2] = dzi;
        }
    }

    findNearestPoint(x, y, threshold) {
        threshold = (threshold == null) ? 50 : parseFloat(threshold);
        let minDist = 0;
        let minIndex = -1;

        for (let i = 0; i < this._px.length; i++) {
            let dist = Math.sqrt((x - this._px[i]) * (x - this._px[i]) +
                (y - this._py[i]) * (y - this._py[i]));
            if ((minIndex < 0 && dist <= threshold) || (minIndex >= 0 && dist < minDist)) {
                minIndex = i;
                minDist = dist;
            }
        }
        return minIndex;
    }

    selectPoint(index) {
        if (this._selections.indexOf(index) < 0) {
            this._selections.push(index);
        }
    }

    selectNearestPoint(x, y, threshold) {
        let minIndex = this.findNearestPoint(x, y, threshold);
        if (minIndex >= 0) {
            this.selectPoint(minIndex);
        }
    }

    getSelectedPoints() {
        return this._selections;
    }

    unselectAll() {
        this._selections = [];
    }

    isPointSelected(index) {
        return this._selections.indexOf(index) >= 0;
    }

    dump() {
        console.log(this._px);
        console.log(this._py);
        console.log(this._dp);
    }
};
