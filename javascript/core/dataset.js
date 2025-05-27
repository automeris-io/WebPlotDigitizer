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

// Data from a series
wpd.Dataset = class {
    constructor(dim) {
        this._dim = dim;
        this._dataPoints = [];
        this._connections = [];
        this._selections = [];
        this._pixelMetadataCount = 0;
        this._pixelMetadataKeys = [];
        this._metadata = {};
        this._groupNames = []; // point group names
        // _tuples is an array of arrays
        // each inner array contains pixel indexes, indexed by group indexes
        this._tuples = [];

        // public:
        this.name = 'Default Dataset';
        this.variableNames = ['x', 'y'];
        this.colorRGB = new wpd.Color(200, 0, 0);
    }

    hasMetadata() {
        return this._pixelMetadataCount > 0;
    }

    setMetadataKeys(metakeys) {
        this._pixelMetadataKeys = metakeys;
    }

    getMetadataKeys() {
        return this._pixelMetadataKeys;
    }

    addPixel(pxi, pyi, mdata) {
        let dlen = this._dataPoints.length;
        this._dataPoints[dlen] = {
            x: pxi,
            y: pyi,
            metadata: mdata
        };
        if (mdata != null) {
            this._pixelMetadataCount++;
        }
        return dlen;
    }

    getPixel(index) {
        return this._dataPoints[index];
    }

    getAllPixels() {
        return this._dataPoints;
    }

    setPixelAt(index, pxi, pyi) {
        if (index < this._dataPoints.length) {
            this._dataPoints[index].x = pxi;
            this._dataPoints[index].y = pyi;
        }
    }

    setMetadataAt(index, mdata) {
        if (index < this._dataPoints.length) {
            if (mdata != null) {
                if (this._dataPoints[index].metadata == null) {
                    this._pixelMetadataCount++;
                }
            } else {
                if (this._dataPoints[index].metadata != null) {
                    this._pixelMetadataCount--;
                }
            }
            this._dataPoints[index].metadata = mdata;
        }
    }

    insertPixel(index, pxi, pyi, mdata) {
        this._dataPoints.splice(index, 0, {
            x: pxi,
            y: pyi,
            metadata: mdata
        });
        if (mdata != null) {
            this._pixelMetadataCount++;
        }
    }

    removePixelAtIndex(index) {
        if (index < this._dataPoints.length) {
            if (this._dataPoints[index].metadata != null) {
                this._pixelMetadataCount--;
            }
            this._dataPoints.splice(index, 1);
        }
    }

    removeLastPixel() {
        let pIndex = this._dataPoints.length - 1;
        this.removePixelAtIndex(pIndex);
        return pIndex;
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
        return minIndex;
    }

    clearAll() {
        this._dataPoints = [];
        this._pixelMetadataCount = 0;
        this._pixelMetadataKeys = [];
        this._metadata = {};
        this._groupNames = [];
        this._tuples = [];
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

    selectPixels(indexes) {
        for (let i = 0; i < indexes.length; i++) {
            this.selectPixel(indexes[i]);
        }
    }

    unselectAll() {
        this._selections = [];
    }

    selectPixelsInRectangle(p1, p2) {
        // define tester functions for each quadrant
        const tester = {
            ne: function(x, y) {
                return x >= p1.x && x <= p2.x && y >= p1.y && y <= p2.y;
            },
            se: function(x, y) {
                return x >= p1.x && x <= p2.x && y <= p1.y && y >= p2.y;
            },
            sw: function(x, y) {
                return x <= p1.x && x >= p2.x && y <= p1.y && y >= p2.y;
            },
            nw: function(x, y) {
                return x <= p1.x && x >= p2.x && y >= p1.y && y <= p2.y;
            }
        };

        // determine directional relationship between p1 and p2
        const xDirection = (p1.x - p2.x) > 0 ? -1 : 1;
        const yDirection = (p1.y - p2.y) > 0 ? 1 : -1;

        // pick tester function based on relationship between p1 and p2
        let direction = null;
        if (yDirection > 0) { // south
            if (xDirection > 0) { // east
                direction = 'se';
            } else { // west
                direction = 'sw';
            }
        } else { // north
            if (xDirection > 0) { // east
                direction = 'ne';
            } else { // west
                direction = 'nw';
            }
        }

        // go through each data point and test if coordinates are inside rectangle
        // defined by p1 and p2
        for (let index = 0; index < this._dataPoints.length; index++) {
            if (tester[direction](this._dataPoints[index].x, this._dataPoints[index].y)) {
                this.selectPixel(index);
            }
        }
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

    getPointGroups() {
        return this._groupNames;
    }

    setPointGroups(pointGroups) {
        this._groupNames = pointGroups;
    }

    hasPointGroups() {
        return this._groupNames.length > 0;
    }

    getPointGroupsCount() {
        return this._groupNames.length;
    }

    getPointGroupIndexInTuple(tupleIndex, pixelIndex) {
        if (this._tuples[tupleIndex]) {
            return this._tuples[tupleIndex].indexOf(pixelIndex);
        }
        return -1;
    }

    getPixelIndexesInGroup(groupIndex) {
        if (groupIndex < this._groupNames.length) {
            return this._tuples.map(tuple => tuple[groupIndex]);
        }
        return [];
    }

    removePointGroupFromTuples(groupIndex) {
        if (groupIndex < this._groupNames.length) {
            this._tuples.forEach(tuple => {
                tuple.splice(groupIndex, 1);
            });
        }
    }

    addTuple(pixelIndex) {
        if (!this._tuples.some(tuple => tuple[0] === pixelIndex)) {
            // create a new array of nulls
            const tuple = Array(this._groupNames.length).fill(null);
            tuple[0] = pixelIndex;
            this._tuples.push(tuple);

            // return last index
            return this._tuples.length - 1;
        }

        return null;
    }

    addEmptyTupleAt(tupleIndex) {
        // create an "empty" tuple if it doesn't already exist
        // "empty" here means filled with nulls
        if (!this._tuples[tupleIndex]) {
            this._tuples[tupleIndex] = Array(this._groupNames.length).fill(null);
        }
    }

    addToTupleAt(tupleIndex, groupIndex, pixelIndex) {
        if (!this._tuples[tupleIndex].includes(pixelIndex)) {
            this._tuples[tupleIndex][groupIndex] = pixelIndex;
        }
    }

    removeTuple(tupleIndex) {
        if (tupleIndex < this._tuples.length) {
            this._tuples.splice(tupleIndex, 1);
        }
    }

    removeFromTupleAt(tupleIndex, pixelIndex) {
        const groupIndex = this._tuples[tupleIndex].indexOf(pixelIndex);

        if (groupIndex > -1) {
            // set group to null for the tuple
            this._tuples[tupleIndex][groupIndex] = null;
        }
    }

    getTupleIndex(pixelIndex) {
        return this._tuples.findIndex(tuple => tuple.includes(pixelIndex));
    }

    getTuple(tupleIndex) {
        return this._tuples[tupleIndex];
    }

    getTupleCount() {
        return this._tuples.length;
    }

    getAllTuples() {
        return this._tuples;
    }

    isTupleEmpty(tupleIndex) {
        return this._tuples[tupleIndex].every(groupIndex => groupIndex === null);
    }

    refreshTuplesAfterGroupAdd(count) {
        this._tuples.forEach(tuple => tuple.push(...Array(count).fill(null)));
    }

    refreshTuplesAfterPixelRemoval(removedPixelIndex) {
        for (let tupleIndex = 0; tupleIndex < this._tuples.length; tupleIndex++) {
            const tuple = this._tuples[tupleIndex];

            for (let groupIndex = 0; groupIndex < tuple.length; groupIndex++) {
                if (tuple[groupIndex] !== null) {
                    if (tuple[groupIndex] === removedPixelIndex) {
                        // set to null
                        tuple[groupIndex] = null;
                    } else if (tuple[groupIndex] > removedPixelIndex) {
                        // decrement any index greater than the removed index
                        tuple[groupIndex]--;
                    }
                }
            }
        }
    }

    getMetadata() {
        // deep clone
        return JSON.parse(JSON.stringify(this._metadata));
    }

    setMetadata(obj) {
        // deep clone
        this._metadata = JSON.parse(JSON.stringify(obj));
    }
};
