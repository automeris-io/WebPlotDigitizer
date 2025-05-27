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

wpd._AutoDetectionDataCounter = 0;

wpd.AutoDetectionData = class {
    constructor() {
        // public
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.fgColor = [0, 0, 255];
        this.bgColor = [255, 255, 255];
        this.mask = new Set();
        this.binaryData = new Set();
        this.colorDetectionMode = 'fg';
        this.colorDistance = 120;
        this.algorithm = null;
        this.name = wpd._AutoDetectionDataCounter++;
    }

    serialize() {
        // if there's no algo, or if the algo was never run (no algoData),
        // then just return null as there's no reason to save this data.
        if (this.algorithm == null) {
            return null;
        }
        let algoData = this.algorithm.serialize();
        if (algoData == null) {
            return null;
        }

        let compressedMask = wpd.rle.encode(Array.from(this.mask.values()).sort((a, b) => {
            return (a - b);
        }));

        return {
            fgColor: this.fgColor,
            bgColor: this.bgColor,
            mask: compressedMask,
            colorDetectionMode: this.colorDetectionMode,
            colorDistance: this.colorDistance,
            algorithm: algoData,
            name: this.name,
            imageWidth: this.imageWidth,
            imageHeight: this.imageHeight
        };
    }

    deserialize(jsonObj) {
        this.fgColor = jsonObj.fgColor;
        this.bgColor = jsonObj.bgColor;
        this.imageWidth = jsonObj.imageWidth;
        this.imageHeight = jsonObj.imageHeight;
        if (jsonObj.mask != null) {
            let uncompressedMaskData = wpd.rle.decode(jsonObj.mask);
            this.mask = new Set();
            for (let i of uncompressedMaskData) {
                this.mask.add(i);
            }
        }
        this.colorDetectionMode = jsonObj.colorDetectionMode;
        this.colorDistance = jsonObj.colorDistance;

        if (jsonObj.algorithm != null) {
            let algoType = jsonObj.algorithm.algoType;
            if (algoType === "AveragingWindowAlgo") {
                this.algorithm = new wpd.AveragingWindowAlgo();
            } else if (algoType === "AveragingWindowWithStepSizeAlgo") {
                this.algorithm = new wpd.AveragingWindowWithStepSizeAlgo();
            } else if (algoType === "BarExtractionAlgo") {
                this.algorithm = new wpd.BarExtractionAlgo();
            } else if (algoType === "BlobDetectorAlgo") {
                this.algorithm = new wpd.BlobDetectorAlgo();
            } else if (algoType === "XStepWithInterpolationAlgo") {
                this.algorithm = new wpd.XStepWithInterpolationAlgo();
            } else if (algoType === "CustomIndependents") {
                this.algorithm = new wpd.CustomIndependents();
            } else if (algoType === "TemplateMatcherAlgo") {
                this.algorithm = new wpd.TemplateMatcherAlgo();
            }
            this.algorithm.deserialize(jsonObj.algorithm);
        }

        this.name = jsonObj.name;
    }

    generateBinaryDataFromMask(imageData) {
        this.binaryData = new Set();
        let refColor = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor;
        for (let imageIdx of this.mask) {
            let ir = imageData.data[imageIdx * 4];
            let ig = imageData.data[imageIdx * 4 + 1];
            let ib = imageData.data[imageIdx * 4 + 2];
            let ia = imageData.data[imageIdx * 4 + 3];
            if (ia === 0) {
                // for completely transparent part of the image, assume white
                ir = 255;
                ig = 255;
                ib = 255;
            }
            let dist = wpd.dist3d(ir, ig, ib, refColor[0], refColor[1], refColor[2]);
            if (this.colorDetectionMode === 'fg') {
                if (dist <= this.colorDistance) {
                    this.binaryData.add(imageIdx);
                }
            } else {
                if (dist >= this.colorDistance) {
                    this.binaryData.add(imageIdx);
                }
            }
        }
    }

    generateBinaryDataUsingFullImage(imageData) {
        this.binaryData = new Set();
        let refColor = this.colorDetectionMode === 'fg' ? this.fgColor : this.bgColor;
        for (let imageIdx = 0; imageIdx < imageData.data.length; imageIdx++) {
            let ir = imageData.data[imageIdx * 4];
            let ig = imageData.data[imageIdx * 4 + 1];
            let ib = imageData.data[imageIdx * 4 + 2];
            let ia = imageData.data[imageIdx * 4 + 3];
            if (ia === 0) {
                // for completely transparent part of the image, assume white
                ir = 255;
                ig = 255;
                ib = 255;
            }
            let dist = wpd.dist3d(ir, ig, ib, refColor[0], refColor[1], refColor[2]);
            if (this.colorDetectionMode === 'fg') {
                if (dist <= this.colorDistance) {
                    this.binaryData.add(imageIdx);
                }
            } else {
                if (dist >= this.colorDistance) {
                    this.binaryData.add(imageIdx);
                }
            }
        }
    }

    generateBinaryData(imageData) {
        if (this.mask == null || this.mask.size == 0) {
            this.generateBinaryDataUsingFullImage(imageData);
        } else {
            this.generateBinaryDataFromMask(imageData);
        }
    }

    setMask(mask) {
        this.mask = mask;
    }
};

wpd.GridDetectionData = class {
    constructor() {
        this.mask = {
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null,
            pixels: []
        };
        this.lineColor = [255, 255, 255];
        this.colorDistance = 10;
        this.gridData = null;
        this.gridMask = {
            xmin: null,
            xmax: null,
            ymin: null,
            ymax: null,
            pixels: new Set()
        };
        this.binaryData = new Set();
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.backupImageData = null;
        this.gridBackgroundMode = true;
    }

    generateBinaryData(imageData) {
        this.binaryData = new Set();
        this.imageWidth = imageData.width;
        this.imageHeight = imageData.height;

        // use the full image if no grid mask is present
        if (this.gridMask.pixels == null || this.gridMask.pixels.size === 0) {
            this.gridMask.pixels = new Set();

            for (let yi = 0; yi < this.imageHeight; yi++) {
                for (let xi = 0; xi < this.imageWidth; xi++) {
                    let img_index = yi * this.imageWidth + xi;
                    let ir = imageData.data[img_index * 4];
                    let ig = imageData.data[img_index * 4 + 1];
                    let ib = imageData.data[img_index * 4 + 2];
                    let ia = imageData.data[img_index * 4 + 3];

                    if (ia === 0) {
                        // assume white color when image is transparent
                        ir = 255;
                        ig = 255;
                        ib = 255;
                    }

                    let dist = wpd.dist3d(this.lineColor[0], this.lineColor[1], this.lineColor[2],
                        ir, ig, ib);

                    if (this.gridBackgroundMode) {
                        if (dist > this.colorDistance) {
                            this.binaryData.add(img_index);
                            this.gridMask.pixels.add(img_index);
                        }
                    } else {
                        if (dist < this.colorDistance) {
                            this.binaryData.add(img_index);
                            this.gridMask.pixels.add(img_index);
                        }
                    }
                }
            }
            this.gridMask.xmin = 0;
            this.gridMask.xmax = this.imageWidth;
            this.gridMask.ymin = 0;
            this.gridMask.ymax = this.imageHeight;
            return;
        }

        for (let img_index of this.gridMask.pixels) {
            let ir = imageData.data[img_index * 4];
            let ig = imageData.data[img_index * 4 + 1];
            let ib = imageData.data[img_index * 4 + 2];
            let ia = imageData.data[img_index * 4 + 3];

            let dist =
                wpd.dist3d(this.lineColor[0], this.lineColor[1], this.lineColor[2], ir, ig, ib);

            if (this.gridBackgroundMode) {
                if (dist > this.colorDistance) {
                    this.binaryData.add(img_index);
                }
            } else {
                if (dist < this.colorDistance) {
                    this.binaryData.add(img_index);
                }
            }
        }
    }
};
