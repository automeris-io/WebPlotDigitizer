/*
    WebPlotDigitizer - https://automeris.io/WebPlotDigitizer

    Copyright 2010-2018 Ankit Rohatgi <ankitrohatgi@hotmail.com>

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
        this._xStep = 5;
        this._yStep = 5;
    }

    getParamList(axes) {
        return [['ΔX', 'Px', 10], ['ΔY', 'Px', 10]];
    }

    setParam(index, val) {
        if(index === 0) {
            this._xStep = val;
        } else if(index === 1) {
            this._yStep = val;
        }
    }

    run(autoDetector, dataSeries, axes) {
        var algoCore = new wpd.AveragingWindowCore(autoDetector.binaryData,
                                                   autoDetector.imageHeight,
                                                   autoDetector.imageWidth,
                                                   this._xStep,
                                                   this._yStep,
                                                   dataSeries);
        algoCore.run();
    }   
};

