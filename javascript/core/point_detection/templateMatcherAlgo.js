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

wpd.TemplateMatcherAlgo = class {
    constructor() {
        this._wasRun = false;
        this._matchThreshold = 0.5;
        this._lastTemplate = null;
        this._oncompleteCallback = null;
        this._worker = null;
        this._seedPixel = {
            x: 0,
            y: 0
        };
    }

    getParamList(axes) {
        return {
            matchThreshold: ["Match Threshold", "Units", this._matchThreshold]
        }
    }

    setParams(params) {
        this._matchThreshold = parseFloat(params.matchThreshold);
    }

    setSeedPixel(seedPx) {
        this._seedPixel = {
            x: parseInt(seedPx.x, 10),
            y: parseInt(seedPx.y, 10)
        };
    }

    serialize() {
        return this._wasRun ? {
            algoType: "TemplateMatcherAlgo",
            matchThreshold: this._matchThreshold,
            lastTemplate: this._lastTemplate
        } : null;
    }

    setOnCompleteCallback(fn) {
        this._oncompleteCallback = fn;
    }

    deserialize(obj) {
        this._wasRun = true;
        this._matchThreshold = obj.matchThreshold;
        this._lastTemplate = obj.lastTemplate;
    }

    run(autoDetector, dataSeries, axes, imageData) {
        this._wasRun = true;
        dataSeries.clearAll();

        if (axes.dataPointsHaveLabels) {
            const mkeys = dataSeries.getMetadataKeys();
            if (mkeys == null || mkeys[0] !== 'label') {
                dataSeries.setMetadataKeys(['label']);
            }
        }

        // extract template based on seed pixel or bounding box
        let templ = null;
        if (this._lastTemplate != null) {
            templ = this.extractTemplateFromBBox(autoDetector, this._lastTemplate.originalBoundingBox);
        } else {
            templ = this.extractTemplate(autoDetector);
        }
        if (templ == null) {
            console.log("empty search template!");
            return;
        }

        const xOffset = -(templ.boundingBox.xmin + templ.boundingBox.xmax) / 2.0 + (templ.originalBoundingBox.xmin + templ.originalBoundingBox.xmax) / 2.0;
        const yOffset = -(templ.boundingBox.ymin + templ.boundingBox.ymax) / 2.0 + (templ.originalBoundingBox.ymin + templ.originalBoundingBox.ymax) / 2.0;
        // match this template
        this.cancel();
        this._worker = new Worker("javascript/core/point_detection/templateMatcherWorker.js");
        this._worker.postMessage({
            templ: templ,
            matchThreshold: this._matchThreshold,
            binaryData: autoDetector.binaryData,
            imageWidth: autoDetector.imageWidth,
            imageHeight: autoDetector.imageHeight,
        });
        this._worker.onmessage = (msg) => {
            const matches = msg.data;
            if (matches == null) {
                return;
            }
            if (matches.length > 0) {
                let matchIdx = 0;
                for (let match of matches) {
                    if (axes.dataPointsHaveLabels) {
                        dataSeries.addPixel(match[0] + xOffset, match[1] + yOffset, {
                            "label": "Bar" + matchIdx
                        });
                    } else {
                        dataSeries.addPixel(match[0] + xOffset, match[1] + yOffset);
                    }
                    matchIdx++;
                }
            }
            if (this._oncompleteCallback != null) {
                this._oncompleteCallback();
            }
        }
    }

    cancel() {
        if (this._worker != null) {
            this._worker.terminate();
        }
    }

    xy2idx(x, y) {
        return y * this.imageWidth + x;
    }

    inBounds(x, y) {
        if (x >= 0 && x < this.imageWidth && y >= 0 && y < this.imageHeight) {
            return true;
        }
        return false;
    }

    hasBoundary(seedPx, searchPx) {
        for (let x = seedPx.x - searchPx; x < seedPx.x + searchPx; x++) {
            let ymin = seedPx.y - searchPx;
            if (this.inBounds(x, ymin)) {
                if (this.binaryData.has(this.xy2idx(x, ymin))) {
                    return false;
                }
            }
            let ymax = seedPx.y + searchPx;
            if (this.inBounds(x, ymax)) {
                if (this.binaryData.has(this.xy2idx(x, ymax))) {
                    return false;
                }
            }
        }

        for (let y = seedPx.y - searchPx; y < seedPx.y + searchPx; y++) {
            let xmin = seedPx.x - searchPx;
            if (this.inBounds(xmin, y)) {
                if (this.binaryData.has(this.xy2idx(xmin, y))) {
                    return false;
                }
            }
            let xmax = seedPx.x + searchPx;
            if (this.inBounds(xmax, y)) {
                if (this.binaryData.has(this.xy2idx(xmax, y))) {
                    return false;
                }
            }
        }
        return true;
    }

    isEmpty(seedPx, searchPx) {
        for (let x = seedPx.x - searchPx; x < seedPx.x + searchPx; x++) {
            for (let y = seedPx.y - searchPx; y < seedPx.y + searchPx; y++) {
                if (this.inBounds(x, y)) {
                    if (this.binaryData.has(this.xy2idx(x, y))) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    getBBoxData(bbox) {
        let data = new Set();
        let w = bbox.xmax - bbox.xmin;
        for (let y = bbox.ymin; y < bbox.ymax; y++) {
            for (let x = bbox.xmin; x < bbox.xmax; x++) {
                if (this.inBounds(x, y)) {
                    let i = y * this.imageWidth + x;
                    if (this.binaryData.has(i)) {
                        let bi = (y - bbox.ymin) * w + (x - bbox.xmin);
                        data.add(bi);
                    }
                }
            }
        }
        return data;
    }

    squeezeTemplate(bbox) {
        let newBBox = {
            xmin: bbox.xmin,
            xmax: bbox.xmax,
            ymin: bbox.ymin,
            ymax: bbox.ymax
        };

        // find xmin
        let hit = false;
        while (!hit) {
            for (let y = bbox.ymin; y < bbox.ymax; y++) {
                if (this.inBounds(newBBox.xmin, y)) {
                    if (this.binaryData.has(this.xy2idx(newBBox.xmin, y))) {
                        hit = true;
                        break;
                    }
                }
            }
            if (!hit) {
                newBBox.xmin += 1;
            }
        }

        // find xmax
        hit = false;
        while (!hit) {
            for (let y = bbox.ymin; y < bbox.ymax; y++) {
                if (this.inBounds(newBBox.xmax, y)) {
                    if (this.binaryData.has(this.xy2idx(newBBox.xmax, y))) {
                        hit = true;
                        break;
                    }
                }
            }
            if (!hit) {
                newBBox.xmax -= 1;
            }
        }

        // find ymin
        hit = false;
        while (!hit) {
            for (let x = newBBox.xmin; x < newBBox.xmax; x++) {
                if (this.inBounds(x, newBBox.ymin)) {
                    if (this.binaryData.has(this.xy2idx(x, newBBox.ymin))) {
                        hit = true;
                        break;
                    }
                }
            }
            if (!hit) {
                newBBox.ymin += 1;
            }
        }

        // find ymax
        hit = false;
        while (!hit) {
            for (let x = newBBox.xmin; x < newBBox.xmax; x++) {
                if (this.inBounds(x, newBBox.ymax)) {
                    if (this.binaryData.has(this.xy2idx(x, newBBox.ymax))) {
                        hit = true;
                        break;
                    }
                }
            }
            if (!hit) {
                newBBox.ymax -= 1;
            }
        }
        return newBBox;
    }

    extractTemplate(autoDetector) {
        this.imageWidth = autoDetector.imageWidth;
        this.imageHeight = autoDetector.imageHeight;
        this.binaryData = autoDetector.binaryData;
        this._lastTemplate = null;
        let maxBound = 0;
        let foundTemplateBounds = false;
        let emptyStart = false;
        // todo: if started empty, then find nearest non-empty pixel
        for (let searchPx = 3; searchPx < this.imageWidth / 2; searchPx++) {
            if (this.isEmpty(this._seedPixel, searchPx)) {
                emptyStart = true;
                continue;
            }
            // todo: if started off empty then relocate _seedPixel to fist detection?
            if (this.hasBoundary(this._seedPixel, searchPx)) {
                foundTemplateBounds = true;
                maxBound = searchPx;
                break;
            }
        }
        if (foundTemplateBounds) {
            // todo: squeeze template
            let bbox = {
                xmin: this._seedPixel.x - maxBound,
                xmax: this._seedPixel.x + maxBound,
                ymin: this._seedPixel.y - maxBound,
                ymax: this._seedPixel.y + maxBound
            };
            let newBbox = this.squeezeTemplate(bbox);
            // add some breathing room
            const templBuffer = 2;
            newBbox.xmin -= templBuffer;
            newBbox.xmax += templBuffer;
            newBbox.ymin -= templBuffer;
            newBbox.ymax += templBuffer;

            let origBBox = {
                xmin: newBbox.xmin + 0.5,
                ymin: newBbox.ymin + 0.5,
                xmax: newBbox.xmax - 0.5,
                ymax: newBbox.ymax - 0.5,
            }
            let templ = {
                seedPixel: this._seedPixel,
                boundingBox: newBbox,
                originalBoundingBox: origBBox,
                data: this.getBBoxData(newBbox)
            };
            this._lastTemplate = templ;
            return templ;
        } else {
            console.log("template bounds not found!")
            return null;
        }
    }

    extractTemplateFromBBox(autoDetector, bbox) {
        this.imageWidth = autoDetector.imageWidth;
        this.imageHeight = autoDetector.imageHeight;
        this.binaryData = autoDetector.binaryData;
        this._seedPixel = {
            x: parseInt((bbox.xmin + bbox.xmax) / 2, 10),
            y: parseInt((bbox.ymin + bbox.ymax) / 2, 10),
        };
        // input bbox has floating pts, need to convert to int
        const intBbox = {
            xmin: parseInt(bbox.xmin, 10),
            ymin: parseInt(bbox.ymin, 10),
            xmax: parseInt(bbox.xmax + 1, 10),
            ymax: parseInt(bbox.ymax + 1, 10),
        };
        let templ = {
            seedPixel: this._seedPixel,
            boundingBox: intBbox,
            originalBoundingBox: bbox,
            data: this.getBBoxData(intBbox),
        };
        this._lastTemplate = templ;
        return templ;
    }

    getLastTemplate() {
        return this._lastTemplate;
    }

    matchTemplate(templ, autoDetector) {

        this.imageWidth = autoDetector.imageWidth;
        this.imageHeight = autoDetector.imageHeight;
        this.binaryData = autoDetector.binaryData;

        let templData = templ.data;
        if (templData == null) {
            return null;
        }
        let w = templ.boundingBox.xmax - templ.boundingBox.xmin;
        let h = templ.boundingBox.ymax - templ.boundingBox.ymin;
        if (w <= 0 || h <= 0) {
            console.log("matchTemplate: invalid bounding box for template", templ);
            return null;
        }

        let matches = [];
        for (let x = 0; x < this.imageWidth; x++) {
            for (let y = 0; y < this.imageHeight; y++) {
                let sampleBbox = {
                    xmin: x,
                    ymin: y,
                    xmax: x + w,
                    ymax: y + h
                };
                let sampleData = this.getBBoxData(sampleBbox);
                if (sampleData.size === 0 || sampleData.size < templData.size / 2) {
                    continue;
                }
                let score = this.getMatchScore(templData, sampleData, w, h);
                if (score > this._matchThreshold) {
                    matches.push([x + w / 2, y + h / 2, score, false]);
                }
            }
        }

        // filter matches - find the largest score in (w,h)
        let filteredMatches = [];
        let filteredSet = new Set();
        for (let m of matches) {
            if (m[3] === true) { // point was already considered
                continue;
            }
            let x = m[0];
            let y = m[1];
            let maxScore = m[2];
            m[3] = true;
            let xf = x;
            let yf = y;
            for (let mtest of matches) {
                let xt = mtest[0];
                let yt = mtest[1];
                let scoret = mtest[2];
                if (Math.abs(x - xt) < w / 2 && (Math.abs(y - yt) < h / 2)) {
                    if (scoret > maxScore) {
                        maxScore = scoret;
                        xf = xt;
                        yf = yt;
                    }
                    mtest[3] = true;
                }
            }
            // add to filtered list only if it's never been added
            let i = yf * this.imageWidth + xf;
            if (!filteredSet.has(i)) {
                filteredSet.add(i);
                filteredMatches.push([xf, yf, maxScore]);
            }
        }
        return filteredMatches;
    }
}
