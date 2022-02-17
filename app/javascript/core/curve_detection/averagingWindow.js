/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2022 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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

wpd.AveragingWindowAlgo = class {

    constructor() {
        this._xStep = 10;
        this._yStep = 10;
        this._wasRun = false;
    }

    getParamList(axes) {
        return {
            xStep: ['ΔX', 'Px', this._xStep],
            yStep: ['ΔY', 'Px', this._yStep]
        };
    }

    setParams(params) {
        this._xStep = parseFloat(params.xStep);
        this._yStep = parseFloat(params.yStep);
    }

    getParams() {
        return {
            xStep: this._xStep,
            yStep: this._yStep
        };
    }

    serialize() {
        return this._wasRun ? {
                algoType: "AveragingWindowAlgo",
                xStep: this._xStep,
                yStep: this._yStep
            } :
            null;
    }

    deserialize(obj) {
        this._xStep = obj.xStep;
        this._yStep = obj.yStep;
        this._wasRun = true;
    }

    run(autoDetector, dataSeries, axes) {
        this._wasRun = true;
        let algoCore = new wpd.AveragingWindowCore(
            autoDetector.binaryData, autoDetector.imageHeight, autoDetector.imageWidth, this._xStep,
            this._yStep, dataSeries);
        algoCore.run();
    }
};